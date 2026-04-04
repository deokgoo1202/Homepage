let allGames = [];
let currentTab = 'package';
let firstRender = true;

document.addEventListener('DOMContentLoaded', async () => {
    await loadGames();
    initTabs();
    initScrollButtons();
});

function renderNowPlaying() {
    const current = allGames.filter(g => g.current).sort((a, b) => (a.current_order || 99) - (b.current_order || 99));
    const container = document.getElementById('now-playing-section');
    if (!container) return;
    if (current.length === 0) {
        container.style.display = 'none';
        return;
    }
    container.style.display = '';
    container.innerHTML = `
        <div class="now-playing-label">
            <span class="now-playing-dot"></span>
            NOW PLAYING
        </div>
        <div class="now-playing-grid">
            ${current.map(g => {
                const thumb = g.thumbnail
                    ? `<img src="${g.thumbnail}" alt="${g.name}" class="now-playing-thumb" loading="lazy">`
                    : `<div class="now-playing-thumb-placeholder">🎮</div>`;
                const isPackage = g.package === 'Yes';
                const playtimeStat = g.playtime
                    ? `<div class="now-playing-stat"><span class="np-stat-label">플레이</span><span class="np-stat-value">${g.playtime}시간</span></div>`
                    : '';
                const paymentStat = (!isPackage && g.payment)
                    ? `<div class="now-playing-stat np-stat-payment"><span class="np-stat-label">과금</span><span class="np-stat-value">${Number(g.payment).toLocaleString()}원</span></div>`
                    : '';
                const statEl = playtimeStat + paymentStat;
                return `
                    <div class="now-playing-card">
                        <div class="now-playing-thumb-wrapper">${thumb}</div>
                        <div class="now-playing-info">
                            <div class="now-playing-name">${g.name}</div>
                            ${g.developer ? `<div class="now-playing-dev">${g.developer}</div>` : ''}
                            ${statEl}
                            ${g.comment ? `<div class="now-playing-comment">${g.comment}</div>` : ''}
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}


async function loadGames() {
    const grid = document.getElementById('playing-grid');

    try {
        const res = await fetch('./data/playing.json');
        allGames = await res.json();

        updateStats();
        renderNowPlaying();
        renderGames();

    } catch (e) {
        grid.innerHTML = '<p style="color:#888; text-align:center;">데이터를 불러오지 못했습니다.</p>';
        console.error(e);
    }
}

function updateStats() {
    const countEl = document.getElementById('game-count');
    const filtered = getFilteredGames();
    countEl.textContent = filtered.length;
}

function getFilteredGames() {
    if (currentTab === 'package') return allGames.filter(g => g.package === 'Yes' && !g.tasting);
    if (currentTab === 'live') return allGames.filter(g => g.package !== 'Yes' && !g.tasting && !g.childhood);
    if (currentTab === 'childhood') return allGames.filter(g => g.childhood);
    if (currentTab === 'tasting') return allGames.filter(g => g.tasting);
    return allGames;
}

function getSortKey(g) {
    if (currentTab === 'live' || currentTab === 'tasting') return g.payment_num || 0;
    if (currentTab === 'package' || currentTab === 'childhood') return g.playtime_num || 0;
    return 0;
}

function renderGames() {
    const grid = document.getElementById('playing-grid');

    const filtered = getFilteredGames();
    let sorted;

    if (currentTab === 'all') {
        const normal = filtered.filter(g => !g.tasting);
        const tasting = filtered.filter(g => g.tasting);
        const sortNormal = (a, b) => {
            if (a.package === 'Yes' && b.package !== 'Yes') return -1;
            if (a.package !== 'Yes' && b.package === 'Yes') return 1;
            if (a.package === 'Yes') return (b.playtime_num || 0) - (a.playtime_num || 0);
            return (b.payment_num || 0) - (a.payment_num || 0);
        };
        const sortTasting = (a, b) => (b.payment_num || 0) - (a.payment_num || 0);
        sorted = [...normal].sort(sortNormal).concat([...tasting].sort(sortTasting));
    } else {
        sorted = [...filtered].sort((a, b) => getSortKey(b) - getSortKey(a));
    }

    updateStats();

    grid.innerHTML = sorted.map(g => {
        const thumb = g.thumbnail
            ? `<img src="${g.thumbnail}" alt="${g.name}" class="game-thumb" loading="lazy">`
            : `<div class="game-thumb-placeholder">🎮</div>`;

        const isPackage = g.package === 'Yes';

        const playtimeEl = g.playtime
            ? `<div class="game-stat"><span class="stat-label">플레이</span><span class="stat-value">${g.playtime}시간</span></div>`
            : '';

        const paymentEl = (!isPackage && g.payment)
            ? `<div class="game-stat game-stat-payment"><span class="stat-label">과금</span><span class="stat-value">${Number(g.payment).toLocaleString()}원</span></div>`
            : '';

        return `
            <div class="game-card${firstRender ? ' page-card-enter' : ''}">
                <div class="game-thumb-wrapper">${thumb}</div>
                <div class="game-info">
                    <div class="game-name">${g.name}</div>
                    ${g.developer ? `<div class="game-developer">${g.developer}</div>` : ''}
                    ${(playtimeEl || paymentEl) ? `<div class="game-stats">${playtimeEl}${paymentEl}</div>` : ''}
                    ${g.comment ? `<div class="game-comment">${g.comment}</div>` : ''}
                </div>
            </div>
        `;
    }).join('');

    if (firstRender) {
        document.querySelectorAll('.page-card-enter').forEach((el, i) => {
            el.style.animationDelay = `${0.35 + i * 0.04}s`;
        });
        firstRender = false;
    }

    // 모바일: 탭으로 과금 토글
    grid.querySelectorAll('.game-card').forEach(card => {
        card.addEventListener('click', () => {
            card.classList.toggle('show-payment');
        });
    });
    document.querySelectorAll('.now-playing-card').forEach(card => {
        card.addEventListener('click', () => {
            card.classList.toggle('show-payment');
        });
    });
}

function initTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentTab = btn.dataset.tab;
            renderGames();
        });
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
