"use strict";

/** Routes for jobs. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureLoggedIn, checkIfAdmin } = require("../middleware/auth");
const Job = require("../models/job");

const jobNewSchema = require("../schemas/jobNew.json");
// const jobUpdateSchema = require("../schemas/jobUpdate.json");
const jobQuerySchema = require("../schemas/jobQuery.json");

const router = new express.Router();


/** POST / { job } =>  { job }
 *
 * job should be { title, salary, equity, companyHandle }
 *
 * Returns { id, title, salary, equity, companyHandle }
 *
 * Admin authorization required
 */

router.post("/", ensureLoggedIn, checkIfAdmin, async function (req, res, next) {
    console.log("job post route");

    const validator = jsonschema.validate(
    req.body,
    jobNewSchema,
    {required: true}
  );

  if (!validator.valid) {
    const errs = validator.errors.map(e => e.stack);
    throw new BadRequestError(errs);
  }

  const job = await Job.create(req.body);
  return res.status(201).json({ job });
});

/** GET /  =>
 *   { jobs: [ { id, title, salary, equity, companyHandle }, ...] }
 *
 * Can filter on provided search filters:
 * - minSalary
 * - hasEquity
 * - nameLike (will find case-insensitive, partial matches)
 *
 * Authorization required: none
 */

// router.get("/?:q?", async function (req, res, next) {
router.get("/", async function (req, res, next) {

    let q = req.query;

    if (req.query.minSalary !== undefined){
        q.minSalary = Number(q.minSalary);
    }

    if (req.query.hasEquity !== undefined){
        console.log("req.query", req.query.hasEquity);
        console.log("type", typeof(req.query.hasEquity));
        if (req.query.hasEquity === "true"){
            q.hasEquity = true;
        }
        else{
            q.hasEquity = undefined;
        }
    }

  const validator = jsonschema.validate(
    q,
    jobQuerySchema,
    {required: true}
  );

  if (!validator.valid) {
    const errs = validator.errors.map(e => e.stack);
    throw new BadRequestError(errs);
  }

  let query = q || "";
  const jobs = await Job.findAll(query);
  return res.json({ jobs });
});

/** GET /[id]  =>  { job }
 *
 *  Job is { id, title, salary, equity, companyHandle }
 *
 * Authorization required: none
 */

// router.get("/:handle", async function (req, res, next) {
//   console.log("get handle");
//   const job = await Job.get(req.params.handle);
//   return res.json({ job });
// });

/** PATCH /[handle] { fld1, fld2, ... } => { company }
 *
 * Patches company data.
 *
 * fields can be: { name, description, numEmployees, logo_url }
 *
 * Returns { handle, name, description, numEmployees, logo_url }
 *
 * Admin authorization required
 */

// router.patch("/:handle", ensureLoggedIn, checkIfAdmin, async function (req, res, next) {
//   const validator = jsonschema.validate(
//     req.body,
//     companyUpdateSchema,
//     {required:true}
//   );
//   if (!validator.valid) {
//     const errs = validator.errors.map(e => e.stack);
//     throw new BadRequestError(errs);
//   }

//   const company = await Company.update(req.params.handle, req.body);
//   return res.json({ company });
// });

// /** DELETE /[handle]  =>  { deleted: handle }
//  *
//  * Admin authorization required
//  */

// router.delete("/:handle", ensureLoggedIn, checkIfAdmin, async function (req, res, next) {
//   await Company.remove(req.params.handle);
//   return res.json({ deleted: req.params.handle });
// });


module.exports = router;
