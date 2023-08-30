"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for jobs. */

class Job {

  /** Create a job (from data), update db, return new job data.
   *
   * data should be { title, salary, equity, company_handle }
   *
   * Returns { title, salary, equity, companyHandle }
   *
   * Throws BadRequestError if job already in database.
   * */

    static async create({ title, salary, equity, companyHandle }) {

        const duplicateCheck = await db.query(`
            SELECT title
            FROM jobs
            WHERE title = $1
            AND company_handle = $2`,
            [title, companyHandle],
        );

        if (duplicateCheck.rows[0]){
            console.log("dupe check fail");
            throw new BadRequestError(`Duplicate job: ${title} at ${companyHandle}`);
        }

        const result = await db.query(`
                    INSERT INTO jobs (title,
                                        salary,
                                        equity,
                                        company_handle)
                    VALUES ($1, $2, $3, $4)
                    RETURNING title,
                        salary,
                        equity,
                        company_handle AS "companyHandle"`, [
                    title,
                    salary,
                    equity,
                    companyHandle,
                    ],
        );

        const job = result.rows[0];


        return job;
    }

    /** Finds all jobs or finds filtered list of jobs.
    * Takes query string from get request.
    * Returns [{ title, salary, equity, companyHandle }, ...]
    * */

    static async findAll(query) {

        let results = Job.findMatching(query)
        // console.log("results....", results);
        let [whereInsert, values] = results;

        const jobsRes = await db.query(`
            SELECT title,
                    salary,
                    equity,
                    company_handle
                    FROM jobs
            ${whereInsert}
            ORDER BY id`,
        values);
        return jobsRes.rows;
    }

    /** Assists findAll() in search by adding filtering capability.
    * Takes query object passed into findAll function and returns
    * an object with two keys (whereInsert, values), one holding a
    * WHERE string to be inserted into findAll's sql query; the other
    * holding, an array with the values, corresponding to the WHERE
    * string.* */

    static findMatching(query) {

        let queryStrings = []
        let values = [];
        let count = 1;
        let whereInsert;

        if (query){

            //minSalary
            if (query.minSalary){
                const minQueryString = `salary >= $${count}`;
                count += 1;
                queryStrings.push(minQueryString);
                values.push(query.minSalary);
            }

            //hasEquity
            if (query.hasEquity === true){
                const equityQueryString = `equity > 0`;
                queryStrings.push(equityQueryString);
            }

            //titleLike
            if (query.titleLike){
                const titleQueryString = `title ILIKE $${count}`;
                count += 1;
                queryStrings.push(titleQueryString);
                values.push(`%${ query.titleLike }%`);
            }

            whereInsert = queryStrings.join(" AND ");
        }

        if (whereInsert){
        whereInsert = "WHERE " + whereInsert;
        }

        return [whereInsert, values];
  }

    /** Given a job id, return data about job.
    *
    * Returns { id, title, salary, equity, company_handle }
    *
    * Throws NotFoundError if not found.
    **/

    static async findById(id){
        const results = await db.query(`
            SELECT id,
                title,
                salary,
                equity,
                company_handle AS "companyHandle"
            FROM jobs
            WHERE id = $1`, [id]);

        const job = results.rows[0];

        if (!job) throw new NotFoundError(`No job: ${id}`);

        return job;
    }

  /** Update job data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * TAKES: id (of job), data.
   * Data can include: {title, salary, equity, companyHandle}
   *
   * SetCols takes a formated request from the results of the sqlForUpdate
   * function that is called above it.
   *
   * TODO: still true? handle is added to the sql injection
   * protected variables by being given a number value and having its value
   * added to the end of the array of values also returned from sqlForUpdate.
   *
   * Returns {title, salary, equity, companyHandle}
   *
   * Throws NotFoundError if not found.
   */
ß
  static async update(id, data) {
    console.log("run update job");

    const { setCols, values } = sqlForPartialUpdate(
      data,
      { companyHandle: "company_Handle" }
    );

    const querySql = `
        UPDATE jobs
        SET ${setCols}
        WHERE id = ${id}
        RETURNING
            id,
            title,
            salary,
            equity,
            company_handle AS "companyHandle"`;

    const result = await db.query(querySql, [...values]);
    const updatedJob = result.rows[0];

    if (!updatedJob) throw new NotFoundError(`No updatedJob: ${id}`);

    //TODO: included object name by putting in braces to be consistent with
    // parts, but don't think it's right;
    return {updatedJob};
  }

  /** Delete given company from database; returns undefined.
   *
   * Throws NotFoundError if company not found.
   **/

  static async remove(handle) {
    const result = await db.query(`
        DELETE
        FROM companies
        WHERE handle = $1
        RETURNING handle`, [handle]);
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);
  }
}

module.exports = Job;
