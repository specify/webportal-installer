Ext.define('SpecRec', {
    extend: 'Ext.data.Model',
    fields:[
	{name: 'catalognumber', type: 'string'},
	{name: 'family', type: 'string'},
	{name: 'year', type: 'string'},
	{name: 'country', type: 'string'},
	{name: 'StartDateCollected', type: 'string'},
	{name: 'StationFieldNumber', type: 'string'},
	{name: 'taxon', type: 'string'},
	{name: 'Latitude1', type: 'string'},
	{name: 'Longitude1', type: 'string'},
	{name: 'LocalityName', type: 'string'},
	{name: 'geography', type: 'string'},
	{name: 'PrimaryCollector', type: 'string'},
	{name: 'image', type: 'string'}
    ] 
});
