from databases.apostgres.postgresGames import PostgresGames

class Postgres(PostgresGames):
    def __init__(self) -> None:
        super().__init__()

postgres = Postgres()
