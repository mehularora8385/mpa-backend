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

// Logout all operators
exports.logoutAllOperators = async () => {
  try {
    // Update all active operators to inactive status
    const result = await db.query(
      'UPDATE operators SET status = $1, last_logout = $2 WHERE status = $3',
      ['Inactive', new Date(), 'Active']
    );
    
    return {
      operatorsCount: result.rowCount || 0
    };
  } catch (error) {
    throw new Error('Failed to logout all operators: ' + error.message);
  }
};
