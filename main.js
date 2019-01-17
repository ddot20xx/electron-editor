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
                role: 'undo',
                accelerator: 'CmdOrCtrl+Z'
            },
            {
                label: '重复',
                role: 'redo',
                accelerator: 'CmdOrCtrl+Shift+Z'
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
        label: '关于',
        submenu: [
            {
                label: '关于',
                role: 'help',
                click () {
                     require('electron').shell.openExternal('http://www.ddot.cc')
                 }
            }
        ]
    }
]

var customMenus = function(win) {
    const menu = Menu.buildFromTemplate(template)
    // 自定义菜单项
    menu.items[0].submenu.append(new MenuItem({
        label: '新建',
        click () {
            win.webContents.send('file-action', 'new-file')   // channel, arg
        },
        accelerator: 'CmdOrCtrl+N'
    }))
    menu.items[0].submenu.append(new MenuItem({
        label: '打开',
        click () {
            win.webContents.send('file-action', 'open-file')   // channel, arg
        },
        accelerator: 'CmdOrCtrl+O'
    }))
    menu.items[0].submenu.append(new MenuItem({
        label: '保存',
        click () {
            win.webContents.send('file-action', 'save-file')   // channel, arg
        },
        accelerator: 'CmdOrCtrl+S'
    }))
    menu.items[0].submenu.append(new MenuItem({
        label: '另存为',
        click () {
            win.webContents.send('file-action', 'save-file-as')   // channel, arg
        }
    }))

    menu.items[0].submenu.append(new MenuItem({
        label: '导出为PDF',
        click () {
            win.webContents.send('file-action', 'print-to-pdf')   // channel, arg
        }
    }))

    menu.items[0].submenu.append(new MenuItem({
        label: '退出',
        role: 'quit',
        accelerator: 'CmdOrCtrl+Q'
    }))

    Menu.setApplicationMenu(menu)
}

var createWindow = function() {
    win = new BrowserWindow({ width: 960, height: 520 })

    customMenus(win)

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
