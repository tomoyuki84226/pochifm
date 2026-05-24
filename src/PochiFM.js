function createPochiFm(setting) {

const app = document.getElementById(setting.rootId);

app.addEventListener("dragover", (e) => {
    e.preventDefault();
});
app.progress = app.querySelector('.progress');
app.fileList = [];
app.waitAction = () => {};


/**
 * Check DOM element is inside class
 * @param {element} node 
 * @param {string} className
 * @returns bool
 */
app.isInsideClass = function(node, className) {
    if (!node) return false;
    if (node.classList?.contains(className)) return true;
    return app.isInsideClass(node.parentNode, className);
}


///// FileViewer section 
app.fileListNode = app.querySelector(".file-list");

/**
 * First file list set
 * @param {array} filelist 
 */
app.fileListNode.reset = function(filelist) {
    while(app.fileListNode.firstChild) {
        app.fileListNode.removeChild(app.fileListNode.firstChild)
    }
    for (const file_info of filelist) {
        app.fileListNode.appendChild(app.fileListNode.create(file_info));
    }
}

/**
 * Add file to file list
 * @param {*} file 
 */
app.fileListNode.add = function(file) {
    const node = app.fileListNode.create(file);
    if (app.fileListNode.firstChild) {
        app.fileListNode.insertBefore(node, app.fileListNode.firstChild);
    } else {
        app.fileListNode.appendChild(node);
    }
}

/**
 * Remove from file list 
 * @param {string} id 
 */
app.fileListNode.remove = function(id) {
    let i = 0;
    const articles = app.fileListNode.getElementsByTagName('article');
    for (i = 0; articles[i]; i++) {
        if (articles[i].data.id == id) {
            app.fileListNode.removeChild(articles[i]);
            break;
        }
    }
}

// Disable text select
app.fileListNode.addEventListener('mousedown', function(e) {
  if (e.shiftKey) e.preventDefault();
}, false);

/**
 * Loading file list from json
 */
app.reloadFileList = async () => {
    const res = await fetch(`${setting.jsonDir}/files.json.gz?${new Date().getTime()}`);
    if (res.status == 404) {
        alert('Data file has not been created.');
        return;
    }
    if (res.status != 200) {
        alert('http error ' + res.status);
        return;
    }
    const stream = res.body.pipeThrough(new DecompressionStream('gzip'));
    app.fileList = await new Response(stream).json();
    app.fileListNode.reset(app.fileList);
}

/**
 * Create file list item
 * @setting {file} file 
 * @returns DOMElement
 */
app.fileListNode.create = (file) => {
    const node = app.querySelector(".template-file").content.cloneNode(true);
    const img = node.querySelector('.icon object');
    if (file.thumb) {
        node.querySelector('.icon').classList.add('thumbnail'); 
        img.setAttribute('data', `${setting.thumbDir}/${file.dir}/${file.id}.jpg`);
        img.setAttribute('type', 'image/jpeg')
    } else {
        img.setAttribute('data', 'src/file.svg');
        img.setAttribute('type', 'image/svg+xml');
        img.addEventListener('load', () => {
            img.contentDocument.getElementById('file-type').textContent = file.ext;
        });
    }
    img.addEventListener('dragstart', function(e) {
      e.preventDefault();
    });
    node.querySelector('.filename').appendChild(document.createTextNode(file.name));
    const article = node.querySelector('article');
    article.title = app.createAttributeTitle(file);
    article.classList.add(file.type.split('/')[0]);
    article.addEventListener('click', app.clickFileHandler);
    article.data = { ...file };
    return node;
}

app.createAttributeTitle = (file) => {
    return `${file.name}.${file.ext}\nType: ${file.type}\nSize: ${app.formatBytes(file.size)}\nUpload date: ${(new Date(file.time * 1000)).toLocaleString()}`;
}

/**
 * Click method for file list item
 * @setting {evemt} e 
 */
app.clickFileHandler = function(e) {
    const index = app.fileList.findIndex((file) => this.data.id == file.id);
    if (!(e.ctrlKey || e.metaKey || e.shiftKey)) {
        app.fileOpen(app.fileList[index], index);
    } else if (e.shiftKey) {
        const articles = app.fileListNode.getElementsByTagName('article');
        const start = Array.from(articles).findIndex((node) => node.classList?.contains('shift-start'));
        app.clearSelected();
        if (start == -1) {
            this.classList.add('selected', 'shift-start');
        } else {
            const current = Array.from(articles).findIndex((node) => node.data.id == this.data.id);
            articles[start].classList.add('shift-start');
            const [addStart, addEnd] = start > current ? [current, start] : [start, current];
            for (let i = addStart; i <= addEnd; i++) {
                articles[i].classList.add('selected');
            }
        }
        window.addEventListener('keydown', app.keydownEventOnSelected);
    } else if(this.classList?.contains('selected')){
        this.classList.remove('selected');
    } else {
        this.classList.add('selected');
        window.addEventListener('keydown', app.keydownEventOnSelected);
   }
};

/**
 * Key down event on selected
 * @param {*} event
 */
app.keydownEventOnSelected = function(event) {
    if (!app.fileListNode.querySelector('.selected')) {
        window.removeEventListener('keydown', app.keydownEventOnSelected);
        return;
    }
    if (event.key === 'Delete'){
        app.remove();
    }
}


/**
 * File viewr open
 * @setting {file} file 
 * @setting {int} index 
 * @setting {bool} pushState 
 */
app.fileOpen = function(file, index, pushState = true) {
    if (pushState) history.pushState(null, '', '?id=' + file.id);
    const viewer = app.querySelector(".file-viewer");
    viewer.data = { ...file };
    viewer.style.display = 'block';
    viewer.querySelector('h2').textContent = file.name;
    document.title = `${file.name} - ${setting.pageTitle}`;
    const object = app.createViewObject(file);
    const screen = viewer.querySelector('.screen');
    if (screen.firstChild) {
        screen.replaceChild(object, screen.firstChild);
    } else {
        screen.appendChild(object);
    }
    const prev = viewer.querySelector('.prev');
    if (index == 0 || index == -1) {
        prev.setAttribute('disabled', 'disabled');
    } else {
        prev.removeAttribute('disabled');
    }
    const next = viewer.querySelector('.next');
    if (index < app.fileList.length - 1 && index != -1) {
        next.removeAttribute('disabled');
    } else {
        next.setAttribute('disabled', 'disabled');
    }
    document.body.style.overflow = 'hidden';
}

/**
 * Create File Object
 * @setting {file} file 
 * @returns DOMElement
 */
app.createViewObject = function(file) {
    if (file.type.match(/^image/)) {
        const img = document.createElement('img');
        img.setAttribute('src', `${setting.orgDir}/${file.dir}/${file.id}.${file.ext}`);
        return img;
    }
    if (file.type.match(/^video\/(matroska|mov|mp4|webm)/)) {
        const video = document.createElement('video');
        video.setAttribute('src', `${setting.orgDir}/${file.dir}/${file.id}.${file.ext}`);
        video.controls = true; 
        return video;
    }

    const span = document.createElement('span');
    const object = span.appendChild(document.createElement('object'));
    object.setAttribute('type', 'image/svg+xml');
    object.setAttribute('data', 'src/file.svg');
    object.addEventListener('load', () => {
        object.contentDocument.getElementById('file-type').textContent = file.ext;
    });
    span.addEventListener('click', () => {
        const a = document.createElement('a');
        a.href = `${setting.orgDir}/${file.dir}/${file.id}.${file.ext}`;
        a.download = `${file.name}.${file.ext}`;
        a.click();
    });
    return span;
}

/**
 * Close file view
 */
app.fileClose = function () {
    history.pushState(null, '', './');
    if (app.fileList.length == 0) app.reloadFileList();
    const viewer = app.querySelector(".file-viewer");
    viewer.style.display = 'none';
    const screen = viewer.querySelector('.screen');
    screen.removeChild(screen.firstChild);
    document.body.style.overflow = 'auto';
    document.title = setting.pageTitle;
}


/**
 * Viwer controll button
 */
app.querySelector('.next').addEventListener('click', function(){
    const viewer = app.querySelector( ".file-viewer");
    const index = app.fileList.findIndex((file) => viewer.data.id == file.id) + 1;
    app.fileOpen(app.fileList[index], index);
});

app.querySelector('.prev').addEventListener('click', function(){
    const viewer = app.querySelector( ".file-viewer");
    const index = app.fileList.findIndex((file) => viewer.data.id == file.id) - 1;
    app.fileOpen(app.fileList[index], index);
});

app.querySelector('.close').addEventListener('click', function() {
    app.fileClose();
});

/**
 * Bronser back controll
 */
window.addEventListener("popstate", (event) => {
    const id = new URLSearchParams(window.location.search)?.get('id');
    if (!id) {
        app.fileClose();
        return;
    }
    const index = app.fileList.findIndex((file) => id == file.id);
    if (index == -1) return;
    app.fileOpen(app.fileList[index], index, false);
});

/**
 * Disable standard dropdown
 */
window.addEventListener("drop", (e) => {
    if ([...e.dataTransfer.items].some((item) => item.kind === "file")) e.preventDefault();
});




////////////// Context menu section
app.contextMenu = app.querySelector('.context-menu');

/**
 * Contect menu open
 * @setting {event} e 
 */
app.contxtMenuHandler = function(e) {
    const node = app.getHasFileDataNode(e.target);
    if (!node) {
        app.contextMenu.style.display = 'none';
        app.clearSelected();
        return;
    }
    e.preventDefault();
    app.querySelector('main').style.overflow = 'hidden';
    if (!node.classList.contains('selected')) app.clearSelected();

    if (!node.classList?.contains('selected')) node.classList.add('selected');

    const li = app.contextMenu.getElementsByTagName('li');
    const selected = app.fileListNode.querySelectorAll('.selected');
    if (selected.length > 1) {
        li[0].classList.add('disabled');
    } else {
        li[0].classList.remove('disabled');
    }

    const menuWidth = app.contextMenu.offsetWidth;
    const menuHeight = app.contextMenu.offsetHeight;

    const winWidth = window.innerWidth;
    const winHeight = window.innerHeight;

    let x = e.clientX;
    let y = e.clientY;

    // check fo overflow x
    if (x + menuWidth > winWidth) x = x - menuWidth;

    // check fo overflow y
    if (y + menuHeight > winHeight) y = y - menuHeight;

    app.contextMenu.style.left = x + 'px';
    app.contextMenu.style.top = y + 'px';
    app.contextMenu.style.display = 'block';

    window.addEventListener('keydown', app.contectMenuKeydownHandler);
    window.addEventListener('click', app.clickOutsideMenuHandler);
    window.addEventListener('resize', app.closeContextMenu);
}

/*
 * Search has file data node from parent node
 * @setting {element} node
 */
app.getHasFileDataNode = function(node) {
    if (!node) return null;
    if (node.data) return node;
    return app.getHasFileDataNode(node.parentNode);
};

/**
 * Close context menu
 */
app.closeContextMenu = () => {
    app.contextMenu.style.display = 'none';
    app.querySelector('main').style.overflow = 'auto';
    window.removeEventListener('keydown', app.contectMenuKeydownHandler);
    window.removeEventListener('click', app.clickOutsideMenuHandler);
    window.removeEventListener('resize', app.closeContextMenu)
}

app.clickOutsideMenuHandler = (e) => {
    if (!app.isInsideClass(e.target, 'context-menu')){
        app.closeContextMenu();
    }
}

app.contectMenuKeydownHandler = function(e) {
    if(e.key == 'Escape') {
        app.closeContextMenu();
    }
}

/**
 * All clear to selected item
 */
app.clearSelected = function () {
    app.fileListNode.querySelectorAll('.selected').forEach(node => {
        node.classList.remove('selected','shift-start');
    });
}


/**
 * Downloading all selected file
 */
app.downloadSelectd = function () {
    const selected = Array.from(app.fileListNode.querySelectorAll('.selected'));
    selected.forEach((item) => {
        const a = document.createElement('a');
        a.href = `${setting.orgDir}/${item.data.dir}/${item.data.id}.${item.data.ext}`;
        a.download = `${item.data.name}.${item.data.ext}`;
        a.click();
    });
}

app.contextMenu.getElementsByTagName('li')[1].addEventListener('click', app.downloadSelectd);

/**
 * File rename
 */
app.rename = async function () {
    app.contextMenu.style.display = 'none';
    app.querySelector('main').style.overflow = 'auto';
    const item = app.fileListNode.querySelector('.selected');
    const newname = window.prompt(`rename '${item.data.name}'`, item.data.name);
    if (!newname) return;
    const match = newname.match(/([\/\\\:\*\?\"\<\>\|])/);
    if (match) {
        alert(`cannot use ${match[1]}`);
        return;
    }
    const action = async () => {
        const form_data = new FormData();
        form_data.append('id', item.data.id);
        form_data.append('name', newname);
        const res = await fetch(`${setting.apiPath}/rename`, {
            method : 'POST',
            body : form_data,
        });
        if (res.status != 200) {
            alert(res.message ?? 'http status ' + res.status);
            return;
        }
        app.fileList.map((file) => {
            if(file.id == item.data.id) file.name = newname;
            return file;
        });
        item.data.name = newname;
        item.querySelector('.filename').textContent = newname;
        item.title = app.createAttributeTitle(item.data);
    }
    app.execute(action);
}

const renameMenu = app.contextMenu.getElementsByTagName('li')[0];
renameMenu.addEventListener('click', app.rename);
if (setting.readOnly) renameMenu.style.display = 'none';

/*
* Clear selected on another area
*/ 
window.addEventListener('click', function(e) {
    if (e.ctrlKey || e.metaKey || e.shiftKey) return;
    if (app.isInsideClass(e.target, 'context-menu')) return;
    app.clearSelected();
});

app.querySelector('main').addEventListener('contextmenu', app.contxtMenuHandler);

/**
 * Remove selected files
 */
app.remove = function() {
    const files = Array.from(app.fileListNode.querySelectorAll('.selected'));
    const names = files.map((item) => `${item.data.name}.${item.data.ext}`).join('\n ');
    if (confirm(files.length > 1 ? `Remove theres file:\n ${names}` : `Remove: ${names}`)) {
        const action = async () => {
            const form_data = new FormData();
            form_data.append('ids', files.map((item) => item.data.id).join(','));
            const res = await fetch(`${setting.apiPath}/remove`, {
                method : 'POST',
                body : form_data,
            });
            const json = await res.json();
            if (res.status != 200) {
                alert(res.message ?? 'http status ' + res.status);
                return;
            }

            // remove from memory
            app.fileList = app.fileList.filter((file) => json.success.indexOf(file.id) == -1);
            // remove from display
            for (const id of json.success) {
                app.fileListNode.remove(id);
            }
            if (json.success.length) {
                app.contextMenu.style.display = 'none';
                app.querySelector('main').style.overflowY = 'auto';
            }
            // on fail
            if (json.fail.length) {
                alert((json.fail.length > 1 ? 'Cannot remove thease:\n' : 'Cannot remove: ') + json.fail.map((file) => `${file.name}.${file.ext}`).join('\n'));
            }
        }
        app.execute(action);
    }
    app.contextMenu.style.display = 'none';
}

const removeMenu = app.contextMenu.getElementsByTagName('li')[2];
removeMenu.addEventListener('click', app.remove);
if (setting.readOnly) removeMenu.style.display = 'none';


////////////// File Upload section

/**
 * File drop event
 * @setting {event} e 
 */
app.dropHandler =  function (e) {
    app.transfer = e.dataTransfer.files;
    if (app.transfer.length === 0) return;
    const action = () => {
        for (const file of app.transfer) app.upload(file);
    }
    app.execute(action);
}

if (!setting.readOnly) app.querySelector('main').addEventListener("drop", app.dropHandler);


/**
 * Create new upload
 */
app.progress.create = function(file) {
    app.progress.style.display = 'block';
    const dl = app.querySelector('.progress-item').content.cloneNode('true').querySelector('dl');
    dl.data = {filename : file.name};
    dl.title = `type: ${file.type}\nsize: ${app.formatBytes(file.size)}`;
    dl.querySelector('dt').textContent = file.name;
    dl.updateLoading = function(ratio) {
        const bar = dl.querySelector('dd');
        bar.style.width = ratio * 100 + '%';
        return dl;
    }
    dl.setStatus = function(status, detail) {
        const node = dl.querySelector('dt');
        if (status == 'loading') {
            node.classList.add('loading');
            return dl;
        }
        node.classList.remove('loading');
        node.classList.add('error');
        dl.addEventListener('click', function() {
            const message = `Error ${status}\n${detail.message}\n` +
                (detail.input ? JSON.stringify(detail.input, null, 2) : ''); 
            alert(message);
            app.progress.removeChild(dl);
        })
        
    }
    app.progress.appendChild(dl);
    return dl;
}

/**
 * Files currently being uploaded
 * @setting {string} fileName 
 * @returns int
 */
app.progress.getNodeByFileName = function(filename) {
    for (const dl of app.progress.getElementsByTagName('dl')) {
        if (dl.data.filename == filename) return dl;
    }
    return null;
}

/**
 * Remove progress node on exit
 */
app.progress.remove = function (filename) {
    const target = app.progress.getNodeByFileName(filename);
    app.progress.removeChild(target);
    if (!app.progress.querySelectorAll('dl').length) {
        app.progress.style.display = 'none';
    }
}

/**
 * Restricting evictions on download
 */
window.addEventListener('beforeunload', (event) => {
    for (const dt of app.progress.getElementsByTagName('dt')){
        if (dt.classList.contains('loading')) {
            event.preventDefault();
            event.returnValue = '';
        }
    }
});


/**
 * File upload to api
 * @setting {file} file 
 * @returns Promise
 */
app.upload = async (file) => {

    app.progress.create(file);

    const thumbnail = await app.createThumbnail(file);
 
    return new Promise((resolve, reject) => {
        const fileName = file.name;
        const formData = new FormData();
        const xhr = new XMLHttpRequest();
        formData.append('file', file);
        if (thumbnail) formData.append("thumbnail", thumbnail, "thumb.jpg");

        xhr.upload.addEventListener("progress", e => {
            if (e.lengthComputable) {
                const value = e.loaded / e.total;
                app.progress.getNodeByFileName(fileName).updateLoading(value).setStatus('loading');
            }
        });

        xhr.addEventListener("load", () => {
            const progress = app.progress.getNodeByFileName(fileName);
            if (xhr.status != 200) {
                progress.setStatus(xhr.status, xhr.response);
            } else if (xhr.response.success) {
                app.progress.remove(fileName);
                app.fileList.unshift(xhr.response.new);
                app.fileListNode.add(xhr.response.new)
            } else {
                progress.setStatus(xhr.status, xhr.response);
            }
            resolve();
        });

        xhr.addEventListener("error", () => {
            app.progress.getNodeByFilaName.setStatus(xhr.status);
            reject();
        });
        xhr.responseType = 'json';
        xhr.open("POST", `${setting.apiPath}/upload`);
        xhr.send(formData);
    });
}

/**
 * Create thumbnail from image or video (using canvas)
 * @setting {*} file 
 * @setting {int} maxSize width or height
 * @returns Promise
 */
app.createThumbnail = (file, maxSize = 300) => {

    if (!file.type.match(/image|video\/(matroska|mov|mp4|webm)/)) return null;

    const getThumbSize = (width, height, maxSize) => {
        if (width > maxSize || height > maxSize) {
            if (width > height) {
                height = Math.round(height * (maxSize / width));
                width = maxSize;
            } else {
                width = Math.round(width * (maxSize / height));
                height = maxSize;
            }
        }
        return [width, height];
    }

    const getThumbnail = (img, width, height) => {
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        return canvas;
    }

    return new Promise((resolve, reject) => {

        const type = file.type.match(/video/) ? 'video' : 'image';
        const url = URL.createObjectURL(file);

        if (type == 'video') {
            const video = document.createElement('video');
            video.muted = true;
            video.playsInline = true;
            video.onloadedmetadata = () => {
                video.currentTime = 0.1; 
            }
            video.onseeked = () => {
                const [width, height] = getThumbSize(video.videoWidth, video.videoHeight, maxSize);

                getThumbnail(video, width, height).toBlob(
                    (blob) => {
                        URL.revokeObjectURL(url);
                        resolve(blob);
                    },
                    "image/jpeg",
                    0.8); // JPEG quality
            }
            video.src = url;
        } else {
            const img = new Image();

            img.onload = () => {
                const [width, height] = getThumbSize(img.width, img.height, maxSize);

                getThumbnail(img, width, height).toBlob(
                    (blob) => {
                        URL.revokeObjectURL(url);
                        resolve(blob);
                    },
                    "image/jpeg",
                    0.8); // JPEG quality
            };
            img.onerror = reject;
            img.src = url; 
        }
    });
}



///// Authenticate section

/**
 * Authentication
 */
app.viewAuthenticate = function () {
    app.querySelector('.authenticate').style.display = 'block';
    document.body.style.overflow = 'hidden';
    app.querySelector('.authenticate input').focus();
    window.addEventListener('keydown', app.authenticateModalKeydownHandler);
}

/**
 * Session activity check and action execute
 * @setting {function} action
 */
app.execute = async function(action) {
    const res = await fetch(`${setting.apiPath}/available`);
    const json = await res.json();
    if (res.status != 200) {
        console.log('http errpr ' + res.status);
        return;
    }
    if (json.username) {
        action();
        return;
    }
    app.waitAction = action;
    app.viewAuthenticate();
}

/**
 * Connect api/login
 */
app.login = async function () {
    const username = app.querySelector('[name="username"]').value;
    const password = app.querySelector('[name="password"]').value;
    if (username.length == 0 || password.length == 0) return;
    const form_data = new FormData();
    form_data.append('username', username);
    form_data.append('password', password);
    const res = await fetch(`${setting.apiPath}/login`, {
        method : 'POST',
        body : form_data,
    });
    if (res.status == 404) {
        alert('Unmatch username or password');
        return;
    }
    if (res.status != 200) {
        alert('http status ' + res.status);
        return;
    }
    app.closeAuthenticate();
    app.waitAction();
}

/**
 * Authenticate modal close
 */
app.closeAuthenticate = function() {
    app.querySelector('[name="username"]').value = '';
    app.querySelector('[name="password"]').value = '';
    app.querySelector('.authenticate').style.display = 'none';
    document.body.style.overflow = 'auto';
    window.removeEventListener('keydown', app.authenticateModalKeydownHandler);
}

/**
 * Authenticate modal close handler
 * @setting {event} e
 */
app.authenticateModalCloseHandele = function(e) {
    if (e.target.classList.contains('modal')) app.closeAuthenticate();
}

app.authenticateModalKeydownHandler = function(e) {
    if(e.key == 'Escape') app.closeAuthenticate();
}

/* set default event */
app.querySelector('.authenticate').addEventListener('click', app.authenticateModalCloseHandele);
app.querySelector('.authenticate .close').addEventListener('click', app.closeAuthenticate);
app.querySelectorAll('.authenticate input').forEach((input) => input.addEventListener('keydown', function(e) {
    if (e.key =='Enter') app.login();
}));
app.querySelector('.authenticate [name="submit"]').addEventListener('click', app.login)


/**
 * File size to string
 * @setting {int} bytes 
 * @setting {int} precision 
 * @returns string
 */
app.formatBytes = (bytes, precision = 2) => {
    if (bytes === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const k = 1024;
    const b = Math.max(bytes, 0); 
    const i = Math.floor(Math.log(b) / Math.log(k));
    const unitIndex = Math.min(i, units.length - 1);
    const formattedValue = (b / Math.pow(k, unitIndex)).toFixed(precision);
    return `${parseFloat(formattedValue)} ${units[unitIndex]}`;
}

if (setting.targetFile) {
    app.fileOpen(setting.targetFile, -1);
} else {
    app.reloadFileList();
}

return app;

}