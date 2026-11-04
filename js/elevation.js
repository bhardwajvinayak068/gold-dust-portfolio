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

/* Signature moment: the build loop. On wide, tall-enough screens the loops pin to the screen
   and a scan line sweeps across them as you scroll: brief, build, check (flagged until it
   passes), ship, then each track is stamped. Narrow screens close the steps as the diagram
   scrolls past; reduced motion shows every loop already closed. */
(function () {
    'use strict';

    const group = document.querySelector('.ev-loops');
    if (!group) return;
    const inspect = group.closest('.ev-inspect');
    const loops = [...group.querySelectorAll('.ev-loop')];
    const steps = loops.map((loop) => [...loop.querySelectorAll('li')]);
    // Readout names: one shared set of step names (data-steps) or each loop's own labels joined
    const shared = group.dataset.steps ? group.dataset.steps.split('|') : null;
    const names = steps.map((list) => list.map((li) => li.querySelector('span').textContent));
    const doneLabel = group.dataset.done || 'NCR closed · Run signed off';
    const total = steps[0].length;
    const readStep = document.querySelector('.ev-readout-step');
    const readLabel = document.querySelector('.ev-readout-label');
    const wide = window.matchMedia('(min-width: 900px) and (min-height: 760px)');
    let shown = -1;

    function render(closed, complete) {
        const state = closed + (complete ? 10 : 0);
        if (state === shown) return;
        shown = state;
        steps.forEach((list) => list.forEach((li, i) => li.classList.toggle('is-closed', i < closed)));
        if (complete && !group.classList.contains('is-complete') && window.siteSound) window.siteSound.play('stamp');
        group.classList.toggle('is-complete', complete);
        if (!readStep) return;
        if (closed === 0) {
            readStep.textContent = 'The loop';
            readLabel.textContent = `Scroll to run all ${loops.length}`;
        } else if (complete) {
            readStep.textContent = 'Done';
            readLabel.textContent = doneLabel;
        } else {
            readStep.textContent = `Step ${closed} of ${total}`;
            readLabel.textContent = shared ? shared[closed - 1] : names.map((list) => list[closed - 1]).join(' · ');
        }
    }

    group.classList.add('is-live');

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        render(total, true);
        group.style.setProperty('--p', 1);
        return;
    }

    let lastProgress = -1;
    function update() {
        const vh = window.innerHeight;
        // Asleep while the loop is more than a screen away: no layout reads on the rest of the page
        const near = (inspect || group).getBoundingClientRect();
        if (near.bottom < -vh || near.top > vh * 2) return;
        const pinned = wide.matches && inspect;
        if (inspect) inspect.classList.toggle('is-scrub', Boolean(pinned));
        let progress;
        if (pinned) {
            // 0 when the stage pins, 1 just before it releases
            const rect = inspect.getBoundingClientRect();
            progress = -rect.top / Math.max(1, rect.height - vh);
        } else {
            // 0 when the diagram's top reaches 85% of the screen, 1 when its bottom reaches 55%
            const rect = group.getBoundingClientRect();
            const start = vh * 0.85;
            const end = vh * 0.55 - rect.height;
            progress = (start - rect.top) / (start - end);
        }
        progress = Math.min(1, Math.max(0, progress));
        if (Math.abs(progress - lastProgress) < 0.0005) return;
        lastProgress = progress;
        group.style.setProperty('--p', progress.toFixed(4));
        if (pinned) {
            // A step closes as the scan line reaches its node; the stamp waits for the end of the sheet
            const closed = progress < 0.01 ? 0 : Math.min(total, Math.floor(progress * total) + 1);
            render(closed, progress >= 0.96);
        } else {
            const closed = Math.round(progress * total);
            render(closed, closed >= total);
        }
    }
    wide.addEventListener('change', update);

    // At most one rect read per frame, inside the frame
    let queued = false;
    window.addEventListener('scroll', () => {
        if (queued) return;
        queued = true;
        requestAnimationFrame(() => { queued = false; update(); });
    }, { passive: true });
    window.addEventListener('scrollend', update, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    update();
})();
