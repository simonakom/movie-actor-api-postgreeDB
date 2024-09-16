//----------------------------------1.Environment Configuration---------------------------------//

require('dotenv').config(); //Loads environment variables from .env file into process.env. - process.env is a global object in Node.js that provides access to environment variables. 

//----------------------------------2.Module Imports-------------------------------------------//

const express = require('express'); //Imports the express module - used to build web servers and APIs quickly and easily.
const { Pool } = require('pg'); //Named import type. Imports Pool object from the pg module/library, which is a PostgreSQL client for Node.js. It allows connecting to a PostgreSQL database using connection pooling.

//----------------------------------3.App Initialization--------------------------------------//

const app = express(); //Initialize an Express application by calling express(). This instance will handle incoming requests and define routes.
const port = 3000; //Setting the port, which the app will listen on for incoming HTTP requests.

//----------------------------------4.Middleware Setup----------------------------------------//

app.use(express.json()); //Receives data in json. Adds middleware (function) to the Express application, enabling it to parse incoming requests with JSON payloads.
//Middleware is a function that processes requests before they reach the route handler. Middleware can be used for things like parsing data, logging, error handling, etc.
//Without this, the server wouldn’t be able to automatically parse and understand application/json requests.

//----------------------------------5.PostgreSQL Pool Initialization---------------------------//

const pool = new Pool({ //Creates a new PostgreSQL connection pool using the pg library. The configuration values (host, port...) are pulled from environment variables via process.env.
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

//--------------------------------------6.Utility Functions------------------------------------//

//Utility function checks if given date is in the future (birth dates in the future should not be allowed).
const isFutureDate = (date) => {
    return new Date(date) > new Date();
};
//Utility function to find an actor in actors array by their ID. It’s used to find actors when associating them with movies.
const findActorById = async (id) => {
    const result = await pool.query('SELECT * FROM actors WHERE id = $1', [id]);
    return result.rows[0];
};

//---------------------------------------7.Actors Routes--------------------------------------//

//--> Create a new actor
app.post('/actors', async (req, res) => { //Defines a route for handling POST requests to /actors and uses an asynchronous function to handle the request.
    const { firstName, lastName, dateOfBirth } = req.body; //Destructures the req.body object to extract firstName, lastName, and dateOfBirth. These values are expected to be sent in the body of the POST request as JSON.

    //Validate that firstName, lastName, and dateOfBirth are provided.
    if (!firstName || !lastName || !dateOfBirth) {
        return res.status(400).json({ message: 'First name, last name, and date of birth are required.' });
    }

    //Checks if the dateOfBirth is in the future using the isFutureDate utility function.
    if (isFutureDate(dateOfBirth)) { //If yes, server responds with a 400 Bad Request status.
        return res.status(400).json({ message: 'Date of birth cannot be in the future.' });
    }

    try {
        const result = await pool.query( //Executes an INSERT SQL query using the pool.query method.
            'INSERT INTO actors (first_name, last_name, date_of_birth) VALUES ($1, $2, $3) RETURNING *', //This query adds a new record to the actors table with the values provided by the client.
            [firstName, lastName, dateOfBirth] //RETURNING *: This clause ensures that the query returns the newly inserted row, including the auto-generated id and any default values.
        );
        res.status(201).json(result.rows[0]); //If the query is successful, the server responds with a 201 Created status. - result.rows[0] contains the inserted row data.
    } catch (err) { //If an error occurs during the query execution, the catch block handles it.
        res.status(500).json({ message: 'Error creating actor', error: err.message }); //The server responds with a 500 Internal Server Error status code.
    }
});

//--> Get all actors
app.get('/actors', async (req, res) => { //This route handles incoming GET requests and executes the provided callback function.

    try {
        //The result object is what the pool.query method returns. This object contains: rows: An array where each element is an individual row (record) from the database result set., Other metadata about the query execution like rowCount, fields, etc.
        const result = await pool.query('SELECT * FROM actors'); //Executes a SELECT SQL query using the pool.query method. This query retrieves all rows from the actors table. The result is a promise that resolves to the query result.
        // console.log(result);  //console.log(result.rows); 
        res.json(result.rows); //If the query is successful, the server responds with a JSON representation of the retrieved rows. result.rows contains an array of actor objects from the database.
    } catch (err) { //If an error occurs during the query execution, the catch block handles it.
        res.status(500).json({ message: 'Error retrieving actors', error: err.message }); //The server responds with a 500 Internal Server Error status code and an error message.
    }
});

//--> Get an actor by ID
app.get('/actors/:id', async (req, res) => { //Defines a GET route at /actors/:id using Express. The :id part of the URL is a route parameter, which allows you to capture a specific actor ID from the request URL.

    try { //Handle potential errors during the operation.
        const actor = await findActorById(req.params.id); //Calls the findActorById function with the ID extracted from the request parameters (req.params.id). This function is expected to query the database and return the actor record with the specified ID.
        if (!actor) { //If the actor is null or undefined, it sends a 404 Not Found response with a JSON message.
            return res.status(404).json({ message: 'Actor not found' }); //The return statement ensures that no further code is executed if the actor is not found.
        }
        res.json(actor); //If the actor is found, it sends the actor’s details as a JSON response with a 200 OK status code.
    } catch (err) { //If an error occurs:
        res.status(500).json({ message: 'Error retrieving actor', error: err.message });//It responds with a 500 Internal Server Error status code and includes an error message in the JSON response.
    }
});

//--> Update an actor by ID
app.put('/actors/:id', async (req, res) => { //Defines a PUT route at /actors/:id using Express. The :id part of the URL is a route parameter that captures the actor's ID from the request URL.
    const { firstName, lastName, dateOfBirth } = req.body; //Destructures the req.body object to extract values. These values are expected to be provided in the request body as JSON.

    //Validate that none of the required fields are empty or undefined.
    if (!firstName || !firstName.trim()) {
        return res.status(400).json({ message: 'First name cannot be empty.' });
    }
    if (!lastName || !lastName.trim()) {
        return res.status(400).json({ message: 'Last name cannot be empty.' });
    }
    if (!dateOfBirth) {
        return res.status(400).json({ message: 'Date of birth cannot be empty.' });
    }

    if (isFutureDate(dateOfBirth)) { //Checks if the provided dateOfBirth is in the future using the isFutureDate utility function. 
        return res.status(400).json({ message: 'Date of birth cannot be in the future.' }); //If the date is in the future, it sends a 400 Bad Request response.
    }

    try { //Handle potential errors.
        const actor = await findActorById(req.params.id); //Calls findActorById with the ID extracted from the request parameters (req.params.id) to find the actor in the database.
        if (!actor) { //If the actor is not found:
            return res.status(404).json({ message: 'Actor not found' }); //It sends a 404 Not Found response.
        }

        const updatedActor = await pool.query( //Executes an UPDATE SQL query using pool.query. This query updates the first_name, last_name, and date_of_birth fields for the actor with the specified ID.
            'UPDATE actors SET first_name = $1, last_name = $2, date_of_birth = $3 WHERE id = $4 RETURNING *', //$1, $2, $3, $4: Placeholder values for the parameters in the query.
            [firstName || actor.first_name, lastName || actor.last_name, dateOfBirth || actor.date_of_birth, req.params.id] //The values to replace the placeholders. If firstName, lastName, or dateOfBirth are not provided in the request body, the current values from the database (actor.first_name, actor.last_name, actor.date_of_birth) are used instead.
        );
        res.json(updatedActor.rows[0]); //Responds with the updated actor’s details in JSON format if the update operation is successful.
    } catch (err) { //If an error occurs, it sends a 500 Internal Server Error response.
        res.status(500).json({ message: 'Error updating actor', error: err.message });
    }
});

//--> Delete an actor by ID
app.delete('/actors/:id', async (req, res) => { //Defines a DELETE route at /actors/:id using Express. The :id part of the URL is a route parameter that captures the actor's ID from the request URL.

    try { //Handle potential errors.
        const result = await pool.query('DELETE FROM actors WHERE id = $1', [req.params.id]); //Executes a DELETE SQL query using pool.query. This query removes the actor with the specified ID from the actors table. The $1 placeholder is replaced by req.params.id, the ID captured from the request URL. The await keyword waits for the query to complete and returns the result.
        if (result.rowCount === 0) { //Checks the result.rowCount property, which indicates the number of rows affected by the DELETE query.
            return res.status(404).json({ message: 'Actor not found' }); //If rowCount is 0, it means no rows were deleted (i.e., no actor with the given ID was found). In this case, it sends a 404 Not Found response with a JSON message indicating that the actor was not found. The return statement ensures that no further code is executed if the actor does not exist.
        }
        res.status(204).send(); //If the DELETE operation is successful and at least one row is deleted, it sends a 204 No Content response.
    } catch (err) { //If an error occurs, it sends a 500 Internal Server Error.
        res.status(500).json({ message: 'Error deleting actor', error: err.message });
    }
});

//---------------------------------------8.Movies Routes--------------------------------------//

//--> Create a new movie (actorId must be provided)
app.post('/movies', async (req, res) => { //Defines a POST route at /movies using Express. The async keyword indicates that the function will handle asynchronous operations and use await for managing promises.
    const { title, creationDate, actorId } = req.body; //Destructures the req.body object to extract title, creationDate, and actorId. These values are expected to be provided in the request body as JSON.

    // Validate that the title is not empty or only spaces
     if (!title || !title.trim()) {
        return res.status(400).json({ message: 'Title cannot be empty.' });
    }

    // Validate that the creationDate is not empty
    if (!creationDate) {
        return res.status(400).json({ message: 'Creation date cannot be empty.' });
    }

    if (!actorId) { //Checks if actorId is provided in the request body.
        return res.status(400).json({ message: 'Actor ID must be supplied.' }); //If actorId is missing, it sends a 400 Bad Request response.
    }

    try { //Handle potential errors.
        const actor = await findActorById(actorId); //Calls findActorById with the provided actorId to check if an actor with that ID exists in the database. The await keyword waits for the result of the findActorById function.
        if (!actor) { //If no actor is found (i.e., actor is null or undefined), it sends a 404 Not Found response.
            return res.status(404).json({ message: 'Actor not found' }); //The return statement ensures that no further code is executed if the actor does not exist.
        }

        const result = await pool.query(  //Executes an INSERT SQL query using pool.query to add a new movie to the movies table. The query inserts title, creationDate, and actorId into the table.
            'INSERT INTO movies (title, creation_date, actor_id) VALUES ($1, $2, $3) RETURNING *', //$1, $2, $3: Placeholder values for the parameters in the query.// RETURNING * clause in the query ensures that the newly created movie record is returned.
            [title, creationDate, actorId] //The values to replace the placeholders.
        );
        res.status(201).json(result.rows[0]); // Responds with a 201 Created status code and the newly created movie’s details in JSON format.
    } catch (err) { //If an error occurs, it sends a 500 Internal Server Error.
        res.status(500).json({ message: 'Error creating movie', error: err.message });
    }
});

//--> Get all movies
app.get('/movies', async (req, res) => { //Defines a GET route at /movies using Express. The async keyword indicates that the function will handle asynchronous operations and use await to manage promises.

    try { //Handle potential errors.
        const result = await pool.query('SELECT * FROM movies'); //Executes a SELECT SQL query using pool.query to retrieve all rows from the movies table. The await keyword waits for the query to complete and returns the result. This query fetches all columns and all rows from the movies table.
        res.json(result.rows); //Responds with the movies data in JSON format. result.rows contains an array of all the movie records retrieved from the database.
    } catch (err) { //Catches any errors that occur.
        res.status(500).json({ message: 'Error retrieving movies', error: err.message }); //If an error occurs, it sends a 500 Internal Server Error.
    }
});

//--> Get a movie by ID
app.get('/movies/:id', async (req, res) => { //Defines a GET route at /movies/:id using Express. The :id part of the URL is a route parameter that captures the movie's ID from the request URL.

    try { //Handle potential errors.
        const result = await pool.query('SELECT * FROM movies WHERE id = $1', [req.params.id]); //Executes a SELECT SQL query using pool.query to fetch the movie with the specified ID from the movies table. The query uses a parameterized query with $1 as a placeholder for the movie ID, which is replaced by req.params.id. The await keyword waits for the query to complete and returns the result.
        if (result.rows.length === 0) { //Checks the length of result.rows, which contains the rows returned by the query.
            return res.status(404).json({ message: 'Movie not found' }); //If result.rows.length is 0, it means no movie with the given ID was found. In this case, it sends a 404 Not Found response.
        }
        res.json(result.rows[0]); //If a movie is found, it sends the movie details as a JSON response. result.rows[0] contains the first (and only) row returned by the query, which represents the movie with the specified ID.
    } catch (err) { //If an error occurs, it sends a 500 Internal Server Error response.
        res.status(500).json({ message: 'Error retrieving movie', error: err.message });
    }
});

//--> Update a movie by ID (actorId must be provided)
app.put('/movies/:id', async (req, res) => { //Defines a PUT route at /movies/:id using Express. The :id part of the URL is a route parameter that captures the movie's ID from the request URL.
    const { title, creationDate, actorId } = req.body; //Destructures the req.body object to extract title, creationDate, and actorId. These values are expected to be provided in the request body as JSON.

    //Ensure all required fields are provided.
    if (!title || !creationDate || !actorId) {
        return res.status(400).json({ message: 'Title, creation date, and actor ID must be provided.' });
    }

    // Check if the movie exists
    try { //Handle potential errors.
        const movieResult = await pool.query('SELECT * FROM movies WHERE id = $1', [req.params.id]); //Executes a SELECT SQL query using pool.query to fetch the movie with the specified ID from the movies table. The query uses a parameterized query with $1 as a placeholder for the movie ID, which is replaced by req.params.id.
        if (movieResult.rows.length === 0) { //Checks the length of movieResult.rows, which contains the rows returned by the query. If movieResult.rows.length is 0, it means no movie with the given ID was found.
            return res.status(404).json({ message: 'Movie not found' }); //If no movie is found, it sends a 404 Not Found response.
        }

        // Verify if the provided actorId corresponds to an existing actor
        const actor = await findActorById(actorId); //The findActorById(actorId) function is called to check if an actor with the provided actorId exists in the database.
        if (!actor) { //If not:
            return res.status(404).json({ message: 'Actor not found' });
        }

         // Update the movie record
         const updatedMovie = await pool.query( //Executes an UPDATE SQL query using pool.query to update the movie record in the movies table.
            'UPDATE movies SET title = $1, creation_date = $2, actor_id = $3 WHERE id = $4 RETURNING *', //$1, $2, $3, $4: Placeholders for the parameters in the query.//The RETURNING * clause in the query ensures that the updated movie record is returned.
            [title.trim(), creationDate, actorId, req.params.id]
        );
         // Respond with the updated movie’s details
        res.json(updatedMovie.rows[0]); //Responds with the updated movie’s details in JSON format.
    } catch (err) { //If an error occurs, it sends a 500 Internal Server Error response
        res.status(500).json({ message: 'Error updating movie', error: err.message });
    }
});

//--> Delete a movie by ID
app.delete('/movies/:id', async (req, res) => { //Sets up an HTTP DELETE route at /movies/:id. The :id is a route parameter that captures the movie's ID from the request URL. The async keyword indicates that this is an asynchronous function, and await will be used inside for handling asynchronous operations.

    try { //Handle potential errors during the deletion process.
        const result = await pool.query('DELETE FROM movies WHERE id = $1', [req.params.id]); //Executes a SQL DELETE query using pool.query. This query attempts to delete the movie from the movies table where the id matches the one provided in the URL (req.params.id). The $1 is a placeholder for the parameter, which is the movie ID, and the await keyword waits for the query to complete.
        if (result.rowCount === 0) { //result.rowCount contains the number of rows deleted by the query. If no rows were deleted (i.e., result.rowCount === 0), it means no movie with the specified ID was found in the database.
            return res.status(404).json({ message: 'Movie not found' }); //If no movie is found, it sends a 404 Not Found response.
        }
        res.status(204).send(); //If a movie was successfully deleted (i.e., rowCount > 0), the server responds with a 204 No Content status.
    } catch (err) { //If an error occurs (e.g., a database issue), the server sends a 500 Internal Server Error response.
        res.status(500).json({ message: 'Error deleting movie', error: err.message });
    }
});

//------------------------------------------9.Server-----------------------------------------//

//starts the server and makes it listen for incoming HTTP requests on the port defined earlier -> 3000
app.listen(port, () => {
    console.log(`Movie and Actor API listening at http://localhost:${port}`);
});

