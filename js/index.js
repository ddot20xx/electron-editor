var marked = require('./js/marked.min')
marked.setOptions({
    renderer: new marked.Renderer(),
    highlight: function(code) {
        return hljs.highlightAuto(code).value
    },
    pedantic: false,
    gfm: true,
    tables: true,
    breaks: false,
    sanitize: false,
    smartLists: true,
    smartypants: false,
    xhtml: false
})
window.$ = window.jQuery = require('./js/jquery')
var currentFile = null
var saved = true

var readText = function(f) {
    var fs = require('fs')
    return fs.readFileSync(f, 'utf8')
}

var contentRender = function() {
    var content = $('#editor').val()
    $('#preview').html(marked(content))
    // 高亮代码
    // $('pre code').each(function(i, block) {
    //     hljs.highlightBlock(block)
    // })
}

var saveFile = function(path, data) {
    var fs = require('fs')
    fs.writeFileSync(path, data)
}

var filePath = function() {
    var { remote } = require('electron')
    if (!currentFile) {
        var file = remote.dialog.showSaveDialog(remote.getCurrentWindow(), {
            filters: [
                { name: "Text Files", extensions: ['txt'] },
                { name: "Markdown Files", extensions: ['md'] },
                { name: 'All Files', extensions: ['*'] }
            ]
        })
        if (file) {
            currentFile = file
        }
    }
    return currentFile
}

var saveCurrentFile = function() {
    var { remote } = require('electron')
    // if (!currentFile) {
    //     var file = remote.dialog.showSaveDialog(remote.getCurrentWindow(), {
    //         filters: [
    //             { name: "Text Files", extensions: ['txt'] },
    //             { name: "Markdown Files", extensions: ['md'] },
    //             { name: 'All Files', extensions: ['*'] }
    //         ]
    //     })
    //     if (file) {
    //         currentFile = file
    //     }
    // }
    var path = filePath()
    if (path) {
        var data = $('#editor').val()
        saveFile(path, data)
        saved = true
        document.title = currentFile
    }
}

var needSaved = function() {
    var { remote } = require('electron')
    if (saved) {
        return
    }
    var response = remote.dialog.showMessageBox(remote.getCurrentWindow(), {
        title: 'ddotEditor',
        message: '是否保存当前文档？',
        type: 'question',
        buttons: [ '是', '否' ]
    })
    if (response == 0) {
        saveCurrentFile()
    }
}

var scrollSync = function() {
    var $scrollDivs = $('textarea#editor, div#preview')
    var sync = function(e) {
       var $other = $scrollDivs.not(this).off('scroll')
       var other = $other.get(0)
       var percentage = this.scrollTop / (this.scrollHeight - this.offsetHeight)
       other.scrollTop = percentage * (other.scrollHeight - other.offsetHeight)
       setTimeout(function(){
           $other.on('scroll', sync)
       }, 200)
    }
    $scrollDivs.on('scroll', sync)
}

var createNewFile = function() {
    currentFile = null
    saved = true
    document.title = '新文档'
    $('#editor').val('')
    $('#preview').html('')
}

var openFile = function() {
    var { remote } = require('electron')
    var files = remote.dialog.showOpenDialog(remote.getCurrentWindow(), {
        filters: [
            { name: 'Text Files', extensions: ['txt'] },
            { name: 'Markdown Files', extensions: ['md'] },
            { name: 'All Files', extensions: ['*'] }
        ],
        properties: ['openFile']
    })
    if (files) {
        currentFile = files[0]
        var txtRead = readText(currentFile)
        $('#editor').val(txtRead)
        contentRender()
        document.title = currentFile
        saved = true
    }
}

var openPreviewWindow = function(content) {
    // 创建一个窗口，加载预览页面，页面中有两个按钮和 content 。
    // 确定：点击调用printToPDF(), 完成后提示信息。
    // 取消：关闭该窗口。
    var { remote } = require('electron')
    var win = new remote.BrowserWindow({width: 780, height: 800 })
    win.loadFile('preview.html')
    // win.webContents.openDevTools()
    remote.getGlobal('previewHTML').content = content
}

var setFileMenu = function() {
    // 文件菜单
    const { dialog, ipcRenderer, remote } = require('electron')
    ipcRenderer.on('file-action', (event, arg) => {
        switch (arg) {
            // 新建文件
            case 'new-file':
                needSaved()
                createNewFile()
                break
            // 打开文件
            case 'open-file':
                needSaved()
                openFile()
                break
            // 保存文件
            case 'save-file':
                saveCurrentFile()
                break
            // 另存为
            case 'save-file-as':
                currentFile = null
                saveCurrentFile()
                break
            // 导出为PDF
            case 'print-to-pdf':
                var output = $('#preview').html()
                openPreviewWindow(output)
                // var pdfStyle = {
                //     width: '90%',
                //     padding: '10px',
                //     margin: '0 auto'
                // }
                // $('#main').html(output).css(pdfStyle)
                // printToPDF()
                break
        }
    })
}

var __main = function() {
    // markdown 渲染
    $('#editor').keyup(function() {
        contentRender()
        // 更新文档标题状态
        if (saved) {
            saved = false
            document.title += ' *'
        }
    })

    // 同步滚动
    scrollSync()

    // 设置文件菜单的方法
    setFileMenu()
}

__main()
