import sys
import re
import json

with open(sys.argv[1]) as settings_file:
    settings = json.load(settings_file)

with open(sys.argv[2]) as instance_setting_file:
    instance_setting = instance_setting_file.read()

instance = re.findall('"portalInstance":"(.*)"', instance_setting)[0]

settings[0].update({
    'solrURL': '/specify-solr/',
    'portalInstance': instance,
    'solrPort': None,
    'solrCore': None,
})

print json.dumps(settings, indent=2)
