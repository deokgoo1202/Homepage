document.addEventListener('DOMContentLoaded', async () => {
    await renderGames();
    initScrollButtons();
});

async function renderGames() {
    const grid = document.getElementById('playing-grid');
    const countEl = document.getElementById('game-count');

    try {
        const res = await fetch('./data/playing.json');
        const games = await res.json();

        countEl.textContent = `총 ${games.length}개`;

        grid.innerHTML = games.map(g => {
            const platforms = g.platform
                ? g.platform.split(',').map(p => `<span class="game-platform">${p.trim()}</span>`).join('')
                : '';

            const thumb = g.thumbnail
                ? `<img src="${g.thumbnail}" alt="${g.name}" class="game-thumb" loading="lazy">`
                : `<div class="game-thumb-placeholder">🎮</div>`;

            return `
                <div class="game-card">
                    <div class="game-thumb-wrapper">${thumb}</div>
                    <div class="game-info">
                        <div class="game-name">${g.name}</div>
                        ${g.developer ? `<div class="game-developer">${g.developer}</div>` : ''}
                        ${platforms ? `<div class="game-meta">${platforms}</div>` : ''}
                        ${g.comment ? `<div class="game-comment">${g.comment}</div>` : ''}
                    </div>
                </div>
            `;
        }).join('');

    } catch (e) {
        grid.innerHTML = '<p style="color:#888; text-align:center;">데이터를 불러오지 못했습니다.</p>';
        console.error(e);
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
