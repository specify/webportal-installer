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
Ext.define('SpWebPortal.model.SettingsModel', {
    extend: 'Ext.data.Model',
    fields: [
	{name: 'portalInstance', type: 'string', defaultValue: 'spwp'},
	{name: 'solrURL', type: 'string'},
	{name: 'solrPort', type: 'string'},
	{name: 'solrCore', type: 'string'},
	{name: 'solrPageSize', type: 'int', defaultValue: 50},
	{name: 'maxSolrPageSize', type: 'int', defaultValue: 5000},
	{name: 'imageBaseUrl', type: 'string'},
	{name: 'collectionName', type: 'string'},
        {name: 'collCodeSolrFld', type: 'string'},
	{name: 'imagePreviewSize', type: 'int', defaultValue: 200},  //when this setting is changed in settings.json, the height and width for *.tv-thumb should be set to about 7 px greater than this setting in resources/css/thumb-view.css
	{name: 'imageViewSize', type: 'int', defaultValue: 500}, //<= 0 for actual size
	{name: 'defInitialView', type: 'string', defaultValue: 'grid'},
	{name: 'defMapType', type: 'string', defaultValue: 'roadmap'},
	{name: 'backgroundURL', type: 'string', defaultValue: 'resources/images/specify128.png'},
	{name: 'bannerURL', type: 'string'},
	{name: 'bannerTitle', type: 'string', defaultValue: 'Specify Web Portal'},
	{name: 'bannerHeight', type: 'int', defaultValue: 120},
	{name: 'bannerWidth', type: 'int', defaultValue: 250},
	{name: 'imageInfoFlds', type: 'string'},
	{name: 'topBranding', type: 'string'},
	{name: 'topHeight', type: 'int'},
	{name: 'topMarginLeft', type: 'string'},
	{name: 'topMarginRight', type: 'string'},
	{name: 'topWidth', type: 'int'},
	{name: 'bottomBranding', type: 'string'},
 	{name: 'bottomHeight', type: 'int'},
	{name: 'bottomMarginLeft', type: 'string'},
	{name: 'bottomMarginRight', type: 'string'},
	{name: 'bottomWidth', type: 'int'},
	{name: 'imagePageSize', type: 'int', defaultValue: 100},
	{name: 'allowExportToFile', type: 'int', defaultValue: 1},
        {name: 'collections', type: 'json', defaultValue: []}
   ],

    validations: [
	{type: 'inclusion', field: 'defInitialView', list: ['grid', 'image', 'map']},
	{type: 'inclusion', field: 'defMapType', list: ['roadmap', 'satellite', 'hybrid', 'terrain']}
    ]
});
