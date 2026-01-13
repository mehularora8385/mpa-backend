const db = require("../config/database");
const csv = require("csv-parser");
const fs = require("fs");

exports.bulkUpload = async (file) => {
  const results = [];
  fs.createReadStream(file.path)
    .pipe(csv())
    .on("data", (data) => results.push(data))
    .on("end", async () => {
      // Logic to insert operators into the database
      console.log(results);
    });
  return { message: "Upload successful" };
};
