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
Ext.define('SpWebPortal.view.AboutView', {
    extend: 'Ext.form.Panel',
    xtype: 'spwpaboutview',
    alias: 'widget.spwpabout',

    autoScroll: true,

    //localizable text...
    closeAboutBtnText: 'Close',
    //..localizable text


    initComponent: function() {
	var settings = Ext.getStore('SettingsStore').getAt(0);

        this.layout =  {
            type: 'vbox'
        };
        this.aboutDisplay = Ext.create('Ext.form.field.Display',{
            anchor: '100% 100%',
            autoScroll: false,
            width: 380,
            padding: '0 0 0 10',
            value: this.getAboutText('Specify Web Portal', settings.get('version'))
        });
        this.items =  [this.aboutDisplay];

	this.buttons = [Ext.create('Ext.button.Button', {
	    itemid: 'spwpcloseAboutbtn',
	    text: this.closeAboutBtnText,
	    handler: function() {
		this.up('window').close();
	    }
	})];
        this.anchor = '100% 100%';

 	this.callParent(arguments);
        this.aboutDisplay.update(this.getAboutText('Specify Web Portal', settings.get('version')));
   },

    
     /*
     * Returns a standard String for the about box
     * @param appNameArg the application name  
     * @param appVersionArg the application version
     * @return the about string
     * 
     * This is copied from the Specify6 java module edu.ku.brc.specify.Specify.getAboutText() 
     * and probably should be kept abreast with changes to that method. 
     */
    getAboutText: function(appNameArg, appVersionArg) {
        return "<html>"+appNameArg+" " + appVersionArg +  //$NON-NLS-1$ //$NON-NLS-2$
        "<br><br>Specify Collections Consortium<br>" +//$NON-NLS-1$
        "Biodiversity Institute<br>University of Kansas<br>1345 Jayhawk Blvd.<br>Lawrence, KS  USA 66045<br><br>" +  //$NON-NLS-1$
        "<a href=\"http://www.specifysoftware.org\">www.specifysoftware.org</a>"+ //$NON-NLS-1$
        "<br><a href=\"mailto:support@specifysoftware.org\">support@specifysoftware.org</a><br>" +  //$NON-NLS-1$
        "<p>The Specify Software Project is "+ //$NON-NLS-1$
        "funded by the Advances in Biological Informatics Program, " + //$NON-NLS-1$
        "U.S. National Science Foundation  (Grant NSF/BIO: 1565098 and earlier awards).<br><br>" + //$NON-NLS-1$
        "Copyright \u00A9 2020 University of Kansas Center for Research. " +
        "This software comes with ABSOLUTELY NO WARRANTY.<br><br>" + //$NON-NLS-1$
        "This is free software licensed under GNU General Public License 2 (GPL2).</P></html>"; //$NON-NLS-1$
    }

});
    
