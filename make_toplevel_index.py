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
import json
import os
from xml.etree import ElementTree
from datetime import datetime

def splitall(path):
    allparts = []
    while 1:
        parts = os.path.split(path)
        if parts[0] == path:  # sentinel for absolute paths
            allparts.insert(0, parts[0])
            break
        elif parts[1] == path: # sentinel for relative paths
            allparts.insert(0, parts[1])
            break
        else:
            path = parts[0]
            allparts.insert(0, parts[1])
    return allparts


skel = ElementTree.parse(sys.argv[1])
settings_files = sys.argv[2:]

collections = skel.find('.//ul[@id="collections"]')
for elem in collections.findall('./*'):
    collections.remove(elem)

for settings_file in settings_files:
    with open(settings_file) as f:
        settings = json.load(f)

    core_dir = splitall(settings_file)[1]
    core_name = settings[0]['collectionName'] or core_dir

    li = ElementTree.SubElement(collections, 'li')
    a = ElementTree.SubElement(li, 'a')
    a.set('href', core_dir)
    a.text = core_name

update_time = skel.find('.//span[@id="update-time"]')
update_time.text = datetime.now().isoformat()

skel.write(sys.stdout)
