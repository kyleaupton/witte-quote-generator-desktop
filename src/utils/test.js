const { clearDB, getItem } = require("./db");
if (typeof require !== "undefined") xlsx = require("xlsx");

// clearDB("material-code");

// let workbook = xlsx.readFile(
//   "src/utils/spreadsheets/material-code-last-3.xlsx"
// );
// let sheet = workbook.SheetNames[0];
// let worksheet = workbook.Sheets[sheet];

// let Datastore = require("nedb"),
//   db = new Datastore({ filename: `src/utils/databases/material-code.db` });
// db.loadDatabase(function(err) {
//   console.log(`Database: Loaded database successfuly.`);
// });

// for (let i = 1; i < 494; i++) {
//   let cell_a = worksheet["A" + i];
//   let cell_b = worksheet["B" + i];
//   let value_a = cell_a ? cell_a.v : undefined;
//   let value_b = cell_b ? cell_b.v : undefined;

//   if (value_a !== undefined && value_b !== undefined) {
//     if (typeof value_a === "number") {
//       value_a = value_a + "";
//     }
//     if (typeof value_b === "number") {
//       value_b = value_b + "";
//     }
//     let payload = {
//       code: value_a,
//       value: value_b
//     };
//     db.insert(payload, function(err, newDoc) {
//       if (err) {
//         throw err;
//       }
//       console.log(`Database: Successfully added item.`);
//     });
//   }
// }

getItem("product-code", { code: "284" }).then(data => {
  console.log(data);
});
