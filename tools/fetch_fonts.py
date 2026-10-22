#!/usr/bin/env python3
"""Tải Be Vietnam Pro (OFL) từ Google Fonts, giữ subset vietnamese + latin, nhúng base64 vào src/ui/styles/fonts.css.
Chạy khi cần đổi họ chữ hoặc độ đậm; bản dựng chỉ đọc src/ui/styles/fonts.css nên bản dựng vẫn chạy offline."""
import re, urllib.request, urllib.parse, base64, pathlib
FAMILY, WEIGHTS, SUBSETS = 'Be Vietnam Pro', [400, 500, 600, 700], ('vietnamese', 'latin')
UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120 Safari/537.36'
url = 'https://fonts.googleapis.com/css2?family=%s:wght@%s&display=swap' % (urllib.parse.quote_plus(FAMILY), ';'.join(map(str, WEIGHTS)))
css = urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': UA}), timeout=30).read().decode()
out = ['/* %s (SIL OFL 1.1), subset %s, nhúng base64 để chạy offline. Sinh bởi tools/fetch_fonts.py */' % (FAMILY, ' + '.join(SUBSETS))]
for sub, b in re.findall(r'/\* (\S+) \*/\s*@font-face \{(.*?)\}', css, re.S):
    if sub not in SUBSETS: continue
    w = re.search(r'font-weight: (\d+)', b).group(1); u = re.search(r'url\((.*?)\)', b).group(1); ur = re.search(r'unicode-range: (.*?);', b).group(1)
    data = urllib.request.urlopen(u, timeout=30).read()
    out.append('@font-face{font-family:"%s";font-style:normal;font-weight:%s;font-display:swap;src:url(data:font/woff2;base64,%s) format("woff2");unicode-range:%s}' % (FAMILY, w, base64.b64encode(data).decode(), ur))
(pathlib.Path(__file__).resolve().parent.parent / 'src' / 'ui' / 'styles' / 'fonts.css').write_text('\n'.join(out) + '\n', encoding='utf-8')
print(len(out) - 1, 'font-face')
