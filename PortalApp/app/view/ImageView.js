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
"use strict";
/*
* SpWebPortal.view.ImageView
*
*Displays image thumbnails. Used on main images tab and image tab for details windows.
*
*/
Ext.define('SpWebPortal.view.ImageView', {
    extend: 'Ext.panel.Panel',
    xtype: 'spimageview',
    alias: 'widget.imageview',

    //localizable text...
    previewTitle: 'Preview',
    selectedTitle: 'Selected Image',
    thumbPagerDisplayMsg: 'Displaying images {0} - {1} of {2}',
    thumbPagerEmptyMsg: 'Nothing to see here',
    moreItems: 'More Items',
    
    //...localizable text

    layout: 'border',
    
    requires: [
	'SpWebPortal.view.ThumbnailView',
	'SpWebPortal.model.AttachedImageModel'
    ],

    config: {
	imageStore: null,
   	baseUrl: '',
	previewSize: 200,
	viewSize: 500,
	imgServerResponse: null,
	imgServerError: null,
	imgDescriptionFlds: null,
	collectionName: null,
        moreImagesBtnId: null,
        collIdFld: null
    },

    collList: {},
    urlList: {},
    
    initComponent: function() {

	this.setImageStore(Ext.create('Ext.data.Store', {
	    model: 'SpWebPortal.model.AttachedImageModel',
	    getTotalCount: function() {
		if (typeof this.data === "undefined" || this.data == null
		    || typeof this.data.items === "undefined" || this.data.items == null){
		    return 0;
		} else {
		    return this.data.items.length;
		}
	    }
	}));

        //ensure unique ids for popup window image views
        this.moreImagesBtnId = 'spwpmoreimagesbtn';
        var n = 2;
        while (Ext.getCmp(this.moreImagesBtnId) && n < 666) {
            this.moreImagesBtnId = 'spwpmoreimagesbtn' + n++;
        }
	var cmps = [];
        
	cmps[0] = Ext.create('Ext.panel.Panel', {
	    title: this.previewTitle,
	    region: 'center',
	    //width: 300,
	    autoScroll: true,
	    items: Ext.create('SpWebPortal.view.ThumbnailView', {
		//store: thumbStore
		store: this.getImageStore()
	    }),
	    bbar: [
                {
                    xtype: 'tbfill'
                },
                {
                    xtype: 'tbtext',
                    text: '',
                    id: this.moreImagesBtnId + 'posid',
                    hidden: true
                },
                {
	            xtype: 'button',
	            itemid: 'moreImagesBtn',
 	            text: this.moreItems,
                    id: this.moreImagesBtnId,
                    hidden: true
	        }
	    ]
	});

	this.items = cmps;

	var settingsStore =  Ext.getStore('SettingsStore');
	var settings = settingsStore.getAt(0);
	this.setCollectionName(settings.get('collectionName'));
	this.setBaseUrl(settings.get('imageBaseUrl'));
        this.setCollSettings(settings);
	this.setImgDescriptionFlds(this.initImgDescFlds(settings.get('imageInfoFlds')));
	this.setPreviewSize(settings.get('imagePreviewSize'));
	this.setViewSize(settings.get('imageViewSize'));

	//this.callParent(arguments);
	this.superclass.initComponent.apply(this, arguments);

    },

    setCollSettings: function(settings) {
        var colls = settings.get('collections');
        for (var i = 0; i < _.size(colls); i++) {
            this.collList[colls[i]['code']] = colls[i]['collname'];
            if (colls[i]['attachmentbaseurl']) {
                this.urlList[colls[i]['collname']] = colls[i]['attachmentbaseurl'];
            }
        };
        this.collIdFld = settings.get('collCodeSolrFld');
    },
    
    initImgDescFlds: function(fldStr) {
        console.info("initImgDescFlds -" + fldStr);
        var result =  [];
	if (typeof fldStr === "undefined" || fldStr ==  null || fldStr == '') {
	    result = this.getDefaultImgDescFlds();
	} else {
	    var flds = fldStr.split(' ');
	    var fldStore = Ext.getStore('FieldDefStore');
	    for (var f = 0; f < flds.length; f++) {
		var def4f = null;
		for (var d = 0; d < fldStore.count(); d++) {
		    if (fldStore.getAt(d).get('solrname') == flds[f]) {
			def4f = fldStore.getAt(d);
			break;
		    }
		}
		if (def4f != null) {
		    result.push([def4f.get('title'), flds[f], def4f.get('solrtype')]);
		} else {
		    console.info("error reading imageInfoFlds settings. Unable to locate '" + flds[f] + "'. Reverting to default.");
		    result = this.getDefaultImgDescFlds();
		    break;
		}
	    }
	}
        if (this.getCollIdFld()) {
            result.push(['CollId', this.getCollIdFld(), 'string']);
        }
	return result;
    },

    getDefaultImgDescFlds: function() {
	//Use catalognumber and taxon fullname, if possible
	var result = [];
	var fldStore = Ext.getStore('FieldDefStore');
	for (var f = 0; f < fldStore.count(); f++) {
	    var def = fldStore.getAt(f);
	    var tbl = def.get('sptable');
	    var fld = def.get('spfld');
	    if ('collectionobject' == tbl && 'catalogNumber' == fld) {
		result.push([def.get('title'), def.get('solrname'), def.get('solrtype')]);
	    } else if ('taxon' == tbl && 'fullName' == fld) {
		result.push([def.get('title'), def.get('solrname'), def.get('solrtype')]);
	    }
	}
	return result;
    },

    getDescription: function(record) {
	//XXX use configged fields to build description
	//return record.get('cn');
	var result = '';
	for (var f=0; f < this.getImgDescriptionFlds().length; f++) {
	    var fld = this.getImgDescriptionFlds()[f];
	    if (f > 0) {
		result += "\n";
	    }
	    result += fld[0] + ": " + record.get(fld[1]);
	}
	//console.info(result);
	return result;
    },

    addImgForSpecRec: function(record) {
	var imgJson = record.get('img');
	if (imgJson != null && imgJson != '') {
	    var attachedTo = record.get('spid');
	    var attachedToDescr = this.getDescription(record);
            var collName = this.getCollNameForRec(record);
	    return this.addImg(imgJson, attachedTo, attachedToDescr, collName);
	} else {
	    return 0;
	}
    },

    getCollNameForRec: function(record) {
        return this.getCollNameForId(record.get(this.getCollIdFld()));
    },

    getCollNameForId: function(collId) {
        var result;
        if (_.size(this.collList) > 0 && typeof collId !== "undefined") {
            result = this.collList[collId];
        }
        return typeof result !== "undefined" ? result : this.getCollectionName();
    },
    
    addImg: function(imgJson, attachedTo, attachedToDescr,collName) {
	if (imgJson != null && imgJson != '') {
	    var imgs = Ext.JSON.decode(imgJson);
            var coll = typeof collName === "undefined" ? this.getCollectionName() : collName;
	    for (var i = 0; i < imgs.length; i++) {
		Ext.apply(imgs[i], {
		    AttachedTo: attachedTo,
		    AttachedToDescr: attachedToDescr,
                    CollName: coll
		});
		this.getImgSrc(imgs[i]['AttachmentLocation'], this.getPreviewSize(), coll, 'ThumbSrc', imgs[i], true);
	    }
	    return imgs.length;
	} else {
	    return 0;
	}
    },


    getAttachmentBaseUrl: function(coll) {
        var result;
        if (_.size(this.urlList) > 0 && typeof coll !== "undefined") {
            result = this.urlList[coll];
        }
        return typeof result !== "undefined" ? result : this.getBaseUrl();
    },
    
    getImgSrc: function(fileName, scale, coll, srcFld, img, addToStore, callbackFn, callbackArgs) {
	var url = this.getAttachmentBaseUrl() + '/fileget';
	this.imgServerResponse = null;
	this.imgServerError = null;
	Ext.Ajax.method = 'GET';
	var params;
	if (scale != null && scale > 0) {
	    params =  {
		coll: coll,
		type: 'T',
		filename: fileName,
		scale: scale
	    };
	} else {
	    params =  {
		coll: coll,
		type: 'O',
		filename: fileName
	    };
	}
	this.waitingForImgUrl = true;
	var src = url + '?' + $.param(params);
	if (!addToStore) {
	    img.set(srcFld, src);
	} else {
	    if (srcFld == "ThumbSrc") {
		Ext.apply(img, {
		    ThumbSrc: src
		});
	    } else if (srcFld == "StdSrc") {
		Ext.apply(img, {
		    StdSrc: src
		});
	    } else if (srcFld == "Src") {
		Ext.apply(img, {
		    Src: src
		});
	    }
	    this.getImageStore().add(img);
	}
	if (typeof callbackFn !== "undefined" && callbackFn != null) {
	    callbackFn(img, callbackArgs);
	}                
    }

});
