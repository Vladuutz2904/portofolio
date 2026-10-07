/* Particule roșii: jar care se ridică, cu strălucire, linii între particulele apropiate
   și respingere ușoară când treci cu mouse-ul / degetul prin ele. */
(function () {
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var canvas = document.createElement('canvas');
    canvas.id = 'particles';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.insertBefore(canvas, document.body.firstChild);
    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    var COLORS = ['255,77,90', '224,32,51', '255,140,120'];
    var LINK_DIST = 120;
    var MOUSE_R = 150;

    var w = 0, h = 0, dpr = 1;
    var particles = [];
    var mouse = { x: -9999, y: -9999 };

    // Sprite cu strălucire pentru fiecare culoare (desenat o singură dată)
    var sprites = COLORS.map(function (rgb) {
        var s = document.createElement('canvas');
        s.width = s.height = 64;
        var g = s.getContext('2d');
        var grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
        grad.addColorStop(0, 'rgba(' + rgb + ',1)');
        grad.addColorStop(0.18, 'rgba(' + rgb + ',0.85)');
        grad.addColorStop(0.45, 'rgba(' + rgb + ',0.22)');
        grad.addColorStop(1, 'rgba(' + rgb + ',0)');
        g.fillStyle = grad;
        g.fillRect(0, 0, 64, 64);
        return s;
    });

    function make(initial) {
        return {
            x: Math.random() * w,
            y: initial ? Math.random() * h : h + 10,
            r: 0.8 + Math.random() * 2.4,
            vy: -(0.12 + Math.random() * 0.42),
            vx: (Math.random() - 0.5) * 0.18,
            sway: 0.2 + Math.random() * 0.6,
            phase: Math.random() * 6.283,
            twinkle: Math.random() * 6.283,
            a: 0.35 + Math.random() * 0.65,
            c: (Math.random() * COLORS.length) | 0
        };
    }

    function resize() {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        w = window.innerWidth;
        h = window.innerHeight;
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        var max = w < 700 ? 45 : 85;
        var target = Math.min(max, Math.round((w * h) / 16000));
        if (reduce) target = Math.min(target, 30);
        while (particles.length < target) particles.push(make(true));
        particles.length = Math.min(particles.length, target);
        if (reduce) draw(0);
    }

    function draw(t) {
        ctx.clearRect(0, 0, w, h);
        ctx.globalCompositeOperation = 'lighter';
        var i, j, p, q;

        for (i = 0; i < particles.length; i++) {
            p = particles[i];

            if (!reduce) {
                p.y += p.vy;
                p.x += p.vx + Math.sin(t * 0.0006 * p.sway + p.phase) * 0.22;

                var dx = p.x - mouse.x, dy = p.y - mouse.y;
                var d2 = dx * dx + dy * dy;
                if (d2 < MOUSE_R * MOUSE_R && d2 > 0.01) {
                    var d = Math.sqrt(d2);
                    var push = (1 - d / MOUSE_R) * 2.2;
                    p.x += (dx / d) * push;
                    p.y += (dy / d) * push;
                }

                if (p.y < -12 || p.x < -12 || p.x > w + 12) {
                    particles[i] = make(false);
                    p = particles[i];
                }
            }

            var fadeTop = Math.max(0, Math.min(1, p.y / (h * 0.22)));
            var fadeBottom = Math.max(0, Math.min(1, (h - p.y) / 70));
            var tw = 0.65 + 0.35 * Math.sin(t * 0.002 + p.twinkle);
            p.alpha = p.a * tw * fadeTop * fadeBottom;
        }

        // Linii între particulele apropiate
        ctx.lineWidth = 1;
        for (i = 0; i < particles.length; i++) {
            p = particles[i];
            for (j = i + 1; j < particles.length; j++) {
                q = particles[j];
                var lx = p.x - q.x, ly = p.y - q.y;
                var dist2 = lx * lx + ly * ly;
                if (dist2 < LINK_DIST * LINK_DIST) {
                    var k = 1 - Math.sqrt(dist2) / LINK_DIST;
                    var la = k * 0.22 * Math.min(p.alpha, q.alpha);
                    if (la > 0.004) {
                        ctx.strokeStyle = 'rgba(255,77,90,' + la.toFixed(3) + ')';
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(q.x, q.y);
                        ctx.stroke();
                    }
                }
            }
        }

        // Particulele
        for (i = 0; i < particles.length; i++) {
            p = particles[i];
            if (p.alpha <= 0.003) continue;
            var size = p.r * 7;
            ctx.globalAlpha = Math.min(1, p.alpha);
            ctx.drawImage(sprites[p.c], p.x - size / 2, p.y - size / 2, size, size);
        }
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';
    }

    function loop(t) {
        draw(t);
        requestAnimationFrame(loop);
    }

    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', function (e) { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
    window.addEventListener('pointerleave', function () { mouse.x = mouse.y = -9999; });
    document.addEventListener('mouseleave', function () { mouse.x = mouse.y = -9999; });

    resize();
    if (!reduce) requestAnimationFrame(loop);
})();
