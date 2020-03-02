const fs = require("fs");
const path = require("path");
const os = require("os");

const file = "/Users/kyleupton/Documents/Quotation55400 01 190704.pdf";
const dir =
  "/Users/kyleupton/Dropbox/2 - Quotes/Test-EX/20Q123-This is a test/Quotation55400 01 190704.pdf";

const buffer = fs.readFileSync(
  "/Users/kyleupton/Documents/Quotation55400 01 190704.pdf"
);
let arraybuffer = Uint8Array.from(buffer).buffer;
