document.addEventListener('DOMContentLoaded', async () => {
    initNav();
    initScrollAnimations();
    await renderProjects();
    initLightbox();
    initScrollButtons();
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
    const container = document.getElementById('projects-list');
    if (!container) return;

    try {
        const res = await fetch('./data/projects.json');
        const projects = await res.json();

        container.innerHTML = projects.map(p => `
            <div class="project-card ${p.card_class || ''} fade-in">
                <div class="project-image-wrapper">
                    <img src="${p.thumbnail}" alt="${p.title}" class="project-img">
                </div>
                <div class="project-info">
                    <h3 class="project-title">${p.title.replace(':', ':<br>')}</h3>
                    <div class="divider"></div>
                    <p class="project-desc">${p.tags.join(', ')}</p>
                    <div class="project-meta">
                        <span class="system-count">${p.systems.length}개 시스템 기획</span>
                    </div>
                    <a href="./project.html?id=${p.id}" class="btn-more">자세히 보기</a>
                </div>
            </div>
        `).join('');

        // 렌더링 후 스크롤 애니메이션 재적용
        initScrollAnimations();

    } catch (e) {
        console.error('Projects 로드 실패:', e);
    }
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
