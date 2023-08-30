"use strict";

const { BadRequestError } = require("../expressError");

/**
 * sqlForPartialUpdate is called by users.update(), companies.update()
 * and jobs.update().
 *
 * It assists the update functions in formatting the sql requests in two ways:
 *      (1) by creating the dollar sign variable value insertions that prevent
 *          sql injection attacks.
 *      (2) by translating js names into sql readable names.
 *
 * Accepts: ... two arguments, dataToUpdate and jsToSql.
 *
 * DataToUpdate: ... a js object containing the data received in the body of the
 * http request.
 *
 * jsToSql: ... an object defined in calling functions.
 * Its keys are the js camel-case names of tables, and its values
 * are the snake-case sql equivilent.
 *
 * Returns: ... { setCols, values }. SetCols is a string of
 * all of the colName(s) and their $[num] values. It also contains
 * an array of the values in the the same order.
 *
 * TODO: add example of what it looks like
 */

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  console.log("run sqlForPartialUpdate")
  console.log("data", dataToUpdate, "translate", jsToSql)

  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
    `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };

