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

CREATE TABLE IF NOT EXISTS games (
  id SERIAL PRIMARY KEY,
  creation TIMESTAMP DEFAULT NOW(),
  game_mode TEXT CHECK (game_mode IN ('hotseat', 'online')),
  white_id INTEGER REFERENCES users(id) NOT NULL,
  black_id INTEGER REFERENCES users(id) NOT NULL,
  white_username TEXT NOT NULL,
  black_username TEXT NOT NULL,
  fens TEXT[] NOT NULL,
  game_moves TEXT[] NOT NULL,
  winner INTEGER REFERENCES users(id)
);

CREATE INDEX idx_games_winner on games(winner);

CREATE TABLE IF NOT EXISTS onlinegamesmessages (
  id SERIAL PRIMARY KEY,
  game_id INT REFERENCES games(id),
  username TEXT REFERENCES users(username),
  message TEXT NOT NULL
);
