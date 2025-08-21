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
from copy import deepcopy
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
    root.append(deepcopy(f))

df = root.find("./dynamicField[@name='*']")
if df is not None:
    root.remove(df)
    root.append(df)

e = root.find("./field[@name='contents']")
if e is not None and e.get('required') == 'true':
    e.set('required', 'false')
    # optional: ensure default empty string
    if e.get('default') is None:
        e.set('default', '')

for fld in ('latitude1', 'longitude1'):
    e = root.find(f"./field[@name='{fld}']")
    if e is not None:
        e.set('type', 'string')

# Ensure a catch-all ignores unknown fields, but don't duplicate existing 'ignored' type.
if root.find("./fieldType[@name='ignored']") is None:
    ElementTree.SubElement(
        root, 'fieldType',
        attrib={'name':"ignored", 'class':"solr.StrField",
                'indexed':"false", 'stored':"false", 'multiValued':"true"}
    )

# Add or update a '*' dynamicField to use 'ignored'
df = root.find("./dynamicField[@name='*']")
if df is None:
    ElementTree.SubElement(root, 'dynamicField', attrib={'name':"*", 'type':"ignored"})
else:
    df.set('type', 'ignored')

# Change uniqueKey to spid.

for elem in schema.findall('uniqueKey'):
    elem.text = 'spid'

# Delete all copyFields.

for elem in schema.findall('copyField'):
    root.remove(elem)

# Done.

schema.write(sys.stdout.buffer, encoding="utf-8", xml_declaration=True)
