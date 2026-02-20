from abc import ABC
import datetime
from random import randint
from typing import Optional
import redis.asyncio as redis
import asyncio
import json

from databases.game import Game, GameMap, GameMessage, GameMove, GameWatch, decodeGameMoves, gameMoveStr
from utils import game
from utils.const import MODES, Env, EXPIRY_TIME
from utils.game import getWinnerName
from utils.logger import mylog

# TODO
# Move over to GameCurr object and not send all moves and positions all the time back to the clients, but just the necessary change

class AMyRedis(ABC):
    def __init__(self):
        self.usersPool = redis.ConnectionPool(host=Env.REDIS_HOST, port=Env.REDIS_PORT, db=0, max_connections=20)
        self.users = redis.Redis(connection_pool=self.usersPool)

        self.gamePool = redis.ConnectionPool(host=Env.REDIS_HOST, port=Env.REDIS_PORT, db=1, max_connections=20)
        self.game = redis.Redis(connection_pool=self.gamePool)

    async def extendGameExpiry(self, gameId: int, mode: MODES, username: Optional[str]):
        assert not (mode == "hotseat" and username is None)
        await self.game.expire(self.gameKey(gameId, mode, username), EXPIRY_TIME)
        await self.game.expire(self.gameMoveKey(gameId), EXPIRY_TIME)
        await self.game.expire(self.gamePositionKey(gameId), EXPIRY_TIME)
        await self.game.expire(self.gameViewersKeys(gameId), EXPIRY_TIME)
        await self.game.expire(self.gameMessageKey(gameId), EXPIRY_TIME)
        time = int(datetime.datetime.now().timestamp()) + EXPIRY_TIME
        if mode == "online":
            await self.game.zadd("online_expiries", {str(gameId): str(time)})

    async def getActiveOnlineGamesKeys(self, username: bytes)->list[str]:
        keys = await self.game.zrevrange("online_expiries", 0, 15)
        mylog.debug(f"getActiveOnlineGamesKeys KEYS: {keys}")
        ret: list[str] = []
        for k in keys:
            key = k.decode()
            whiteUsername = await self.game.hget(self.gameKey(key, "online"), "whiteUsername")
            blackUsername = await self.game.hget(self.gameKey(key, "online"), "blackUsername")
            mylog.debug(f"whiteUsername: {whiteUsername}")
            mylog.debug(f"blackUsername: {blackUsername}")
            if username != whiteUsername and username != blackUsername:
                ret.append(key)
        mylog.debug(ret)
        return ret

    def gameKey(self, gameId: int, mode: MODES, username: Optional[str] = None):
        assert not (mode == "hotseat" and username is None)
        if mode == "online":
            return str("online") + ":" + str(gameId)
        return str(username) + ":" + str(gameId)

    def gameMoveKey(self, gameId: int):
        return f"game_move_{gameId}"

    def gamePositionKey(self, gameId: int):
        return f"game_position_{gameId}"

    def gameMessageKey(self, gameId: int):
        return f"game_message_{gameId}"

    def gameViewersKeys(self, gameId: int):
        return f"game_viewers_{gameId}"

    async def findActiveHotseatGameId(self, username: str)-> None | int:
        asyncKeys = self.game.scan_iter(f"{username}:*", 1)
        async for k in asyncKeys:
            await self.extendGameExpiry(k, "hotseat", username)
            return int(k[len(username)+1:])
        return None

    async def decodeBList(self, l: list[bytes]):
        mylog.debug("decodeList")
        r: list[str] = []
        for i in range(len(l)):
            r.append(l[i].decode())
        return r

    async def newGameId(self, mode: MODES, username: Optional[str])-> int:
        mylog.debug("1")
        cursor, keys = await self.game.scan()
        mylog.debug("2")
        newId = randint(21489392, 82489392)
        mylog.debug("3")
        while self.gameKey(newId, mode, username) in keys:
            mylog.debug("4")
            # TODO also check that it is not inside postgres as finished games get stored in there
            newId = randint(123774, 823678)
        return newId

    async def getPlayerTurn(self, gameId: int, full: bool):
        lastFen = await self.game.lindex(self.gamePositionKey(gameId), -1)
        assert lastFen is not None
        i = lastFen.find(" ")
        playerTurn = lastFen[i+1]
        if full == False:
            return playerTurn
        return "white" if playerTurn == "w" else "black"

    async def gameMapping(self, game: Game, mode: MODES, username: Optional[str])-> GameMap:
        await self.game.get(self.gameKey(game.id, mode, username))
        return {
            "whiteUsername": game.whiteUsername,
            "blackUsername": game.blackUsername,
            "whiteId": game.whiteId,
            "blackId": game.blackId,
            "whiteTime": game.whiteTime,
            "blackTime": game.blackTime,
            "winner": game.winner if game.winner is not None else -1
        }

    async def getGameMap(self, gameId: int, mode: MODES, username: Optional[str]) -> GameMap | None:
        try:
            data = await self.game.hgetall(self.gameKey(gameId, mode, username))
            if not data:
                return None
            return GameMap(
                winner=data[b'winner'].decode('utf-8'),
                whiteUsername=data[b'whiteUsername'].decode('utf-8'),
                blackUsername=data[b'blackUsername'].decode('utf-8'),
                whiteId=int(data[b'whiteId']),
                blackId=int(data[b'blackId']),
                whiteTime=int(data[b'whiteTime']),
                blackTime=int(data[b'blackTime'])
        )
        except Exception as e:
            mylog.error(f"error getting game map: {e}")
            return None

class MyRedis(AMyRedis):
    def __init__(self):
        super().__init__()
        self.lockAddGame = asyncio.Lock()

    async def removeGame(self, gameId: int, mode: MODES, username: Optional[str]):
        async with self.lockAddGame:
            gameKey = self.gameKey(gameId, mode, username)
            await self.game.delete(self.gameMoveKey(gameId), self.gamePositionKey(gameId), gameKey)

    async def addGame(self, game: Game, mode: MODES, username: Optional[str]):
        if mode == "hotseat" and username is None:
            raise ValueError("misuse of addGame function if mode is hotseat username must be defined")
        try:
            async with self.lockAddGame:
                name = self.gameKey(gameId=game.id, mode=mode, username=username)
                mylog.debug(f"got key: {name}")
                await self.game.hset(name, mapping=await self.gameMapping(game, mode, username))
                await self.extendGameExpiry(game.id, mode, username)
                mylog.debug(f"added game: {name}")
        except Exception as e:
            mylog.error(f"error adding game {e}")

    async def addGameMove(self, move: GameMove, gameId: int, mode: MODES, username: str):
        try:
            name = self.gameMoveKey(gameId)
            await self.game.rpush(name, gameMoveStr(move))
            await self.extendGameExpiry(gameId, mode, username)
        except Exception as e:
            mylog.error(f"error adding game move {e}")

    async def addGamePosition(self, fen: str, gameId: int, mode: MODES, username):
        mylog.debug(f"addGamePosition fen: {fen}")
        try:
            await self.game.rpush(self.gamePositionKey(gameId), fen)
            await self.extendGameExpiry(gameId, mode, username)
        except Exception as e:
            mylog.error(f"error adding game position {e}")

    async def addGameViewer(self, gameId: int, userId: int):
        try:
            viewers = await  self.getGameViewers(gameId)
            if userId in viewers:
                return
            await self.game.rpush(self.gameViewersKeys(gameId), str(userId))
        except Exception as e:
            mylog.debug(f"error adding game viewer {e}")

    async def removeGameViewer(self, gameId: int, userId: int):
        try:
            await self.game.lrem(self.gameViewersKeys(gameId), 0, str(userId))
        except Exception as e:
            mylog.debug(f"error removing game viewer {e}")

    async def getGameViewers(self, gameId: int)->list[int]:
        keys: list[bytes] = await self.game.lrange(self.gameViewersKeys(gameId), 0, -1)
        ret: list[int] = []
        for i in range(len(keys)):
            k = keys[i].decode()
            isinstance(k, str)
            ret.append(int(k))
        return ret

    async def getCurrGameState(self, gameId: int, mode: MODES, username: Optional[str] = None)-> Game | None:
        if mode == "hotseat" and username is None:
            raise ValueError("misuse of getCurrGameState() if mode is hotseat, the username must be defined")
        try:
            map: GameMap | None = await self.getGameMap(gameId, mode, username)
            mylog.debug(f"game map: {map}")
            if map is None:
                return None
            winner = map["winner"]
            if winner == "-1":
                winner = None
            mylog.debug(f"winner: {winner}")
            # TODO add game messages fetching
            messages = await self.getMessages(gameId)
            mylog.debug(f"!!! MESSAGES: {messages}")
            mylog.debug(f"!!! MESSAGES: {type(messages)}")
            return Game(gameId,
                await self.decodeBList(await self.game.lrange(self.gamePositionKey(gameId), 0, -1)),
                await decodeGameMoves(await self.game.lrange(self.gameMoveKey(gameId), 0, -1)),
                messages,
                winner,
                await getWinnerName(None, map),
                map["whiteUsername"],
                map["blackUsername"],
                map["whiteId"],
                map["blackId"],
                map["whiteTime"],
                map["blackTime"]
            )
        except Exception as e:
            mylog.error(f"failed to retrieve curr game state {e}")

    async def updateTime(self, gameId: int, mode: MODES, username: Optional[str], time: int):
        try:
            playerTurn = await self.getPlayerTurn(gameId, True)
            await self.game.hset(self.gameKey(gameId, mode, username), playerTurn+"Time", str(time))
        except Exception as e:
            mylog.debug(f"Redis failed to update time: {e}")

    async def getGameWatch(self, gameId: int):
        try:
            map: GameMap | None = await self.getGameMap(gameId, "online", None)
            if map is None:
                return None
            winner = map["winner"]
            if winner == "-1":
                winner = None
            fens = await self.decodeBList(await self.game.lrange(self.gamePositionKey(gameId), -1, -1))
            mylog.debug(f"get game watch fens: {fens}")
            return GameWatch(id=gameId,
                whiteUsername=map["whiteUsername"],
                blackUsername=map["blackUsername"],
                whiteId=map["whiteId"],
                blackId=map["blackId"],
                fen=fens[0],
            )
        except Exception as e:
            mylog.error(f"failed to retrieve curr game state {e}")

    async def userOnlineActiveGame(self, userId: str)-> int | None:
        allGames = self.game.scan_iter("online:*")
        async for k in allGames:
            assert isinstance(k, bytes)
            gameName = k.decode()
            whiteId = (await self.game.hget(gameName, "whiteId")).decode()
            blackId = (await self.game.hget(gameName, "blackId")).decode()
            gameId = gameName.split(":")[1]
            if userId == whiteId or userId == blackId:
                return int(gameId)
        return None

    async def getMessages(self, gameId: int)-> list[GameMessage]:
        l = await myred.game.lrange(self.gameMessageKey(gameId), 0, -1)
        messages: list[GameMessage] = []
        for elem in l:
            data: dict = json.loads(elem)
            username = data.get("username")
            message = data.get("message")
            assert isinstance(username, str) and isinstance(message, str)
            messages.append(GameMessage(username=username, message=message))
        return messages

    async def addMessage(self, username: str, message: str, gameId: int):
        mylog.debug(f"!!!!!!! addMessage: {username} -> {message}")
        item = json.dumps({"username": username, "message": message})
        await myred.game.rpush(self.gameMessageKey(gameId), item)

myred = MyRedis()
