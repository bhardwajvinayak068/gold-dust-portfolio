/* 12 Taneh, playable: the board graph and Classic Flow rules ported from the game's engine
   (src/engine/graph.ts, rules.ts), with a beginner opponent that searches two moves ahead
   using the engine's position weights. Boots only when the board scrolls near the screen. */
(function () {
    'use strict';

    const root = document.querySelector('[data-taneh]');
    if (!root) return;

    const YOU = 'P2';
    const BOT = 'P1';
    const DRAW_HALF_MOVES = 30;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ---- Board graph: 25 points, orthogonal lines everywhere, diagonals where (row + col) is even
    const ADJ = Array.from({ length: 25 }, () => []);
    const LINES = [];
    const idx = (r, c) => r * 5 + c;
    const link = (u, v) => {
        ADJ[u].push(v);
        ADJ[v].push(u);
        LINES.push([u, v]);
    };
    for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
            const u = idx(r, c);
            if (c < 4) link(u, idx(r, c + 1));
            if (r < 4) link(u, idx(r + 1, c));
            if ((r + c) % 2 === 0) {
                if (r < 4 && c < 4) link(u, idx(r + 1, c + 1));
                if (r < 4 && c > 0) link(u, idx(r + 1, c - 1));
            }
        }
    }
    // A jump goes over a neighbour and lands on the next point along the same line
    const JUMPS = ADJ.map((neighbours, u) => neighbours.flatMap((mid) => {
        const r = Math.floor(mid / 5) * 2 - Math.floor(u / 5);
        const c = (mid % 5) * 2 - (u % 5);
        if (r < 0 || r > 4 || c < 0 || c > 4) return [];
        const to = idx(r, c);
        return ADJ[mid].includes(to) ? [{ over: mid, to }] : [];
    }));

    const START = [
        BOT, BOT, BOT, BOT, BOT,
        BOT, BOT, BOT, BOT, BOT,
        BOT, BOT, null, YOU, YOU,
        YOU, YOU, YOU, YOU, YOU,
        YOU, YOU, YOU, YOU, YOU,
    ];
    const WEIGHTS = [2, 1, 3, 1, 2, 1, 5, 3, 5, 1, 3, 4, 8, 4, 3, 1, 5, 3, 5, 1, 2, 1, 3, 1, 2];
    const other = (p) => (p === YOU ? BOT : YOU);

    // ---- Rules (Classic Flow): capturing is optional and a chain may stop after any jump
    function movesFor(board, player) {
        const moves = [];
        for (let i = 0; i < 25; i++) {
            if (board[i] !== player) continue;
            for (const n of ADJ[i]) {
                if (board[n] === null) moves.push({ from: i, to: n, path: [i, n], captured: [] });
            }
            const explore = (at, path, captured, b) => {
                for (const j of JUMPS[at]) {
                    if (b[j.over] === other(player) && b[j.to] === null && !path.includes(j.to)) {
                        const next = b.slice();
                        next[at] = null;
                        next[j.over] = null;
                        next[j.to] = player;
                        const move = { from: i, to: j.to, path: [...path, j.to], captured: [...captured, j.over] };
                        moves.push(move);
                        explore(j.to, move.path, move.captured, next);
                    }
                }
            };
            explore(i, [i], [], board);
        }
        return moves;
    }

    function apply(board, move, player) {
        const next = board.slice();
        next[move.from] = null;
        next[move.to] = player;
        move.captured.forEach((c) => { next[c] = null; });
        return next;
    }

    // ---- Beginner opponent: two-ply negamax with alpha-beta, captures searched a little further
    function evaluate(board, player) {
        let score = 0;
        for (let i = 0; i < 25; i++) {
            if (!board[i]) continue;
            let value = 100 + WEIGHTS[i];
            for (const n of ADJ[i]) if (board[n] === null) value += 2;
            score += board[i] === player ? value : -value;
        }
        return score;
    }

    function negamax(board, player, depth, alpha, beta, extra) {
        const moves = movesFor(board, player);
        if (!moves.length) return -100000;
        const captures = moves.filter((m) => m.captured.length);
        if (depth <= 0 && (!captures.length || extra <= 0)) return evaluate(board, player);
        const pool = depth <= 0 ? captures : moves;
        let best = -Infinity;
        for (const m of pool) {
            const score = -negamax(apply(board, m, player), other(player), depth - 1, -beta, -alpha, depth <= 0 ? extra - 1 : extra);
            if (score > best) best = score;
            if (best > alpha) alpha = best;
            if (alpha >= beta) break;
        }
        return best;
    }

    function botMove(board) {
        const moves = movesFor(board, BOT);
        const scored = moves.map((m) => ({ m, s: -negamax(apply(board, m, BOT), YOU, 1, -Infinity, Infinity, 3) }));
        const top = Math.max(...scored.map((x) => x.s));
        // A beginner: any move within a small margin of the best is fair game
        const near = scored.filter((x) => x.s >= top - 12);
        return near[Math.floor(Math.random() * near.length)].m;
    }

    // ---- View
    const boardEl = root.querySelector('.ev-taneh-board');
    const statusEl = root.querySelector('[data-taneh-status]');
    const scoreEl = root.querySelector('[data-taneh-score]');
    const resetBtn = root.querySelector('[data-taneh-reset]');
    const pos = (i) => ({ x: 10 + (i % 5) * 20, y: 10 + Math.floor(i / 5) * 20 });
    let board, stones, selected, busy, halfMoves, taken;

    function drawLines() {
        const svg = boardEl.querySelector('svg');
        svg.innerHTML = LINES.map(([u, v]) => {
            const a = pos(u);
            const b = pos(v);
            return `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}"/>`;
        }).join('') + Array.from({ length: 25 }, (_, i) => `<circle cx="${pos(i).x}" cy="${pos(i).y}" r="1.1"/>`).join('');
        for (let i = 0; i < 25; i++) {
            const b = document.createElement('button');
            b.type = 'button';
            b.className = 'ev-taneh-point';
            b.style.left = `${pos(i).x}%`;
            b.style.top = `${pos(i).y}%`;
            b.dataset.i = i;
            b.addEventListener('click', () => onPoint(i));
            boardEl.appendChild(b);
        }
    }

    function placeStone(stone) {
        const p = pos(stone.at);
        stone.el.style.left = `${p.x}%`;
        stone.el.style.top = `${p.y}%`;
    }

    function setup() {
        board = START.slice();
        selected = null;
        busy = false;
        halfMoves = 0;
        taken = { [YOU]: 0, [BOT]: 0 };
        boardEl.querySelectorAll('.ev-taneh-stone').forEach((el) => el.remove());
        stones = [];
        board.forEach((owner, at) => {
            if (!owner) return;
            const el = document.createElement('span');
            el.className = `ev-taneh-stone ${owner === YOU ? 'is-you' : 'is-bot'}`;
            el.setAttribute('aria-hidden', 'true');
            boardEl.appendChild(el);
            const stone = { owner, at, el };
            placeStone(stone);
            stones.push(stone);
        });
        say('Your move: tap one of your white stones.');
        refresh();
    }

    function say(text) {
        statusEl.textContent = text;
        scoreEl.textContent = `You captured ${taken[YOU]} · Bot captured ${taken[BOT]}`;
    }

    function targets() {
        if (selected === null) return new Map();
        // One destination per point: when two chains end on the same point, take the one that captures more
        const map = new Map();
        movesFor(board, YOU).filter((m) => m.from === selected).forEach((m) => {
            const had = map.get(m.to);
            if (!had || m.captured.length > had.captured.length) map.set(m.to, m);
        });
        return map;
    }

    function refresh() {
        const options = targets();
        const movable = new Set(movesFor(board, YOU).map((m) => m.from));
        boardEl.querySelectorAll('.ev-taneh-point').forEach((b) => {
            const i = Number(b.dataset.i);
            const row = Math.floor(i / 5) + 1;
            const col = (i % 5) + 1;
            const owner = board[i] === YOU ? 'your stone' : board[i] === BOT ? 'bot stone' : 'empty';
            const move = options.get(i);
            b.classList.toggle('is-target', Boolean(move));
            b.classList.toggle('is-capture', Boolean(move && move.captured.length));
            b.classList.toggle('is-selected', i === selected);
            b.disabled = busy || !(move || (board[i] === YOU && movable.has(i)));
            let label = `Row ${row}, column ${col}, ${owner}`;
            if (move) label += move.captured.length ? `, move here and capture ${move.captured.length}` : ', move here';
            b.setAttribute('aria-label', label);
            b.setAttribute('aria-pressed', String(i === selected));
        });
    }

    function onPoint(i) {
        if (busy) return;
        const move = targets().get(i);
        if (move) {
            play(move, YOU);
            return;
        }
        selected = board[i] === YOU && selected !== i ? i : null;
        say(selected === null ? 'Your move: tap one of your white stones.' : 'Now tap a highlighted point. Gold rings capture.');
        refresh();
    }

    const wait = (ms) => new Promise((resolve) => setTimeout(resolve, reduceMotion ? 0 : ms));

    async function play(move, player) {
        busy = true;
        selected = null;
        refresh();
        const stone = stones.find((s) => s.at === move.from && s.owner === player);
        // Walk the stone along its path one hop at a time; each jumped stone leaves as it is passed
        for (let k = 1; k < move.path.length; k++) {
            stone.at = move.path[k];
            placeStone(stone);
            if (window.siteSound) window.siteSound.play(move.captured[k - 1] !== undefined ? 'capture' : 'stone');
            const jumped = move.captured[k - 1];
            if (jumped !== undefined) {
                const victim = stones.find((s) => s.at === jumped && s.owner === other(player));
                if (victim) {
                    victim.el.classList.add('is-taken');
                    stones = stones.filter((s) => s !== victim);
                    setTimeout(() => victim.el.remove(), 400);
                }
            }
            await wait(260);
        }
        board = apply(board, move, player);
        taken[player] += move.captured.length;
        halfMoves = move.captured.length ? 0 : halfMoves + 1;

        const next = other(player);
        if (!board.includes(next) || !movesFor(board, next).length) {
            finish(player === YOU ? 'You win. The bot has no moves left.' : 'The bot wins this one. Try again?');
            return;
        }
        if (halfMoves >= DRAW_HALF_MOVES) {
            finish('Draw: thirty moves without a capture.');
            return;
        }
        if (next === BOT) {
            say('The bot is thinking…');
            await wait(380);
            play(botMove(board), BOT);
        } else {
            busy = false;
            say(move.captured.length ? `The bot captured ${move.captured.length}. Your move.` : 'Your move.');
            refresh();
        }
    }

    function finish(text) {
        busy = true;
        say(text);
        refresh();
        root.classList.add('is-over');
    }

    resetBtn.addEventListener('click', () => {
        root.classList.remove('is-over');
        setup();
    });

    let booted = false;
    function boot() {
        if (booted) return;
        booted = true;
        drawLines();
        setup();
        root.classList.add('is-ready');
    }

    // Build the board when it nears the screen, or once the page is idle, whichever comes first
    if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries) => {
            if (entries.some((e) => e.isIntersecting)) {
                io.disconnect();
                boot();
            }
        }, { rootMargin: '400px 0px' });
        io.observe(root);
    }
    const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 1500));
    window.addEventListener('load', () => idle(boot, { timeout: 3000 }), { once: true });
})();
