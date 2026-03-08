import asyncio
import datetime
from typing import Literal

from utils.logger import mylog
from utils.const import onlinePlayers
from games.manageGames import GameMan
from databases.redis import myred

async def updateGameTs(gameId: int, times: list[float], playerTurn: Literal["black", "white"]):
    whiteTime = 600 - float(times[0])
    blackTime = 600 - float(times[1])
    now = datetime.datetime.now().timestamp()
    mylog.debug("!!!!!!!!!! 1")
    mylog.debug(times)
    mylog.debug(now)
    timeSinceLastMove = now - float(times[2])
    if playerTurn == "white":
        whiteTime -= timeSinceLastMove
    else:
        blackTime -= timeSinceLastMove
    mylog.debug(f"2")
    whiteId = await myred.game.hget(myred.gameKey(gameId, "online"), "whiteId")
    blackId = await myred.game.hget(myred.gameKey(gameId, "online"), "blackId")
    mylog.debug(f"3")
    viewersIds = await myred.game.lrange(myred.gameViewersKeys(gameId), 0, -1)
    assert isinstance(whiteId, bytes) and isinstance(blackId, bytes) and isinstance(viewersIds, list)
    whiteId = whiteId.decode()
    blackId = blackId.decode()
    mylog.debug(f"4: {onlinePlayers}")
    await GameMan.sendTime(onlinePlayers[int(whiteId)], gameId, whiteTime, blackTime)
    await GameMan.sendTime(onlinePlayers[int(whiteId)], gameId, whiteTime, blackTime)
    mylog.debug(f"5")
    for viewerId in viewersIds:
        mylog.debug(f"6")
        assert isinstance(viewerId, bytes)
        viewerId = viewerId.decode()
        await GameMan.sendTime(onlinePlayers[int(viewerId)], gameId, whiteTime, blackTime)
    mylog.debug(f"!!!!!!!!! THE END")

async def processGameTs(gameId: int):
    mylog.debug("!!! inner loop")
    gameKey = myred.gameTsKey(gameId)
    gameTs = await myred.game.lrange(gameKey, 0, -1)
    playerTurn = "black" if len(gameTs) else "white"
    times = gameTs[-1].decode().split("-")
    mylog.debug("PRE")
    try:
        await updateGameTs(gameId, times, playerTurn)
    except Exception as e:
        mylog.error(f"updateGameTs raised error: {e}")
    mylog.debug(f"!!! Game TS: {times}")

async def taskGamesTs():
    while True:
        mylog.debug("!!! outer loop")
        games = await myred.getActiveOnlineGamesKeys(None)
        mylog.debug("got active online games keys")
        # TODO store every updateGameTs as a task and run it here before the fetching from redis loop
        # or maybe I should send the data inside the for loop and have every step inside the for loop be run inside and async task
        tasks = []
        for gameId in games: # for every active online game we calculate the time left and send it to the active players and their viewers
            tasks.append(processGameTs(int(gameId)))
        await asyncio.gather(*tasks)
        await asyncio.sleep(1)
