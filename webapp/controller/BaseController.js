sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/m/library",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "project1/model/DateFormatter",
    "sap/ui/export/Spreadsheet",
  ],
  function (
    Controller,
    UIComponent,
    mobileLibrary,
    Filter,
    FilterOperator,
    DateFormatter,
    Spreadsheet
  ) {
    "use strict";

    // shortcut for sap.m.URLHelper
    var URLHelper = mobileLibrary.URLHelper;
    var EdmType = sap.ui.export.EdmType;
    return Controller.extend("project1.controller.BaseController", {
      formatter: DateFormatter,
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

      formateDateForFilter(dateValue) {
        var self = this,
          value,
          day,
          month,
          stringDay,
          stringMonth;

        if (!dateValue) {
          return;
        }

        dateValue = new Date(dateValue);
        day = dateValue.getDate();
        if (day < 10) {
          stringDay = "0" + day.toString();
        } else stringDay = day.toString();

        month = dateValue.getMonth() + 1;
        if (month < 10) {
          stringMonth = "0" + month.toString();
        } else stringMonth = month.toString();

        value =
          dateValue.getFullYear().toString() +
          "-" +
          stringMonth +
          "-" +
          stringDay;
        return value;
      },

      openDialog: function (dialogPath) {
        if (!this.__dialog) {
          this.__dialog = sap.ui.xmlfragment(dialogPath, this);
          this.getView().addDependent(this.__dialog);
        }
        return this.__dialog;
      },
      closeDialog: function () {
        if (this.__dialog) {
          if (this.__dialog.close) {
            this.__dialog.close();
          }
          this.__dialog.destroy();
          this.__dialog = null;
        }
      },

      handleValueHelp: function (oEvent) {
        var oSource = oEvent.getSource(),
          oValue = oSource.getValue(),
          oSelectedItem = oEvent.getParameter("selectedItem"),
          sField = oEvent.getSource().data("filterTableField"),
          sName = oSource.data("FieldName");

        var oDialog = this.openDialog(
          "project1.fragment.Help." + sField
        ).open();
      },

      _handleValueHelpSetValueClose: function (evt) {
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

      _handleValueHelpValueClose: function (evt) {
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

      _handleValueHelpClose: function (evt) {
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

      onSelectPosFin: function (oEvent) {
        var self = this;
        console.log(oEvent);
      },

      callVisibilitaWithCallback: function (callback) {
        var self = this,
          filters = [];

        filters.push(
          new Filter({
            path: "SEM_OBJ",
            operator: FilterOperator.EQ,
            value1: "ZS4_NOTEIMPUTAZIONI_SRV",
          }),
          new Filter({
            path: "AUTH_OBJ",
            operator: FilterOperator.EQ,
            value1: "Z_GEST_NI",
          })
        );
        self
          .getOwnerComponent()
          .getModel("ZSS4_CA_CONI_VISIBILITA_SRV")
          .read("/ZES_CONIAUTH_SET", {
            filters: filters,
            success: function (data) {
              console.log("success");
              self
                .getView()
                .getModel(WIZARD_ENTITIES_MODEL)
                .setProperty("/Visibilita", data.results);
              callback(true);
              // self.getView().getModel("temp").setProperty('/Visibilita', data.results)
              //self.pulsantiVisibiltà(data.results)
            },
            error: function (error) {
              console.log(error);
              var e = error;
              callback(false);
            },
          });
      },

      callPreventVisibilitaWithCallback: function (callback) {
        var self = this,
          filters = [];

        filters.push(
          new Filter({
            path: "SEM_OBJ",
            operator: FilterOperator.EQ,
            value1: "ZS4_NOTEIMPUTAZIONI_SRV",
          }),
          new Filter({
            path: "AUTH_OBJ",
            operator: FilterOperator.EQ,
            value1: "Z_GEST_NI",
          })
        );
        self
          .getOwnerComponent()
          .getModel("ZSS4_CA_CONI_VISIBILITA_SRV")
          .read("/ZES_CONIAUTH_SET", {
            filters: filters,
            success: function (data) {
              console.log("success");
              self
                .getOwnerComponent()
                .getModel("temp")
                .setProperty("/Visibilità", data.results);
              callback(true);
            },
            error: function (error) {
              console.log(error);
              var e = error;
              self
                .getOwnerComponent()
                .getModel("temp")
                .setProperty("/Visibilita", []);
              callback(false);
            },
          });
      },

      getDescCapDescPG: function (gjahr, fipex, callback) {
        var self = this,
          filters = [];

        self
          .getOwnerComponent()
          .getModel()
          .read("/ZamministrNiSet", {
            success: function (data) {
              self
                .getView()
                .getModel("temp")
                .setProperty("/ZamministrNiSet", data.results);
              filters.push(
                new Filter({
                  path: "Gjahr",
                  operator: FilterOperator.EQ,
                  value1: gjahr,
                }),
                new Filter({
                  path: "Zamministr",
                  operator: FilterOperator.EQ,
                  value1: data.results[0].Zamministr,
                }),
                new Filter({
                  path: "Fipex",
                  operator: FilterOperator.EQ,
                  value1: fipex,
                })
              );
              self
                .getOwnerComponent()
                .getModel()
                .read("/DescPgCapSet", {
                  filters: filters,
                  success: function (data, oResponse) {
                    callback({
                      success: true,
                      entity:
                        data && data.results.length > 0
                          ? data.results[0]
                          : null,
                    });
                  },
                  error: function (error) {
                    console.log(error);
                    callback({ success: false, entity: null });
                  },
                });
            },
            error: function (error) {
              console.log(error);
              callback({ success: false, entity: null });
            },
          });
      },

      onExportDetail: function (oEvent) {
        var self = this,
          aCols,
          oRowBinding,
          oSettings,
          oSheet,
          tableId = oEvent.getSource().data("tableId"),
          fileName = oEvent.getSource().data("filename"),
          functionColumnConfig = oEvent.getSource().data("columnConfig");

        if (
          !tableId ||
          tableId === null ||
          tableId === "" ||
          !fileName ||
          fileName === null ||
          fileName === "" ||
          !functionColumnConfig ||
          functionColumnConfig === null ||
          functionColumnConfig === ""
        ) {
          MessageBox.error("Impossibile effettuare il download", {
            actions: [sap.m.MessageBox.Action.OK],
            emphasizedAction: MessageBox.Action.OK,
          });
          return false;
        }

        var oTable = self.getView().byId(tableId);
        oRowBinding = oTable.getBinding("items");
        var customList = oRowBinding.oList;
        var data = customList.map((x) => {
          var item = x;
          item.ZdataPagString = self.formatter.convert(item.ZdataPag);
          item.ZimpoTitoloString = self.formatter.convertFormattedNumber(
            item.ZimpoTitolo
          );
          item.ZimpoResString = self.formatter.convertFormattedNumber(
            item.ZimpoRes
          );
          return item;
        });

        oRowBinding.oList = data;
        aCols = eval(`this.${functionColumnConfig}("")`);
        //aCols = this.createColumnConfigForDetail();

        oSettings = {
          workbook: {
            columns: aCols,
            hierarchyLevel: "Level",
          },
          dataSource: data,
          fileName: fileName,
          worker: false, // We need to disable worker because we are using a MockServer as OData Service
        };

        oSheet = new sap.ui.export.Spreadsheet(oSettings);
        oSheet.build().finally(function () {
          oSheet.destroy();
        });
      },

      columnConfigPreimpostata: function (value) {
        var aCols = [];

        aCols.push({
          label: "Codice ISIN",
          property: "ZcodIsin",
          type: EdmType.String,
        });

        aCols.push({
          label: "Sottotipologia primo livello",
          property: "Ztipo",
          type: EdmType.String,
        });

        aCols.push({
          label: "Descrizione",
          property: "Zdescrizione",
          type: EdmType.String,
        });

        aCols.push({
          label: "Data Pagamento",
          property: "ZdataPagString",
          type: EdmType.String,
        });
        aCols.push({
          label: "Importo NI",
          property: "ZimpoTitoloString",
          type: EdmType.String,
          textAlign: 'end'
        });

        aCols.push({
          label: "Importo Residuo",
          property: "ZimpoResString",
          type: EdmType.String,
          textAlign: 'end'
        });
        return aCols;
      },

      columnConfigProvvisoria: function (value) {
        var aCols = [];

        aCols.push({
          label: "Numero NI",
          property: "ZchiaveSubni",
          type: EdmType.String,
        });

        aCols.push({
          label: "Codice ISIN",
          property: "ZcodIsin",
          type: EdmType.String,
        });

        aCols.push({
          label: "Sottotipologia primo livello",
          property: "Ztipo",
          type: EdmType.String,
        });

        aCols.push({
          label: "Descrizione",
          property: "Zdescrizione",
          type: EdmType.String,
        });

        aCols.push({
          label: "Data Pagamento",
          property: "ZdataPagString",
          type: EdmType.String,
        });
        aCols.push({
          label: "Importo NI",
          property: "ZimpoTitoloString",
          type: EdmType.String,
          textAlign: 'end'
        });

        aCols.push({
          label: "Importo Residuo",
          property: "ZimpoResString",
          type: EdmType.String,
          textAlign: 'end'
        });

        aCols.push({
          label: "Impegno",
          property: "ZCodCla",
          type: EdmType.String,
        });
        return aCols;
      },

      setFilterEQ: function (aFilters, sPropertyModel, sValue) {
        if (sValue) {
          aFilters.push(new Filter(sPropertyModel, FilterOperator.EQ, sValue));
        }
      },

      setFilterBT: function (aFilters, sPropertyModel, sValueFrom, sValueTo) {
        if (sValueFrom && sValueTo) {
          aFilters.push(
            new Filter(sPropertyModel, FilterOperator.BT, sValueFrom, sValueTo)
          );
          return;
        }
        if (sValueFrom || sValueTo) {
          this.setFilterEQ(aFilters, sPropertyModel, sValueFrom);
          this.setFilterEQ(aFilters, sPropertyModel, sValueTo);
          return;
        }
      },

      acceptOnlyNumber: function (sId) {
        var oInput = this.getView().byId(sId);
        oInput.attachBrowserEvent("keypress", function (oEvent) {
          if (isNaN(oEvent.key)) {
            oEvent.preventDefault();
          }
        });
      },

      setInitInfoMC: function (data) {
        var self = this;
        console.log(data);
        return {
          Bukrs: data.BUKRS,
          Role: data.AGR_NAME,
          Fikrs: data.FIKRS,
          Prctr: data.PRCTR,
        };
      },

      getRagioneria:function(gjahr){
        /*TODO:non è stato completato in quanto la ragioneria nella prima pagina relativa ai filtri,
          non contempla il matchcode ma è un valore fisso in base all'utenza
          LA FUNZIONE è PRONTA MA NON VIENE UTILIZZATA
          */
        var self =this,
          filters = [];
          
        filters.push(new Filter({path: "FIKRS",operator: FilterOperator.EQ,value1: "S001"}));
        filters.push(new Filter({path: "ANNO",operator: FilterOperator.EQ,value1: gjahr}));
        filters.push(new Filter({path: "FASE",operator: FilterOperator.EQ,value1: "GEST"}));
        filters.push(new Filter({path: "LOEKZ",operator: FilterOperator.EQ,value1: ""}));
        filters.push(new Filter({path: "DATBIS",operator: FilterOperator.GE,value1: self.formatter.convertSimpleDate(new Date())}));
        filters.push(new Filter({path: "DATAB",operator: FilterOperator.LE,value1: self.formatter.convertSimpleDate(new Date())}));
        filters.push(new Filter({path: "MC",operator: FilterOperator.EQ,value1: "X"}));
        filters.push(new Filter({path: "REALE",operator: FilterOperator.EQ,value1: "R"}));

          
        self.getOwnerComponent().getModel("ZSS4_CO_GEST_TIPOLOGICHE_SRV")
          .read("/ZES_RAGIONERIA_SET", {
            filters: filters,
            success: function (data) {
              console.log("success");
              console.log(data);
              
              
            },
            error: function (error) {
              console.log(error);
              // var e = error;
              // callback(false);
            },
          });
      }



    });
  }
);
