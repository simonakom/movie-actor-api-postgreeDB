# CRUD API for movies and actors!

## Welcome!..

This application is built using Express and Node.js. It provides REST CRUD API for managing movies and actors. All data is stored in memory, meaning it will be lost when the application restarts.
 
## Task

- Create REST api with Express and Js For Movie and Actor management.
- The API should store data in memory.
- Actor can be involved in just a single movie.
- Actor can have FirstName, LastName and DateOfBirth.
-  Date of birth cannot be in future.
-  Movie can have title, creationDate and a single actor associated. Actor Id has to be supplied.
- When creating movie, if actor id is not supplied, 400 has to be returned. If Actor does not exist, 404 must be returned.
- Create CRUD for Movies and Actors.
- Test with postman

## Prerequisites

Before you begin, ensure you have the following installed on your machine:

- Node.js: [Download here](https://nodejs.org/)
- npm (Node Package Manager): Comes with Node.js installation

## Set up

- Clone this repository to your local machine
- Navigate to the project directory
- Initialize a new Node.js project by running `npm init` in your terminal. This will create a package.json file.
- Install Express by running `npm install express`
- Install nodemon to automatically restarts the server whenever it detects changes source code files `npm i nodemon -D`
- Make sure you have a `dev` script in `package.json` in order to run nodemon via `npm run dev`:

  ```bash
    "scripts": {
        "dev": "nodemon app.js",
        "test": "echo \"Error: no test specified\" && exit 1"
    },
  ```

## Run

- Run the API Server locally `node app.js` or `npm run dev` (nodemon).
- You should see a message: `Server is running on http://localhost:3000`







