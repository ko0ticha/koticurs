#!/usr/bin/env python3
"""
Скрипт для быстрого добавления нового урока в курс.

Использование:
    python3 tools/add_lesson.py --course egeland --month 09-september --num "13" --name "Урок 13. Право" --video "https://..."
Или просто запустите интерактивно:
    python3 tools/add_lesson.py
"""

import os
import sys
import json
import argparse

def main():
    parser = argparse.ArgumentParser(description="Добавить новый урок в курс")
    parser.add_argument("--course", help="ID курса (например, egeland или fiz)")
    parser.add_argument("--month", help="ID месяца (например, 09-september или 10-october)")
    parser.add_argument("--num", help="Номер урока (например, 13)")
    parser.add_argument("--name", help="Название урока (например, 'Урок 13. Основы права')")
    parser.add_argument("--date", help="Дата или подзаголовок (например, '15 октября')")
    parser.add_argument("--video", help="Ссылка на видео (YouTube, Kinescope, Rutube, etc.)")
    parser.add_argument("--video-label", default="Видео урока", help="Подпись к видео")

    args = parser.parse_args()

    courses_file = "data/courses.json"
    if not os.path.exists(courses_file):
        print(f"Ошибка: файл {courses_file} не найден. Запускайте скрипт из корня проекта.")
        sys.exit(1)

    with open(courses_file, "r", encoding="utf-8") as f:
        courses = json.load(f)

    # Интерактивный ввод курса
    course_id = args.course
    if not course_id:
        print("Доступные курсы:")
        for k, c in courses.items():
            print(f"  - {k} ({c.get('title')})")
        course_id = input(f"Выберите курс [{list(courses.keys())[0]}]: ").strip() or list(courses.keys())[0]

    if course_id not in courses:
        print(f"Курс '{course_id}' не найден!")
        sys.exit(1)

    course = courses[course_id]
    months = course.get("months", [])
    if not months:
        print(f"У курса '{course_id}' нет месяцев. Сначала создайте месяц через tools/add_month.py")
        sys.exit(1)

    # Выбор месяца
    month_id = args.month
    if not month_id:
        print("\nДоступные месяцы:")
        for m in months:
            print(f"  - {m['id']} ({m['title']})")
        month_id = input(f"Выберите месяц [{months[0]['id']}]: ").strip() or months[0]['id']

    target_month = next((m for m in months if m["id"] == month_id), None)
    if not target_month:
        print(f"Месяц '{month_id}' не найден!")
        sys.exit(1)

    lessons_path = target_month.get("dataPath", f"data/courses/{course_id}/months/{month_id}/lessons.json")
    if not os.path.exists(lessons_path):
        os.makedirs(os.path.dirname(lessons_path), exist_ok=True)
        lessons = []
    else:
        with open(lessons_path, "r", encoding="utf-8") as f:
            try:
                lessons = json.load(f)
            except Exception:
                lessons = []

    # Номер и название
    num = args.num
    if not num:
        next_num = len(lessons) + 1
        num = input(f"Номер урока [{next_num}]: ").strip() or str(next_num)

    name = args.name
    if not name:
        name = input("Название урока: ").strip()
    if not name:
        name = f"Урок {num}"

    date = args.date
    if not date:
        date = input(f"Дата или подзаголовок [Урок {num}]: ").strip() or f"Урок {num}"

    # Видео
    videos = []
    video_url = args.video
    if not video_url:
        video_url = input("Ссылка на видео (Enter, если нет): ").strip()

    if video_url:
        videos.append({
            "label": args.video_label or "Видео урока",
            "url": video_url
        })

    # Файлы материалов
    materials = []
    homework = []

    print("\nХотите добавить файлы материалов? (Скрипты, конспекты)")
    print(f"Поместите файлы в папку: files/{course_id}/{month_id}/")
    add_files = input("Добавить файл прямо сейчас? (y/N): ").strip().lower()

    while add_files in ["y", "yes", "д", "да"]:
        flabel = input("  Название файла (например, 'Скрипт к уроку.pdf'): ").strip()
        fname = input("  Имя файла в папке (или путь): ").strip()
        is_hw = input("  Это домашнее задание? (y/N): ").strip().lower() in ["y", "yes", "д", "да"]

        furl = fname if "/" in fname else f"files/{course_id}/{month_id}/{fname}"
        item = {
            "label": flabel or fname,
            "url": furl,
            "type": "homework" if is_hw else "lesson"
        }

        if is_hw:
            homework.append(item)
        else:
            materials.append(item)

        add_files = input("Добавить ещё файл? (y/N): ").strip().lower()

    new_lesson = {
        "num": str(num),
        "date": date,
        "name": name,
        "videos": videos,
        "materials": materials,
        "homework": homework,
        "links": [],
        "quiz": None
    }

    lessons.append(new_lesson)

    with open(lessons_path, "w", encoding="utf-8") as f:
        json.dump(lessons, f, ensure_ascii=False, indent=2)

    print(f"\n✓ Урок '{name}' успешно добавлен в {lessons_path}!")
    print(f"Всего уроков в этом месяце: {len(lessons)}")

if __name__ == "__main__":
    main()
