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
