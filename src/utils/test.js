const {
  getItem,
  removeItem,
  insertItem,
  clearCollection,
  countCollection
} = require("./db");
if (typeof require !== "undefined") xlsx = require("xlsx");
const fs = require("fs");

// let db = new loki("src/utils/databases/main.db", {
//   autoload: true,
//   autoloadCallback: test,
//   autosave: true,
//   autosaveInterval: 4000
// });

// function test() {
//   let workbook = xlsx.readFile(
//     "src/utils/spreadsheets/material-code-last-3.xlsx"
//   );
//   let sheet = workbook.SheetNames[0];
//   let worksheet = workbook.Sheets[sheet];

//   let arr = [];

//   for (let i = 1; i < 494; i++) {
//     let cell_a = worksheet["A" + i];
//     let cell_b = worksheet["B" + i];
//     let value_a = cell_a ? cell_a.v : undefined;
//     let value_b = cell_b ? cell_b.v : undefined;

//     if (value_a !== undefined && value_b !== undefined) {
//       if (typeof value_a === "number") {
//         value_a = value_a + "";
//       }
//       if (typeof value_b === "number") {
//         value_b = value_b + "";
//       }
//       let payload = {
//         code: value_a,
//         value: value_b
//       };
//       arr.push(payload);
//     }
//   }
//   let payload = {
//     materials: arr
//   };
//   fs.writeFileSync(
//     "src/utils/databases/materials.json",
//     JSON.stringify(payload)
//   );
// }

// test();

const { getMetaData } = require("./quote");

getMetaData(
  "/Users/kyleupton/Dropbox/2 - Quotes/Pactiv-Bedford Park-IL/19Q527-EXTRU 371-Cart-PS-1600 pph/Pactiv-IL-19Q527R0-EXTRU 176-PS-1100 pph.doc"
).then(data => {
  console.log(data);
});
