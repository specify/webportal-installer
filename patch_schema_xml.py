"""/* Copyright (C) 2020, Specify Collections Consortium
 * 
 * Specify Collections Consortium, Biodiversity Institute, University of Kansas,
 * 1345 Jayhawk Boulevard, Lawrence, Kansas, 66045, USA, support@specifysoftware.org
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
root = schema.getroot()
specify_fields = ElementTree.parse(sys.argv[2])
example_fields = root.findall('field')

# get rid of _text_, id and _root_ flds.

for f in example_fields:
    if f.get('name') in ['_text_','id','_root_']:
        root.remove(f)

for f in specify_fields.findall('field'):
    root.append(f.copy())

# Delete all dynamic fields. For unknown reasons.
ElementTree.SubElement(root, 'fieldType',
                       attrib={'name':"ignored", 'class':"solr.StrField", 'indexed':"false", 'stored':"false", 'multiValued':"true"})
ElementTree.SubElement(root, 'dynamicField',
                       attrib={'name':"*", 'type':"ignored"})

# Change uniqueKey to spid.

for elem in schema.findall('uniqueKey'):
    elem.text = 'spid'

# Delete all copyFields.

for elem in schema.findall('copyField'):
    root.remove(elem)

# Done.

schema.write(sys.stdout)
