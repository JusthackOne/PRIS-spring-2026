"""Generate the two IDEF0 A0 diagrams as editable SVG and matching PNG."""
from pathlib import Path
from html import escape
import math
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1] / 'diagrams'
W, H, SCALE = 1760, 980, 2
FONT = Path('C:/Windows/Fonts/arial.ttf')
BOLD = Path('C:/Windows/Fonts/arialbd.ttf')

def diagram(name, future):
    canvas = Image.new('RGB', (W*SCALE, H*SCALE), 'white')
    draw = ImageDraw.Draw(canvas)
    svg = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">', '<rect width="100%" height="100%" fill="white"/>']
    def text(x, y, value, size=24, bold=False, anchor='middle', color='#172C3D'):
        font = ImageFont.truetype(str(BOLD if bold else FONT), size*SCALE)
        for n, line in enumerate(value.split('\n')):
            yy = y+n*(size+8)
            draw.text((x*SCALE, yy*SCALE), line, font=font, fill=color, anchor={'middle':'mt','start':'lt','end':'rt'}[anchor])
            svg.append(f'<text x="{x}" y="{yy+size}" font-family="Arial" font-size="{size}" font-weight="{"bold" if bold else "normal"}" text-anchor="{anchor}" fill="{color}">{escape(line)}</text>')
    def line(points, arrow=True, color='#324A60', width=2):
        draw.line([(x*SCALE,y*SCALE) for x,y in points], fill=color, width=width*SCALE)
        svg.append('<polyline points="'+' '.join(f'{x},{y}' for x,y in points)+f'" fill="none" stroke="{color}" stroke-width="{width}"/>')
        if arrow:
            x,y=points[-1]; a,b=points[-2]; angle=math.atan2(y-b,x-a)
            head=[(x,y),(x-13*math.cos(angle)+6*math.sin(angle),y-13*math.sin(angle)-6*math.cos(angle)),(x-13*math.cos(angle)-6*math.sin(angle),y-13*math.sin(angle)+6*math.cos(angle))]
            draw.polygon([(int(a*SCALE),int(b*SCALE)) for a,b in head],fill=color)
            svg.append('<polygon points="'+' '.join(f'{a},{b}' for a,b in head)+f'" fill="{color}"/>')
    def box(x,y,w,h,label,num):
        draw.rectangle((x*SCALE,y*SCALE,(x+w)*SCALE,(y+h)*SCALE),fill='#EDF3F8',outline='#324A60',width=2*SCALE)
        svg.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="#EDF3F8" stroke="#324A60" stroke-width="2"/>')
        text(x+w/2,y+28,label,23,True)
        text(x+w-14,y+h-33,num,20,anchor='end')
    text(65,35, 'TO-BE — контроль входа с ML' if future else 'AS-IS — ручная проверка личности',36,True,anchor='start')
    text(65,91,'IDEF0 · A0 «Контролировать вход сотрудника» · декомпозиция',25,anchor='start')
    if future:
        xs=[150,550,950,1350]; bw=270; y=395; bh=155
        labels=['Проверить качество\nи живое\nприсутствие','Определить\nличность 1:N','Проверить\nправа доступа','Исполнить решение\nи записать\nсобытие']
        controls=['Основание обработки\nКритерии качества / PAD','Пороги tau / delta\nВерсия модели','Свежие права\nи расписание','Регламент СКУД\nи ручного допуска']
        mech=['Камера RGB + IR\nМодуль PAD','Edge-узел\nГалерея и модель','Edge-узел\nЛокальная политика','Контроллер СКУД\nОхранник и журнал']
        flows=['Пригодное\nлицо','Кандидат\nemployee_id','Решение\nо допуске']
        for i,x in enumerate(xs):
            box(x,y,bw,bh,labels[i],f'A{i+1}')
            text(x+bw/2,185,controls[i],23)
            line([(x+bw/2,260),(x+bw/2,y)])
            text(x+bw/2,790,mech[i],23)
            line([(x+bw/2,774),(x+bw/2,y+bh)])
        text(65,302,'Сотрудник\nи кадры',23,anchor='start')
        line([(65,365),(110,365),(110,465),(150,465)])
        for i in range(3):
            line([(xs[i]+bw,465),(xs[i+1],465)])
            text(xs[i]+bw+65,392,flows[i],19)
        line([(1620,465),(1700,465)])
        text(1660,330,'Результат\nи журнал',21)
        # Exceptions leave the output (right) face, then route to A4.
        for i in range(3):
            xx=xs[i]+bw
            line([(xx,520),(xx+28,520),(xx+28,645)],False)
        line([(448,645),(1305,645),(1305,515),(1350,515)])
        text(880,674,'Исключения\nк A4',23)
        text(65,894,'Изменение: охранник обрабатывает исключения; штатные проверки выполняют ML и явные правила.',24,anchor='start')
    else:
        xs=[190,740,1290]; bw=290; y=395; bh=155
        labels=['Получить профиль\nпо пропуску','Сравнить лицо\nи проверить права','Разрешить / отказать\nи записать проход']
        controls=['Регламент предъявления\nпропуска','Фото профиля\nДействующие права','Регламент допуска\nи учёта проходов']
        mech=['Сотрудник\nи считыватель','Охранник\nи экран СКУД','Охранник\nКонтроллер и журнал']
        for i,x in enumerate(xs):
            box(x,y,bw,bh,labels[i],f'A{i+1}')
            text(x+bw/2,185,controls[i],24)
            line([(x+bw/2,263),(x+bw/2,y)])
            text(x+bw/2,740,mech[i],24)
            line([(x+bw/2,720),(x+bw/2,y+bh)])
        line([(55,465),(190,465)])
        text(113,335,'Сотрудник\nи пропуск',24)
        for i,label in enumerate(['Профиль\nсотрудника','Результат\nручной проверки']):
            line([(xs[i]+bw,465),(xs[i+1],465)])
            text(xs[i]+bw+130,373,label,23)
        line([(1580,465),(1705,465)])
        text(1645,337,'Результат\nи журнал',23)
        text(65,870,'Основная ручная функция: A2 — визуальное сравнение каждого сотрудника с фотографией.',25,anchor='start')
    text(65,940,'Вход — слева   |   Управление — сверху   |   Выход — справа   |   Механизмы — снизу',21,anchor='start',color='#596875')
    svg.append('</svg>')
    ROOT.mkdir(parents=True,exist_ok=True)
    (ROOT/f'{name}.svg').write_text('\n'.join(svg),encoding='utf-8')
    canvas.save(ROOT/f'{name}.png')

if __name__=='__main__':
    diagram('as-is',False)
    diagram('to-be',True)
