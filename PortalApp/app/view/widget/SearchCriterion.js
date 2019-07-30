/* Copyright (C) 2018, University of Kansas Center for Research
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
*/
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
        return this.isFullText() ? this.solrFilterText(matchAll, searcher) : this.solrFilterNonText(searcher);
    },

    solrFilterNonText: function(searcher) {
	var entries = this.entries();
	var result = '';
        var includeItemId = true;
	if (entries != null && entries.length > 0) {
	    var opId = '#' + this.itemid + '-op';
	    var op = this.query(opId)[0].value;
            var terms = searcher.getSubTerms(entries[0], op.startsWith('contain'), op != 'containsany' && op != 'in');
            for (var t = 0; t < terms.length; t++) {
                terms[t] = searcher.escapeForSolr(terms[t], false, '"');
            }
            result = searcher.escapeForSolr(entries[0], false);
            if (terms.length > 1) {
                result = '"' + result + '"';
            }
	    if (op == '<=') {
		result = '[* TO ' + result + ']';
	    } else if (op == '>=') {
		result = '[' + result + ' TO *]';
	    } else if (op == 'contains') {
                includeItemId = false;
                result = this.listTerms(' AND ', true, 'all', terms);		
	    } else if (op == 'containsany') {
                includeItemId = false;
                result = this.listTerms(' OR ', true, 'all', terms);
	    } else if (op == 'between') {
		if (!(entries.length > 1)) {
		    var fldName = this.down('textfield').getFieldLabel();
		    alert('missing second entry for "' + fldName + '"');
		    return "error";
		} else {  
                    var result2 = entries.length > 1 ? searcher.escapeForSolr(entries[1], false) : '';
		    result = '[' + result + ' TO ' + result2 + ']';
		}
	    } else if (op == 'in') {
                result = this.listTerms(' OR ', true, false, terms);
                includeItemId = false;
	    }
	    result = (includeItemId ? this.itemid + ':' : '') + result;
	    var notId = '#' + this.itemid + '-not';
	    var bang = this.query(notId)[0].bang;
	    if (bang) {
		result = '(*:* NOT ' + result + ')';
	    }
	}
	return result;
    },
    
    solrFilterText: function(matchAll, searcher) {
	var entries = this.entries();
        var result = '';
	if (entries != null && entries.length > 0) {
	    var opId = '#' + this.itemid + '-op';
	    var op = this.query(opId)[0].value;
            result = searcher.getSrchQuery(entries[0], op != 'containsany', this.fld.get('solrname'));
        }
        return result;
    },

    getWildCard: function(len, idx, wildCard, pos) {
        if (wildCard == 'all') {
            return true;
        } else if (wildCard == 'start-end') {
            return (idx == 0 && pos == 'pre') || (idx == len-1 && pos == 'post'); 
        } else {
            return '';
        }
    },
    
    listTerms: function(separator, includeItemId, wildCard, listItems) {
	var result = "(";
        var len = listItems.length;
	for (var i = 0; i < listItems.length; i++){
	    if (i > 0) {
		result += separator;
	    }
	    result += (includeItemId ? this.itemid + ':' : '')
                + (this.getWildCard(len, i, wildCard, 'pre') ? '*' : '')
                + listItems[i]
                + (this.getWildCard(len, i, wildCard, 'post') ? '*' : '');
	}
	return result += ")";
    },
            
    getEntry: function(entry) {
	if (!this.isText) {
	    return entry;
	} else {
	    return "'" + entry.replace("'", "''") + "'";
	}
    },

    isFullTextFld: function(fld) {
        return fld.get('solrtype').indexOf("text_") == 0;
    },
    
    isFullText: function() {
        if (this.fulltext == '?') {
            if (this.isFullTextFld(this.fld)) {
                this.fulltext = 'true';
            } else {
                this.fulltext = 'false';
            }
        }
        return this.fulltext == 'true' ? true : false;
    }
});
