"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for companies. */

class Topic {

  /** Create a topic (from data), update db, return new topic data.
   *
   * data should be { handle, name, description, numEmployees, logoUrl }
   *
   * Returns { handle, name, description, numEmployees, logoUrl }
   *
   * Throws BadRequestError if topic already in database.
   * */

  static async create({ name }) {
    console.log("create topic runs")

    const duplicateCheck = await db.query(`
        SELECT name
        FROM topics
        WHERE name = $1`, [name]);

    if (duplicateCheck.rows[0])
      throw new BadRequestError(`Duplicate topic: ${name}`);

    const result = await db.query(`
                INSERT INTO topics (name)
                VALUES ($1)
                RETURNING
                    name`, [
      name
    ]
    );
    const topic = result.rows[0];

    return topic;
  }

  /** Finds all companies or finds filtered list of companies.
   * Takes query string from get request.
   * Returns [{ handle, name, description, numEmployees, logoUrl }, ...]
   * */

  static async findAll(query) {
    console.log("get all topics runs")

    // let results = Topic.findMatching(query)
    // console.log("results....", results);
    // let [whereInsert, values] = results;

      const result = await db.query(`
        SELECT name
        FROM topics
        ORDER BY name`,
    []);
    return result.rows;
  }

  /** Assists findAll() in search by adding filtering capability.
   * Takes query object passed into findAll function and returns
   * an object with two keys (whereInsert, values), one holding a
   * WHERE string to be inserted into findAll's sql query; the other
   * holding, an array with the values, corresponding to the WHERE
   * string.* */

//   static findMatching(query) {

//     let queryStrings = []
//     let values = [];
//     let count = 1;
//     let whereInsert;

//     if (query){



//         // nameLike
//         if (query.nameLike){
//             const nameQueryString = `name ILIKE $${count}`;
//             count += 1;
//             queryStrings.push(nameQueryString);
//             values.push(`%${ query.nameLike }%`);
//         }
//         whereInsert = queryStrings.join(" AND ");
//     }
//     if (whereInsert){
//       whereInsert = "WHERE " + whereInsert;
//     }
//     // console.log("before return ..........", whereInsert, values);
//     return [whereInsert, values];
//   }

  /** Given a topic handle, return data about topic.
   *
   * Returns { handle, name, description, numEmployees, logoUrl, jobs }
   *   where jobs is [{ id, title, salary, equity, topicHandle }, ...]
   *
   * Throws NotFoundError if not found.
   **/

  static async get(name){
    console.log("get topic by name runs");
    const result = await db.query(`
        SELECT *
        FROM topics
        WHERE name = $1`,
    [name]);

    const topic = result.rows[0];

    if (!topic) throw new NotFoundError(`No topic: ${name}`);

    const topicPosts = await db.query(
        `SELECT id, username, topicName, date, content
           FROM posts
           WHERE topicName = $1
           ORDER BY id`,
        [topic.name]
    );

    topic.posts = topicPosts.rows;

    return topic;
  }

  /** Update topic data with `data`.
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

//   static async update(name, data) {
//     const { setCols, values } = sqlForPartialUpdate(
//       data,
//       {
//         numEmployees: "num_employees",
//         logoUrl: "logo_url",
//       });
//     const handleVarIdx = "$" + (values.length + 1);

//     const querySql = `
//         UPDATE companies
//         SET ${setCols}
//         WHERE handle = ${handleVarIdx}
//         RETURNING
//             handle,
//             name,
//             description,
//             num_employees AS "numEmployees",
//             logo_url AS "logoUrl"`;
//     const result = await db.query(querySql, [...values, handle]);
//     const topic = result.rows[0];

//     if (!topic) throw new NotFoundError(`No topic: ${handle}`);

//     return topic;
//   }

  /** Delete given topic from database; returns undefined.
   *
   * Throws NotFoundError if topic not found.
   **/

  static async remove(name) {
    console.log("delete topic runs")
    const result = await db.query(`
        DELETE
        FROM topics
        WHERE name = $1
        RETURNING name`, [name]);
    const topic = result.rows[0];

    if (!topic) throw new NotFoundError(`No topic: ${handle}`);
  }
}

module.exports = Topic;
