CREATE TABLE IF NOT EXISTS users (
	id SERIAL PRIMARY KEY,
	username TEXT UNIQUE NOT NULL,
	email TEXT UNIQUE NOT NULL,
	password BYTEA NOT NULL,
	creation DATE DEFAULT CURRENT_DATE NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  id SERIAL PRIMARY KEY,
  userId INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
	sessionToken BYTEA UNIQUE NOT NULL,
	deviceToken TEXT UNIQUE NOT NULL
  -- maybe make UUID
);

CREATE INDEX idxSessionsDeviceToken ON sessions(deviceToken);

CREATE TABLE IF NOT EXISTS agames (
  id SERIAL PRIMARY KEY,
  playerTurn TEXT CHECK (playerTurn IN ('black', 'white')) NOT NULL DEFAULT 'white',
  winner TEXT CHECK (winner IN ('black', 'white', 'draw')) DEFAULT NULL
  creation TIMESTAMP DEFAULT NOW();
);

CREATE TABLE IF NOT EXISTS hotseatgames (
  userId INTEGER UNIQUE PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE NOT NULL
) INHERITS(agames);

CREATE TABLE IF NOT EXISTS onlinegames (
  whiteId INTEGER REFERENCES users(id) NOT NULL,
  blackId INTEGER REFERENCES users(id) NOT NULL,
  CHECK (whiteId <> blackId)
) INHERITS(agames);

CREATE TABLE IF NOT EXISTS gamepositions (
  id SERIAL PRIMARY KEY,
  positionNumber INTEGER NOT NULL,
  gameId INTEGER NOT NULL REFERENCES agames(id) ON DELETE CASCADE,
  fen TEXT NOT NULL DEFAULT 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
);

CREATE INDEX idxGamePositionsGameId on gamepositions(gameId)
CREATE INDEX idxGamePositionsGameIdPositionNumber on gamepositions(gameId, positionNumber)

CREATE TABLE IF NOT EXISTS gamemoves (
    id SERIAL PRIMARY KEY,
    moveNumber INTEGER NOT NULL,
    gameId INTEGER NOT NULL REFERENCES agames(id) ON DELETE CASCADE,
    playerTurn TEXT CHECK (playerTurn IN ('black', 'white')) NOT NULL,
    moveFrom TEXT NOT NULL,
    moveTo TEXT NOT NULL,
    piece TEXT NOT NULL,
    capturedPiece TEXT DEFAULT NULL,
    promotionTo TEXT DEFAULT NULL,
    san TEXT NOT NULL, -- Standard Algebraic Notation
 
    UNIQUE (gameId, moveNumber)
);

ALTER SEQUENCE moveNumberSeq RESTART 2

CREATE INDEX idxGameMovesGameId on gamemoves(gameId);
CREATE INDEX idxGameMovesGameIdMoveNumber ON gamemoves(gameId, moveNumber); -- composite index
