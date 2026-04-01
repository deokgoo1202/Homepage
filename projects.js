document.addEventListener('DOMContentLoaded', async () => {
    await renderProjects();
    initScrollButtons();
});

async function renderProjects() {
    const container = document.getElementById('projects-list');
    if (!container) return;

    try {
        const res = await fetch('./data/projects.json');
        const projects = await res.json();

        renderProjectsBg(projects);

        document.querySelector('.section-title')?.classList.add('page-enter');

        container.innerHTML = projects.map(p => `
            <div class="project-card ${p.card_class || ''} page-card-enter">
                <div class="project-image-wrapper">
                    <img src="${p.thumbnail}" alt="${p.title}" class="project-img">
                </div>
                <div class="project-info">
                    <h3 class="project-title">${p.title.replace(':', ':<br>')}</h3>
                    <div class="divider"></div>
                    <p class="project-desc">${p.tags.join(', ')}</p>
                    ${p.summary ? `<div class="project-meta"><span class="system-count">${p.summary}</span></div>` : ''}
                    <a href="./project.html?id=${p.id}" class="btn-more">자세히 보기</a>
                </div>
            </div>
        `).join('');

        document.querySelectorAll('.page-card-enter').forEach((el, i) => {
            el.style.animationDelay = `${0.15 + i * 0.12}s`;
        });

    } catch (e) {
        container.innerHTML = '<p style="color:#888; text-align:center;">데이터를 불러오지 못했습니다.</p>';
        console.error(e);
    }
}

function renderProjectsBg(projects) {
    const thumbs = projects.map(p => p.thumbnail).filter(Boolean);
    if (!thumbs.length) return;

    const bg = document.createElement('div');
    bg.id = 'projects-bg';
    bg.style.cssText = `
        position: fixed; inset: 0; z-index: -1;
        display: flex; overflow: hidden;
        opacity: 0.07; filter: blur(3px) saturate(0.3);
        pointer-events: none;
    `;
    thumbs.forEach(src => {
        const img = document.createElement('div');
        img.style.cssText = `
            flex: 1;
            background: url('${src}') center/cover no-repeat;
        `;
        bg.appendChild(img);
    });
    document.body.appendChild(bg);
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
