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
Ext.define('SpWebPortal.model.FieldDefModel', {
    extend: 'Ext.data.Model',
    fields: [
	{name: 'colname', type: 'string'},
	{name: 'solrname', type: 'string'},
	{name: 'solrtype', type: 'string'},
	{name: 'solrtitle', type: 'string'},
	{name: 'title', type: 'string'},
	{name: 'type', type: 'string'},
	{name: 'width', type: 'int'},
	{name: 'concept', type: 'string'},
	{name: 'concepturl', type: 'string'},
	{name: 'sptable', type: 'string'},
	{name: 'sptabletitle', type: 'string'},
	{name: 'spfld', type: 'string'},
	{name: 'spfldtitle', type: 'string'},
	{name: 'spdescription', type: 'string'},
	{name: 'colidx', type: 'int'},
	{name: 'advancedsearch', type: 'boolean', defaultvalue: true},
	{name: 'displaycolidx', type: 'int'},
	{name: 'displaywidth', type: 'int', defaultvalue: 100},
	{name: 'hiddenbydefault', type: 'boolean', defaultvalue: false},
	{name: 'displayinmap', type: 'boolean', defaultvalue: true},
	{name: 'mapmarkertitle', type: 'boolean', defaultvalue: false},
	{name: 'treeid', type: 'string'},
	{name: 'treerank', type: 'int', defaultvalue: -1}
    ]
});

