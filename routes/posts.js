"use strict";

/** Routes for posts. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError, NotFoundError } = require("../expressError");
const { ensureLoggedIn, checkIfAdmin } = require("../middleware/auth");
const Post = require("../models/post");

const postNewSchema = require("../schemas/postNew.json");
const postUpdateSchema = require("../schemas/postUpdate.json");
const postQuerySchema = require("../schemas/postQuery.json");

const router = new express.Router();


/** POST / { post } =>  { post }
 *
 * post should be { username, topicName, content }
 *
 * Returns { id, username, topicName, date, content  }
 *
 * Authorization required: logged in
 */

router.post("/", ensureLoggedIn, async function (req, res, next) {
    // console.log("post post route");

    const validator = jsonschema.validate(
        req.body,
        postNewSchema,
        {required: true}
    );

  if (!validator.valid) {
    const errs = validator.errors.map(e => e.stack);
    throw new BadRequestError(errs);
  }

  const post = await Post.create(req.body);
  return res.status(201).json({ post });
});

/** GET /  =>
 *   { posts: [ { id, username, content, topicHandle }, ...] }
 *
 * Can filter on provided search filters:
 * - nameLike (will find case-insensitive, partial matches)
 *
 * Authorization required: none
 */

// router.get("/?:q?", async function (req, res, next) {
router.get("/", async function (req, res, next) {

    let q = req.query;
    const validator = jsonschema.validate(
        q,
        postQuerySchema,
        {required: true}
    );

    if (!validator.valid) {
        const errs = validator.errors.map(e => e.stack);
        throw new BadRequestError(errs);
    }

    let query = q || "";
    const posts = await Post.findAll(query);
    return res.json({ posts });
});

/** GET /[id]  =>  { post }
 *
 *  Post is {  id, username, content, topicHandle }
 *
 * Authorization required: none
 */

router.get("/:id", async function (req, res, next) {

    const id = Number(req.params.id);
    const post = await Post.findById(id);

    console.log("post", post);
    console.log("res.json", res.json({ post }));

    return res.json({ post });
});

/** PATCH /[id] { field1, field2, ... } => { post }
 *
 * Patches post data.
 *
 * fields can be: {  id, username, content, topicHandle }
 *
 * Returns { id, username, content, topicHandle }
 *
 * Authorization required: logged in
 */

router.patch("/:id", async function (req, res, next) {
  //console.log("run posts patch route");

    const validator = jsonschema.validate(
        req.body,
        postUpdateSchema
    );

    if (!validator.valid) {
        const errs = validator.errors.map(e => e.stack);
        throw new BadRequestError(errs);
    }

    const updatedPost = await Post.update(req.params.id, req.body);
    return res.json(updatedPost);
});

// /** DELETE /[id]  =>  { deleted: id }
//  *
//  * Authorization required: logged in
//  */

router.delete("/:id", async function (req, res, next) {

  await Post.remove(req.params.id);
  return res.json({ deleted: Number(req.params.id) });
});


module.exports = router;
