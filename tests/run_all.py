#!/usr/bin/env python3
"""Chạy t1…t8 lần lượt, cộng số kiểm tra đạt và so với tổng ghi trong README."""
import pathlib, re, subprocess, sys
here = pathlib.Path(__file__).resolve().parent
EXPECTED = 262
total, failed = 0, []
for t in sorted(here.glob('t[0-9]_*.py')):
    r = subprocess.run([sys.executable, t.name], cwd=here, capture_output=True, text=True)
    m = re.search(r'== (\d+) đạt, (\d+) không đạt', r.stdout)
    ok = int(m.group(1)) if m else 0
    total += ok
    if r.returncode or not m: failed.append(t.stem); print(r.stdout[-2000:], r.stderr[-2000:])
    print(f'{t.stem:<14} {ok:>4} đạt' + ('' if r.returncode == 0 and m else '  ✗'))
print(f'Tổng: {total}/{EXPECTED} đạt')
if failed or total != EXPECTED: sys.exit(f'Không đạt: {failed or "tổng lệch"}')
