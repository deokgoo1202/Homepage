# 홈페이지 작업 가이드

## 사이트 정보
- URL: https://deokgoo1202.github.io/Homepage/
- GitHub: https://github.com/deokgoo1202/Homepage
- Google Analytics: G-D1BEYHSFY3

## 로컬 경로
- 소스: `G:/내 드라이브/1_Game Design/20260303_홈페이지/`
- 이미지/작업 임시 폴더: `C:/Users/deokgoo/Desktop/홈페이지/`

## 핵심 파일
- `build.py` — content/ 스캔 → data/projects.json, data/playing.json 생성. 실행 후 git push 필요
- `steam_config.py` — Steam API Key/ID (gitignore됨). Steam 플레이타임 자동 동기화
- `data/playing.json` — Playlist 데이터
- `data/projects.json` — Projects 데이터
- `content/playing/{게임폴더}/info.txt` — 게임 메타데이터
- `content/projects/{프로젝트폴더}/` — 프로젝트 데이터

## info.txt 주요 필드 (playing)
- `name`, `developer`, `release`, `platform`
- `package: Yes` — 패키지 게임 탭
- `childhood: yes` — 유년시절 탭
- `tasting: yes` — 찍먹 탭 (라이브/패키지 제외)
- `current: yes` + `current_order: N` — NOW PLAYING 섹션
- `playtime: N` — 플레이 시간(시간), Steam 자동 동기화 시 덮어씀
- `payment: N` — 과금액(원)
- `comment: ...` — 카드에 표시될 한 줄 코멘트
- `appid: N` — Steam AppID (자동 동기화용)

## 페이지 구성
- `index.html` — About Me
- `projects.html` — Projects 목록
- `project.html` — Project 상세 (킹스로드, 제노니아)
- `playing.html` + `playing.js` + `playing.css` — Playlist

## Playlist 탭 & 정렬
- 패키지 (플레이시간 내림차순)
- 라이브 (과금액 내림차순)
- 찍먹 (과금액 내림차순)
- 유년시절 (출시연도 내림차순)

## 작업 플로우
1. `content/playing/{폴더}/info.txt` 편집 또는 생성
2. 썸네일 이미지 → `content/playing/{폴더}/thumbnail.{ext}`
3. `python build.py` 실행
4. `git add -A && git commit && git push`

## 알려진 이슈 및 처리
- avif 이미지 → PIL로 jpg 변환 후 사용
- Windows CP949 환경에서 build.py 한글 출력 깨짐 (기능엔 무관)
- 모바일 기타 팝업: position fixed + 화면 중앙 고정으로 처리됨 (detail.css)
