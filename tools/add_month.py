#!/usr/bin/env python3
"""
Скрипт для быстрого создания нового месяца (папки с уроками) в курсе.

Использование:
    python3 tools/add_month.py --course egeland --id 10-october --title "Октябрь 2026 г." --short "Октябрь"
Или просто запустите интерактивно:
    python3 tools/add_month.py
"""

import os
import sys
import json
import argparse

def main():
    parser = argparse.ArgumentParser(description="Добавить новый месяц в курс")
    parser.add_argument("--course", help="ID курса (например, egeland или fiz)")
    parser.add_argument("--id", help="Идентификатор месяца (например, 10-october)")
    parser.add_argument("--title", help="Полное название месяца (например, 'Октябрь 2026 г.')")
    parser.add_argument("--short", help="Короткое название (например, 'Октябрь')")

    args = parser.parse_args()

    courses_file = "data/courses.json"
    if not os.path.exists(courses_file):
        print(f"Ошибка: файл {courses_file} не найден. Запускайте скрипт из корня проекта.")
        sys.exit(1)

    with open(courses_file, "r", encoding="utf-8") as f:
        courses = json.load(f)

    # Интерактивный ввод, если параметры не переданы
    course_id = args.course
    if not course_id:
        print("Доступные курсы:")
        for k, c in courses.items():
            print(f"  - {k} ({c.get('title')})")
        course_id = input(f"Введите ID курса [{list(courses.keys())[0]}]: ").strip() or list(courses.keys())[0]

    if course_id not in courses:
        print(f"Курс '{course_id}' не найден в {courses_file}!")
        sys.exit(1)

    month_id = args.id
    if not month_id:
        month_id = input("Введите ID месяца (например, 10-october): ").strip()
    if not month_id:
        print("Ошибка: ID месяца не может быть пустым.")
        sys.exit(1)

    title = args.title
    if not title:
        title = input("Введите название месяца (например, 'Октябрь 2026 г.'): ").strip()
    if not title:
        title = month_id

    short = args.short or title.split()[0]

    # Пути
    month_data_dir = f"data/courses/{course_id}/months/{month_id}"
    month_files_dir = f"files/{course_id}/{month_id}"
    lessons_json_path = f"{month_data_dir}/lessons.json"

    os.makedirs(month_data_dir, exist_ok=True)
    os.makedirs(month_files_dir, exist_ok=True)

    # Создаём пустой lessons.json, если его нет
    if not os.path.exists(lessons_json_path):
        with open(lessons_json_path, "w", encoding="utf-8") as f:
            json.dump([], f, ensure_ascii=False, indent=2)
        print(f"✓ Создан файл {lessons_json_path}")
    else:
        print(f"ℹ Файл {lessons_json_path} уже существует.")

    # Обновляем data/courses.json
    months_list = courses[course_id].setdefault("months", [])
    exists = any(m["id"] == month_id for m in months_list)
    if not exists:
        months_list.append({
            "id": month_id,
            "title": title,
            "shortTitle": short,
            "dataPath": lessons_json_path
        })
        with open(courses_file, "w", encoding="utf-8") as f:
            json.dump(courses, f, ensure_ascii=False, indent=2)
        print(f"✓ Месяц '{title}' добавлен в {courses_file}")
    else:
        print(f"ℹ Месяц с ID '{month_id}' уже зарегистрирован в {courses_file}")

    print(f"\nГотово! Папка для файлов создана: {month_files_dir}")
    print(f"Теперь можно добавлять уроки в {lessons_json_path} или через:")
    print(f"  python3 tools/add_lesson.py --course {course_id} --month {month_id}")

if __name__ == "__main__":
    main()
