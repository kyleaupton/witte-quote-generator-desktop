const fs = require("fs");
const { getParts } = require("./pdf");

const pdfPath = "src/utils/Quotation55419 01 190708.pdf";

const dataStream = fs.readFileSync(pdfPath);

getParts(dataStream, pdfPath).then(data => {
  console.log(data);
});
