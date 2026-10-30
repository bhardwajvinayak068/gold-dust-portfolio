/**
 * VELOCITY-REACTIVE GOLD DUST & EMBERS PHYSICS ENGINE
 * Concept 3: Swirling Gold Dust & Sovereign Authority (Awwwards 9+ Edition)
 * High-performance Canvas 2D simulation with scroll-velocity warping,
 * 3-layer optical depth, cursor hydrodynamic swirl, and retina auto-scaling.
 */

(function () {
    'use strict';

    class GoldDustEngine {
        constructor(canvasId, options = {}) {
            this.canvas = document.getElementById(canvasId);
            if (!this.canvas) return;

            this.ctx = this.canvas.getContext('2d', { alpha: true });
            this.options = Object.assign({
                particleCount: window.innerWidth < 768 ? 120 : 500,
                bokehCount: window.innerWidth < 768 ? 8 : 24,
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
        }

        resize() {
            // data-fit="viewport": size to the first screen, not the parent (subpages put the canvas in a page-tall <main>).
            const fitViewport = this.canvas.dataset.fit === 'viewport' || !this.canvas.parentElement;
            const rect = fitViewport ? { width: document.documentElement.clientWidth, height: Math.min(window.innerHeight, 1000) } : this.canvas.parentElement.getBoundingClientRect();
            this.dimensions.width = rect.width;
            this.dimensions.height = rect.height;
            this.dimensions.dpr = Math.min(window.devicePixelRatio || 1, 2);

            this.canvas.width = this.dimensions.width * this.dimensions.dpr;
            this.canvas.height = this.dimensions.height * this.dimensions.dpr;
            this.ctx.scale(this.dimensions.dpr, this.dimensions.dpr);

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

        render(currentTime) {
            if (!this.isRunning && !(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)) return;

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
            const velMag = Math.abs(vel);

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

                const currentAlpha = b.baseAlpha * (0.6 + 0.4 * Math.sin(b.alphaPhase));
                const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.radius);
                grad.addColorStop(0, b.color + currentAlpha + ')');
                grad.addColorStop(0.6, b.color + (currentAlpha * 0.4) + ')');
                grad.addColorStop(1, b.color + '0)');

                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();

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

                // Dynamic Velocity Streak Warping
                if (velMag > 3) {
                    ctx.strokeStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${alpha * 0.75})`;
                    ctx.lineWidth = p.size;
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p.x, p.y - vel * 0.45);
                    ctx.stroke();
                } else {
                    ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${alpha})`;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    ctx.fill();
                }

                // Sparkle Glint / Starburst
                if (p.size > 2 || p.isSparkle) {
                    const glowRadius = p.size * (2.8 + velMag * 0.1);
                    const glowGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowRadius);
                    glowGrad.addColorStop(0, `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${alpha * 0.75})`);
                    glowGrad.addColorStop(1, `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, 0)`);
                    ctx.fillStyle = glowGrad;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, glowRadius, 0, Math.PI * 2);
                    ctx.fill();

                    if (p.isSparkle && alpha > 0.6 && velMag < 4) {
                        ctx.strokeStyle = `rgba(255, 255, 245, ${alpha * 0.85})`;
                        ctx.lineWidth = 0.8;
                        const sLen = p.size * 3.5;
                        ctx.beginPath();
                        ctx.moveTo(p.x - sLen, p.y);
                        ctx.lineTo(p.x + sLen, p.y);
                        ctx.moveTo(p.x, p.y - sLen);
                        ctx.lineTo(p.x, p.y + sLen);
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
        if (!window.goldDustEngine) {
            window.goldDustEngine = new GoldDustEngine('gold-canvas');
        }
    }

    if (window.requestIdleCallback) {
        window.requestIdleCallback(bootEngine, { timeout: 1200 });
    } else {
        window.addEventListener('load', () => setTimeout(bootEngine, 100), { once: true });
    }
})();
