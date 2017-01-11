self.addEventListener('message', function(e) {
    var data = e.data;
    switch (data.cmd) {
    case 'start':
        var lo = data.lo;
        var hi = data.hi;
        var store = data.store;
        var f = data.f;
        for (var r = lo;  r < hi; r++) {
            var rec = store.getAt(r);
            f(rec);
        }
        self.postMessage('done');
    case 'stop':
        self.close();
    default:
        self.close();
    };
}, false);
