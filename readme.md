<div align="center">
  <h1 align="center">
    Jobly Backend
  </h1>
</div>

This is the Express backend for Jobly.

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

* GET/POST: /companies

* GET/PATCH/DELETE: /companies:handle

* GET/POST: /users

* GET/PATCH/DELETE: /users/:username

