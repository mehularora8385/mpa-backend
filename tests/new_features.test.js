const request = require("supertest");
const app = require("../src/app");
const sequelize = require("../src/config/database");
const Slot = require("../src/models/Slot");
const OMR = require("../src/models/OMR");
const Candidate = require("../src/models/Candidate");

describe("Feature Tests", () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe("Shift Lock Feature", () => {
    const examId = "e8a4f22a-4077-4313-a12b-9e36be85a248";
    let shift1Id, shift2Id;

    beforeAll(async () => {
      const shift1 = await Slot.create({ examId, name: "Morning", startTime: "09:00", endTime: "12:00" });
      const shift2 = await Slot.create({ examId, name: "Afternoon", startTime: "14:00", endTime: "17:00" });
      shift1Id = shift1.id;
      shift2Id = shift2.id;
    });

    test("should start a shift and lock others", async () => {
      const res = await request(app)
        .post(`/api/v1/shifts/exam/${examId}/shift/${shift1Id}/start`)
        .set("Authorization", "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjE3YjQyMDYwLTQzYjYtNGU4Yy04ODRjLTQ3OTYwYjA0NzY5YSIsImlhdCI6MTY3ODYzMzYwMH0.Y-g-vYhC_wz-Z_g-vYhC_wz-Z_g-vYhC_wz-Z_g-vYg");
      
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);

      const shift1 = await Slot.findByPk(shift1Id);
      const shift2 = await Slot.findByPk(shift2Id);

      expect(shift1.status).toBe("ACTIVE");
      expect(shift2.status).toBe("LOCKED");
    });

    test("should not allow biometric capture for a locked shift", async () => {
      const res = await request(app)
        .post("/api/v1/biometric/capture")
        .set("Authorization", "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjE3YjQyMDYwLTQzYjYtNGU4Yy04ODRjLTQ3OTYwYjA0NzY5YSIsImlhdCI6MTY3ODYzMzYwMH0.Y-g-vYhC_wz-Z_g-vYhC_wz-Z_g-vYhC_wz-Z_g-vYg")
        .send({ candidateId: "c1", examId, operatorId: "o1", faceImage: "img", fingerprintTemplate: "tmpl", slotId: shift2Id });

      expect(res.statusCode).toEqual(403);
      expect(res.body.message).toBe("Shift is not active. Biometric capture is not allowed.");
    });
  });

  describe("OMR Barcode Scanning Feature", () => {
    const candidateId = "c9a4f22a-4077-4313-a12b-9e36be85a248";
    const rollNo = "12345";
    const expectedBarcode = "OMR12345";

    beforeAll(async () => {
      await Candidate.create({ id: candidateId, rollNo, name: "Test Candidate", omrNo: "123", fatherName: "Test Father", dob: "2000-01-01", gender: "Male", centreCode: "123", examId: "e8a4f22a-4077-4313-a12b-9e36be85a248" });
      await OMR.create({ candidateId, expectedBarcode });
    });

    test("should validate a correct OMR barcode", async () => {
      const res = await request(app)
        .post("/api/v1/omr/scan")
        .set("Authorization", "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjE3YjQyMDYwLTQzYjYtNGU4Yy04ODRjLTQ3OTYwYjA0NzY5YSIsImlhdCI6MTY3ODYzMzYwMH0.Y-g-vYhC_wz-Z_g-vYhC_wz-Z_g-vYhC_wz-Z_g-vYg")
        .send({ rollNo, scannedBarcode: expectedBarcode });

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
    });

    test("should not validate an incorrect OMR barcode", async () => {
      const res = await request(app)
        .post("/api/v1/omr/scan")
        .set("Authorization", "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjE3YjQyMDYwLTQzYjYtNGU4Yy04ODRjLTQ3OTYwYjA0NzY5YSIsImlhdCI6MTY3ODYzMzYwMH0.Y-g-vYhC_wz-Z_g-vYhC_wz-Z_g-vYhC_wz-Z_g-vYg")
        .send({ rollNo, scannedBarcode: "INCORRECT" });

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
    });
  });
});
