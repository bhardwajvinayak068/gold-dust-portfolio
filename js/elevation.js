/* Click-to-load YouTube: the thumbnail is the placeholder, the iframe only loads on play. */
(function () {
    'use strict';

    document.querySelectorAll('.ev-video-btn[data-yt]').forEach((btn) => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.yt;
            const title = btn.getAttribute('aria-label').replace(/^Play: /, '');
            const frame = document.createElement('iframe');
            frame.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
            frame.title = title;
            frame.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
            frame.allowFullscreen = true;
            frame.referrerPolicy = 'strict-origin-when-cross-origin';
            btn.replaceWith(frame);
            frame.focus();
        });
    });
})();

/* Signature moment: the two method loops close step by step as the section scrolls past,
   the way an NCR is closed on site. Reduced motion shows both loops already closed. */
(function () {
    'use strict';

    const group = document.querySelector('.ev-loops');
    if (!group) return;
    const loops = [...group.querySelectorAll('.ev-loop')];
    const steps = loops.map((loop) => [...loop.querySelectorAll('li')]);
    const total = steps[0].length;

    function render(closed) {
        steps.forEach((list) => list.forEach((li, i) => li.classList.toggle('is-closed', i < closed)));
        group.classList.toggle('is-complete', closed >= total);
    }

    group.classList.add('is-live');

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        render(total);
        return;
    }

    let last = 0;
    function update() {
        const rect = group.getBoundingClientRect();
        const vh = window.innerHeight;
        // 0 when the diagram's top reaches 85% of the screen, 1 when its bottom reaches 55%
        const start = vh * 0.85;
        const end = vh * 0.55 - rect.height;
        const progress = Math.min(1, Math.max(0, (start - rect.top) / (start - end)));
        render(Math.round(progress * total));
    }

    // Cheap read of one rect; throttled by time rather than rAF so it also runs in throttled tabs
    window.addEventListener('scroll', () => {
        const now = performance.now();
        if (now - last > 50) { last = now; update(); }
    }, { passive: true });
    window.addEventListener('scrollend', update, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    update();
})();
