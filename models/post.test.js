"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError.js");
const Post = require("./post.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  postTestIds,
} = require("./_testCommon.js");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
  const newPost = {
    "title": "j3",
    "salary": 300,
    "equity": "0.002",
    "companyHandle": "c1",
  };

  const duplicatePost = {
    "title": "j1",
    "salary": 100,
    "equity": "0",
    "companyHandle": "c1",
  };

  test("works: creates new post", async function () {
    let post = await Post.create(newPost);
    expect(post).toEqual(newPost);

    const result = await db.query(
          `SELECT title, salary, equity, company_handle
           FROM posts
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

  test("fails: to create duplicate post", async function () {
    try {
        await Post.create(duplicatePost);
        throw new Error("fail test, you shouldn't get here");
    } catch (err) {
        expect(err instanceof BadRequestError).toBeTruthy();
    }
  });

});

/************************************** findAll */

describe("findAll", function () {
    test("works: no filter", async function () {
        let posts = await Post.findAll();
        expect(posts).toEqual([
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
        let posts = await Post.findAll(query);
        expect(posts).toEqual([
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
        let posts = await Post.findAll(query);
        expect(posts).toEqual([{
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
        let posts = await Post.findAll(query)

        expect(posts).toEqual([
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
        let posts = await Post.findAll(query);
        expect(posts).toEqual([
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
        let results = await Post.findMatching(query);
        let [whereInsert, values] = results;
        expect(whereInsert).toEqual("WHERE salary >= $1");
        expect(values).toEqual([150]);
    });

    test("works: has equity", async function () {
      let query = { hasEquity: true };
      let results = await Post.findMatching(query);
      let [whereInsert, values] = results;
      expect(whereInsert).toEqual("WHERE equity > 0");
    });

    test("works: titleLike", async function () {
        let query = { titleLike: "j1" };
        let results = await Post.findMatching(query)
        let [whereInsert, values] = results;
        expect(whereInsert).toEqual("WHERE title ILIKE $1");
        expect(values).toEqual(["%j1%"]);
    });

    test("works: all 3 functions", async function (){
      let query = { minSalary: 150, hasEquity: true, titleLike: "g" };
      let results = await Post.findMatching(query);
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
        let post = await Post.findById(postTestIds[0]);
        expect(post).toEqual({
            id: postTestIds[0],
            title: "j1",
            salary: 100,
            equity: "0",
            companyHandle: "c1",
        },);
    });

    test("fails: not found if no such post", async function () {
        try {
            await Post.findById(0);
            throw new Error("fail test, you shouldn't get here");
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
});

// /************************************** update */

describe("update", function () {

  test("works: updates post data", async function () {

    const postId = postTestIds[0];
    const updateData = {
        salary: 200,
        equity: "0.1",
    };
    let updatedPost = await Post.update(postId, updateData);

    expect(updatedPost).toEqual({
        id: postId,
        title: "j1",
        salary: 200,
        equity: "0.1",
        companyHandle: "c1",
    });
  });

  test("works: no changes", async function () {

    const postId = postTestIds[0];
    const updateData = {
        title: "j1",
        salary: 100,
        equity: "0",
        company_handle: "c1"
    };
    let updatedPost = await Post.update(postId, updateData);

    expect(updatedPost).toEqual({
        id: postId,
        title: "j1",
        salary: 100,
        equity: "0",
        companyHandle: "c1",
    });
  });

  test("fail: bad request with no data", async function () {

    const postId = postTestIds[0];
    const updateData = {};

    try {
      await Post.update(postId, updateData);
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

// /************************************** remove */

describe("remove", function () {
  test("works: deletes post", async function () {

    const postId = postTestIds[0];
    await Post.remove(postId);
    const deletedPost = await db.query(
        `SELECT id FROM posts WHERE id=${postId}`);
    expect(deletedPost.rows.length).toEqual(0);
  });

  test("fail: not found/deleted if no such post", async function () {
    try {
      await Post.remove(1000000);
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
