# Пересборка документов

Единственный источник текста отчёта — `../ML_SYSTEM_DESIGN.md`. Python-скрипт `build_report.py` формирует Word с тем же текстом и таблицами; все восемь PNG вынесены в приложение А с отсылками из текста. Это предотвращает почти пустые страницы между крупными схемами. `MASTER.me` — точная копия Markdown для буквального соответствия расширению из задания. Для широких и подробных диаграмм используются отдельные страницы A4/A3.

Зависимости: Python 3.12+, python-docx, Pillow, Java и PlantUML с Graphviz. Для вывода PDF нужен Word или LibreOffice; для проверки страниц — Poppler. Windows Arial используется как шрифт отчёта и диаграмм. Исходники схем не содержат персональные данные работников.

Из корня репозитория:

```powershell
python docs/ml-access/tools/build_idef0.py
java -jar <путь-к-plantuml.jar> -charset UTF-8 -tpng docs/ml-access/diagrams/src
java -jar <путь-к-plantuml.jar> -charset UTF-8 -tsvg docs/ml-access/diagrams/src
Copy-Item docs/ml-access/diagrams/src/*.png docs/ml-access/diagrams/
Copy-Item docs/ml-access/diagrams/src/*.svg docs/ml-access/diagrams/
python docs/ml-access/tools/build_report.py
powershell -File docs/ml-access/tools/export_pdf.ps1 -LibreOfficePath '<путь-к-soffice.exe>'
python docs/ml-access/tools/validate.py
```

Экспорт PDF запускает LibreOffice без интерфейса с отдельным временным профилем и явно переданным путём к исполняемому файлу. Альтернатива — экспортировать DOCX в PDF вручную из Word. После экспорта обязательно проверить все страницы. Для текущей сборки использован изолированный LibreOffice, а страницы проверены после рендеринга Poppler.

PlantUML `.jar` не включён в репозиторий. Сгенерированные PNG и SVG хранятся рядом с каталогом src, поэтому для просмотра работы установка инструментов не требуется. Дополнительные файлы PNG/SVG, созданные PlantUML внутри src при повторной генерации, не нужны для сдачи.
