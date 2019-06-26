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

Ext.define('SpWebPortal.controller.Image', {
    extend: 'Ext.app.Controller',

    //localizable text...
    selectedImage: 'Selected Image',
    previewTitle: 'Preview ({0} of {1} items)',
    previewTitleAll: 'Preview ({0} items)',
    moreItemsBtnText: 'Next {0} ...',
    moreItemsBtnPosText: '{0} of {1} items ',
    //...localizable text

    mainImgStore: null,
    requireImages: false,
    imgView: null,
    solrImgFl: null,
    thumb: null,
    lastSearchCancelled: false,
    mainImgRecords: [],
    imgsPerPage: null,
    getNextImageBatch: {},

    init: function() {
	var settings = Ext.getStore('SettingsStore').getAt(0);
	var attUrl = settings.get("imageBaseUrl");
	var attachmentsPresent = typeof attUrl === "string" && attUrl.length > 0;  
        this.imgsPerPage = settings.get("imagePageSize");
        if (!this.imgsPerPage || this.imgsPerPage == 0) {
            this.imgsPerPage = 100;
        }
	if (attachmentsPresent) {
	    this.control({
		'thumbnail': {
		    selectionchange: this.onSelectionChange
		},
		'#spwpmainpagingtoolbar': {
		    change: this.onPageChange
		},
		'#spwpmaintabpanel': {
		    tabchange: this.onTabChange
		    //dosearch: this.onDoSearch
		},
                'button[itemid="moreImagesBtn"]': {
                    click: this.moreImages
                }
	    });
	}

	this.superclass.init.apply(this, arguments);
    },

    onSelectionChange: function(dv, nodes) {
	var l = nodes.length,
        s = l !== 1 ? 's' : '';
	var v = dv.view;
	if (dv.getSelection().length > 0) {
	    /*
	    var img = dv.getSelection()[0];  //single selection
	    var imgView = v.up('panel').up('panel').down('image'); //not good enough for real-world
	    var pane = imgView.up('panel'); //not good enough for reality
	    //imgView.setSrc(this.getBaseUrl() + '/' + img.get('AttachmentLocation'));
	    imgView.setSrc(img.get('Src'));
	    var paneTitle = img.get('AttachedToDescr') + ' - ' + img.get('Title');
	    if (img.get('Width') != 0 && img.get('Height') != 0) {
		paneTitle +=  ' (' + img.get('Width') + ' x ' + img.get('Height') + ')';
	    } else {
		//I suspect that this will not consistently work. I don't think the setSrc method called
		//above is synchronous.
		paneTitle += ' (' + imgView.getWidth() + ' x ' + imgView.getHeight() + ')';
	    }
	    pane.setTitle(paneTitle);
	    */
	}
    },

    setupImgPreview: function(store) {
        if (store.getTotalCount() > this.imgsPerPage) {
            this.thumb.up('panel').setTitle(Ext.String.format(this.previewTitle, this.imgsPerPage, store.getTotalCount()));
        } else {
            this.thumb.up('panel').setTitle(Ext.String.format(this.previewTitleAll, store.getTotalCount()));
        }  
        
	var thbStore = this.thumb.getStore();
	thbStore.removeAll();
	var imgStore = this.imgView.getImageStore();
	imgStore.removeAll();

        //really paged
        var btnId = this.imgView.getMoreImagesBtnId(); 
        var moreImgBtn = Ext.getCmp(btnId);
        moreImgBtn.setVisible(true);
        var moreImgBtnPos = Ext.getCmp(btnId + 'posid');
        moreImgBtnPos.setVisible(true);
        //Having different batchers for different views is necessary in case paging is
        //implemented for detail image views
        this.getNextImageBatch.btnId = this.imageBatcher(moreImgBtn, moreImgBtnPos, store, 0).bind(this)();
    },	

    imageBatcher: function(btn, pos, store, invocations) {
        return function() {
            var lo = invocations * this.imgsPerPage;
            var hi = Math.min(lo + this.imgsPerPage, store.getCount());  
            for (var r = lo; r < hi; r++) {
                var rec = store.getAt(r);
                this.imgView.addImgForSpecRec(rec);
            }
            if (hi < store.getCount()) {
                btn.setText(Ext.String.format(this.moreItemsBtnText, Math.min(store.getCount() - hi, this.imgsPerPage)));
                pos.setText(Ext.String.format(this.moreItemsBtnPosText, hi, store.getTotalCount()));
                this.thumb.up('panel').setTitle(Ext.String.format(this.previewTitle, hi, store.getTotalCount()));
                return this.imageBatcher(btn, pos, store, invocations+1);
            } else {
                btn.setVisible(false);
                pos.setVisible(false);
                this.thumb.up('panel').setTitle(Ext.String.format(this.previewTitleAll, store.getTotalCount()));
                return null;
            }
        };
    },

    imageBatcherNew: function(btn, pos, store, invocations) {
        return function() {
            var lo = invocations * this.imgsPerPage;
            var hi = Math.min(lo + this.imgsPerPage, store.getCount());  
            var worker = new Worker("app/controller/ImgBatchWorker.js");
            worker.addEventListener('message', function(e){
                if (hi < store.getCount()) {
                    btn.setText(Ext.String.format(this.moreItemsBtnText, Math.min(store.getCount() - hi, this.imgsPerPage)));
                    pos.setText(Ext.String.format(this.moreItemsBtnPosText, hi, store.getTotalCount()));
                    this.thumb.up('panel').setTitle(Ext.String.format(this.previewTitle, hi, store.getTotalCount()));
                    worker.terminate();
                    return this.imageBatcherNew(btn, pos, store, invocations+1);
                } else {
                    btn.setVisible(false);
                    pos.setVisible(false);
                    this.thumb.up('panel').setTitle(Ext.String.format(this.previewTitleAll, store.getTotalCount()));
                    worker.terminate();
                    return null;
                }
            }, false);
            worker.postMessage({'lo': lo, 'hi': hi, 'store': store, 'f': this.imgView.addImgForSpecRec.bind(this.imgView)});
        };
    },
    
    moreImages: function(btn) {
        var btnId = btn.getId();
        if (this.getNextImageBatch.btnId) {
            this.getNextImageBatch.btnId = this.getNextImageBatch.btnId.bind(this)();
        }
    },
    
    onPageChange: function(pager) {
	//console.info('Image onPageChange()');
	if (this.imgView == null) {
	    this.imgView = pager.up('tabpanel').down('spimageview');
	}
	if (this.thumb == null) {
	    this.thumb = pager.up('tabpanel').down('spimageview').down('spthumbnail');
	}

	this.doImages();
    },

    setupToolbar: function(tabPanel, isMyTab, isPagedTab) {
	if (isMyTab) {
	    Ext.getCmp('spwpmainpagingtoolbar').setVisible(false);
	} else {
	    Ext.getCmp('spwpmainpagingtoolbar').setVisible(isPagedTab);
	}
    },

    onTabChange: function(tabPanel, newCard) {
	this.setupToolbar(tabPanel, newCard.id == 'spwpmainmappane', newCard.id == 'spwpmaingrid');
	if (this.imgView == null) {
	    this.imgView = tabPanel.down('spimageview');
	}
	if (this.thumb == null) {
	    this.thumb = tabPanel.down('spimageview').down('spthumbnail');
	}
        //this.doImages();
    },

    doImages: function() {
	var store = Ext.getStore('MainSolrStore');
	if (store.getSearched()) {
	    var fl = 'spid,';
	    if (this.mainImgStore == null) {
		var flds = [];
		var fld = {};
		Ext.apply(fld, {name: 'spid', type: 'string'});
		flds.push(fld);
		var imgDescFlds = this.imgView.getImgDescriptionFlds();
		for (var df = 0; df < imgDescFlds.length; df++) {
		    fld = {};
		    Ext.apply(fld, {name: imgDescFlds[df][1], type: imgDescFlds[df][2]});
		    flds.push(fld);
		    fl += imgDescFlds[df][1] + ",";
		}
		fld = {};
		Ext.apply(fld, {name: 'img', type: 'string'});
		flds.push(fld);
		fl += "img";
		this.solrImgFl = fl;
		Ext.define('SpWebPortal.MainImgModel', {
		    extend: 'Ext.data.Model',
		    fields: flds
		}),
		this.mainImgStore = Ext.create('Ext.data.Store', {
		    model: "SpWebPortal.MainImgModel",
		    pageSize: 10000,
                    /*
                    proxy: {
			type: 'jsonp',
			callbackKey: 'json.wrf',
			url: store.solrUrlTemplate,
			reader: {
			    root: 'response.docs',
			    totalProperty: 'response.numFound'
			}
		    }*/
                    proxy: {
	                type: 'ajax',
	                callbackKey: 'json.wrf',
	                url: solrUrlTemplate,
                        jsonData: true,
                        actionMethods: {
                            read: 'POST'
                        },
	                reader: {
	                    root: 'response.docs',
	                    totalProperty: 'response.numFound'
	                }
                    }
		});
	    }				 
	    var pageSize = store.pageSize;
	    var srchSpecs;
            /*
            if (!store.getImages()) {
		srchSpecs = store.getSearchSpecs4J(true, store.getMaps(), store.getMainTerm(), store.getFilterToMap(), store.getMatchAll());
		store.setImages(false);
	    } else {
                srchSpecs = {
		    url: store.getProxy().url,
                    query: store.getProxy().qparams.query
                };
                
	    }
             */
	    srchSpecs = store.getSearchSpecs4J(true, store.getMaps(), store.getMainTerm(), store.getFilterToMap(), store.getMatchAll(), undefined, false, true);
            
	    srchSpecs.url = srchSpecs.url.replace("rows="+pageSize, "rows="+this.mainImgStore.pageSize);
	    srchSpecs.url = srchSpecs.url.replace("fl=*", "fl="+this.solrImgFl); //XXX instead of cn need to add fields needed for customized image description settings
	    
	    //Only redo images if url/search has changed. This might not be completely
	    //safe. Currently Advanced and Express searches will re-execute even url is UN-changed.
	    //Technically, it would be better to track whether a search has been executed since last mapping.
	    if (srchSpecs.url != this.mainImgStore.getProxy().url || srchSpecs.query != this.mainImgStore.getProxy().qparams.query || this.lastSearchCancelled) {
		this.lastSearchCancelled = false;
		this.mainImgRecords = [];
		this.mainImgStore.getProxy().url = srchSpecs.url;
                this.mainImgStore.getProxy().qparams = {query: srchSpecs.query};
		this.loadMainImgStore(1);
	    }
	}

    },
    
    loadMainImgStore: function(page) {
	if (!this.lastSearchCancelled) {
	    this.mainImgStore.loadPage(page, {
		scope: this,
		callback: function(records) {
		    //console.info("MainImgStore loaded " + page + " with " + records.length + " of " + this.mainImgStore.getTotalCount() + " records.");
		    if (page == 1) {
			//this.clearMarkers2();
			//this.progBar.updateProgress(0.0);
		    }
		    //this.loadingBtn.setLoading(false);
		    if (!this.lastSearchCancelled) {
			this.setupImgPreview(this.mainImgStore);
		    }
		}
	    });
	}
	
    }

});
