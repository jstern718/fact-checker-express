"use strict";


const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError.js");
const Topic = require("./topic.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon.js");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);



/************************************** create */

describe("create", function () {
  const newTopic = {
    handle: "new",
    name: "New",
    description: "New Description",
    numEmployees: 1,
    logoUrl: "http://new.img",
  };

  test("works", async function () {
    let topic = await Topic.create(newTopic);
    expect(topic).toEqual(newTopic);

    const result = await db.query(
          `SELECT handle, name, description, num_employees, logo_url
           FROM companies
           WHERE handle = 'new'`);
    expect(result.rows).toEqual([
      {
        handle: "new",
        name: "New",
        description: "New Description",
        num_employees: 1,
        logo_url: "http://new.img",
      },
    ]);
  });

  test("bad request with dupe", async function () {
    try {
      await Topic.create(newTopic);
      await Topic.create(newTopic);
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** findAll */

describe("findAll", function () {
  test("works: no filter", async function () {
    let companies = await Topic.findAll();
    expect(companies).toEqual([
      {
        handle: "c1",
        name: "C1",
        description: "Desc1",
        numEmployees: 1,
        logoUrl: "http://c1.img",
      },
      {
        handle: "c2",
        name: "C2",
        description: "Desc2",
        numEmployees: 2,
        logoUrl: "http://c2.img",
      },
      {
        handle: "c3",
        name: "C3",
        description: "Desc3",
        numEmployees: 3,
        logoUrl: "http://c3.img",
      },
    ]);
  });
});

/************************************** findMatching */

describe("findMatching", function () {

    test("error: min>max employees", async function () {
        //TODO: pass as an object like next test
        let minEmployees = 350;
        let maxEmployees = 300;
        // let results = await Topic.findMatching(query)
        // expect(results).toEqual(
        //     "minEmployees cannot be greater than maxEmployees"
        // );
        expect(()=>topic.findMatching(
          minEmployees, maxEmployees).toThrowError(BadRequestError));
    });

    test("works: min employees", async function () {
        let query = { minEmployees: 3 };
        let results = await Topic.findMatching(query);
        let [whereInsert, values] = results;
        expect(whereInsert).toEqual("WHERE num_employees >= $1");
        expect(values).toEqual([3]);
    });

    test("works: max employees", async function () {
      let query = { maxEmployees: 1 };
      let results = await Topic.findMatching(query)
      let [whereInsert, values] = results;
      expect(whereInsert).toEqual("WHERE num_employees <= $1");
      expect(values).toEqual([1]);
    });

    test("works: nameLike", async function () {
        let query = { nameLike: "c" };
        let results = await Topic.findMatching(query)
        let [whereInsert, values] = results;
        expect(whereInsert).toEqual("WHERE name ILIKE $1");
        expect(values).toEqual(["%c%"]);
    });

    test("works: all 3 functions", async function (){
      let query = { minEmployees: 2, maxEmployees: 3, nameLike: "c" };
      let results = await Topic.findMatching(query)
      let [whereInsert, values] = results;
      expect(whereInsert).toEqual(
        "WHERE num_employees >= $1 AND num_employees <= $2 AND name ILIKE $3"
      );
      expect(values).toEqual([2, 3, "%c%"]);
    });
});


/************************************** get */

describe("get", function () {
  test("works", async function () {
    let topic = await Topic.get("c1");
    expect(topic).toEqual({
      handle: "c1",
      name: "C1",
      description: "Desc1",
      numEmployees: 1,
      logoUrl: "http://c1.img",
    });
  });

  test("not found if no such topic", async function () {
    try {
      await Topic.get("nope");
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** update */

describe("update", function () {
  const updateData = {
    name: "New",
    description: "New Description",
    numEmployees: 10,
    logoUrl: "http://new.img",
  };

  test("works", async function () {
    let topic = await Topic.update("c1", updateData);
    expect(topic).toEqual({
      handle: "c1",
      ...updateData,
    });

    const result = await db.query(
          `SELECT handle, name, description, num_employees, logo_url
           FROM companies
           WHERE handle = 'c1'`);
    expect(result.rows).toEqual([{
      handle: "c1",
      name: "New",
      description: "New Description",
      num_employees: 10,
      logo_url: "http://new.img",
    }]);
  });

  test("works: null fields", async function () {
    const updateDataSetNulls = {
      name: "New",
      description: "New Description",
      numEmployees: null,
      logoUrl: null,
    };

    let topic = await Topic.update("c1", updateDataSetNulls);
    expect(topic).toEqual({
      handle: "c1",
      ...updateDataSetNulls,
    });

    const result = await db.query(
          `SELECT handle, name, description, num_employees, logo_url
           FROM companies
           WHERE handle = 'c1'`);
    expect(result.rows).toEqual([{
      handle: "c1",
      name: "New",
      description: "New Description",
      num_employees: null,
      logo_url: null,
    }]);
  });

  test("not found if no such topic", async function () {
    try {
      await Topic.update("nope", updateData);
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with no data", async function () {
    try {
      await Topic.update("c1", {});
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** remove */

describe("remove", function () {
  test("works", async function () {
    await Topic.remove("c1");
    const res = await db.query(
        "SELECT handle FROM companies WHERE handle='c1'");
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such topic", async function () {
    try {
      await Topic.remove("nope");
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
