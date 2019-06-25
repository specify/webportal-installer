Ext.override(Ext.data.proxy.Ajax, {
                
            doRequest: function(operation, callback, scope) {
                var writer  = this.getWriter(),
                    request = this.buildRequest(operation, callback, scope);
                
                if (operation.allowWrite()) {
                    request = writer.write(request);
                }
                
                Ext.apply(request, {
                    headers       : this.headers,
                    timeout       : this.timeout,
                    scope         : this,
                    callback      : this.createRequestCallback(request, operation, callback, scope),
                    method        : this.getMethod(request),
                    disableCaching: false // explicitly set it to false, ServerProxy handles caching
                });
                
                //Added... jsonData is handled already
                if(this.jsonData) {
                    request.jsonData = Ext.encode(request.params);
                    delete request.params;
                }
                
                Ext.Ajax.request(request);
                
                return request;
            }
        });
