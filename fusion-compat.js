(() => {
    'use strict';

    if (typeof window.doScroll !== 'function') {
        window.doScroll = elementId => {
            const element = typeof elementId === 'string'
                ? document.getElementById(elementId)
                : elementId;

            if (element && typeof element.scrollIntoView === 'function') {
                element.scrollIntoView({ block: 'nearest' });
            }
        };
    }
})();
