const request = require("supertest");
const app = require("../../src/app");

describe("Auth Endpoints", () => {
  it("should login a user", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({
        username: "testuser",
        password: "password",
        deviceId: "deviceId",
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("token");
  });
});
