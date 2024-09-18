# Movies and Actors Management API with PostgreSQL

## Welcome!

 This project is a Node.js and Express REST API designed to manage actors and movies. It uses PostgreSQL for persistent data storage instead of in-memory storage. This guide will walk you through setting up the project, configuring PostgreSQL, and running tests using Postman and Newman.


## Task

- Use already developed application - <a href="https://github.com/simonakom/movie-actor-api"> API for managing movies and actors</a> with local data storage, and replace in memory storage to use PostgreSQL local database.
- Test with Postman + Newman

## Prerequisites

Before you begin, ensure you have the following installed on your machine:

- Node.js: [Download here](https://nodejs.org/).
- npm (Node Package Manager): Comes with Node.js installation.
- PostgreSQL and pgAdmin4 installed locally.
- Postman for testing API requests: [Download here](https://www.postman.com/downloads/).

## Set up 

1. Clone this repository to your local machine.
2. Navigate to the project directory.
3. Run the following command to install all the required modules listed in the "package.json" file: `npm install`
4. Make sure "pg" package is installed which allows interaction with PostgreSQL from Node.js. If not, run `npm install pg`.
5. Set up the PostgreSQL database and tables:

    - Use pgAdmin4 to create new PostgreSQL database: `movies_actors_management`.   
    - Create 2 tables in database: 

````sql
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

````

6. Configure Environment Variables:

- Ensure you have "dotenv" installed to load these environment variables. If not, run `npm install dotenv`.
- Create a `.env` file in the root directory of the project to securely store your database connection details. 
- Add the following content to the `.env` file:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_postgres_username
DB_PASSWORD=your_postgres_password
DB_NAME=movies_actors_management
```
- Replace `your_postgres_username` and `your_postgres_password` with your actual PostgreSQL username and password.
- Ensure to require and configure ".env" at the top of the `app.js` file:
`require('dotenv').config();`.

7. In the `app.js` file, which is in this repository, you will find the updated code with integration to PostgreSQL.

## Run

- Run the API Server locally `node app.js` or `npm run dev` (nodemon).
- You should see a message: `Server is running on http://localhost:3000`.

## Testing

Test scenarios are available in `test.txt`, or you can run them using Postman.

### Importing Postman Collection

- From this repository download `movie-actor-api-postgreeDB.postman_collection.json` file to your local machine.
- In Postman, click on the "Import" button located at the top left and drop `movie-actor-api-postgreeDB.postman_collection.json` file.
- Postman will automatically add the collection, and you will see all predefined API requests.

### Running Tests with Newman

- Install Newman: `npm install newman -D`.
- Add a test script to package.json: `"test": "newman run movie-actor-api-postgreeDB.postman_collection.json"`
- Run the Postman Collection:
    - Start the API Server: Open one terminal window and run the server: -> `npm run dev`
    - Run the Tests: Open another terminal window and execute the test script: -> `npm run test`

