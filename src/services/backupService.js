const { exec } = require("child_process");

exports.trigger = async () => {
  return new Promise((resolve, reject) => {
    exec("pg_dump -U your_user -d your_db > backup.sql", (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return reject(error);
      }
      resolve({ message: "Backup created successfully" });
    });
  });
};
