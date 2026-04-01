"""
build.py — content/ 폴더를 스캔해서 data/projects.json 생성
사용법: python build.py
"""
import os
import json

CONTENT_DIR = os.path.join(os.path.dirname(__file__), "content", "projects")
PLAYING_DIR = os.path.join(os.path.dirname(__file__), "content", "playing")
OUTPUT_FILE = os.path.join(os.path.dirname(__file__), "data", "projects.json")
PLAYING_FILE = os.path.join(os.path.dirname(__file__), "data", "playing.json")
IMAGE_EXTS = {".png", ".jpg", ".jpeg", ".gif", ".webp"}


def parse_info(path):
    """info.txt 또는 index.txt를 key: value 딕셔너리로 파싱"""
    result = {}
    if not os.path.exists(path):
        return result
    with open(path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or ":" not in line:
                continue
            key, _, value = line.partition(":")
            result[key.strip()] = value.strip()
    return result


def get_images(folder):
    """폴더 내 이미지 파일 목록을 정렬해서 반환"""
    images = []
    for fname in sorted(os.listdir(folder)):
        ext = os.path.splitext(fname)[1].lower()
        if ext in IMAGE_EXTS:
            images.append(fname)
    return images


def build_system(project_id, system_folder, system_name):
    """시스템 폴더 하나를 파싱해서 딕셔너리 반환"""
    info_path = os.path.join(system_folder, "info.txt")
    info = parse_info(info_path)

    images = get_images(system_folder)
    image_list = []
    for img in images:
        img_key = img  # ex) 01.png
        caption = info.get(img_key, "")
        rel_path = f"content/projects/{project_id}/{system_name}/{img}"
        image_list.append({"file": rel_path, "caption": caption})

    system = {
        "name": info.get("name", system_name),
        "order": int(info.get("order", 99)),
        "category": info.get("category", ""),
        "date": info.get("date", ""),
        "roles": [r.strip() for r in info.get("roles", "").split(",") if r.strip()],
        "desc": info.get("desc", ""),
        "sub": info.get("sub", ""),
        "bullets": [b.strip() for b in info.get("bullets", "").split(",") if b.strip()],
        "images": image_list,
    }
    return system


def build_project(project_id, project_folder):
    """프로젝트 폴더 하나를 파싱해서 딕셔너리 반환"""
    index_path = os.path.join(project_folder, "index.txt")
    info = parse_info(index_path)

    systems = []
    for entry in os.listdir(project_folder):
        entry_path = os.path.join(project_folder, entry)
        if not os.path.isdir(entry_path):
            continue
        if entry == "기타":
            continue  # 기타는 별도 처리
        system = build_system(project_id, entry_path, entry)
        systems.append(system)

    systems.sort(key=lambda s: s["order"])

    # 기타 이미지 처리
    misc_folder = os.path.join(project_folder, "기타")
    misc_images = []
    if os.path.isdir(misc_folder):
        for img in get_images(misc_folder):
            rel_path = f"content/projects/{project_id}/기타/{img}"
            misc_images.append({"file": rel_path, "caption": ""})

    project = {
        "id": project_id,
        "title": info.get("title", project_id),
        "badge": info.get("badge", ""),
        "tags": [t.strip() for t in info.get("tags", "").split(",") if t.strip()],
        "dev": info.get("dev", ""),
        "order": int(info.get("order", 99)),
        "thumbnail": info.get("thumbnail", f"content/projects/{project_id}/기타/thumbnail.jpg"),
        "card_class": info.get("card_class", ""),
        "systems": systems,
        "misc": misc_images,
    }
    return project


def build_playing():
    games = []
    if not os.path.isdir(PLAYING_DIR):
        return games
    for entry in sorted(os.listdir(PLAYING_DIR)):
        entry_path = os.path.join(PLAYING_DIR, entry)
        if not os.path.isdir(entry_path):
            continue
        info = parse_info(os.path.join(entry_path, "info.txt"))

        # 썸네일
        thumbnail = ""
        for fname in os.listdir(entry_path):
            if os.path.splitext(fname)[1].lower() in IMAGE_EXTS:
                thumbnail = f"content/playing/{entry}/{fname}"
                break

        # playtime을 숫자로 파싱 (정렬용)
        playtime_raw = info.get("playtime", "")
        try:
            playtime_num = float(playtime_raw) if playtime_raw else 0
        except ValueError:
            playtime_num = 0

        # payment를 숫자로 파싱 (정렬용)
        payment_raw = info.get("payment", "")
        try:
            payment_num = float(payment_raw) if payment_raw else 0
        except ValueError:
            payment_num = 0

        games.append({
            "id": entry,
            "name": info.get("name", entry),
            "release": info.get("release", ""),
            "developer": info.get("developer", ""),
            "platform": info.get("platform", ""),
            "package": info.get("package", "No"),
            "comment": info.get("comment", ""),
            "playtime": playtime_raw,
            "playtime_num": playtime_num,
            "payment": payment_raw,
            "payment_num": payment_num,
            "thumbnail": thumbnail,
        })
    return games


def main():
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)

    projects = []
    for entry in os.listdir(CONTENT_DIR):
        entry_path = os.path.join(CONTENT_DIR, entry)
        if os.path.isdir(entry_path):
            project = build_project(entry, entry_path)
            projects.append(project)
    projects.sort(key=lambda p: p["order"])

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(projects, f, ensure_ascii=False, indent=2)
    print(f"OK {len(projects)} projects -> {OUTPUT_FILE}")

    games = build_playing()
    with open(PLAYING_FILE, "w", encoding="utf-8") as f:
        json.dump(games, f, ensure_ascii=False, indent=2)
    print(f"OK {len(games)} games -> {PLAYING_FILE}")


if __name__ == "__main__":
    main()
