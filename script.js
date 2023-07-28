var link = document.createElement('link');
link.rel = 'stylesheet';
link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css';

var head = document.head || document.getElementsByTagName('head')[0];
head.appendChild(link);

const div = document.createElement('div');
div.textContent = `Dump`;

var eyeIcon = document.createElement('i');
eyeIcon.className = 'fas fa-eye';
eyeIcon.style.fontSize = '18px';
eyeIcon.style.color = '#fff';
div.appendChild(eyeIcon);

div.style.position = 'fixed';
div.style.right = 0;
div.style.marginRight = '15rem';
div.style.marginTop = '10px';
div.style.color = '#fff';
div.style.border = 'none';
div.style.textAlign = 'center';
div.style.textDecoration = 'none';
div.style.cursor = 'pointer';
div.style.borderRadius = '0.25rem';
div.style.visibility = 'hidden';
div.style.display = 'flex';
div.style.flexDirection = 'column-reverse'
div.style.fontSize = '9px'
div.id = 'divDump';

div.addEventListener('click', function () {
    if(window.top.document.getElementById("onlyCol")){
    var neoId = window.top.document.getElementById("onlyCol").contentWindow.document.getElementById("iframe_task").contentWindow.document.getElementById("hid_root").value;
    }

    var url = new URL(window.location.href);
    var pathname = url.pathname;
    var fusionIndex = pathname.lastIndexOf("/fusion");
    var newPathname = pathname.substring(0, fusionIndex + 7);
    var urlBase = url.origin + newPathname + "/adm/dumpNeoObject.jsp?id=" + neoId;
    window.open(urlBase, "_blank");

});

setTimeout(function () {
    if(document.getElementById("menu-top-view")){
        document.getElementById("menu-top-view").appendChild(div);
    }
}, 1500);

function toggleButtonVisibility() {
    const frame_taskElement = window.top.document.getElementById("onlyCol");
        const buttonElement = document.getElementById("divDump");

        if (window.top.document.getElementById("task_wrapper_workflow") || frame_taskElement != null && frame_taskElement.contentWindow.document.getElementById("iframe_task")) {
            if (buttonElement)
                buttonElement.style.visibility = "visible";
        } else {
            if (buttonElement)
                buttonElement.style.visibility = "hidden";
        }
     
}

setInterval(toggleButtonVisibility, 1500);

