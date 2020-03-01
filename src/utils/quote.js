const { checkPath } = require("./pathValidator");

module.exports = {
  getMetaData: filePath => {
    return new Promise((resolve, reject) => {
      let payload = {
        errorInPath: false,
        errors: [],
        isInDropbox: true,
        company: "",
        quoteNumFromPath: "",
        quoteDescFromPath: ""
      };

      let validation = checkPath(filePath);

      if (!validation.isInDropbox) {
        payload.isInDropbox = false;
        resolve(payload);
        return;
      } else if (validation.errorInPath) {
        payload.errorInPath = true;
        payload.errors = validation.errors;
        resolve(payload);
        return;
      }

      // Company
      let company = filePath.match(/(2 - Quotes).+?\//g);
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
  }
};
