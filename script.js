const urlBase = window.location.origin + window.location.pathname;
const urlSemFusion = urlBase.replace(/\/fusion\/.*$/, '/fusion/');

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

div.style.position = 'absolute';
div.style.right = '0';
div.style.top = '9px';
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
div.style.zIndex = '10'
div.id = 'divDump';

const divMenu = document.createElement('div');
divMenu.innerHTML = `
    <p id=closeMenu>&times;</p>
    <p id=titleMenu>Menu</p>
    <ul id="menu">
        <p><a href="${urlSemFusion}adm/central.jsp" target="_blank">Central</a></p>
        <li><a href="${urlSemFusion}adm/dumpEForm.jsp" target="_blank">Form Tree</a></li>
        <li><a href="${urlSemFusion}adm/sql.jsp" target="_blank">SQL</a></li>
        <li><a href="${urlSemFusion}adm/script.jsp" target="_blank">Script</a></li>
        <li><a href="${urlSemFusion}adm/log.jsp" target="_blank">Log</a></li>
        <li><a href="${urlSemFusion}adm/tomcatLog.jsp" target="_blank">TomCatLog</a></li>
    </ul>
`;
//adicionar uma tooltip
divMenu.title = "Menu de Ferramentas DEV";
divMenu.id = 'divMenu';

// append divMenu to the body
document.body.appendChild(divMenu);

// Adiciona um ouvinte de evento de click ao elemento divMenu
divMenu.addEventListener('click', function () {
    // Alternar a classe com a animação
    divMenu.classList.toggle('rotated');
    document.getElementById('menu').classList.toggle('exibir');
    document.getElementById('titleMenu').classList.toggle('esconderTitleMenu');
    document.getElementById('closeMenu').classList.toggle('exibirCloseMenu');
});



div.addEventListener('click', function () {
    if (window.top.document.getElementById("onlyCol")) {
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
    if (document.getElementsByClassName("ui-neo-menu-top-search col-xs-offset-0")[0]) {
        var targetElement = document.getElementsByClassName("ui-neo-menu-top-search col-xs-offset-0")[0];
        targetElement.parentNode.insertBefore(div, targetElement);
    }
}, 1500);

document.addEventListener('keydown', function (event) {
    if (event.key === 's' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        var saveButton = document.getElementsByClassName("icon-save-bpm")[0];
        if (saveButton) {
            saveButton.click();
        }
    }
    else if (event.key === 'd' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        var saveButton = document.getElementsByClassName("icon-validate-bpm")[0];
        if (saveButton) {
            saveButton.click();
        }
    }
    else if (event.key === 'l' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        var saveButton = document.getElementsByClassName("icon-deploy-bpm")[0];
        if (saveButton) {
            saveButton.click();
        }
    }
});

function criaEventoCopy() {
    var elementos = document.getElementsByClassName("custom-input-adapter");

    for (var i = 0; i < elementos.length; i++) {
        if (!elementos[i].dataset.eventoCopy) {
            elementos[i].addEventListener('click', function () {
                var campoTexto = this;
                campoTexto.select();
                document.execCommand('copy');
                campoTexto.blur();
                mostrarToast('Texto copiado para a área de transferência!');
            });
            elementos[i].dataset.eventoCopy = true;
        }
    }
}

function mostrarToast(mensagem) {
    var toast = document.createElement('div');
    toast.textContent = mensagem;
    toast.style.cssText = 'position: fixed; top: 3%; left: 85%; transform: translate(-50%, -50%); background-color: rgb(21 22 21); color: rgb(255, 255, 255); padding: 15px 10px; border-radius: 5px; z-index: 9999;';

    document.body.appendChild(toast);

    setTimeout(function () {
        toast.parentNode.removeChild(toast);
    }, 3000);
}

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

setInterval(function () {
    toggleButtonVisibility();
    criaEventoCopy();
}, 1500);