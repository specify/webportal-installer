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
from os.path import basename
from xml.etree import ElementTree

example_solr_xml = ElementTree.parse(sys.argv[1])
cores = example_solr_xml.find('cores')
for core in cores.findall('core'):
    cores.remove(core)

"""From server/solr/README.txt: "In addition, you can also declare Solr cores in this file, however
it is recommended to just use automatic core discovery instead of
listing cores in solr.xml."

So skip adding entries for the web portal cores, and we probably don't even to bother with the core removal above,

for core_dir in sys.argv[2:]:
    core_name = basename(core_dir)
    core = ElementTree.SubElement(cores, 'core')
    core.attrib.update({'name':core_name, 'instanceDir':core_name})
"""

example_solr_xml.write(sys.stdout)
