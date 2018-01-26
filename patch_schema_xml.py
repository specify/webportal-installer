"""/* Copyright (C) 2018, University of Kansas Center for Research
 * 
 * Specify Software Project, specify@ku.edu, Biodiversity Institute,
 * 1345 Jayhawk Boulevard, Lawrence, Kansas, 66045, USA
 * 
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
*/"""
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
