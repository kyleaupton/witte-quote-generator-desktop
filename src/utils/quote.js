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
  }
};
