// archive.js — UI Reference Archive (사이드바 + 해시 라우팅 단일 페이지)

// 카테고리 한글명 · 분류 그룹 — 🔴 여기에 손으로 적지 않는다(2026-10-31).
// build_archive.py --groups 가 분류 정본(Game-Oriented/Studio/.claude/instructions/design/system/system_classification.md)에서
// data/archive_groups.json 을 만든다. 예전엔 여기 손으로 적었고 «정본 기준»이라 했지만 따로 놀았다.
let CAT_KO = {};
let GROUP_DEF = [];      // [[그룹 key, 한글, [카테고리…]]] — 정본에 적힌 순서
const GROUP_OF = {};
const CAT_ORDER = {};   // 그룹 내 정렬 순서(정본 순서)
function applyGroups(data) {
    CAT_KO = data.labels;
    GROUP_DEF = data.groups.map(g => [g.key, g.ko, g.members]);
    GROUP_DEF.forEach(([key, , members]) => members.forEach((m, i) => { GROUP_OF[m] = key; CAT_ORDER[m] = i; }));
}

function catKo(name) { return CAT_KO[name] || name; }
function catLabel(name) {
    const ko = CAT_KO[name];
    return ko && ko !== name ? `${ko} <span class="cat-en">(${name})</span>` : name;
}
function encPath(p) { return p.split('/').map(encodeURIComponent).join('/'); }

// 게임명 한글 매핑 (게임별 뷰)
const GAME_KO = {
    PrasiaTales: '프라시아 전기', AsdalChronicles: '아스달 연대기', SoloLevelingArise: '나 혼자만 레벨업: 어라이즈',
    Hoyeon: '호연', 제2의나라CrossWorlds: '제2의 나라: 크로스 월드', 제2의나라Crossworlds: '제2의 나라: 크로스 월드',
    SummonersWarChronicles: '서머너즈 워: 크로니클', 서머너즈워백년전쟁: '서머너즈 워: 백년전쟁', LineageW: '리니지W', 제노니아크로노브레이크: '제노니아: 크로노브레이크',
    Lineage2Revolution: '리니지2 레볼루션', NightCrows: '나이트 크로우', ThroneAndLiberty: '쓰론 앤 리버티',
    트릭컬리바이브: '트릭컬 리바이브', HonkaiStarRail: '붕괴: 스타레일', DragonheirSilentGods: '드래곤히어: 사일런트 갓즈',
    로드나인: '로드나인', Lineage2M: '리니지2M', 가디언테일즈: '가디언 테일즈', LostArk: '로스트아크',
    OdinValhalaRising: '오딘: 발할라 라이징', GenshinImpact: '원신', 던전앤파이터모바일: '던전앤파이터 모바일',
    세븐나이츠레볼루션: '세븐나이츠 레볼루션', ArcheAgeWar: '아키에이지 워', 쿠키런모험의탑: '쿠키런: 모험의 탑',
    HIT2: '히트2', 블레이드소울2: '블레이드 & 소울2', TheLegendOfNeverland: '영원의 네버랜드',
    Wuthering: '명조: 워더링 웨이브', 왕좌의게임킹스로드: '왕좌의 게임: 킹스로드', 왕좌의게임: '왕좌의 게임',
    Archeland: '아크랜드', LeagueOfLegends: '리그 오브 레전드', 리그오브레전드: '리그 오브 레전드',
    마비노기모바일: '마비노기 모바일', CrusaderKings3: '크루세이더 킹즈 3', SoulStrike: '소울 스트라이크',
    카오스제로나이트메어: '카오스 제로 나이트메어', AnotherDungeon: '어나더 던전', 블루아카이브: '블루 아카이브',
    GirlsFrontline2: '소녀전선2', ZenlessZoneZero: '젠레스 존 제로', 绝区零: '젠레스 존 제로',
    ArcadiaM: '아르카디아M', 에버소울: '에버소울', SnowBreak: '스노우브레이크', Cyberpunk2077: '사이버펑크 2077',
    브라운더스트2: '브라운더스트2', HeroesOfTheStorm: '히어로즈 오브 더 스톰', メメントモリ: '메멘토 모리',
    ヘブンバーンズレッド: '헤븐 번즈 레드', 안녕엘라: '안녕 엘라', 이터널리턴: '이터널 리턴',
    NikkeGoddessOfVictory: '승리의 여신: 니케', PathOfExile2: '패스 오브 엑자일 2', FishingStrikeCrewz: '피싱 스트라이크',
    Reverse1999: '리버스: 1999', 커츠펠: '커츠펠', Palworld: '팰월드', 白夜極光: '백야극광', 오버워치2: '오버워치2',
    Hearthstone: '하스스톤', 탕탕특공대: '탕탕특공대', 뱀피르: '뱀피르', FootballManager2023: '풋볼 매니저 2023',
    미르4: '미르4', TheWitcher3: '더 위쳐 3', 나혼자만레벨업Arise: '나 혼자만 레벨업: 어라이즈', 나혼자만레벨업: '나 혼자만 레벨업',
    아이온2: '아이온2', RedDeadRedemption2: '레드 데드 리뎀션 2', ゴーストオブツシマ: '고스트 오브 쓰시마',
    명일방주엔드필드: '명일방주: 엔드필드', 레이븐2: '레이븐2', 연운: '연운', 드래곤소드: '드래곤 소드',
    NiNoKuni: '니노쿠니', 마비노기영웅전: '마비노기 영웅전', 더퍼스트디센던트: '더 퍼스트 디센던트', 퍼스트디센던트: '퍼스트 디센던트',
    월드오브워크래프트: '월드 오브 워크래프트', 검은사막: '검은사막', 나이트워커: '나이트워커', 명조: '명조: 워더링 웨이브',
    StarSeedAsniaTrigger: '스타시드: 아스니아 트리거', 더스타라이트: '더 스타라이트', 명조워더링웨이브: '명조: 워더링 웨이브',
    RoyalMatch: '로얄 매치', 로스트소드: '로스트 소드', 메이플키우기: '메이플 키우기', 블레이드앤소울2: '블레이드 & 소울2',
    콜오브카오스어셈블: '콜 오브 카오스: 어셈블', 넷마블: '넷마블', 엘든링: '엘든 링', 발할라서바이벌: '발할라 서바이벌',
    바람의나라연: '바람의 나라: 연', Rf온라인넥스트: 'RF 온라인 넥스트', 더스타라이트: '더 스타라이트',
};
function gameKo(name) { return GAME_KO[name] || name; }

let ARCHIVE = null;
let VIEW = 'screen';      // 'screen' | 'game'
let GAME_INDEX = [];      // [{name, screens:[{cat, images}], image_count}]

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const [res, gres] = await Promise.all([fetch('./data/archive.json'), fetch('./data/archive_groups.json')]);
        applyGroups(await gres.json());
        ARCHIVE = await res.json();
        // 완전 제외 카테고리
        const HIDE = new Set(['level_art']);
        ARCHIVE.categories = ARCHIVE.categories.filter(c => !HIDE.has(c.name));
        buildGameIndex();
    } catch (e) {
        console.error(e);
        document.getElementById('archive-content').innerHTML = '<p class="archive-empty">아카이브를 불러오지 못했습니다.</p>';
        return;
    }
    initTabs();
    initViewToggle();
    initSearch();
    route();
    window.addEventListener('hashchange', route);
    initLightbox();
    initScrollButtons();
});

// 게임 → 화면 인덱스 구성 (한글명 기준 병합, Etc/비게임 제외)
function buildGameIndex() {
    const map = {};  // 한글명 -> { 카테고리 -> images[] }
    ARCHIVE.categories.forEach(c => {
        if (ALL_GALLERY_CATS.has(c.name)) return;
        c.games.forEach(g => {
            if (g.name.startsWith('_')) return; // 비게임 폴더(_, _NoGame...) 제외
            const ko = gameKo(g.name);
            const byCat = (map[ko] = map[ko] || {});
            byCat[c.name] = (byCat[c.name] || []).concat(g.images);
        });
    });
    GAME_INDEX = Object.entries(map).map(([name, byCat]) => {
        const screens = Object.entries(byCat).map(([cat, images]) => ({ cat, images }));
        return { name, screens, image_count: screens.reduce((s, x) => s + x.images.length, 0) };
    }).sort((a, b) => a.name.localeCompare(b.name, 'ko'));
}

function initViewToggle() {
    document.querySelectorAll('.archive-vt').forEach(btn => {
        btn.addEventListener('click', () => {
            const v = btn.dataset.view;
            if (v === VIEW) return;
            location.hash = (v === 'game') ? '#@' : '';
        });
    });
}

const TAB_INFO = {
    system: { ko: '시스템 레퍼런스', en: 'System Reference' },
};

// 갤러리형 탭 (사이드바+그리드, 이미지·영상 혼합). 각 탭 = 매니페스트 카테고리 묶음
const GALLERY_TABS = {
    detail:  { cats: new Set(['detail']),     ko: '디테일 레퍼런스', en: 'Detail',  sub: '게임의 디테일한 구현이나 현실 세계의 세세한 것들에 대한 레퍼런스' },
    monster: { cats: new Set(['monsterref']), ko: '몬스터 레퍼런스', en: 'Monster', sub: '몬스터 디자인에 참고할 현실 생물 레퍼런스' },
    meme:    { cats: new Set(['meme']),       ko: '밈 레퍼런스',     en: 'Meme',    sub: '재미있게 본 것들 모음' },
};
// UI 레퍼런스에서 제외할 모든 갤러리 카테고리
const ALL_GALLERY_CATS = new Set(Object.values(GALLERY_TABS).flatMap(t => [...t.cats]));
const gallerySel = {};   // tabKey -> 선택된 하위분류 ('' = 전체)

const subCount = (s) => s.images.length + s.videos.length;

// 갤러리 탭의 하위분류 목록 (카테고리의 games = 하위분류)
function gallerySubs(cats) {
    const subs = [];
    ARCHIVE.categories.filter(c => cats.has(c.name)).forEach(c => {
        c.games.forEach(g => subs.push({ name: g.name, images: g.images || [], videos: g.videos || [] }));
    });
    return subs;
}

function setActiveTabBtn(tabKey) {
    document.querySelectorAll('.archive-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tabKey));
}

function initTabs() {
    document.querySelectorAll('.archive-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const t = tab.dataset.tab;
            const target = (t === 'ui') ? '' : ('t/' + t);
            if (location.hash.replace(/^#/, '') === target) route();  // 해시 변화 없으면 직접 렌더
            else location.hash = target;                              // 해시 변경 → hashchange → route
        });
    });
}

function renderGallerySidebar(tabKey) {
    const list = document.getElementById('archive-cat-list');
    const sel = gallerySel[tabKey] || '';
    list.innerHTML = gallerySubs(GALLERY_TABS[tabKey].cats).map(s => `
        <li>
            <a class="archive-cat-link${s.name === sel ? ' active' : ''}" data-gsub="${s.name}" href="javascript:void 0">
                <span class="cat-link-label">${s.name}</span>
                <span class="cat-link-count">${subCount(s)}</span>
            </a>
        </li>`).join('');
    list.querySelectorAll('[data-gsub]').forEach(el => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            gallerySel[tabKey] = (gallerySel[tabKey] === el.dataset.gsub) ? '' : el.dataset.gsub;
            renderGallerySidebar(tabKey);
            renderGallery(tabKey);
        });
    });
}

function renderGallery(tabKey) {
    const t = GALLERY_TABS[tabKey];
    const el = document.getElementById('archive-content');
    const sel = gallerySel[tabKey] || '';
    let subs = gallerySubs(t.cats);
    if (sel) subs = subs.filter(s => s.name === sel);
    el.innerHTML = `
        <div class="archive-header" style="text-align:left;">
            <h1 class="archive-title">${t.ko} <span class="cat-en-big">(${t.en})</span></h1>
            <p class="archive-subtitle">${t.sub}</p>
        </div>
        ${subs.map(s => `
            <div class="archive-game-group">
                <span class="archive-game-label">${s.name}<span class="archive-game-count">${subCount(s)}</span></span>
                <div class="archive-img-grid">
                    ${s.videos.map(v => {
                        if (v && v.mp4) {
                            return `
                        <div class="archive-img-item archive-video-item" data-mp4="${encPath(v.mp4)}">
                            <img src="${encPath(v.poster)}" alt="video" loading="lazy">
                            <span class="video-play">▶</span>
                        </div>`;
                        }
                        if (v && v.ig) {
                            return `
                        <div class="archive-img-item archive-video-item archive-ig-item" data-ig="${v.ig}">
                            <span class="ig-logo">Reels</span>
                            <span class="video-play">▶</span>
                        </div>`;
                        }
                        const id = typeof v === 'string' ? v : v.id;
                        const wide = (typeof v === 'object' && v.wide) ? 1 : 0;
                        return `
                        <div class="archive-img-item archive-video-item" data-yt="${id}" data-wide="${wide}">
                            <img src="https://img.youtube.com/vi/${id}/hqdefault.jpg" alt="video" loading="lazy">
                            <span class="video-play">▶</span>
                        </div>`;
                    }).join('')}
                    ${s.images.map(src => `
                        <div class="archive-img-item" data-full="${encPath(src)}">
                            <img src="${encPath(src)}" alt="${s.name}" loading="lazy">
                        </div>`).join('')}
                </div>
            </div>`).join('')}`;
}

function renderConstruction(info) {
    document.getElementById('archive-content').innerHTML = `
        <div class="archive-header">
            <h1 class="archive-title">${info.ko} <span class="cat-en-big">(${info.en})</span></h1>
        </div>
        <p class="archive-empty" style="font-size:1.3rem;">🚧 공사중</p>`;
}

function renderSidebar() {
    // 뷰 토글 활성화 동기화
    document.querySelectorAll('.archive-vt').forEach(b => b.classList.toggle('active', b.dataset.view === VIEW));
    const search = document.getElementById('archive-search');
    if (search) search.placeholder = VIEW === 'game' ? '게임 검색...' : '화면 유형 검색...';
    if (VIEW === 'game') return renderGameSidebar();
    renderScreenSidebar();
}

function renderGameSidebar() {
    const list = document.getElementById('archive-cat-list');
    list.innerHTML = GAME_INDEX.map(g => `
        <li>
            <a class="archive-cat-link" href="#@${encodeURIComponent(g.name)}"
               data-cat="@${g.name}" data-search="${(gameKo(g.name) + ' ' + g.name).toLowerCase()}">
                <span class="cat-link-label">${gameKo(g.name)}</span>
                <span class="cat-link-count">${g.image_count}</span>
            </a>
        </li>`).join('');
}

function renderScreenSidebar() {
    const list = document.getElementById('archive-cat-list');

    // 분류 그룹별로 카테고리 배속 (정의 순서 유지). 미배속은 기타로.
    const buckets = {};
    GROUP_DEF.forEach(([key]) => { buckets[key] = []; });
    ARCHIVE.categories.forEach(c => {
        if (ALL_GALLERY_CATS.has(c.name)) return;
        const g = GROUP_OF[c.name] || 'Miscellaneous';
        (buckets[g] || buckets['Miscellaneous']).push(c);
    });
    // 그룹 내 순서를 GROUP_DEF 멤버 순서대로 정렬
    Object.values(buckets).forEach(arr => arr.sort((a, b) => (CAT_ORDER[a.name] ?? 999) - (CAT_ORDER[b.name] ?? 999)));

    const liOf = (c) => `
        <li>
            <a class="archive-cat-link" href="#${encodeURIComponent(c.name)}"
               data-cat="${c.name}" data-search="${(catKo(c.name) + ' ' + c.name).toLowerCase()}">
                <span class="cat-link-label">${catLabel(c.name)}</span>
                <span class="cat-link-count">${c.game_count}</span>
            </a>
        </li>`;

    list.innerHTML = GROUP_DEF.map(([key, label]) => {
        const items = buckets[key];
        if (!items.length) return '';
        return `<li class="archive-group" data-group="${key}">
            <div class="archive-group-header">${label}</div>
            <ul class="archive-group-items">${items.map(liOf).join('')}</ul>
        </li>`;
    }).join('');
}

// 검색: 한 번만 바인딩, 현재 사이드바(그룹/플랫 모두) 대상으로 필터
function initSearch() {
    const search = document.getElementById('archive-search');
    const list = document.getElementById('archive-cat-list');
    if (!search) return;
    search.addEventListener('input', () => {
        const q = search.value.trim().toLowerCase();
        list.querySelectorAll('.archive-cat-link').forEach(el => {
            el.parentElement.style.display = el.dataset.search.includes(q) ? '' : 'none';
        });
        list.querySelectorAll('.archive-group').forEach(group => {
            const any = [...group.querySelectorAll('.archive-cat-link')]
                .some(el => el.parentElement.style.display !== 'none');
            group.style.display = any ? '' : 'none';
        });
    });
}

function route() {
    const raw = location.hash.replace(/^#/, '');
    const sidebar = document.getElementById('archive-sidebar');
    const vt = document.querySelector('.archive-viewtoggle');
    const search = document.getElementById('archive-search');

    // 갤러리/시스템 탭 (#t/<tab>)
    if (raw.startsWith('t/')) {
        const tab = decodeURIComponent(raw.slice(2));
        if (GALLERY_TABS[tab]) {
            setActiveTabBtn(tab);
            sidebar.style.display = '';
            if (vt) vt.style.display = 'none';
            if (search) search.style.display = 'none';
            if (!gallerySel[tab]) gallerySel[tab] = '';
            renderGallerySidebar(tab);
            renderGallery(tab);
            window.scrollTo({ top: 0 });
            return;
        }
        if (TAB_INFO[tab]) {   // 시스템 등 준비중 탭
            setActiveTabBtn(tab);
            sidebar.style.display = 'none';
            renderConstruction(TAB_INFO[tab]);
            window.scrollTo({ top: 0 });
            return;
        }
        // 알 수 없는 탭 → UI로 폴백
    }

    // UI 레퍼런스 탭
    setActiveTabBtn('ui');
    sidebar.style.display = '';
    if (vt) vt.style.display = '';
    if (search) search.style.display = '';

    const isGame = raw.startsWith('@');
    VIEW = isGame ? 'game' : 'screen';
    renderSidebar();

    const sel = isGame ? '@' + decodeURIComponent(raw.slice(1)) : decodeURIComponent(raw);
    document.querySelectorAll('.archive-cat-link').forEach(el => {
        el.classList.toggle('active', el.dataset.cat === sel);
    });
    scrollSidebarToActive();

    if (isGame) {
        const gname = decodeURIComponent(raw.slice(1));
        if (!gname) { renderGameOverview(); return; }
        const g = GAME_INDEX.find(x => x.name === gname);
        g ? renderGame(g) : renderGameOverview();
    } else {
        const name = decodeURIComponent(raw);
        if (!name) { renderOverview(); return; }
        const cat = ARCHIVE.categories.find(c => c.name === name);
        cat ? renderCategory(cat) : renderOverview();
    }
    window.scrollTo({ top: 0 });
}

// 사이드바를 활성 카테고리가 보이도록 스크롤(컨테이너 내부만)
function scrollSidebarToActive() {
    const list = document.getElementById('archive-cat-list');
    if (!list) return;
    const active = list.querySelector('.archive-cat-link.active');
    if (!active) return;
    const lr = list.getBoundingClientRect(), ar = active.getBoundingClientRect();
    list.scrollTop += (ar.top - lr.top) - (list.clientHeight - active.offsetHeight) / 2;
}

function renderGameOverview() {
    const el = document.getElementById('archive-content');
    el.innerHTML = `
        <div class="archive-header">
            <p class="archive-subtitle">게임별로 보는 UI 레퍼런스</p>
            <div class="archive-stats">
                <span class="archive-stat"><b>${GAME_INDEX.length}</b>게임</span>
            </div>
        </div>
        <div class="archive-cat-grid">
            ${GAME_INDEX.map(g => {
                const cover = g.screens[0]?.images[0] || '';
                return `
                <a class="archive-cat-card" href="#@${encodeURIComponent(g.name)}">
                    ${cover ? `<img class="archive-cat-thumb" src="${encPath(cover)}" alt="${gameKo(g.name)}" loading="lazy">` : '<div class="archive-cat-thumb"></div>'}
                    <div class="archive-cat-info">
                        <div class="archive-cat-name">${gameKo(g.name)}</div>
                        <div class="archive-cat-meta">${g.screens.length} screens · ${g.image_count} shots</div>
                    </div>
                </a>`;
            }).join('')}
        </div>`;
}

function renderGame(g) {
    const el = document.getElementById('archive-content');
    el.innerHTML = `
        <div class="archive-header" style="text-align:left;">
            <h1 class="archive-title">${gameKo(g.name)}</h1>
            <p class="archive-subtitle">${g.screens.length} screens · ${g.image_count} shots</p>
        </div>
        ${g.screens.map(s => `
            <div class="archive-game-group">
                <span class="archive-game-label">${catLabel(s.cat)}<span class="archive-game-count">${s.images.length}</span></span>
                <div class="archive-img-grid">
                    ${s.images.map(src => `
                        <div class="archive-img-item" data-full="${encPath(src)}">
                            <img src="${encPath(src)}" alt="${s.cat}" loading="lazy">
                        </div>`).join('')}
                </div>
            </div>`).join('')}`;
}

function renderOverview() {
    const el = document.getElementById('archive-content');
    const shown = ARCHIVE.categories.filter(c => !ALL_GALLERY_CATS.has(c.name));
    const catCount = shown.length;
    const imgCount = shown.reduce((s, c) => s + c.image_count, 0);
    const gameCount = GAME_INDEX.length;
    el.innerHTML = `
        <div class="archive-header">
            <p class="archive-subtitle">화면 유형별로 분류한 게임 UI 레퍼런스</p>
            <div class="archive-stats">
                <span class="archive-stat"><b>${catCount}</b>화면 유형</span>
                <span class="archive-stat"><b>${gameCount}</b>게임</span>
                <span class="archive-stat"><b>${imgCount.toLocaleString()}</b>스크린샷</span>
            </div>
        </div>
        <div class="archive-cat-grid">
            ${shown.map(c => {
                const cover = c.games[0]?.images[0] || '';
                return `
                <a class="archive-cat-card" href="#${encodeURIComponent(c.name)}">
                    ${cover ? `<img class="archive-cat-thumb" src="${encPath(cover)}" alt="${c.name}" loading="lazy">` : '<div class="archive-cat-thumb"></div>'}
                    <div class="archive-cat-info">
                        <div class="archive-cat-name">${catLabel(c.name)}</div>
                        <div class="archive-cat-meta">${c.game_count} games · ${c.image_count} shots</div>
                    </div>
                </a>`;
            }).join('')}
        </div>`;
}

function renderCategory(cat) {
    const el = document.getElementById('archive-content');
    el.innerHTML = `
        <div class="archive-header" style="text-align:left;">
            <h1 class="archive-title">${catKo(cat.name)} <span class="cat-en-big">(${cat.name})</span></h1>
            <p class="archive-subtitle">${cat.game_count} games · ${cat.image_count} shots</p>
        </div>
        ${cat.games.map(g => `
            <div class="archive-game-group">
                <span class="archive-game-label">${gameKo(g.name)}${g.note ? ` <span class="game-note">(${g.note})</span>` : ''}<span class="archive-game-count">${g.images.length}</span></span>
                <div class="archive-img-grid">
                    ${g.images.map(src => `
                        <div class="archive-img-item" data-full="${encPath(src)}">
                            <img src="${encPath(src)}" alt="${g.name}" loading="lazy">
                        </div>`).join('')}
                </div>
            </div>`).join('')}`;
}

function initLightbox() {
    const modal = document.getElementById('lightbox');
    const modalImg = document.getElementById('lightbox-img');
    const closeBtn = document.querySelector('.lightbox-close');
    if (!modal) return;
    let frame = null;
    const clearVideo = () => { if (frame) { frame.remove(); frame = null; } };
    const close = () => { modal.style.display = 'none'; clearVideo(); modalImg.style.display = ''; modalImg.src = ''; };

    document.body.addEventListener('click', (e) => {
        const item = e.target.closest('.archive-img-item');
        if (!item) return;
        modal.style.display = 'flex';
        clearVideo();
        if (item.dataset.mp4) {
            modalImg.style.display = 'none';
            frame = document.createElement('video');
            frame.className = 'lightbox-video-el';
            frame.src = item.dataset.mp4;
            frame.controls = true;
            frame.autoplay = true;
            frame.playsInline = true;
            modal.appendChild(frame);
        } else if (item.dataset.ig) {
            modalImg.style.display = 'none';
            frame = document.createElement('iframe');
            frame.className = 'lightbox-video ig';
            frame.src = `https://www.instagram.com/reel/${item.dataset.ig}/embed/`;
            frame.allow = 'autoplay; encrypted-media; clipboard-write; picture-in-picture';
            frame.allowFullscreen = true;
            modal.appendChild(frame);
        } else if (item.dataset.yt) {
            modalImg.style.display = 'none';
            frame = document.createElement('iframe');
            frame.className = 'lightbox-video' + (item.dataset.wide === '1' ? ' wide' : '');
            frame.src = `https://www.youtube-nocookie.com/embed/${item.dataset.yt}?autoplay=1&rel=0`;
            frame.allow = 'autoplay; encrypted-media; fullscreen';
            frame.allowFullscreen = true;
            modal.appendChild(frame);
        } else {
            modalImg.style.display = '';
            modalImg.src = item.dataset.full;
        }
    });
    if (closeBtn) closeBtn.addEventListener('click', close);
    modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
}

function initScrollButtons() {
    const top = document.getElementById('btn-top');
    const bottom = document.getElementById('btn-bottom');
    if (top) top.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    if (bottom) bottom.addEventListener('click', () => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }));
}
