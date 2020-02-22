const PDFJS = require("pdfjs-dist");
const { getItem } = require("./db");

function getPdfText(path) {
  return new Promise((resolve, reject) => {
    // const PDFJS = require("pdfjs-dist");
    PDFJS.workerSrc = "./node_modules/pdfjs-dist/build/pdf.worker.entry.js";

    /**
     * Retrieves the text of a specif page within a PDF Document obtained through pdf.js
     *
     * @param {Integer} pageNum Specifies the number of the page
     * @param {PDFDocument} PDFDocumentInstance The PDF document obtained
     **/
    function getPageText(pageNum, PDFDocumentInstance) {
      // Return a Promise that is solved once the text of the page is retrieven
      return new Promise(function(resolve, reject) {
        PDFDocumentInstance.getPage(pageNum).then(function(pdfPage) {
          // The main trick to obtain the text of the PDF page, use the getTextContent method
          pdfPage.getTextContent().then(function(textContent) {
            var textItems = textContent.items;
            var finalString = "";

            // Concatenate the string of the item to the final string
            for (var i = 0; i < textItems.length; i++) {
              var item = textItems[i];

              finalString += item.str + " ";
            }

            // Solve promise with the text retrieven from the page
            resolve(finalString);
          });
        });
      });
    }

    /**
     * Extract the test from the PDF
     */

    let output = "";
    PDFJS.getDocument(path).then(
      async function(PDFDocumentInstance) {
        var totalPages = PDFDocumentInstance.numPages;
        var pageNumber = 1;

        for (let i = 1; i <= totalPages; i++) {
          let getPagePromise = new Promise((resolve, reject) => {
            getPageText(i, PDFDocumentInstance)
              .then(textPage => {
                resolve(textPage);
              })
              .catch(reason => {
                reject(reason);
              });
          });
          await getPagePromise.then(data => {
            output += data;
          });
        }
        resolve(output);
      },
      function(reason) {
        // PDF loading error
        console.error(reason);
      }
    );
  });
}

function getParts(pdfFile) {
  return new Promise(async (resolve, reject) => {
    let getPdfTextPromise = new Promise((resolve, reject) => {
      getPdfText(pdfFile)
        .then(data => {
          resolve(data);
        })
        .catch(reason => {
          reject(reason);
        });
    });
    let pdfText = "";
    await getPdfTextPromise.then(data => {
      pdfText = data;
    });
    let parts = [];

    // if (debug) {
    //   let pdfText = "";
    //   let getPdfTextPromise = new Promise((resolve, reject) => {
    //     getPdfText("src/pdf-api/Quotation55419 01 190708.pdf")
    //       .then(data => {
    //         resolve(data);
    //       })
    //       .catch(reason => {
    //         reject(reason);
    //       });
    //   });
    //   await getPdfTextPromise.then(data => {
    //     pdfText = data;
    //   });
    // }

    // Get all parts
    let rawParts = pdfText.match(/\s\d{2,3}\s+\d{6}(.|\n)+?Discount/gm);

    // Transverse raw parts and get info
    for (let i = 0; i < rawParts.length; i++) {
      let payload = {
        description: null,
        material: null,
        unitPrice: null,
        qty: null,
        surcharge: 1,
        enPartNum: {
          partNum: null,
          isEn: true
        },
        dePartNum: null,
        itemPos: null
      };

      // Item position
      let pos = rawParts[i].match(/\d{2,3}\s\d{6}/g);
      pos[0] = pos[0].substring(0, pos[0].length - 8);
      payload.itemPos = pos[0];

      // Item de part num
      let dePartNum = rawParts[i].match(/\d{2,3}\s\d{6}/g);
      dePartNum[0] = dePartNum[0].substring(
        dePartNum[0].length - 6,
        dePartNum[0].length
      );
      payload.dePartNum = dePartNum[0];

      // Item qty
      let qty = rawParts[i].match(/\d\s+PC/g);
      qty[0] = qty[0].replace("PC", "");
      qty[0] = qty[0].trim();
      payload.qty = qty[0];

      // Item unit price
      let unitPrice = rawParts[i].match(/PC.+\d.+EUR\W+\d/g);
      unitPrice[0] = unitPrice[0].substring(0, unitPrice[0].length - 1); // Remove closing barrier
      unitPrice[0] = unitPrice[0].replace("EUR", "");
      unitPrice[0] = unitPrice[0].replace("PC", "");
      unitPrice[0] = unitPrice[0].replace(".", "/"); // Assign all '.' to '/' as a temp, then ',' are assigned to '.', finally replace '/' with ','.
      unitPrice[0] = unitPrice[0].replace(",", ".");
      unitPrice[0] = unitPrice[0].replace("/", ",");
      unitPrice[0] = unitPrice[0].trim();
      payload.unitPrice = unitPrice[0];

      // Old material number or en part number
      let enPartNum = rawParts[i].match(/number:.+\s/g);
      if (enPartNum) {
        enPartNum[0] = enPartNum[0].replace("number:", "");
        enPartNum[0] = enPartNum[0].trim();
        payload.enPartNum.partNum = enPartNum[0];
      } else {
        // This is because some items don't recieve a en part number
        payload.enPartNum.partNum = dePartNum;
        payload.enPartNum.isEn = false;
      }

      if (payload.enPartNum.isEn) {
        // Get material from db.
        let materialCode = payload.enPartNum.partNum.substring(
          payload.enPartNum.partNum.length - 3,
          payload.enPartNum.partNum.length
        );
        let getMaterialPromise = new Promise((resolve, reject) => {
          getItem("material-code", { code: materialCode })
            .then(data => {
              resolve(data);
            })
            .catch(reason => {
              reject(reason);
            });
        });

        await getMaterialPromise.then(data => {
          if (data) {
            if (data.value.match(/A4/g)) {
              payload.surcharge = 1.0565;
            }
            payload.material = data.value;
          } else {
            payload.material = "PLEASE FILL IN"; // Because it wasn't found in the database.
          }
        });

        // Get product description (lol spelling);
        let descriptionCode = payload.enPartNum.partNum.substring(0, 3);
        let getDescriptionPromise = new Promise((resolve, reject) => {
          getItem("product-code", { code: descriptionCode })
            .then(data => {
              resolve(data);
            })
            .catch(reason => {
              reject(reason);
            });
        });

        await getDescriptionPromise.then(data => {
          if (data) {
            payload.description = data.value;
          } else {
            payload.description = "PLEASE FILL IN";
          }
        });
      } else {
        // This is because some parts don't have a en part number.
        payload.material = "PLEASE FILL IN";
        payload.description = "PLEASE FILL IN";
      }
      parts.push(payload);
    }

    resolve(parts);
  });
}

module.exports = { getParts };
// export default getPdfText;
