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

        const container = document.getElementById('tail_output');
        const LOG_HEADER_REGEX = /^(\d{4}-\d{2}-\d{2}-\d{2}:\d{2}:\d{2}\.\d{3})\s+(ERROR|WARN|INFO|DEBUG)/;

        if (!container) return;

        /* ================= CONFIG ================= */
        const styles = {
            levels: {
                ERROR: { bg: '#ffebee', color: '#c62828' },
                WARN: { bg: '#fff3e0', color: '#ef6c00' },
                INFO: { bg: '#e3f2fd', color: '#1976d2' },
                DEBUG: { bg: '#f5f5f5', color: '#424242' }
            },
            hover: '#e0e0e0',
            cardColors: {
                TOTAL: '#343a40',
                ERROR: '#d32f2f',
                WARN: '#f57c00',
                INFO: '#1976d2',
                DEBUG: '#424242'
            }
        };

        let lastErrorTime = null;
        let currentFilter = 'TOTAL';

        const threadHeat = Object.create(null);
        const errorPatterns = Object.create(null);
        const errorDeltas = [];

        let lastErrorText = '';

        /* ================= ESTADO DE HERANÇA E CONTADORES ================= */
        let lastTimestampLevel = null;   // nível do último log com timestamp
        let lastTimestampThread = null;

        const globalCounts = {
            TOTAL: 0,
            ERROR: 0,
            WARN: 0,
            INFO: 0,
            DEBUG: 0
        };

        const isErrorContinuation = txt => /^(\s*at\s|Caused by:|java\.)/i.test(txt.trim());

        /* ================= PROCESS LINE ================= */
        function processLine(line) {
            if (line.dataset.processed) return;
            line.dataset.processed = '1';

            globalCounts.TOTAL++; // conta TODAS as linhas

            const rawText = line.textContent;
            const trimmed = rawText.trim();
            if (!trimmed) return;

            const match = rawText.match(LOG_HEADER_REGEX);

            let assignedLevel = null;

            /* ===== LINHA SEM TIMESTAMP (continuação) ===== */
            if (!match) {
                let levelToUse = lastTimestampLevel;

                // Detecção especial para linhas de resumo de JOB (sempre INFO)
                if (/Total de processos iniciados|Tempo total/i.test(rawText)) {
                    levelToUse = 'INFO';
                }
                // Stacktrace tem prioridade máxima
                else if (isErrorContinuation(rawText)) {
                    levelToUse = 'ERROR';
                }

                if (levelToUse) {
                    line.dataset.level = levelToUse;
                    line.dataset.thread = lastTimestampThread || '';

                    line.style.backgroundColor = styles.levels[levelToUse].bg;
                    line.style.color = styles.levels[levelToUse].color;
                    line.style.paddingLeft = '22px';
                    line.style.fontStyle = isErrorContinuation(rawText) ? 'normal' : 'italic';

                    if (levelToUse === 'ERROR' && lastErrorText) {
                        lastErrorText += '\n' + rawText;
                    }

                    // Contagem: apenas stacktrace conta como ERROR extra
                    if (isErrorContinuation(rawText)) {
                        globalCounts.ERROR++;
                    }
                } else {
                    // Fallback neutro
                    line.style.backgroundColor = '#ffffff';
                    line.style.color = '#000000';
                    line.style.paddingLeft = '22px';
                    line.style.fontStyle = 'italic';
                }
                return;
            }
            /* ===== LINHA COM TIMESTAMP ===== */
            else {
                assignedLevel = match[2];
                lastTimestampLevel = assignedLevel;

                const tm = rawText.match(/\[(.*?)\]/);
                if (tm) lastTimestampThread = tm[1];

                if (assignedLevel === 'ERROR') {
                    lastErrorText = rawText;
                }

                // Contagem correta por nível
                globalCounts[assignedLevel]++;
            }

            // === APLICA ESTILOS (sempre, mesmo na última linha) ===
            if (assignedLevel && styles.levels[assignedLevel]) {
                line.dataset.level = assignedLevel;
                line.dataset.thread = lastTimestampThread || '';

                line.style.backgroundColor = styles.levels[assignedLevel].bg;
                line.style.color = styles.levels[assignedLevel].color;
                line.style.paddingLeft = '22px';
                line.style.fontStyle = assignedLevel === 'ERROR' && isErrorContinuation(rawText) ? 'normal' : 'italic';
            } else {
                // Fallback para linhas órfãs
                line.style.backgroundColor = '#ffffff';
                line.style.color = '#000000';
                line.style.paddingLeft = '22px';
                line.style.fontStyle = 'italic';
            }

            // Badge de thread (só na linha com header)
            if (match) {
                const tm = rawText.match(/\[(.*?)\]/);
                if (tm) {
                    const badge = document.createElement('span');
                    badge.textContent = tm[1];
                    badge.style.cssText = `
                        background:#b0b0b0;border-radius:6px;padding:2px 6px;
                        margin-right:6px;font-size:11px;font-family:monospace;
                    `;
                    line.prepend(badge);
                }

                line.onclick = () => line.classList.toggle('pinned');

                /* ===== ANALYTICS (só linhas com header ERROR) ===== */
                if (assignedLevel === 'ERROR') {
                    if (lastTimestampThread) {
                        threadHeat[lastTimestampThread] = (threadHeat[lastTimestampThread] || 0) + 1;
                    }

                    const normalized = rawText.replace(/\d+/g, '#').slice(0, 160);
                    errorPatterns[normalized] = (errorPatterns[normalized] || 0) + 1;

                    const t = rawText.match(/(\d{2}):(\d{2}):(\d{2})/);
                    if (t) {
                        const seconds = (+t[1]) * 3600 + (+t[2]) * 60 + (+t[3]);
                        if (lastErrorTime !== null) {
                            const delta = seconds - lastErrorTime;
                            if (delta >= 0) errorDeltas.push(delta);
                        }
                        lastErrorTime = seconds;
                    }
                }
            }
        }

        /* ================= FILTRO (apenas visual) ================= */
        function applyFilter() {
            [...container.children].forEach(l => {
                const level = l.dataset.level;
                l.style.display = (currentFilter === 'TOTAL' || level === currentFilter) ? 'block' : 'none';
            });
        }

        /* ================= CARDS (contagem fixa, total real) ================= */
        function createCardsContainer() {
            if (document.getElementById('log-stats-cards')) return;
            const c = document.createElement('div');
            c.id = 'log-stats-cards';
            c.style.cssText = `
                position:sticky;top:0;z-index:9998;display:flex;gap:12px;padding:12px;
                background:#f1f3f5;border-bottom:2px solid #dee2e6;
            `;
            container.before(c);
        }

        function updateCard(title, count, color) {
            let card = document.getElementById(`card-${title}`);
            if (!card) {
                card = document.createElement('div');
                card.id = `card-${title}`;
                card.style.cssText = `
                    flex:1;background:#fff;border-radius:10px;padding:16px;text-align:center;
                    cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.1);border-top:6px solid ${color};
                `;
                card.onclick = () => {
                    currentFilter = currentFilter === title ? 'TOTAL' : title;
                    applyFilter();
                    renderDashboard();
                };
                card.innerHTML = `
                    <div class="count" style="font-size:2.2em;color:${color}">0</div>
                    <div style="color:#555">${title}</div>
                `;
                document.getElementById('log-stats-cards').appendChild(card);
            }
            card.querySelector('.count').textContent = count;
        }

        function updateCards() {
            updateCard('TOTAL', globalCounts.TOTAL, styles.cardColors.TOTAL);
            updateCard('ERROR', globalCounts.ERROR, styles.cardColors.ERROR);
            updateCard('WARN', globalCounts.WARN, styles.cardColors.WARN);
            updateCard('INFO', globalCounts.INFO, styles.cardColors.INFO);
            updateCard('DEBUG', globalCounts.DEBUG, styles.cardColors.DEBUG);
        }

        /* ================= DASHBOARD (inalterado) ================= */
        // ... (mesmo código do seu dashboard original, mantido igual)

        let dash = null;
        let lastRender = 0;

        function renderDashboard() {
    const now = Date.now();
    if (now - lastRender < 500) return;
    lastRender = now;

    const totalErrors = Object.values(errorPatterns).reduce((a, b) => a + b, 0);
    if (!totalErrors) {
        if (dash) dash.style.display = 'none';
        return;
    }

    let dominantError = null;
    let dominantCount = 0;
    let wrapperError = null;

    for (const [msg, count] of Object.entries(errorPatterns)) {
        if (/resteasy|exceptionhandler|failed to execute/i.test(msg)) {
            if (!wrapperError || count > wrapperError[1]) wrapperError = [msg, count];
            continue;
        }
        if (count > dominantCount) {
            dominantError = [msg, count];
            dominantCount = count;
        }
    }
    const finalError = dominantError || wrapperError;

    let worstThread = null;
    let worstThreadCount = 0;
    for (const [t, c] of Object.entries(threadHeat)) {
        if (c > worstThreadCount) {
            worstThread = t;
            worstThreadCount = c;
        }
    }

    const avgDelta = errorDeltas.length ? errorDeltas.reduce((a, b) => a + b, 0) / errorDeltas.length : null;

    if (!dash) {
        dash = document.createElement('div');
        dash.id = 'fusion-dashboard';
        dash.style.cssText = `
            position:fixed;bottom:20px;right:20px;width:480px;z-index:9999;
            background:#fff;border-radius:14px;box-shadow:0 12px 35px rgba(0,0,0,.25);
            font-family:system-ui,monospace;font-size:13px;
        `;
        document.body.appendChild(dash);
    }
    dash.style.display = 'block';

    let errorType = 'Indefinido';
    let actionHint = 'Investigar stacktrace raiz';
    let rootCause = 'Desconhecida';

    if (finalError) {
        const e = finalError[0].toLowerCase();
        if (/lazy|null.*transaction|no session|hibernate|jpa/.test(e)) {
            errorType = '🧩 Hibernate / Transação';
            rootCause = 'Acesso a entidade fora de contexto transacional';
            actionHint = 'Adicionar @Transactional, usar fetch join ou DTO.';
        } else if (/resteasy|rest/.test(e)) {
            errorType = '🌐 REST (Erro wrapper)';
            rootCause = 'Exceção encapsulada';
            actionHint = 'Localizar erro imediatamente anterior no log.';
        } else if (/timeout|connection|socket|pool/.test(e)) {
            errorType = '🌐 Infraestrutura';
            rootCause = 'Instabilidade externa';
            actionHint = 'Verificar banco, pool de conexões ou serviços.';
        } else if (/permission|auth|security/.test(e)) {
            errorType = '🔐 Segurança';
            rootCause = 'Contexto inválido';
            actionHint = 'Validar permissões e usuário autenticado.';
        } else if (/nullpointer|illegalstate/.test(e)) {
            errorType = '💥 Bug de código';
            rootCause = 'Estado inválido da aplicação';
            actionHint = 'Adicionar validações defensivas.';
        } else if (/outofmemory|gc overhead/.test(e)) {
            errorType = '🧠 Memória / Performance';
            rootCause = 'Falta de recursos';
            actionHint = 'Analisar heap e otimizar consultas ou cargas.';
        } else if (/sqlsyntax|constraint|deadlock|jdbc/.test(e)) {
            errorType = '🗄️ Banco de Dados';
            rootCause = 'Erro em operação de banco';
            actionHint = 'Revisar query SQL e integridade dos dados.';
        } else {
            errorType = '❓ Desconhecido';
            rootCause = 'Causa não identificada';
            actionHint = 'Analisar stacktrace e contexto da aplicação.';
        }
    }

    const burst = avgDelta !== null && avgDelta < 10 ? '🔥 Explosão de erros'
        : avgDelta !== null && avgDelta < 60 ? '⚠️ Frequentes' : '🟢 Esporádicos';

    let risk = '🟢 Baixo';
    if (totalErrors > 10 || (avgDelta !== null && avgDelta < 15)) risk = '🔴 Alto';
    else if (totalErrors > 3 || (avgDelta !== null && avgDelta < 60)) risk = '🟠 Médio';

    const flowConcentration = worstThreadCount / totalErrors > 0.6
        ? 'Erro concentrado em um fluxo específico'
        : 'Erro distribuído no sistema';

    dash.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 14px;background:#212529;color:#fff;border-radius:14px 14px 0 0;font-weight:600;">
            <span>🧠 Fusion Error Intelligence</span>
            <span style="cursor:pointer;font-size:16px" id="fusion-toggle-btn">➕</span>
        </div>
        <div class="body" style="padding:14px;line-height:1.6;display:none;">
            <b>Status:</b> ${risk} &nbsp;|&nbsp; ${burst}<br>
            <b>Tipo:</b> ${errorType}
            <hr>
            <b>🧠 Diagnóstico</b><br>
            <b>Causa provável:</b> ${rootCause}<br>
            <b>Impacto:</b> ${flowConcentration}
            <hr>
            <b>🔥 Erro dominante (${finalError ? finalError[1] : 0}x)</b>
            <div style="margin-top:4px;background:#ffebee;color:#b71c1c;padding:6px 8px;border-radius:6px;font-size:12px;max-height:70px;overflow:auto;">
                ${finalError ? finalError[0].replace(/#/g, '*') : '-'}
            </div>
            <div style="margin-top:8px">
                <b>🧵 Thread crítica:</b> ${worstThread || '-'}<br>
                <b>⏱️ MTBE médio:</b> ${avgDelta ? avgDelta.toFixed(1) + 's' : '-'}
            </div>
            <hr>
            <b>🛠️ Próxima ação recomendada</b><br>
            <span style="color:#2e7d32">${actionHint}</span>
            <hr>
            <b>📌 Último erro real</b>
            <div style="margin-top:4px;font-size:12px;color:#c62828;max-height:80px;overflow:auto;">
                ${lastErrorText || '-'}
            </div>
        </div>
    `;

    // Adiciona o evento de toggle apenas uma vez
    const toggleBtn = dash.querySelector('#fusion-toggle-btn');
    if (toggleBtn && !toggleBtn.dataset.listenerAdded) {
        toggleBtn.dataset.listenerAdded = 'true';
        toggleBtn.onclick = function () {
            const body = dash.querySelector('.body');
            if (body.style.display === 'none') {
                body.style.display = 'block';
                this.textContent = '➖';
            } else {
                body.style.display = 'none';
                this.textContent = '➕';
            }
        };
    }
}

        /* ================= UPDATE ================= */
        function updateAll() {
            // Reseta contadores
            lastErrorTime = null;
            currentFilter = 'TOTAL';
            Object.keys(globalCounts).forEach(k => globalCounts[k] = 0);
            Object.keys(threadHeat).forEach(k => delete threadHeat[k]);
            Object.keys(errorPatterns).forEach(k => delete errorPatterns[k]);
            errorDeltas.length = 0;
            lastErrorText = '';
            lastTimestampLevel = null;
            lastTimestampThread = null;
            
            createCardsContainer();

            // Processa todas as linhas (garante que a última seja colorida)
            [...container.children].forEach(processLine);

            updateCards();
            applyFilter();
            renderDashboard();
        }

        new MutationObserver(updateAll).observe(container, { childList: true });

        if (!document.getElementById('fusion-log-css')) {
            const css = document.createElement('style');
            css.id = 'fusion-log-css';
            css.textContent = `
                #tail_output div:hover {background:${styles.hover}!important;}
                .pinned {border-left:4px solid red!important;}
            `;
            document.head.appendChild(css);
        }

        updateAll();
        console.log('%cFusion Log Analyzer PRO v9 - Última linha colorida + contagem corrigida', 'color:#2e7d32;font-size:16px;font-weight:bold');

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