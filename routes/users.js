"use strict";

/** Routes for users. */

const jsonschema = require("jsonschema");

const express = require("express");
// const { ensureLoggedIn, checkIfAdmin, checkIfSelfOrAdmin } = require("../middleware/auth");
const { BadRequestError } = require("../expressError");
const User = require("../models/user");
const { createToken } = require("../helpers/tokens");
const userNewSchema = require("../schemas/userNew.json");
const userUpdateSchema = require("../schemas/userUpdate.json");

const router = express.Router();


/** POST / { user }  => { user, token }
 *
 * Adds a new user. This is not the registration endpoint --- instead, this is
 * only for admin users to add new users. The new user being added can be an
 * admin.
 *
 * This returns the newly created user and an authentication token for them:
 *  {user: { username, firstName, lastName, email, isAdmin }, token }
 *
 * Admin authorization required
 **/

router.post("/", async function (req, res, next) {
  //console.log("create user........")
  const validator = jsonschema.validate(
      req.body,
      userNewSchema,
      { required: true },
  );

  if (!validator.valid) {
    const errs = validator.errors.map(e => e.stack);
    throw new BadRequestError(errs);
  }

  const user = await User.register(req.body);
  const token = createToken(user);
  return res.status(201).json({ user, token });
});


/** GET / => { users: [ {username, firstName, lastName, email }, ... ] }
 *
 * Returns list of all users.
 *
 * Admin authorization required
 **/

router.get("/", async function (req, res, next) {
  const users = await User.findAll();
  return res.json({ users });
});


/** GET /[username] => { user }
 *
 * Returns { username, firstName, lastName, isAdmin }
 *
 * Self or admin authorization required
 **/

router.get("/:username", async function (req, res, next) {
  const user = await User.get(req.params.username);
  return res.json({ user });
});


/** PATCH /[username] { user } => { user }
 *
 * Data can include:
 *   { firstName, lastName, password, email }
 *
 * Returns { username, firstName, lastName, email, isAdmin }
 *
 * Self or admin authorization required
 **/

router.patch("/:username", async function (req, res, next) {
  const validator = jsonschema.validate(
      req.body,
      userUpdateSchema,
      { required: true },
  );
  if (!validator.valid) {
    const errs = validator.errors.map(e => e.stack);
    throw new BadRequestError(errs);
  }

  const user = await User.update(req.params.username, req.body);
  return res.json({ user });
});


/** DELETE /[username]  =>  { deleted: username }
 *
 * Self or admin authorization required
 **/

router.delete("/:username", async function (req, res, next) {
  await User.remove(req.params.username);
  return res.json({ deleted: req.params.username });
});


module.exports = router;
