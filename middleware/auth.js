"use strict";

/** Convenience middleware to handle common auth cases in routes. */

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const { UnauthorizedError } = require("../expressError");


/** Middleware: Authenticate user.
 *
 * If a token was provided, verify it, and, if valid, store the token payload
 * on res.locals (this will include the username and isAdmin field.)
 *
 * It's not an error if no token was provided or if the token is not valid.
 */

function authenticateJWT(req, res, next) {
  const authHeader = req.headers?.authorization;
  if (authHeader) {
    const token = authHeader.replace(/^[Bb]earer /, "").trim();

    try {
      res.locals.user = jwt.verify(token, SECRET_KEY);
    } catch (err) {
      /* ignore invalid tokens (but don't store user!) */
    }
  }
  return next();

}

/** Middleware to use when they must be logged in.
 *
 * If not, raises Unauthorized.
 */

function ensureLoggedIn(req, res, next) {
  console.log("ensureLoggedIn.......");

  if (res.locals.user?.username){
    return next();
  }
  else{
    throw new UnauthorizedError();
  }

}

/** Middleware to use when user must be admin
 * to take action.
 *
 * If not, raises Unauthorized.
 */

function checkIfAdmin(req, res, next) {
  console.log("checkIfAdmin........")
  if (res.locals.user?.isAdmin === true){
    return next();
  }
  else{
    throw new UnauthorizedError();
  }

}

function checkIfSelfOrAdmin(req, res, next) {
  console.log("check if self or admin.........");
  if (res.locals.user?.isAdmin === true || req.params.username === res.locals.user.username){
    return next();
  }
  else{
    throw new UnauthorizedError();
  }

}


module.exports = {
  authenticateJWT,
  ensureLoggedIn,
  checkIfAdmin,
  checkIfSelfOrAdmin
};
