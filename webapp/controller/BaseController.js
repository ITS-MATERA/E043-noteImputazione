sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/UIComponent",
	"sap/m/library",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
], function (Controller, UIComponent, mobileLibrary, Filter, FilterOperator) {
	"use strict";

	// shortcut for sap.m.URLHelper
	var URLHelper = mobileLibrary.URLHelper;

	return Controller.extend("project1.controller.BaseController", {
		/**
		 * Convenience method for accessing the router.
		 * @public
		 * @returns {sap.ui.core.routing.Router} the router for this component
		 */
		getRouter: function () {
			return UIComponent.getRouterFor(this);
		},

		/**
		 * Convenience method for getting the view model by name.
		 * @public
		 * @param {string} [sName] the model name
		 * @returns {sap.ui.model.Model} the model instance
		 */
		getModel: function (sName) {
			return this.getView().getModel(sName);
		},

		/**
		 * Convenience method for setting the view model.
		 * @public
		 * @param {sap.ui.model.Model} oModel the model instance
		 * @param {string} sName the model name
		 * @returns {sap.ui.mvc.View} the view instance
		 */
		setModel: function (oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},

		/**
		 * Getter for the resource bundle.
		 * @public
		 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
		 */
		getResourceBundle: function () {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},

		isUserEnabled: function (array, param, value) {
			return array.filter((x) => x[param] === value).length > 0;
		},

		formateDateForFilter(dateValue){
			var self =this,
				value,
				day,
				month,
				stringDay,
				stringMonth;	
			
			day = dateValue.getDate();
			if(day<10){
				stringDay = "0" + day.toString();
			}else		
				stringDay = day.toString();		

			month=dateValue.getMonth()+1;
			if(month<10){
				stringMonth = "0" + month.toString();
			}else
				stringMonth = month.toString();

			value = dateValue.getFullYear().toString() + "-" + stringMonth + "-" + stringDay;
			return value;
		},

		openDialog: function (dialogPath) {
            if (!this.__dialog) {
                this.__dialog = sap.ui.xmlfragment(dialogPath, this);
                this.getView().addDependent(this.__dialog);
            }
            return this.__dialog;
        },
        closeDialog: function() {
            if (this.__dialog) {
                if( this.__dialog.close ) {
                    this.__dialog.close();
                }
                this.__dialog.destroy();
                this.__dialog = null;
            }
        },

		handleValueHelp: function(oEvent){
            var oSource = oEvent.getSource(),
                oValue= oSource.getValue(),
				oSelectedItem = oEvent.getParameter("selectedItem"),
            	sField = oEvent.getSource().data("filterTableField"),
                sName = oSource.data("FieldName");
				
            var oDialog = this.openDialog("project1.fragment.Help."+sField).open();
        },

        _handleValueHelpSetValueClose : function (evt) {
            var that = this,
            oSelectedItem = evt.getParameter("selectedItem"),
            sField = evt.getSource().data("filterTableField"),
            Input = this.getView().byId(sField);
            if (oSelectedItem) {            
                var sValueTitle = oSelectedItem.getTitle();
                Input.setValue(sValueTitle);
                this.getOtherData(sValueTitle);
            }
            this.closeDialog();
        },

		_handleValueHelpValueClose : function (evt) {
            var that = this,
            oSelectedItem = evt.getParameter("selectedItem"),
            sField = evt.getSource().data("filterTableField"),
            Input = this.getView().byId(sField);
            if (oSelectedItem) {            
                var sValueTitle = oSelectedItem.getTitle();
                Input.setValue(sValueTitle);
                //this.getOtherData(sValueTitle);
            }
            this.closeDialog();
        },

		_handleValueHelpClose : function (evt) {
            var that = this,
            oSelectedItem = evt.getParameter("selectedItem"),
            sField = evt.getSource().data("filterTableField"),
            Input = this.getView().byId(sField);
            if (oSelectedItem) {            
                var sValueTitle = oSelectedItem.getTitle();
                Input.setValue(sValueTitle);
            }
            this.closeDialog();
        },





		onSelectPosFin:function(oEvent){
			var self = this;
			console.log(oEvent);
		},

		callVisibilitaWithCallback:function(callback){
			var self =this,
				filters = [];
	
			filters.push(
				new Filter({ path: "SEM_OBJ", operator: FilterOperator.EQ, value1: "ZS4_NOTEIMPUTAZIONI_SRV" }),
				new Filter({ path: "AUTH_OBJ", operator: FilterOperator.EQ, value1: "Z_GEST_NI" })
			)
			self.getOwnerComponent().getModel("ZSS4_CA_CONI_VISIBILITA_SRV").read("/ZES_CONIAUTH_SET", {
				filters: filters,        
				success: function (data) {
						console.log("success");
						self.getView().getModel(WIZARD_ENTITIES_MODEL).setProperty("/Visibilita", data.results);
						callback(true);
						// self.getView().getModel("temp").setProperty('/Visibilita', data.results)
						//self.pulsantiVisibiltà(data.results)
					},
				error: function (error) {
					console.log(error)
					var e = error;
					callback(false);
				}   
			});
		},

		callPreventVisibilitaWithCallback:function(callback){
			var self =this,
				filters = [];
	
			filters.push(
				new Filter({ path: "SEM_OBJ", operator: FilterOperator.EQ, value1: "ZS4_NOTEIMPUTAZIONI_SRV" }),
				new Filter({ path: "AUTH_OBJ", operator: FilterOperator.EQ, value1: "Z_GEST_NI" })
			)
			self.getOwnerComponent().getModel("ZSS4_CA_CONI_VISIBILITA_SRV").read("/ZES_CONIAUTH_SET", {
				filters: filters,        
				success: function (data) {
						console.log("success");
						self.getOwnerComponent().getModel("temp").setProperty("/Visibilità", data.results);
						callback(true);
					},
				error: function (error) {
					console.log(error)
					var e = error;
					self.getOwnerComponent().getModel("temp").setProperty("/Visibilita", []);
					callback(false);
				}   
			});
		},

		getDescCapDescPG:function(gjahr,fipex,callback){
			var self =this,
				filters = [];
			
			self.getOwnerComponent().getModel().read("/ZamministrNiSet", {
				success: function (data) {
					self.getView().getModel("temp").setProperty('/ZamministrNiSet', data.results)
					filters.push(
						new Filter({ path: "Gjahr", operator: FilterOperator.EQ, value1: gjahr }),
						new Filter({ path: "Zamministr", operator: FilterOperator.EQ, value1: data.results[0].Zamministr }),
						new Filter({ path: "Fipex", operator: FilterOperator.EQ, value1: fipex })
					);
					self.getOwnerComponent().getModel().read("/DescPgCapSet", {
						filters:filters,
						success: function(data, oResponse){
              callback({success:true,entity:data && data.results.length>0 ? data.results[0]: null});
						},
						error: function(error){
						  console.log(error);
						  callback({success:false,entity:null});
						}
					});					
				},
				error: function (error) {
					console.log(error);
					callback({success:false,entity:null});
				}
			});
		},


		/**
		 * Event handler when the share by E-Mail button has been clicked
		 * @public
		 */


		/**
		 * Adds a history entry in the FLP page history
		 * @public
		 * @param {object} oEntry An entry object to add to the hierachy array as expected from the ShellUIService.setHierarchy method
		 * @param {boolean} bReset If true resets the history before the new entry is added
		 */


	});

});