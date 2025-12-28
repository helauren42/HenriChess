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
);

CREATE TABLE IF NOT EXISTS hotseatgames (
  userId INTEGER UNIQUE PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE NOT NULL
) INHERITS(agames);

CREATE TABLE IF NOT EXISTS onlinegames (
  whiteId INTEGER REFERENCES users(id) NOT NULL,
  blackId INTEGER REFERENCES users(id) NOT NULL
) INHERITS(agames);

CREATE TABLE IF NOT EXISTS gamemoves (
    id SERIAL PRIMARY KEY,
    gameId INTEGER NOT NULL REFERENCES agames(id) ON DELETE CASCADE,
    moveNumber INTEGER NOT NULL CHECK (moveNumber > 0),
    playerTurn TEXT CHECK (playerTurn IN ('black', 'white')) NOT NULL,
    moveFrom TEXT NOT NULL,
    moveTo TEXT NOT NULL,
    piece TEXT NOT NULL,
    capturedPiece TEXT DEFAULT NULL,
    promotionTo TEXT DEFAULT NULL,
    san TEXT NOT NULL, -- Standard Algebraic Notation
    fenAfter TEXT NOT NULL, -- FEN after this move
    moveTimestamp TIMESTAMP DEFAULT NOW(),
 
    UNIQUE (gameId, moveNumber)
);

CREATE INDEX idxGameMovesGameId on gamemoves(gameId);
CREATE INDEX idxGameMovesGameIdMoveNumber ON gamemoves(gameId, moveNumber); -- composite index
