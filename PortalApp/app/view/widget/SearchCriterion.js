Ext.define('SpWebPortal.view.widget.SearchCriterion', {
    extend: 'Ext.panel.Panel',
    requires: [
	'SpWebPortal.store.FieldDefStore'
    ],
    layout: {
        align: 'flex',
        type: 'hbox'
    },

    xtype: 'spsearchcriterion',

    config: {
	isText: true
    },

    fulltext: '?',
    
    entries: function() {
	var items = this.query('textfield');
	var item1 = items[0];
	var item2 = items[1];
	var len = 0;
	var result = null;
	if (item1 != null && item1.value != null && item1.value.length > 0) len++;
	if (item2 != null && item2.value != null && item2.value.length > 0) len++;
	if (len > 0) {
	    result = new Array(len);
	    var l = 0;
	    if (item1 != null && item1.value != null && item1.value.length > 0) {
		result[l++] = item1.value;
	    }
	    if (item2 != null && item2.value != null && item2.value.length > 0) {
		result[l] = item2.value;
	    }
	    
	}
	return result;
    },

    sqlPhpFilter: function() {
	var entries = this.entries();
	var result = '';
	if (entries != null && entries.length > 0) {
	    var opId = '#' + this.itemid + '-op';
	    var op = this.query(opId)[0].value;
	    var paramStr = '';
	    if (op == 'between') {
		if (!(entries.length > 1)) {
		    var fldName = this.down('textfield').getFieldLabel();
		    alert('missing second entry for "' + fldName + '"');
		    return 'error';
		} else {  
		    paramStr = this.getEntry(entries[0]) + ' AND ' + this.getEntry(entries[1]);
		} 
	    } else if (op == 'in') {
		paramStr = '(' + this.getEntry(entries[0]) + ')';
	    } else {
		paramStr = this.getEntry(entries[0]);
	    }

	    if (paramStr != '') {
		var notId = '#' + this.itemid + '-not';
		var no = this.query(notId)[0].bang;
		result = '{"property":"' + this.itemid + '","operator":"' + op + '","params":"' + paramStr + '","no":"' + no + '"}';
	    }
	}
	return result;
    },

    solrFilter: function(matchAll, searcher) {
	var entries = this.entries();
	var result = '';
	if (entries != null && entries.length > 0) {
	    var opId = '#' + this.itemid + '-op';
	    var op = this.query(opId)[0].value;
	    result = searcher.escapeForSolr(entries[0], this.isFullText());
	    if (op == '<=') {
		result = '[* TO ' + result + ']';
	    } else if (op == '>=') {
		result = '[' + result + ' TO *]';
	    } else if (op == 'contains') {
		result = '*' + result + '*';
	    } else if (op == 'containsany') {
		var terms = result.split(' ');
		result = '';
		for (var t = 0; t < terms.length; t++) {
		    if (t > 0) {
			result += ' OR ';
		    }
		    result += '*' + terms[t] + '*';
		}   
	    } else if (op == 'between') {
		if (!(entries.length > 1)) {
		    var fldName = this.down('textfield').getFieldLabel();
		    alert('missing second entry for "' + fldName + '"');
		    return "error";
		} else {  
		    result2 = entries[1].toLowerCase();
		    result = '[' + result + ' TO ' + result2 + ']';
		}
	    } else if (op == 'in') {
		var listItems = entries[0].split(" ");
		var sep = " ";
		if (matchAll) {
		    sep += "OR ";
		}
		result = "(";
		for (i = 0; i < listItems.length; i++){
		    if (i > 0) {
			result += sep;
		    }
		    result += listItems[i].toLowerCase();
		}
		result += ")";
	    }
	    result = this.itemid + ':' + result;
	    var notId = '#' + this.itemid + '-not';
	    var bang = this.query(notId)[0].bang;
	    if (bang) {
		result = '(*:* NOT ' + result + ')';
	    }
	}
	return result;
    },

    getEntry: function (entry) {
	if (!this.isText) {
	    return entry;
	} else {
	    return "'" + entry.replace("'", "''") + "'";
	}
    },

    isFullTextFld: function(fld) {
	//XXX need to add a way to configure this, and other stuff
	//cheap fix for cases people have complained about
        //this function needs to produce same results as Sp6's ExportMappingInfo.isFullTextSearch() method
	var fldName = fld.get('spfld');
	return fldName.indexOf("number") == -1 //StationFieldNumber, CatalogNumber, FieldNumber, ...
	    && fldName.indexOf("date") == -1 //StartDate, EndDate, ... 
	    && fldName.indexOf("timestamp") != 0
	    && fldName.toLowerCase() != "guid";  
    },
    
    isFullText: function() {
        if (this.fulltext == '?') {
	    var fieldStore = Ext.getStore('FieldDefStore');
	    for (var c = 1; c < fieldStore.count(); c++) {
	        var fld = fieldStore.getAt(c);
	        if (this.itemid == fld.get('solrname')) {
                    if (this.isFullTextFld(fld)) {
                        this.fulltext = 'true';
                    } else {
                        this.fulltext = 'false';
                    }
                    break;
	        }
	    }		 
        }
        return this.fulltext == 'true' ? true : false;
    }
});
