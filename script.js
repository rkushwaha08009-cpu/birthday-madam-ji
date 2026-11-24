(function () {
    'use strict';

    // Inject protective styles for print-blocking and touch-callout prevention
    const style = document.createElement('style');
    style.textContent = `
        img, video {
            -webkit-user-select: none !important;
            user-select: none !important;
            -webkit-touch-callout: none !important;
            -webkit-user-drag: none !important;
        }
        #privacyShieldOverlay {
            position: fixed;
            inset: 0;
            background: rgba(254, 236, 234, 0.96);
            backdrop-filter: blur(18px);
            -webkit-backdrop-filter: blur(18px);
            z-index: 2147483647;
            display: none;
            align-items: center;
            justify-content: center;
            padding: 24px;
            text-align: center;
        }
        #privacyShieldOverlay.active {
            display: flex;
        }
        .privacy-shield-card {
            background: #fff8e4;
            border: 4px solid #333333;
            border-radius: 22px;
            padding: 28px 24px;
            max-width: 420px;
            width: 100%;
            box-shadow: 0 10px 0 #333333;
            font-family: 'Poppins', sans-serif;
            color: #333333;
        }
        .privacy-shield-card h3 {
            font-family: 'Sriracha', cursive;
            color: #FF7882;
            font-size: 1.5rem;
            margin-bottom: 10px;
        }
        .privacy-shield-card p {
            font-size: 0.95rem;
            line-height: 1.5;
            margin-bottom: 16px;
        }
        .privacy-shield-btn {
            background: #FF7882;
            color: #ffffff;
            border: 3px solid #333333;
            border-radius: 50px;
            padding: 10px 22px;
            font-family: 'Sriracha', cursive;
            font-size: 1rem;
            cursor: pointer;
            box-shadow: 0 4px 0 #333333;
        }
        #protectionToast {
            position: fixed;
            bottom: 24px;
            right: 24px;
            background: #333333;
            color: #ffffff;
            padding: 10px 18px;
            border-radius: 12px;
            border: 2px solid #FF7882;
            font-family: 'Poppins', sans-serif;
            font-size: 0.85rem;
            font-weight: 600;
            z-index: 2147483646;
            opacity: 0;
            pointer-events: none;
            transform: translateY(10px);
            transition: opacity 0.2s ease, transform 0.2s ease;
        }
        #protectionToast.visible {
            opacity: 1;
            transform: translateY(0);
        }
        @media print {
            html, body {
                display: none !important;
                visibility: hidden !important;
            }
        }
    `;
    document.head.appendChild(style);

    let shieldOverlay = null;
    let shieldTimer = null;
    let toastEl = null;
    let toastTimer = null;

    function ensureOverlays() {
        if (!document.body) return;
        if (!shieldOverlay) {
            shieldOverlay = document.createElement('div');
            shieldOverlay.id = 'privacyShieldOverlay';
            shieldOverlay.innerHTML = `
                <div class="privacy-shield-card">
                    <h3>Protected Memories 🔒💖</h3>
                    <p id="privacyShieldMsg">Screenshots and downloads are disabled to keep these memories private.</p>
                    <button type="button" class="privacy-shield-btn" id="resumeViewBtn">Continue Viewing ✨</button>
                </div>
            `;
            document.body.appendChild(shieldOverlay);
            const btn = shieldOverlay.querySelector('#resumeViewBtn');
            if (btn) {
                btn.addEventListener('click', hidePrivacyShield);
            }
        }
        if (!toastEl) {
            toastEl = document.createElement('div');
            toastEl.id = 'protectionToast';
            toastEl.setAttribute('role', 'status');
            document.body.appendChild(toastEl);
        }
    }

    function showToast(msg) {
        ensureOverlays();
        if (!toastEl) return;
        toastEl.textContent = msg;
        toastEl.classList.add('visible');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => {
            toastEl.classList.remove('visible');
        }, 2200);
    }

    function showPrivacyShield(msg, autoHideMs = 0) {
        ensureOverlays();
        if (!shieldOverlay) return;
        const msgNode = shieldOverlay.querySelector('#privacyShieldMsg');
        if (msgNode && msg) msgNode.textContent = msg;
        shieldOverlay.classList.add('active');
        clearTimeout(shieldTimer);
        if (autoHideMs > 0) {
            shieldTimer = setTimeout(hidePrivacyShield, autoHideMs);
        }
    }

    function hidePrivacyShield() {
        clearTimeout(shieldTimer);
        if (shieldOverlay) {
            shieldOverlay.classList.remove('active');
        }
    }

    function hardenMediaElements() {
        document.querySelectorAll('img').forEach((img) => {
            img.setAttribute('draggable', 'false');
            img.oncontextmenu = () => false;
            img.ondragstart = () => false;
        });
        document.querySelectorAll('video').forEach((vid) => {
            vid.setAttribute('controlsList', 'nodownload noplaybackrate');
            vid.setAttribute('disablePictureInPicture', '');
            vid.setAttribute('draggable', 'false');
            vid.oncontextmenu = () => false;
            vid.ondragstart = () => false;
        });
    }

    const observer = new MutationObserver(() => {
        hardenMediaElements();
    });

    document.addEventListener('DOMContentLoaded', () => {
        ensureOverlays();
        hardenMediaElements();
        if (document.body) {
            observer.observe(document.body, { childList: true, subtree: true });
        }
    });

    document.addEventListener('contextmenu', (e) => {
        const tag = e.target && e.target.tagName ? e.target.tagName.toUpperCase() : '';
        if (tag === 'INPUT' || tag === 'TEXTAREA') return;
        e.preventDefault();
        showToast('Saving photos & videos is disabled 💖');
    });

    document.addEventListener('dragstart', (e) => {
        const tag = e.target && e.target.tagName ? e.target.tagName.toUpperCase() : '';
        if (tag === 'IMG' || tag === 'VIDEO') {
            e.preventDefault();
        }
    });

    document.addEventListener('copy', (e) => {
        const sel = window.getSelection ? window.getSelection().toString() : '';
        if (!sel) {
            e.preventDefault();
        }
    });

    document.addEventListener('keydown', (e) => {
        const key = (e.key || '').toLowerCase();
        const ctrlOrMeta = e.ctrlKey || e.metaKey;

        if (e.key === 'PrintScreen' || e.keyCode === 44) {
            e.preventDefault();
            showPrivacyShield('Screenshots are protected on this celebration page 🔒', 3000);
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText('').catch(() => {});
            }
            return;
        }

        if ((ctrlOrMeta && e.shiftKey && (key === 's' || key === '3' || key === '4' || key === '5')) ||
            (e.metaKey && e.shiftKey && (key === 's' || key === '3' || key === '4' || key === '5'))) {
            e.preventDefault();
            showPrivacyShield('Screenshots are protected on this celebration page 🔒', 3000);
            return;
        }

        if (ctrlOrMeta && (key === 's' || key === 'p' || key === 'u')) {
            e.preventDefault();
            showToast('Downloading & printing are disabled 💖');
            return;
        }

        if (e.key === 'F12' ||
            (ctrlOrMeta && e.shiftKey && (key === 'i' || key === 'j' || key === 'c')) ||
            (e.metaKey && e.altKey && (key === 'i' || key === 'j' || key === 'c'))) {
            e.preventDefault();
            showToast('Developer inspection is disabled 🔒');
        }
    });

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            showPrivacyShield('Protected Memories — Return to this tab to continue viewing 💖');
        } else {
            hidePrivacyShield();
        }
    });

    window.addEventListener('blur', () => {
        showPrivacyShield('Protected Memories — Click back inside to continue viewing 💖');
    });

    window.addEventListener('focus', () => {
        hidePrivacyShield();
    });
})();
