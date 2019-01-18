var docTitle = function() {
    var d = new Date()
    var y = d.getFullYear().toString()
    var m = (d.getMonth() + 1).toString()
    m = (m.length == 1 ? '0' + m : m)
    var day = d.getDate().toString()
    day = (day.length == 1 ? '0' + day : day)
    var t = d.toTimeString()
    var ts = t.split(' ')[0].split(':').join('')
    var title = y + m + day + ts + '.pdf'
    return title
}

var init = function() {
    var { remote } = require('electron')
    var content = remote.getGlobal('previewHTML').content
    var main = document.getElementById('main')
    main.innerHTML = content
    document.title = docTitle()
}

var showMsgDialog = function(type, title, message) {
    var { remote } = require('electron')
    var option = {
        type: type,
        title: title,
        message: message,
        buttons: ['确定']
    }
    var infoResponse = remote.dialog.showMessageBox(option)
    if (infoResponse == 0) {
        remote.getCurrentWindow().close()
    }
}

var outputPDF = function() {
    var { remote } = require('electron')
    var fs = require('fs')
    var contents = remote.getCurrentWebContents()
    contents.printToPDF({}, (error, data) => {
        if (error) {
            throw error
        }
        var docName = './' + document.title
        fs.writeFile(docName, data, (error) => {
            if (error) {
                throw error
            }
            showMsgDialog('info', '导出为PDF', 'PDF导出成功')
        })
    })
}

var output = function() {
    var btnOutput = document.getElementById('id-btn-output')
    btnOutput.addEventListener('click', function() {
        var btns = document.getElementById("id-btns")
        btns.parentNode.removeChild(btns)
        outputPDF()
    })
}

var closePage = function() {
    var btnCancel = document.getElementById('id-btn-cancel')
    btnCancel.addEventListener('click', function() {
        require('electron').remote.getCurrentWindow().close()
    })
}

var __main = function() {
    init()
    hljs.initHighlightingOnLoad()
    output()
    closePage()
}

__main()
