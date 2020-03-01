/*
 *   This is the file to write and devolop regex expressions to be used in production.
 *   Should be tested with tester.js
 */

const { countries } = require("countries-list");

module.exports = {
  getMetaData: filePath => {
    return new Promise((resolve, reject) => {
      let payload = {
        errorInPath: false,
        company: "",
        quoteNumFromPath: "",
        quoteDescFromPath: ""
      };

      // Company
      let company = filePath.match(/(2 - Quotes).+?\//g);
      if (!company) {
        payload.errorInPath = true;
        resolve(payload);
        return;
      }
      company[0] = company[0].replace("2 - Quotes/", "");
      company[0] = company[0].replace("/", "");
      payload.company = company[0];

      // Quote number
      let quoteNum = filePath.match(/\d{2}Q\d{3}/g);
      payload.quoteNumFromPath = quoteNum[0];

      // Quote description
      let quoteDesc = filePath.match(/\d{2}Q\d{3}.*?\//g);
      quoteDesc[0] = quoteDesc[0].replace(payload.quoteNumFromPath + "-", "");
      quoteDesc[0] = quoteDesc[0].replace("/", "");
      payload.quoteDescFromPath = quoteDesc[0];

      resolve(payload);
    });
  },

  correctFilePath: path => {
    // Check to see if quote is in the dropbox folder. Checks for 'Dropbox' and '2 - Quotes'
    if (!path.match(/Dropbox\/2 - Quotes/g)) {
      return false;
    }

    // Get rid of extras
    path = path.replace(/.+2 - Quotes\//g, "");
    path = path.replace(/\/(?:.(?!\/))+$/g, "");

    let pathArr = path.split("/");

    /*
     *  Check common mistakes in the company region.
     */

    let company = pathArr[0];

    /*
     *  Checks for extranious hyphens. Will match to the following.
     *  BASF-MI-City-Extra
     */
    if (company.match(/.+-.+-.+-/g)) {
      return false;
    }

    /*
     *  Checks for company. Will PASS (return true) with the following.
     *
     *  a - company-st
     *  b - company-st-city
     *  c - company-country
     *  d - comany-country-city
     *
     *  Anything else will return false.
     */

    let a = /^.+-[A-Z]{2}$/g;
    let b = /^.+-[A-Z]{2}-.+$/g;
    let c = "";
    let d = /^.+-.{3,}-.+$/g;

    /*
     *  Checks for spaces between hyphen and company/state. Will match to the following.
     *  BASF - MI
     *  BASF -MI
     *  BASF- MI
     */
    if (company.match(/.+(\s-|-\s).+/g)) {
      return false;
    }

    return true;
  }
};
