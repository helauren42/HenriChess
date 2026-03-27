import asyncio
from fastapi.websockets import WebSocket, WebSocketDisconnect
from fastapi import APIRouter

from databases.game import GameWatch
from databases.postgres import postgres
from databases.redis import myred
from tasks.onlinePlayers import OnlinePlayers
from utils.api import getUserId
from utils.const import matchmakePool, onlinePlayers
from utils.logger import mylog
from games.manageGames import GameMan

wsRouter = APIRouter(prefix="/ws")

async def matchmakePoolAdd(ws: WebSocket, userId: int):
    matchmakePool.append(userId)
    mylog.info(f"matchmake pool user ids: {matchmakePool}")

async def matchmakePoolRemove(userId: int):
    if userId in matchmakePool:
        matchmakePool.remove(userId)
        mylog.info(f"matchmake pool user ids: {matchmakePool}")

async def findOpponent(userId: int)-> int:
    if len(matchmakePool) <= 1:
        return 0
    for playerId in matchmakePool:
        if playerId != userId:
            matchmakePool.remove(playerId)
            matchmakePool.remove(userId)
            return playerId
    return 0

@wsRouter.websocket("")
async def websocketEndpoint(ws: WebSocket):
    try:
        print("START")
        mylog.debug("!!!!! START")
        userId = await getUserId(ws.cookies)
        username = await postgres.fetchUsername(userId)
        assert username is not None
    except Exception as e:
        await asyncio.sleep(3)
        mylog.debug(f"refusing ws connection {e}")
        await ws.close(1008, reason="User not authentified")
        return
    try:
        await ws.accept()
        onlinePlayers[userId] = ws
        mylog.debug(f"accepted new ws connection")
        while True:
            msg:dict = await ws.receive_json()
            mylog.debug(f"ws msg: {msg}")
            messageType = msg.get("type")
            assert isinstance(messageType, str)
            match messageType:
                case "gameMessage":
                    gameId = msg["gameId"]
                    await myred.addMessage(username, msg["message"], gameId)
                    game = await GameMan.getGame(msg["gameId"], "online", username, userId)
                    if game:
                        await GameMan.updateGameOne(ws, userId, "online", game, gameId)
                        opponentId = await GameMan.opponentId(game, userId)
                        await GameMan.updateGameOne(onlinePlayers[opponentId], opponentId, "online", game, gameId)
                case "clientMove":
                    gameId = msg["gameId"]
                    gameData = await GameMan.getActiveGame(ws, username, msg["mode"], gameId)
                    assert gameData is not None
                    updatedGame = await GameMan.handleGameMove(ws, msg["mode"], msg["uciMove"], gameData, gameId, username) # update game object is returned if move was valid otherwise it returns None
                    if updatedGame:
                        await GameMan.updateGameAll(ws, userId, msg["mode"], updatedGame, gameId)
                case "startGameHotseat":
                    await GameMan.startGameHotseat(ws, userId, username)
                case "restartGameHotseat":
                    await GameMan.startGameHotseat(ws, userId, username, True)
                case "getGameUpdate":
                    mylog.debug(f"getGameUpdate username: {username}")
                    game = await GameMan.getGame(msg["gameId"], msg["mode"], username, userId)
                    if game:
                        await GameMan.updateGameOne(ws, userId, msg["mode"], game, game.id)
                    else:
                        await GameMan.sendGameExpired(ws, msg["gameId"])
                case "addViewer":
                    game = await myred.addGameViewer(msg["gameId"], userId)
                case "removeViewer":
                    game = await myred.removeGameViewer(msg["gameId"], userId)
                case "resignGame":
                    game = await myred.getCurrGameState(msg["gameId"], msg["mode"], username)
                    assert game is not None
                    if game is None:
                        continue
                    game = await GameMan.resignGame(ws, userId, msg["mode"], game, username)
                    mylog.debug(f"should be a resigned game: {game.winner}\n{game}")
                    # await GameMan.updateGameAll(ws, userId, msg["mode"], game, game.id)
                case "startMatchmaking":
                    await matchmakePoolAdd(ws, userId)
                    mylog.debug("startMatchmaking")
                    opponentId = await findOpponent(userId)
                    mylog.debug(f"found opponent? {opponentId}")
                    if opponentId:
                        await GameMan.startOnlineMatch(userId, username, opponentId)
                case "endMatchmaking":
                    await matchmakePoolRemove(userId)
                    mylog.debug("endMatchmaking")
                case "joinActiveOnlineGame":
                    gameId = await myred.userOnlineActiveGame(str(userId))
                    if gameId:
                        game = await GameMan.getGame(gameId, "online", username, userId)
                        if game:
                            await GameMan.updateGameOne(ws, userId, "online", game, game.id)
                # WATCH
                case "getActiveGames":
                    mylog.debug("getActiveGames")
                    games: list[GameWatch] = await GameMan.getActiveOnlineGames(username)
                    await ws.send_json({"type": "activeOnlineGames", "games": games})
                # SOCIAL
                case "onSocialPage":
                    await myred.onSocialPage(userId)
                    playersList = await OnlinePlayers.getPlayersList()
                    await OnlinePlayers.sendMessage(userId, playersList)
                case "sendChallenge":
                    opponentId = msg["opponentId"]
                    challengeId = await myred.addChallenge(userId, opponentId)
                    await onlinePlayers[opponentId].send_json({"type":"gameChallenge", "challenger": username, "challengeId": challengeId})
                case "acceptChallenge":
                    mylog.debug(f"received acceptChallenge: {msg}")
                    players = await myred.getChallenge(msg["challengeId"])
                    mylog.debug(f"!!!! PLAYERS: {players}")
                    if players is None:
                        continue
                    assert len(players) == 2
                    await GameMan.startOnlineMatch(players[0], None, players[1])
                case "declineChallenge":
                    mylog.debug(f"received acceptChallenge: {msg}")
                case _:
                    mylog.debug(f"Message type not handled")
    except WebSocketDisconnect as e:
        mylog.debug(f"websocket disconnected: {e}")
    except Exception as e:
        mylog.debug(f"websocket connection failed: {e}")
    finally:
        await matchmakePoolRemove(userId)
        await myred.offSocialPage(userId)
        if userId in onlinePlayers:
            onlinePlayers.pop(userId)

