
const db=require("../config/db");

exports.getCandidates=(req,res)=>{
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
  res.json({msg:"PRESENT SAVED"});
 });
};

exports.verifyCandidate=(req,res)=>{
 const {roll}=req.body;
 db.query("UPDATE candidates SET status='VERIFIED' WHERE roll_no=?",[roll],
 (e)=>{
  if(e) return res.status(500).json(e);
  res.json({msg:"VERIFIED"});
 });
};

exports.dashboardStats=(req,res)=>{
 const exam=req.query.exam;
 db.query(`SELECT
 (SELECT COUNT(*) FROM candidates WHERE exam_code=?) total,
 (SELECT COUNT(*) FROM candidates WHERE exam_code=? AND present=1) present,
 (SELECT COUNT(*) FROM candidates WHERE exam_code=? AND status='VERIFIED') verified`,
 [exam,exam,exam],(e,r)=>{
  if(e) return res.status(500).json(e);
  res.json(r[0]);
 });
};

exports.clientDashboard=(req,res)=>{
 const exam=req.params.exam;
 db.query("SELECT centre_code,COUNT(*) total FROM candidates WHERE exam_code=? GROUP BY centre_code",
 [exam],(e,r)=>{
  if(e) return res.status(500).json(e);
  res.json(r);
 });
};

exports.reports=(req,res)=>{
 const type=req.params.type;
 let q="SELECT * FROM candidates";
 if(type=="present") q+=" WHERE present=1";
 if(type=="verified") q+=" WHERE status='VERIFIED'";
 db.query(q,(e,r)=>{
  if(e) return res.status(500).json(e);
  res.json(r);
 });
};

exports.exportCSV=(req,res)=>{
 db.query("SELECT * FROM candidates",(e,r)=>{
  if(e) return res.status(500).json(e);
  res.json(r);
 });
};

exports.syncAll=(req,res)=>{
 res.json({msg:"SYNC COMMAND SENT"});
};

exports.logoutAll=(req,res)=>{
 res.json({msg:"LOGOUT COMMAND SENT"});
};
