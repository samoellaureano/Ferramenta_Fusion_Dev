var sonicAdded = false;
var scrollOriginal = true;
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
    var elementos = document.getElementsByClassName("custom-input-adapter");

    for (var i = 0; i < elementos.length; i++) {
        if (!elementos[i].dataset.eventoCopy) {
            elementos[i].addEventListener('contextmenu', function (event) {
                event.preventDefault();
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

function criaEventoKeyMap(listKeyObj) {
    top.document.addEventListener('keydown', function (event) {
        // Criar um loop para verificar cada objeto da lista
        console.log(event.key);
        listKeyObj.forEach(function (keyObj) {
            if ((event.key === keyObj.key || event.key === keyObj.key.toUpperCase()) && (event.ctrlKey || event.metaKey) && event.altKey) {
                console.log(keyObj.name);
                event.preventDefault();
                // Verificar se o objeto tem a propriedade link
                if (keyObj.link) {
                    // Abrir em outra aba mantendo o foco na janela atual sem colocar a nova aba em primeiro plano, ainda esta abrindo em primeiro plano, resolver
                    window.open(urlSemFusion + keyObj.link, "_blank").blur();
                    return;
                }
                var saveButton = document.getElementsByClassName(keyObj.className)[0];
                if (saveButton) {
                    saveButton.click();
                }
            }
        });
    });
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

// Function to create div menu

function createDivMenu() {
    const divMenu = document.createElement('div');
    divMenu.innerHTML = `
    <p id=titleMenu>Menu</p>
    <ul id="menu">
        <li><a href="${urlSemFusion}adm/central.jsp" target="_blank">Central</a></li>
        <li><a href="${urlSemFusion}adm/dumpEForm.jsp" target="_blank">Form Tree</a></li>
        <li><a href="${urlSemFusion}adm/sql.jsp" target="_blank">SQL</a></li>
        <li><a href="${urlSemFusion}adm/script.jsp" target="_blank">Script</a></li>
        <li><a href="${urlSemFusion}adm/log.jsp" target="_blank">Log</a></li>
        <li><a href="${urlSemFusion}adm/tomcatLog.jsp" target="_blank">TomCatLog</a></li>
    </ul>`;
    //adicionar uma tooltip
    divMenu.title = "Menu de Ferramentas DEV";
    divMenu.id = 'divMenu';

    // append divMenu to the body
    document.body.appendChild(divMenu);

    var isDragging = false;
    var offset = { x: 0, y: 0 };

    // Evento de clique para iniciar o arrasto
    divMenu.addEventListener('mousedown', function (e) {
        isDragging = true;
        // offset.x = e.clientX - divMenu.getBoundingClientRect().left;
        offset.y = e.clientY - divMenu.getBoundingClientRect().top;

    });

    // Evento de movimento do mouse enquanto estiver arrastando
    divMenu.addEventListener('mousemove', function (e) {
        if (isDragging) {
            // var newX = e.clientX - offset.x;
            var newY = e.clientY - offset.y;
            // divMenu.style.left = newX + 'px';
            divMenu.style.top = newY + 'px';
            //cursor de movimento vertical
            divMenu.style.cursor = 'ns-resize';
        }
    });

    // Evento de soltar o clique, terminando o arrasto
    divMenu.addEventListener('mouseup', function () {
        isDragging = false;
        divMenu.style.cursor = 'pointer';
    });

    // Evento de clique para abrir e fechar o menu
    divMenu.addEventListener('click', function () {
        divMenu.classList.toggle('rotated');
        document.getElementById('menu').classList.toggle('exibir');
        document.getElementById('titleMenu').classList.toggle('titleMenuRoteated');
    });

    //adicionar outro estilo para uma url diferente de /fusion/portal
    if (!urlBase.includes("/fusion/portal")) {
        // Obtém todas as <li> dentro do <ul> com ID "menu"
        var lis = document.querySelectorAll("#menu li");

        // Itera sobre cada <li> e aplica a classe CSS
        lis.forEach(function (li) {
            li.classList.add("liOutPortal");
        });

        document.getElementById('titleMenu').classList.add('titleMenuOutPortal');
    }

    //exibir o menudepois de 1s
    setTimeout(() => {
        divMenu.style.opacity = 1;
    }, 500);
}

// Função para salvar a lista de objetos keySave no localStorage, apenas se não existir
function saveKeyListToLocalStage(keyList) {
    try {
        // Verifica se a lista já existe no localStorage
        if (!localStorage.getItem('keyList')) {
            // Converte a lista de objetos em JSON
            var jsonKeyList = JSON.stringify(keyList);

            // Armazena a string JSON no localStorage
            localStorage.setItem('keyList', jsonKeyList);

            console.log("Lista de chaves salva no localStorage.");
        } else {
            console.log("A chave keyList já existe no localStorage. Não foi necessário salvar a lista novamente.");
        }
    } catch (e) {
        console.error("Ocorreu um erro ao tentar salvar a lista de chaves no localStorage:", e);
    }
}

// Função para atualizar a lista de objetos keySave no localStorage
function updateKeyListToLocalStorage(keyList) {
    try {
        // Converte a lista de objetos em JSON
        var jsonKeyList = JSON.stringify(keyList);

        // Armazena a string JSON no localStorage
        localStorage.setItem('keyList', jsonKeyList);

        console.log("Lista de chaves atualizada no localStorage.");
    } catch (e) {
        console.error("Ocorreu um erro ao tentar atualizar a lista de chaves no localStorage:", e);
    }
}

// Função para recuperar a lista de objetos keySave do localStorage
function getKeyListFromLocalStorage() {
    try {
        // Recupera a string JSON do localStorage
        var jsonKeyList = localStorage.getItem('keyList');

        // Se não houver valor para keyList no localStorage, retorna uma lista vazia
        if (!jsonKeyList) {
            return [];
        }

        // Converte a string JSON de volta para uma lista de objetos
        return JSON.parse(jsonKeyList);
    } catch (e) {
        console.error("Ocorreu um erro ao tentar recuperar a lista de chaves do localStorage:", e);
        return [];
    }
}

// Exemplo de lista de objetos keySave
var listKeyObjDefault = [
    {
        name: "Salvar Modelagem",
        className: "icon-save-bpm",
        key: "s"
    },
    {
        name: "Validar Modelagem",
        className: "icon-validate-bpm",
        key: "v"
    },
    {
        name: "Publicar Modelagem",
        className: "icon-deploy-bpm",
        key: "l"
    },
    {
        name: "Abrir Central",
        link: "adm/central.jsp",
        key: "¹"
    },
    {
        name: "Abrir Form Tree",
        link: "adm/dumpEForm.jsp",
        key: "²"
    },
    {
        name: "Abrir SQL",
        link: "adm/sql.jsp",
        key: "³"
    },
    {
        name: "Abrir Script",
        link: "adm/script.jsp",
        key: "£"
    },
    {
        name: "Abrir Log",
        link: "adm/log.jsp",
        key: "¢"
    },
    {
        name: "Abrir TomCatLog",
        link: "adm/tomcatLog.jsp",
        key: "¬"
    }
];


function addClass(element, className) {
    if (element.classList.contains(className)) {
        return;
    }

    if (element.classList)
        element.classList.add(className);
    else
        element.className += ' ' + className;
}

function addSonicComponent() {
    if (window.top.document.getElementById("onlyCol")) {
        var iframe = window.top.document.getElementById("onlyCol");
        if (iframe.contentWindow.document.getElementById("timesheet-filters") && !sonicAdded) {
            var text = document.createElement('p');
            text.textContent = 'Faça os apontamentos!';
            text.style.position = 'fixed';
            text.style.bottom = '0';
            text.style.marginLeft = '-125px';
            text.style.animation = 'move 20s linear infinite';
            text.style.zIndex = '9999';
            text.style.width = '13rem';
            text.onclick = function () {
                window.open('https://github.com/samoellaureano', '_blank');
            }

            var img = document.createElement('img');
            img.src = 'https://media.tenor.com/oir5PjIye9sAAAAi/sonic.gif';
            img.alt = 'Sonic';
            img.width = '50';
            img.height = '50';
            img.style.position = 'fixed';
            img.style.bottom = '0';
            img.style.left = '0';
            img.style.animation = 'move 20s linear infinite';
            img.style.zIndex = '9999';
            img.onclick = function () {
                window.open('https://github.com/samoellaureano', '_blank');
            }

            var style = document.createElement('style');
            style.innerHTML = `
                @keyframes move {
                    0% {
                        left: -150rem;
                    }
                    100% {
                        left: calc(350% - 5px);
                    }
                }`;

            iframe.contentWindow.document.body.appendChild(text);
            iframe.contentWindow.document.body.appendChild(img);
            iframe.contentWindow.document.body.appendChild(style);
            sonicAdded = true;
        }
    }
}

function updateReportCSS() {
    if (window.top.document.getElementById("onlyCol")) {
        var timesheetFilters = window.top.document.getElementById("onlyCol").contentWindow.document.getElementById("timesheet-filters");
        var reportTypeSelector = window.top.document.getElementById("onlyCol").contentWindow.document.getElementById("report-type-selector");
        var formReport = window.top.document.getElementById("onlyCol").contentWindow.document.getElementById("csv_form");
        var btnExport = window.top.document.getElementById("onlyCol").contentWindow.document.getElementById("export");

        if (timesheetFilters) {
            timesheetFilters.style.width = "28rem";
            var inputs = timesheetFilters.getElementsByTagName("input");
            for (var i = 0; i < inputs.length; i++) {
                inputs[i].style.padding = "15px";
            }

            var processState = timesheetFilters.getElementsByTagName("select")[0]
            if (processState) {
                processState.style.padding = "9px";
                processState.style.height = "auto";
            }
        }

        if (reportTypeSelector) {
            reportTypeSelector.style.width = "28rem";
            reportTypeSelector.style.padding = "9px";
            reportTypeSelector.style.height = "auto";
        }

        if (formReport) {
            formReport.style.display = "flex";
            formReport.style.flexDirection = "column";
            formReport.style.alignItems = "center";

            var span = formReport.getElementsByTagName("span")[0];
            span.style.marginLeft = "-19rem";
        }

        if (btnExport) {
            btnExport.style.height = "4rem";
        }
    }
}

function insertStyleMemReport() {
    // Função para formatar bytes
    function formatBytes(bytes) {
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        if (bytes === 0) return '0 Byte';
        const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
        return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
    }

    // Função para criar a visualização de progresso
    function createProgressBar(label, percentage, used, max, unit) {
        return `
            <div class="memory-container">
                <div class="label">${label}</div>
                <div class="progress-bar">
                    <div class="progress" style="width: ${percentage}%; background-color: ${percentage > 80 ? '#ff5722' : '#4caf50'};">
                        ${percentage.toFixed(2)}%
                    </div>
                </div>
                <div>Used: ${formatBytes(used)} / Max: ${max !== -1 ? formatBytes(max) : 'N/A'}</div>
            </div>
            <br>
        `;
    }

    // Função para gerar alertas de possíveis problemas
    function generateAlerts(heapPercentage, nonHeapPercentage, edenPercentage, oldGenPercentage, survivorPercentage) {
        let alerts = '';
        if (heapPercentage > 80) {
            alerts += '<div class="alert">Alert: Heap Memory Usage is above 80%!</div>';
        }
        if (nonHeapPercentage > 80) {
            alerts += '<div class="alert">Alert: Non-Heap Memory Usage is above 80%!</div>';
        }
        if (edenPercentage > 80) {
            alerts += '<div class="alert">Alert: G1 Eden Space Usage is above 80%!</div>';
        }
        if (oldGenPercentage > 80) {
            alerts += '<div class="alert">Alert: G1 Old Gen Usage is above 80%!</div>';
        }
        if (survivorPercentage > 80) {
            alerts += '<div class="alert">Alert: G1 Survivor Space Usage is above 80%!</div>';
        }
        return alerts;
    }

    // Extrair informações de uso de memória do texto
    const bodyText = document.body.textContent;

    const heapData = /Heap:.*used = (\d+).*committed = (\d+).*max = (\d+)/.exec(bodyText);
    const nonHeapData = /Non-Heap:.*used = (\d+).*committed = (\d+)/.exec(bodyText);

    const edenSpaceData = /G1 Eden Space:.*used = (\d+).*committed = (\d+).*max = (-?\d+)/.exec(bodyText);
    const oldGenData = /G1 Old Gen:.*used = (\d+).*committed = (\d+).*max = (\d+)/.exec(bodyText);
    const survivorSpaceData = /G1 Survivor Space:.*used = (\d+).*committed = (\d+).*max = (-?\d+)/.exec(bodyText);

    const runtime = /Runtime: (\d+)/.exec(bodyText);
    const threadCPU = /Thread CPU: (\d+)/.exec(bodyText);
    const threadUser = /Thread User: (\d+)/.exec(bodyText);
    const youngGen = /G1 Young Generation: (\d+).*\/ (\d+ms)/.exec(bodyText);
    const oldGen = /G1 Old Generation: (\d+).*\/ (\d+ms)/.exec(bodyText);
    const compilers = /Compilation: HotSpot 64-Bit Tiered Compilers: (\d+)/.exec(bodyText);

    // Parse dos valores de memória
    const heapUsed = parseInt(heapData[1]);
    const heapMax = parseInt(heapData[3]);
    const heapPercentage = (heapUsed / heapMax) * 100;

    const nonHeapUsed = parseInt(nonHeapData[1]);
    const nonHeapCommitted = parseInt(nonHeapData[2]);
    const nonHeapPercentage = (nonHeapUsed / nonHeapCommitted) * 100;

    const edenUsed = parseInt(edenSpaceData[1]);
    const edenMax = parseInt(edenSpaceData[3]);
    const edenPercentage = edenMax !== -1 ? (edenUsed / edenMax) * 100 : 0;

    const oldGenUsed = parseInt(oldGenData[1]);
    const oldGenMax = parseInt(oldGenData[3]);
    const oldGenPercentage = (oldGenUsed / oldGenMax) * 100;

    const survivorUsed = parseInt(survivorSpaceData[1]);
    const survivorMax = parseInt(survivorSpaceData[3]);
    const survivorPercentage = survivorMax !== -1 ? (survivorUsed / survivorMax) * 100 : 0;

    // Gerar alertas
    const alerts = generateAlerts(heapPercentage, nonHeapPercentage, edenPercentage, oldGenPercentage, survivorPercentage);

    // Criar container para a visualização
    const container = document.createElement('div');
    container.style.padding = '20px';
    container.style.fontFamily = 'Arial, sans-serif';
    container.style.background = '#f9f9f9';
    container.style.display = 'inline-block';
    container.style.width = '-webkit-fill-available';
    container.style.marginTop = '-19rem';

    // HTML da visualização
    container.innerHTML = `
        ${createProgressBar('Heap Memory Usage', heapPercentage, heapUsed, heapMax, 'K')}
        ${createProgressBar('Non-Heap Memory Usage', nonHeapPercentage, nonHeapUsed, nonHeapCommitted, 'K')}
        ${createProgressBar('G1 Eden Space', edenPercentage, edenUsed, edenMax, 'K')}
        ${createProgressBar('G1 Old Gen', oldGenPercentage, oldGenUsed, oldGenMax, 'K')}
        ${createProgressBar('G1 Survivor Space', survivorPercentage, survivorUsed, survivorMax, 'K')}

        <div class="metric-container">
            <div class="label">Runtime: ${runtime[1]}</div>
        </div>
        <br>
        <div class="metric-container">
            <div class="label">Thread CPU Time: ${threadCPU[1]} ms</div>
        </div>
        <br>
        <div class="metric-container">
            <div class="label">Thread User Time: ${threadUser[1]} ms</div>
        </div>
        <br>
        <div class="metric-container">
            <div class="label">G1 Young Generation Time: ${youngGen[1]} / ${youngGen[2]}</div>
        </div>
        <br>
        <div class="metric-container">
            <div class="label">G1 Old Generation Time: ${oldGen[1]} / ${oldGen[2]}</div>
        </div>
        <br>
        <div class="metric-container">
            <div class="label">Compilation: ${compilers[1]} compilations</div>
        </div>
        <div class="alerts">
            ${alerts}
        </div>
    `;

    // Estilos CSS
    const style = document.createElement('style');
    style.innerHTML = `
        .memory-container {
            margin-bottom: 20px;
        }
        .label {
            font-weight: bold;
            margin-bottom: 5px;
        }
        .progress-bar {
            width: 100%;
            background-color: #f3f3f3;
            border-radius: 5px;
            overflow: hidden;
            margin-bottom: 10px;
        }
        .progress {
            height: 30px;
            text-align: center;
            line-height: 30px;
            color: white;
            transition: width 0.3s;
        }
        .metric-container {
            margin-bottom: 20px;
        }
        .alert {
            padding: 10px;
            background-color: #ff5722;
            color: white;
            margin-top: 10px;
            border-radius: 5px;
            font-weight: bold;
        }
    `;

    // Adicionar a visualização ao documento
    document.head.appendChild(style);
    document.body.appendChild(container);
}

function insertStyleLogs() {
    (function () {
        // =============================================
        // CONFIGURAÇÃO DE CORES (apenas fundo e texto)
        // =============================================
        const styles = {
            levels: {
                ERROR: { bg: '#ffebee', color: '#c62828' },
                WARN: { bg: '#fff3e0', color: '#ef6c00' },
                INFO: { bg: '#e3f2fd', color: '#1976d2' },
                DEBUG: { bg: '#f5f5f5', color: '#424242' }
            },
            exception: { bg: '#ffebee', color: '#c62828' },
            lucene: { bg: '#e8f5e8', color: '#2e7d32' },
            hover: '#e0e0e0',
            cardColors: {
                Total: '#495057',
                ERROR: '#d32f2f',
                WARN: '#f57c00',
                INFO: '#1976d2',
                DEBUG: '#424242',
                Exceções: '#c62828',
                'Queries Lucene': '#2e7d32'
            }
        };

        let currentFilter = 'all';

        // =============================================
        // CRIA CONTAINER DE CARDS
        // =============================================
        function createCardsContainer() {
            if (document.getElementById('log-stats-cards')) return;

            const container = document.createElement('div');
            container.id = 'log-stats-cards';
            container.style.cssText = `
            display: flex;
            flex-wrap: wrap;
            gap: 16px;
            padding: 16px;
            background: #f8f9fa;
            border-bottom: 2px solid #dee2e6;
            font-family: Arial, Helvetica, sans-serif;
            margin-bottom: 12px;
            justify-content: center;
        `;

            const headerTitle = document.getElementById('headerTitle');
            if (headerTitle && headerTitle.parentElement) {
                headerTitle.parentElement.parentElement.parentElement.after(container);
            } else {
                document.body.insertBefore(container, document.body.firstChild);
            }
        }

        // =============================================
        // ATUALIZA OU CRIA UM CARD (com filtro)
        // =============================================
        function updateCard(title, count, color, filterType) {
            let cardId = `card-${title.toLowerCase().replace(/\s+/g, '-')}`;
            let card = document.getElementById(cardId);

            if (!card) {
                card = document.createElement('div');
                card.id = cardId;
                card.style.cssText = `
                background: white;
                border-radius: 10px;
                padding: 18px;
                min-width: 150px;
                text-align: center;
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                border-top: 6px solid ${color};
                flex: 1;
                cursor: pointer;
                transition: all 0.3s ease;
            `;
                card.onmouseover = () => {
                    if (currentFilter !== filterType) card.style.transform = 'translateY(-6px)';
                };
                card.onmouseout = () => {
                    if (currentFilter !== filterType) card.style.transform = 'translateY(0)';
                };

                card.onclick = () => {
                    currentFilter = (currentFilter === filterType) ? 'all' : filterType;
                    updateAll();
                };

                card.innerHTML = `
                <div class="card-count" style="font-size: 2.6em; font-weight: bold; color: ${color};">0</div>
                <div style="margin-top: 10px; color: #555; font-size: 1em;">${title}</div>
            `;
                document.getElementById('log-stats-cards').appendChild(card);
            }

            const countEl = card.querySelector('.card-count');
            countEl.textContent = count.toLocaleString();
            countEl.style.color = count > 0 ? color : '#aaa';

            if (currentFilter === filterType) {
                card.style.transform = 'translateY(-6px)';
                card.style.boxShadow = '0 8px 20px rgba(0,0,0,0.2)';
                card.style.borderTopWidth = '8px';
            } else {
                card.style.transform = 'translateY(0)';
                card.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                card.style.borderTopWidth = '6px';
            }
        }

        // =============================================
        // APLICA APENAS CORES (sem bordas, sombras, fontes, etc.)
        // =============================================
        function applySimpleColors(container) {
            const lines = container.querySelectorAll('div');

            lines.forEach(line => {
                const text = line.textContent.trim();

                // Oculta linhas completamente vazias
                if (text === '') {
                    line.style.display = 'none';
                    return;
                }

                // Decide se deve mostrar com base no filtro atual
                let shouldShow = true;
                if (currentFilter !== 'all') {
                    switch (currentFilter) {
                        case 'error': shouldShow = /ERROR/.test(text); break;
                        case 'warn': shouldShow = /WARN/.test(text); break;
                        case 'info': shouldShow = /INFO/.test(text); break;
                        case 'debug': shouldShow = /DEBUG/.test(text); break;
                        case 'exception': shouldShow = text.includes('Exception') || text.includes('NullPointerException'); break;
                        case 'lucene': shouldShow = text.includes('Lucene query:'); break;
                    }
                }

                line.style.display = shouldShow ? 'block' : 'none';

                if (shouldShow) {
                    // Reseta tudo para o estilo original
                    line.style.cssText = '';

                    // Aplica apenas cor de fundo e texto de acordo com o tipo
                    const levelMatch = text.match(/^\d{4}-\d{2}-\d{2}-\d{2}:\d{2}:\d{2}\.\d{3} (ERROR|WARN|INFO|DEBUG)/);
                    if (levelMatch) {
                        const level = levelMatch[1];
                        const cfg = styles.levels[level];
                        line.style.backgroundColor = cfg.bg;
                        line.style.color = cfg.color;
                    } else if (text.includes('Exception') || text.includes('NullPointerException')) {
                        line.style.backgroundColor = styles.exception.bg;
                        line.style.color = styles.exception.color;
                    } else if (text.includes('Lucene query:')) {
                        line.style.backgroundColor = styles.lucene.bg;
                        line.style.color = styles.lucene.color;
                    }
                }
            });
        }

        // =============================================
        // ATUALIZA ESTATÍSTICAS + CORES SIMPLES
        // =============================================
        function updateAll() {
            const container = document.getElementById('tail_output');
            if (!container) return;

            createCardsContainer();

            const allLines = container.querySelectorAll('div');
            let visibleLines = 0;
            let counts = { ERROR: 0, WARN: 0, INFO: 0, DEBUG: 0, EXCEPTION: 0, LUCENE: 0 };

            allLines.forEach(line => {
                const text = line.textContent.trim();
                if (text === '') return;

                visibleLines++;

                if (/ERROR/.test(text)) counts.ERROR++;
                if (/WARN/.test(text)) counts.WARN++;
                if (/INFO/.test(text)) counts.INFO++;
                if (/DEBUG/.test(text)) counts.DEBUG++;
                if (text.includes('Exception') || text.includes('NullPointerException')) counts.EXCEPTION++;
                if (text.includes('Lucene query:')) counts.LUCENE++;
            });

            updateCard('Total', visibleLines, styles.cardColors.Total, 'all');
            updateCard('ERROR', counts.ERROR, styles.cardColors.ERROR, 'error');
            updateCard('WARN', counts.WARN, styles.cardColors.WARN, 'warn');
            updateCard('INFO', counts.INFO, styles.cardColors.INFO, 'info');
            updateCard('DEBUG', counts.DEBUG, styles.cardColors.DEBUG, 'debug');
            updateCard('Exceções', counts.EXCEPTION, styles.cardColors.Exceções, 'exception');
            updateCard('Queries Lucene', counts.LUCENE, styles.cardColors['Queries Lucene'], 'lucene');

            applySimpleColors(container);
        }

        // =============================================
        // CSS MÍNIMO (apenas hover sutil)
        // =============================================
        if (!document.getElementById('minimal-log-viewer-css')) {
            const css = document.createElement('style');
            css.id = 'minimal-log-viewer-css';
            css.textContent = `
            #tail_output div {
                transition: background-color 0.2s ease;
                padding: 2px 0;
            }
            #tail_output div:hover {
                background-color: ${styles.hover} !important;
            }
        `;
            document.head.appendChild(css);
        }

        // =============================================
        // INTEGRAÇÃO COM loadTail E MUTAÇÕES
        // =============================================
        const originalLoadTail = window.loadTail;
        if (originalLoadTail) {
            window.loadTail = function () {
                originalLoadTail.apply(this, arguments);
                setTimeout(updateAll, 200);
            };
        }

        const observer = new MutationObserver(updateAll);
        const tailOutput = document.getElementById('tail_output');
        if (tailOutput) {
            observer.observe(tailOutput, { childList: true, subtree: true });
        }

        // Execução inicial
        updateAll();

        console.log('%cLog Viewer SIMPLES ativado: apenas cores suaves + filtros + cards + linhas vazias ocultas.', 'color: #1976d2; font-size: 1.3em;');
    })();
}

function alteraOAlinhamentoParaVisualizacaoDeCamposNaModelagem() {
    let div = document.querySelector('.x-window-body');
    if (div) {

        let tbody = document.getElementById("tbodyFieldTable");

        let cells = tbody.getElementsByTagName("td");

        for (let cell of cells) {
            cell.style.textAlign = "right";
        }

        if (scrollOriginal) {
            div.querySelectorAll('div')[7].scrollLeft = div.querySelectorAll('div')[7].scrollWidth;
            if (div.querySelectorAll('div')[7].scrollLeft > 0) {
                scrollOriginal = false;
            }
        }
    } else {
        scrollOriginal = true;
    }
}

function botaoAtualizarFrame() {
    try {
        if (window.top.document.getElementById("onlyCol").contentWindow.document.getElementById("iframe_task").contentWindow.document.getElementById("btnAtualizarFrame")) {
            return;
        }
        const li = document.createElement('li');
        li.style.listStyleType = 'none';
        li.style.margin = '0.rem';
        li.style.height = '2.07rem';
        li.style.cursor = 'pointer';
        li.style.display = 'inline-block';
        li.id = 'btnAtualizarFrame';

        const a = document.createElement('a');
        a.innerText = 'Atualizar';
        a.style.backgroundColor = 'rgb(240 240 240)';
        a.style.color = 'rgb(104 116 136)';
        a.style.padding = '6px 12px';
        a.style.textDecoration = 'none';
        a.style.display = 'flex';
        a.style.alignItems = 'center';

        a.addEventListener('mouseover', function () {
            a.style.backgroundColor = '#5a7cad';
            a.style.color = '#fff';
        });

        a.addEventListener('mouseout', function () {
            a.style.backgroundColor = 'rgb(240 240 240)';
            a.style.color = 'rgb(104 116 136)';
        });


        a.addEventListener('click', function () {
            try {
                window.top.document.getElementById("onlyCol").contentWindow
                    .document.getElementById("iframe_task").contentWindow.location.reload();
            } catch (error) {
                console.error("Erro ao recarregar o iframe:", error);
            }
        });


        li.appendChild(a);


        if (window.top.document.getElementById("onlyCol")) {
            var targetElement = window.top.document.getElementById("onlyCol").contentWindow.document.getElementById("iframe_task").contentWindow.document.querySelector('.dropdown_actions.pullRight');
            if (targetElement) {
                targetElement.parentNode.insertBefore(li, targetElement);
            }
        }
    } catch (error) {

    }
}


function init() {
    setInterval(function () {
        toggleButtonVisibility();
        criaEventoCopy();
        updateReportCSS();
        addSonicComponent();
        alteraOAlinhamentoParaVisualizacaoDeCamposNaModelagem();
        botaoAtualizarFrame();
    }, 500);

    createDivMenu();
    // Salvar a lista de objetos keySave no localStorage
    saveKeyListToLocalStage(listKeyObjDefault);
    // Adicionar evento de teclado para os objetos keySave
    criaEventoKeyMap(getKeyListFromLocalStorage());
    // Recuperar a lista de objetos keySave do localStorage
    var retrievedKeyList = getKeyListFromLocalStorage();
    // Atualizar a lista de objetos keySave no localStorage
    updateKeyListToLocalStorage(retrievedKeyList);

    if (window.location.href.includes("adm/mem.jsp")) {
        insertStyleMemReport();
    } else if (window.location.href.includes("adm/tomcatLog.jsp")) {
        insertStyleLogs();
    }
}

init();