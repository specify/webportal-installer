/* Copyright (C) 2020, Specify Collections Consortium
 * 
 * Specify Collections Consortium, Biodiversity Institute, University of Kansas,
 * 1345 Jayhawk Boulevard, Lawrence, Kansas, 66045, USA, support@specifysoftware.org
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
