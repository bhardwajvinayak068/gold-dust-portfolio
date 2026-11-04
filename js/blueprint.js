/* Blueprint mode: the page drawn as its own technical drawing. Every section is outlined and
   labelled with what it is made of (type, spacing, image weight); hovering any element measures
   it; a panel reports the page's own build numbers. Loaded only when blueprint mode is first
   switched on (main.js). All numbers are read from the live page, never typed in. */
(function () {
    'use strict';

    const root = document.documentElement;
    let layer = null;
    let hud = null;
    let hover = null;
    let probe = null;

    // Largest paint is only readable through a buffered observer
    let lastPaint = null;
    try {
        new PerformanceObserver((list) => {
            lastPaint = list.getEntries().pop() || lastPaint;
            if (hud) report();
        }).observe({ type: 'largest-contentful-paint', buffered: true });
    } catch (err) { /* not supported in this browser */ }

    const kb = (bytes) => (bytes ? `${Math.max(1, Math.round(bytes / 1024))} KB` : '0 KB');
    const family = (cs) => cs.fontFamily.split(',')[0].replace(/["']/g, '').trim();
    const typeOf = (el) => {
        const cs = getComputedStyle(el);
        return `${family(cs)} ${Math.round(parseFloat(cs.fontSize))}/${Math.round(parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.2)} ${cs.fontWeight}`;
    };
    const label = (el) => {
        const tagName = el.tagName.toLowerCase();
        if (el.id) return `${tagName}#${el.id}`;
        if (el.className && typeof el.className === 'string' && el.className.trim()) return `${tagName}.${el.className.trim().split(/\s+/)[0]}`;
        return tagName;
    };

    // Bytes actually transferred for the images inside an element, from resource timing
    const resources = () => {
        const map = new Map();
        performance.getEntriesByType('resource').forEach((r) => map.set(r.name, r.encodedBodySize || r.transferSize || 0));
        return map;
    };
    function imageWeight(el, map) {
        let total = 0;
        el.querySelectorAll('img').forEach((img) => { total += map.get(img.currentSrc) || 0; });
        return total;
    }

    function tag(text, x, y) {
        const t = document.createElement('div');
        t.className = 'ev-bp-tag';
        t.textContent = text;
        t.style.left = `${Math.max(4, x)}px`;
        t.style.top = `${Math.max(4, y)}px`;
        layer.appendChild(t);
    }

    function gap(x, y1, y2, text) {
        if (y2 - y1 < 12) return;
        const g = document.createElement('div');
        g.className = 'ev-bp-gap';
        g.style.left = `${x}px`;
        g.style.top = `${y1}px`;
        g.style.height = `${y2 - y1}px`;
        const s = document.createElement('span');
        s.textContent = text;
        g.appendChild(s);
        layer.appendChild(g);
    }

    function draw() {
        layer.textContent = '';
        layer.style.height = `${document.documentElement.scrollHeight}px`;
        const map = resources();
        const sx = window.scrollX;
        const sy = window.scrollY;
        const sections = document.querySelectorAll('main section, main article.ev-case');
        sections.forEach((sec) => {
            const r = sec.getBoundingClientRect();
            if (r.height < 40) return;
            const cs = getComputedStyle(sec);
            const heading = sec.querySelector('h1, h2');
            const media = imageWeight(sec, map);
            const parts = [label(sec)];
            if (heading) parts.push(`heading ${typeOf(heading)}`);
            const padTop = Math.round(parseFloat(cs.paddingTop));
            if (padTop) parts.push(`padding ${padTop}px`);
            if (media) parts.push(`images ${kb(media)}`);
            tag(parts.join(' · '), r.left + sx + 8, r.top + sy + 8);
            // The vertical rhythm: space from the section edge to its first heading
            if (heading) {
                const h = heading.getBoundingClientRect();
                gap(r.right + sx - 28, r.top + sy, h.top + sy, `${Math.round(h.top - r.top)}px`);
            }
        });
    }

    function report() {
        const nav = performance.getEntriesByType('navigation')[0];
        const res = performance.getEntriesByType('resource');
        // What this visit actually downloaded; files already in the browser cache count as zero
        const sum = (list) => list.reduce((a, r) => a + (r.transferSize || 0), 0);
        const total = sum(res) + (nav ? nav.transferSize || 0 : 0);
        const js = sum(res.filter((r) => /\.js(\?|$)/.test(r.name)));
        const css = sum(res.filter((r) => /\.css(\?|$)/.test(r.name)));
        const img = sum(res.filter((r) => r.initiatorType === 'img' || /\.(avif|webp|jpe?g|png|svg)(\?|$)/.test(r.name)));
        const fonts = [...new Set([...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family.replace(/["']/g, '')))];
        const lcp = lastPaint;
        hud.textContent = '';
        const lines = [
            ['Blueprint', 'hover anything to measure it · B or Esc to close'],
            ['Downloaded this visit', `${kb(total)} (HTML ${kb(nav ? nav.transferSize || 0 : 0)}, CSS ${kb(css)}, JS ${kb(js)}, images ${kb(img)}); cached files count as 0`],
            ['DOM', `${document.getElementsByTagName('*').length} elements`],
            ['Type', fonts.join(', ') || 'system'],
            ['Largest paint', lcp ? `${Math.round(lcp.startTime)} ms, this visit` : 'not reported by this browser'],
        ];
        lines.forEach(([k, v]) => {
            const row = document.createElement('div');
            const b = document.createElement('b');
            b.textContent = `${k} `;
            row.appendChild(b);
            row.appendChild(document.createTextNode(v));
            hud.appendChild(row);
        });
    }

    function onMove(e) {
        const el = e.target.closest && e.target.closest('main *');
        if (!el || el === layer || layer.contains(el)) { hover.style.display = 'none'; probe.textContent = ''; return; }
        const r = el.getBoundingClientRect();
        hover.style.display = 'block';
        hover.style.left = `${r.left}px`;
        hover.style.top = `${r.top}px`;
        hover.style.width = `${r.width}px`;
        hover.style.height = `${r.height}px`;
        const cs = getComputedStyle(el);
        const pad = [cs.paddingTop, cs.paddingRight, cs.paddingBottom, cs.paddingLeft].map((v) => Math.round(parseFloat(v))).join(' ');
        let text = `${label(el)} · ${Math.round(r.width)}×${Math.round(r.height)}`;
        if (el.tagName === 'IMG') {
            // Pictures report the file actually chosen for this screen and what it weighed
            const file = (el.currentSrc || el.src).split('/').pop().split('?')[0];
            const bytes = resources().get(el.currentSrc) || 0;
            text += ` · ${file} · ${el.naturalWidth}×${el.naturalHeight}${bytes ? ` · ${kb(bytes)}` : ''}`;
        } else {
            text += ` · ${typeOf(el)}${pad !== '0 0 0 0' ? ` · padding ${pad}` : ''}`;
        }
        probe.textContent = '';
        const t = document.createElement('div');
        t.className = 'ev-bp-tag';
        t.textContent = text;
        probe.appendChild(t);
        const x = Math.min(e.clientX + 14, window.innerWidth - 280);
        const y = Math.min(e.clientY + 16, window.innerHeight - 60);
        probe.style.left = `${x}px`;
        probe.style.top = `${y}px`;
    }

    function onScroll() {
        if (hover) hover.style.display = 'none';
        if (probe) probe.textContent = '';
    }

    let resizeTimer = null;
    const onResize = () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(draw, 200);
    };

    function enable() {
        root.classList.add('is-blueprint');
        // A drawing shows the finished building: every section is built and every sheet closed
        document.querySelectorAll('.ev-build').forEach((el) => el.classList.add('is-built'));
        document.querySelectorAll('[data-sheet], [data-route] > li').forEach((el) => el.classList.add('is-in'));
        layer = document.createElement('div');
        layer.className = 'ev-bp';
        layer.setAttribute('aria-hidden', 'true');
        document.body.appendChild(layer);
        hover = document.createElement('div');
        hover.className = 'ev-bp-hover';
        hover.setAttribute('aria-hidden', 'true');
        document.body.appendChild(hover);
        probe = document.createElement('div');
        probe.className = 'ev-bp-probe';
        probe.setAttribute('aria-hidden', 'true');
        document.body.appendChild(probe);
        hud = document.createElement('div');
        hud.className = 'ev-bp-hud';
        hud.setAttribute('role', 'status');
        document.body.appendChild(hud);
        draw();
        report();
        document.addEventListener('pointermove', onMove, { passive: true });
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onResize, { passive: true });
    }

    function disable() {
        root.classList.remove('is-blueprint');
        [layer, hover, probe, hud].forEach((el) => el && el.remove());
        layer = hover = probe = hud = null;
        document.removeEventListener('pointermove', onMove);
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', onResize);
    }

    window.siteBlueprint = {
        set(on) {
            if (on && !layer) enable();
            else if (!on && layer) disable();
            return Boolean(layer);
        },
        isOn: () => Boolean(layer),
    };
})();
