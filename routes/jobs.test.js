"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  u2Token,
  adminToken,
  jobTestIds,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);




/************************************** POST /jobs */

describe("POST /jobs", function () {
  const newJob = {
    title: "j3",
    salary: 100000,
    equity: "0.01",
    companyHandle: "c1",
  };

  test("ok for admin", async function () {
    // console.log("token", adminToken);
    const newJob = {
        title: "j3",
        salary: 100000,
        equity: 0.01,
        companyHandle: "c1",
      }

    const resp = await request(app)
        .post("/jobs")
        .send(newJob)
        .set("authorization", `Bearer ${adminToken}`);

    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
        job: {
            title: "j3",
            salary: 100000,
            equity: "0.01",
            companyHandle: "c1",
        }
    });
  });

  test("unauth for users", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send(newJob)
        .set("authorization", `Bearer ${u1Token}`);

    expect(resp.statusCode).toEqual(401);
  });

  test("bad request with missing data", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send({
          handle: "new",
          numEmployees: 10,
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send({
            title: "j3",
            salary: "100000",
            equity: "0.01",
            companyHandle: "c1",
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** GET /jobs */

describe("GET /jobs", function () {

  test("ok for anon, all jobs", async function () {
    const resp = await request(app).get("/jobs");
    expect(resp.body).toEqual({
      jobs:
          [
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
            },
          ],
    });
  });

  test("works: min salary", async function () {
    const resp = await request(app).get("/jobs/?minSalary=150");
    expect(resp.body).toEqual({
      jobs:
          [
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
            },
          ]
    });
  });

  test("works: has equity", async function () {
    const resp = await request(app).get("/jobs/?hasEquity=true");
    expect(resp.body).toEqual({
      jobs:
          [
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
            },
          ]
    });
  });

  test("works: titleLike", async function () {
    const resp = await request(app).get("/jobs/?titleLike=g");
    expect(resp.body).toEqual({
      jobs:
          [
            {
                title: "g1",
                salary: 200,
                equity: "0.02",
                company_handle: "c1",
            },
          ]
    });
  });

  test("works: all 3 functions", async function () {
    const resp = await request(app).get(
      "/jobs/?minSalary=150&hasEquity=false&titleLike=g");
    expect(resp.body).toEqual({
      jobs:
          [
            {
                title: "g1",
                salary: 200,
                equity: "0.02",
                company_handle: "c1",
            },
          ]
    });
  });
});

/************************************** GET /jobs/:id */

describe("GET /jobs/:id", function () {

  test("works", async function () {
    const id = jobTestIds[0];
    const resp = await request(app).get(`/jobs/${Number(id)}`);
    expect(resp.body).toEqual({
      job: {
        "id": id,
        "title": "j1",
        "salary": 100,
        "equity": "0",
        "companyHandle": "c1",
      },
    });
  });

  test("not found for no such job", async function () {
    const resp = await request(app).get(`/jobs/1000000`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** PATCH /jobs/:handle */

describe("PATCH /jobs/:id", function () {
  test("works for admin", async function () {
    const id = jobTestIds[0];
    const resp = await request(app)
        .patch(`/jobs/${id}`)
        .send({
          title: "newName",
        })
        .set("authorization", `Bearer ${adminToken}`);

    expect(resp.body).toEqual({
          id: id,
          title: "newName",
          salary: 100,
          equity: "0",
          companyHandle: "c1",
      });
  });

  test("unauth for anon", async function () {
    const id = jobTestIds[0];
    const resp = await request(app)
        .patch(`/jobs/${id}`)
        .send({
          title: "newName",
        });
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for users", async function () {
    const id = jobTestIds[0];
    const resp = await request(app)
        .patch(`/jobs/${id}`)
        .send({
          title: "newName",
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });


  test("not found on no such job", async function () {
    const resp = await request(app)
        .patch(`/jobs/0`)
        .send({
          title: "nope",
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request on invalid salary", async function () {
    const id = jobTestIds[0];
    const resp = await request(app)
        .patch(`/jobs/${id}`)
        .send({
          salary: "not-a-salary",
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request on invalid equity", async function () {
    const id = jobTestIds[0];
    const resp = await request(app)
        .patch(`/jobs/${id}`)
        .send({
          equity: "not-equity",
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** DELETE /jobs/:handle */

describe("DELETE /jobs/:handle", function () {
  test("works for admin", async function () {
    const id = jobTestIds[0];
    const resp = await request(app)
        .delete(`/jobs/${id}`)
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({ deleted: id });
  });

  test("unauth for anon", async function () {
    const id = jobTestIds[0];
    const resp = await request(app)
        .delete(`/jobs/${id}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for user", async function () {
    const id = jobTestIds[0];
    const resp = await request(app)
        .delete(`/jobs/${id}`)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found for no such job", async function () {
    const resp = await request(app)
        .delete(`/jobs/100000000`)
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });
});