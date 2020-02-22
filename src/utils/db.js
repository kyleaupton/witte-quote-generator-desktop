module.exports = {
  getItem: (file, item) => {
    return new Promise((resolve, reject) => {
      let Datastore = require("nedb"),
        db = new Datastore({ filename: `src/utils/databases/${file}.db` });
      db.loadDatabase();
      db.findOne(item, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  },
  clearDB: file => {
    let Datastore = require("nedb"),
      db = new Datastore({ filename: `src/utils/databases/${file}.db` });
    db.loadDatabase();
    db.remove({}, { multi: true }, function(err, numRemoved) {
      console.log(`Database: Removed ${numRemoved} entries from ${file} db.`);
    });
  }
};
