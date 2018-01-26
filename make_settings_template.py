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
from collections import OrderedDict

USER_EDITABLE_SETTINGS = [
    'solrPageSize',
    'maxSolrPageSize ',
    'imagePreviewSize',
    'imageViewSize',
    'imagePreviewSize',
    'imageViewSize',
    'backgroundURL',
    'bannerURL',
    'bannerTitle',
    'bannerHeight',
    'bannerWidth',
    'imageInfoFlds',
]

with open(sys.argv[1]) as f:
    settings_in = json.load(f, object_pairs_hook=OrderedDict)[0]

settings_out = OrderedDict((key, settings_in[key])
                           for key in settings_in
                           if key in USER_EDITABLE_SETTINGS)

print json.dumps(settings_out, indent=4)
