(() => {
    'use strict';

    // ================= CONFIGURAÇÕES GLOBAIS =================
    const CONFIG = {
        LOG_HEADER_REGEX: /^(\d{4}-\d{2}-\d{2}-\d{2}:\d{2}:\d{2}\.\d{3})\s+(ERROR|WARN|INFO|DEBUG)/,
        THREAD_REGEX: /\[(.*?)\]/,
        TIME_REGEX: /(\d{2}):(\d{2}):(\d{2})/,
        STACK_REGEX: /^(\s*at\s|Caused by:|java\.)/i,
        JOB_SUMMARY_REGEX: /Total de processos iniciados|Tempo total/i,
        STYLES: {
            levels: {
                ERROR: {bg: '#ffebee', color: '#c62828'},
                WARN: {bg: '#fff3e0', color: '#ef6c00'},
                INFO: {bg: '#e3f2fd', color: '#1976d2'},
                DEBUG: {bg: '#f5f5f5', color: '#424242'}
            },
            hover: '#e0e0e0',
            cardColors: {
                TOTAL: '#343a40', ERROR: '#d32f2f', WARN: '#f57c00',
                INFO: '#1976d2', DEBUG: '#424242'
            }
        }
    };

    // ================= ESTADO GLOBAL =================
    let sonicAdded = false;
    let scrollOriginal = true;

    const urlBase = window.location.origin + window.location.pathname;
    const urlSemFusion = urlBase.replace(/\/fusion\/.*$/, '/fusion/');

    // Contadores e estado do log
    let lastTimestampLevel = null;
    let lastTimestampThread = null;
    let lastErrorTime = null;
    let lastErrorText = '';

    const globalCounts = {TOTAL: 0, ERROR: 0, WARN: 0, INFO: 0, DEBUG: 0};
    const threadHeat = Object.create(null);
    const errorPatterns = Object.create(null);
    const errorDeltas = [];

    let currentFilter = 'TOTAL';
    let dash = null;

    // ================= UTILIDADES =================
    const $ = (selector, context = document) => context.querySelector(selector);
    const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];

    const safeExecute = (fn, ...args) => {
        try {
            return fn(...args);
        } catch (e) {
            //ignorar erro
        }
    };

    const mostrarToast = (mensagem) => {
        const toast = document.createElement('div');
        toast.textContent = mensagem;
        toast.style.cssText = `
            position:fixed;top:3%;left:50%;transform:translateX(-50%);
            background:#212121;color:#fff;padding:12px 20px;border-radius:4px;
            z-index:10000;font-size:14px;box-shadow:0 4px 12px rgba(0,0,0,0.3);
        `;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    };

    // ================= FUNÇÕES PRINCIPAIS =================

    // Dump NeoObject
    const criarBotaoDump = () => {
        if ($('#divDump')) return;

        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css';

        var head = document.head || document.getElementsByTagName('head')[0];
        head.appendChild(link);

        const div = document.createElement('div');
        div.id = 'divDump';
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

        div.onclick = () => {
            const getNeoId = () => {
                const iframe = window.top.document.getElementById("onlyCol")?.contentWindow
                    ?.document.getElementById("iframe_task")?.contentWindow;
                return iframe?.document.getElementById("hid_root")?.value;
            };

            const neoId = getNeoId();
            if (neoId) {
                const url = new URL(window.location.href);
                const newPath = url.pathname.substring(0, url.pathname.lastIndexOf("/fusion") + 8);
                window.open(url.origin + newPath + "/adm/dumpNeoObject.jsp?id=" + neoId, "_blank");
            }
        };

        safeExecute(() => {
            setTimeout(() => {
                const target = $('.ui-neo-menu-top-search.col-xs-offset-0');
                if (target) target.parentNode.insertBefore(div, target);
            }, 1500);
        });
    };

    // Copy on right-click
    const habilitarCopyCampos = () => {
        $$('.custom-input-adapter').forEach(el => {
            if (!el.dataset.eventoCopy) {
                el.addEventListener('contextmenu', e => {
                    e.preventDefault();
                    el.select();
                    document.execCommand('copy');
                    el.blur();
                    mostrarToast('Texto copiado!');
                });
                el.dataset.eventoCopy = 'true';
            }
        });
    };

    // Atalhos de teclado
    const keyListDefault = [
        {name: "Salvar Modelagem", className: "icon-save-bpm", key: "s"},
        {name: "Validar Modelagem", className: "icon-validate-bpm", key: "v"},
        {name: "Publicar Modelagem", className: "icon-deploy-bpm", key: "l"},
        {name: "Central", link: "adm/central.jsp", key: "¹"},
        {name: "Form Tree", link: "adm/dumpEForm.jsp", key: "²"},
        {name: "SQL", link: "adm/sql.jsp", key: "³"},
        {name: "Script", link: "adm/script.jsp", key: "£"},
        {name: "Log", link: "adm/log.jsp", key: "¢"},
        {name: "TomCatLog", link: "adm/tomcatLog.jsp", key: "¬"}
    ];

    const salvarKeysDefault = () => {
        if (!localStorage.getItem('keyList')) {
            localStorage.setItem('keyList', JSON.stringify(keyListDefault));
        }
    };

    const aplicarAtalhos = () => {
        const keys = JSON.parse(localStorage.getItem('keyList') || '[]');
        top.document.addEventListener('keydown', e => {
            if (!(e.ctrlKey || e.metaKey) || !e.altKey) return;
            const key = e.key.toLowerCase();

            const match = keys.find(k => k.key.toLowerCase() === key);
            if (!match) return;

            e.preventDefault();

            if (match.link) {
                window.open(urlSemFusion + match.link, "_blank").blur();
            } else if (match.className) {
                $(`.${match.className}`)?.click();
            }
        });
    };

    // Menu flutuante
    const criarMenuFlutuante = () => {
        if ($('#divMenu')) return;

        const divMenu = document.createElement('div');
        divMenu.id = 'divMenu';
        divMenu.title = "Menu de Ferramentas DEV";
        divMenu.innerHTML = `
            <p id="titleMenu">Menu</p>
            <ul id="menu">
                <li><a href="${urlSemFusion}adm/central.jsp" target="_blank">Central</a></li>
                <li><a href="${urlSemFusion}adm/dumpEForm.jsp" target="_blank">Form Tree</a></li>
                <li><a href="${urlSemFusion}adm/sql.jsp" target="_blank">SQL</a></li>
                <li><a href="${urlSemFusion}adm/script.jsp" target="_blank">Script</a></li>
                <li><a href="${urlSemFusion}adm/log.jsp" target="_blank">Log</a></li>
                <li><a href="${urlSemFusion}adm/tomcatLog.jsp" target="_blank">TomCatLog</a></li>
            </ul>
        `;

        document.body.appendChild(divMenu);

        if (!urlBase.includes("/fusion/portal")) {
            $$('#menu li').forEach(li => li.classList.add('liOutPortal'));
            $('#titleMenu').classList.add('titleMenuOutPortal');
        }

        let dragging = false;
        let offsetY = 0;

        divMenu.addEventListener('mousedown', e => {
            dragging = true;
            offsetY = e.clientY - divMenu.getBoundingClientRect().top;
        });

        document.addEventListener('mousemove', e => {
            if (dragging) {
                divMenu.style.top = (e.clientY - offsetY) + 'px';
                divMenu.style.cursor = 'ns-resize';
            }
        });

        document.addEventListener('mouseup', () => {
            dragging = false;
            divMenu.style.cursor = 'pointer';
        });

        divMenu.addEventListener('click', () => {
            divMenu.classList.toggle('rotated');
            $('#menu').classList.toggle('exibir');
            $('#titleMenu').classList.toggle('titleMenuRoteated');
        });

        setTimeout(() => divMenu.style.opacity = 1, 500);
    };

    // Estilos relatório
    const ajustarEstilosRelatorio = () => {
        const iframe = window.top.document.getElementById("onlyCol")?.contentWindow;
        if (!iframe) return;

        const filters = iframe.document.getElementById("timesheet-filters");
        const typeSelector = iframe.document.getElementById("report-type-selector");
        const form = iframe.document.getElementById("csv_form");
        const btnExport = iframe.document.getElementById("export");

        if (filters) {
            filters.style.width = "28rem";
            $$("input", filters).forEach(i => i.style.padding = "15px");
            const select = $("select", filters);
            if (select) {
                select.style.padding = "9px";
                select.style.height = "auto";
            }
        }
        if (typeSelector) {
            typeSelector.style.width = "28rem";
            typeSelector.style.padding = "9px";
        }
        if (form) {
            form.style.display = "flex";
            form.style.flexDirection = "column";
            form.style.alignItems = "center";
            $("span", form).style.marginLeft = "-19rem";
        }
        if (btnExport) btnExport.style.height = "4rem";
    };

    // Alinhamento modelagem
    const alinharCamposModelagem = () => {
        const div = $('.x-window-body');
        if (!div) {
            scrollOriginal = true;
            return;
        }

        const tbody = $('#tbodyFieldTable');
        if (tbody) $$('td', tbody).forEach(td => td.style.textAlign = "right");

        if (scrollOriginal) {
            const scrollDiv = $$('div', div)[7];
            if (scrollDiv) {
                scrollDiv.scrollLeft = scrollDiv.scrollWidth;
                if (scrollDiv.scrollLeft > 0) scrollOriginal = false;
            }
        }
    };

    // Botão atualizar frame
    function criarBotaoAtualizar() {
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

    // Visibilidade botão Dump
    const atualizarVisibilidadeDump = () => {
        const btn = $('#divDump');
        if (!btn) return;

        const temTask = window.top.document.getElementById("task_wrapper_workflow") ||
            window.top.document.getElementById("onlyCol")?.contentWindow
                ?.document.getElementById("iframe_task");

        btn.style.visibility = temTask ? 'visible' : 'hidden';
    };

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
                    ERROR: {bg: '#ffebee', color: '#c62828'},
                    WARN: {bg: '#fff3e0', color: '#ef6c00'},
                    INFO: {bg: '#e3f2fd', color: '#1976d2'},
                    DEBUG: {bg: '#f5f5f5', color: '#424242'}
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

            const highlightPresets = [
                {id: 'amber', label: 'Amarelo / Marrom', bg: '#ffeb3b', color: '#3e2723'},
                {id: 'cyan', label: 'Ciano / Verde Escuro', bg: '#00bcd4', color: '#fff'},
                {id: 'mage', label: 'Rosa / Roxo', bg: '#e91e63', color: '#fff'},
                {id: 'lime', label: 'Lima / Verde', bg: '#8bc34a', color: '#fff'}
            ];
            const highlightStorageKey = 'fusion-log-highlights-list';
            const highlightHistoryKey = 'fusion-log-highlights-history';
            const highlightClass = 'fusion-highlight';
            const getPresetById = id => highlightPresets.find(p => p.id === id) || highlightPresets[0];

            const loadHighlights = () => {
                try {
                    const saved = localStorage.getItem(highlightStorageKey);
                    if (saved) {
                        const parsed = JSON.parse(saved);
                        if (Array.isArray(parsed)) {
                            return parsed;
                        }
                    }
                } catch (err) {
                    // ignorar falhas no storage
                }
                return [];
            };

            const loadHighlightsHistory = () => {
                try {
                    const saved = localStorage.getItem(highlightHistoryKey);
                    if (saved) {
                        const parsed = JSON.parse(saved);
                        if (Array.isArray(parsed)) {
                            return parsed;
                        }
                    }
                } catch (err) {
                    // ignorar falhas no storage
                }
                return [];
            };

            let highlightsList = loadHighlights();
            let highlightsHistory = loadHighlightsHistory();
            let highlightInputEl;
            let highlightPresetEl;
            let highlightListEl;
            let highlightHistoryDropdownEl;

            const persistHighlights = () => {
                try {
                    localStorage.setItem(highlightStorageKey, JSON.stringify(highlightsList));
                } catch (err) {
                    // ignorar
                }
            };

            const persistHighlightsHistory = () => {
                try {
                    localStorage.setItem(highlightHistoryKey, JSON.stringify(highlightsHistory));
                } catch (err) {
                    // ignorar
                }
            };

            const addToHistory = (phrase) => {
                if (!phrase.trim()) return;
                const index = highlightsHistory.indexOf(phrase);
                if (index > -1) {
                    highlightsHistory.splice(index, 1);
                }
                highlightsHistory.unshift(phrase);
                if (highlightsHistory.length > 20) {
                    highlightsHistory = highlightsHistory.slice(0, 20);
                }
                persistHighlightsHistory();
            };

            const renderHistoryDropdown = () => {
                if (!highlightHistoryDropdownEl) return;
                highlightHistoryDropdownEl.innerHTML = '';
                if (highlightsHistory.length === 0) {
                    highlightHistoryDropdownEl.innerHTML = '<div style="color:#999;font-size:11px;padding:8px 12px;text-align:center;">Histórico vazio</div>';
                    return;
                }
                highlightsHistory.forEach((phrase, idx) => {
                    const item = document.createElement('div');
                    item.style.cssText = `
                        display:flex;align-items:center;gap:8px;padding:8px 12px;
                        background:#fff;border-bottom:1px solid #eee;cursor:pointer;
                        transition:background 0.2s ease;
                    `;
                    item.onmouseover = () => item.style.background = '#f5f5f5';
                    item.onmouseout = () => item.style.background = '#fff';
                    item.innerHTML = `
                        <span style="flex:1;font-size:12px;color:#333;word-break:break-all;">
                            ${phrase}
                        </span>
                        <button data-idx="${idx}" class="remove-history" style="
                            background:none;border:none;color:#999;cursor:pointer;
                            font-size:14px;padding:0;line-height:1;
                        ">✕</button>
                    `;
                    item.onclick = (e) => {
                        if (!e.target.classList.contains('remove-history')) {
                            highlightInputEl.value = phrase;
                            highlightInputEl.focus();
                            highlightHistoryDropdownEl.style.display = 'none';
                        }
                    };
                    item.querySelector('.remove-history').addEventListener('click', (e) => {
                        e.stopPropagation();
                        highlightsHistory.splice(idx, 1);
                        persistHighlightsHistory();
                        renderHistoryDropdown();
                    });
                    highlightHistoryDropdownEl.appendChild(item);
                });
                
                const clearBtn = document.createElement('div');
                clearBtn.style.cssText = `
                    padding:8px 12px;background:#fafafa;border-top:1px solid #eee;
                    text-align:center;cursor:pointer;transition:background 0.2s ease;
                    font-size:11px;color:#d32f2f;font-weight:600;
                `;
                clearBtn.textContent = '🗑️ Limpar histórico';
                clearBtn.onmouseover = () => clearBtn.style.background = '#f0f0f0';
                clearBtn.onmouseout = () => clearBtn.style.background = '#fafafa';
                clearBtn.onclick = () => {
                    if (confirm('Tem certeza que deseja remover todo o histórico de highlights?')) {
                        highlightsHistory = [];
                        persistHighlightsHistory();
                        renderHistoryDropdown();
                    }
                };
                highlightHistoryDropdownEl.appendChild(clearBtn);
            };

            const cleanHighlightSpans = (line) => {
                line.querySelectorAll(`.${highlightClass}`).forEach(span => {
                    span.replaceWith(document.createTextNode(span.textContent));
                });
            };

            const highlightNode = (node, phraseLower, length, preset) => {
                if (node.nodeType === Node.TEXT_NODE) {
                    const text = node.textContent;
                    const lower = text.toLowerCase();
                    const idx = lower.indexOf(phraseLower);
                    if (idx >= 0) {
                        const matched = node.splitText(idx);
                        const rest = matched.splitText(length);
                        const span = document.createElement('span');
                        span.className = highlightClass;
                        span.textContent = matched.textContent;
                        span.style.backgroundColor = preset.bg;
                        span.style.color = preset.color;
                        span.style.borderRadius = '3px';
                        span.style.padding = '0 2px';
                        span.style.fontWeight = '600';
                        matched.parentNode.replaceChild(span, matched);
                        highlightNode(rest, phraseLower, length, preset);
                    }
                } else if (node.nodeType === 1) {
                    if (node.classList && node.classList.contains(highlightClass)) return;
                    [...node.childNodes].forEach(child => highlightNode(child, phraseLower, length, preset));
                }
            };

            const applyHighlightsToLine = (line) => {
                cleanHighlightSpans(line);
                highlightsList.forEach(hl => {
                    const rawPhrase = (hl.phrase || '').trim();
                    if (!rawPhrase) return;
                    const phraseLower = rawPhrase.toLowerCase();
                    if (!line.textContent.toLowerCase().includes(phraseLower)) return;
                    const preset = getPresetById(hl.presetId);
                    highlightNode(line, phraseLower, rawPhrase.length, preset);
                });
            };

            const applyHighlightsToAllLines = () => {
                [...container.children].forEach(applyHighlightsToLine);
            };

            const renderHighlightsList = () => {
                if (!highlightListEl) return;
                highlightListEl.innerHTML = '';
                if (highlightsList.length === 0) {
                    highlightListEl.innerHTML = '<div style="color:#999;font-size:11px;padding:8px 12px;text-align:center;">Nenhum highlight adicionado</div>';
                    return;
                }
                highlightsList.forEach((hl, idx) => {
                    const preset = getPresetById(hl.presetId);
                    const item = document.createElement('div');
                    item.style.cssText = `
                        display:flex;align-items:center;gap:8px;padding:8px 12px;
                        background:${preset.bg};border-bottom:1px solid #eee;
                        border-radius:0;margin:0;
                    `;
                    item.innerHTML = `
                        <span style="flex:1;color:${preset.color};font-weight:600;font-size:12px;word-break:break-all;">
                            ${hl.phrase}
                        </span>
                        <button data-idx="${idx}" class="remove-highlight" style="
                            background:none;border:none;color:${preset.color};cursor:pointer;
                            font-size:16px;padding:0;line-height:1;
                        ">🗑️</button>
                    `;
                    item.querySelector('.remove-highlight').addEventListener('click', () => {
                        highlightsList.splice(idx, 1);
                        persistHighlights();
                        renderHighlightsList();
                        applyHighlightsToAllLines();
                    });
                    highlightListEl.appendChild(item);
                });
            };

            const addHighlight = () => {
                if (!highlightInputEl || !highlightPresetEl) return;
                const phrase = highlightInputEl.value.trim();
                if (!phrase) return;
                const presetId = highlightPresetEl.value;
                highlightsList.push({phrase, presetId});
                addToHistory(phrase);
                persistHighlights();
                highlightInputEl.value = '';
                renderHighlightsList();
                applyHighlightsToAllLines();
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
                position:sticky;top:0;z-index:9998;display:flex;flex-direction:column;gap:0;padding:0;
                background:#f1f3f5;border-bottom:2px solid #dee2e6;
            `;
                container.before(c);
                console.log('%cFusion Cards Container criado', 'color:#1976d2;font-weight:bold');
                
                const cardsRow = document.createElement('div');
                cardsRow.id = 'log-stats-cards-row';
                cardsRow.style.cssText = `
                display:flex;gap:12px;padding:12px;background:#f1f3f5;
            `;
                c.appendChild(cardsRow);
                
                createHighlightControls(c);
            }

            function createHighlightControls(parent) {
                if (document.getElementById('log-highlight-controls')) return;
                const wrapper = document.createElement('div');
                wrapper.id = 'log-highlight-controls';
                wrapper.innerHTML = `
                    <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;background:#f9f9f9;border-bottom:1px solid #ddd;font-weight:600;font-size:13px;color:#333;border-top:1px solid #ddd;">
                        ✨ Destacar Texto nos Logs
                    </div>
                    <div class="controls" style="display:flex;gap:8px;align-items:flex-start;padding:8px 12px;background:#f9f9f9;border-bottom:1px solid #ddd;">
                        <div style="position:relative;flex:1;min-width:180px;">
                            <input id="fusion-highlight-text" type="text" placeholder="Digite a frase para destacar (clique para histórico)" autocomplete="off">
                            <div id="fusion-highlight-history" style="
                                position:absolute;top:100%;left:0;width:100%;
                                background:#fff;border:1px solid #c4c4c4;border-top:none;
                                border-radius:0 0 6px 6px;max-height:200px;overflow-y:auto;
                                display:none;z-index:10;box-shadow:0 4px 8px rgba(0,0,0,.1);
                            "></div>
                        </div>
                        <select id="fusion-highlight-preset" aria-label="Paleta de destaque"></select>
                        <button id="fusion-highlight-add">Adicionar</button>
                        <button id="fusion-highlight-clear-all" class="ghost" title="Limpar todos os highlights">🗑️</button>
                    </div>
                    <div id="fusion-highlight-list" style="max-height:150px;overflow-y:auto;"></div>
                `;
                parent.appendChild(wrapper);
                console.log('%cFusion Highlights Panel criado', 'color:#2e7d32;font-weight:bold');
                highlightInputEl = wrapper.querySelector('#fusion-highlight-text');
                highlightPresetEl = wrapper.querySelector('#fusion-highlight-preset');
                highlightListEl = wrapper.querySelector('#fusion-highlight-list');
                highlightHistoryDropdownEl = wrapper.querySelector('#fusion-highlight-history');
                highlightPresets.forEach(preset => {
                    const option = document.createElement('option');
                    option.value = preset.id;
                    option.textContent = preset.label;
                    highlightPresetEl.appendChild(option);
                });
                highlightPresetEl.value = highlightPresets[0].id;
                highlightInputEl.addEventListener('focus', () => {
                    renderHistoryDropdown();
                    highlightHistoryDropdownEl.style.display = 'block';
                });
                highlightInputEl.addEventListener('blur', () => {
                    setTimeout(() => {
                        highlightHistoryDropdownEl.style.display = 'none';
                    }, 200);
                });
                wrapper.querySelector('#fusion-highlight-add').addEventListener('click', addHighlight);
                wrapper.querySelector('#fusion-highlight-clear-all').addEventListener('click', () => {
                    if (confirm('Tem certeza que deseja remover todos os highlights?')) {
                        highlightsList = [];
                        persistHighlights();
                        highlightInputEl.value = '';
                        renderHighlightsList();
                        applyHighlightsToAllLines();
                    }
                });
                highlightInputEl.addEventListener('keydown', e => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        addHighlight();
                    }
                });
                renderHighlightsList();
                applyHighlightsToAllLines();
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
                    document.getElementById('log-stats-cards-row').appendChild(card);
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
                        position:fixed;bottom:0px;right:20px;width:480px;z-index:9999;
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
                        <span>🧠 Fusion Error Intelligence (Alfa)</span>
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
                applyHighlightsToAllLines();
            }

            new MutationObserver(updateAll).observe(container, {childList: true});

            if (!document.getElementById('fusion-log-utils')) {
                const css = document.createElement('style');
                css.id = 'fusion-log-utils';
                css.textContent = `
                #tail_output div:hover {background:${styles.hover}!important;}
                #log-highlight-controls {
                      margin:0;
                      padding:0;
                      background:#fff;
                      border-radius:0;
                      border:none;
                      border-top:1px solid #dee2e6;
                      box-shadow:none;
                      font-size:12px;
                      display:flex !important;
                      flex-direction:column;
                      gap:0;
                      visibility:visible !important;
                      width:100%;
                      overflow:visible;
                  }
                  #log-highlight-controls .controls {
                      display:flex;
                      flex-wrap:wrap;
                      gap:8px;
                      align-items:center;
                      padding:12px;
                      background:#fff;
                  }
                  #log-highlight-controls input {
                      flex:1;
                      min-width:180px;
                      padding:10px 12px;
                      border-radius:6px;
                      border:1px solid #c4c4c4;
                      font-size:13px;
                      outline:none;
                      visibility:visible !important;
                      display:block !important;
                      background:#fff;
                      width: -webkit-fill-available;
                  }
                  #log-highlight-controls input:focus {
                      border-color:#2e7d32;
                      box-shadow:0 0 0 2px rgba(46,125,50,0.1);
                  }
                  #log-highlight-controls select {
                      flex:0 1 auto;
                      min-width:140px;
                      padding:10px 12px;
                      border-radius:6px;
                      border:1px solid #c4c4c4;
                      font-size:13px;
                      outline:none;
                      visibility:visible !important;
                      display:block !important;
                      background:#fff;
                      cursor:pointer;
                      height:38px;
                  }
                  #log-highlight-controls select:focus {
                      border-color:#2e7d32;
                      box-shadow:0 0 0 2px rgba(46,125,50,0.1);
                  }
                  #log-highlight-controls button {
                      padding:10px 16px;
                      border:none;
                      border-radius:6px;
                      background:#2e7d32;
                      color:#fff;
                      cursor:pointer;
                      font-size:13px;
                      font-weight:600;
                      display:inline-block;
                      visibility:visible !important;
                      transition:background 0.2s ease;
                      flex:0 0 auto;
                  }
                  #log-highlight-controls button#fusion-highlight-clear-all {
                      padding:10px 14px;
                      font-size:14px;
                  }
                  #log-highlight-controls button:hover {
                      background:#1b5e20;
                  }
                  #log-highlight-controls button:active {
                      transform:scale(0.98);
                  }
                  #log-highlight-controls button.ghost {
                      background:#f1f1f1;
                      color:#333;
                      border:1px solid #ccc;
                  }
                  #log-highlight-controls button.ghost:hover {
                      background:#e0e0e0;
                      border-color:#bbb;
                  }
                  #fusion-highlight-list {
                      border-top:1px solid #dee2e6;
                  }
                  .fusion-highlight-preview {
                      padding:4px 12px;
                      border-radius:16px;
                      font-size:12px;
                      font-weight:600;
                      display:inline-block;
                      white-space:nowrap;
                      border:1px solid;
                  }
                  .fusion-highlight {
                      border-radius:3px;
                      padding:0 2px;
                      font-weight:600;
                  }
                `;
                document.head.appendChild(css);
            }

            updateAll();
            console.log('%cFusion Log Analyzer PRO v9 - Última linha colorida + contagem corrigida', 'color:#2e7d32;font-size:16px;font-weight:bold');

        })();
    }

    // ================= INICIALIZAÇÃO =================
    const init = () => {
        // Carregar Font Awesome
        if (!$('link[href*="font-awesome"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css';
            document.head.appendChild(link);
        }

        // CSS geral
        if (!$('#fusion-log-css')) {
            const style = document.createElement('style');
            style.id = 'fusion-log-css';
            style.textContent = `
                #tail_output div:hover {background:${CONFIG.STYLES.hover}!important;}
            `;
            document.head.appendChild(style);
        }

        setInterval(() => {
            atualizarVisibilidadeDump();
            habilitarCopyCampos();
            ajustarEstilosRelatorio();
            alinharCamposModelagem();
            criarBotaoAtualizar();
        }, 500);

        criarBotaoDump();
        criarMenuFlutuante();
        salvarKeysDefault();
        aplicarAtalhos();

        if (location.href.includes("adm/mem.jsp")) {
            insertStyleMemReport();
        } else if (location.href.includes("adm/tomcatLog.jsp") || location.href.includes("adm/log.jsp")) {
            insertStyleLogs();
        }
    };

    init();
})();