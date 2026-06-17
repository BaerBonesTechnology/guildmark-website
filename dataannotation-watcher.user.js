// ==UserScript==
// @name         DataAnnotation Task Watcher
// @namespace    https://app.dataannotation.tech
// @version      1.3
// @description  Refreshes DataAnnotation every 5 minutes while you're idle on the page, alerts when a project appears
// @author       Jamie
// @match        https://app.dataannotation.tech/workers/projects*
// @grant        GM_notification
// ==/UserScript==

(function () {
    'use strict';

    const REFRESH_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
    const IDLE_THRESHOLD_MS   = 60 * 1000;      // considered idle after 60 s of no input

    // ── Idle tracking (window-context specific) ───────────────────────────────
    // Idle = tab is not focused OR tab is hidden OR no input for IDLE_THRESHOLD_MS
    let lastActivity = Date.now();
    const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    ACTIVITY_EVENTS.forEach(evt =>
        document.addEventListener(evt, () => { lastActivity = Date.now(); }, { passive: true })
    );

    function isIdle() {
        const tabHidden   = document.visibilityState === 'hidden';
        const tabUnfocused = !document.hasFocus();
        const inputIdle   = (Date.now() - lastActivity) >= IDLE_THRESHOLD_MS;
        return tabHidden || tabUnfocused || inputIdle;
    }

    // ── Detection ─────────────────────────────────────────────────────────────
    // Targets the exact DOM structure used by DataAnnotation:
    //   <span class="tw-inline-flex ...">
    //     Projects
    //     <span class="tw-rounded-full ...">3</span>
    //   </span>
    function getProjectCount() {
        const badges = document.querySelectorAll('span[class*="tw-rounded-full"]');
        for (const badge of badges) {
            const n = parseInt(badge.textContent?.trim() ?? '', 10);
            if (isNaN(n) || n <= 0) continue;
            const parent = badge.closest('span');
            if (parent && parent.textContent.includes('Projects')) return n;
        }
        return 0;
    }

    // ── Notification ──────────────────────────────────────────────────────────
    function alertUser(count) {
        // 1. Prominent on-page banner
        const banner = document.createElement('div');
        banner.id = 'da-task-banner';
        banner.style.cssText = [
            'position:fixed', 'top:0', 'left:0', 'right:0', 'z-index:2147483647',
            'background:#16a34a', 'color:#fff', 'padding:18px 24px',
            'text-align:center', 'font:700 20px/1.4 sans-serif',
            'box-shadow:0 4px 16px rgba(0,0,0,.4)',
        ].join(';');
        banner.innerHTML = `
            🎉 &nbsp;DataAnnotation: <strong>${count} project${count > 1 ? 's' : ''} available!</strong>
            &nbsp;&nbsp;
            <button onclick="document.getElementById('da-task-banner').remove()"
                style="padding:4px 14px;background:#fff;color:#16a34a;
                       border:none;border-radius:6px;cursor:pointer;font-weight:700">
                Dismiss
            </button>
        `;
        document.body.prepend(banner);

        // 2. Change tab title
        document.title = `🎉 ${count} TASK${count > 1 ? 'S' : ''} AVAILABLE — DataAnnotation`;

        // 3. Browser Notification API
        function sendNotification() {
            new Notification('DataAnnotation — Task Ready!', {
                body: `${count} project${count > 1 ? 's' : ''} available. Click to open.`,
                icon: 'https://app.dataannotation.tech/favicon.ico',
                requireInteraction: true,
            });
        }
        if (Notification.permission === 'granted') {
            sendNotification();
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then(p => { if (p === 'granted') sendNotification(); });
        }

        // 4. GM_notification fallback
        if (typeof GM_notification !== 'undefined') {
            GM_notification({
                title: 'DataAnnotation — Task Ready!',
                text: `${count} project${count > 1 ? 's' : ''} available!`,
                timeout: 0,
            });
        }

        // 5. Audible beep (3 short tones)
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            [0, 0.35, 0.70].forEach(offset => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.frequency.value = 880;
                osc.type = 'sine';
                gain.gain.setValueAtTime(0.4, ctx.currentTime + offset);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + offset + 0.28);
                osc.start(ctx.currentTime + offset);
                osc.stop(ctx.currentTime + offset + 0.30);
            });
        } catch (_) { /* audio blocked — ignore */ }
    }

    // ── Status bar ────────────────────────────────────────────────────────────
    function createStatusBar() {
        const bar = document.createElement('div');
        bar.id = 'da-watcher-bar';
        bar.style.cssText = [
            'position:fixed', 'bottom:16px', 'right:16px', 'z-index:2147483646',
            'background:rgba(0,0,0,.75)', 'color:#e2e8f0',
            'padding:7px 14px', 'border-radius:8px',
            'font:13px/1.5 monospace', 'user-select:none',
            'pointer-events:none',
        ].join(';');
        document.body.appendChild(bar);
        return bar;
    }

    function formatTime(ms) {
        const s = Math.ceil(ms / 1000);
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m}:${sec.toString().padStart(2, '0')}`;
    }

    // ── Main ──────────────────────────────────────────────────────────────────
    function main() {
        const count = getProjectCount();
        if (count > 0) {
            alertUser(count);
            return; // task found — stop
        }

        const bar = createStatusBar();
        let deadline = Date.now() + REFRESH_INTERVAL_MS;
        let paused = false;

        const tick = setInterval(() => {
            const idle = isIdle();

            if (!idle) {
                // User is active — pause the countdown, reset deadline on resume
                if (!paused) {
                    paused = true;
                    deadline = Date.now() + REFRESH_INTERVAL_MS; // reset timer
                }
                bar.textContent = '⏸ Watcher paused — active session detected';
                return;
            }

            // User is idle — resume countdown
            if (paused) {
                paused = false;
                deadline = Date.now() + REFRESH_INTERVAL_MS; // fresh 5 min from now
            }

            const remaining = deadline - Date.now();
            if (remaining <= 0) {
                clearInterval(tick);
                bar.textContent = '👀 Refreshing…';
                window.location.reload();
                return;
            }

            bar.textContent = `👀 Watching (idle) — refresh in ${formatTime(remaining)}`;
        }, 500);
    }

    // Wait for the SPA to render (2 s grace period after load)
    if (document.readyState === 'complete') {
        setTimeout(main, 2000);
    } else {
        window.addEventListener('load', () => setTimeout(main, 2000));
    }

})();
