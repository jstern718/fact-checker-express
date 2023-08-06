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

  static async create({ title, salary, equity, company_handle }) {
    const duplicateCheck = await db.query(`
        SELECT title, company_handle
        FROM jobs
        WHERE title = $1, company_handle = $2`, [title, company_handle]);

    if (duplicateCheck.rows[0])
      throw new BadRequestError(`Duplicate job: ${title} at ${company_handle}`);

    const result = await db.query(`
                INSERT INTO jobs (title,
                                       salary,
                                       equity,
                                       company_handle)
                VALUES ($1, $2, $3, $4)
                RETURNING
                    id,
                    title,
                    salary,
                    equity,
                    company_handle AS "companyHandle"`, [
      id,
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
        SELECT id,
                title,
                salary,
                equity,
                company_handle AS "companyTitle"
                FROM jobs
        ${whereInsert}
        ORDER BY name`,
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

      //equity
      if (query.equity){
        const equityString = `equity >= $${count}`;
        count += 1;
        queryStrings.push(equityString);
        values.push(query.equity);
      }

        // nameLike
        if (query.nameLike){
            const nameQueryString = `name ILIKE $${count}`;
            count += 1;
            queryStrings.push(nameQueryString);
            values.push(`%${ query.nameLike }%`);
        }
        whereInsert = queryStrings.join(" AND ");
    }

    if (whereInsert){
      whereInsert = "WHERE " + whereInsert;
    }
    // console.log("before return ..........", whereInsert, values);
    return [whereInsert, values];
  }

  /** Given a job id, return data about job.
   *
   * Returns { id, title, salary, equity, company_handle }
   *
   * Throws NotFoundError if not found.
   **/

  static async get(id){
    const jobRes = await db.query(`
        SELECT id,
               title,
               salary,
               equity,
               company_handle AS "companyHandle"
        FROM jobs
        WHERE handle = $1`, [id]);

    const job = jobRes.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);

    return job;
  }

  /** Update company data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {name, description, numEmployees, logoUrl}
   *
   * SetCols takes a formated request from the results of the sqlForUpdate
   * function that is called above it. handle is added to the sql injection
   * protected variables by being given a number value and having its value
   * added to the end of the array of values also returned from sqlForUpdate.
   *
   * Returns {handle, name, description, numEmployees, logoUrl}
   *
   * Throws NotFoundError if not found.
   */

  static async update(handle, data) {
    const { setCols, values } = sqlForPartialUpdate(
      data,
      {
        numEmployees: "num_employees",
        logoUrl: "logo_url",
      });
    const handleVarIdx = "$" + (values.length + 1);

    const querySql = `
        UPDATE companies
        SET ${setCols}
        WHERE handle = ${handleVarIdx}
        RETURNING
            handle,
            name,
            description,
            num_employees AS "numEmployees",
            logo_url AS "logoUrl"`;
    const result = await db.query(querySql, [...values, handle]);
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);

    return company;
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

module.exports = Company;
