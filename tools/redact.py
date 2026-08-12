#!/usr/bin/env python3
"""对截图做局部模糊脱敏。用法：
redact.py <输入> <输出> "x,y,w,h" ["x,y,w,h" ...]
坐标为原图像素。"""
import subprocess
import sys

src, out, *regions = sys.argv[1:]

cmd = ['magick', src]
for r in regions:
    x, y, w, h = (int(v) for v in r.split(','))
    cmd += ['(', '-clone', '0', '-crop', f'{w}x{h}+{x}+{y}', '+repage',
            '-resize', '4%', '-resize', f'{w}x{h}!', ')',
            '-geometry', f'+{x}+{y}', '-composite']
cmd.append(out)

subprocess.run(cmd, check=True)
print(f'{out}  ({len(regions)} 处脱敏)')
