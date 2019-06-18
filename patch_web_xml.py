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
from lxml import etree

def add_init_param(element, name, value):
    param = etree.SubElement(element, 'init-param')
    n = etree.SubElement(param, 'param-name')
    n.text = name
    v = etree.SubElement(param, 'param-value')
    v.text = value

webxml = etree.parse(sys.argv[1])
root = webxml.getroot()
crfilter = etree.SubElement(root, 'filter')
fname = etree.SubElement(crfilter, 'filter-name')
fname.text = 'cross-origin'
fclass = etree.SubElement(crfilter, 'filter-class')
fclass.text = 'org.eclipse.jetty.servlets.CrossOriginFilter'
add_init_param(crfilter, 'allowedOrigins','http://localhost')
add_init_param(crfilter, 'allowedMethods', 'GET,POST,DELETE,PUT,HEAD,OPTIONS')
add_init_param(crfilter, 'allowedHeaders','origin, content-type, cache-control, accept, options, authorization, x-requested-with')
add_init_param(crfilter, 'supportsCredentials','true')
add_init_param(crfilter, 'chainPreflight','false')

crmapping = etree.SubElement(root, 'filter-mapping')
fname = etree.SubElement(crmapping, 'filter-name')
fname.text = 'cross-origin'
pattern = etree.SubElement(crmapping, 'url-pattern')
pattern.text = '/*'

root.insert(0, crfilter)
root.insert(1, crmapping)

# Done.

webxml.write(sys.stdout)
