const fs = require("fs");
const path = require("path");
const isDevelopment = process.env.NODE_ENV !== "production";

//`src/utils/databases/${collection}.json`
module.exports = {
  getItem: (collection, code) => {
    return new Promise((resolve, reject) => {
      let databasePath = "";
      if (isDevelopment) {
        databasePath = `src/utils/databases/${collection}.json`;
      } else {
        databasePath = path.join(
          path.dirname(__dirname),
          "resources",
          "databases",
          `${collection}.json`
        );
      }
      let file = fs.readFileSync(databasePath);
      let parsedInfo = JSON.parse(file);
      let data = parsedInfo.data;
      for (let i = 0; i < data.length; i++) {
        if (data[i].code === code) {
          resolve(data[i]);
        }
      }
      reject("Code not found");
    });
  }
};
