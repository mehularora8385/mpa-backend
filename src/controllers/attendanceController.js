exports.markPresent = async (req, res) => {
  try {
    return res.json({
      success: true,
      message: "Marked present successfully"
    });
  } catch (err) {
    res.status(500).json({ success:false, error: err.message });
  }
};

exports.verifyCandidate = async (req, res) => {
  try {
    return res.json({
      success: true,
      message: "Candidate verified"
    });
  } catch (err) {
    res.status(500).json({ success:false, error: err.message });
  }
};

exports.correct = async (req, res) => {
  try {
    return res.json({
      success: true,
      message: "Correction done"
    });
  } catch (err) {
    res.status(500).json({ success:false, error: err.message });
  }
};

