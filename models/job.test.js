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

// describe("update", function () {
//   const updateData = {
//     name: "New",
//     description: "New Description",
//     numEmployees: 10,
//     logoUrl: "http://new.img",
//   };

//   test("works", async function () {
//     let company = await Company.update("c1", updateData);
//     expect(company).toEqual({
//       handle: "c1",
//       ...updateData,
//     });

//     const result = await db.query(
//           `SELECT handle, name, description, num_employees, logo_url
//            FROM companies
//            WHERE handle = 'c1'`);
//     expect(result.rows).toEqual([{
//       handle: "c1",
//       name: "New",
//       description: "New Description",
//       num_employees: 10,
//       logo_url: "http://new.img",
//     }]);
//   });

//   test("works: null fields", async function () {
//     const updateDataSetNulls = {
//       name: "New",
//       description: "New Description",
//       numEmployees: null,
//       logoUrl: null,
//     };

//     let company = await Company.update("c1", updateDataSetNulls);
//     expect(company).toEqual({
//       handle: "c1",
//       ...updateDataSetNulls,
//     });

//     const result = await db.query(
//           `SELECT handle, name, description, num_employees, logo_url
//            FROM companies
//            WHERE handle = 'c1'`);
//     expect(result.rows).toEqual([{
//       handle: "c1",
//       name: "New",
//       description: "New Description",
//       num_employees: null,
//       logo_url: null,
//     }]);
//   });

//   test("not found if no such company", async function () {
//     try {
//       await Company.update("nope", updateData);
//       throw new Error("fail test, you shouldn't get here");
//     } catch (err) {
//       expect(err instanceof NotFoundError).toBeTruthy();
//     }
//   });

//   test("bad request with no data", async function () {
//     try {
//       await Company.update("c1", {});
//       throw new Error("fail test, you shouldn't get here");
//     } catch (err) {
//       expect(err instanceof BadRequestError).toBeTruthy();
//     }
//   });
// });

// /************************************** remove */

// describe("remove", function () {
//   test("works", async function () {
//     await Company.remove("c1");
//     const res = await db.query(
//         "SELECT handle FROM companies WHERE handle='c1'");
//     expect(res.rows.length).toEqual(0);
//   });

//   test("not found if no such company", async function () {
//     try {
//       await Company.remove("nope");
//       throw new Error("fail test, you shouldn't get here");
//     } catch (err) {
//       expect(err instanceof NotFoundError).toBeTruthy();
//     }
//   });
// });
