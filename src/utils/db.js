// let db = new loki("src/utils/databases/main.db", {
//   autoload: true,
//   autoloadCallback: databaseInitialize,
//   autosave: true,
//   autosaveInterval: 4000
// });

// function databaseInitialize() {
//   if (!db.getCollection("materials")) {
//     db.addCollection("materials");
//   }
//   programLogic();
// }

// function programLogic() {
//   let materials = db.getCollection("materials");
//   //   materials.insert({
//   //     code: "000",
//   //     value: "This is a test"
//   //   });
//   console.log(materials.findOne({}));
// }

// let db = new loki("src/utils/databases/main.db");
// db.loadDatabase({}, () => {
//   let materials = db.getCollection("materials");
//   //   materials.insert({
//   //     code: "001",
//   //     value: "This is also a test"
//   //   });
//   console.log(materials.find({}));
// });

// module.exports = {
//   getItem: (collection, item) => {
//     return new Promise((resolve, reject) => {
//       let db = new loki("src/utils/databases/main.db");
//       db.loadDatabase({}, async () => {
//         let temp = db.getCollection(collection);
//         let foundItem = temp.findOne(item);
//         if (foundItem) {
//           resolve(foundItem);
//         } else {
//           reject(foundItem);
//         }
//       });
//     });
//   },

//   insertItem: (collection, item) => {
//     let db = new loki("src/utils/databases/main.db");
//     db.loadDatabase({}, () => {
//       let temp = db.getCollection(collection);
//       let insertedItem = temp.insert(item);
//       if (insertedItem) {
//         console.log("Item inserted!");
//       } else {
//         console.log("error");
//       }
//       db.save();
//     });
//   },

//   removeItem: (collection, item) => {
//     let db = new loki("src/utils/databases/main.db");
//     db.loadDatabase({}, () => {
//       let temp = db.getCollection(collection);
//       let itemToRemove = temp.findOne(item);
//       temp.remove(itemToRemove);
//       db.save();
//     });
//   },

//   clearCollection: collection => {
//     let db = new loki("src/utils/databases/main.db");
//     db.loadDatabase({}, () => {
//       let temp = db.getCollection(collection);
//       temp.clear();
//       db.save();
//     });
//   },

//   countCollection: collection => {
//     return new Promise((resolve, reject) => {
//       let db = new loki("src/utils/databases/main.db");
//       db.loadDatabase({}, () => {
//         let temp = db.getCollection(collection);
//         resolve(temp.find({}).length);
//       });
//     });
//   }
// };

const fs = require("fs");

module.exports = {
  getItem: (collection, code) => {
    return new Promise((resolve, reject) => {
      let file = fs.readFileSync(`src/utils/databases/${collection}.json`);
      let parsedInfo = JSON.parse(file);
      let data = parsedInfo.data;
      for (let i = 0; i < data.length; i++) {
        if (data[i].code === code) {
          resolve(data[i]);
        }
      }
      reject("Code not found");
    });
  }
};
