
const db = require("../config/db");

exports.verifyCandidate = (req, res) => {
  const { roll_no, exam_code, centre_code, face, fingerprint, omr } = req.body;

  const query = `UPDATE candidates SET 
    face_data=?, fingerprint_data=?, omr_data=?, status='VERIFIED'
    WHERE roll_no=? AND exam_code=? AND centre_code=?`;

  db.query(query, 
    [face, fingerprint, omr, roll_no, exam_code, centre_code],
    (err) => {
      if(err) return res.status(500).json(err);
      res.json({message:"Candidate verified successfully"});
    });
};

exports.getStatus = (req, res) => {
  const roll = req.params.roll;
  db.query("SELECT status FROM candidates WHERE roll_no=?", [roll],
    (err,result)=>{
      if(err) return res.status(500).json(err);
      res.json(result[0]);
    });
};
