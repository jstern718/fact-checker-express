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
  postTestIds,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);




/************************************** POST /posts */

describe("POST /posts", function () {
  const newPost = {
    title: "j3",
    salary: 100000,
    equity: "0.01",
    companyHandle: "c1",
  };

  test("ok for admin", async function () {
    // console.log("token", adminToken);
    const newPost = {
        title: "j3",
        salary: 100000,
        equity: 0.01,
        companyHandle: "c1",
      }

    const resp = await request(app)
        .post("/posts")
        .send(newPost)
        .set("authorization", `Bearer ${adminToken}`);

    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
        post: {
            title: "j3",
            salary: 100000,
            equity: "0.01",
            companyHandle: "c1",
        }
    });
  });

  test("unauth for users", async function () {
    const resp = await request(app)
        .post("/posts")
        .send(newPost)
        .set("authorization", `Bearer ${u1Token}`);

    expect(resp.statusCode).toEqual(401);
  });

  test("bad request with missing data", async function () {
    const resp = await request(app)
        .post("/posts")
        .send({
          handle: "new",
          numEmployees: 10,
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
        .post("/posts")
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

/************************************** GET /posts */

describe("GET /posts", function () {

  test("ok for anon, all posts", async function () {
    const resp = await request(app).get("/posts");
    expect(resp.body).toEqual({
      posts:
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
    const resp = await request(app).get("/posts/?minSalary=150");
    expect(resp.body).toEqual({
      posts:
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
    const resp = await request(app).get("/posts/?hasEquity=true");
    expect(resp.body).toEqual({
      posts:
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
    const resp = await request(app).get("/posts/?titleLike=g");
    expect(resp.body).toEqual({
      posts:
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
      "/posts/?minSalary=150&hasEquity=false&titleLike=g");
    expect(resp.body).toEqual({
      posts:
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

/************************************** GET /posts/:id */

describe("GET /posts/:id", function () {

  test("works", async function () {
    const id = postTestIds[0];
    const resp = await request(app).get(`/posts/${Number(id)}`);
    expect(resp.body).toEqual({
      post: {
        "id": id,
        "title": "j1",
        "salary": 100,
        "equity": "0",
        "companyHandle": "c1",
      },
    });
  });

  test("not found for no such post", async function () {
    const resp = await request(app).get(`/posts/1000000`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** PATCH /posts/:handle */

describe("PATCH /posts/:id", function () {
  test("works for admin", async function () {
    const id = postTestIds[0];
    const resp = await request(app)
        .patch(`/posts/${id}`)
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
    const id = postTestIds[0];
    const resp = await request(app)
        .patch(`/posts/${id}`)
        .send({
          title: "newName",
        });
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for users", async function () {
    const id = postTestIds[0];
    const resp = await request(app)
        .patch(`/posts/${id}`)
        .send({
          title: "newName",
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });


  test("not found on no such post", async function () {
    const resp = await request(app)
        .patch(`/posts/0`)
        .send({
          title: "nope",
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request on invalid salary", async function () {
    const id = postTestIds[0];
    const resp = await request(app)
        .patch(`/posts/${id}`)
        .send({
          salary: "not-a-salary",
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request on invalid equity", async function () {
    const id = postTestIds[0];
    const resp = await request(app)
        .patch(`/posts/${id}`)
        .send({
          equity: "not-equity",
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** DELETE /posts/:handle */

describe("DELETE /posts/:handle", function () {
  test("works for admin", async function () {
    const id = postTestIds[0];
    const resp = await request(app)
        .delete(`/posts/${id}`)
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({ deleted: id });
  });

  test("unauth for anon", async function () {
    const id = postTestIds[0];
    const resp = await request(app)
        .delete(`/posts/${id}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for user", async function () {
    const id = postTestIds[0];
    const resp = await request(app)
        .delete(`/posts/${id}`)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found for no such post", async function () {
    const resp = await request(app)
        .delete(`/posts/100000000`)
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });
});