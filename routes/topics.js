"use strict";

/** Routes for companies. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
// const { ensureLoggedIn, checkIfAdmin } = require("../middleware/auth");
const Topic = require("../models/topic");

const topicNewSchema = require("../schemas/topicNew.json");
// const topicUpdateSchema = require("../schemas/topicUpdate.json");
const topicQuerySchema = require("../schemas/topicQuery.json");

const router = new express.Router();


/** POST / { topic } =>  { topic }
 *
 * topic should be { name }
 *
 * Returns {name }
 *
 * Admin authorization required
 */

router.post("/", async function (req, res, next) {
    console.log("topic post / runs");
    const validator = jsonschema.validate(
        req.body,
        topicNewSchema,
        {required: true}
    );
    if (!validator.valid) {
        const errs = validator.errors.map(e => e.stack);
        throw new BadRequestError(errs);
    }

    const topic = await Topic.create(req.body);
    return res.status(201).json({ topic });
});

/** GET /  =>
 *   { topics: [ { name }, ...] }
 *
 * Can filter on provided search filters:
 * - nameLike (will find case-insensitive, partial matches)
 *
 * Authorization required: none
 */

// router.get("/?:q?", async function (req, res, next) {
router.get("/", async function (req, res, next) {
    console.log("topic get / runs");
    let q = req.query;

    const validator = jsonschema.validate(
        q,
        topicQuerySchema,
        {required: true}
    );

    if (!validator.valid) {
        const errs = validator.errors.map(e => e.stack);
        throw new BadRequestError(errs);
    }

    let query = q || "";
    const topics = await Topic.findAll(query);
    return res.json({ topics });
});

/** GET /[name]  =>  { topic }
 *
 *  Topic is { name }
 *   where posts is [{ id, username, content, topicName }, ...]
 *
 * Authorization required: none
 */

router.get("/:name", async function (req, res, next) {
    console.log("topic get /:name runs");
    const topic = await Topic.get(req.params.name);
    return res.json({ topic });
});

/** PATCH /[name] { fld1 } => { topic }
 *
 * Patches topic data.
 *
 * fields are: { name }
 *
 * Returns { name }
 *
 * authorization required: logged in
 */

// router.patch("/:name", async function (req, res, next) {
//     const validator = jsonschema.validate(
//         req.body,
//         topicUpdateSchema,
//         {required:true}
//     );
//     if (!validator.valid) {
//         const errs = validator.errors.map(e => e.stack);
//         throw new BadRequestError(errs);
//     }

//     const topic = await Topic.update(req.params.name, req.body);
//     return res.json({ topic });
// });

/** DELETE /[name]  =>  { deleted: name }
 *
 * Admin authorization required
 */

router.delete("/:name", async function (req, res, next) {
    console.log("topic delete /:name runs");
    await Topic.remove(req.params.name);
    return res.json({ deleted: req.params.name });
});


module.exports = router;
