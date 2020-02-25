// if (typeof require !== "undefined") xlsx = require("xlsx");
// import ExcelJS from "exceljs/dist/es5/exceljs.browser";
const Excel = require("exceljs");
const fs = require("fs");

module.exports = {
  writeXlsxFile: data => {
    let workbook = new Excel.Workbook();

    let workingDirctory = data.filePath.replace(/\/(?:.(?!\/))+$/g, "");
    let outputFileName =
      data.company +
      "-" +
      data.quoteNumFromUser +
      "-" +
      data.quoteDesc +
      ".xlsx";

    workbook.xlsx
      .readFile(`src/utils/spreadsheets/${data.totalLines}.xlsx`)
      .then(() => {
        let worksheet = workbook.getWorksheet(1);
        let cell = worksheet.getCell("B8");
        cell.value = "This is a test";

        workbook.xlsx
          .writeFile(workingDirctory + "/" + outputFileName)
          .then(() => {
            console.log("Wrote file");
          })
          .catch(reason => {
            console.log("Error\n" + reason);
          });
      })
      .catch(reason => {
        console.log("Error\n" + reason);
      });
  }
};
