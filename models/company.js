"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for companies. */

class Company {
  /** Create a company (from data), update db, return new company data.
   *
   * data should be { handle, name, description, numEmployees, logoUrl }
   *
   * Returns { handle, name, description, numEmployees, logoUrl }
   *
   * Throws BadRequestError if company already in database.
   * */

  static async create({ handle, name, description, numEmployees, logoUrl }) {
    const duplicateCheck = await db.query(`
        SELECT handle
        FROM companies
        WHERE handle = $1`, [handle]);

    if (duplicateCheck.rows[0])
      throw new BadRequestError(`Duplicate company: ${handle}`);

    const result = await db.query(`
                INSERT INTO companies (handle,
                                       name,
                                       description,
                                       num_employees,
                                       logo_url)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING
                    handle,
                    name,
                    description,
                    num_employees AS "numEmployees",
                    logo_url AS "logoUrl"`, [
      handle,
      name,
      description,
      numEmployees,
      logoUrl,
    ],
    );
    const company = result.rows[0];

    return company;
  }

  /** Find all companies.
   *
   * Returns [{ handle, name, description, numEmployees, logoUrl }, ...]
   * */

  static async findAll(query) {
    console.log("findAll Runs.........");
    if (query) {
      console.log("if block runs.........");
      console.log("query.........", query);

      const findQueryResults = Company.findMatching(query);
      return findQueryResults;
    }

    console.log("findAll Passes if block.........");

    const companiesRes = await db.query(`
        SELECT handle,
               name,
               description,
               num_employees AS "numEmployees",
               logo_url      AS "logoUrl"
        FROM companies
        ORDER BY name`);
    return companiesRes.rows;
  }

  /** Find companies matching query.
   *
   * Returns [{ handle, name, description, numEmployees, logoUrl }, ...]
   * */

  static async findMatching(query) {
    console.log("findMatching Runs.........");
    console.log("queryString........", query);

    //TODO: How to get greater/less than into sql
    let queryStrings = []
    if (query.minEmployees){
      const minKey = "numEmployees";
      const minOperator = ">=";
      const minValue = query.minEmployees;
      const minQueryString = `${minKey} ${minOperator} ${minValue}`;
      queryStrings.push(minQueryString);
    }
    if (query.maxEmployees){
      const maxKey = "numEmployees";
      const maxOperator = "<=";
      const maxValue = query.maxEmployees;
      const maxQueryString = `${maxKey} ${maxOperator} ${maxValue}`;
      queryStrings.push(maxQueryString);
    }
    let queryInsert = queryStrings.join(", ");
    console.log("queryInsert", queryInsert);

    const companiesRes = await db.query(`
        SELECT handle,
              name,
              description,
              num_employees AS "numEmployees",
              logo_url      AS "logoUrl"
        FROM companies
        WHERE ${queryInsert}
        ORDER BY name`);
    return companiesRes.rows;
  }





  /** Given a company handle, return data about company.
   *
   * Returns { handle, name, description, numEmployees, logoUrl, jobs }
   *   where jobs is [{ id, title, salary, equity, companyHandle }, ...]
   *
   * Throws NotFoundError if not found.
   **/

  static async get(handle) {
    const companyRes = await db.query(`
        SELECT handle,
               name,
               description,
               num_employees AS "numEmployees",
               logo_url      AS "logoUrl"
        FROM companies
        WHERE handle = $1`, [handle]);

    const company = companyRes.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);

    return company;
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
    console.log("handleVarIdx", handleVarIdx);


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
