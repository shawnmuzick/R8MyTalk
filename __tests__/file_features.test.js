/**
 * This file contains tests for file uploads/downloads
 */
import session from "supertest-session";
import server from "../index.js";
import { __dirname } from "../index.js";

let loginSession;

beforeEach(() => {
  loginSession = session(server);
});

afterEach(() => {
  loginSession = null;
});

/**
 * Test a file upload
 */
describe("/uploadFile", () => {
  async function getAuthSession() {
    const username = process.env.TEST_LOGIN_USERNAME;
    const password = process.env.TEST_LOGIN_PASSWORD;
    const res = await loginSession.post("/login").send({ email: username, password: password });
    expect([200, 302]).toContain(res.statusCode);
    return loginSession;
  }
  it("upload a file", async () => {
    const authSession = await getAuthSession();
    const eventName = process.env.TEST_EVENT_NAME;

    //do the file upload
    const res2 = await authSession
      .post("/uploadFile")
      .field("Content-Type", "multipart/form-data")
      .field("eventName", eventName)
      .attach("uploadedFile", `${__dirname}/__tests__/test_file.txt`);
    expect(res2.body.message).toBe("Upload OK");
    expect([200]).toContain(res2.statusCode);

    await server.close();
  });
});

afterAll((done) => {
  server.close();
  return done();
});
