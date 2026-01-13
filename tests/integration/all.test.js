const request = require("supertest");
const app = require("../../src/app");

describe("All Endpoints", () => {
  it("should forgot password", async () => {
    const res = await request(app)
      .post("/api/v1/auth/forgot-password")
      .send({
        email: "test@test.com",
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("message");
  });

  it("should change password", async () => {
    const res = await request(app)
      .post("/api/v1/auth/change-password")
      .send({
        userId: 1,
        oldPassword: "password",
        newPassword: "newpassword",
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("message");
  });

  it("should update profile", async () => {
    const res = await request(app)
      .put("/api/v1/users/profile")
      .send({
        userId: 1,
        profileData: { name: "New Name", email: "new@email.com" },
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("name", "New Name");
  });

  it("should check centre capacity", async () => {
    const res = await request(app).get("/api/v1/centres/1/capacity");
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("capacity");
  });

  it("should reverify biometric", async () => {
    const res = await request(app)
      .post("/api/v1/biometric/reverify")
      .send({
        verificationId: 1,
        biometricData: {},
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("status", "Re-verified");
  });

  it("should upload operators", async () => {
    const res = await request(app)
      .post("/api/v1/operators/upload")
      .attach("file", "tests/fixtures/operators.csv");
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("message");
  });

  it("should correct attendance", async () => {
    const res = await request(app)
      .put("/api/v1/attendance/correct")
      .send({
        attendanceId: 1,
        correctionData: { status: "Present" },
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("status", "Present");
  });

  it("should update role", async () => {
    const res = await request(app)
      .put("/api/v1/users/role")
      .send({
        userId: 1,
        newRole: "admin",
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("role", "admin");
  });

  it("should get logs", async () => {
    const res = await request(app).get("/api/v1/logs");
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("should trigger backup", async () => {
    const res = await request(app).post("/api/v1/backup");
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("message");
  });
});
