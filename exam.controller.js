
const db = require("../config/db");
const csv = require("csv-parser");
const fs = require("fs");

exports.createExam = (req, res) => {
  const { exam_name, exam_code } = req.body;
  db.query(
    "INSERT INTO exams (exam_name, exam_code, status) VALUES (?, ?, 'ACTIVE')",
    [exam_name, exam_code],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Exam created successfully" });
    }
  );
};

exports.getExams = (req, res) => {
  db.query("SELECT * FROM exams", (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
};

exports.updateStatus = (req, res) => {
  const id = req.params.id;
  const { status } = req.body;
  db.query(
    "UPDATE exams SET status=? WHERE id=?",
    [status, id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Status updated" });
    }
  );
};

exports.uploadCandidates = (req, res) => {
  const file = req.file.path;
  let results = [];

  fs.createReadStream(file)
    .pipe(csv())
    .on("data", (data) => results.push(data))
    .on("end", () => {
      results.forEach((row) => {
        db.query(
          "INSERT INTO candidates (name, roll_no, exam_code) VALUES (?, ?, ?)",
          [row.name, row.roll_no, row.exam_code]
        );
      });
      res.json({ message: "Candidates uploaded" });
    });
};
