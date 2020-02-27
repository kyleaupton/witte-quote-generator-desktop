module.exports = {
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        productName: "Witte Quote Generator",
        appId: "com.electron.witte-quote-generator",
        mac: {
          category: "public.app-category.utilities",
          target: "dmg",
          darkModeSupport: false,
          icon: "build/icon.icns"
        },
        extraResources: [
          {
            from: "./src/utils/databases",
            to: "resources/databases",
            filter: ["**/*"]
          },
          {
            from: "./src/utils/spreadsheets",
            to: "resources/spreadsheets",
            filter: ["**/*"]
          }
        ]
      }
    }
  }
};
