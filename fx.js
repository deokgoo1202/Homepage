/* fx.js — 인터랙션 이펙트 (커스텀 커서 · 3D 틸트 · 마그네틱 · 헤더 스크롤 숨김)
   바닐라, 외부 의존 없음. synapseent.com 참고. */
(function () {
    'use strict';
    var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    var RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var TILT = '.game-card, .now-playing-card, .project-card, .etc-card, .archive-cat-card';
    var HOT = 'a, button, [role="button"], [data-magnet], .tab-btn, .archive-tab, .archive-vt, ' +
        '.archive-cat-link, .archive-img-item, .scroll-btn, ' + TILT;

    // ---- 헤더 스크롤 숨김 (모든 기기) ----
    function headerScroll() {
        var h = document.querySelector('.framer-nav');
        if (!h) return;
        var last = 0, ticking = false;
        window.addEventListener('scroll', function () {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(function () {
                var y = window.scrollY || window.pageYOffset;
                h.classList.toggle('nav-pinned', y > 40);
                h.classList.toggle('nav-hidden', y > last + 4 && y > 500);
                last = y;
                ticking = false;
            });
        }, { passive: true });
    }

    // ---- 커스텀 커서 ----
    function cursor() {
        var dot = document.createElement('div'); dot.className = 'fx-cursor-dot';
        var ring = document.createElement('div'); ring.className = 'fx-cursor-ring';
        document.body.appendChild(dot); document.body.appendChild(ring);
        var mx = -100, my = -100, rx = -100, ry = -100, on = false;
        window.addEventListener('pointermove', function (e) {
            if (e.pointerType && e.pointerType !== 'mouse') return;
            mx = e.clientX; my = e.clientY;
            dot.style.transform = 'translate(' + mx + 'px,' + my + 'px) translate(-50%,-50%)';
            if (!on) { document.body.classList.add('fx-cursor-on'); on = true; }
        }, { passive: true });
        document.addEventListener('mouseleave', function () { document.body.classList.remove('fx-cursor-on'); on = false; });
        document.addEventListener('mouseenter', function () { if (mx > 0) { document.body.classList.add('fx-cursor-on'); on = true; } });
        (function follow() {
            rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
            ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px) translate(-50%,-50%)';
            requestAnimationFrame(follow);
        })();
        document.addEventListener('pointerover', function (e) {
            if (e.target.closest && e.target.closest(HOT)) ring.classList.add('is-hot');
        }, { passive: true });
        document.addEventListener('pointerout', function (e) {
            if (e.target.closest && e.target.closest(HOT)) ring.classList.remove('is-hot');
        }, { passive: true });
    }

    // ---- 3D 틸트 (이벤트 위임 → 동적 카드도 자동 적용) ----
    function tilt() {
        var cur = null;
        function reset(c) { c.classList.remove('fx-tilt', 'fx-glow'); c.style.transform = ''; }
        document.addEventListener('pointermove', function (e) {
            if (e.pointerType && e.pointerType !== 'mouse') return;
            var card = e.target.closest ? e.target.closest(TILT) : null;
            if (card !== cur) { if (cur) reset(cur); cur = card; if (card) card.classList.add('fx-tilt', 'fx-glow'); }
            if (!card) return;
            var r = card.getBoundingClientRect();
            var px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
            card.style.transform = 'perspective(900px) rotateX(' + ((0.5 - py) * 7).toFixed(2) +
                'deg) rotateY(' + ((px - 0.5) * 9).toFixed(2) + 'deg) translateY(-6px) scale(1.015)';
            card.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
            card.style.setProperty('--my', (py * 100).toFixed(1) + '%');
        }, { passive: true });
        window.addEventListener('blur', function () { if (cur) { reset(cur); cur = null; } });
    }

    // ---- 마그네틱 (nav 링크 · 스크롤 버튼) ----
    function magnets() {
        ['.nav-links a', '.scroll-btn'].forEach(function (sel) {
            document.querySelectorAll(sel).forEach(function (el) { el.setAttribute('data-magnet', ''); });
        });
        document.addEventListener('pointermove', function (e) {
            var t = e.target.closest ? e.target.closest('[data-magnet]') : null;
            if (!t) return;
            var r = t.getBoundingClientRect();
            t.style.transform = 'translate(' + ((e.clientX - (r.left + r.width / 2)) * 0.22) +
                'px,' + ((e.clientY - (r.top + r.height / 2)) * 0.22) + 'px)';
        }, { passive: true });
        document.addEventListener('pointerout', function (e) {
            var t = e.target.closest ? e.target.closest('[data-magnet]') : null;
            if (t && (!e.relatedTarget || !t.contains(e.relatedTarget))) t.style.transform = '';
        }, { passive: true });
    }

    function init() {
        headerScroll();
        if (fine && !RM) { cursor(); tilt(); magnets(); }
    }
    if (document.readyState !== 'loading') init();
    else document.addEventListener('DOMContentLoaded', init);
})();
