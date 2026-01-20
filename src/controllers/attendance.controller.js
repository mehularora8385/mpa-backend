
const db=require("../config/db");

exports.downloadCandidates=(req,res)=>{
 const {centre,exam}=req.query;
 db.query("SELECT * FROM candidates WHERE centre_code=? AND exam_code=?",
 [centre,exam],(e,r)=>{
  if(e) return res.status(500).json(e);
  res.json(r);
 });
};

exports.markPresent=(req,res)=>{
 const {roll}=req.body;
 db.query("UPDATE candidates SET present=1 WHERE roll_no=?",[roll],
 (e)=>{
  if(e) return res.status(500).json(e);
  res.json({msg:"Marked present"});
 });
};

exports.verifyCandidate=(req,res)=>{
 const {roll}=req.body;
 db.query("UPDATE candidates SET status='VERIFIED' WHERE roll_no=?",[roll],
 (e)=>{
  if(e) return res.status(500).json(e);
  res.json({msg:"Verified"});
 });
};

exports.dashboardStats=(req,res)=>{
 db.query(`SELECT 
 (SELECT COUNT(*) FROM candidates) total,
 (SELECT COUNT(*) FROM candidates WHERE present=1) present,
 (SELECT COUNT(*) FROM candidates WHERE status='VERIFIED') verified`,(e,r)=>{
  if(e) return res.status(500).json(e);
  res.json(r[0]);
 });
};
