document.addEventListener('DOMContentLoaded', async () => {
    initNav();
    initScrollAnimations();
    await renderProjects();
    initLightbox();
    initScrollButtons();
    initGoalHover();
    renderHeroBg();
});

function initNav() {
    const nav = document.querySelector('.framer-nav');
    if (!nav) return;
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.style.backgroundColor = 'rgba(20,20,20,0.97)';
        } else {
            nav.style.backgroundColor = 'transparent';
        }
    });

    document.querySelectorAll('.nav-links a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) window.scrollTo({ top: target.offsetTop - 70, behavior: 'smooth' });
        });
    });
}

function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.fade-in, .fade-in-delayed').forEach(el => {
        observer.observe(el);
    });
}

async function renderProjects() {
    const carousel = document.getElementById('projects-carousel');
    if (!carousel) return;

    try {
        const res = await fetch('./data/projects.json');
        const projects = await res.json();

        carousel.innerHTML = projects.map(p => `
            <a href="./project.html?id=${p.id}" class="carousel-card ${p.card_class || ''}">
                <div class="carousel-card-img-wrap">
                    <img src="${p.thumbnail}" alt="${p.title}" class="carousel-card-img">
                </div>
                <div class="carousel-card-info">
                    <h3 class="carousel-card-title">${p.title}</h3>
                    <p class="carousel-card-tags">${p.tags.join(' · ')}</p>
                    <span class="carousel-card-count">${p.systems.length}개 시스템</span>
                </div>
            </a>
        `).join('');

        initCarouselDrag(carousel);
        initScrollAnimations();

    } catch (e) {
        console.error('Projects 로드 실패:', e);
    }
}

function initCarouselDrag(el) {
    let isDown = false, startX, scrollLeft;

    el.addEventListener('mousedown', e => {
        isDown = true;
        el.classList.add('dragging');
        startX = e.pageX - el.offsetLeft;
        scrollLeft = el.scrollLeft;
    });
    el.addEventListener('mouseleave', () => { isDown = false; el.classList.remove('dragging'); });
    el.addEventListener('mouseup', () => { isDown = false; el.classList.remove('dragging'); });
    el.addEventListener('mousemove', e => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - el.offsetLeft;
        el.scrollLeft = scrollLeft - (x - startX) * 1.5;
    });
}

function initGoalHover() {
    const descEl = document.getElementById('goal-desc');
    if (!descEl) return;
    const defaultText = descEl.textContent;
    let timer = null;

    function setDesc(text) {
        clearTimeout(timer);
        descEl.style.opacity = '0';
        timer = setTimeout(() => {
            descEl.textContent = text;
            descEl.style.opacity = '1';
        }, 200);
    }

    document.querySelectorAll('.goal-tag').forEach(tag => {
        tag.addEventListener('mouseenter', () => setDesc(tag.dataset.desc));
        tag.addEventListener('mouseleave', () => setDesc(defaultText));
    });
}

function initScrollButtons() {
    const btnTop = document.getElementById('btn-top');
    const btnBottom = document.getElementById('btn-bottom');
    if (!btnTop || !btnBottom) return;

    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY > 300;
        const atBottom = window.scrollY + window.innerHeight >= document.body.scrollHeight - 100;
        btnTop.classList.toggle('visible', scrolled);
        btnBottom.classList.toggle('visible', !atBottom);
    });

    btnTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    btnBottom.addEventListener('click', () => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }));
}

async function renderHeroBg() {
    const grid = document.getElementById('hero-bg-grid');
    if (!grid) return;
    try {
        const res = await fetch('./data/playing.json');
        const games = await res.json();

        // 썸네일 있는 게임만 필터링 후 셔플
        const withThumb = games.filter(g => g.thumbnail);
        for (let i = withThumb.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [withThumb[i], withThumb[j]] = [withThumb[j], withThumb[i]];
        }

        // 뷰포트 전체를 채울 수만큼 계산
        const cols = Math.ceil(window.innerWidth / 120) + 1;
        const rows = Math.ceil(window.innerHeight / 68) + 1;
        const needed = cols * rows;
        const imgs = [];
        for (let i = 0; i < needed; i++) {
            imgs.push(withThumb[i % withThumb.length]);
        }

        grid.innerHTML = imgs.map(g =>
            `<img src="${g.thumbnail}" alt="" loading="lazy">`
        ).join('');
    } catch (e) {
        // 배경 실패해도 무시
    }
}

function initLightbox() {
    const modal = document.getElementById('lightbox');
    const modalImg = document.getElementById('lightbox-img');
    const closeBtn = document.querySelector('.lightbox-close');
    if (!modal) return;

    document.body.addEventListener('click', (e) => {
        const item = e.target.closest('.gallery-item');
        if (item) {
            const img = item.querySelector('.gallery-img');
            if (img) { modal.style.display = 'flex'; modalImg.src = img.src; }
        }
    });

    closeBtn.addEventListener('click', () => modal.style.display = 'none');
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') modal.style.display = 'none'; });
}
