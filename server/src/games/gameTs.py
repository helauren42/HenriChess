import asyncio

from utils.logger import mylog
from games.manageGames import GameMan
from databases.redis import myred

async def taskGamesTs():
    while True:
        mylog.debug("!!! outer loop")
        games = await myred.getActiveOnlineGamesKeys(None)
        mylog.debug("got active online games keys")
        for gameId in games: # for every active online game we calculate the time left and send it to the active players and their viewers
            mylog.debug("!!! inner loop")
            gameKey = myred.gameTsKey(int(gameId))
            mylog.debug(f"!!!!!! gameKey: {gameKey}")
            await myred.game.connection_pool.disconnect()  # kills all conns
# then proceed with the for loop — forces fresh connections each ~2s cycle
            gameTs = await myred.game.lrange(gameKey, 0, -1)
            playerTurn = "black" if len(gameTs) else "white"
            times = gameTs[-1].decode().split("-")
            whiteTime = float(times[0])
            mylog.debug(f"!!! Game TS: {times}")
        await asyncio.sleep(8)
