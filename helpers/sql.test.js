"use strict";

require("supertest");

const { sqlForPartialUpdate } = require("./sql");
const { BadRequestError } = require("../expressError");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("../models/_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);


describe("sqlForPartialUpdate", function () {

  test("returns string is as expected", function () {
    const dataToUpdate = {
      age: 32,
      email: "example@example.com"
    }
    const result = sqlForPartialUpdate(dataToUpdate, {});
    expect(result).toEqual({
      setCols: "\"age\"=$1, \"email\"=$2",
      values: [32, "example@example.com"]
    });
  });

  test("CompanyToSnakeCase works", function () {
    const dataToUpdate = {
      numEmployees: 1000,
      logUrl: "example.com"
    }
    const jsToSql = {
      numEmployees: "num_employees",
      logoUrl: "logo_url",
    }
    const result = sqlForPartialUpdate(dataToUpdate, jsToSql);
    expect(result).toEqual({
      setCols: "\"num_employees\"=$1, \"logUrl\"=$2",
      values: [1000, "example.com"]
    });
  });

  test("UserToSnakeCase works", function () {
    const dataToUpdate = {
      firstName: "Jon",
      lastName: "Dough",
      isAdmin: true,
    }
    const jsToSql = {
      firstName: "first_name",
          lastName: "last_name",
          isAdmin: "is_admin",
    }
    const result = sqlForPartialUpdate(dataToUpdate, jsToSql);
    expect(result).toEqual({
      setCols: "\"first_name\"=$1, \"last_name\"=$2, \"is_admin\"=$3",
      values: ["Jon", "Dough", true]
    });
  });

  test("Bad request no data", function () {
    const dataToUpdate = {};
    const jsToSql = {
      firstName: "first_name",
          lastName: "last_name",
          isAdmin: "is_admin",
    };

    expect(()=>sqlForPartialUpdate(
      dataToUpdate, jsToSql).toThrowError(
      BadRequestError)
    )
  });
});