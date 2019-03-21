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
Ext.define('SpWebPortal.model.AttachedImageModel', {
    extend: 'Ext.data.Model',
    fields: [
	{name: 'AttachmentID', type: 'int'},
	{name: 'AttachedToTable', type: 'string'},
	{name: 'AttachedTo', type: 'string'},
	{name: 'AttachedToDescr', type: 'string'},
	{name: 'AttachmentLocation', type: 'string'},
        {name: 'CollName', type: 'string'},
	{name: 'ThumbSrc', type: 'string'},
	{name: 'StdSrc', type: 'string'},
	{name: 'Src', type: 'string'},
	{name: 'Title', type: 'string'},
	{name: 'Height', type: 'int'},
	{name: 'Width', type: 'int'}
    ]
});
