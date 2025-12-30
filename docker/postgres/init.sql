CREATE TABLE IF NOT EXISTS users (
	id SERIAL PRIMARY KEY,
	username TEXT UNIQUE NOT NULL,
	email TEXT UNIQUE NOT NULL,
	password BYTEA NOT NULL,
	creation DATE DEFAULT CURRENT_DATE NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
	session_token BYTEA UNIQUE NOT NULL,
	device_token TEXT UNIQUE NOT NULL
  -- may_be make UUID
);

CREATE INDEX idx_sessions_device_token ON sessions(device_token);

CREATE TABLE IF NOT EXISTS agames (
  id SERIAL PRIMARY KEY,
  winner TEXT CHECK (winner IN ('black', 'white', 'draw')) DEFAULT NULL,
  creation TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hotseatgames (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE NOT NULL
) INHERITS(agames);

CREATE TABLE IF NOT EXISTS onlinegames (
  id SERIAL PRIMARY KEY,
  white_id INTEGER REFERENCES users(id) NOT NULL,
  black_id INTEGER REFERENCES users(id) NOT NULL,
  CHECK (white_id <> black_id)
) INHERITS(agames);

CREATE TABLE IF NOT EXISTS agamepositions (
  id SERIAL PRIMARY KEY,
  position_number INTEGER NOT NULL,
  fen TEXT NOT NULL DEFAULT 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
);

CREATE TABLE IF NOT EXISTS hotseatgamepositions (
  id SERIAL PRIMARY KEY,
  game_id INTEGER UNIQUE NOT NULL REFERENCES hotseatgames(id) ON DELETE CASCADE
) INHERITS(agamepositions);

CREATE INDEX idx_hotseat_game_positions_game_id on hotseatgamepositions(game_id);
CREATE INDEX idx_hotseat_game_positions_game_id_position_number on hotseatgamepositions(game_id, position_number);

CREATE TABLE IF NOT EXISTS onlinegamepositions (
  id SERIAL PRIMARY KEY,
  game_id INTEGER UNIQUE NOT NULL REFERENCES onlinegames(id) ON DELETE CASCADE
) INHERITS(agamepositions);

CREATE INDEX idx_online_game_positions_game_id on onlinegamepositions(game_id);
CREATE INDEX idx_online_game_positions_game_id_position_number on onlinegamepositions(game_id, position_number);

CREATE TABLE IF NOT EXISTS gamemoves (
    id SERIAL PRIMARY KEY,
    move_number INTEGER NOT NULL CHECK(move_number > 0),
    game_id INTEGER NOT NULL REFERENCES agames(id) ON DELETE CASCADE,
    move_from TEXT NOT NULL,
    move_to TEXT NOT NULL,
    piece TEXT NOT NULL,
    captured_piece TEXT DEFAULT NULL,
    promotion_to TEXT DEFAULT NULL,
    san TEXT NOT NULL, -- Standard Algebraic Notation
 
    UNIQUE (game_id, move_number)
);

CREATE INDEX idx_game_moves_game_id on gamemoves(game_id);
CREATE INDEX idx_game_moves_game_id_move_number ON gamemoves(game_id, move_number); -- composite index
