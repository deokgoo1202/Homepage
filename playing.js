let allGames = [];
let currentSort = 'payment';
let currentTab = 'all';
let firstRender = true;

document.addEventListener('DOMContentLoaded', async () => {
    await loadGames();
    initTabs();
    initSortButtons();
    initScrollButtons();
});

async function loadGames() {
    const grid = document.getElementById('playing-grid');

    try {
        const res = await fetch('./data/playing.json');
        allGames = await res.json();

        updateStats(allGames);
        renderGames();

    } catch (e) {
        grid.innerHTML = '<p style="color:#888; text-align:center;">데이터를 불러오지 못했습니다.</p>';
        console.error(e);
    }
}

function updateStats(games) {
    const countEl = document.getElementById('game-count');
    const paymentEl = document.getElementById('total-payment');

    const filtered = getFilteredGames();
    const totalPayment = filtered.reduce((sum, g) => sum + (g.payment_num || 0), 0);

    countEl.textContent = filtered.length;
    paymentEl.textContent = totalPayment > 0 ? totalPayment.toLocaleString() + '원' : '-';
}

function getFilteredGames() {
    if (currentTab === 'all') return allGames;
    if (currentTab === 'package') return allGames.filter(g => g.package === 'Yes');
    if (currentTab === 'live') return allGames.filter(g => g.package !== 'Yes');
    return allGames;
}

function renderGames() {
    const grid = document.getElementById('playing-grid');

    const filtered = getFilteredGames();
    const sorted = [...filtered].sort((a, b) => {
        const aVal = currentSort === 'playtime' ? (a.playtime_num || 0) : (a.payment_num || 0);
        const bVal = currentSort === 'playtime' ? (b.playtime_num || 0) : (b.payment_num || 0);
        return bVal - aVal;
    });

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
            ? `<div class="game-stat"><span class="stat-label">과금</span><span class="stat-value">${Number(g.payment).toLocaleString()}원</span></div>`
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
}

const TAB_DEFAULT_SORT = {
    all: 'payment',
    package: 'playtime',
    live: 'payment',
};

function initTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentTab = btn.dataset.tab;

            // 탭에 따라 기본 정렬 자동 전환
            currentSort = TAB_DEFAULT_SORT[currentTab] || 'payment';
            document.querySelectorAll('.sort-btn').forEach(b => {
                b.classList.toggle('active', b.dataset.sort === currentSort);
            });

            renderGames();
        });
    });
}

function initSortButtons() {
    document.querySelectorAll('.sort-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentSort = btn.dataset.sort;
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
