"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for posts. */

class Post {

  /** Create a post (from data), update db, return new post data.
   *
   * data should be { title, salary, equity, company_handle }
   *
   * Returns { title, salary, equity, companyHandle }
   *
   * Throws BadRequestError if post already in database.
   * */

    static async create({ username, content, topicName }) {
        console.log("create post runs");
        console.log("res", res.locals.user);

        const result = await db.query(`
                    INSERT INTO posts (username,
                                        topicName,
                                        date,
                                        content)
                    VALUES ($1, $2, NOW(), $3)
                    RETURNING id,
                                username,
                                topicName,
                                date,
                                content`, [
                    username,
                    topicName,
                    content
                    ],
        );

        const post = result.rows[0];


        return post;
    }

    /** Finds all posts or finds filtered list of posts.
    * Takes query string from get request.
    * Returns [{ title, salary, equity, companyHandle }, ...]
    * */

    static async findAll(query) {
        console.log("find all runs")


        let results = Post.findMatching(query)
        let [whereInsert, values] = results;

        const postsRes = await db.query(`
            SELECT id,
                    username,
                    topicName,
                    date,
                    content
                    FROM posts
            ${whereInsert}
            ORDER BY id`,
        values);
        return postsRes.rows;
    }

    /** Assists findAll() in search by adding filtering capability.
    * Takes query object passed into findAll function and returns
    * an object with two keys (whereInsert, values), one holding a
    * WHERE string to be inserted into findAll's sql query; the other
    * holding, an array with the values, corresponding to the WHERE
    * string.* */

    static findMatching(query) {
        console.log("find matching runs")


        let queryStrings = []
        let values = [];
        let count = 1;
        let whereInsert;

        if (query){

            //contentLike
            if (query.contentLike){
                const contentQueryString = `content ILIKE $${count}`;
                count += 1;
                 queryStrings.push(contentQueryString);
                values.push(`%${ query.contentLike }%`);
            }

            whereInsert = queryStrings.join(" AND ");
        }

        if (whereInsert){
        whereInsert = "WHERE " + whereInsert;
        }

        return [whereInsert, values];
  }

    /** Given a post id, return data about post.
    *
    * Returns { id, title, salary, equity, company_handle }
    *
    * Throws NotFoundError if not found.
    **/

    static async findById(id){
        console.log("find by id runs")

        if (typeof id != "number"){
            throw new NotFoundError(`No post: ${id}`);
        }

        const results = await db.query(`
            SELECT id,
                    username,
                    topicName,
                    date,
                    content
            FROM posts
            WHERE id = $1`, [id]);

        const post = results.rows[0];

        if (!post) throw new NotFoundError(`No post: ${id}`);

        return post;
    }

  /** Update post data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * TAKES: id (of post), data.
   * Data can include: {title, salary, equity, companyHandle}
   *
   * SetCols takes a formated request from the results of the sqlForUpdate
   * function that is called above it.
   *
   * The id is added to the sql injection protected variables by being given
   * a number value and having its value added to the end of the array of
   * values also returned from sqlForUpdate.
   *
   * Returns {title, salary, equity, companyHandle}
   *
   * Throws NotFoundError if not found.
   */

  static async update(id, data) {
    console.log("update post runs")

    const { setCols, values } = sqlForPartialUpdate(
      data
    );

    if(!setCols){ throw new BadRequestError(`No data entered for update`);}

    const querySql = `
        UPDATE posts
        SET ${setCols}
        WHERE id = ${id}
        RETURNING
            id,
            username,
            topicName,
            date,
            content`;

    const result = await db.query(querySql, [...values]);
    const updatedPost = result.rows[0];

    if (!updatedPost) throw new NotFoundError(`No updatedPost: ${id}`);

    //NOTE: didn't include object name by putting in braces. Makes more sense
    //this way, but isn't consistent with previous models. Check if either
    //method presents issues later

    return updatedPost;
  }

  /** Delete given company from database; returns undefined.
   *
   * Throws NotFoundError if company not found.
   **/

  static async remove(id) {
    console.log("remove post runs")
    const result = await db.query(`
        DELETE
        FROM posts
        WHERE id = $1
        RETURNING id`, [id]);

    const deletedPost = result.rows[0];

    if (!deletedPost) throw new NotFoundError(`No post: ${id}`);
  }
}

module.exports = Post;
