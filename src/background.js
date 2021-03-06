"use strict";

import { app, protocol, BrowserWindow } from "electron";
import {
  createProtocol
  /* installVueDevtools */
} from "vue-cli-plugin-electron-builder/lib";
const express = require("express");
const cors = require("cors");
const Excel = require("exceljs");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const isDevelopment = process.env.NODE_ENV !== "production";
const { dialog } = require("electron");
const log = require("electron-log");
import { autoUpdater } from "electron-updater";

autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = "info";
log.info("App starting...");

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { secure: true, standard: true } }
]);

app.setName("Witte Quote Generator");

function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 900,
    height: 550,
    title: "Witte Quote Generator",
    webPreferences: {
      nodeIntegration: true
    }
  });

  win.on("page-title-updated", function(e) {
    e.preventDefault();
  });

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
    if (!process.env.IS_TEST) win.webContents.openDevTools();
  } else {
    createProtocol("app");
    // Load the index.html when not in development
    win.loadURL("app://./index.html");
    autoUpdater.checkForUpdatesAndNotify();
  }

  win.on("closed", () => {
    win = null;
  });
}

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow();
    win.setTitle;
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    // Devtools extensions are broken in Electron 6.0.0 and greater
    // See https://github.com/nklayman/vue-cli-plugin-electron-builder/issues/378 for more info
    // Electron will not launch with Devtools extensions installed on Windows 10 with dark mode
    // If you are not using Windows 10 dark mode, you may uncomment these lines
    // In addition, if the linked issue is closed, you can upgrade electron and uncomment these lines
    // try {
    //   await installVueDevtools()
    // } catch (e) {
    //   console.error('Vue Devtools failed to install:', e.toString())
    // }
  }

  const expressApp = express();

  expressApp.use(cors());
  expressApp.use(bodyParser.urlencoded({ extended: true }));

  expressApp.post("/writefile", (req, res) => {
    let data = JSON.parse(req.headers.data);
    let log = "";

    function writeParts(worksheet) {
      let k = 16; // Determines the row to start. We want parts and rows to increment at the same time. Therefore nested for-loop won't work.
      for (let i = 0; i < data.parts.length; i++) {
        let row = worksheet.getRow(k);

        // Part num
        let partNumCell = row.getCell(1);
        partNumCell.value = data.parts[i].enPartNum.partNum;

        // Description
        let descriptionCell = row.getCell(2);
        descriptionCell.value = data.parts[i].description;

        // Material
        let materialCell = row.getCell(3);
        materialCell.value = data.parts[i].material;

        // Qty
        let qtyCell = row.getCell(6);
        qtyCell.value = parseInt(data.parts[i].qty, 10);

        // German unit price
        let priceCell = row.getCell(10);
        priceCell.value = parseFloat(data.parts[i].unitPrice, 10);

        // surcharge
        let surchargeCell = row.getCell(11);
        surchargeCell.value = parseFloat(data.parts[i].surcharge, 10);

        k++;
      }
    }

    let workbook = new Excel.Workbook();

    let templatePath = "";
    if (isDevelopment) {
      templatePath = `src/utils/spreadsheets/${data.totalLines}.xlsx`;
    } else {
      templatePath = path.join(
        path.dirname(__dirname),
        "resources",
        "spreadsheets",
        `${data.totalLines}.xlsx`
      );
    }

    workbook.xlsx
      .readFile(templatePath)
      .then(() => {
        let worksheet = workbook.getWorksheet(1);

        if (data.errorInPath) {
          writeParts(worksheet);
          var options = {
            title: "Save file",
            defaultPath: "quote_filename",
            buttonLabel: "Save",
            filters: [{ name: "*.xlsx", extensions: ["xlsx"] }]
          };

          dialog
            .showSaveDialog(null, options)
            .then(result => {
              let filename = result.filePath;
              workbook.xlsx
                .writeBuffer()
                .then(buffer => {
                  fs.writeFileSync(filename, buffer);

                  res.send({
                    exit_code: 0,
                    message: `Quote successfully saved to ${filename}`,
                    quote_path: filename
                  });
                })
                .catch(reason => {
                  res.send({
                    exit_code: -2,
                    message: "Error writting buffer to file for error in path",
                    error: reason
                  });
                  console.log(reason);
                });
            })
            .catch(reason => {
              res.send({
                exit_code: -2,
                error: reason,
                message: "Error showing save dialog for error in path"
              });
              console.log(reason);
            });
        } else {
          let workingDirctory = data.filePath.replace(/\/(?:.(?!\/))+$/g, "");
          let outputFileName =
            data.company +
            "-" +
            data.quoteNumFromUser +
            "-" +
            data.quoteDescFromPath +
            ".xlsx";

          let outputFilePath = workingDirctory + "/" + outputFileName;

          // Make sure quote revison doesnt already exist
          if (fs.existsSync(outputFilePath)) {
            res.send({
              exit_code: -1,
              error: "",
              message: "Quote revision already exists."
            });
            return;
          }

          writeParts(worksheet);

          let dateCell = worksheet.getCell("B7");
          dateCell.value = new Date();

          let toCell = worksheet.getCell("B8");
          toCell.value = data.company;

          let attCell = worksheet.getCell("B9");
          attCell.value = data.attention;

          let reCell = worksheet.getCell("B10");
          reCell.value = data.regarding;

          let descCell = worksheet.getCell("B13");
          descCell.value = data.quoteDescForQuote;

          workbook.xlsx
            .writeFile(outputFilePath)
            .then(() => {
              const now = new Date();
              let recentQuote = {
                quoteNumber: data.quoteNumFromUser,
                company: data.company,
                pathToQuote: outputFilePath,
                pathToWorkingDirectory: workingDirctory,
                timeCreated: Math.round(now.getTime() / 1000)
              };
              res.send({
                exit_code: 0,
                message: `Quote successfully saved to ${data.quoteNumFromPath}-${data.quoteDescFromPath}/${outputFileName}`,
                quote_path: outputFilePath,
                recent_quote: JSON.stringify(recentQuote)
              });
            })
            .catch(reason => {
              res.send({
                exit_code: -1,
                error: reason,
                message: "Error writting file when no error in path"
              });
              console.log(reason);
            });
        }
      })
      .catch(reason => {
        res.send({
          exit_code: -1,
          error: reason,
          message: "Error reading template file"
        });
        console.log(reason);
      });
  });

  expressApp.listen(1732, function() {
    console.log("Rest api listening on port 1732.");
  });

  createWindow();
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === "win32") {
    process.on("message", data => {
      if (data === "graceful-exit") {
        app.quit();
      }
    });
  } else {
    process.on("SIGTERM", () => {
      app.quit();
    });
  }
}
