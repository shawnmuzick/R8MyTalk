/**
 * This file contains tests for login/logout routes
 */
import request from "supertest";
import session from "supertest-session";
import server from "../index.js";

let loginSession;

beforeEach(() => {
  loginSession = session(server);
});

afterEach(() => {
  loginSession = null;
});

/**
 * Test a user login
 */
describe("/login", () => {
  it("log in a user", async () => {
    //get the credentials
    const username = process.env.TEST_LOGIN_USERNAME;
    const password = process.env.TEST_LOGIN_PASSWORD;
    const res = await loginSession
      .post("/login")
      .send({ email: username, password: password });

    //should be plain because it's a redirect to /profile from the server
    expect(res.header["content-type"].toLowerCase()).toBe(
      "text/plain; charset=utf-8",
    );
    //302 if we're already logged in for some reason
    expect([200, 302]).toContain(res.statusCode);
    console.log(res.statusCode, res.header["location"]); //log whatever we actually got back

    await server.close();
  });
});

/**
 * Test a user login and logout
 */
describe("/login and logout", () => {
  it("log in a user and log them out", async () => {
    //get the credentials
    const username = process.env.TEST_LOGIN_USERNAME;
    const password = process.env.TEST_LOGIN_PASSWORD;
    const res = await loginSession
      .post("/login")
      .send({ email: username, password: password });

    //should be plain because it's a redirect to /profile from the server
    expect(res.header["content-type"].toLowerCase()).toBe(
      "text/plain; charset=utf-8",
    );
    //302 if we're already logged in for some reason
    expect([200, 302]).toContain(res.statusCode);
    console.log(res.statusCode, res.header["location"]); //log whatever we actually got back

    const res2 = await request(server).get("/logout");
    //should be plain because it's a redirect to /profile from the server
    expect(res2.header["content-type"].toLowerCase()).toBe(
      "text/plain; charset=utf-8",
    );
    expect([200, 302]).toContain(res.statusCode);
    console.log(res.statusCode, res2.header["location"]); //log whatever we actually got back

    await server.close();
  });
});

afterAll((done) => {
  server.close();
  return done();
});
