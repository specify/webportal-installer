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
