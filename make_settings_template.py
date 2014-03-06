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
