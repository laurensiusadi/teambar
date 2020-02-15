'use strict'

import { Menu, protocol, ipcMain } from 'electron'
import { menubar } from 'menubar'
const path = require('path')
const AutoLaunch = require('auto-launch')
const isDevelopment = process.env.NODE_ENV !== 'production'

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([{ scheme: 'app', privileges: { secure: true, standard: true } }])

const iconDefault = path.join(__dirname, '../public/icons/icon.png');

const autoStart = new AutoLaunch({
  name: 'Team Menubar',
  isHidden: true
})

const browserWindowOpts = {
  width: 250,
  height: 350,
  minWidth: 250,
  minHeight: 350,
  resizable: false,
  webPreferences: {
    overlayScrollbars: true,
    nodeIntegration: true
  }
}

const menubarApp = menubar({
  index: process.env.WEBPACK_DEV_SERVER_URL
    ? `${process.env.WEBPACK_DEV_SERVER_URL}`
    : 'app://./index.html',
  icon: iconDefault,
  browserWindow: browserWindowOpts,
  preloadWindow: true
})

menubarApp.on('ready', () => {
  // Workaround to fix window position when statusbar at top for win32
  if (process.platform === 'win32') {
    if (menubarApp.tray.getBounds().y < 5) {
      menubarApp.setOption('windowPosition', 'trayCenter')
    }
  }

  menubarApp.tray.setIgnoreDoubleClickEvents(true)

  ipcMain.on('reopen-window', () => menubarApp.showWindow())
  ipcMain.on('startup-enable', () => autoStart.enable())
  ipcMain.on('startup-disable', () => autoStart.disable())
  ipcMain.on('app-quit', () => menubarApp.app.quit())

  if (isDevelopment && !process.env.IS_TEST) {
    menubarApp.window.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    menubarApp.window.webContents.openDevTools()
  }

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Quit',
      click: () => {
        menubarApp.app.quit()
      }
    }
  ])
  menubarApp.tray.on('right-click', () => {
    menubarApp.tray.popUpContextMenu(contextMenu)
  })

  // menubarApp.window.webContents.on('devtools-opened', () => {
  //   menubarApp.window.setSize(800, 600)
  //   menubarApp.window.center()
  //   menubarApp.window.resizable = true
  // })

  // menubarApp.window.webContents.on('devtools-closed', () => {
  //   const trayBounds = menubarApp.tray.getBounds()
  //   menubarApp.window.setSize(
  //     browserWindowOpts.width,
  //     browserWindowOpts.height
  //   )
  //   menubarApp.positioner.move('trayCenter', trayBounds)
  //   menubarApp.window.resizable = false
  // })
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', data => {
      if (data === 'graceful-exit') {
        menubarApp.app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      menubarApp.app.quit()
    })
  }
}
