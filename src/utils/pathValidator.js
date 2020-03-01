const { countries } = require("countries-list");

module.exports = {
  checkPath: path => {
    let payload = {
      errorInPath: false,
      isInDropbox: true,
      errors: []
    };

    if (!path.match(/Dropbox\/2 - Quotes/g)) {
      payload.isInDropbox = false;
      return payload;
    }

    // Remove left part of path
    path = path.replace(/.+Dropbox\/2 - Quotes\//g, "");
    // Remove right part of path
    path = path.replace(/\/(?:.(?!\/))+$/g, "");

    path = path.split("/");

    let comanyPayload = module.exports.checkCompany(path[0]);
    let metaPayload = module.exports.checkMeta(path[1]);

    if (comanyPayload.errorInCompany) {
      payload.errorInPath = true;
      for (let i = 0; i < comanyPayload.errors.length; i++) {
        payload.errors.push({
          errorType: "company",
          error: comanyPayload.errors[i]
        });
      }
    }

    if (metaPayload.errorInMeta) {
      payload.errorInPath = true;
      for (let i = 0; i < metaPayload.errors.length; i++) {
        payload.errors.push({
          errorType: "meta",
          error: metaPayload.errors[i]
        });
      }
    }

    return payload;
  },

  checkCompany: company => {
    let payload = {
      errorInCompany: false,
      errors: []
    };
    /*
     *  Checks for extranious hyphens. Will match to the following.
     *  BASF-MI-City-Extra
     */
    if (company.match(/.+-.+-.+-/g)) {
      payload.errorInCompany = true;
      payload.errors.push(
        "Too many hyphens. Only the following is allowed:\n\nCompany-State\nCompany-State-City\nCompany-Country\nCompany-Country-City"
      );
    }

    /*
     *  Checks for company. Will PASS with the following.
     *
     *  a - company-st
     *  b - company-st-city
     *  c - company-country
     *  d - comany-country-city
     *
     *  Anything else will return false.
     */

    function validCountry(country) {
      let countriesAsString = JSON.stringify(countries);
      if (countriesAsString.includes(country)) {
        return true;
      }
      return false;
    }

    if (company.match(/^[^-]+-[^-]{3,}$/g) && !company.match(/(\s-|-\s)/g)) {
      let temp = company;
      temp = temp.replace(/^.+?-/g, "");
      if (!validCountry(temp)) {
        payload.errorInCompany = true;
        payload.errors.push("Company seems to have an invalid country.");
      }
    } else if (
      company.match(/^[^-]+-[^-]{3,}-[^-]+$/g) &&
      !company.match(/(\s-|-\s)/g)
    ) {
      let temp = company;
      temp = temp.replace(/^.+?-/g, "");
      temp = temp.replace(/-.+$/g, "");
      if (!validCountry(temp)) {
        payload.errorInCompany = true;
        payload.errors.push("Company seems to have an invalid country.");
      }
    }

    /*
     *  Checks for spaces between hyphen and company/state. Will match to the following.
     *  BASF - MI
     *  BASF -MI
     *  BASF- MI
     */
    if (company.match(/.+(\s-|-\s).+/g)) {
      payload.errorInCompany = true;
      payload.errors.push(
        "There is a space before, after, or on both sides of a hyphen next to the company name."
      );
    }

    return payload;
  },

  checkMeta: meta => {
    let payload = {
      errorInMeta: false,
      errors: []
    };

    if (meta.match(/(\s-|-\s)/g)) {
      payload.errorInMeta = true;
      payload.errors.push(
        "There is a space before, after, or on both sides of a hyphen next to the quote number."
      );
    }

    // Check for proper quote number
    let quoteNum = meta.replace(/-.+$/g, "");
    if (quoteNum.match(/^\d{2}Q\d{3}R\d$/g)) {
      payload.errorInMeta = true;
      payload.errors.push("Quote number has revision number in it.");
    }

    return payload;
  }
};
