const div = document.createElement('div');
div.textContent = `Dump Processo`;
div.addEventListener('click', function () {
    if(window.top.document.getElementById("onlyCol")){
    var neoId = window.top.document.getElementById("onlyCol").contentWindow.document.getElementById("iframe_task").contentWindow.document.getElementById("hid_root").value;
    }else{
        // var neoId = document.getElementById("hid_root").value;
    }

    var url = new URL(window.location.href);
    var pathname = url.pathname;
    var fusionIndex = pathname.lastIndexOf("/fusion"); // Encontrar a posição do último "/fusion"
    var newPathname = pathname.substring(0, fusionIndex + 7);
    var urlBase = url.origin + newPathname + "/adm/dumpNeoObject.jsp?id=" + neoId;
    window.open(urlBase, "_blank");

});

div.style.width = '9rem';
div.style.position = 'fixed';
div.style.right = 0;
div.style.marginRight = '18rem';
div.style.marginTop = '8px';
div.style.color = '#fff';
div.style.backgroundColor = '#007bff';
div.style.border = 'none';
div.style.padding = '0.5rem 1rem';
div.style.textAlign = 'center';
div.style.textDecoration = 'none';
div.style.cursor = 'pointer';
div.style.borderRadius = '0.25rem';
div.style.visibility = 'hidden';
div.id = 'divDump';

setTimeout(function () {
    if(document.getElementById("menu-top-view")){
        document.getElementById("menu-top-view").appendChild(div);
    }else{
        // document.getElementById("cwheadertag").appendChild(div);
    }
}, 1500);

function toggleButtonVisibility() {
    const frame_taskElement = window.top.document.getElementById("onlyCol");
        const buttonElement = document.getElementById("divDump");

        if (window.top.document.getElementById("task_wrapper_workflow") || frame_taskElement != null && frame_taskElement.contentWindow.document.getElementById("iframe_task")) {
            if (buttonElement)
                buttonElement.style.visibility = "visible"; // Exibe o botão
        } else {
            if (buttonElement)
                buttonElement.style.visibility = "hidden"; // Oculta o botão
        }
     
}

setInterval(toggleButtonVisibility, 1500);

