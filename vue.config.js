module.exports = {
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        appId: "com.electron.witte-quote-generator",
        mac: {
          category: "public.app-category.utilities",
          target: "dmg",
          darkModeSupport: false,
          icon: "build/icons/icon.icns"
        },
        files: ["**/*", "src/utils/databases", "src/utils/spreadsheets"]
      }
    }
  }
};
