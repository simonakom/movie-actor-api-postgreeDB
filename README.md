# Movies and Actors Management API with PostgreSQL

## Welcome!

This project is a Node.js and Express REST API for managing actors and movies, with data persistence using PostgreSQL. 


This project is a Node.js and Express REST API designed to manage actors and movies. It follows a CRUD architecture and instead of storing data in memory, this project uses PostgreSQL, a relational database, for persistent data storage.
 
## Task

- Use already developed application - <a href="https://github.com/simonakom/movie-actor-api"> API for managing movies and actors</a> with local data storage, and replace in memory storage to use PostgreSQL local database.
- Test with Postman.

## Prerequisites

Before you begin, ensure you have the following installed on your machine:

- Node.js: [Download here](https://nodejs.org/).
- npm (Node Package Manager): Comes with Node.js installation.
- PostgreSQL and pgAdmin4 installed locally.
- Postman for testing API requests.

## Set up 

1. Clone project <a href="https://github.com/simonakom/movie-actor-api">API for managing movies and actors</a> to your local machine
2. Run project API for managing movies and actors (<a href="https://github.com/simonakom/movie-actor-api">guidelines</a>)
3. Install the pg package which allows interaction with PostgreSQL from Node.js - `npm install pg`
4. Set up the PostgreSQL database and tables:

    - Use pgAdmin4 to create new PostgreSQL database: movies_actors_management   
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

5. Configure Environment Variables:
- Ensure you have dotenv installed to load these environment variables: `npm install dotenv`
- Create a .env file in the root directory of the project to securely store your database connection details. 
- Add the following content to the .env file:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_postgres_username
DB_PASSWORD=your_postgres_password
DB_NAME=movies_actors_management
```
- Replace `your_postgres_username` and `your_postgres_password` with your actual PostgreSQL username and password.
- Ensure to require and configure dotenv at the top of the `app.js` file:
`require('dotenv').config();`

- Updated app.js with PostgreSQL integration
    - app.js already updated

## Run

- Run the API Server locally node app.js or npm run dev (nodemon).
- You should see a message: Server is running on http://localhost:3000
