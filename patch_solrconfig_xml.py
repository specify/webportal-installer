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
