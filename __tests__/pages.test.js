/**
 * This file contains tests for routes that render pages
 */
import request from "supertest";
import server from "../index.js";

/**
 * Test render route for root/homepage
 */
describe("/", () => {
  it("get root page (homepage)", async () => {
    const res = await request(server).get("/");
    expect(res.header["content-type"].toLowerCase()).toBe(
      "text/html; charset=utf-8",
    );
    expect(res.statusCode).toBe(200);
    await server.close();
  });
});

/**
 * Test render route for homepage
 */
describe("/homepage", () => {
  it("get home page", async () => {
    const res = await request(server).get("/homepage");
    expect(res.header["content-type"].toLowerCase()).toBe(
      "text/html; charset=utf-8",
    );
    expect(res.statusCode).toBe(200);
    await server.close();
  });
});

/**
 * Test render route for login page
 */
describe("/login", () => {
  it("get login page", async () => {
    const res = await request(server).get("/login");
    expect(res.header["content-type"].toLowerCase()).toBe(
      "text/html; charset=utf-8",
    );
    expect(res.statusCode).toBe(200);
    await server.close();
  });
});

/**
 * Test render route for register page
 */
describe("/register", () => {
  it("get register page", async () => {
    const res = await request(server).get("/register");
    expect(res.header["content-type"].toLowerCase()).toBe(
      "text/html; charset=utf-8",
    );
    expect(res.statusCode).toBe(200);
    await server.close();
  });
});

afterAll((done) => {
  server.close();
  return done();
});
