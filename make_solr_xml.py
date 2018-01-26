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
from os.path import basename
from xml.etree import ElementTree

example_solr_xml = ElementTree.parse(sys.argv[1])
cores = example_solr_xml.find('cores')
for core in cores.findall('core'):
    cores.remove(core)

for core_dir in sys.argv[2:]:
    core_name = basename(core_dir)
    core = ElementTree.SubElement(cores, 'core')
    core.attrib.update({'name':core_name, 'instanceDir':core_name})

example_solr_xml.write(sys.stdout)
