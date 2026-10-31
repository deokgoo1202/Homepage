"""
build_archive.py — UI 레퍼런스 목록(data/archive.json) 검사 · 개수 갱신 · 새 이미지 덧붙이기

🔴 정본은 data/archive.json 이다 — 원본 폴더가 아니다.
   2026-06-22 분류된 원본(43GB)을 지우고 _Unmapped 만 남겼다(webp 가 Git 에 있으니까).
   그 뒤 archive.json 을 손으로 95번 고쳤다(개명 · 합치기 · note · 영상).
   그래서 이 스크립트는 목록을 **처음부터 다시 만들지 않는다.** 옛 판은 그렇게 했고,
   원본 경로가 바뀐 지금(2026-09-14 Studio/common → References) 돌리면
   **빈 목록으로 덮어써 사이트의 레퍼런스가 전부 사라졌다**(오류도 안 났다).

사용법:
  python build_archive.py               검사만 한다(아무것도 안 쓴다). 어긋나면 exit 1
  python build_archive.py --fix-counts  game_count · image_count · total_* 만 실제 값으로 고친다
  python build_archive.py --add [폴더]  폴더/{Category}/{Game}/*.png 를 webp 로 바꿔 **뒤에 붙인다**
                                        (기존 항목은 지우지도 바꾸지도 않는다 · 같은 원본은 두 번 안 붙인다)
                                        폴더 기본값 = REF_SRC (_Unmapped 는 건너뛴다)
"""
import argparse
import hashlib
import io
import json
import os
import re
import sys

sys.stdout.reconfigure(encoding="utf-8")

REF_SRC = r"C:\Users\deokgoo\Desktop\Game-Oriented\References\references"
ROOT = os.path.dirname(os.path.abspath(__file__))
OUT_DIR = os.path.join(ROOT, "archive")
MANIFEST = os.path.join(ROOT, "data", "archive.json")
SOURCES = os.path.join(ROOT, "data", "archive_sources.json")   # --add 로 붙인 원본의 sha1 → 붙은 경로

IMG_EXTS = {".png", ".jpg", ".jpeg", ".jfif", ".gif", ".webp"}
SKIP_TOP = {"_Unmapped"}
MAX_W = 1280
QUALITY = 76


def load_json(path, default=None):
    if not os.path.exists(path):
        return default
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def save_json(path, data):
    # 기존 파일과 같은 형식(한 줄 · 한글 그대로) — 다시 쓰기만 해도 바이트가 같아야 diff 가 깨끗하다
    with open(path, "w", encoding="utf-8", newline="") as f:
        json.dump(data, f, ensure_ascii=False, separators=(",", ":"))


def video_paths(v):
    """영상 항목에서 로컬 파일 경로만 꺼낸다(유튜브 id 문자열은 파일이 아니다)."""
    if isinstance(v, dict):
        return [v[k] for k in ("mp4", "poster") if isinstance(v.get(k), str) and v[k].startswith("archive/")]
    return []


def counts_of(m):
    """목록에서 계산한 실제 개수 — 사이트가 화면에 쓰는 숫자와 대조한다.
    image_count 는 이미지 + 영상이다(archive.js 의 subCount 와 같은 셈)."""
    out = {}
    for c in m["categories"]:
        out[c["name"]] = (len(c["games"]),
                          sum(len(g.get("images", [])) + len(g.get("videos", [])) for g in c["games"]))
    return out


def check(m):
    problems = 0
    refs = set()
    for c in m["categories"]:
        for g in c["games"]:
            refs.update(g.get("images", []))
            for v in g.get("videos", []):
                refs.update(video_paths(v))
    files = set()
    for dp, _, fns in os.walk(OUT_DIR):
        for fn in fns:
            if fn == "desktop.ini":
                continue
            files.add(os.path.relpath(os.path.join(dp, fn), ROOT).replace(os.sep, "/"))

    n_img = sum(n for _, n in counts_of(m).values())
    print(f"카테고리 {len(m['categories'])} · 게임 항목 {sum(g for g, _ in counts_of(m).values())} · "
          f"이미지+영상 {n_img} · 실제 파일 {len(files)}")

    missing = sorted(refs - files)
    print(f"\n[1] 목록에는 있는데 파일이 없다 (사이트에서 깨진 그림) — {len(missing)}건")
    for p in missing:
        print("    ", p)
    problems += len(missing)

    orphan = sorted(files - refs)
    print(f"\n[2] 파일은 있는데 목록에 없다 (사이트에 안 보인다) — {len(orphan)}건")
    for p in orphan:
        print("    ", p)
    problems += len(orphan)

    wrong = [(c["name"], (c.get("game_count"), c.get("image_count")), counts_of(m)[c["name"]])
             for c in m["categories"] if (c.get("game_count"), c.get("image_count")) != counts_of(m)[c["name"]]]
    print(f"\n[3] 카테고리 개수 숫자가 실제와 다르다 (사이트에 틀린 숫자) — {len(wrong)}건")
    for name, said, real in wrong:
        print(f"     {name}: 적힌 값 {said} → 실제 {real}")
    problems += len(wrong)

    real_tot = (len(m["categories"]), sum(g for g, _ in counts_of(m).values()), n_img)
    said_tot = (m.get("total_categories"), m.get("total_games"), m.get("total_images"))
    print(f"\n[4] 합계 — 적힌 값 {said_tot} / 실제 {real_tot}" + ("" if said_tot == real_tot else "  ← 다르다"))
    problems += said_tot != real_tot

    print(f"\n결과: 문제 {problems}건" + (" — 개수는 --fix-counts 로 고친다. [1][2] 는 사람이 판단한다" if problems else ""))
    return problems


def fix_counts(m):
    for c in m["categories"]:
        c["game_count"], c["image_count"] = counts_of(m)[c["name"]]
    m["total_categories"] = len(m["categories"])
    m["total_games"] = sum(c["game_count"] for c in m["categories"])
    m["total_images"] = sum(c["image_count"] for c in m["categories"])


def to_webp(src, dst):
    from PIL import Image
    img = Image.open(src)
    if img.mode != "RGB":
        img = img.convert("RGB")
    w, h = img.size
    if w > MAX_W:
        img = img.resize((MAX_W, round(h * MAX_W / w)), Image.LANCZOS)
    img.save(dst, "WEBP", quality=QUALITY, method=4)


def add(m, src_root):
    if not os.path.isdir(src_root):
        print(f"🔴 원본 폴더가 없다: {src_root}\n   아무것도 쓰지 않고 멈춘다.")
        return 1
    sources = load_json(SOURCES, {})
    cats = {c["name"]: c for c in m["categories"]}
    added = skipped = 0
    for cat in sorted(os.listdir(src_root)):
        cdir = os.path.join(src_root, cat)
        if cat in SKIP_TOP or not os.path.isdir(cdir):
            continue
        for game in sorted(os.listdir(cdir)):
            gdir = os.path.join(cdir, game)
            if not os.path.isdir(gdir):
                continue
            srcs = sorted(f for f in os.listdir(gdir) if os.path.splitext(f)[1].lower() in IMG_EXTS)
            for fn in srcs:
                path = os.path.join(gdir, fn)
                with open(path, "rb") as f:
                    sha = hashlib.sha1(f.read()).hexdigest()
                if sha in sources:
                    skipped += 1
                    continue
                c = cats.get(cat)
                if c is None:
                    c = {"name": cat, "games": [], "game_count": 0, "image_count": 0}
                    m["categories"].append(c)
                    cats[cat] = c
                    print(f"  🆕 새 카테고리: {cat} — archive.js 의 CAT_KO · GROUP_DEF 에도 넣어야 메뉴에 이름이 붙는다")
                g = next((x for x in c["games"] if x["name"] == game), None)
                if g is None:
                    g = {"name": game, "images": []}
                    c["games"].append(g)
                out_dir = os.path.join(OUT_DIR, cat, game)
                os.makedirs(out_dir, exist_ok=True)
                used = [int(x[:3]) for x in os.listdir(out_dir) if re.fullmatch(r"\d{3}\.webp", x)]
                name = f"{max(used, default=0) + 1:03d}.webp"
                to_webp(path, os.path.join(out_dir, name))
                rel = f"archive/{cat}/{game}/{name}"
                g["images"].append(rel)
                sources[sha] = rel
                added += 1
                print(f"  + {rel}  ← {os.path.relpath(path, src_root)}")
    fix_counts(m)
    save_json(MANIFEST, m)
    save_json(SOURCES, sources)
    print(f"\n덧붙임 {added}장 · 이미 붙인 것 건너뜀 {skipped}장 · 기존 항목은 그대로")
    return 0


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--fix-counts", action="store_true")
    ap.add_argument("--add", nargs="?", const=REF_SRC, default=None, metavar="폴더")
    a = ap.parse_args()

    m = load_json(MANIFEST)
    if not m or not m.get("categories"):
        print(f"🔴 정본 목록이 비어 있거나 없다: {MANIFEST} — 멈춘다")
        return 1
    before = sum(len(g.get("images", [])) for c in m["categories"] for g in c["games"])

    if a.add:
        rc = add(m, a.add)
    elif a.fix_counts:
        fix_counts(m)
        save_json(MANIFEST, m)
        print("개수를 실제 값으로 고쳤다.")
        rc = 0
    else:
        return 1 if check(m) else 0

    after = sum(len(g.get("images", [])) for c in m["categories"] for g in c["games"])
    if after < before:   # 이 스크립트는 지우지 않는다 — 줄었으면 버그다
        print(f"🔴 이미지가 {before} → {after} 로 줄었다. git checkout data/archive.json 으로 되돌릴 것")
        return 1
    return rc


if __name__ == "__main__":
    sys.exit(main())
