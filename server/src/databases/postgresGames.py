from databases.apostgres import APostgres

class PostgresGames(APostgres):
    def __init__(self) -> None:
        super().__init__()

    async def newHotseatGame(self, userId: int):
        if await self.execFetchone(query="select * from hotseatGames where id=%s", values=(userId,)):
            await self.execCommit(query="update hotseatGame set hotseatGames=%s where id=%s", values=("somedefaultstringvalue", userId))
        else:
            await self.execCommit(query="insert into hotseatGames (userId) values(%s)", values=(userId,))

