var { app, BrowserWindow, Menu, MenuItem, ipcMain } = require('electron')

let win

// 自定义菜单模板
const template = [
    {
        label: '文件',
        submenu: []
    },
    {
        label: '编辑',
        submenu: [
            {
                label: '撤销',
                role: 'undo'
            },
            {
              label: '重做',
              role: 'redo'
            },
            { type: 'separator' },
            {
                label: '剪切',
                role: 'cut',
                accelerator: 'CmdOrCtrl+X'
            },
            {
                label: '复制',
                role: 'copy',
                accelerator: 'CmdOrCtrl+C'
            },
            {
                label: '粘贴',
                role: 'paste',
                accelerator: 'CmdOrCtrl+V'
            },
            {
                label: '删除',
                role: 'delete'
            },
            {
                label: '全选',
                role: 'selectall',
                accelerator: 'CmdOrCtrl+A'
            }
        ]
    },
    {
        label: '视图',
        submenu: [
            {
                label: '刷新',
                role: 'reload',
                accelerator: 'CmdOrCtrl+R'
            },
            {
              label: '实际大小',
              role: 'resetzoom'
            },
            {
                label: '放大',
                role: 'zoomin'
            },
            {
                label: '缩小',
                role: 'zoomout'
            },
            {
                label: '全屏',
                role: 'togglefullscreen'
            }
        ]
    },
    {
        label: '帮助',
        submenu: [
            {
                label: '更多',
                role: 'help',
                click () {
                     require('electron').shell.openExternal('https://electronjs.org')
                 }
            }
        ]
    }
]


function createWindow () {
    win = new BrowserWindow({ width: 800, height: 600 })

    const menu = Menu.buildFromTemplate(template)
    // 自定义菜单项
    menu.items[0].submenu.append(new MenuItem({
        label: '新建',
        click () {
            win.webContents.send('file-action', 'new-file')   // channel, arg
        },
        accelerator: 'CmdOrCtrl+N'
    }))


    Menu.setApplicationMenu(menu)

    win.loadFile('index.html')

    win.webContents.openDevTools()

    win.on('closed', () => {
        win = null
    })
}

app.on('ready', createWindow)
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})
app.on('activate', () => {
    if (win === null) {
        createWindow()
    }
})


if (process.platform === 'darwin') {
  template.unshift({
    label: app.getName(),
    submenu: [
      { role: 'about' },
      { type: 'separator' },
      { role: 'services' },
      { type: 'separator' },
      { role: 'hide' },
      { role: 'hideothers' },
      { role: 'unhide' },
      { type: 'separator' },
      { role: 'quit' }
    ]
  })

  // Edit menu
  template[1].submenu.push(
    { type: 'separator' },
    {
      label: 'Speech',
      submenu: [
        { role: 'startspeaking' },
        { role: 'stopspeaking' }
      ]
    }
  )

  // Window menu
  template[3].submenu = [
    { role: 'close' },
    { role: 'minimize' },
    { role: 'zoom' },
    { type: 'separator' },
    { role: 'front' }
  ]
}


// 使用 remote 模块进行进程间通信
global.shareObj = {
    test: 'main thread data'
}
