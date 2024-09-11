require('dotenv').config();
const express = require('express'); //imports the express module - used to build web servers and APIs quickly and easily 

const { Pool } = require('pg'); // imports the Pool class from the pg (node-postgres) library, which is a client for interacting with PostgreSQL databases.

const app = express(); //initialize an Express application by calling express()
const port = 3000; // setting the Port

app.use(express.json()); //adds middleware (function) to the Express application, enabling it to parse incoming requests with JSON payloads.
// middleware is a function that processes requests before they reach the route handler. Middleware can be used for things like parsing data, logging, error handling, etc.
// without this, the server wouldn’t be able to automatically parse and understand application/json requests.


// Initialize a PostgreSQL pool
const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });


// Utility function checksif given date is in the future (birth dates in the future should not be allowed.)
const isFutureDate = (date) => {
    return new Date(date) > new Date();
};

// Utility function to find an actor in actors array by their ID. It’s used to find actors when associating them with movies.
const findActorById = async (id) => {
    const result = await pool.query('SELECT * FROM actors WHERE id = $1', [id]);
    return result.rows[0];
};

//---------------------------------------Actors Routes--------------------------------------//

//--> Create a new actor
app.post('/actors', async (req, res) => {
    const { firstName, lastName, dateOfBirth } = req.body;

    // Check if date of birth is in the future
    if (isFutureDate(dateOfBirth)) {
        return res.status(400).json({ message: 'Date of birth cannot be in the future.' });
    }

    try {
        const result = await pool.query(
            'INSERT INTO actors (first_name, last_name, date_of_birth) VALUES ($1, $2, $3) RETURNING *',
            [firstName, lastName, dateOfBirth]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: 'Error creating actor', error: err.message });
    }
});

//--> Get all actors
app.get('/actors', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM actors');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: 'Error retrieving actors', error: err.message });
    }
});

//--> Get an actor by ID
app.get('/actors/:id', async (req, res) => {
    try {
        const actor = await findActorById(req.params.id);
        if (!actor) {
            return res.status(404).json({ message: 'Actor not found' });
        }
        res.json(actor);
    } catch (err) {
        res.status(500).json({ message: 'Error retrieving actor', error: err.message });
    }
});

//--> Update an actor by ID
app.put('/actors/:id', async (req, res) => {
    const { firstName, lastName, dateOfBirth } = req.body;

    if (isFutureDate(dateOfBirth)) {
        return res.status(400).json({ message: 'Date of birth cannot be in the future.' });
    }

    try {
        const actor = await findActorById(req.params.id);
        if (!actor) {
            return res.status(404).json({ message: 'Actor not found' });
        }

        const updatedActor = await pool.query(
            'UPDATE actors SET first_name = $1, last_name = $2, date_of_birth = $3 WHERE id = $4 RETURNING *',
            [firstName || actor.first_name, lastName || actor.last_name, dateOfBirth || actor.date_of_birth, req.params.id]
        );
        res.json(updatedActor.rows[0]);
    } catch (err) {
        res.status(500).json({ message: 'Error updating actor', error: err.message });
    }
});

//--> Delete an actor by ID
app.delete('/actors/:id', async (req, res) => {
    try {
        const result = await pool.query('DELETE FROM actors WHERE id = $1', [req.params.id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Actor not found' });
        }
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ message: 'Error deleting actor', error: err.message });
    }
});

//---------------------------------------Movies Routes--------------------------------------//

//--> Create a new movie (actorId must be provided)
app.post('/movies', async (req, res) => {
    const { title, creationDate, actorId } = req.body;

    if (!actorId) {
        return res.status(400).json({ message: 'Actor ID must be supplied.' });
    }

    try {
        const actor = await findActorById(actorId);
        if (!actor) {
            return res.status(404).json({ message: 'Actor not found' });
        }

        const result = await pool.query(
            'INSERT INTO movies (title, creation_date, actor_id) VALUES ($1, $2, $3) RETURNING *',
            [title, creationDate, actorId]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: 'Error creating movie', error: err.message });
    }
});

//--> Get all movies
app.get('/movies', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM movies');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: 'Error retrieving movies', error: err.message });
    }
});

//--> Get a movie by ID
app.get('/movies/:id', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM movies WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Movie not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: 'Error retrieving movie', error: err.message });
    }
});

//--> Update a movie by ID (actorId must be provided)
app.put('/movies/:id', async (req, res) => {
    const { title, creationDate, actorId } = req.body;

    try {
        const movieResult = await pool.query('SELECT * FROM movies WHERE id = $1', [req.params.id]);
        if (movieResult.rows.length === 0) {
            return res.status(404).json({ message: 'Movie not found' });
        }

        const movie = movieResult.rows[0];

        let actor = null;
        if (actorId) {
            actor = await findActorById(actorId);
            if (!actor) {
                return res.status(404).json({ message: 'Actor not found' });
            }
        }

        const updatedMovie = await pool.query(
            'UPDATE movies SET title = $1, creation_date = $2, actor_id = $3 WHERE id = $4 RETURNING *',
            [title || movie.title, creationDate || movie.creation_date, actorId || movie.actor_id, req.params.id]
        );
        res.json(updatedMovie.rows[0]);
    } catch (err) {
        res.status(500).json({ message: 'Error updating movie', error: err.message });
    }
});

//--> Delete a movie by ID
app.delete('/movies/:id', async (req, res) => {
    try {
        const result = await pool.query('DELETE FROM movies WHERE id = $1', [req.params.id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Movie not found' });
        }
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ message: 'Error deleting movie', error: err.message });
    }
});

//------------------------------------------Server-----------------------------------------//

//starts the server and makes it listen for incoming HTTP requests on the port defined earlier -> 3000
app.listen(port, () => {
    console.log(`Movie and Actor API listening at http://localhost:${port}`);
});

