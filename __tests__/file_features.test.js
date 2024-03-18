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
 * Test a txt file upload
 */
describe("/uploadFile txt", () => {
  async function getAuthSession() {
    const username = process.env.TEST_LOGIN_USERNAME;
    const password = process.env.TEST_LOGIN_PASSWORD;
    const res = await loginSession
      .post("/login")
      .send({ email: username, password: password });
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

/**
 * Test a pdf file upload
 */
describe("/uploadFile pdf", () => {
  async function getAuthSession() {
    const username = process.env.TEST_LOGIN_USERNAME;
    const password = process.env.TEST_LOGIN_PASSWORD;
    const res = await loginSession
      .post("/login")
      .send({ email: username, password: password });
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
      .attach("uploadedFile", `${__dirname}/__tests__/test_file.pdf`);
    expect(res2.body.message).toBe("Upload OK");
    expect([200]).toContain(res2.statusCode);

    await server.close();
  });
});

/**
 * Test a pptx file upload
 */
describe("/uploadFile pptx", () => {
  async function getAuthSession() {
    const username = process.env.TEST_LOGIN_USERNAME;
    const password = process.env.TEST_LOGIN_PASSWORD;
    const res = await loginSession
      .post("/login")
      .send({ email: username, password: password });
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
      .attach("uploadedFile", `${__dirname}/__tests__/test_file.pptx`);
    expect(res2.body.message).toBe("Upload OK");
    expect([200]).toContain(res2.statusCode);

    await server.close();
  });
});

/**
 * Test a xlsx file upload
 */
describe("/uploadFile xlsx", () => {
  async function getAuthSession() {
    const username = process.env.TEST_LOGIN_USERNAME;
    const password = process.env.TEST_LOGIN_PASSWORD;
    const res = await loginSession
      .post("/login")
      .send({ email: username, password: password });
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
      .attach("uploadedFile", `${__dirname}/__tests__/test_file.xlsx`);
    expect(res2.body.message).toBe("Upload OK");
    expect([200]).toContain(res2.statusCode);

    await server.close();
  });
});

/**
 * Test a zip file upload
 */
describe("/uploadFile zip", () => {
  async function getAuthSession() {
    const username = process.env.TEST_LOGIN_USERNAME;
    const password = process.env.TEST_LOGIN_PASSWORD;
    const res = await loginSession
      .post("/login")
      .send({ email: username, password: password });
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
      .attach("uploadedFile", `${__dirname}/__tests__/test_file.zip`);
    expect(res2.body.message).toBe("Upload OK");
    expect([200]).toContain(res2.statusCode);

    await server.close();
  });
});

/**
 * Test a file upload failure
 */
describe("/uploadFile failure", () => {
  async function getAuthSession() {
    const username = process.env.TEST_LOGIN_USERNAME;
    const password = process.env.TEST_LOGIN_PASSWORD;
    const res = await loginSession
      .post("/login")
      .send({ email: username, password: password });
    expect([200, 302]).toContain(res.statusCode);
    return loginSession;
  }
  it("upload a file", async () => {
    const authSession = await getAuthSession();
    const res2 = await authSession.post("/uploadFile");
    expect([500]).toContain(res2.statusCode);
    await server.close();
  });
});

/**
 * Test a file download
 */
describe("/downloadFile", () => {
  it("download a file", async () => {
    const eventName = process.env.TEST_EVENT_NAME;
    const eventUid = process.env.TEST_EVENT_UID;
    const res = await loginSession
      .post("/downloadFile")
      .send({ uid: eventUid, eventName: eventName });
    expect(res.text).toContain("https://firebasestorage");
    expect(res.statusCode).toBe(200);
    await server.close();
  });
});

/**
 * Test a file download failure
 */
describe("/downloadFile failure", () => {
  it("download a file", async () => {
    const res = await loginSession
      .post("/downloadFile")
      .send({ uid: " ", eventName: " " });
    expect(res.statusCode).toBe(500);
    await server.close();
  });
});

afterAll((done) => {
  server.close();
  return done();
});
