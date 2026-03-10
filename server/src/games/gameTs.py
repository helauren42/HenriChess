import asyncio
import datetime
from typing import Literal

from databases.postgres import postgres
from utils.logger import mylog
from utils.const import onlinePlayers
from games.manageGames import GameMan
from databases.redis import myred

async def updateGameTs(gameId: int, times: list[str], playerTurn: Literal["black", "white"]):
    whiteTime = float(times[0])
    blackTime = float(times[1])
    now = datetime.datetime.now().timestamp()
    timeSinceLastMove = now - float(times[2])
    if playerTurn == "white":
        whiteTime -= timeSinceLastMove
        await myred.updateLastTs(gameId, 0, whiteTime, now)
    else:
        blackTime -= timeSinceLastMove
        await myred.updateLastTs(gameId, 1, blackTime, now)
    whiteId = await myred.game.hget(myred.gameKey(gameId, "online"), "whiteId")
    blackId = await myred.game.hget(myred.gameKey(gameId, "online"), "blackId")
    viewersIds = await myred.game.lrange(myred.gameViewersKeys(gameId), 0, -1)
    assert isinstance(whiteId, bytes) and isinstance(blackId, bytes) and isinstance(viewersIds, list)
    whiteId: int = int(whiteId.decode())
    blackId: int = int(blackId.decode())
    await GameMan.sendTime(onlinePlayers[whiteId], gameId, whiteTime, blackTime)
    await GameMan.sendTime(onlinePlayers[blackId], gameId, whiteTime, blackTime)
    for viewerId in viewersIds:
        assert isinstance(viewerId, bytes)
        viewerId = viewerId.decode()
        await GameMan.sendTime(onlinePlayers[int(viewerId)], gameId, whiteTime, blackTime)
    game = await myred.getCurrGameState(gameId, "online")
    assert game is not None
    if whiteTime <= 0:
        # mylog.debug(f"Resigning white")
        await GameMan.resignGame(onlinePlayers[whiteId], whiteId, "online", game, await postgres.fetchUsername(whiteId))
    if blackTime <= 0:
        await GameMan.resignGame(onlinePlayers[blackId], blackId, "online", game, await postgres.fetchUsername(blackId))

async def processGameTs(gameId: int):
    gameKey = myred.gameTsKey(gameId)
    gameTs = await myred.game.lrange(gameKey, 0, -1)
    gameMoves = await myred.game.lrange(myred.gameMoveKey(gameId), 0, -1)
    playerTurn = "white" if len(gameMoves) % 2 == 0 else "black"
    if len(gameTs) == 0:
        return
    b = gameTs[-1]
    times = b.decode().split("|")
    try:
        await updateGameTs(gameId, times, playerTurn)
    except Exception as e:
        # mylog.error(f"updateGameTs raised error: {e}")
        pass

async def taskGamesTs():
    while True:
        games = await myred.getActiveOnlineGamesKeys(None)
        # TODO store every updateGameTs as a task and run it here before the fetching from redis loop
        # or maybe I should send the data inside the for loop and have every step inside the for loop be run inside and async task
        tasks = []
        for gameId in games: # for every active online game we calculate the time left and send it to the active players and their viewers
            tasks.append(processGameTs(int(gameId)))
        await asyncio.gather(*tasks)
        await asyncio.sleep(0.03)
