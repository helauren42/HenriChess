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
  creation TIMESTAMP DEFAULT NOW(),
  winner TEXT CHECK (winner IN ('b', 'w', 'd'))
);

CREATE TABLE IF NOT EXISTS hotseatgames (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL
) INHERITS(agames);

CREATE TABLE IF NOT EXISTS onlinegames (
  id SERIAL PRIMARY KEY,
  white_id INTEGER REFERENCES users(id) NOT NULL,
  black_id INTEGER REFERENCES users(id) NOT NULL,
  white_username TEXT NOT NULL,
  black_username TEXT NOT NULL,
  CHECK (white_id <> black_id)
) INHERITS(agames);

CREATE TABLE IF NOT EXISTS onlinegamesmessages (
  id SERIAL PRIMARY KEY,
  game_id INT REFERENCES onlinegames(id),
  username TEXT REFERENCES users(username),
  message TEXT NOT NULL
)

CREATE INDEX idx_hotseat_games_winner on hotseatgames(winner);
CREATE INDEX idx_online_games_winner on onlinegames(winner);

CREATE TABLE IF NOT EXISTS agamepositions (
  id SERIAL PRIMARY KEY,
  position_number INTEGER NOT NULL DEFAULT 0,
  fen TEXT NOT NULL DEFAULT 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
  -- capturedWhites 
);

CREATE TABLE IF NOT EXISTS hotseatgamepositions (
  id SERIAL PRIMARY KEY,
  game_id INTEGER NOT NULL REFERENCES hotseatgames(id) ON DELETE CASCADE,
  UNIQUE (position_number, game_id)
) INHERITS(agamepositions);

CREATE TABLE IF NOT EXISTS onlinegamepositions (
  id SERIAL PRIMARY KEY,
  game_id INTEGER NOT NULL REFERENCES onlinegames(id) ON DELETE CASCADE,
  UNIQUE (position_number, game_id)
) INHERITS(agamepositions);

CREATE INDEX idx_hotseat_game_positions_game_id on hotseatgamepositions(game_id);
CREATE INDEX idx_hotseat_game_positions_game_id_position_number on hotseatgamepositions(game_id, position_number);

CREATE INDEX idx_online_game_positions_game_id on onlinegamepositions(game_id);
CREATE INDEX idx_online_game_positions_game_id_position_number on onlinegamepositions(game_id, position_number);

CREATE TABLE IF NOT EXISTS agamemoves (
    id SERIAL PRIMARY KEY,
    move_number INTEGER NOT NULL CHECK(move_number >= 0),
    game_id INTEGER NOT NULL REFERENCES agames(id) ON DELETE CASCADE,
    uci TEXT NOT NULL,
    san TEXT NOT NULL, -- Standard Algebraic Notation
 
    UNIQUE (game_id, move_number)
);

CREATE TABLE IF NOT EXISTS hotseatgamemoves (
    id SERIAL PRIMARY KEY,
    game_id INTEGER NOT NULL REFERENCES hotseatgames(id) ON DELETE CASCADE
) INHERITS(agamemoves);

CREATE TABLE IF NOT EXISTS onlinegamemoves (
    id SERIAL PRIMARY KEY,
    game_id INTEGER NOT NULL REFERENCES onlinegames(id) ON DELETE CASCADE
) INHERITS(agamemoves);

CREATE INDEX idx_hotseat_game_moves_game_id on hotseatgamemoves(game_id);
CREATE INDEX idx_hotseat_game_moves_game_id_move_number ON hotseatgamemoves(game_id, move_number); -- composite index

CREATE INDEX idx_online_game_moves_game_id on onlinegamemoves(game_id);
CREATE INDEX idx_online_game_moves_game_id_move_number ON onlinegamemoves(game_id, move_number); -- composite index
