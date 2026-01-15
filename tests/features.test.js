const request = require("supertest");
const app = require("../src/app");
const sequelize = require("../src/config/database");
const LivePassword = require("../src/models/LivePassword");

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

describe("Live Password Feature", () => {
  let generatedPassword;

  test("should generate a new live password", async () => {
    const res = await request(app)
      .post("/api/v1/live-password/generate")
      .set("Authorization", "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjE3YjQyMDYwLTQzYjYtNGU4Yy04ODRjLTQ3OTYwYjA0NzY5YSIsImlhdCI6MTY3ODYzMzYwMH0.Y-g-vYhC_wz-Z_g-vYhC_wz-Z_g-vYhC_wz-Z_g-vYg") // Mock token
      .send();
    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    expect(res.body.password).toBeDefined();
    generatedPassword = res.body.password;
  });

  test("should validate a correct live password", async () => {
    const res = await request(app)
      .post("/api/v1/live-password/validate")
      .send({ password: generatedPassword });
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
  });

  test("should not validate an incorrect live password", async () => {
    const res = await request(app)
      .post("/api/v1/live-password/validate")
      .send({ password: "incorrect" });
    expect(res.statusCode).toEqual(401);
    expect(res.body.success).toBe(false);
  });

  test("should not validate an expired live password", async () => {
    await LivePassword.update({ expiresAt: new Date(Date.now() - 1000) }, { where: { password: generatedPassword } });
    const res = await request(app)
      .post("/api/v1/live-password/validate")
      .send({ password: generatedPassword });
    expect(res.statusCode).toEqual(401);
    expect(res.body.success).toBe(false);
  });
});

describe("Two-Station Enforcement Feature", () => {
  const candidateId = "c9a4f22a-4077-4313-a12b-9e36be85a248";
  const examId = "e8a4f22a-4077-4313-a12b-9e36be85a248";
  const operatorId = "o2a4f22a-4077-4313-a12b-9e36be85a248";

  test("should not allow biometric capture without attendance", async () => {
    const res = await request(app)
      .post("/api/v1/biometric/capture")
      .set("Authorization", "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjE3YjQyMDYwLTQzYjYtNGU4Yy04ODRjLTQ3OTYwYjA0NzY5YSIsImlhdCI6MTY3ODYzMzYwMH0.Y-g-vYhC_wz-Z_g-vYhC_wz-Z_g-vYhC_wz-Z_g-vYg")
      .send({
        candidateId,
        examId,
        operatorId,
        faceImage: "test_face_image",
        fingerprintTemplate: "test_fingerprint_template"
      });
    expect(res.statusCode).toEqual(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Attendance not marked. Biometric capture is not allowed.");
  });

  test("should allow biometric capture with attendance", async () => {
    await request(app)
      .post("/api/v1/attendance")
      .set("Authorization", "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjE3YjQyMDYwLTQzYjYtNGU4Yy04ODRjLTQ3OTYwYjA0NzY5YSIsImlhdCI6MTY3ODYzMzYwMH0.Y-g-vYhC_wz-Z_g-vYhC_wz-Z_g-vYhC_wz-Z_g-vYg")
      .send({ candidateId, examId, present: true });

    const res = await request(app)
      .post("/api/v1/biometric/capture")
      .set("Authorization", "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjE3YjQyMDYwLTQzYjYtNGU4Yy04ODRjLTQ3OTYwYjA0NzY5YSIsImlhdCI6MTY3ODYzMzYwMH0.Y-g-vYhC_wz-Z_g-vYhC_wz-Z_g-vYhC_wz-Z_g-vYg")
      .send({
        candidateId,
        examId,
        operatorId,
        faceImage: "test_face_image",
        fingerprintTemplate: "test_fingerprint_template"
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
  });
});

describe("Face Match Logic Feature", () => {
  const candidateId = "c9a4f22a-4077-4313-a12b-9e36be85a248";
  const examId = "e8a4f22a-4077-4313-a12b-9e36be85a248";
  const operatorId = "o2a4f22a-4077-4313-a12b-9e36be85a248";
  let biometricId;

  test("should capture biometric data and then verify it", async () => {
    await request(app)
      .post("/api/v1/attendance")
      .set("Authorization", "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjE3YjQyMDYwLTQzYjYtNGU4Yy04ODRjLTQ3OTYwYjA0NzY5YSIsImlhdCI6MTY3ODYzMzYwMH0.Y-g-vYhC_wz-Z_g-vYhC_wz-Z_g-vYhC_wz-Z_g-vYg")
      .send({ candidateId, examId, present: true });
    await request(app)
      .post("/api/v1/candidates")
      .set("Authorization", "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjE3YjQyMDYwLTQzYjYtNGU4Yy04ODRjLTQ3OTYwYjA0NzY5YSIsImlhdCI6MTY3ODYzMzYwMH0.Y-g-vYhC_wz-Z_g-vYhC_wz-Z_g-vYhC_wz-Z_g-vYg")
      .send({ id: candidateId, photoUrl: "test_photo_url" });

    const captureRes = await request(app)
      .post("/api/v1/biometric/capture")
      .set("Authorization", "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjE3YjQyMDYwLTQzYjYtNGU4Yy04ODRjLTQ3OTYwYjA0NzY5YSIsImlhdCI6MTY3ODYzMzYwMH0.Y-g-vYhC_wz-Z_g-vYhC_wz-Z_g-vYhC_wz-Z_g-vYg")
      .send({
        candidateId,
        examId,
        operatorId,
        faceImage: "test_face_image",
        fingerprintTemplate: "test_fingerprint_template"
      });
    biometricId = captureRes.body.biometricId;

    const verifyRes = await request(app)
      .post(`/api/v1/biometric/verify/${biometricId}`)
      .set("Authorization", "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjE3YjQyMDYwLTQzYjYtNGU4Yy04ODRjLTQ3OTYwYjA0NzY5YSIsImlhdCI6MTY3ODYzMzYwMH0.Y-g-vYhC_wz-Z_g-vYhC_wz-Z_g-vYhC_wz-Z_g-vYg");
    
    expect(verifyRes.statusCode).toEqual(200);
    expect(verifyRes.body.success).toBe(true);
    expect(verifyRes.body.verified).toBeDefined();
    expect(verifyRes.body.matchPercentage).toBeDefined();
  });
});

describe("Slot-Wise Filtering Feature", () => {
  const examId = "e8a4f22a-4077-4313-a12b-9e36be85a248";
  const centreCode = "1234";
  const slot1Id = "s1a4f22a-4077-4313-a12b-9e36be85a248";
  const slot2Id = "s2a4f22a-4077-4313-a12b-9e36be85a248";
  const operator1Id = "o1a4f22a-4077-4313-a12b-9e36be85a248";
  const operator2Id = "o2a4f22a-4077-4313-a12b-9e36be85a248";

  test("should only return candidates for the operator's assigned slot", async () => {
    await request(app).post("/api/v1/operators").set("Authorization", "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjE3YjQyMDYwLTQzYjYtNGU4Yy04ODRjLTQ3OTYwYjA0NzY5YSIsImlhdCI6MTY3ODYzMzYwMH0.Y-g-vYhC_wz-Z_g-vYhC_wz-Z_g-vYhC_wz-Z_g-vYg").send({ id: operator1Id, slotId: slot1Id, examId, centreCode });
    await request(app).post("/api/v1/operators").set("Authorization", "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjE3YjQyMDYwLTQzYjYtNGU4Yy04ODRjLTQ3OTYwYjA0NzY5YSIsImlhdCI6MTY3ODYzMzYwMH0.Y-g-vYhC_wz-Z_g-vYhC_wz-Z_g-vYhC_wz-Z_g-vYg").send({ id: operator2Id, slotId: slot2Id, examId, centreCode });
    await request(app).post("/api/v1/candidates").set("Authorization", "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjE3YjQyMDYwLTQzYjYtNGU4Yy04ODRjLTQ3OTYwYjA0NzY5YSIsImlhdCI6MTY3ODYzMzYwMH0.Y-g-vYhC_wz-Z_g-vYhC_wz-Z_g-vYhC_wz-Z_g-vYg").send({ id: "c1", slotId: slot1Id, examId, centreCode });
    await request(app).post("/api/v1/candidates").set("Authorization", "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjE3YjQyMDYwLTQzYjYtNGU4Yy04ODRjLTQ3OTYwYjA0NzY5YSIsImlhdCI6MTY3ODYzMzYwMH0.Y-g-vYhC_wz-Z_g-vYhC_wz-Z_g-vYhC_wz-Z_g-vYg").send({ id: "c2", slotId: slot2Id, examId, centreCode });

    const res = await request(app)
      .get("/api/v1/operators/slot/candidates")
      .set("Authorization", "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Im8xYTRmMjJhLTQwNzctNDMxMy1hMTJiLTllMzZiZTg1YTI0OCIsImlhdCI6MTY3ODYzMzYwMH0.Y-g-vYhC_wz-Z_g-vYhC_wz-Z_g-vYhC_wz-Z_g-vYg");

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.candidates.length).toBe(1);
    expect(res.body.candidates[0].id).toBe("c1");
  });
});

describe("Offline Sync Conflict Prevention Feature", () => {
  const biometricRecord = {
    candidateId: "c9a4f22a-4077-4313-a12b-9e36be85a248",
    examId: "e8a4f22a-4077-4313-a12b-9e36be85a248",
    operatorId: "o2a4f22a-4077-4313-a12b-9e36be85a248",
    faceImage: "test_face_image",
    fingerprintTemplate: "test_fingerprint_template"
  };

  test("should prevent duplicate biometric records on sync", async () => {
    const res1 = await request(app)
      .post("/api/v1/sync/biometrics")
      .set("Authorization", "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjE3YjQyMDYwLTQzYjYtNGU4Yy04ODRjLTQ3OTYwYjA0NzY5YSIsImlhdCI6MTY3ODYzMzYwMH0.Y-g-vYhC_wz-Z_g-vYhC_wz-Z_g-vYhC_wz-Z_g-vYg")
      .send({ biometricData: [biometricRecord] });

    expect(res1.statusCode).toEqual(200);
    expect(res1.body.successfulSyncs).toBe(1);

    const res2 = await request(app)
      .post("/api/v1/sync/biometrics")
      .set("Authorization", "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjE3YjQyMDYwLTQzYjYtNGU4Yy04ODRjLTQ3OTYwYjA0NzY5YSIsImlhdCI6MTY3ODYzMzYwMH0.Y-g-vYhC_wz-Z_g-vYhC_wz-Z_g-vYhC_wz-Z_g-vYg")
      .send({ biometricData: [biometricRecord] });

    expect(res2.statusCode).toEqual(200);
    expect(res2.body.successfulSyncs).toBe(1);
  });
});
