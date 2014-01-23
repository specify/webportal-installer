import sys
from xml.etree import ElementTree

# See:
# http://specifysoftware.org/sites/specifysoftware.org/files/Installing%20the%20Specify%20Web%20Portal.pdf

schema = ElementTree.parse(sys.argv[1])
specify_fields = ElementTree.parse(sys.argv[2])

example_fields = schema.find('fields')

# Replace example fields with those provided by Specify.

for f in example_fields.findall('./*'):
    example_fields.remove(f)

for f in specify_fields.findall('field'):
    example_fields.append(f.copy())

# Delete all dynamic fields.

ElementTree.SubElement(example_fields, 'dynamicField',
                       attrib={'name':"*", 'type':"ignored"})

# Change uniqueKey to spid.

for elem in schema.findall('uniqueKey'):
    elem.text = 'spid'

# Delete all copyFields.

for elem in schema.findall('copyField'):
    schema.getroot().remove(elem)

# Done.

schema.write(sys.stdout)
