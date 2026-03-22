import asyncio
from os import stat
from utils.const import ActivityLevel, onlinePlayers
from utils.logger import mylog
from databases.redis import myred
from databases.postgres import postgres

# playerData: [playerName, userId, status(ingame, active)]

class OnlinePlayers():
    @staticmethod
    async def sendMessage(userId: int, playersList: list[list]):
        mylog.debug(f"sendMessage called")
        await onlinePlayers[userId].send_json({"type": "onlinePlayers", "players": playersList})

    @staticmethod
    async def updateOnlinePlayersList(playersList: list[list]):
        mylog.debug(f"updateOnlinePlayersList")
        socializingPlayers = await myred.getSocializingPlayers()
        mylog.debug(f"!!!!!!! updating list: {socializingPlayers}")
        for userId in socializingPlayers:
            try:
                await OnlinePlayers.sendMessage(userId, playersList)
            except Exception as e:
                mylog.error(f"Failed to update player with online players list: {e}")

    @staticmethod
    def isSame(previous: list[list], now: list[list])-> bool:
        if len(previous) != len(now):
            return False
        for i in range(len(previous)):
            p = previous[i]
            n = now[i]
            if p[0] != n[0] or p[1] != n[1] or p[2] != n[2]:
                return False
        return True

    @staticmethod
    async def getPlayersList():
        playersList = []
        playerIds = list(onlinePlayers.keys())
        for playerId in playerIds:
            name = await postgres.fetchUsername(playerId)
            assert isinstance(name, str)
            playersList.append([name, playerId, ActivityLevel.active.value])
        return playersList

    @staticmethod
    async def updateOnlinePlayers():
        previous = []
        while True:
            playersList = await OnlinePlayers.getPlayersList()
            if not OnlinePlayers.isSame(previous, playersList):
                await OnlinePlayers.updateOnlinePlayersList(playersList)
                previous = playersList
            await asyncio.sleep(2)

