module.exports = {
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        productName: 'Teambar',
        win: {
          target: 'portable'
        },
        compression: 'maximum'
      }
    }
  }
}
