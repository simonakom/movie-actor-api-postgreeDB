CREATE TABLE actors (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    date_of_birth DATE
);

CREATE TABLE movies (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    creation_date DATE,
    actor_id INT REFERENCES actors(id)
);

SELECT * FROM actors
SELECT * FROM movies