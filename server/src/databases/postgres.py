from databases.postgresGames import PostgresGames
from databases.postgresUser import PostgresUser

class Postgres(PostgresUser, PostgresGames):
    def __init__(self) -> None:
        super().__init__()

postgres = Postgres()
