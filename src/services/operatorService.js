const db = require("../config/database");
const csv = require("csv-parser");
const fs = require("fs");
const Operator = require("../models/Operator");

exports.bulkUpload = (file) => {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(file.path)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", async () => {
        try {
          // Assuming the CSV has columns: operatorId, name, examId, centreCode, mobile
          await Operator.bulkCreate(results);
          fs.unlinkSync(file.path); // Clean up the uploaded file
          resolve({ success: true, message: `${results.length} operators uploaded successfully.` });
        } catch (error) {
          reject(error);
        }
      })
      .on("error", (error) => {
        reject(error);
      });
  });
};
