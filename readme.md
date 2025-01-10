<div align="center">
  <h1 align="center">
    Factchecker Backend
  </h1>
</div>

This is the Express backend for Factchecker.

### Tech Stack:
* Javascript
* Express.js
* Node.js
* PostgreSQL
* Bcrypt
* JWT

### Instructions:

1. Clone this repository.
2. Install dependencies:

        npm install
4. Start server:

        node server.js

### Testing:

* Run all tests:

        jest -i

* Run all tests with coverage:

        jest -i --coverage

### Routes:

* POST: /auth/token

* POST: /auth/register

* GET/POST: /topics

* GET/PATCH/DELETE: /topics:handle

* GET/POST: /users

* GET/PATCH/DELETE: /users/:username

