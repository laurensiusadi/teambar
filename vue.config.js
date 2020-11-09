module.exports = {
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      builderOptions: {
        productName: "Teambar",
        appId: "us.laurensi.teambar",
        win: {
          icon: "public/icons/icon.ico",
          target: [
            "portable",
          ]
        }
      }
    }
  }
}