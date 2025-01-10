DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE users (
    username VARCHAR(50) PRIMARY KEY,
    password TEXT NOT NULL,
    firstName VARCHAR(50) NOT NULL,
    lastName VARCHAR(50) NOT NULL,
    email VARCHAR(50) NOT NULL,
    isAdmin BOOLEAN DEFAULT false
);

DROP TABLE IF EXISTS topics CASCADE;
CREATE TABLE topics (
    name VARCHAR(255) PRIMARY KEY,
    CONSTRAINT lower_name CHECK (name = LOWER(name))
);

DROP TABLE IF EXISTS posts CASCADE;
CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) REFERENCES users(username),
    topicName VARCHAR(255) REFERENCES topics(name),
    date DATE DEFAULT CURRENT_DATE,
    content TEXT NOT NULL
);
