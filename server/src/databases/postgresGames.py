from databases.apostgres import APostgres

class PostgresGames(APostgres):
    def __init__(self) -> None:
        super().__init__()

    async def newHotseatGame(self, userId: int):
        gameId = await self.execFetchone(query="select * from hotseatGames where id=%s", values=(userId,))
        if gameId:
            await self.execCommit(query="delete from hotseatgames where id=%s", values=(gameId,))
            # reinit hotseat game
            # await self.execCommit(query="update hotseatGames set hotseatGames=%s where id=%s", values=("somedefaultstringvalue", userId))
        await self.execCommit(query="insert into hotseatGames (userId) values(%s)", values=(userId,))

