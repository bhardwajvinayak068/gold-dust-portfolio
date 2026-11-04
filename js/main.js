/* Site controller: menu, keyboard shortcuts, Kuala Lumpur clock, contact form and copy-to-clipboard.
   Every module guards on its own markup, so one script serves all pages. */
(function () {
    'use strict';

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function initMenu() {
        const toggle = document.getElementById('mobile-menu-toggle');
        const overlay = document.getElementById('mobile-menu-overlay');
        const closeBtn = document.getElementById('mobile-menu-close');
        if (!toggle || !overlay) return;

        function open() {
            toggle.classList.add('active');
            overlay.classList.add('active');
            toggle.setAttribute('aria-expanded', 'true');
            overlay.setAttribute('aria-hidden', 'false');
            overlay.removeAttribute('inert');
            document.body.style.overflow = 'hidden';
            if (closeBtn) setTimeout(() => closeBtn.focus(), 150);
        }

        function close(returnFocus = true) {
            toggle.classList.remove('active');
            overlay.classList.remove('active');
            toggle.setAttribute('aria-expanded', 'false');
            overlay.setAttribute('aria-hidden', 'true');
            overlay.setAttribute('inert', '');
            document.body.style.overflow = '';
            if (returnFocus) toggle.focus();
        }

        toggle.addEventListener('click', () => (overlay.classList.contains('active') ? close() : open()));
        if (closeBtn) closeBtn.addEventListener('click', () => close());
        // Clicking the dimmed page beside the panel closes the menu
        overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
        overlay.querySelectorAll('.mobile-nav-item, #mobile-cta-link').forEach((link) => {
            link.addEventListener('click', () => close(false));
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && overlay.classList.contains('active')) close();
        });
    }

    function initShortcuts() {
        const hud = document.getElementById('command-hud');
        const overlay = document.getElementById('command-hud-overlay');
        const closeBtn = document.getElementById('hud-close');
        if (!hud || !overlay) return;

        const sections = { 1: '#hero', 2: '#services', 3: '#work', 4: '#faq', 5: '#videos', 6: '#contact' };
        let trigger = null;
        const isOpen = () => hud.classList.contains('active');

        function setOpen(state) {
            hud.classList.toggle('active', state);
            hud.classList.toggle('open', state);
            overlay.classList.toggle('active', state);
            hud.setAttribute('aria-hidden', String(!state));
            overlay.setAttribute('aria-hidden', String(!state));
            hud.toggleAttribute('inert', !state);
            document.body.classList.toggle('modal-open', state);
            if (state) {
                trigger = document.activeElement;
                setTimeout(() => closeBtn && closeBtn.focus(), 100);
            } else if (trigger && trigger.focus) {
                trigger.focus();
            }
        }

        if (closeBtn) closeBtn.addEventListener('click', () => setOpen(false));
        overlay.addEventListener('click', () => setOpen(false));
        hud.addEventListener('click', (e) => { if (e.target === hud) setOpen(false); });

        window.addEventListener('keydown', (e) => {
            if ((e.target.closest && e.target.closest('input, textarea, select')) || e.metaKey || e.ctrlKey || e.altKey) return;
            if (e.key === '?') {
                e.preventDefault();
                setOpen(!isOpen());
                return;
            }
            if (e.key === 'Escape' && isOpen()) {
                e.preventDefault();
                setOpen(false);
                return;
            }
            const target = sections[e.key] && document.querySelector(sections[e.key]);
            if (!target) return;
            e.preventDefault();
            if (isOpen()) setOpen(false);
            target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
        });
    }

    function initClock() {
        const clock = document.getElementById('world-clock');
        if (!clock) return;
        const format = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kuala_Lumpur', hour: '2-digit', minute: '2-digit', hour12: false });
        const tick = () => { clock.textContent = `Kuala Lumpur · ${format.format(new Date())} (UTC+8)`; };
        tick();
        setInterval(tick, 15000);
    }

    function initContactForm() {
        const form = document.getElementById('executive-form');
        if (!form) return;
        const feedback = document.getElementById('form-feedback');
        const receipt = document.getElementById('form-receipt-hud');
        const submitBtn = form.querySelector('button[type="submit"]');
        const field = (name) => form.querySelector(`[name="${name}"]`).value.trim();

        function say(kind, text) {
            if (!feedback) return;
            feedback.className = kind ? `form-feedback ${kind}` : 'form-feedback';
            feedback.textContent = text;
        }

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = field('name');
            const email = field('email');
            const org = field('organization');
            const scope = field('scope');
            const message = field('message');

            if (!name || !email || !message) {
                say('error', 'Please fill in your name, email and message.');
                return;
            }

            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending…';
            say('', '');

            try {
                const response = await fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                    body: JSON.stringify({
                        access_key: 'c9277eab-0b48-461a-b03f-dc7143732e24',
                        subject: `[Enquiry] ${name} (${org || 'Not given'}): ${scope}`,
                        from_name: name,
                        email,
                        organization: org || 'Not given',
                        scope,
                        message,
                        source: 'https://www.vinayakbhardwaj.com/'
                    })
                });
                const result = await response.json();
                if (!response.ok || !result.success) throw new Error(result.message || 'Send failed');

                form.style.display = 'none';
                if (receipt) {
                    receipt.style.display = 'block';
                    receipt.setAttribute('tabindex', '-1');
                    receipt.focus();
                }
                submitBtn.textContent = 'Send enquiry';
            } catch (err) {
                console.error('[contact form]', err);
                say('error', 'Your message did not send. Check your connection and try again, or message me on WhatsApp (+60 18-230 2045) or email bhardwajvinayak1947@gmail.com.');
                submitBtn.textContent = 'Try again';
            } finally {
                submitBtn.disabled = false;
            }
        });

        const resetBtn = document.getElementById('btn-receipt-reset');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                if (receipt) receipt.style.display = 'none';
                form.style.display = '';
                form.reset();
                say('', '');
                form.querySelector('input').focus();
            });
        }

        const copyBtn = document.getElementById('btn-copy-brief');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                const text = [
                    `Name: ${field('name') || 'Not given'}`,
                    `Email: ${field('email') || 'Not given'}`,
                    `Organisation: ${field('organization') || 'Not given'}`,
                    `Topic: ${field('scope') || 'Not sure yet'}`,
                    '',
                    field('message') || 'No message yet.',
                    '',
                    'To: bhardwajvinayak1947@gmail.com'
                ].join('\n');
                navigator.clipboard.writeText(text).then(() => {
                    copyBtn.textContent = 'Copied';
                    say('success', 'Your message is copied. Paste it into an email or WhatsApp.');
                    setTimeout(() => { copyBtn.textContent = 'Copy message'; }, 2500);
                }).catch(() => {
                    say('error', 'Your browser blocked copying. Select the text in the message box and copy it manually.');
                });
            });
        }
    }

    function initCopyLinks() {
        document.querySelectorAll('.copy-trigger[data-copy]').forEach((link) => {
            link.addEventListener('click', (e) => {
                if (!navigator.clipboard) return; // fall back to the mailto link
                e.preventDefault();
                const label = link.textContent;
                navigator.clipboard.writeText(link.dataset.copy).then(() => {
                    link.textContent = 'Copied to clipboard';
                    setTimeout(() => { link.textContent = label; }, 2000);
                });
            });
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        // Each module is independent: a page without a module's markup must not stop the rest.
        [initMenu, initShortcuts, initClock, initContactForm, initCopyLinks].forEach((init) => {
            try { init(); } catch (err) { console.warn(`[init] ${init.name} skipped:`, err); }
        });
    });
})();
