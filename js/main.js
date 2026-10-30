/**
 * SOVEREIGN LUXURY MAIN CONTROLLER (Awwwards 9+ Edition)
 * Vinayak Bhardwaj — Creative Technologist & Systems Architect
 * Features: Dual-ring magnetic cursor, viewport scroll progress rail,
 * interactive global node-graph visualizer, 3D tilt with specular refraction,
 * animated SVG blueprints, and synthetic telemetry engine.
 */

(function () {
    'use strict';

    // HAPTIC FEEDBACK GUARDIAN (MOBILE & ACCESSIBLE INPUT PARITY)
    function triggerHaptic(duration = 8) {
        if ('vibrate' in navigator) {
            try { navigator.vibrate(duration); } catch (e) {}
        }
    }

    // 1. SMOOTH SCROLL (LENIS & MOBILE NATIVE MOMENTUM)
    let lenisInstance = null;
    function initLenis() {
        function setupAnchorSmoothScroll() {
            document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
                anchor.addEventListener('click', function (e) {
                    const targetId = this.getAttribute('href');
                    if (targetId && targetId !== '#') {
                        const targetElem = document.querySelector(targetId);
                        if (targetElem) {
                            e.preventDefault();
                            if (lenisInstance) {
                                lenisInstance.scrollTo(targetElem, { offset: -80 });
                            } else {
                                const targetY = targetElem.getBoundingClientRect().top + window.scrollY - 80;
                                window.scrollTo({ top: targetY, behavior: 'smooth' });
                            }
                        }
                    }
                });
            });
        }

        setupAnchorSmoothScroll();

        // Respect user's accessibility choice for reduced motion
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }

        const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

        if (typeof Lenis !== 'undefined') {
            lenisInstance = new Lenis({
                duration: 1.0,
                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                smoothWheel: true,
                syncTouch: false, // 100% native hardware momentum for touch
                touchMultiplier: 1.0,
                autoRaf: true
            });

            // On desktop only: subtle skew on kinetic ribbon (only if not touch)
            if (!isTouchDevice) {
                let skewResetTimer = null;
                const track = document.querySelector('.kinetic-track');
                if (track) {
                    lenisInstance.on('scroll', (e) => {
                        const vel = e.velocity || 0;
                        const clamped = Math.max(-12, Math.min(12, vel));
                        const skewAngle = clamped * 0.18;
                        track.style.transform = `skewX(${skewAngle.toFixed(2)}deg)`;

                        clearTimeout(skewResetTimer);
                        skewResetTimer = setTimeout(() => {
                            track.style.transform = 'skewX(0deg)';
                        }, 100);
                    });
                }
            }
        }
    }

    // 2. CONTEXTUAL ADAPTIVE CURSOR (AURA & PILL BADGE)
    function initMagneticCursor() {
        const dot = document.getElementById('custom-cursor-dot');
        const aura = document.getElementById('custom-cursor-aura');
        const badge = document.getElementById('cursor-badge');
        if (!dot || !aura) return;

        // Disable on touch devices
        if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
            dot.style.display = 'none';
            aura.style.display = 'none';
            return;
        }

        let mouseX = -100, mouseY = -100;
        let auraX = -100, auraY = -100;
        let isHovered = false;
        let isVisible = false;
        let currentBadgeText = '';

        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            // Perfectly center 6px dot by offsetting 3px
            dot.style.transform = `translate3d(${mouseX - 3}px, ${mouseY - 3}px, 0)`;

            if (!isVisible) {
                isVisible = true;
                dot.classList.add('visible');
                aura.classList.add('visible');
            }
        }, { passive: true });

        // Boundary exit/enter handlers
        document.addEventListener('mouseleave', () => {
            isVisible = false;
            dot.classList.remove('visible');
            aura.classList.remove('visible');
        });

        document.addEventListener('mouseenter', () => {
            isVisible = true;
            dot.classList.add('visible');
            aura.classList.add('visible');
        });

        function renderCursor() {
            auraX += (mouseX - auraX) * 0.18;
            auraY += (mouseY - auraY) * 0.18;

            if (currentBadgeText) {
                // In badge mode, smoothly follow with slight offset for readability
                aura.style.transform = `translate3d(${auraX}px, ${auraY}px, 0)`;
            } else {
                const scale = isHovered ? 1.75 : 1.0;
                aura.style.transform = `translate3d(${auraX}px, ${auraY}px, 0) scale(${scale})`;
            }
            requestAnimationFrame(renderCursor);
        }
        requestAnimationFrame(renderCursor);

        // Contextual Hit-Testing & Morphing Logic
        document.addEventListener('mouseover', (e) => {
            const systemCard = e.target.closest('.system-card');
            const nodeCanvas = e.target.closest('#node-graph-canvas');
            const waveCanvas = e.target.closest('#waveform-canvas');
            const timelineCard = e.target.closest('.timeline-card, .timeline-step');
            const surgeBtn = e.target.closest('#btn-surge-test');
            const interactive = e.target.closest('a, button, input, select, textarea, .tilt-card, .open-system-drawer, .rail-top-btn, .mobile-menu-toggle, .mobile-menu-close-btn');

            if (systemCard) {
                currentBadgeText = 'INSPECT';
                if (badge) badge.textContent = currentBadgeText;
                aura.classList.add('badge-mode');
                aura.classList.remove('cursor-hover');
                isHovered = false;
            } else if (nodeCanvas) {
                currentBadgeText = 'DRAG // PING';
                if (badge) badge.textContent = currentBadgeText;
                aura.classList.add('badge-mode');
                aura.classList.remove('cursor-hover');
                isHovered = false;
            } else if (waveCanvas) {
                currentBadgeText = 'CRT P99';
                if (badge) badge.textContent = currentBadgeText;
                aura.classList.add('badge-mode');
                aura.classList.remove('cursor-hover');
                isHovered = false;
            } else if (surgeBtn) {
                currentBadgeText = 'STRESS RUN';
                if (badge) badge.textContent = currentBadgeText;
                aura.classList.add('badge-mode');
                aura.classList.remove('cursor-hover');
                isHovered = false;
            } else if (timelineCard) {
                currentBadgeText = 'ODYSSEY';
                if (badge) badge.textContent = currentBadgeText;
                aura.classList.add('badge-mode');
                aura.classList.remove('cursor-hover');
                isHovered = false;
            } else if (interactive) {
                currentBadgeText = '';
                aura.classList.remove('badge-mode');
                isHovered = true;
                aura.classList.add('cursor-hover');
            }
        });

        document.addEventListener('mouseout', (e) => {
            const target = e.target.closest('a, button, input, select, textarea, .system-card, .tilt-card, .open-system-drawer, .rail-top-btn, .mobile-menu-toggle, .mobile-menu-close-btn, #node-graph-canvas, #waveform-canvas, .timeline-card, .timeline-step');
            if (target) {
                currentBadgeText = '';
                aura.classList.remove('badge-mode');
                isHovered = false;
                aura.classList.remove('cursor-hover');
            }
        });
    }

    // 3. VIEWPORT SCROLL PROGRESS RAIL & BACK-TO-TOP
    function initScrollProgressRail() {
        const progressBar = document.getElementById('scroll-progress-bar');
        const scrollTopBtn = document.getElementById('scroll-top-btn');
        if (!progressBar) return;

        let isTicking = false;
        window.addEventListener('scroll', () => {
            if (!isTicking) {
                requestAnimationFrame(() => {
                    const scrollTop = window.scrollY;
                    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
                    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
                    progressBar.style.height = `${Math.min(100, Math.max(0, progress))}%`;

                    if (scrollTopBtn) {
                        if (scrollTop > 400) {
                            scrollTopBtn.classList.add('visible');
                        } else {
                            scrollTopBtn.classList.remove('visible');
                        }
                    }
                    isTicking = false;
                });
                isTicking = true;
            }
        }, { passive: true });

        if (scrollTopBtn) {
            scrollTopBtn.addEventListener('click', () => {
                if (lenisInstance) {
                    lenisInstance.scrollTo(0, { duration: 1.5 });
                } else {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            });
        }
    }

    // 4. INTERACTIVE 3D TILT & SPECULAR GOLD REFRACTION
    function initTiltCards() {
        const cards = document.querySelectorAll('.tilt-card, .system-card, .benchmark-terminal, .manifesto-quote-banner');
        cards.forEach((card) => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                card.style.setProperty('--mouse-x', `${x}px`);
                card.style.setProperty('--mouse-y', `${y}px`);

                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = ((y - centerY) / centerY) * -4;
                const rotateY = ((x - centerX) / centerX) * 4;

                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
            });
        });
    }

    // 5. SCROLL REVEAL OBSERVER
    function initScrollReveals() {
        const elements = document.querySelectorAll('.reveal-on-scroll');
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            elements.forEach((el) => el.classList.add('revealed'));
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

        elements.forEach((el) => observer.observe(el));
    }

    // 6. ANIMATED COUNTERS
    function initStatCounters() {
        const statElements = document.querySelectorAll('.counter-val');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const targetStr = el.getAttribute('data-target') || '0';
                    const target = parseFloat(targetStr);
                    const prefix = el.getAttribute('data-prefix') || '';
                    const suffix = el.getAttribute('data-suffix') || '';
                    const decimalPlaces = targetStr.includes('.') ? targetStr.split('.')[1].length : 0;
                    const duration = 1800;
                    const startTime = performance.now();

                    function updateCount(currentTime) {
                        const elapsed = currentTime - startTime;
                        const progress = Math.min(elapsed / duration, 1);
                        const easeProgress = 1 - Math.pow(1 - progress, 3);
                        const current = easeProgress * target;

                        el.textContent = prefix + (decimalPlaces > 0 ? current.toFixed(decimalPlaces) : Math.floor(current)) + suffix;

                        if (progress < 1) {
                            requestAnimationFrame(updateCount);
                        } else {
                            el.textContent = prefix + (decimalPlaces > 0 ? target.toFixed(decimalPlaces) : target) + suffix;
                        }
                    }

                    requestAnimationFrame(updateCount);
                    observer.unobserve(el);
                }
            });
        }, { threshold: 0.2 });

        statElements.forEach((el) => observer.observe(el));
    }

    // 7. INTERACTIVE 3D SPATIAL NETWORK GLOBE (SOVEREIGN MESH ORBIT)
    class GlobalNodeGraph {
        constructor(canvasId) {
            this.canvas = document.getElementById(canvasId);
            if (!this.canvas) return;
            this.ctx = this.canvas.getContext('2d');
            this.dpr = Math.min(window.devicePixelRatio || 1, 2);
            this.isSurgeActive = false;

            // Tier-1 Primary Hubs + Background Topological PoP Matrix
            this.nodes = [
                { id: 'sf', name: 'SAN FRANCISCO (US-WEST)', coords: '37.77°N, 122.42°W', lat: 37.77, lon: -122.42, latency: 5.1, tier: 1 },
                { id: 'frankfurt', name: 'FRANKFURT (EU-CENTRAL)', coords: '50.11°N, 8.68°E', lat: 50.11, lon: 8.68, latency: 8.4, tier: 1 },
                { id: 'singapore', name: 'SINGAPORE (AP-SOUTHEAST)', coords: '1.35°N, 103.82°E', lat: 1.35, lon: 103.82, latency: 4.8, tier: 1 },
                { id: 'tokyo', name: 'TOKYO (AP-NORTHEAST)', coords: '35.68°N, 139.77°E', lat: 35.68, lon: 139.77, latency: 6.2, tier: 1 },
                { id: 'london', name: 'LONDON (EU-WEST)', coords: '51.51°N, 0.12°W', lat: 51.51, lon: -0.12, latency: 7.9, tier: 2 },
                { id: 'sydney', name: 'SYDNEY (AP-OCEANIA)', coords: '33.87°S, 151.21°E', lat: -33.87, lon: 151.21, latency: 12.3, tier: 2 },
                { id: 'dubai', name: 'DUBAI (ME-CENTRAL)', coords: '25.20°N, 55.27°E', lat: 25.20, lon: 55.27, latency: 8.9, tier: 2 },
                { id: 'mumbai', name: 'MUMBAI (IN-SOUTH)', coords: '19.07°N, 72.87°E', lat: 19.07, lon: 72.87, latency: 9.1, tier: 2 },
                { id: 'seoul', name: 'SEOUL (AP-EAST)', coords: '37.56°N, 126.97°E', lat: 37.56, lon: 126.97, latency: 6.5, tier: 2 },
                { id: 'saopaulo', name: 'SÃO PAULO (SA-EAST)', coords: '23.55°S, 46.63°W', lat: -23.55, lon: -46.63, latency: 14.2, tier: 2 },
                { id: 'stockholm', name: 'STOCKHOLM (EU-NORTH)', coords: '59.33°N, 18.06°E', lat: 59.33, lon: 18.06, latency: 8.2, tier: 2 },
                { id: 'zurich', name: 'ZURICH (EU-ALPINE)', coords: '47.37°N, 8.54°E', lat: 47.37, lon: 8.54, latency: 7.6, tier: 2 }
            ];

            // Precompute unit vectors on the sphere
            this.nodes.forEach(node => {
                const phi = (node.lat * Math.PI) / 180;
                const lambda = (node.lon * Math.PI) / 180;
                node.ux = Math.cos(phi) * Math.sin(lambda);
                node.uy = -Math.sin(phi);
                node.uz = Math.cos(phi) * Math.cos(lambda);
                node.screenX = 0;
                node.screenY = 0;
                node.screenZ = 0;
                node.scale = 1;
            });

            // High-throughput global mesh topology
            this.connections = [
                [0, 1], // SF <-> Frankfurt
                [1, 2], // Frankfurt <-> Singapore
                [2, 3], // Singapore <-> Tokyo
                [3, 0], // Tokyo <-> SF (Trans-Pacific Ring)
                [0, 3], // SF <-> Tokyo Direct
                [1, 4], // Frankfurt <-> London
                [4, 0], // London <-> SF
                [2, 5], // Singapore <-> Sydney
                [3, 5], // Tokyo <-> Sydney
                [1, 6], // Frankfurt <-> Dubai
                [6, 7], // Dubai <-> Mumbai
                [7, 2], // Mumbai <-> Singapore
                [3, 8], // Tokyo <-> Seoul
                [1, 10], // Frankfurt <-> Stockholm
                [1, 11]  // Frankfurt <-> Zurich
            ];

            // 3D Orbit Orientation & Inertia
            this.rotX = 0.28;  // subtle pitch tilt downward
            this.rotY = -1.18; // initial yaw
            this.targetRotX = null;
            this.targetRotY = null;
            this.isDragging = false;
            this.dragStartX = 0;
            this.dragStartY = 0;
            this.dragVelX = 0;
            this.dragVelY = 0;
            this.lastPointerX = 0;
            this.lastPointerY = 0;

            this.packets = [];
            this.pulsePhase = 0;
            this.isVisible = false;
            this.rafId = null;
            this.hoveredNode = null;
            this.selectedNodeId = 'sf';

            this.init();
        }

        init() {
            this.resize();
            window.addEventListener('resize', () => this.resize(), { passive: true });
            this.spawnInitialPackets();
            this.initInteractions();
            this.initObserver();
        }

        initInteractions() {
            const canvas = this.canvas;

            // Pointer down for drag orbit
            canvas.addEventListener('pointerdown', (e) => {
                this.isDragging = true;
                this.dragStartX = e.clientX;
                this.dragStartY = e.clientY;
                this.lastPointerX = e.clientX;
                this.lastPointerY = e.clientY;
                this.dragVelX = 0;
                this.dragVelY = 0;
                this.targetRotX = null;
                this.targetRotY = null;
                canvas.setPointerCapture(e.pointerId);
            });

            // Pointer move for drag or hover
            window.addEventListener('pointermove', (e) => {
                if (this.isDragging) {
                    const dx = e.clientX - this.lastPointerX;
                    const dy = e.clientY - this.lastPointerY;

                    this.rotY += dx * 0.007;
                    this.rotX += dy * 0.007;
                    this.rotX = Math.max(-0.85, Math.min(0.85, this.rotX));

                    this.dragVelY = dx * 0.007;
                    this.dragVelX = dy * 0.007;

                    this.lastPointerX = e.clientX;
                    this.lastPointerY = e.clientY;
                    return;
                }

                // Hover detection when not dragging
                const rect = canvas.getBoundingClientRect();
                const mx = e.clientX - rect.left;
                const my = e.clientY - rect.top;

                if (mx < 0 || mx > rect.width || my < 0 || my > rect.height) {
                    this.hoveredNode = null;
                    return;
                }

                let found = null;
                let minDist = 24;
                for (const node of this.nodes) {
                    // Only hover nodes on the front-facing hemisphere
                    if (node.screenZ > -15) {
                        const dist = Math.hypot(mx - node.screenX, my - node.screenY);
                        if (dist < minDist) {
                            minDist = dist;
                            found = node;
                        }
                    }
                }
                this.hoveredNode = found;
                canvas.style.cursor = found ? 'pointer' : (this.isDragging ? 'grabbing' : 'grab');
            });

            // Pointer up
            window.addEventListener('pointerup', (e) => {
                if (this.isDragging) {
                    this.isDragging = false;
                    const dragDist = Math.hypot(e.clientX - this.dragStartX, e.clientY - this.dragStartY);
                    
                    // If tap/click with minimal movement and hovered node exists, select it
                    if (dragDist < 6 && this.hoveredNode) {
                        this.focusNode(this.hoveredNode);
                    }
                }
            });

            canvas.addEventListener('mouseleave', () => {
                if (!this.isDragging) {
                    this.hoveredNode = null;
                }
            });
        }

        selectNodeById(nodeId) {
            const node = this.nodes.find(n => n.id === nodeId);
            if (node) {
                this.focusNode(node, false);
            }
        }

        focusNode(node, syncDropdown = true) {
            this.selectedNodeId = node.id;

            // Target orientation to rotate node smoothly to the front-center
            this.targetRotY = -(node.lon * Math.PI) / 180;
            this.targetRotX = Math.max(-0.6, Math.min(0.6, (node.lat * Math.PI) / 180));

            // Sync with select element
            if (syncDropdown) {
                const nodeSelect = document.getElementById('node-select');
                if (nodeSelect) nodeSelect.value = node.id;
            }

            // Update latency readout
            const latEl = document.getElementById('telemetry-lat');
            if (latEl) latEl.textContent = `${node.latency.toFixed(1)} ms`;

            // Fire convergence packet beam from connected nodes
            const targetIdx = this.nodes.findIndex(n => n.id === node.id);
            for (let i = 0; i < this.connections.length; i++) {
                const conn = this.connections[i];
                if (conn[0] === targetIdx || conn[1] === targetIdx) {
                    for (let p = 0; p < 3; p++) {
                        this.packets.push({
                            connIndex: i,
                            progress: Math.random() * 0.25,
                            speed: 0.022 + Math.random() * 0.012,
                            color: 'rgba(251, 242, 222, '
                        });
                    }
                }
            }

            // Append telemetry log
            const logBox = document.getElementById('benchmark-log');
            if (logBox) {
                const time = new Date().toISOString().substring(11, 19);
                const line = document.createElement('div');
                line.className = 'log-line gold';
                line.innerHTML = `<span class="log-time">[${time}]</span> Target PoP switched to [${node.name}]. Direct ping: ${node.latency}ms // Coords: ${node.coords}.`;
                logBox.appendChild(line);
                logBox.scrollTop = logBox.scrollHeight;
            }

            triggerHaptic(18);
            if (window.sovereignAudio) {
                window.sovereignAudio.playNodePing();
            }
        }

        initObserver() {
            this.observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        if (!this.isVisible) {
                            this.isVisible = true;
                            this.render();
                        }
                    } else {
                        this.isVisible = false;
                        if (this.rafId) {
                            cancelAnimationFrame(this.rafId);
                            this.rafId = null;
                        }
                    }
                });
            }, { threshold: 0.05 });

            this.observer.observe(this.canvas);
        }

        resize() {
            const rect = this.canvas.parentElement.getBoundingClientRect();
            this.width = rect.width;
            this.height = Math.max(300, rect.height || 320);

            this.canvas.width = this.width * this.dpr;
            this.canvas.height = this.height * this.dpr;
            this.ctx.scale(this.dpr, this.dpr);
        }

        spawnInitialPackets() {
            this.packets = [];
            const count = this.isSurgeActive ? 48 : 18;
            for (let i = 0; i < count; i++) {
                this.packets.push({
                    connIndex: Math.floor(Math.random() * this.connections.length),
                    progress: Math.random(),
                    speed: (this.isSurgeActive ? 0.018 : 0.007) + Math.random() * 0.005,
                    color: Math.random() > 0.35 ? 'rgba(251, 242, 222, ' : 'rgba(212, 175, 55, '
                });
            }
        }

        triggerSurge() {
            this.isSurgeActive = true;
            this.spawnInitialPackets();
            setTimeout(() => {
                this.isSurgeActive = false;
                this.spawnInitialPackets();
            }, 3000);
        }

        project3D(x, y, z) {
            // Yaw rotation around Y axis
            const cosY = Math.cos(this.rotY), sinY = Math.sin(this.rotY);
            const x1 = x * cosY + z * sinY;
            const y1 = y;
            const z1 = -x * sinY + z * cosY;

            // Pitch rotation around X axis
            const cosX = Math.cos(this.rotX), sinX = Math.sin(this.rotX);
            const x2 = x1;
            const y2 = y1 * cosX - z1 * sinX;
            const z2 = y1 * sinX + z1 * cosX;

            // Perspective projection
            const fov = 380;
            const dist = 240;
            const scale = fov / (fov + z2 + dist);
            const cx = this.width / 2;
            const cy = this.height / 2;

            return {
                x: cx + x2 * scale,
                y: cy + y2 * scale,
                z: z2,
                scale: scale
            };
        }

        render() {
            const ctx = this.ctx;
            const w = this.width;
            const h = this.height;
            const cx = w / 2;
            const cy = h / 2;
            const R = Math.min(w, h) * 0.36;

            ctx.clearRect(0, 0, w, h);
            this.pulsePhase += 0.04;

            // --- 1. ROTATION PHYSICS & INERTIAL COASTING ---
            if (!this.isDragging) {
                if (this.targetRotY !== null && this.targetRotX !== null) {
                    let dy = (this.targetRotY - this.rotY) % (Math.PI * 2);
                    if (dy > Math.PI) dy -= Math.PI * 2;
                    if (dy < -Math.PI) dy += Math.PI * 2;
                    this.rotY += dy * 0.08;
                    this.rotX += (this.targetRotX - this.rotX) * 0.08;

                    if (Math.hypot(dy, this.targetRotX - this.rotX) < 0.004) {
                        this.targetRotY = null;
                        this.targetRotX = null;
                    }
                } else {
                    // Inertial coasting
                    this.rotY += this.dragVelY;
                    this.rotX += this.dragVelX;
                    this.dragVelY *= 0.93;
                    this.dragVelX *= 0.93;

                    // Subtle ambient spin when idle
                    if (Math.abs(this.dragVelY) < 0.0003) {
                        this.rotY += 0.0022;
                    }
                }
            }

            // --- 2. AMBIENT SPHERICAL ATMOSPHERE GLOW ---
            const glowGrad = ctx.createRadialGradient(cx, cy, R * 0.4, cx, cy, R * 1.22);
            glowGrad.addColorStop(0, 'rgba(226, 192, 141, 0.06)');
            glowGrad.addColorStop(0.7, 'rgba(226, 192, 141, 0.018)');
            glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = glowGrad;
            ctx.beginPath();
            ctx.arc(cx, cy, R * 1.22, 0, Math.PI * 2);
            ctx.fill();

            // Atmosphere outer horizon rim
            ctx.strokeStyle = 'rgba(226, 192, 141, 0.16)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(cx, cy, R, 0, Math.PI * 2);
            ctx.stroke();

            // --- 3. 3D LATITUDE PARALLELS (WIREFRAME) ---
            const parallels = [-60, -30, 0, 30, 60];
            parallels.forEach(latDeg => {
                const phi = (latDeg * Math.PI) / 180;
                const rLat = R * Math.cos(phi);
                const yLat = -R * Math.sin(phi);

                ctx.beginPath();
                let first = true;
                const segments = 48;
                for (let i = 0; i <= segments; i++) {
                    const theta = (i / segments) * Math.PI * 2;
                    const x0 = rLat * Math.sin(theta);
                    const z0 = rLat * Math.cos(theta);
                    const pt = this.project3D(x0, yLat, z0);

                    if (first) {
                        ctx.moveTo(pt.x, pt.y);
                        first = false;
                    } else {
                        ctx.lineTo(pt.x, pt.y);
                    }
                }
                ctx.strokeStyle = latDeg === 0 ? 'rgba(226, 192, 141, 0.18)' : 'rgba(226, 192, 141, 0.065)';
                ctx.lineWidth = latDeg === 0 ? 1.2 : 0.75;
                ctx.stroke();
            });

            // --- 4. 3D LONGITUDE MERIDIANS (WIREFRAME) ---
            const meridians = [0, 45, 90, 135, 180, 225, 270, 315];
            meridians.forEach(lonDeg => {
                const lambda = (lonDeg * Math.PI) / 180;
                ctx.beginPath();
                let first = true;
                const steps = 36;
                for (let i = 0; i <= steps; i++) {
                    const phi = (-Math.PI / 2) + (i / steps) * Math.PI;
                    const x0 = R * Math.cos(phi) * Math.sin(lambda);
                    const y0 = -R * Math.sin(phi);
                    const z0 = R * Math.cos(phi) * Math.cos(lambda);
                    const pt = this.project3D(x0, y0, z0);

                    if (first) {
                        ctx.moveTo(pt.x, pt.y);
                        first = false;
                    } else {
                        ctx.lineTo(pt.x, pt.y);
                    }
                }
                ctx.strokeStyle = 'rgba(226, 192, 141, 0.055)';
                ctx.lineWidth = 0.75;
                ctx.stroke();
            });

            // --- 5. 3D GREAT-CIRCLE ORBITAL ARCS ---
            for (let c = 0; c < this.connections.length; c++) {
                const [i1, i2] = this.connections[c];
                const n1 = this.nodes[i1];
                const n2 = this.nodes[i2];
                if (!n1 || !n2) continue;

                ctx.beginPath();
                let avgZ = 0;
                const arcSteps = 22;
                for (let s = 0; s <= arcSteps; s++) {
                    const t = s / arcSteps;
                    const vx = (1 - t) * n1.ux + t * n2.ux;
                    const vy = (1 - t) * n1.uy + t * n2.uy;
                    const vz = (1 - t) * n1.uz + t * n2.uz;
                    const len = Math.hypot(vx, vy, vz) || 1;

                    // Arc extends dynamically into outer space in the middle
                    const arcR = R + Math.sin(t * Math.PI) * (R * 0.22);
                    const px = (vx / len) * arcR;
                    const py = (vy / len) * arcR;
                    const pz = (vz / len) * arcR;

                    const pt = this.project3D(px, py, pz);
                    avgZ += pt.z;

                    if (s === 0) {
                        ctx.moveTo(pt.x, pt.y);
                    } else {
                        ctx.lineTo(pt.x, pt.y);
                    }
                }
                avgZ /= (arcSteps + 1);

                // Front-facing arcs are radiant gold; back arcs fade
                if (avgZ > -10) {
                    ctx.strokeStyle = 'rgba(226, 192, 141, 0.32)';
                    ctx.lineWidth = 1.3;
                    ctx.setLineDash([5, 3]);
                } else {
                    ctx.strokeStyle = 'rgba(226, 192, 141, 0.08)';
                    ctx.lineWidth = 0.8;
                    ctx.setLineDash([3, 4]);
                }
                ctx.stroke();
                ctx.setLineDash([]);
            }

            // --- 6. 3D MOVING DATA PACKETS ---
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            for (let i = this.packets.length - 1; i >= 0; i--) {
                const p = this.packets[i];
                p.progress += p.speed;
                if (p.progress >= 1) {
                    p.progress = 0;
                    p.connIndex = Math.floor(Math.random() * this.connections.length);
                }

                const conn = this.connections[p.connIndex];
                if (!conn) continue;
                const n1 = this.nodes[conn[0]];
                const n2 = this.nodes[conn[1]];
                if (!n1 || !n2) continue;

                const t = p.progress;
                const vx = (1 - t) * n1.ux + t * n2.ux;
                const vy = (1 - t) * n1.uy + t * n2.uy;
                const vz = (1 - t) * n1.uz + t * n2.uz;
                const len = Math.hypot(vx, vy, vz) || 1;
                const arcR = R + Math.sin(t * Math.PI) * (R * 0.22);

                const pt = this.project3D((vx / len) * arcR, (vy / len) * arcR, (vz / len) * arcR);
                const isFront = pt.z > -10;
                const alpha = isFront ? 0.95 : 0.22;
                const packetR = (this.isSurgeActive ? 3.0 : 2.0) * pt.scale;

                ctx.fillStyle = p.color + alpha + ')';
                ctx.beginPath();
                ctx.arc(pt.x, pt.y, packetR, 0, Math.PI * 2);
                ctx.fill();

                if (isFront) {
                    ctx.fillStyle = p.color + '0.3)';
                    ctx.beginPath();
                    ctx.arc(pt.x, pt.y, packetR * 2.8, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
            ctx.restore();

            // --- 7. PROJECT NODES & SORT BY DEPTH (Z-BUFFERING) ---
            const renderedNodes = [];
            for (const node of this.nodes) {
                const pt = this.project3D(node.ux * R, node.uy * R, node.uz * R);
                node.screenX = pt.x;
                node.screenY = pt.y;
                node.screenZ = pt.z;
                node.scale = pt.scale;
                renderedNodes.push(node);
            }

            // Draw back nodes first, front nodes last
            renderedNodes.sort((a, b) => a.screenZ - b.screenZ);

            for (const node of renderedNodes) {
                const nx = node.screenX;
                const ny = node.screenY;
                const isFront = node.screenZ > -15;
                const isSelected = this.selectedNodeId === node.id;
                const isHovered = this.hoveredNode && this.hoveredNode.id === node.id;

                if (!isFront) {
                    // Back hemisphere node: subtle occluded point
                    ctx.fillStyle = 'rgba(226, 192, 141, 0.2)';
                    ctx.beginPath();
                    ctx.arc(nx, ny, 2.2 * node.scale, 0, Math.PI * 2);
                    ctx.fill();
                    continue;
                }

                // Front hemisphere: high-fidelity interactive node
                const pulseR = (10 + (Math.sin(this.pulsePhase) * 0.5 + 0.5) * (isSelected ? 16 : 10)) * node.scale;
                const pulseAlpha = Math.max(0, (isSelected ? 0.65 : 0.35) - pulseR / (32 * node.scale));

                // Radar wave
                ctx.strokeStyle = isSelected ? `rgba(226, 192, 141, ${pulseAlpha})` : `rgba(52, 211, 153, ${pulseAlpha})`;
                ctx.lineWidth = isSelected ? 1.5 : 1;
                ctx.beginPath();
                ctx.arc(nx, ny, pulseR, 0, Math.PI * 2);
                ctx.stroke();

                // Hover targeting reticle
                if (isHovered) {
                    ctx.strokeStyle = '#FBF2DE';
                    ctx.lineWidth = 1.3;
                    ctx.setLineDash([2, 2]);
                    ctx.beginPath();
                    ctx.arc(nx, ny, 15 * node.scale, 0, Math.PI * 2);
                    ctx.stroke();
                    ctx.setLineDash([]);
                }

                // Solid Core Dark Shield
                ctx.fillStyle = '#060609';
                ctx.beginPath();
                ctx.arc(nx, ny, (isSelected ? 7 : 5.5) * node.scale, 0, Math.PI * 2);
                ctx.fill();

                // Beacon Glow
                ctx.fillStyle = isSelected ? '#FBF2DE' : (node.tier === 1 ? 'var(--gold-primary)' : 'rgba(226, 192, 141, 0.7)');
                ctx.beginPath();
                ctx.arc(nx, ny, (isSelected ? 4.5 : (node.tier === 1 ? 3.5 : 2.5)) * node.scale, 0, Math.PI * 2);
                ctx.fill();

                ctx.strokeStyle = isSelected ? '#FBF2DE' : '#E2C08D';
                ctx.lineWidth = isSelected ? 2 : 1.2;
                ctx.stroke();

                // Tier-1 Primary Node Typography Labels
                if (node.tier === 1) {
                    ctx.font = `bold ${Math.round(10 * node.scale)}px "JetBrains Mono", monospace`;
                    ctx.fillStyle = isSelected ? '#FBF2DE' : '#E2C08D';
                    ctx.textAlign = 'center';
                    ctx.fillText(node.id.toUpperCase(), nx, ny - (13 * node.scale));

                    ctx.font = `${Math.round(9 * node.scale)}px "JetBrains Mono", monospace`;
                    ctx.fillStyle = '#34D399';
                    ctx.fillText(`${node.latency}ms`, nx, ny + (18 * node.scale));
                }
            }

            // --- 8. FLOATING 3D HUD TARGETING TOOLTIP ---
            if (this.hoveredNode && this.hoveredNode.screenZ > -15) {
                const node = this.hoveredNode;
                const nx = node.screenX;
                const ny = node.screenY;
                const tipText = `${node.name} // ${node.coords} // P99: ${node.latency}ms`;

                ctx.font = '9px "JetBrains Mono", monospace';
                const metrics = ctx.measureText(tipText);
                const tipW = metrics.width + 18;
                const tipH = 24;
                const tipX = Math.min(Math.max(nx - tipW / 2, 10), w - tipW - 10);
                const tipY = ny - 42;

                ctx.fillStyle = 'rgba(8, 8, 14, 0.96)';
                ctx.strokeStyle = '#D4AF37';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.roundRect(tipX, tipY, tipW, tipH, 4);
                ctx.fill();
                ctx.stroke();

                ctx.fillStyle = '#FBF2DE';
                ctx.textAlign = 'center';
                ctx.fillText(tipText, tipX + tipW / 2, tipY + 15);
            }

            if (this.isVisible) {
                this.rafId = requestAnimationFrame(() => this.render());
            }
        }
    }

    let nodeGraphInstance = null;
    function initNodeGraph() {
        if (document.getElementById('node-graph-canvas')) {
            nodeGraphInstance = new GlobalNodeGraph('node-graph-canvas');
        }
    }

    // 7B. REAL-TIME CRT LATENCY OSCILLOSCOPE
    class LatencyOscilloscope {
        constructor(canvasId) {
            this.canvas = document.getElementById(canvasId);
            if (!this.canvas) return;
            this.ctx = this.canvas.getContext('2d');
            this.dpr = Math.min(window.devicePixelRatio || 1, 2);
            this.phase = 0;
            this.isSurge = false;
            this.isVisible = false;
            this.rafId = null;

            this.init();
        }

        init() {
            this.resize();
            window.addEventListener('resize', () => this.resize(), { passive: true });
            this.initObserver();
        }

        initObserver() {
            this.observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        if (!this.isVisible) {
                            this.isVisible = true;
                            this.render();
                        }
                    } else {
                        this.isVisible = false;
                        if (this.rafId) {
                            cancelAnimationFrame(this.rafId);
                            this.rafId = null;
                        }
                    }
                });
            }, { threshold: 0.05 });

            this.observer.observe(this.canvas);
        }

        resize() {
            const rect = this.canvas.parentElement.getBoundingClientRect();
            this.width = rect.width;
            this.height = 72;
            this.canvas.width = this.width * this.dpr;
            this.canvas.height = this.height * this.dpr;
            this.ctx.scale(this.dpr, this.dpr);
        }

        triggerSurge() {
            this.isSurge = true;
            const statusEl = document.getElementById('waveform-status');
            if (statusEl) {
                statusEl.textContent = 'P99: SURGE STRESS ACTIVE';
                statusEl.style.color = '#D4AF37';
            }
            setTimeout(() => {
                this.isSurge = false;
                if (statusEl) {
                    statusEl.textContent = 'P99: NOMINAL (5.1ms)';
                    statusEl.style.color = '#34D399';
                }
            }, 3000);
        }

        render() {
            const ctx = this.ctx;
            const w = this.width;
            const h = this.height;
            const cy = h / 2;

            ctx.clearRect(0, 0, w, h);

            // CRT grid lines
            ctx.strokeStyle = 'rgba(226, 192, 141, 0.06)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            for (let x = 0; x < w; x += 30) {
                ctx.moveTo(x, 0); ctx.lineTo(x, h);
            }
            for (let y = 0; y < h; y += 18) {
                ctx.moveTo(0, y); ctx.lineTo(w, y);
            }
            ctx.stroke();

            // Waveform calculation
            this.phase += this.isSurge ? 0.16 : 0.05;
            const amp = this.isSurge ? 22 : 9;
            const freq = this.isSurge ? 0.055 : 0.024;

            ctx.beginPath();
            for (let x = 0; x < w; x++) {
                const noise = (Math.sin(x * 0.12 + this.phase * 2) * 0.5 + Math.random() * 0.5) * (this.isSurge ? 5 : 1.2);
                const y = cy + Math.sin(x * freq + this.phase) * amp + noise;
                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }

            // Glow trace
            ctx.strokeStyle = this.isSurge ? 'rgba(212, 175, 55, 0.35)' : 'rgba(52, 211, 153, 0.25)';
            ctx.lineWidth = 4;
            ctx.stroke();

            // Sharp core
            ctx.strokeStyle = this.isSurge ? '#FBF2DE' : '#34D399';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            if (this.isVisible) {
                this.rafId = requestAnimationFrame(() => this.render());
            }
        }
    }

    let oscilloscopeInstance = null;
    function initOscilloscope() {
        if (document.getElementById('waveform-canvas')) {
            oscilloscopeInstance = new LatencyOscilloscope('waveform-canvas');
            window.oscilloscopeInstance = oscilloscopeInstance;
        }
    }

    // 7C. HERO PORTRAIT 3D PERSPECTIVE PARALLAX & MOBILE GYROSCOPE
    function initPortraitParallax() {
        const stage = document.querySelector('.hero-portrait-stage');
        const wrapper = document.querySelector('.portrait-wrapper');
        const glow = document.querySelector('.hero-ambient-glow');
        if (!stage || !wrapper) return;

        // Desktop fine pointer: smooth mouse-follow lerp
        if (!window.matchMedia('(hover: none)').matches) {
            let rafId = null;
            let targetX = 0;
            let targetY = 0;
            let currentX = 0;
            let currentY = 0;

            function update() {
                currentX += (targetX - currentX) * 0.08;
                currentY += (targetY - currentY) * 0.08;

                wrapper.style.transform = `perspective(1000px) rotateY(${currentX * 10}deg) rotateX(${-currentY * 10}deg) translateZ(8px)`;

                if (Math.abs(targetX - currentX) > 0.001 || Math.abs(targetY - currentY) > 0.001) {
                    rafId = requestAnimationFrame(update);
                } else {
                    rafId = null;
                }
            }

            stage.addEventListener('mousemove', (e) => {
                const rect = stage.getBoundingClientRect();
                targetX = (e.clientX - rect.left) / rect.width - 0.5;
                targetY = (e.clientY - rect.top) / rect.height - 0.5;

                if (!rafId) {
                    rafId = requestAnimationFrame(update);
                }
            }, { passive: true });

            stage.addEventListener('mouseleave', () => {
                targetX = 0;
                targetY = 0;
                if (!rafId) {
                    rafId = requestAnimationFrame(update);
                }
            });
        }

        // Mobile touch devices: Gyroscope deviceorientation tilt
        if (('ontouchstart' in window || navigator.maxTouchPoints > 0) && window.DeviceOrientationEvent) {
            let lastGamma = 0;
            let lastBeta = 0;

            window.addEventListener('deviceorientation', (e) => {
                if (e.gamma === null || e.beta === null) return;
                const gamma = Math.min(Math.max(e.gamma, -30), 30);
                const beta = Math.min(Math.max(e.beta - 45, -30), 30);

                lastGamma += (gamma - lastGamma) * 0.12;
                lastBeta += (beta - lastBeta) * 0.12;

                wrapper.style.transform = `perspective(1000px) rotateY(${lastGamma * 0.35}deg) rotateX(${-lastBeta * 0.35}deg)`;
                if (glow) {
                    glow.style.transform = `translate3d(${lastGamma * 1.5}px, ${lastBeta * 1.5}px, 0)`;
                }
            }, { passive: true });
        }
    }

    // 7D. INTERACTIVE CHRONOLOGY SCRUBBER (ODYSSEY TIMELINE)
    function initChronologyScrubber() {
        const scrubber = document.getElementById('chronology-scrubber');
        if (!scrubber) return;

        const pills = scrubber.querySelectorAll('.scrubber-pill');
        const phases = ['phase-1', 'phase-2', 'phase-3', 'phase-4', 'phase-5', 'phase-6'];
        const phaseEls = phases.map(id => document.getElementById(id)).filter(Boolean);

        if (!pills.length || !phaseEls.length) return;

        pills.forEach(pill => {
            pill.addEventListener('click', (e) => {
                e.preventDefault();
                const phaseId = pill.getAttribute('data-phase');
                const target = document.getElementById(phaseId);
                triggerHaptic(8);
                if (target) {
                    if (lenisInstance) {
                        lenisInstance.scrollTo(target, { offset: -120, duration: 1.2 });
                    } else {
                        const y = target.getBoundingClientRect().top + window.scrollY - 120;
                        window.scrollTo({ top: y, behavior: 'smooth' });
                    }
                    if (window.sovereignAudio) {
                        window.sovereignAudio.playHapticChime();
                    }
                }
            });
        });

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.id;
                    pills.forEach(p => {
                        const isActive = p.getAttribute('data-phase') === id;
                        p.classList.toggle('active', isActive);
                        p.setAttribute('aria-current', isActive ? 'step' : 'false');
                        if (isActive && scrubber) {
                            // Smoothly scroll the horizontal track internally WITHOUT touching window vertical scroll!
                            const pLeft = p.offsetLeft;
                            const pWidth = p.offsetWidth;
                            const sWidth = scrubber.clientWidth;
                            scrubber.scrollTo({
                                left: pLeft - (sWidth / 2) + (pWidth / 2),
                                behavior: 'smooth'
                            });
                        }
                    });
                }
            });
        }, {
            threshold: 0.3,
            rootMargin: '-20% 0px -40% 0px'
        });

        phaseEls.forEach(el => observer.observe(el));
    }

    // 7D-2. ODYSSEY HIGH-DENSITY DETAILED GOLDEN STARDUST SILHOUETTES
    function createDetailedSilhouetteData(shape, width, height) {
        const targets = [];
        const hairlines = [];
        const cx = width / 2;
        const cy = height / 2;

        function addLine(x1, y1, x2, y2, density = 1) {
            const dist = Math.hypot(x2 - x1, y2 - y1);
            const steps = Math.max(2, Math.floor(dist * density));
            const pts = [];
            for (let i = 0; i <= steps; i++) {
                const t = i / steps;
                const x = x1 + (x2 - x1) * t;
                const y = y1 + (y2 - y1) * t;
                targets.push({ x, y });
                pts.push({ x, y });
            }
            hairlines.push(pts);
        }

        function addArc(ox, oy, r, startA, endA, steps = 30, isClosed = false) {
            const pts = [];
            for (let i = 0; i <= steps; i++) {
                const t = i / steps;
                const a = startA + (endA - startA) * t;
                const x = ox + Math.cos(a) * r;
                const y = oy + Math.sin(a) * r;
                targets.push({ x, y });
                pts.push({ x, y });
            }
            if (isClosed) pts.push(pts[0]);
            hairlines.push(pts);
        }

        function addCurve(points, steps = 30) {
            const pts = [];
            for (let i = 0; i <= steps; i++) {
                const t = i / steps;
                let x, y;
                if (points.length === 3) {
                    const u = 1 - t;
                    x = u * u * points[0].x + 2 * u * t * points[1].x + t * t * points[2].x;
                    y = u * u * points[0].y + 2 * u * t * points[1].y + t * t * points[2].y;
                } else if (points.length === 4) {
                    const u = 1 - t;
                    x = u * u * u * points[0].x + 3 * u * u * t * points[1].x + 3 * u * t * t * points[2].x + t * t * t * points[3].x;
                    y = u * u * u * points[0].y + 3 * u * u * t * points[1].y + 3 * u * t * t * points[2].y + t * t * t * points[3].y;
                } else {
                    x = points[0].x + (points[1].x - points[0].x) * t;
                    y = points[0].y + (points[1].y - points[0].y) * t;
                }
                targets.push({ x, y });
                pts.push({ x, y });
            }
            hairlines.push(pts);
        }

        if (shape === 'book') {
            // 01. CODEX OF MECHANICAL THEORY & DRAFTING COMPASS
            const spineTop = { x: cx, y: cy - 44 };
            const spineBot = { x: cx, y: cy + 48 };
            addLine(spineTop.x, spineTop.y, spineBot.x, spineBot.y, 1);

            const lTopLeft = { x: cx - 110, y: cy - 36 };
            const lTopCtrl = { x: cx - 60, y: cy - 62 };
            addCurve([spineTop, lTopCtrl, lTopLeft], 45);

            const lBotLeft = { x: cx - 110, y: cy + 46 };
            addLine(lTopLeft.x, lTopLeft.y, lBotLeft.x, lBotLeft.y, 1);

            const lBotCtrl = { x: cx - 60, y: cy + 24 };
            addCurve([spineBot, lBotCtrl, lBotLeft], 45);

            const rTopRight = { x: cx + 110, y: cy - 36 };
            const rTopCtrl = { x: cx + 60, y: cy - 62 };
            addCurve([spineTop, rTopCtrl, rTopRight], 45);

            const rBotRight = { x: cx + 110, y: cy + 46 };
            addLine(rTopRight.x, rTopRight.y, rBotRight.x, rBotRight.y, 1);

            const rBotCtrl = { x: cx + 60, y: cy + 24 };
            addCurve([spineBot, rBotCtrl, rBotRight], 45);

            // Layered page leaves (thickness of leather codex)
            for (let offset of [4, 8, 12]) {
                addCurve([{ x: spineBot.x, y: spineBot.y + offset }, { x: lBotCtrl.x, y: lBotCtrl.y + offset }, { x: lBotLeft.x, y: lBotLeft.y + offset }], 35);
                addCurve([{ x: spineBot.x, y: spineBot.y + offset }, { x: rBotCtrl.x, y: rBotCtrl.y + offset }, { x: rBotRight.x, y: rBotRight.y + offset }], 35);
                addLine(lTopLeft.x - offset * 0.35, lTopLeft.y, lBotLeft.x - offset * 0.35, lBotLeft.y + offset, 0.6);
                addLine(rTopRight.x + offset * 0.35, rTopRight.y, rBotRight.x + offset * 0.35, rBotRight.y + offset, 0.6);
            }

            // Dotted text / schematic equation lines across both pages
            for (let row = 0; row < 6; row++) {
                const yFrac = 0.22 + row * 0.13;
                for (let s = 0; s < 22; s++) {
                    const u = s / 22;
                    const lx = spineTop.x - 16 - u * 78;
                    const curve = Math.sin(u * Math.PI) * 14;
                    const ly = spineTop.y + (spineBot.y - spineTop.y) * yFrac - curve;
                    targets.push({ x: lx, y: ly });
                }
                for (let s = 0; s < 22; s++) {
                    const u = s / 22;
                    const rx = spineTop.x + 16 + u * 78;
                    const curve = Math.sin(u * Math.PI) * 14;
                    const ry = spineTop.y + (spineBot.y - spineTop.y) * yFrac - curve;
                    targets.push({ x: rx, y: ry });
                }
            }

            // Silk ribbon bookmark with diamond star tip
            addCurve([
                { x: cx, y: cy - 38 },
                { x: cx + 18, y: cy + 30 },
                { x: cx + 8, y: cy + 74 }
            ], 35);
            addArc(cx + 8, cy + 74, 5, 0, Math.PI * 2, 14, true);

            // Drafting Compass arching over the book
            const pivot = { x: cx, y: cy - 88 };
            addArc(pivot.x, pivot.y, 6, 0, Math.PI * 2, 16, true);
            addLine(pivot.x, pivot.y, cx - 55, cy - 40, 1);
            addLine(pivot.x, pivot.y, cx + 55, cy - 40, 1);
            addArc(pivot.x, pivot.y, 46, Math.PI * 0.35, Math.PI * 0.65, 25);

        } else if (shape === 'gear') {
            // 02. DUAL INTERLOCKING GEARS & OPEN-ENDED WRENCH
            const g1 = { x: cx - 18, y: cy + 12, R: 62, teeth: 12 };
            const g2 = { x: cx + 58, y: cy - 44, R: 34, teeth: 8 };

            function makeGear(gx, gy, R, teeth, rotOffset = 0) {
                const rootR = R * 0.82;
                const tipR = R * 1.14;
                const dTheta = (Math.PI * 2) / teeth;

                for (let i = 0; i < teeth; i++) {
                    const a0 = i * dTheta + rotOffset;
                    const a1 = a0 + dTheta * 0.28;
                    const a2 = a0 + dTheta * 0.42;
                    const a3 = a0 + dTheta * 0.70;
                    const a4 = a0 + dTheta * 0.84;
                    const a5 = a0 + dTheta;

                    addLine(gx + Math.cos(a0) * rootR, gy + Math.sin(a0) * rootR,
                            gx + Math.cos(a1) * rootR, gy + Math.sin(a1) * rootR, 1);
                    addLine(gx + Math.cos(a1) * rootR, gy + Math.sin(a1) * rootR,
                            gx + Math.cos(a2) * tipR, gy + Math.sin(a2) * tipR, 1);
                    addLine(gx + Math.cos(a2) * tipR, gy + Math.sin(a2) * tipR,
                            gx + Math.cos(a3) * tipR, gy + Math.sin(a3) * tipR, 1);
                    addLine(gx + Math.cos(a3) * tipR, gy + Math.sin(a3) * tipR,
                            gx + Math.cos(a4) * rootR, gy + Math.sin(a4) * rootR, 1);
                    addLine(gx + Math.cos(a4) * rootR, gy + Math.sin(a4) * rootR,
                            gx + Math.cos(a5) * rootR, gy + Math.sin(a5) * rootR, 1);
                }

                addArc(gx, gy, R * 0.64, 0, Math.PI * 2, 50, true);
                addArc(gx, gy, R * 0.24, 0, Math.PI * 2, 28, true);
                addArc(gx, gy, R * 0.12, 0, Math.PI * 2, 16, true);

                if (teeth >= 10) {
                    for (let s = 0; s < 5; s++) {
                        const sa = (s / 5) * Math.PI * 2 + rotOffset;
                        const scx = gx + Math.cos(sa) * (R * 0.44);
                        const scy = gy + Math.sin(sa) * (R * 0.44);
                        addArc(scx, scy, R * 0.14, 0, Math.PI * 2, 20, true);
                    }
                }
            }

            makeGear(g1.x, g1.y, g1.R, g1.teeth, 0);
            makeGear(g2.x, g2.y, g2.R, g2.teeth, Math.PI / 8 + 0.18); // Interlocking tooth mesh!

            // Open-ended Engineer's Wrench angled across background at 45 degrees
            const wAngle = Math.PI * 0.26;
            const wCos = Math.cos(wAngle);
            const wSin = Math.sin(wAngle);
            const wHead = { x: cx + 15, y: cy - 20 };
            const wTail = { x: cx - 105, y: cy + 95 };

            const hw = 7;
            const nx = -wSin * hw;
            const ny = wCos * hw;
            addLine(wHead.x + nx, wHead.y + ny, wTail.x + nx, wTail.y + ny, 0.8);
            addLine(wHead.x - nx, wHead.y - ny, wTail.x - nx, wTail.y - ny, 0.8);
            addArc(wTail.x, wTail.y, hw * 1.5, 0, Math.PI * 2, 22, true);
            addArc(wTail.x, wTail.y, hw * 0.65, 0, Math.PI * 2, 14, true);

        } else if (shape === 'micrometer') {
            // 03. PRECISION METROLOGY OUTSIDE MICROMETER
            const axisY = cy - 26;
            const frameL = cx - 72;
            const frameR = cx + 26;

            addCurve([
                { x: frameL, y: axisY },
                { x: frameL - 25, y: axisY + 68 },
                { x: cx - 20, y: axisY + 86 },
                { x: frameR, y: axisY + 45 },
                { x: frameR, y: axisY }
            ], 65);

            addCurve([
                { x: frameL + 24, y: axisY },
                { x: frameL + 6, y: axisY + 46 },
                { x: cx - 20, y: axisY + 62 },
                { x: frameR - 16, y: axisY + 32 },
                { x: frameR - 16, y: axisY }
            ], 55);

            // Insulated Grip Plate hatch lines on the bottom bow
            for (let i = -35; i <= -5; i += 5) {
                addLine(cx + i, axisY + 65, cx + i + 10, axisY + 82, 0.6);
            }

            // Anvil on left with flat face
            addLine(frameL + 5, axisY - 8, frameL + 34, axisY - 8, 1);
            addLine(frameL + 5, axisY + 8, frameL + 34, axisY + 8, 1);
            addLine(frameL + 34, axisY - 8, frameL + 34, axisY + 8, 1);

            // Spindle on right with flat face (measuring face at cx - 4, leaving gap)
            const spFace = cx - 4;
            addLine(spFace, axisY - 7, frameR - 8, axisY - 7, 1);
            addLine(spFace, axisY + 7, frameR - 8, axisY + 7, 1);
            addLine(spFace, axisY - 7, spFace, axisY + 7, 1);

            // Precision Rectangular Gage Block sitting between faces!
            const gbL = frameL + 35;
            const gbR = spFace - 1;
            addLine(gbL, axisY - 14, gbR, axisY - 14, 1);
            addLine(gbR, axisY - 14, gbR, axisY + 14, 1);
            addLine(gbR, axisY + 14, gbL, axisY + 14, 1);
            addLine(gbL, axisY + 14, gbL, axisY - 14, 1);

            // Sleeve / Barrel
            const slStart = frameR;
            const slEnd = cx + 78;
            addLine(slStart, axisY - 10, slEnd, axisY - 10, 1);
            addLine(slStart, axisY + 10, slEnd, axisY + 10, 1);
            addLine(slStart + 6, axisY, slEnd, axisY, 1); // Horizontal datum line!

            // Millimeter graduation tick marks along datum
            for (let t = slStart + 10; t < slEnd - 4; t += 5) {
                addLine(t, axisY - 8, t, axisY, 0.8);
                addLine(t + 2.5, axisY, t + 2.5, axisY + 6, 0.6);
            }

            // Thimble (beveled cone + rotating barrel)
            const thBevel = cx + 86;
            const thEnd = cx + 128;
            addLine(slEnd, axisY - 10, thBevel, axisY - 14, 1);
            addLine(slEnd, axisY + 10, thBevel, axisY + 14, 1);
            addLine(slEnd, axisY - 10, slEnd, axisY + 10, 1);
            addLine(thBevel, axisY - 14, thEnd, axisY - 14, 1);
            addLine(thBevel, axisY + 14, thEnd, axisY + 14, 1);
            addLine(thEnd, axisY - 14, thEnd, axisY + 14, 1);

            // Diamond knurling hatch on thimble
            for (let k = thBevel + 6; k < thEnd - 4; k += 7) {
                addLine(k, axisY - 13, k + 6, axisY + 13, 0.6);
                addLine(k + 6, axisY - 13, k, axisY + 13, 0.6);
            }

            // Ratchet speeder knob at far right
            const rEnd = cx + 144;
            addLine(thEnd, axisY - 8, rEnd, axisY - 8, 1);
            addLine(thEnd, axisY + 8, rEnd, axisY + 8, 1);
            addLine(rEnd, axisY - 8, rEnd, axisY + 8, 1);
            for (let s = thEnd + 3; s < rEnd; s += 3) {
                addLine(s, axisY - 8, s, axisY + 8, 0.6);
            }

        } else if (shape === 'spire') {
            // 04. THE ICONIC TRX EXCHANGE 106 TOWER & DIAMOND APEX
            const baseBotY = cy + 105;
            const crownTopY = cy - 130;
            const crownBotY = cy - 74;

            addLine(cx - 65, baseBotY, cx + 65, baseBotY, 1);
            addLine(cx - 52, baseBotY - 14, cx + 52, baseBotY - 14, 1);
            addLine(cx - 65, baseBotY, cx - 52, baseBotY - 14, 0.8);
            addLine(cx + 65, baseBotY, cx + 52, baseBotY - 14, 0.8);

            const tiers = 7;
            const towerTopW = 28;
            const towerBotW = 54;

            for (let t = 0; t < tiers; t++) {
                const frac1 = t / tiers;
                const frac2 = (t + 1) / tiers;
                const y1 = (baseBotY - 14) - frac1 * ((baseBotY - 14) - crownBotY);
                const y2 = (baseBotY - 14) - frac2 * ((baseBotY - 14) - crownBotY);
                const w1 = towerBotW - frac1 * (towerBotW - towerTopW);
                const w2 = towerBotW - frac2 * (towerBotW - towerTopW);

                addLine(cx - w1, y1, cx - w2, y2, 1);
                addLine(cx + w1, y1, cx + w2, y2, 1);
                addLine(cx - w2, y2, cx + w2, y2, 0.8);
                addLine(cx - w1, y1, cx + w2, y2, 0.6);
                addLine(cx + w1, y1, cx - w2, y2, 0.6);
            }

            addLine(cx, baseBotY - 14, cx, crownBotY, 0.6);

            const apex = { x: cx, y: crownTopY };
            const cL = { x: cx - towerTopW * 0.9, y: crownBotY };
            const cR = { x: cx + towerTopW * 0.9, y: crownBotY };
            const cMid = { x: cx, y: crownBotY + 8 };

            addLine(cL.x, cL.y, apex.x, apex.y, 1);
            addLine(cR.x, cR.y, apex.x, apex.y, 1);
            addLine(cMid.x, cMid.y, apex.x, apex.y, 1);
            addLine(cL.x, cL.y, cMid.x, cMid.y, 0.8);
            addLine(cR.x, cR.y, cMid.x, cMid.y, 0.8);

            addLine(apex.x - 18, apex.y, apex.x + 18, apex.y, 0.8);
            addLine(apex.x, apex.y - 18, apex.x, apex.y + 18, 0.8);
            addArc(apex.x, apex.y, 4, 0, Math.PI * 2, 14, true);

        } else if (shape === 'rigging') {
            // 05. HIGH-ANGLE CLIMBING CARABINER & FIGURE-8 DESCENDER WITH LIFELINE
            const spineX = cx - 28;
            const gateX = cx + 22;
            const topY = cy - 48;
            const botY = cy + 42;

            addCurve([
                { x: gateX - 8, y: topY - 12 },
                { x: spineX - 16, y: topY + 8 },
                { x: spineX - 18, y: botY - 8 },
                { x: gateX - 14, y: botY + 14 }
            ], 65);

            addCurve([
                { x: gateX - 8, y: topY - 12 },
                { x: gateX + 8, y: topY - 8 },
                { x: gateX + 10, y: topY + 12 }
            ], 30);

            addCurve([
                { x: gateX - 14, y: botY + 14 },
                { x: gateX + 6, y: botY + 10 },
                { x: gateX + 8, y: botY - 12 }
            ], 30);

            addLine(gateX + 10, topY + 12, gateX + 8, botY - 12, 1);
            const barrelTop = cy - 14;
            const barrelBot = cy + 14;
            addLine(gateX + 4, barrelTop, gateX + 15, barrelTop, 0.8);
            addLine(gateX + 4, barrelBot, gateX + 15, barrelBot, 0.8);
            addLine(gateX + 15, barrelTop, gateX + 15, barrelBot, 0.8);
            addLine(gateX + 4, barrelTop, gateX + 4, barrelBot, 0.8);

            for (let kr = barrelTop + 4; kr < barrelBot; kr += 4) {
                addLine(gateX + 4, kr, gateX + 15, kr, 0.6);
            }

            const f8Top = cy - 78;
            const f8Neck = cy - 54;
            addArc(cx - 2, f8Top, 22, 0, Math.PI * 2, 40, true);
            addArc(cx - 2, f8Top, 14, 0, Math.PI * 2, 28, true);
            addLine(cx - 16, f8Neck, cx + 12, f8Neck, 0.8);

            const ropeX = cx - 2;
            for (let ry = cy - 125; ry <= cy + 125; ry += 2.5) {
                const twist1 = Math.sin(ry * 0.35) * 5.5;
                const twist2 = -twist1;
                targets.push({ x: ropeX + twist1, y: ry });
                targets.push({ x: ropeX + twist2, y: ry });
            }
            addLine(ropeX - 5.5, cy - 125, ropeX - 5.5, cy + 125, 0.7);
            addLine(ropeX + 5.5, cy - 125, ropeX + 5.5, cy + 125, 0.7);

        } else if (shape === 'constellation') {
            // 06. SOVEREIGN AI MULTI-AGENT BRAIN & SACRED GEOMETRY LATTICE
            addArc(cx, cy, 28, 0, Math.PI * 2, 45, true);
            addArc(cx, cy, 18, 0, Math.PI * 2, 32, true);
            addArc(cx, cy, 8, 0, Math.PI * 2, 18, true);

            addLine(cx - 14, cy, cx + 14, cy, 1);
            addLine(cx, cy - 14, cx, cy + 14, 1);

            const radius = 86;
            const nodes = [];
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2 - Math.PI / 2;
                const nx = cx + Math.cos(angle) * radius;
                const ny = cy + Math.sin(angle) * radius;
                nodes.push({ x: nx, y: ny, angle });

                addArc(nx, ny, 10, 0, Math.PI * 2, 22, true);
                addArc(nx, ny, 5, 0, Math.PI * 2, 14, true);

                addLine(cx + Math.cos(angle) * 28, cy + Math.sin(angle) * 28,
                        nx - Math.cos(angle) * 10, ny - Math.sin(angle) * 10, 0.8);
            }

            for (let i = 0; i < 8; i++) {
                const next = (i + 1) % 8;
                addLine(nodes[i].x, nodes[i].y, nodes[next].x, nodes[next].y, 0.8);
            }

            for (let i = 0; i < 8; i++) {
                const skip = (i + 3) % 8;
                addLine(nodes[i].x, nodes[i].y, nodes[skip].x, nodes[skip].y, 0.6);
            }

            addArc(cx, cy, radius + 22, 0, Math.PI * 2, 60);
        }

        return { targets, hairlines };
    }

    class TimelineMagicDustCanvas {
        constructor(canvas) {
            this.canvas = canvas;
            this.ctx = canvas.getContext('2d');
            this.shape = canvas.getAttribute('data-shape') || 'book';
            this.dpr = Math.min(window.devicePixelRatio || 1, 2);
            this.particles = [];
            this.hairlines = [];
            this.time = 0;
            this.isVisible = false;
            this.rafId = null;
            this.width = 300;
            this.height = 280;
            this.mouse = { x: -9999, y: -9999, active: false };

            this.init();
        }

        init() {
            this.resize();
            window.addEventListener('resize', () => this.resize(), { passive: true });
            this.buildParticles();
            this.initInteractions();
            this.initObserver();
        }

        resize() {
            const rect = this.canvas.getBoundingClientRect();
            this.width = rect.width || 320;
            this.height = Math.max(240, rect.height || 280);
            this.canvas.width = this.width * this.dpr;
            this.canvas.height = this.height * this.dpr;
            this.ctx.scale(this.dpr, this.dpr);
            if (this.particles.length > 0) {
                this.buildParticles();
            }
        }

        buildParticles() {
            const { targets, hairlines } = createDetailedSilhouetteData(this.shape, this.width, this.height);
            this.hairlines = hairlines;
            this.particles = [];
            const colors = ['#F5D77F', '#E2C08D', '#FBF2DE', '#FFE494'];
            const isMobile = window.innerWidth <= 768;
            const stride = isMobile ? 2 : 1;

            for (let i = 0; i < targets.length; i += stride) {
                const t = targets[i];
                this.particles.push({
                    x: t.x + (Math.random() - 0.5) * 4,
                    y: t.y + (Math.random() - 0.5) * 4,
                    vx: 0,
                    vy: 0,
                    targetX: t.x,
                    targetY: t.y,
                    baseSize: (isMobile ? 1.05 : 0.85) + Math.random() * 0.75,
                    alpha: 0.45 + Math.random() * 0.45,
                    twinkleSpeed: 0.03 + Math.random() * 0.045,
                    twinklePhase: Math.random() * Math.PI * 2,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    isSparkle: Math.random() > 0.88
                });
            }
        }

        initInteractions() {
            this.canvas.addEventListener('mousemove', (e) => {
                const rect = this.canvas.getBoundingClientRect();
                this.mouse.x = e.clientX - rect.left;
                this.mouse.y = e.clientY - rect.top;
                this.mouse.active = true;
            }, { passive: true });

            this.canvas.addEventListener('mouseleave', () => {
                this.mouse.active = false;
            }, { passive: true });

            this.canvas.addEventListener('touchstart', (e) => {
                if (e.touches.length > 0) {
                    const rect = this.canvas.getBoundingClientRect();
                    this.mouse.x = e.touches[0].clientX - rect.left;
                    this.mouse.y = e.touches[0].clientY - rect.top;
                    this.mouse.active = true;
                }
            }, { passive: true });

            this.canvas.addEventListener('touchmove', (e) => {
                if (e.touches.length > 0) {
                    const rect = this.canvas.getBoundingClientRect();
                    this.mouse.x = e.touches[0].clientX - rect.left;
                    this.mouse.y = e.touches[0].clientY - rect.top;
                    this.mouse.active = true;
                }
            }, { passive: true });

            this.canvas.addEventListener('touchend', () => {
                this.mouse.active = false;
            }, { passive: true });

            this.canvas.addEventListener('touchcancel', () => {
                this.mouse.active = false;
            }, { passive: true });
        }

        initObserver() {
            this.observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        if (!this.isVisible) {
                            this.isVisible = true;
                            this.render();
                        }
                    } else {
                        this.isVisible = false;
                        if (this.rafId) {
                            cancelAnimationFrame(this.rafId);
                            this.rafId = null;
                        }
                    }
                });
            }, { threshold: 0.05 });

            this.observer.observe(this.canvas);
        }

        render() {
            const ctx = this.ctx;
            const w = this.width;
            const h = this.height;
            this.time += 0.03;

            ctx.clearRect(0, 0, w, h);

            // 1. Atmospheric soft radial background glow
            const glowGrad = ctx.createRadialGradient(w / 2, h / 2, 20, w / 2, h / 2, 140);
            glowGrad.addColorStop(0, 'rgba(245, 215, 127, 0.06)');
            glowGrad.addColorStop(0.6, 'rgba(226, 192, 141, 0.015)');
            glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = glowGrad;
            ctx.beginPath();
            ctx.arc(w / 2, h / 2, 140, 0, Math.PI * 2);
            ctx.fill();

            // 2. Living twinkling fairy stardust particles (no static underlay lines)
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';

            for (let i = 0; i < this.particles.length; i++) {
                const p = this.particles[i];

                // Coherent wave breathing (silhouette preserves its crisp form!)
                const wave = Math.sin(this.time * 1.5 + (p.targetX + p.targetY) * 0.018) * 1.4;
                const destX = p.targetX + wave * 0.7;
                const destY = p.targetY + wave * 0.7;

                // Spring attraction
                const dx = destX - p.x;
                const dy = destY - p.y;
                p.vx += dx * 0.032;
                p.vy += dy * 0.032;

                // Interactive mouse vortex swirl
                if (this.mouse.active) {
                    const mdx = p.x - this.mouse.x;
                    const mdy = p.y - this.mouse.y;
                    const mDist = Math.hypot(mdx, mdy);
                    if (mDist < 85) {
                        const force = (1 - mDist / 85) * 3.6;
                        const angle = Math.atan2(mdy, mdx) + 0.6;
                        p.vx += Math.cos(angle) * force;
                        p.vy += Math.sin(angle) * force;
                    }
                }

                p.vx *= 0.86;
                p.vy *= 0.86;
                p.x += p.vx;
                p.y += p.vy;

                // Twinkle luminance & sizing
                p.twinklePhase += p.twinkleSpeed;
                const currentAlpha = Math.max(0.18, p.alpha * (0.65 + Math.sin(p.twinklePhase) * 0.35));
                const currentSize = p.baseSize * (0.85 + Math.sin(p.twinklePhase) * 0.25);

                ctx.fillStyle = p.color;
                ctx.globalAlpha = currentAlpha;
                ctx.beginPath();
                ctx.arc(p.x, p.y, currentSize, 0, Math.PI * 2);
                ctx.fill();

                // Diamond star sparkle glint on select particles
                if (p.isSparkle && currentAlpha > 0.78) {
                    ctx.strokeStyle = `rgba(251, 242, 222, ${currentAlpha * 0.85})`;
                    ctx.lineWidth = 0.6;
                    ctx.beginPath();
                    ctx.moveTo(p.x - 3.2, p.y); ctx.lineTo(p.x + 3.2, p.y);
                    ctx.moveTo(p.x, p.y - 3.2); ctx.lineTo(p.x, p.y + 3.2);
                    ctx.stroke();
                }
            }

            ctx.restore();

            if (this.isVisible) {
                this.rafId = requestAnimationFrame(() => this.render());
            }
        }
    }

    function initTimelineMagicDust() {
        const canvases = document.querySelectorAll('.timeline-dust-canvas, .timeline-pointcloud-canvas');
        canvases.forEach(canvas => new TimelineMagicDustCanvas(canvas));
    }
    const initTimelinePointClouds = initTimelineMagicDust;

    // 7E. KEYBOARD COMMAND HUD CONTROLLER
    function initCommandHUD() {
        const hud = document.getElementById('command-hud');
        const overlay = document.getElementById('command-hud-overlay');
        const closeBtn = document.getElementById('hud-close');
        if (!hud || !overlay) return;

        let lastActiveTrigger = null;

        function openHUD() {
            lastActiveTrigger = document.activeElement;
            hud.classList.add('active', 'open');
            overlay.classList.add('active');
            hud.setAttribute('aria-hidden', 'false');
            overlay.setAttribute('aria-hidden', 'false');
            document.body.classList.add('modal-open');
            triggerHaptic(8);
            if (window.sovereignAudio) {
                window.sovereignAudio.playActivationTone();
            }
            setTimeout(() => {
                if (closeBtn) closeBtn.focus();
            }, 100);
        }

        function closeHUD() {
            hud.classList.remove('active', 'open');
            overlay.classList.remove('active');
            hud.setAttribute('aria-hidden', 'true');
            overlay.setAttribute('aria-hidden', 'true');
            document.body.classList.remove('modal-open');
            triggerHaptic(6);
            if (lastActiveTrigger && typeof lastActiveTrigger.focus === 'function') {
                lastActiveTrigger.focus();
            }
        }

        if (closeBtn) closeBtn.addEventListener('click', closeHUD);
        overlay.addEventListener('click', closeHUD);
        hud.addEventListener('click', (e) => {
            if (e.target === hud) closeHUD();
        });

        window.addEventListener('keydown', (e) => {
            if (e.target.matches('input, textarea, select')) return;

            if (e.key === '?' || (e.shiftKey && e.key === '/')) {
                e.preventDefault();
                if (hud.classList.contains('active')) {
                    closeHUD();
                } else {
                    openHUD();
                }
                return;
            }

            if (e.key === 'Escape') {
                if (hud.classList.contains('active')) {
                    e.preventDefault();
                    closeHUD();
                    return;
                }
            }

            const sectionMap = {
                '1': '#hero',
                '2': '#odyssey',
                '3': '#systems',
                '4': '#manifesto',
                '5': '#benchmarks',
                '6': '#contact'
            };

            if (sectionMap[e.key]) {
                const targetEl = document.querySelector(sectionMap[e.key]);
                if (targetEl) {
                    e.preventDefault();
                    if (hud.classList.contains('active')) closeHUD();
                    if (lenisInstance) {
                        lenisInstance.scrollTo(targetEl, { offset: -80, duration: 1.2 });
                    } else {
                        const targetY = targetEl.getBoundingClientRect().top + window.scrollY - 80;
                        window.scrollTo({ top: targetY, behavior: 'smooth' });
                    }
                    if (window.sovereignAudio) {
                        window.sovereignAudio.playHapticChime();
                    }
                }
            }

            if (e.key === 't' || e.key === 'T') {
                const surgeBtn = document.getElementById('btn-surge-test');
                if (surgeBtn && !surgeBtn.disabled) {
                    e.preventDefault();
                    if (hud.classList.contains('active')) closeHUD();
                    surgeBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    setTimeout(() => surgeBtn.click(), 400);
                }
            }
        });
    }

    // 8. SYSTEM ARCHITECTURE DEEP-DIVE DRAWER & DYNAMIC SVG BLUEPRINTS
    const systemData = {
        'virin-digital': {
            title: 'VIRIN DIGITAL STUDIO PLATFORM',
            category: 'AI WORKFLOWS & WEB PLATFORMS',
            badge: 'LIVE PRODUCTION',
            tagline: 'Autonomous AI agent workflows and bespoke digital platforms engineered for high-converting agencies and enterprise clients globally.',
            blueprintSvg: `
                <svg viewBox="0 0 540 180" class="blueprint-svg" aria-label="Virin Digital Architecture Schematic">
                    <defs>
                        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stop-color="#FBF2DE" />
                            <stop offset="100%" stop-color="#D4AF37" />
                        </linearGradient>
                    </defs>
                    <!-- Ingress Node -->
                    <rect x="20" y="65" width="115" height="50" rx="6" fill="#14141E" stroke="#E2C08D" stroke-width="1.2" />
                    <text x="77" y="90" fill="#FBF2DE" font-family="'JetBrains Mono', monospace" font-size="10" text-anchor="middle">CLIENT INGRESS</text>
                    <text x="77" y="103" fill="#34D399" font-family="'JetBrains Mono', monospace" font-size="8" text-anchor="middle">Edge Router</text>
                    <!-- Flow Line 1 -->
                    <line x1="135" y1="90" x2="200" y2="90" stroke="#E2C08D" stroke-width="1.5" stroke-dasharray="3 3" />
                    <!-- Workflow Core -->
                    <rect x="200" y="50" width="140" height="80" rx="8" fill="#1A1826" stroke="#D4AF37" stroke-width="1.5" />
                    <text x="270" y="82" fill="#D4AF37" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="bold" text-anchor="middle">AI PIPELINE CORE</text>
                    <text x="270" y="97" fill="#E2C08D" font-family="'JetBrains Mono', monospace" font-size="9" text-anchor="middle">Agentic Tool Loop</text>
                    <text x="270" y="112" fill="#888899" font-family="'JetBrains Mono', monospace" font-size="8" text-anchor="middle">Strict Token Budget</text>
                    <!-- Flow Lines to Workers -->
                    <path d="M 340 75 L 390 40" stroke="#E2C08D" stroke-width="1.2" />
                    <path d="M 340 90 L 390 90" stroke="#E2C08D" stroke-width="1.2" />
                    <path d="M 340 105 L 390 140" stroke="#E2C08D" stroke-width="1.2" />
                    <!-- Output Workers -->
                    <rect x="390" y="20" width="130" height="36" rx="4" fill="#12121A" stroke="#888899" stroke-width="1" />
                    <text x="455" y="42" fill="#E2C08D" font-family="'JetBrains Mono', monospace" font-size="9" text-anchor="middle">RESEARCH RUNNER</text>
                    <rect x="390" y="72" width="130" height="36" rx="4" fill="#12121A" stroke="#888899" stroke-width="1" />
                    <text x="455" y="94" fill="#E2C08D" font-family="'JetBrains Mono', monospace" font-size="9" text-anchor="middle">CODE SYNTHESIS</text>
                    <rect x="390" y="122" width="130" height="36" rx="4" fill="#12121A" stroke="#888899" stroke-width="1" />
                    <text x="455" y="144" fill="#E2C08D" font-family="'JetBrains Mono', monospace" font-size="9" text-anchor="middle">SSR / CDN CACHE</text>
                </svg>
            `,
            specs: [
                { label: 'Deployment', value: 'Edge CDN' },
                { label: 'Type Safety', value: '100% Strict' },
                { label: 'A11y Score', value: '100 / 100' },
                { label: 'Status', value: 'Live Production' }
            ],
            stack: ['Autonomous AI Agents', 'TypeScript', 'Next.js', 'Tailwind CSS', 'PostgreSQL', 'Vercel Edge'],
            architecture: 'Edge-first SSR architecture with isolated autonomous agent execution runners, token-budget governance, and webhook-driven event propagation.',
            highlights: [
                'Autonomous multi-step research and content generation pipelines',
                'Sub-150ms TTFB with global edge caching and CDN distribution',
                'Zero-compromise security posture and client data isolation'
            ]
        },
        'vinayak-tech': {
            title: 'ENTERPRISE AI & COMPUTE ECONOMICS MEDIA',
            category: 'TECHNICAL MEDIA & AI RESEARCH',
            badge: 'ACTIVE BROADCAST',
            tagline: 'Documenting frontier AI architectures, agent orchestration, and hardware compute economics for 15,000+ engineers globally.',
            blueprintSvg: `
                <svg viewBox="0 0 540 180" class="blueprint-svg" aria-label="Vinayak Tech Media Schematic">
                    <!-- Research Ingestion -->
                    <circle cx="70" cy="90" r="40" fill="#14141E" stroke="#E2C08D" stroke-width="1.5" />
                    <text x="70" y="86" fill="#FBF2DE" font-family="'JetBrains Mono', monospace" font-size="10" text-anchor="middle">ARXIV / CODE</text>
                    <text x="70" y="99" fill="#34D399" font-family="'JetBrains Mono', monospace" font-size="8" text-anchor="middle">Empirical Data</text>
                    <!-- Graphics Pipeline -->
                    <line x1="110" y1="90" x2="180" y2="90" stroke="#E2C08D" stroke-width="1.5" stroke-dasharray="3 3" />
                    <rect x="180" y="55" width="130" height="70" rx="6" fill="#1A1826" stroke="#D4AF37" stroke-width="1.2" />
                    <text x="245" y="85" fill="#D4AF37" font-family="'JetBrains Mono', monospace" font-size="10" font-weight="bold" text-anchor="middle">PROCEDURAL RUST</text>
                    <text x="245" y="100" fill="#E2C08D" font-family="'JetBrains Mono', monospace" font-size="8" text-anchor="middle">EffectCraft / Remotion</text>
                    <!-- Output Regions -->
                    <path d="M 310 75 L 370 45" stroke="#E2C08D" stroke-width="1.2" />
                    <path d="M 310 90 L 370 90" stroke="#E2C08D" stroke-width="1.2" />
                    <path d="M 310 105 L 370 135" stroke="#E2C08D" stroke-width="1.2" />
                    <rect x="370" y="25" width="150" height="35" rx="4" fill="#12121A" stroke="#888899" stroke-width="1" />
                    <text x="445" y="47" fill="#E2C08D" font-family="'JetBrains Mono', monospace" font-size="9" text-anchor="middle">4K 60FPS MASTER</text>
                    <rect x="370" y="73" width="150" height="35" rx="4" fill="#12121A" stroke="#888899" stroke-width="1" />
                    <text x="445" y="95" fill="#E2C08D" font-family="'JetBrains Mono', monospace" font-size="9" text-anchor="middle">EBU R128 AUDIO</text>
                    <rect x="370" y="120" width="150" height="35" rx="4" fill="#12121A" stroke="#888899" stroke-width="1" />
                    <text x="445" y="142" fill="#E2C08D" font-family="'JetBrains Mono', monospace" font-size="9" text-anchor="middle">GLOBAL BROADCAST</text>
                </svg>
            `,
            specs: [
                { label: 'Video Target', value: '4K UHD / 60 FPS' },
                { label: 'Audio Standard', value: 'EBU R128 (-14 LUFS)' },
                { label: 'Visual Pipeline', value: 'Procedural Code' },
                { label: 'Audience Reach', value: 'Global Engineers' }
            ],
            stack: ['Remotion', 'Rust / EffectCraft', 'Python Data Scripts', 'FFmpeg', 'DaVinci Resolve', 'WebAudio API'],
            architecture: 'Code-driven procedural motion graphics and data visualization pipeline translating complex neural architectures into intuitive visual models.',
            highlights: [
                'Automated SVG and code-to-video procedural animation pipelines',
                'Rigorous empirical benchmarking of LLM inference latency and token economics',
                'Broadcast-grade EBU R128 audio mastering and color grading'
            ]
        },
        'rotol-group': {
            title: 'KLCC HIGH-RISE OPERATIONS & SAFETY SUITE',
            category: 'SAFETY-CRITICAL SKYSCRAPER OPERATIONS',
            badge: '0 LOST-TIME INCIDENTS',
            tagline: 'High-access rope façade operations and HSE compliance protocols across Menara Maybank and landmark Kuala Lumpur skyscrapers.',
            blueprintSvg: `
                <svg viewBox="0 0 540 180" class="blueprint-svg" aria-label="Rotol Safety Operations Schematic">
                    <!-- Anchor Point -->
                    <rect x="20" y="65" width="115" height="50" rx="6" fill="#14141E" stroke="#E2C08D" stroke-width="1.2" />
                    <text x="77" y="90" fill="#FBF2DE" font-family="'JetBrains Mono', monospace" font-size="10" text-anchor="middle">RIGGING AUDIT</text>
                    <text x="77" y="103" fill="#34D399" font-family="'JetBrains Mono', monospace" font-size="8" text-anchor="middle">Dual-Rope Redundant</text>
                    <!-- HIRARC Gate -->
                    <line x1="135" y1="90" x2="200" y2="90" stroke="#E2C08D" stroke-width="1.5" stroke-dasharray="3 3" />
                    <rect x="200" y="50" width="140" height="80" rx="8" fill="#1A1826" stroke="#D4AF37" stroke-width="1.5" />
                    <text x="270" y="82" fill="#D4AF37" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="bold" text-anchor="middle">HIRARC PROTOCOL</text>
                    <text x="270" y="97" fill="#E2C08D" font-family="'JetBrains Mono', monospace" font-size="9" text-anchor="middle">Daily Pre-Rig Check</text>
                    <text x="270" y="112" fill="#888899" font-family="'JetBrains Mono', monospace" font-size="8" text-anchor="middle">Anemometer Wind Cutoff</text>
                    <!-- Operations Execution -->
                    <path d="M 340 75 L 400 50" stroke="#E2C08D" stroke-width="1.2" />
                    <path d="M 340 105 L 400 130" stroke="#E2C08D" stroke-width="1.2" />
                    <rect x="400" y="30" width="125" height="40" rx="4" fill="#12121A" stroke="#888899" stroke-width="1" />
                    <text x="462" y="55" fill="#E2C08D" font-family="'JetBrains Mono', monospace" font-size="9" text-anchor="middle">50+ STORY ASCENT</text>
                    <rect x="400" y="110" width="125" height="40" rx="4" fill="#12121A" stroke="#888899" stroke-width="1" />
                    <text x="462" y="135" fill="#E2C08D" font-family="'JetBrains Mono', monospace" font-size="9" text-anchor="middle">0 LTI AUDIT LOG</text>
                </svg>
            `,
            specs: [
                { label: 'Safety Record', value: '0 LTI (12+ Months)' },
                { label: 'Operational Height', value: '50+ Stories' },
                { label: 'Compliance Audit', value: '100% HIRARC' },
                { label: 'Regulatory Body', value: 'DOSH Malaysia' }
            ],
            stack: ['HIRARC Safety Frameworks', 'IRATA / High-Access Protocols', 'Method Statements', 'Risk Matrix Analysis', 'Emergency Rescue Systems'],
            architecture: 'Multi-tiered fail-safe operational hierarchy enforcing dual-point rope access redundancy, daily pre-rigging inspections, and real-time anemometer wind cutoffs.',
            highlights: [
                'Zero lost-time incidents across 12+ consecutive months of 50+ story commercial operations',
                'Comprehensive Method Statements and Risk Assessments approved by principal building managers',
                'Certified emergency aerial evacuation and self-rescue operational capability'
            ]
        },
        'wct-trx': {
            title: 'TUN RAZAK EXCHANGE (TRX) MULTIDISCIPLINARY QA/QC',
            category: '70-ACRE FINANCIAL DISTRICT MEGASTRUCTURE',
            badge: '100% AUDIT COMPLIANCE',
            tagline: 'Site engineering supervision, Non-Conformance Report (NCR) resolution, and structural QA/QC coordination across Malaysia’s $10B+ international financial landmark.',
            blueprintSvg: `
                <svg viewBox="0 0 540 180" class="blueprint-svg" aria-label="TRX Site QA/QC Schematic">
                    <!-- Blueprint Ingestion -->
                    <rect x="20" y="65" width="115" height="50" rx="6" fill="#14141E" stroke="#E2C08D" stroke-width="1.2" />
                    <text x="77" y="90" fill="#FBF2DE" font-family="'JetBrains Mono', monospace" font-size="10" text-anchor="middle">SITE BLUEPRINT</text>
                    <text x="77" y="103" fill="#34D399" font-family="'JetBrains Mono', monospace" font-size="8" text-anchor="middle">Structural Audit</text>
                    <!-- Inspection Gate -->
                    <line x1="135" y1="90" x2="200" y2="90" stroke="#E2C08D" stroke-width="1.5" stroke-dasharray="3 3" />
                    <rect x="200" y="50" width="140" height="80" rx="8" fill="#1A1826" stroke="#D4AF37" stroke-width="1.5" />
                    <text x="270" y="82" fill="#D4AF37" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="bold" text-anchor="middle">NCR ROOT CAUSE</text>
                    <text x="270" y="97" fill="#E2C08D" font-family="'JetBrains Mono', monospace" font-size="9" text-anchor="middle">Corrective Action</text>
                    <text x="270" y="112" fill="#888899" font-family="'JetBrains Mono', monospace" font-size="8" text-anchor="middle">Subcontractor Matrix</text>
                    <!-- Closeout -->
                    <path d="M 340 75 L 400 50" stroke="#E2C08D" stroke-width="1.2" />
                    <path d="M 340 105 L 400 130" stroke="#E2C08D" stroke-width="1.2" />
                    <rect x="400" y="30" width="125" height="40" rx="4" fill="#12121A" stroke="#888899" stroke-width="1" />
                    <text x="462" y="55" fill="#E2C08D" font-family="'JetBrains Mono', monospace" font-size="9" text-anchor="middle">CONSULTANT SIGN</text>
                    <rect x="400" y="110" width="125" height="40" rx="4" fill="#12121A" stroke="#888899" stroke-width="1" />
                    <text x="462" y="135" fill="#E2C08D" font-family="'JetBrains Mono', monospace" font-size="9" text-anchor="middle">100% NCR CLOSED</text>
                </svg>
            `,
            specs: [
                { label: 'District Footprint', value: '70 Acres ($10B+)' },
                { label: 'NCR Resolution', value: '100% Closed' },
                { label: 'Inspection Protocol', value: 'Strict Factor-of-Safety' },
                { label: 'Contractor Matrix', value: 'Multidisciplinary' }
            ],
            stack: ['AutoCAD', 'Structural QA/QC Matrices', 'Root-Cause NCR Protocol', 'Tolerance Metrology', 'BIM Coordination'],
            architecture: 'Rigorous root-cause engineering workflow: inspection → non-conformance flag → corrective containment → consultant verification → formal closeout.',
            highlights: [
                'Coordinated multidisciplinary subcontractor teams under extreme zero-tolerance physical constraints',
                'Eliminated defect cascades by catching structural tolerance drift prior to irreversible pour stages',
                'Maintained pristine audit compliance trails recognized by international master developers'
            ]
        }
    };

    // Backward-compatible aliases
    systemData['swarm-ai'] = systemData['virin-digital'];
    systemData['edge-core'] = systemData['rotol-group'];
    systemData['luxury-craft'] = systemData['vinayak-tech'];
    systemData['event-engine'] = systemData['wct-trx'];

    function initSystemDrawer() {
        const drawer = document.getElementById('system-drawer');
        const overlay = document.getElementById('drawer-overlay');
        const closeBtn = document.getElementById('drawer-close');
        if (!drawer || !overlay) return;

        let lastActiveTrigger = null;

        function openDrawer(systemKey, triggerEl) {
            lastActiveTrigger = triggerEl || document.activeElement;
            const data = systemData[systemKey];
            if (!data) return;

            document.getElementById('drawer-title').textContent = data.title;
            document.getElementById('drawer-category').textContent = data.category;
            document.getElementById('drawer-badge').textContent = data.badge;
            document.getElementById('drawer-tagline').textContent = data.tagline;
            document.getElementById('drawer-architecture').textContent = data.architecture;

            // Blueprint Schematic SVG Injection
            const blueprintContainer = document.getElementById('drawer-blueprint');
            if (blueprintContainer) {
                blueprintContainer.innerHTML = data.blueprintSvg || '';
            }

            // Specs
            const specsContainer = document.getElementById('drawer-specs');
            if (specsContainer) {
                specsContainer.innerHTML = data.specs.map(s => `
                    <div class="drawer-spec-card">
                        <span class="spec-label">${s.label}</span>
                        <span class="spec-val">${s.value}</span>
                    </div>
                `).join('');
            }

            // Tech stack tags
            const stackContainer = document.getElementById('drawer-stack');
            if (stackContainer) {
                stackContainer.innerHTML = data.stack.map(tag => `
                    <span class="tech-tag">${tag}</span>
                `).join('');
            }

            // Highlights
            const highlightsContainer = document.getElementById('drawer-highlights');
            if (highlightsContainer) {
                highlightsContainer.innerHTML = data.highlights.map(h => `
                    <li><span class="bullet-gold">✦</span> ${h}</li>
                `).join('');
            }

            drawer.classList.add('open');
            overlay.classList.add('active');
            document.body.classList.add('modal-open');
            drawer.setAttribute('aria-hidden', 'false');

            // Reset simulation toolbar state
            if (sandboxIndicator) {
                sandboxIndicator.classList.remove('simulating');
                sandboxIndicator.style.background = '#34D399';
            }
            if (sandboxStateText) {
                sandboxStateText.textContent = 'STATUS: TOPOLOGY NOMINAL';
                sandboxStateText.style.color = 'var(--text-primary)';
            }
            if (simBtn) {
                simBtn.disabled = false;
                simBtn.innerHTML = `<span>SIMULATE RE-ROUTING</span><span class="glyph">⚡</span>`;
                isSimulating = false;
            }
            triggerHaptic(10);

            // Shift focus into modal
            setTimeout(() => {
                if (closeBtn) closeBtn.focus();
            }, 100);
        }

        function closeDrawer() {
            drawer.classList.remove('open');
            overlay.classList.remove('active');
            document.body.classList.remove('modal-open');
            drawer.setAttribute('aria-hidden', 'true');
            triggerHaptic(6);

            // Return focus to trigger element
            if (lastActiveTrigger && typeof lastActiveTrigger.focus === 'function') {
                lastActiveTrigger.focus();
            }
        }

        // Live Architectural Simulation Sandbox Controller
        const simBtn = document.getElementById('btn-drawer-simulate');
        const sandboxIndicator = document.getElementById('sandbox-indicator');
        const sandboxStateText = document.getElementById('sandbox-state-text');
        let isSimulating = false;

        if (simBtn) {
            simBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (isSimulating) return;
                isSimulating = true;
                simBtn.disabled = true;
                simBtn.innerHTML = `<span>SIMULATING FAILOVER...</span><span class="glyph">⚡</span>`;

                triggerHaptic(18);
                if (window.sovereignAudio) {
                    window.sovereignAudio.playSurgeSweep();
                }

                if (sandboxIndicator) sandboxIndicator.classList.add('simulating');
                if (sandboxStateText) {
                    sandboxStateText.textContent = 'FAULT INJECTED // REROUTING IN PROGRESS...';
                    sandboxStateText.style.color = '#E2C08D';
                }

                const blueprintSvg = document.getElementById('drawer-blueprint');
                if (blueprintSvg) {
                    blueprintSvg.querySelectorAll('line, path, rect, circle').forEach((el, idx) => {
                        if (idx % 2 === 0) el.classList.add('sim-active');
                    });
                }

                setTimeout(() => {
                    if (sandboxIndicator) {
                        sandboxIndicator.classList.remove('simulating');
                        sandboxIndicator.style.background = '#34D399';
                    }
                    if (sandboxStateText) {
                        sandboxStateText.textContent = 'FAILOVER RECOVERED // P99: 4.8ms (0 LOSS)';
                        sandboxStateText.style.color = '#34D399';
                    }
                    if (blueprintSvg) {
                        blueprintSvg.querySelectorAll('.sim-active').forEach(el => el.classList.remove('sim-active'));
                    }
                    if (window.sovereignAudio) {
                        window.sovereignAudio.playHapticChime();
                    }
                    triggerHaptic(12);

                    setTimeout(() => {
                        simBtn.disabled = false;
                        simBtn.innerHTML = `<span>SIMULATE RE-ROUTING</span><span class="glyph">⚡</span>`;
                        isSimulating = false;
                    }, 1200);
                }, 2200);
            });
        }

        // Concurrency Load Slider Controller
        const loadSlider = document.getElementById('drawer-load-slider');
        const loadVal = document.getElementById('drawer-load-val');

        if (loadSlider && loadVal) {
            loadSlider.addEventListener('input', () => {
                const reqs = parseInt(loadSlider.value, 10);
                const displayReq = reqs >= 1000 ? '1.0M REQ/S' : `${reqs}K REQ/S`;
                loadVal.textContent = displayReq;
                const estLatency = (3.8 + (reqs / 1000) * 2.8).toFixed(1);
                if (sandboxStateText && !isSimulating) {
                    sandboxStateText.textContent = `LOAD: ${displayReq} // EST. P99: ${estLatency}ms`;
                }
                triggerHaptic(4);
            });
        }

        // Modal focus trap for WCAG 2.1 compliance
        drawer.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                const focusables = drawer.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
                if (!focusables.length) return;
                const first = focusables[0];
                const last = focusables[focusables.length - 1];

                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        });

        document.querySelectorAll('.open-system-drawer').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const key = btn.getAttribute('data-system');
                openDrawer(key, btn);
            });
        });

        if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
        if (overlay) overlay.addEventListener('click', closeDrawer);

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && drawer.classList.contains('open')) {
                closeDrawer();
            }
        });
    }

    // 9. INTERACTIVE ARCHITECTURE BENCHMARK SIMULATOR
    function initBenchmarkSimulator() {
        const surgeBtn = document.getElementById('btn-surge-test');
        const nodeSelect = document.getElementById('node-select');
        const valReq = document.getElementById('telemetry-req');
        const valLat = document.getElementById('telemetry-lat');
        const valErr = document.getElementById('telemetry-err');
        const valNodes = document.getElementById('telemetry-nodes');
        const logBox = document.getElementById('benchmark-log');

        if (!surgeBtn || !valReq) return;

        let isTesting = false;

        const nodeLatencies = {
            'tokyo': { base: 6.2, surge: 7.1 },
            'frankfurt': { base: 8.4, surge: 9.3 },
            'sf': { base: 5.1, surge: 5.9 },
            'singapore': { base: 4.8, surge: 5.4 }
        };

        function addLog(text, isGold = false) {
            if (!logBox) return;
            const time = new Date().toISOString().substring(11, 19);
            const line = document.createElement('div');
            line.className = isGold ? 'log-line gold' : 'log-line';
            line.innerHTML = `<span class="log-time">[${time}]</span> ${text}`;
            logBox.appendChild(line);
            logBox.scrollTop = logBox.scrollHeight;
        }

        surgeBtn.addEventListener('click', () => {
            if (isTesting) return;
            isTesting = true;
            surgeBtn.disabled = true;
            surgeBtn.textContent = 'SIMULATION RUNNING...';
            triggerHaptic(20);

            if (nodeGraphInstance) {
                nodeGraphInstance.triggerSurge();
            }
            if (window.oscilloscopeInstance) {
                window.oscilloscopeInstance.triggerSurge();
            }
            if (window.sovereignAudio) {
                window.sovereignAudio.playSurgeSweep();
            }

            const node = nodeSelect ? nodeSelect.value : 'sf';
            const nodeData = nodeLatencies[node] || { base: 5.8, surge: 6.5 };

            addLog(`Initiating synthetic stress test against global edge cluster...`);
            addLog(`Target node: [${node.toUpperCase()}] // Initializing 50,000 synthetic workers...`);

            let step = 0;
            const interval = setInterval(() => {
                step++;
                if (step === 1) {
                    valReq.textContent = '380,450 /s';
                    valLat.textContent = `${(nodeData.base + 0.3).toFixed(1)} ms`;
                    valErr.textContent = '0.000%';
                    valNodes.textContent = '32 / 32 ACTIVE';
                    addLog(`Ingesting 380k msg/sec. Lock-free queues operating nominal.`);
                } else if (step === 2) {
                    valReq.textContent = '920,800 /s';
                    valLat.textContent = `${(nodeData.surge).toFixed(1)} ms`;
                    addLog(`Peak ingestion: 920k msg/sec. Consensus verified with zero packet drops.`, true);
                } else if (step === 3) {
                    valReq.textContent = '1,420,000 /s';
                    valLat.textContent = `${(nodeData.surge + 0.4).toFixed(1)} ms`;
                    valErr.textContent = '0.000%';
                    addLog(`Sovereign auto-scaler spawned 128 micro-instances in 42ms. Zero degradation.`, true);
                } else if (step === 4) {
                    clearInterval(interval);
                    valReq.textContent = '1,420,000 /s';
                    addLog(`Test concluded: 1.42M events/sec processed. SLA 100.000% intact.`, true);
                    surgeBtn.disabled = false;
                    surgeBtn.textContent = 'RUN PEAK SURGE SIMULATION';
                    isTesting = false;
                }
            }, 600);
        });

        if (nodeSelect) {
            nodeSelect.addEventListener('change', () => {
                const node = nodeSelect.value;
                const nodeData = nodeLatencies[node] || { base: 6.0 };
                valLat.textContent = `${nodeData.base.toFixed(1)} ms`;
                addLog(`Switched diagnostic target to [${node.toUpperCase()}]. Handshake roundtrip: ${nodeData.base}ms.`);
                if (window.sovereignAudio) {
                    window.sovereignAudio.playNodePing();
                }
                if (nodeGraphInstance) {
                    nodeGraphInstance.selectNodeById(node);
                }
            });
        }
    }

    // 10. LIVE UTC & IST WORLD CLOCK
    function initWorldClock() {
        const clockEl = document.getElementById('world-clock');
        if (!clockEl) return;

        function updateTime() {
            const now = new Date();
            const options = {
                timeZone: 'Asia/Kuala_Lumpur',
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            };
            const mytTime = now.toLocaleTimeString('en-US', options);
            clockEl.textContent = `KUALA LUMPUR // ${mytTime} MYT (UTC+8)`;
        }

        updateTime();
        setInterval(updateTime, 1000);
    }

    // 11. HEADLESS CRYPTOGRAPHIC FORM ENGINE & TRANSMISSION RECEIPT HUD
    function initContactForm() {
        const form = document.getElementById('executive-form');
        const feedback = document.getElementById('form-feedback');
        const receiptHud = document.getElementById('form-receipt-hud');
        const receiptHashVal = document.getElementById('receipt-hash-val');
        const btnReceiptWa = document.getElementById('btn-receipt-wa');
        const btnReceiptReset = document.getElementById('btn-receipt-reset');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = form.querySelector('[name="name"]').value.trim();
            const email = form.querySelector('[name="email"]').value.trim();
            const org = form.querySelector('[name="organization"]').value.trim();
            const scope = form.querySelector('[name="scope"]').value.trim();
            const message = form.querySelector('[name="message"]').value.trim();

            if (!name || !email || !message) {
                if (feedback) {
                    feedback.className = 'form-feedback error';
                    feedback.textContent = 'Please fill out all required credentials.';
                }
                triggerHaptic(40);
                return;
            }

            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'ENCRYPTING & DISPATCHING TO GMAIL...';
            }

            if (feedback) {
                feedback.className = 'form-feedback';
                feedback.textContent = '';
            }

            triggerHaptic([30, 40, 60]);
            if (window.sovereignAudio) {
                window.sovereignAudio.playSurgeSweep();
            }

            // Generate sovereign cryptographic transmission receipt hash
            let hashHex = '0x';
            if (window.crypto && window.crypto.getRandomValues) {
                const array = new Uint8Array(16);
                window.crypto.getRandomValues(array);
                hashHex += Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
            } else {
                hashHex += Math.random().toString(16).substring(2, 10) + Math.random().toString(16).substring(2, 10) + Math.random().toString(16).substring(2, 10);
            }

            try {
                // Dispatch payload directly to Vinayak Bhardwaj via Web3Forms API
                const response = await fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        access_key: 'c9277eab-0b48-461a-b03f-dc7143732e24',
                        subject: `[Executive Brief] ${name} (${org || 'Executive Peer'}) — ${scope}`,
                        from_name: name,
                        email: email,
                        organization: org || 'Individual / Private Peer',
                        scope: scope,
                        message: message,
                        receipt_hash: hashHex,
                        timestamp: new Date().toUTCString(),
                        source: 'https://vinayakbhardwaj.com/'
                    })
                });

                const result = await response.json();

                if (response.status === 200 && result.success) {
                    // Update Receipt HUD
                    if (receiptHashVal) {
                        receiptHashVal.textContent = `HASH: ${hashHex.toUpperCase()}`;
                    }

                    if (btnReceiptWa) {
                        const waText = encodeURIComponent(
                            `Hello Vinayak, I have transmitted an executive brief [Hash: ${hashHex}] for "${scope}" from ${org || 'Executive Peer'} (${name}). Reaching out via direct channel.`
                        );
                        btnReceiptWa.href = `https://wa.me/60182302045?text=${waText}`;
                    }

                    // Smooth transition from form to receipt HUD
                    form.style.display = 'none';
                    if (receiptHud) {
                        receiptHud.style.display = 'block';
                    }

                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.textContent = 'TRANSMIT ENGAGEMENT BRIEF';
                    }

                    triggerHaptic([50, 70, 90]);
                    if (window.sovereignAudio) {
                        window.sovereignAudio.playNodePing();
                    }
                } else {
                    throw new Error(result.message || 'Transmission failed');
                }
            } catch (err) {
                console.error('[Transmission Ingress Error]:', err);
                if (feedback) {
                    feedback.className = 'form-feedback error';
                    feedback.textContent = 'Network or ingress delivery error. Please use direct WhatsApp (+60 18-230 2045) or email bhardwajvinayak1947@gmail.com.';
                }
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'RETRY TRANSMISSION';
                }
                triggerHaptic([60, 40]);
            }
        });

        // Reset / Transmit Another Brief
        if (btnReceiptReset) {
            btnReceiptReset.addEventListener('click', () => {
                if (receiptHud) {
                    receiptHud.style.display = 'none';
                }
                form.style.display = 'block';
                form.reset();
                if (feedback) {
                    feedback.textContent = '';
                    feedback.className = 'form-feedback';
                }
                triggerHaptic(15);
            });
        }

        // Copy Brief directly to clipboard fallback
        const copyBriefBtn = document.getElementById('btn-copy-brief');
        if (copyBriefBtn) {
            copyBriefBtn.addEventListener('click', () => {
                const name = form.querySelector('[name="name"]').value.trim() || 'Executive Peer';
                const email = form.querySelector('[name="email"]').value.trim() || 'Unspecified';
                const org = form.querySelector('[name="organization"]').value.trim() || 'Private Venture';
                const scope = form.querySelector('[name="scope"]').value.trim() || 'Systems Architecture';
                const message = form.querySelector('[name="message"]').value.trim() || 'No message provided.';

                const briefText = 
`======================================================
VINAYAK BHARDWAJ // SOVEREIGN ENGAGEMENT BRIEF
======================================================
Date / Time:     ${new Date().toUTCString()}
Client / Name:   ${name}
Corporate Email: ${email}
Organization:    ${org}
Scope Focus:     ${scope}

PROJECT BRIEF & OBJECTIVES:
${message}
------------------------------------------------------
Direct Transmission: bhardwajvinayak1947@gmail.com
Official Portal:     https://vinayakbhardwaj.com
======================================================`;

                navigator.clipboard.writeText(briefText).then(() => {
                    const originalText = copyBriefBtn.textContent;
                    copyBriefBtn.textContent = 'BRIEF COPIED TO CLIPBOARD ✓';
                    if (feedback) {
                        feedback.className = 'form-feedback success';
                        feedback.textContent = 'Structured brief copied to clipboard. Ready to paste directly into your email or terminal.';
                    }
                    setTimeout(() => {
                        copyBriefBtn.textContent = originalText;
                    }, 2500);
                }).catch(() => {
                    if (feedback) {
                        feedback.className = 'form-feedback error';
                        feedback.textContent = 'Clipboard access restricted by browser permissions.';
                    }
                });
            });
        }
    }

    // 12. MOBILE NAVIGATION OVERLAY CONTROLLER
    function initMobileMenu() {
        const toggleBtn = document.getElementById('mobile-menu-toggle');
        const overlay = document.getElementById('mobile-menu-overlay');
        const closeBtn = document.getElementById('mobile-menu-close');
        const navLinks = document.querySelectorAll('.mobile-nav-item, #mobile-cta-link');

        if (!toggleBtn || !overlay) return;

        function openMenu() {
            toggleBtn.classList.add('active');
            overlay.classList.add('active');
            toggleBtn.setAttribute('aria-expanded', 'true');
            overlay.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
            triggerHaptic(10);

            if (closeBtn) {
                setTimeout(() => closeBtn.focus(), 150);
            }
        }

        function closeMenu() {
            toggleBtn.classList.remove('active');
            overlay.classList.remove('active');
            toggleBtn.setAttribute('aria-expanded', 'false');
            overlay.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
            triggerHaptic(6);
            toggleBtn.focus();
        }

        toggleBtn.addEventListener('click', () => {
            if (overlay.classList.contains('active')) {
                closeMenu();
            } else {
                openMenu();
            }
        });

        if (closeBtn) closeBtn.addEventListener('click', closeMenu);

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                closeMenu();
            });
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && overlay.classList.contains('active')) {
                closeMenu();
            }
        });
    }

    // 13. COPY TO CLIPBOARD QUICK ACTION
    function initQuickCopy() {
        document.querySelectorAll('.copy-trigger').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const text = btn.getAttribute('data-copy') || 'bhardwajvinayak1947@gmail.com';
                navigator.clipboard.writeText(text).then(() => {
                    const originalText = btn.textContent;
                    btn.textContent = 'COPIED TO CLIPBOARD ✓';
                    setTimeout(() => {
                        btn.textContent = originalText;
                    }, 2000);
                });
            });
        });
    }

    // INITIALIZATION DISPATCHER
    document.addEventListener('DOMContentLoaded', () => {
        initLenis();
        initMagneticCursor();
        initMobileMenu();
        initScrollProgressRail();
        initTiltCards();
        initScrollReveals();
        initStatCounters();
        initNodeGraph();
        initOscilloscope();
        initPortraitParallax();
        initChronologyScrubber();
        initTimelineMagicDust();
        initCommandHUD();
        initSystemDrawer();
        initBenchmarkSimulator();
        initWorldClock();
        initContactForm();
        initQuickCopy();

        // 13. DEVELOPER CONSOLE SIGNATURE & EASTER EGG (JURY AUDIT HOOK)
        console.log(
            `%c ❖ VINAYAK BHARDWAJ // SYSTEMS ARCHITECT & EXECUTIVE AI ADVISOR %c\n` +
            `  ─────────────────────────────────────────────────────────────────\n` +
            `  • Base Terminal:   Kuala Lumpur, Malaysia (MYT / UTC+8)\n` +
            `  • Architecture:    Zero-Tolerance Distributed Core // Lock-Free Memory\n` +
            `  • Magical Stardust: 6x Borderless Gold Silhouette Formations Initialized (60-120 FPS)\n` +
            `  • Diagnostics:     Type %csurge()%c in this console to run peak edge stress test.\n` +
            `  ─────────────────────────────────────────────────────────────────`,
            'background: #070709; color: #E2C08D; font-size: 13px; font-weight: bold; padding: 6px 12px; border-left: 3px solid #E2C08D; font-family: monospace;',
            'color: #9C9B95; font-family: monospace; font-size: 11px;',
            'color: #FBF2DE; font-weight: bold; font-family: monospace;',
            'color: #9C9B95; font-family: monospace; font-size: 11px;'
        );

        window.surge = () => {
            const btn = document.getElementById('btn-surge-test');
            if (btn) {
                btn.click();
                return '⚡ [SOVEREIGN EDGE] Peak stress simulation triggered across 32 global nodes.';
            }
            return 'Diagnostics panel not found.';
        };
    });

})();
