import sys
from xml.etree import ElementTree

# See:
# http://specifysoftware.org/sites/specifysoftware.org/files/Installing%20the%20Specify%20Web%20Portal.pdf

config = ElementTree.parse(sys.argv[1])

# Find the line: <str name="df">text</str>
# and change it to: <str name="df">cs</str>

for elem in config.findall('.//str[@name="df"]'):
    elem.text = "cs"

# Delete the updateHandler
# Note: All the code beginning with this line:
# <updateHandler class="solr.DirectUpdateHandler2">
# and ending with this line: </updateHandler> needs to be deleted

root = config.getroot()
for elem in root.findall('updateHandler[@class="solr.DirectUpdateHandler2"]'):
    root.remove(elem)

# Done.

config.write(sys.stdout)
