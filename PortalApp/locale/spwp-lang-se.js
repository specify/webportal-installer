//Views 

Ext.define("SpWebPortal.locale.se.view.AdvancedSearchView", {
    override: "SpWebPortal.view.AdvancedSearchView",

    advancedSearchTitle: 'Avancerad',
    matchAny: 'Nagon',
    matchAll: 'All',
    searchBtn: 'Sök'
});

Ext.define("SpWebPortal.locale.se.view.DetailsPanel", {
    override: "SpWebPortal.view.DetailsPanel",
    
    detailPagerDisplayMsg: 'Visar postern {0} av {2}',
    detailPagerEmptyMsg: 'Inga poster att visa',
    detailDetailTitle: 'Utforlig',
    detailGridTitle: 'Posterna',
    pagerDisplayMsg: 'Visar posterna {0} - {1} av {2}',
    pagerEmptyMsg: 'Inga poster att visa',
    recordText: 'postern'
});

Ext.define("SpWebPortal.locale.se.view.ExpressSearchView", {
    override: "SpWebPortal.view.ExpressSearchView",

    expressSearchTitle: 'Uttrycker',
    searchBtnHint: 'Ange en sökning en term',
    matchAny: 'Nagon',
    matchAll: 'All'
});

Ext.define("SpWebPortal.locale.se.view.ImageView", {
    override: "SpWebPortal.view.ImageView",

    previewTitle: 'Förhandsgranskning',
    selectedTitle: 'Valda bilden',
    thumbPagerDisplayMsg: 'Displaying images {0} - {1} of {2}',
    thumbPagerEmptyMsg: 'No images to display'
});

Ext.define("SpWebPortal.locale.se.view.ImageSingleView", {
    override: "SpWebPortal.view.ImageSingleView",

    specimenBtnTxt: 'Associated Specimens',
    specimenBtnTip: 'View specimen(s) associated with this image',
    imageDetailBtnTxt: 'Image Details',
    imageDetailBtnTip: 'View image details',
    viewActualBtnText: 'Standard size',
    viewStdBtnText: 'Actual size',
    viewActualBtnTip: 'Click to view standard size',
    viewStdBtnTip: 'Click to view actual size'
});

Ext.define("SpWebPortal.locale.se.view.MainGrid", {
    override: "SpWebPortal.view.MainGrid",

    mapBtnHint: "karta",
    detailsBtnHint: "utforlig"
});

Ext.define("SpWebPortal.locale.se.view.SettingsView", {
    override: "SpWebPortal.view.SettingsView",
    
    saveSettingsBtn: "Spara"

});

Ext.define("SpWebPortal.locale.se.view.ThumbnailView", {
    override: "SpWebPortal.view.ThumbnailView",

    emptyText: 'Inga bilder för att visa'
});

Ext.define("SpWebPortal.locale.se.view.Viewport", {
    override: "SpWebPortal.view.Viewport",

    viewportTitle: 'Portalen',
    recordsTitle: 'Posterna',
    imagesTitle: 'Bilder',   
    mapsTitle: 'Karta', 
    pagerDisplayMsg: 'Visar posterna {0} - {1} av {2}',
    pagerEmptyMsg: 'Inga poster att visa',
    searchToolsTitle: 'Sökverktyg',
    mapsCheckBox: 'Geo Coords',
    mapsCheckBoxTip: 'Check to select only records with geo-coordinates',
    imagesCheckBox: 'Bilder',
    imagesCheckBoxTip: 'Check to select only records with images',
    settingsBtnTip: 'Inställningar',
    fitToMapCheckBox: 'Karta',
    fitToMapCheckBoxTip: 'Check to apply search criteria within map region',
    mapSearchBtn: 'Search',
    mapSearchBtnTip: 'Apply search criteria to map region',
    mapCancelBtn: 'Avbestalla',
    mapCancelBtnTip: 'Stop plotting the current results'
});


//Controllers

Ext.define("SpWebPortal.locale.se.controller.Detailer", {
    override: "SpWebPortal.controller.Detailer",

    detailPopupTitle: 'Utforlig'

});

Ext.define("SpWebPortal.locale.se.controller.Image", {
    override: "SpWebPortal.controller.Image",

    selectedImage: 'Valda bilden',
    previewTitle: 'Förhandsgranskning (sida {0} av {1})'
});

Ext.define("SpWebPortal.locale.se.controller.Mapper", {
    override: "SpWebPortal.controller.Mapper",

    mapTitle: 'Karta',
    noGeoCoordMsg: 'Geo coords are not present for this record',
    mapResultsText: 'Mapped {0} records at {1} points.',
    mapProgressText:'{0} - {1} av {2}',
    simpleMapProgressText: 'Mapping {0} records',
    mapCancelledText: 'Mapping cancelled',
    loadingGeoCoordsText: 'Loading geocoordinates'
});

Ext.define("SpWebPortal.locale.se.controller.Settings", {
    override: "SpWebPortal.controller.Settings",

    settingsFormTitle: 'Inställningar',
    invalidPageSizeErrMsg: 'Invalid page size:{0}. Pagesize must be a number between 1 and {1}'
});
