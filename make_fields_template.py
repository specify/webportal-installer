import sys
import json
from collections import OrderedDict

EDITABLE_PROPS = [
    'title',
    'concept',
    'concepturl',
    'advancedsearch',
    'displaycolidx',
    'displaywidth',
    'hiddenbydefault',
    ]

def munge(field):
    result = OrderedDict((key, field[key])
                         for key in field
                         if key == "colname" or
                         key in EDITABLE_PROPS)

    if 'hiddenbydefault' not in result:
        result['hiddenbydefault'] = False

    return result



with open(sys.argv[1]) as f:
    fields_in = json.load(f, object_pairs_hook=OrderedDict)

fields_out = [munge(field)
              for field in fields_in
              if field["colname"] not in ("spid", "img")]

print json.dumps(fields_out, indent=4)
