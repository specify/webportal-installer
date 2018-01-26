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
import os
import re
import json

with open(sys.argv[1]) as settings_file:
    settings = json.load(settings_file)

if os.path.isfile(sys.argv[2]):
    with open(sys.argv[2]) as f:
        custom_settings = json.load(f)
else:
    custom_settings = {}

settings[0].update(custom_settings)

corename = sys.argv[3]

with open(sys.argv[4]) as instance_setting_file:
    instance_setting = instance_setting_file.read()


try:
    full_settings = json.loads(instance_setting)
except ValueError:
    instance = re.findall('"portalInstance":"(.*)"', instance_setting)[0]
    full_settings = {
        'portalInstance': instance,
        'collectionName': None,
    }

full_settings.update({
    'solrURL': '',     # Use relative path from index.html.
    'solrPort': None,  # Unused (should be part of URL).
    'solrCore': None,    # Use the core from the current path.
})

settings[0].update(full_settings)

print json.dumps(settings, indent=2)
