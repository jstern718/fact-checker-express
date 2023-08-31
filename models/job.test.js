"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  jobTestIds,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
  const newJob = {
    "title": "j3",
    "salary": 300,
    "equity": "0.002",
    "companyHandle": "c1",
  };

  const duplicateJob = {
    "title": "j1",
    "salary": 100,
    "equity": "0",
    "companyHandle": "c1",
  };

  test("works: creates new job", async function () {
    let job = await Job.create(newJob);
    expect(job).toEqual(newJob);

    const result = await db.query(
          `SELECT title, salary, equity, company_handle
           FROM jobs
           WHERE title = 'j3'`);
    expect(result.rows).toEqual([
      {
        title: "j3",
        salary: 300,
        equity: "0.002",
        company_handle: "c1",
      },
    ]);
  });

  test("fails: to create duplicate job", async function () {
    try {
        await Job.create(duplicateJob);
        throw new Error("fail test, you shouldn't get here");
    } catch (err) {
        expect(err instanceof BadRequestError).toBeTruthy();
    }
  });

});

/************************************** findAll */

describe("findAll", function () {
    test("works: no filter", async function () {
        let jobs = await Job.findAll();
        expect(jobs).toEqual([
        {
            title: "j1",
            salary: 100,
            equity: "0",
            company_handle: "c1",
        },
        {
            title: "j2",
            salary: 200,
            equity: "0.01",
            company_handle: "c2",
        },
        {
            title: "g1",
            salary: 200,
            equity: "0.02",
            company_handle: "c1",
        }
        ]);
    });

    test("works: find all w/ min salary", async function () {
        let query = { minSalary: 150 };
        let jobs = await Job.findAll(query);
        expect(jobs).toEqual([
        {
            title: "j2",
            salary: 200,
            equity: "0.01",
            company_handle: "c2",
        },
        {
            title: "g1",
            salary: 200,
            equity: "0.02",
            company_handle: "c1",
        }
        ]);
    });

    test("works: find all that have equity", async function () {
        let query = { hasEquity: true };
        let jobs = await Job.findAll(query);
        expect(jobs).toEqual([{
            title: "j2",
            salary: 200,
            equity: "0.01",
            company_handle: "c2",
        },
        {
            title: "g1",
            salary: 200,
            equity: "0.02",
            company_handle: "c1",
        }
    ]);
    });

    test("works: find all w/ titleLike", async function () {
        let query = { titleLike: "j1" };
        let jobs = await Job.findAll(query)

        expect(jobs).toEqual([
            {
                title: "j1",
                salary: 100,
                equity: "0",
                company_handle: "c1",
            },
        ]);
    });

    test("works: find all w/ 3 functions", async function (){
        let query = { minSalary: 150, hasEquity: true, titleLike: "g" };
        let jobs = await Job.findAll(query);
        expect(jobs).toEqual([
            {
                title: "g1",
                salary: 200,
                equity: "0.02",
                company_handle: "c1",
            }
        ]);
      });
});

/************************************** findMatching */

describe("findMatching", function () {

    test("works: min salary", async function () {
        let query = { minSalary: 150 };
        let results = await Job.findMatching(query);
        let [whereInsert, values] = results;
        expect(whereInsert).toEqual("WHERE salary >= $1");
        expect(values).toEqual([150]);
    });

    test("works: has equity", async function () {
      let query = { hasEquity: true };
      let results = await Job.findMatching(query);
      let [whereInsert, values] = results;
      expect(whereInsert).toEqual("WHERE equity > 0");
    });

    test("works: titleLike", async function () {
        let query = { titleLike: "j1" };
        let results = await Job.findMatching(query)
        let [whereInsert, values] = results;
        expect(whereInsert).toEqual("WHERE title ILIKE $1");
        expect(values).toEqual(["%j1%"]);
    });

    test("works: all 3 functions", async function (){
      let query = { minSalary: 150, hasEquity: true, titleLike: "g" };
      let results = await Job.findMatching(query);
      let [whereInsert, values] = results;
      expect(whereInsert).toEqual(
        "WHERE salary >= $1 AND equity > 0 AND title ILIKE $2"
      );
      expect(values).toEqual([150, "%g%"]);
    });
});


/************************************** get */

describe("findById", function () {

    test("works", async function () {
        let job = await Job.findById(jobTestIds[0]);
        expect(job).toEqual({
            id: jobTestIds[0],
            title: "j1",
            salary: 100,
            equity: "0",
            companyHandle: "c1",
        },);
    });

    test("fails: not found if no such job", async function () {
        try {
            await Job.findById(0);
            throw new Error("fail test, you shouldn't get here");
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
});

// /************************************** update */

describe("update", function () {

  test("works: updates job data", async function () {

    const jobId = jobTestIds[0];
    const updateData = {
        salary: 200,
        equity: "0.1",
    };
    let updatedJob = await Job.update(jobId, updateData);

    expect(updatedJob).toEqual({
        id: jobId,
        title: "j1",
        salary: 200,
        equity: "0.1",
        companyHandle: "c1",
    });
  });

  test("works: no changes", async function () {

    const jobId = jobTestIds[0];
    const updateData = {
        title: "j1",
        salary: 100,
        equity: "0",
        company_handle: "c1"
    };
    let updatedJob = await Job.update(jobId, updateData);

    expect(updatedJob).toEqual({
        id: jobId,
        title: "j1",
        salary: 100,
        equity: "0",
        companyHandle: "c1",
    });
  });

  test("fail: bad request with no data", async function () {

    const jobId = jobTestIds[0];
    const updateData = {};

    try {
      await Job.update(jobId, updateData);
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

// /************************************** remove */

describe("remove", function () {
  test("works: deletes job", async function () {

    const jobId = jobTestIds[0];
    await Job.remove(jobId);
    const deletedJob = await db.query(
        `SELECT id FROM jobs WHERE id=${jobId}`);
    expect(deletedJob.rows.length).toEqual(0);
  });

  test("fail: not found/deleted if no such job", async function () {
    try {
      await Job.remove(1000000);
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
