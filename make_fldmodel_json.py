import os
import sys
import json
from collections import OrderedDict

with open(sys.argv[1]) as f:
    fldmodel_in = json.load(f, object_pairs_hook=OrderedDict)

if os.path.isfile(sys.argv[2]):
    with open(sys.argv[2]) as f:
        custom = json.load(f, object_pairs_hook=OrderedDict)
else:
    custom = []

custom_map = {field['colname']: field for field in custom}


def munge(field):
    if field['colname'] not in custom_map:
        return field

    custom_fld = custom_map[field['colname']]
    field_out = field.copy()
    field_out.update(custom_fld)
    return field_out


fldmodel_out = [munge(field) for field in fldmodel_in]
print json.dumps(fldmodel_out, indent=4)
