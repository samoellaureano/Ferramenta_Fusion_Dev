const DEFAULT_REGEX = '\\/fusion\\/';

document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('fusion-regex');
    const saveBtn = document.getElementById('save-regex');
    const resetBtn = document.getElementById('reset-regex');
    const status = document.getElementById('save-status');

    chrome.storage.local.get('fusionUrlRegex', (data) => {
        input.value = data.fusionUrlRegex !== undefined ? data.fusionUrlRegex : DEFAULT_REGEX;
    });

    saveBtn.addEventListener('click', () => {
        const pattern = input.value.trim();
        try {
            new RegExp(pattern);
        } catch (e) {
            status.textContent = 'Regex inválida!';
            status.style.color = '#ff8a80';
            setTimeout(() => { status.textContent = ''; status.style.color = ''; }, 3000);
            return;
        }
        chrome.storage.local.set({ fusionUrlRegex: pattern }, () => {
            status.textContent = 'Salvo!';
            status.style.color = '#a8e6a3';
            setTimeout(() => { status.textContent = ''; status.style.color = ''; }, 2000);
        });
    });

    resetBtn.addEventListener('click', () => {
        input.value = DEFAULT_REGEX;
        chrome.storage.local.set({ fusionUrlRegex: DEFAULT_REGEX }, () => {
            status.textContent = 'Padrão restaurado!';
            status.style.color = '#a8e6a3';
            setTimeout(() => { status.textContent = ''; status.style.color = ''; }, 2000);
        });
    });
});
