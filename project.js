document.addEventListener('DOMContentLoaded', async () => {
    const id = new URLSearchParams(window.location.search).get('id');
    if (!id) { showError('프로젝트 ID가 없습니다.'); return; }

    showLoading();

    try {
        const res = await fetch('./data/projects.json');
        const projects = await res.json();
        const project = projects.find(p => p.id === id);

        if (!project) { showError(`'${id}' 프로젝트를 찾을 수 없습니다.`); return; }

        document.title = `${project.title} | Game-Oriented`;
        hideLoading();
        renderHero(project);
        renderTOC(project.systems);
        renderSystems(project.systems);
        renderMisc(project.misc);
        initScrollAnimations();
        initLightbox();
        initScrollButtons();

    } catch (e) {
        showError('데이터를 불러오지 못했습니다. build.py를 먼저 실행해주세요.');
        console.error(e);
    }
});

function showLoading() {
    document.getElementById('detail-hero').innerHTML = `
        <div class="loading-spinner">
            <div class="spinner"></div>
            <p>불러오는 중...</p>
        </div>
    `;
}

function hideLoading() {
    document.getElementById('detail-hero').innerHTML = '';
}

function renderHero(project) {
    const el = document.getElementById('detail-hero');
    const tagsHtml = project.tags.map(t => `<span class="detail-tag">${t}</span>`).join('');
    el.innerHTML = `
        ${project.badge ? `<div class="detail-badge">${project.badge}</div>` : ''}
        <h1 class="detail-title">${project.title}</h1>
        <div class="detail-tags">${tagsHtml}</div>
        ${project.dev ? `<p class="detail-dev">${project.dev}</p>` : ''}
    `;
}

const CATEGORY_LABELS = {
    Core: '코어', Growth: '성장', Trade: '교환', Accomplishment: '달성',
    Collect: '수집', Dungeon: '전투/던전', Social: '소셜', Economy: '경제',
    Management: '경영', Idle: '방치', BM: 'BM', Event: '이벤트',
    UX: 'UX', Guide: '가이드', Service: '운영/서비스', World: '월드', Misc: '기타'
};
const CATEGORY_ORDER = ['Core','Growth','Trade','Accomplishment','Collect','Dungeon','Social','Economy','Management','Idle','BM','Event','UX','Guide','Service','World','Misc'];

function groupByCategory(systems) {
    const grouped = {};
    systems.forEach((s, i) => {
        const cat = s.category || 'Misc';
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push({ ...s, _idx: i });
    });
    // category 순서대로 정렬
    const result = [];
    CATEGORY_ORDER.forEach(cat => {
        if (grouped[cat]) result.push({ cat, label: CATEGORY_LABELS[cat] || cat, systems: grouped[cat] });
    });
    // 정의되지 않은 category 처리
    Object.keys(grouped).forEach(cat => {
        if (!CATEGORY_ORDER.includes(cat)) result.push({ cat, label: cat, systems: grouped[cat] });
    });
    return result;
}

function renderTOC(systems) {
    if (!systems || systems.length === 0) return;
    const el = document.getElementById('detail-toc');
    if (!el) return;

    const hasCat = systems.some(s => s.category);
    if (!hasCat) {
        el.innerHTML = `
            <nav class="toc-nav">
                <span class="toc-label">시스템</span>
                <div class="toc-links">
                    ${systems.map((s, i) => `<a href="#system-${i}" class="toc-link">${s.name}</a>`).join('')}
                </div>
            </nav>
        `;
        return;
    }

    const groups = groupByCategory(systems);
    el.innerHTML = `
        <nav class="toc-nav">
            <span class="toc-label">시스템</span>
            <div class="toc-links">
                ${groups.map(g => `
                    <span class="toc-cat-label">${g.label}</span>
                    ${g.systems.map(s => `<a href="#system-${s._idx}" class="toc-link">${s.name}</a>`).join('')}
                `).join('')}
            </div>
        </nav>
    `;
}

function renderSystems(systems) {
    const el = document.getElementById('detail-systems');
    if (!systems || systems.length === 0) {
        el.innerHTML = '<p class="system-placeholder">등록된 시스템이 없습니다.</p>';
        return;
    }

    const rolesHtml = (roles) => roles.length
        ? `<div class="role-tags">${roles.map(r => `<span class="role-tag">${r}</span>`).join('')}</div>`
        : '';

    const bulletsHtml = (bullets) => bullets.length
        ? `<ul class="system-sub-list">${bullets.map(b => `<li>${b}</li>`).join('')}</ul>`
        : '';

    const imagesHtml = (images) => {
        if (!images || images.length === 0) return '';
        const isDual = images.length >= 2;
        const imgs = images.map(img => `
            <div class="gallery-item" style="cursor:pointer;">
                <img src="${img.file}" alt="${img.caption || ''}" class="system-img gallery-img">
                ${img.caption ? `<p class="img-caption">${img.caption}</p>` : ''}
            </div>
        `).join('');
        return `
            <div class="system-image-container${isDual ? ' dual-image' : ''}">
                ${imgs}
            </div>
        `;
    };

    const systemCardHtml = (s, i) => `
        <div class="system-item fade-in" id="system-${i}">
            <div class="system-header">
                <h3 class="system-name">${s.name}</h3>
                ${rolesHtml(s.roles)}
            </div>
            ${s.date ? `<p class="system-date">${s.date}</p>` : ''}
            ${s.desc ? `<p class="system-desc-main">${s.desc}</p>` : ''}
            ${s.sub ? `<p class="system-desc-sub">${s.sub}</p>` : ''}
            ${bulletsHtml(s.bullets)}
            ${imagesHtml(s.images)}
        </div>
    `;

    const hasCat = systems.some(s => s.category);
    if (!hasCat) {
        el.innerHTML = `
            <h2 class="detail-section-title">Designed</h2>
            <div class="system-list">
                ${systems.map((s, i) => systemCardHtml(s, i)).join('')}
            </div>
        `;
        return;
    }

    const groups = groupByCategory(systems);
    el.innerHTML = `
        <h2 class="detail-section-title">Designed</h2>
        ${groups.map(g => `
            <div class="system-category-group">
                <div class="system-category-header">
                    <span class="system-category-badge">${g.label}</span>
                    <span class="system-category-count">${g.systems.length}</span>
                </div>
                <div class="system-list">
                    ${g.systems.map(s => systemCardHtml(s, s._idx)).join('')}
                </div>
            </div>
        `).join('')}
    `;
}

function renderMisc(misc) {
    if (!misc || misc.length === 0) return;
    const section = document.getElementById('detail-misc');
    const grid = document.getElementById('misc-grid');
    grid.innerHTML = misc.map(img => `
        <div class="improvement-card gallery-item" style="cursor:pointer;">
            <img src="${img.file}" alt="${img.caption || ''}" class="gallery-img">
            ${img.caption ? `<div class="card-overlay"><span>${img.caption}</span></div>` : ''}
        </div>
    `).join('');
    section.style.display = 'block';
}

function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.08 });

    document.querySelectorAll('.system-item').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(24px)';
        el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(el);
    });
}

function initLightbox() {
    const modal = document.getElementById('lightbox');
    const modalImg = document.getElementById('lightbox-img');
    const closeBtn = document.querySelector('.lightbox-close');

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

function showError(msg) {
    hideLoading();
    document.getElementById('detail-systems').innerHTML = `<p class="system-placeholder">${msg}</p>`;
}
