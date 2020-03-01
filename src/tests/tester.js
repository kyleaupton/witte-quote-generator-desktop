/*
 *   This is the file to run test.js
 */

const { correctFilePath } = require("./test");
const { checkPath, checkCompany, checkMeta } = require("./pathValidator");
let path =
  "/Users/kyleupton/Dropbox/2 - Quotes/BASF-MI/19Q383-CHEM 0.2-9-5.5 parts/Quotation55400 01 190704.pdf";

console.log(
  checkPath(
    "/Users/kyleupton/Dropbox/2 - Quotes/BASF -MI/19Q383-CHEM 0.2-9-5.5 parts/Quotation55400 01 190704.pdf"
  )
);
