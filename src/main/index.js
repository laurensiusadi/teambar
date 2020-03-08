'use strict'

const { Menu } = require('electron')
const path = require('path')
const { menubar } = require('menubar')

const isDev = process.env.NODE_ENV === 'development'
const isMac = process.platform === 'darwin'

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (!isDev) {
  global.__static = path.join(__dirname, '/static').replace(/\\/g, '\\\\')
}

const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

let iconFileName = isMac ? 'IconTemplate.png' : 'Icon.png'
let iconRelativePath = `../../${isDev ? '' : 'dist/electron/'}static/${iconFileName}`

let options = {
  icon: path.join(__dirname, iconRelativePath),
  tooltip: 'Team Statusbar',
  index: winURL,
  preloadWindow: true,
  width: 220,
  height: 300,
  resizable: isDev,
  webPreferences: {
    nodeIntegration: true
  }
}

const mb = menubar(options)

mb.on('ready', () => {
  console.log('app is ready')

  // Workaround to fix window position when statusbar at top for win32
  if (process.platform === 'win32') {
    if (mb.tray.getBounds().y < 5) {
      mb.setOption('windowPosition', 'trayCenter')
    }
  }

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Quit',
      click: () => {
        mb.app.quit()
      }
    }
  ])
  mb.tray.on('right-click', () => {
    mb.tray.popUpContextMenu(contextMenu)
  })
})

mb.on('after-create-window', () => {
  mb.window.loadURL(`${winURL}`)

  // Open dev tools initially when in development mode
  if (isDev) {
    mb.window.webContents.on('did-frame-finish-load', () => {
      mb.window.webContents.once('devtools-opened', () => {
        mb.window.focus()
      })
      mb.window.webContents.openDevTools()
    })
  }
})

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
