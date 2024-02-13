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

function criaEventoCopy() {
    // Obtém uma coleção de elementos com a classe 'custom-input-adapter'
    var elementos = document.getElementsByClassName("custom-input-adapter");

    console.log(elementos.length + " elementos encontrados");

    // Itera sobre a coleção de elementos
    for (var i = 0; i < elementos.length; i++) {
        // Verifica se o elemento já tem o evento associado
        if (!elementos[i].dataset.eventoCopy) {
            // Adiciona o evento de clique apenas se o evento não estiver associado
            elementos[i].addEventListener('click', function () {
                var campoTexto = this;

                // Seleciona o conteúdo do campo de texto
                campoTexto.select();

                // Copia o conteúdo selecionado para a área de transferência
                document.execCommand('copy');

                // Deseleciona o campo de texto (opcional)
                campoTexto.blur();

                // Mostra uma mensagem de confirmação (opcional)
                mostrarToast('Texto copiado para a área de transferência!');
            });

            // Marca o elemento para indicar que o evento já foi associado
            elementos[i].dataset.eventoCopy = true;
        }
    }
}

// Função para exibir uma notificação toast
function mostrarToast(mensagem) {
    // Cria um elemento div para a notificação toast
    var toast = document.createElement('div');
    toast.textContent = mensagem;
    toast.style.cssText = 'position: fixed; top: 3%; left: 85%; transform: translate(-50%, -50%); background-color: rgb(21 22 21); color: rgb(255, 255, 255); padding: 15px 10px; border-radius: 5px; z-index: 9999;';

    // Adiciona a notificação toast ao corpo do documento
    document.body.appendChild(toast);

    // Define um temporizador para remover a notificação toast após alguns segundos
    setTimeout(function() {
        toast.parentNode.removeChild(toast);
    }, 3000); // 3000 milissegundos = 3 segundos
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