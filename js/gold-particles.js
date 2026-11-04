/**
 * Gold dust: Canvas 2D particles that drift around the portrait and part around the cursor.
 * With data-settle="grid" (home hero), the dust settles onto the 32px drawing grid as the
 * hero scrolls away: loose material becomes a measured sheet, the grid the build loop uses.
 * On the home stage the dust first flies together into the headline "Built," (buildAssembly).
 */

(function () {
    'use strict';

    class GoldDustEngine {
        constructor(canvasId, options = {}) {
            this.canvas = document.getElementById(canvasId);
            if (!this.canvas) return;

            this.ctx = this.canvas.getContext('2d', { alpha: true });
            this.options = Object.assign({
                particleCount: window.innerWidth < 768 ? 90 : 320,
                bokehCount: window.innerWidth < 768 ? 6 : 14,
                swirlSpeed: 0.0012,
                cursorRadius: 190,
                cursorStrength: 0.18
            }, options);

            this.particles = [];
            this.bokeh = [];
            this.mouse = { x: -1000, y: -1000, targetX: -1000, targetY: -1000, active: false };
            this.scroll = { y: window.scrollY, lastY: window.scrollY, velocity: 0, targetVelocity: 0 };
            this.dimensions = { width: 0, height: 0, dpr: 1 };
            this.portraitCenter = { x: 0, y: 0 };
            this.isRunning = false;
            this.lastTime = 0;
            this.settles = this.canvas.dataset.settle === 'grid';
            this.gridSize = 32;

            this.init();
        }

        init() {
            this.resize();
            window.addEventListener('resize', () => this.resize(), { passive: true });

            // Mouse & touch tracking
            window.addEventListener('mousemove', (e) => this.onMouseMove(e), { passive: true });
            window.addEventListener('mouseleave', () => { this.mouse.active = false; }, { passive: true });
            window.addEventListener('touchmove', (e) => this.onTouchMove(e), { passive: true });
            window.addEventListener('touchend', () => { this.mouse.active = false; }, { passive: true });

            // Scroll velocity tracking
            window.addEventListener('scroll', () => {
                const currentY = window.scrollY;
                this.scroll.targetVelocity = (currentY - this.scroll.lastY) * 0.45;
                this.scroll.lastY = currentY;
                // Hold the canvas still while the page moves, so scrolling gets the whole frame
                this.scrollingUntil = performance.now() + 140;
            }, { passive: true });

            // Intersection Observer to pause when offscreen
            this.observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.start();
                    } else {
                        this.stop();
                    }
                });
            }, { threshold: 0.05 });
            this.observer.observe(this.canvas);

            this.spawnEntities();
            this.start();

            // Home stage: the dust flies together into the headline before the letters turn solid
            this.stage = this.canvas.closest('.ev-stage');
            if (this.stage && this.stage.classList.contains('is-assembling')) {
                const ready = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
                ready.then(() => this.buildAssembly()).catch(() => this.finishAssembly());
            }
        }

        // Sample the headline's letters, drawn where the page draws them, into target points
        buildAssembly() {
            const chars = [...this.stage.querySelectorAll('.ev-stage-back .ev-char')];
            if (!chars.length || !this.stage.classList.contains('is-assembling')) return;
            const w = this.dimensions.width;
            const h = this.dimensions.height;
            const box = this.canvas.getBoundingClientRect();
            const off = document.createElement('canvas');
            off.width = Math.ceil(w);
            off.height = Math.ceil(h);
            const octx = off.getContext('2d', { willReadFrequently: true });
            octx.fillStyle = '#fff';
            octx.textBaseline = 'alphabetic';
            for (const el of chars) {
                const cs = getComputedStyle(el);
                octx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
                const r = el.getBoundingClientRect();
                const m = octx.measureText(el.textContent);
                const ascent = m.fontBoundingBoxAscent || parseFloat(cs.fontSize) * 0.9;
                const descent = m.fontBoundingBoxDescent || parseFloat(cs.fontSize) * 0.25;
                const lineHeight = parseFloat(cs.lineHeight) || r.height;
                const baseline = r.top - box.top + (lineHeight - (ascent + descent)) / 2 + ascent;
                octx.fillText(el.textContent, r.left - box.left, baseline);
            }
            const data = octx.getImageData(0, 0, off.width, off.height).data;
            const step = w >= 900 ? 5 : 4;
            const points = [];
            for (let y = 0; y < off.height; y += step) {
                for (let x = 0; x < off.width; x += step) {
                    if (data[(y * off.width + x) * 4 + 3] > 128) points.push({ x, y });
                }
            }
            if (!points.length) { this.finishAssembly(); return; }
            for (let i = points.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [points[i], points[j]] = [points[j], points[i]];
            }
            const cap = w >= 900 ? 1700 : 850;
            const golds = ['255, 250, 230', '247, 229, 181', '226, 192, 141'];
            this.assembly = {
                start: performance.now(),
                done: false,
                grains: points.slice(0, cap).map((pt) => ({
                    sx: Math.random() * w,
                    sy: h * (0.35 + Math.random() * 0.75),
                    tx: pt.x,
                    ty: pt.y,
                    delay: Math.random() * 0.45,
                    dur: 1.05 + Math.random() * 0.45,
                    size: 0.8 + Math.random() * 0.9,
                    color: golds[Math.floor(Math.random() * golds.length)]
                }))
            };
            this.start();
        }

        finishAssembly() {
            if (this.stage) this.stage.classList.replace('is-assembling', 'is-assembled');
        }

        drawAssembly(ctx, now) {
            const a = this.assembly;
            const t = (now - a.start) / 1000;
            // Swiss snap ease, the site's motion curve
            const ease = (x) => 1 - Math.pow(1 - x, 4);
            let settled = true;
            for (const g of a.grains) {
                const p = Math.min(1, Math.max(0, (t - g.delay) / g.dur));
                if (p < 1) settled = false;
                const e = ease(p);
                const x = g.sx + (g.tx - g.sx) * e;
                const y = g.sy + (g.ty - g.sy) * e;
                const fade = a.done ? Math.max(0, 1 - (t - a.doneAt) / 0.7) : 1;
                ctx.fillStyle = `rgba(${g.color}, ${(0.35 + 0.65 * e) * fade})`;
                ctx.fillRect(x - g.size / 2, y - g.size / 2, g.size, g.size);
            }
            if (settled && !a.done) {
                a.done = true;
                a.doneAt = t;
                this.finishAssembly();
            }
            if (a.done && t - a.doneAt > 0.7) this.assembly = null;
        }

        resize() {
            // data-fit="viewport": size to the first screen, not the parent (subpages put the canvas in a page-tall <main>).
            const fitViewport = this.canvas.dataset.fit === 'viewport' || !this.canvas.parentElement;
            const rect = fitViewport ? { width: document.documentElement.clientWidth, height: Math.min(window.innerHeight, 1000) } : this.canvas.parentElement.getBoundingClientRect();
            this.dimensions.width = rect.width;
            this.dimensions.height = rect.height;
            this.dimensions.dpr = Math.min(window.devicePixelRatio || 1, 1.5);

            this.canvas.width = this.dimensions.width * this.dimensions.dpr;
            this.canvas.height = this.dimensions.height * this.dimensions.dpr;
            this.ctx.scale(this.dimensions.dpr, this.dimensions.dpr);
            this.gridSprite = null;

            if (this.dimensions.width >= 1024) {
                this.portraitCenter.x = this.dimensions.width * 0.74;
                this.portraitCenter.y = this.dimensions.height * 0.52;
            } else {
                this.portraitCenter.x = this.dimensions.width * 0.5;
                this.portraitCenter.y = this.dimensions.height * 0.42;
            }
        }

        onMouseMove(e) {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.targetX = e.clientX - rect.left;
            this.mouse.targetY = e.clientY - rect.top;
            this.mouse.active = true;
        }

        onTouchMove(e) {
            if (e.touches.length > 0) {
                const rect = this.canvas.getBoundingClientRect();
                this.mouse.targetX = e.touches[0].clientX - rect.left;
                this.mouse.targetY = e.touches[0].clientY - rect.top;
                this.mouse.active = true;
            }
        }

        spawnEntities() {
            this.particles = [];
            this.bokeh = [];

            // 1. Bokeh Orbs (Background depth)
            for (let i = 0; i < this.options.bokehCount; i++) {
                this.bokeh.push({
                    x: this.portraitCenter.x + (Math.random() - 0.5) * this.dimensions.width * 0.75,
                    y: this.portraitCenter.y + (Math.random() - 0.5) * this.dimensions.height * 0.85,
                    radius: 20 + Math.random() * 58,
                    baseAlpha: 0.03 + Math.random() * 0.08,
                    alphaPhase: Math.random() * Math.PI * 2,
                    speed: 0.004 + Math.random() * 0.008,
                    vx: (Math.random() - 0.5) * 0.08,
                    vy: -0.06 - Math.random() * 0.12,
                    color: Math.random() > 0.4 ? 'rgba(226, 192, 141, ' : 'rgba(212, 175, 55, '
                });
            }

            // 2. Swirling Gold Dust Particles & Embers
            const colors = [
                { r: 255, g: 250, b: 230 }, // White-gold highlight
                { r: 247, g: 229, b: 181 }, // Champagne gold
                { r: 226, g: 192, b: 141 }, // Sovereign gold
                { r: 212, g: 175, b: 55 },  // Imperial amber
                { r: 184, g: 134, b: 11 }   // Deep bronze
            ];

            for (let i = 0; i < this.options.particleCount; i++) {
                const angle = Math.random() * Math.PI * 2;
                const distance = 40 + Math.pow(Math.random(), 1.35) * (this.dimensions.width * 0.55);
                const col = colors[Math.floor(Math.random() * colors.length)];

                // Calibrated serene velocity: balanced bidirectional drift and gentle float
                const direction = Math.random() > 0.5 ? 1 : -1;
                const gentleOrbitSpeed = (0.00018 + Math.random() * 0.00035) * direction;

                this.particles.push({
                    angle: angle,
                    distance: distance,
                    baseDistance: distance,
                    x: this.portraitCenter.x + Math.cos(angle) * distance,
                    y: this.portraitCenter.y + Math.sin(angle) * (distance * 0.75),
                    vx: 0,
                    vy: 0,
                    size: Math.random() < 0.82 ? (0.8 + Math.random() * 1.6) : (2.4 + Math.random() * 2.4),
                    orbitSpeed: gentleOrbitSpeed,
                    driftY: -0.08 - Math.random() * 0.22, // Soft vertical float
                    wobbleSpeed: 0.008 + Math.random() * 0.014,
                    wobbleOffset: Math.random() * Math.PI * 2,
                    baseAlpha: 0.25 + Math.random() * 0.75,
                    color: col,
                    twinkleSpeed: 0.015 + Math.random() * 0.035,
                    twinklePhase: Math.random() * Math.PI * 2,
                    isSparkle: Math.random() < 0.04
                });
            }
        }

        start() {
            if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                this.render(performance.now());
                this.stop();
                return;
            }

            if (!this.isRunning) {
                this.isRunning = true;
                this.lastTime = performance.now();
                requestAnimationFrame((t) => this.render(t));
            }
        }

        stop() {
            this.isRunning = false;
        }

        // Soft glows are drawn once into small sprites and stamped, instead of a new gradient per grain per frame
        sprite(color, bokeh) {
            this.sprites = this.sprites || new Map();
            const key = color + bokeh;
            let c = this.sprites.get(key);
            if (!c) {
                c = document.createElement('canvas');
                c.width = c.height = 64;
                const g = c.getContext('2d');
                const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
                grad.addColorStop(0, color + '1)');
                if (bokeh) grad.addColorStop(0.6, color + '0.4)');
                grad.addColorStop(1, color + '0)');
                g.fillStyle = grad;
                g.fillRect(0, 0, 64, 64);
                this.sprites.set(key, c);
            }
            return c;
        }

        makeGrid(w, h) {
            const c = document.createElement('canvas');
            const dpr = this.dimensions.dpr;
            c.width = Math.ceil(w * dpr);
            c.height = Math.ceil(h * dpr);
            const g = c.getContext('2d');
            g.scale(dpr, dpr);
            g.strokeStyle = 'rgb(245, 244, 240)';
            g.lineWidth = 1;
            g.beginPath();
            for (let x = 0.5; x < w; x += this.gridSize) { g.moveTo(x, 0); g.lineTo(x, h); }
            for (let y = 0.5; y < h; y += this.gridSize) { g.moveTo(0, y); g.lineTo(w, y); }
            g.stroke();
            return c;
        }

        render(currentTime) {
            if (!this.isRunning && !(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)) return;

            // Draw at most ~60 times a second, and not at all while the page is scrolling;
            // the headline assembly is the exception, it only plays at the top of the page
            const scrolling = !this.assembly && this.scrollingUntil && currentTime < this.scrollingUntil;
            if (scrolling || (this.lastDraw && currentTime - this.lastDraw < 15)) {
                if (this.isRunning) requestAnimationFrame((t) => this.render(t));
                return;
            }
            this.lastDraw = currentTime;

            // Delta time normalization (60 FPS baseline = 16.67ms)
            const dt = (currentTime && this.lastTime) ? Math.min((currentTime - this.lastTime) / 1000, 0.05) : 0.0166;
            this.lastTime = currentTime;
            const timeScale = dt / 0.01667;

            const ctx = this.ctx;
            const w = this.dimensions.width;
            const h = this.dimensions.height;

            ctx.clearRect(0, 0, w, h);

            // Interpolate mouse & scroll velocity
            this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.1;
            this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.1;

            this.scroll.velocity += (this.scroll.targetVelocity - this.scroll.velocity) * 0.14;
            this.scroll.targetVelocity *= 0.86; // natural friction decay
            const vel = this.scroll.velocity;
            let velMag = Math.abs(vel);

            // Settling: 0 while the hero is in view, 1 once most of it has scrolled away
            let settle = 0;
            if (this.settles) {
                const top = this.canvas.getBoundingClientRect().top;
                const t = Math.min(1, Math.max(0, -top / (h * 0.55)));
                settle = t * t * (3 - 2 * t);
                if (settle > 0.2) velMag = 0; // no streaks once the dust is settling
            }

            // The drawing grid fades in under the settling dust
            if (settle > 0.01) {
                if (!this.gridSprite) this.gridSprite = this.makeGrid(w, h);
                ctx.save();
                ctx.globalAlpha = 0.05 * settle;
                ctx.drawImage(this.gridSprite, 0, 0, w, h);
                ctx.restore();
            }

            // 1. Render Background Bokeh Orbs
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            for (let i = 0; i < this.bokeh.length; i++) {
                const b = this.bokeh[i];
                b.alphaPhase += b.speed * timeScale;
                b.y += (b.vy * timeScale) - vel * 0.15;
                b.x += b.vx * timeScale;

                if (b.y < -b.radius * 2) {
                    b.y = h + b.radius;
                    b.x = this.portraitCenter.x + (Math.random() - 0.5) * w * 0.6;
                }
                if (b.y > h + b.radius * 2) {
                    b.y = -b.radius;
                }

                const currentAlpha = b.baseAlpha * (0.6 + 0.4 * Math.sin(b.alphaPhase)) * (1 - settle);
                if (currentAlpha <= 0.002) continue;
                ctx.globalAlpha = currentAlpha;
                ctx.drawImage(this.sprite(b.color, true), b.x - b.radius, b.y - b.radius, b.radius * 2, b.radius * 2);
            }
            ctx.restore();

            // Headline assembly sits under the drifting dust
            if (this.assembly) {
                ctx.save();
                ctx.globalCompositeOperation = 'source-over';
                this.drawAssembly(ctx, currentTime || performance.now());
                ctx.restore();
            }

            // 2. Render Swirling Gold Dust Particles with Scroll Warping
            ctx.save();
            ctx.globalCompositeOperation = 'screen';

            for (let i = 0; i < this.particles.length; i++) {
                const p = this.particles[i];

                p.angle += p.orbitSpeed * timeScale;
                p.twinklePhase += p.twinkleSpeed * timeScale;
                p.wobbleOffset += p.wobbleSpeed * timeScale;

                // Vertical drift plus scroll inertia
                p.y += (p.driftY * timeScale) - vel * 0.35;

                // Radial dispersion under high scroll velocity
                if (velMag > 2) {
                    p.distance += velMag * 0.6;
                } else {
                    p.distance += (p.baseDistance - p.distance) * (0.02 * timeScale);
                }

                // Smooth tranquil horizontal drift without fast left-to-right conveyer sweeping
                const naturalX = this.portraitCenter.x + Math.cos(p.angle) * p.distance + Math.sin(p.wobbleOffset) * 4;
                p.x += (naturalX - p.x) * (0.02 * timeScale);

                // Hydrodynamic Cursor Swirl
                if (this.mouse.active) {
                    const dx = p.x - this.mouse.x;
                    const dy = p.y - this.mouse.y;
                    const distSq = dx * dx + dy * dy;
                    const rMax = this.options.cursorRadius;
                    if (distSq < rMax * rMax && distSq > 1) {
                        const dist = Math.sqrt(distSq);
                        const force = (1 - dist / rMax) * 4.8;
                        p.vx += (dx / dist) * force;
                        p.vy += (dy / dist) * force - (dx / dist) * force * 0.5;
                    }
                }

                p.x += p.vx * timeScale;
                p.y += p.vy * timeScale;
                p.vx *= 0.92;
                p.vy *= 0.92;

                // Boundary Wrapping
                if (p.y < -30) {
                    p.y = h + 20;
                    p.angle = Math.random() * Math.PI * 2;
                    p.distance = 50 + Math.random() * (w * 0.45);
                    p.x = this.portraitCenter.x + Math.cos(p.angle) * p.distance;
                }
                if (p.y > h + 30) {
                    p.y = -20;
                }
                if (p.x < -40) p.x = w + 30;
                if (p.x > w + 40) p.x = -30;

                const alphaMod = 0.65 + 0.35 * Math.sin(p.twinklePhase);
                const alpha = Math.max(0, Math.min(1, p.baseAlpha * alphaMod));

                // Each grain picks its grid node once, when settling starts, and eases onto it
                let x = p.x;
                let y = p.y;
                if (settle > 0) {
                    if (p.gx === undefined) {
                        p.gx = Math.round(p.x / this.gridSize) * this.gridSize + 0.5;
                        p.gy = Math.round(p.y / this.gridSize) * this.gridSize + 0.5;
                    }
                    x += (p.gx - x) * settle;
                    y += (p.gy - y) * settle;
                } else if (p.gx !== undefined) {
                    p.gx = undefined;
                }

                // Dynamic Velocity Streak Warping
                if (velMag > 3) {
                    ctx.strokeStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${alpha * 0.75})`;
                    ctx.lineWidth = p.size;
                    ctx.beginPath();
                    ctx.moveTo(x, y);
                    ctx.lineTo(x, y - vel * 0.45);
                    ctx.stroke();
                } else {
                    ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${alpha})`;
                    ctx.beginPath();
                    ctx.arc(x, y, p.size, 0, Math.PI * 2);
                    ctx.fill();
                }

                // Sparkle Glint / Starburst
                if (p.size > 2 || p.isSparkle) {
                    const glowRadius = p.size * (2.8 + velMag * 0.1);
                    ctx.globalAlpha = alpha * 0.75;
                    ctx.drawImage(this.sprite(`rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, `, false), x - glowRadius, y - glowRadius, glowRadius * 2, glowRadius * 2);
                    ctx.globalAlpha = 1;

                    if (p.isSparkle && alpha > 0.6 && velMag < 4) {
                        ctx.strokeStyle = `rgba(255, 255, 245, ${alpha * 0.85})`;
                        ctx.lineWidth = 0.8;
                        const sLen = p.size * 3.5;
                        ctx.beginPath();
                        ctx.moveTo(x - sLen, y);
                        ctx.lineTo(x + sLen, y);
                        ctx.moveTo(x, y - sLen);
                        ctx.lineTo(x, y + sLen);
                        ctx.stroke();
                    }
                }
            }
            ctx.restore();

            if (this.isRunning) {
                requestAnimationFrame((t) => this.render(t));
            }
        }
    }

    function bootEngine() {
        // ?nodust turns the canvas off, for comparing scroll feel on a given machine
        if (/[?&]nodust\b/.test(location.search)) {
            const stage = document.querySelector('.ev-stage.is-assembling');
            if (stage) stage.classList.replace('is-assembling', 'is-assembled');
            return;
        }
        if (!window.goldDustEngine) {
            window.goldDustEngine = new GoldDustEngine('gold-canvas');
        }
    }

    // The assembling headline cannot wait for idle time; everything else can
    if (document.querySelector('.ev-stage.is-assembling')) {
        bootEngine();
    } else if (window.requestIdleCallback) {
        window.requestIdleCallback(bootEngine, { timeout: 1200 });
    } else {
        window.addEventListener('load', () => setTimeout(bootEngine, 100), { once: true });
    }
})();
