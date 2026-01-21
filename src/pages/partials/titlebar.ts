export const TITLEBAR = /* js */ `
if (!document.getElementById('custom-titlebar') && !window.__titlebarInitialized) {
    window.__titlebarInitialized = true;
    const titleBar = document.createElement('div');
    titleBar.id = 'custom-titlebar';
    titleBar.style.position = 'fixed';
    titleBar.style.top = '0';
    titleBar.style.left = '0';
    titleBar.style.width = '100%';
    titleBar.style.color = 'white';
    titleBar.style.display = 'flex';
    titleBar.style.justifyContent = 'flex-end';
    titleBar.style.alignItems = 'center';
    titleBar.style.padding = '0px';
    titleBar.style.zIndex = '999999999';
    titleBar.style.webkitAppRegion = 'drag';
    titleBar.style.transition = 'background-color 0.3s ease, color 0.3s ease';

    const buttons = document.createElement('div');
    buttons.style.display = 'flex';
    buttons.style.gap = '0px';
    buttons.style.webkitAppRegion = 'no-drag';

    function createButton(svg, hoverColor, defaultColor) {
        const btn = document.createElement('button');
        btn.innerHTML = svg;
        btn.style.background = 'none';
        btn.style.border = 'none';
        btn.style.cursor = 'pointer';
        btn.style.width = '28px';
        btn.style.height = '18px';
        btn.style.display = 'flex';
        btn.style.alignItems = 'center';
        btn.style.justifyContent = 'center';
        btn.style.transition = 'background-color 0.2s ease, color 0.2s ease';
        btn.style.color = defaultColor;

        btn.addEventListener('mouseenter', () => {
            btn.style.backgroundColor = hoverColor;
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.backgroundColor = 'transparent';
        });

        return btn;
    }

    const minimizeBtn = createButton(
        '<svg width="9" height="9" xmlns="http://www.w3.org/2000/svg"><line x1="0" y1="4.5" x2="9" y2="4.5" stroke="currentColor" stroke-width="1.1"/></svg>',
        '#ffffff10',
        '#FFFFFFEC'
    );

    const maximizeBtn = createButton(
        '<svg width="9" height="9" xmlns="http://www.w3.org/2000/svg"><rect x="1.5" y="1.5" width="6" height="6" fill="none" stroke="currentColor" stroke-width="1.1"/></svg>',
        '#ffffff10',
        '#FFFFFFEC'
    );

    const closeBtn = createButton(
        '<svg width="9" height="9" xmlns="http://www.w3.org/2000/svg"><line x1="1.5" y1="1.5" x2="7.5" y2="7.5" stroke="currentColor" stroke-width="1.1"/><line x1="7.5" y1="1.5" x2="1.5" y2="7.5" stroke="currentColor" stroke-width="1.1"/></svg>',
        '#D9494BE4',
        '#FFFFFFEC'
    );

    buttons.appendChild(minimizeBtn);
    buttons.appendChild(maximizeBtn);
    buttons.appendChild(closeBtn);
    titleBar.appendChild(buttons);

    document.body.appendChild(titleBar);

    minimizeBtn.addEventListener('click', () => {
        if (window.api && typeof window.api.minimizeWindow === 'function') {
            try {
                window.api.minimizeWindow();
            } catch (error) {
                console.error('Error minimizing window:', error);
            }
        }
    });

    maximizeBtn.addEventListener('click', () => {
        if (window.api && typeof window.api.maximizeWindow === 'function') {
            try {
                window.api.maximizeWindow();
            } catch (error) {
                console.error('Error maximizing window:', error);
            }
        }
    });

    closeBtn.addEventListener('click', () => {
        if (window.api && typeof window.api.closeWindow === 'function') {
            try {
                window.api.closeWindow();
            } catch (error) {
                console.error('Error closing window:', error);
            }
        }
    });

    function updateTheme(color) {
        if (typeof color === 'string') {
            buttons.querySelectorAll('button').forEach(button => {
                button.style.color = color;
            });
        }
    }

    if (window.api && typeof window.api.onThemeUpdate === 'function') {
        try {
            const cleanup = window.api.onThemeUpdate(updateTheme);
            if (typeof cleanup === 'function') {
                window.addEventListener('beforeunload', cleanup);
            }
        } catch (error) {
            console.error('Error setting up theme update:', error);
        }
    }
}
`;
