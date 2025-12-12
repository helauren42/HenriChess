from databases.postgresUser import PostgresUser

class Postgres(PostgresUser):
    def __init__(self) -> None:
        super().__init__()

postgres = Postgres()
