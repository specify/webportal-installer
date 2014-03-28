import sys
import re

index_html = sys.stdin.read()

matches = re.findall(r'href="4\.7\.(\d+)/"', index_html)

versions = [tuple(int(x) for x in v) for v in matches]

latest = sorted(versions, reverse=True)[0]

print '4.7.%d' % latest
