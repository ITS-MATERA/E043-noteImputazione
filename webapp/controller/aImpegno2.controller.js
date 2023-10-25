sap.ui.define(
  [
    "./BaseController",
    "sap/ui/model/Filter",
    "sap/m/MessageBox",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/routing/History",
    "project1/model/DateFormatter",
    "sap/ui/model/json/JSONModel",
  ],
  function (
    BaseController,
    Filter,
    MessageBox,
    FilterOperator,
    History,
    DateFormatter,
    JSONModel
  ) {
    "use strict";
    const MODEL_ENTITY = "EntityModel";
    return BaseController.extend("project1.controller.aImpegno2", {
      formatter: DateFormatter,
      onInit() {
        var self = this;
        var oModelJson = new JSONModel({
          viewId:null,
          Header: null,
          Detail: null,
          ZdescwelsBniSet: [],
        });

        this.getOwnerComponent().getModel("temp");


        self.acceptOnlyNumber("inputCodiceGest");
        self.getView().setModel(oModelJson, MODEL_ENTITY);
        self.getRouter()
          .getRoute("aImpegno2")
          .attachPatternMatched(this._onObjectMatched, this);
      },

      _onObjectMatched: function (oEvent) {
        var self = this;
        if (
          !self.getView().getModel("temp").getProperty("/ImpegniSelezionati")
        ) {
          self.onBackButton();
          return;
        }

        var path = self
          .getOwnerComponent()
          .getModel()
          .createKey("HeaderNISet", {
            Bukrs: oEvent.getParameters().arguments.campo,
            Gjahr: oEvent.getParameters().arguments.campo1,
            Zamministr: oEvent.getParameters().arguments.campo2,
            ZchiaveNi: oEvent.getParameters().arguments.campo3,
            ZidNi: oEvent.getParameters().arguments.campo4,
            ZRagioCompe: oEvent.getParameters().arguments.campo5,
          });

        var detail = {
          Lifnr: null,
          Nome: null,
          Zwels: null,
          ZwelsDesc: null,
          Iban: null,
          Cdc: null,
          CdcDesc: null,
          CdcEnable:true,
          Coge: null,
          CogeDesc: null,
          CogeEnabled:true,
          ImportoLiquidazione: null,
          DataProtocollo: null,
          NProtocollo: null,
          CodiceGestionale: null,
          Descrizione: null,
          LocalitaPagamento: null,
          CausalePagamento: null,
          DataEsigibilita: null,
          ZonaIntervento: null,
        };

        self.getView().byId("DP1").setDateValue(null);
        self.getView().byId("DP2").setDateValue(null);

        self.getView().getModel(MODEL_ENTITY).setProperty("/Detail", detail);
        self.getView().getModel(MODEL_ENTITY).setProperty("/viewId", self.getView().getId());
        self
          .getView()
          .getModel(MODEL_ENTITY)
          .setProperty("/ZdescwelsBniSet", []);

        self.getView().setBusy(true);
        if (
          !self.getOwnerComponent().getModel("temp").getData().Visibilità ||
          self.getOwnerComponent().getModel("temp").getData().Visibilità ===
            null
        ) {
          self.callPreventVisibilitaWithCallback(function (callback) {
            if (callback) {
              self.loadView(path);
            }
          });
        } else {
          self.loadView(path);
        }
      },

      loadIban: function (array) {
        var self = this;
        self
          .getView()
          .getModel(MODEL_ENTITY)
          .setProperty("/Detail/Iban", array[0].Iban);
        if (array.length > 1) {
          var found = array.filter((x) => x.Iban !== array[0].Iban);
          if (found && found.length > 0)
            self
              .getView()
              .getModel(MODEL_ENTITY)
              .setProperty("/Detail/Iban", null);
        }
      },

      setCdc:function(array){
        var self =this;
        if (array.length > 0) {
          var code = array[0].Ztipo.slice(-3);
          if(code ===  "001" || code === "002")
            self.getView().getModel(MODEL_ENTITY).setProperty("/Detail/CdcEnable", false);
          else
            self.getView().getModel(MODEL_ENTITY).setProperty("/Detail/CdcEnable", true);
        }
      },

      loadView: function (path) {
        var self = this,
          oDataModel = self.getOwnerComponent().getModel();
        self
          .getOwnerComponent()
          .getModel()
          .metadataLoaded()
          .then(function () {
            oDataModel.read("/" + path, {
              success: function (data, oResponse) {
                self
                  .getView()
                  .getModel(MODEL_ENTITY)
                  .setProperty("/Header", data);
                self
                  .getView()
                  .getModel(MODEL_ENTITY)
                  .setProperty("/Detail/ImportoLiquidazione", data.ZimpoTotni);

                self.loadBeneficiario();
                self.loadModalitaPagamento();

                if (
                  self
                    .getView()
                    .getModel("temp")
                    .getProperty("/SalvaImpegnoValues")
                ) {
                  self.loadForm(
                    self
                      .getView()
                      .getModel("temp")
                      .getProperty("/SalvaImpegnoValues")
                  );
                }

                self.onModificaNISet(data, function (callback) {
                  if (callback.success) {
                    if (callback.data.length > 0) {
                      self.loadIban(callback.data);
                      self.setCdc(callback.data);
                      var item = callback.data[0];
                      self
                        .getView()
                        .getModel(MODEL_ENTITY)
                        .setProperty("/Header/ZcompRes", item.ZcompRes);

                        self.getCogeImputazioneContabile(item.Ztipo);  
                    }

                    self.getView().setBusy(false);
                  } else {
                    self.getView().setBusy(false);
                  }
                });
              },
              error: function (error) {
                console.log(error);
                self.getView().setBusy(false);
              },
            });
          });
      },

      getCogeImputazioneContabile:function(ztipo){
        var self =this,
          filters = [];
        
        filters.push(new sap.ui.model.Filter("Ztipo",sap.ui.model.FilterOperator.EQ,ztipo));
        self.getView().getModel(MODEL_ENTITY).setProperty("/Detail/Coge", null);
        self.getView().getModel(MODEL_ENTITY).setProperty("/Detail/CogeDesc", null);
        self.getView().getModel(MODEL_ENTITY).setProperty("/Detail/CogeEnabled", true);
        
        self.getView().getModel().read("/ImpContCoGeSet", {
            filters: filters,
            success: function (data) {
              console.log(data);//TODO:da canc
              if(data && data.results && data.results.length>0){
                self.getView().getModel(MODEL_ENTITY).setProperty("/Detail/Coge", data.results[0].Saknr);
                self.getView().getModel(MODEL_ENTITY).setProperty("/Detail/CogeDesc", data.results[0].Txt50);
                self.getView().getModel(MODEL_ENTITY).setProperty("/Detail/CogeEnabled", false);
              }
            },
            error: function (error) {
              console.log(error);
            },
          });
      },

      loadForm: function (data) {
        var self = this;
        self.getView().byId("DP1").setDateValue(data.DataProtocollo);
        self.getView().byId("DP2").setDateValue(data.DataEsigibilita);
        self
          .getView()
          .getModel(MODEL_ENTITY)
          .setProperty("/Detail/Iban", data.Iban);
        self
          .getView()
          .getModel(MODEL_ENTITY)
          .setProperty("/Detail/Cdc", data.Cdc);
        self
          .getView()
          .getModel(MODEL_ENTITY)
          .setProperty("/Detail/Coge", data.Coge);
        self
          .getView()
          .getModel(MODEL_ENTITY)
          .setProperty("/Detail/NProtocollo", data.NProtocollo);
        self
          .getView()
          .getModel(MODEL_ENTITY)
          .setProperty("/Detail/CodiceGestionale", data.CodiceGestionale);
        self
          .getView()
          .getModel(MODEL_ENTITY)
          .setProperty("/Detail/Descrizione", data.Descrizione);
        self
          .getView()
          .getModel(MODEL_ENTITY)
          .setProperty("/Detail/LocalitaPagamento", data.LocalitaPagamento);
        self
          .getView()
          .getModel(MODEL_ENTITY)
          .setProperty("/Detail/CausalePagamento", data.CausalePagamento);
        self
          .getView()
          .getModel(MODEL_ENTITY)
          .setProperty("/Detail/ZonaIntervento", data.ZonaIntervento);
        self
          .getView()
          .getModel(MODEL_ENTITY)
          .setProperty("/Detail/CdcDesc", data.CdcDesc);
        self
          .getView()
          .getModel(MODEL_ENTITY)
          .setProperty("/Detail/CogeDesc", data.CogeDesc);
        self
          .getView()
          .getModel(MODEL_ENTITY)
          .setProperty("/Detail/DataProtocollo", data.DataProtocollo);
        self
          .getView()
          .getModel(MODEL_ENTITY)
          .setProperty("/Detail/DataEsigibilita", data.DataEsigibilita);
      },

      loadBeneficiario: function () {
        var self = this,
          impegni = self
            .getView()
            .getModel("temp")
            .getProperty("/ImpegniSelezionati");

        self
          .getView()
          .getModel(MODEL_ENTITY)
          .setProperty("/Detail/Lifnr", impegni[0].Lifnr);
        console.log(impegni);

        var path = self
          .getOwnerComponent()
          .getModel()
          .createKey("/FornitoreSet", {
            Lifnr: impegni[0].Lifnr,
          });

        self
          .getOwnerComponent()
          .getModel()
          .read(path, {
            success: function (data) {
              if (data) {
                self
                  .getView()
                  .getModel(MODEL_ENTITY)
                  .setProperty("/Detail/Nome", data.ZzragSoc);
              }
            },
            error: function (e) {
              console.log(e);
            },
          });
      },

      loadModalitaPagamento: function () {
        var self = this,
          filters = [],
          impegni = self
            .getView()
            .getModel("temp")
            .getProperty("/ImpegniSelezionati");

        filters.push(
          new Filter({
            path: "Lifnr",
            operator: FilterOperator.EQ,
            value1: impegni[0].Lifnr,
          })
        );
        self
          .getOwnerComponent()
          .getModel()
          .read("/ZdescwelsBniSet", {
            filters: filters,
            success: function (data) {
              if (data && data.results.length > 0) {
                self
                  .getView()
                  .getModel(MODEL_ENTITY)
                  .setProperty("/ZdescwelsBniSet", data.results);
                self
                  .getView()
                  .byId("ModPagamento")
                  .setSelectedKey(data.results[0].Zwels);
                self
                  .getView()
                  .getModel(MODEL_ENTITY)
                  .setProperty("/Detail/Zwels", data.results[0].Zwels);
                self
                  .getView()
                  .getModel(MODEL_ENTITY)
                  .setProperty("/Detail/ZwelsDesc", data.results[0].Zdescwels);
              }
            },
            error: function (error) {
              var e = error;
            },
          });
      },

      onModificaNISet: function (entityHeader, callback) {
        var self = this,
          visibilita = self.getOwnerComponent().getModel("temp").getData()
            .Visibilità[0],
          filters = [];
        filters.push(
          new Filter({
            path: "Bukrs",
            operator: FilterOperator.EQ,
            value1: entityHeader.Bukrs,
          })
        );
        filters.push(
          new Filter({
            path: "Gjahr",
            operator: FilterOperator.EQ,
            value1: entityHeader.Gjahr,
          })
        );
        filters.push(
          new Filter({
            path: "Zamministr",
            operator: FilterOperator.EQ,
            value1: entityHeader.Zamministr,
          })
        );
        filters.push(
          new Filter({
            path: "ZchiaveNi",
            operator: FilterOperator.EQ,
            value1: entityHeader.ZchiaveNi,
          })
        );
        filters.push(
          new Filter({
            path: "ZRagioCompe",
            operator: FilterOperator.EQ,
            value1: entityHeader.ZRagioCompe,
          })
        );

        self
          .getOwnerComponent()
          .getModel()
          .read("/PositionNISet", {
            filters: filters,
            urlParameters: {
              AutorityRole: visibilita.AGR_NAME,
              AutorityFikrs: visibilita.FIKRS,
              AutorityPrctr: visibilita.PRCTR,
            },
            success: function (data) {
              console.log(data.results);
              callback({ success: true, data: data.results });
            },
            error: function (error) {
              console.log(error);
              callback({ success: false, data: [] });
            },
          });
      },

      // _onObjectMatched_old: function (oEvent) {
      //     this.getView().bindElement(
      //         "/HeaderNISet('Bukrs='" + oEvent.getParameters().arguments.campo +
      //         "',Gjahr='" + oEvent.getParameters().arguments.campo1 +
      //         "',Zamministr='" + oEvent.getParameters().arguments.campo2 +
      //         "',ZchiaveNi='" + oEvent.getParameters().arguments.campo3 +
      //         "',ZidNi='" + oEvent.getParameters().arguments.campo4 +
      //         "',ZRagioCompe='" + oEvent.getParameters().arguments.campo5 + "')"
      //     );
      //     this.viewFiltri(oEvent)
      // },

      onCallImpegni: function () {
        var that = this;
        var oMdlAImp = new sap.ui.model.json.JSONModel();
        this.getOwnerComponent()
          .getModel()
          .read("/ZfmimpegniIpeSet", {
            //filters: filtriAssocia,
            filters: [],
            // urlParameters: "",
            success: function (data) {
              oMdlAImp.setData(data.results);
              that
                .getView()
                .getModel("temp")
                .setProperty("/ZfmimpegniIpeSet", data.results);
            },
            error: function (error) {
              var e = error;
            },
          });
      },

      onCallKostl: function () {
        var that = this;
        var oMdlZhfKostl = new sap.ui.model.json.JSONModel();
        this.getOwnerComponent()
          .getModel()
          .read("/ZhfKostlSet", {
            //filters: filtriAssocia,
            filters: [],
            // urlParameters: "",
            success: function (data) {
              oMdlZhfKostl.setData(data.results);
              that
                .getView()
                .getModel("temp")
                .setProperty("/ZhfKostlSet", data.results);
            },
            error: function (error) {
              var e = error;
            },
          });
      },

      onCallTxt50Ic: function () {
        var filtriTxt50Ic = [];
        var that = this;
        var oMdlText = new sap.ui.model.json.JSONModel();
        //var Saknr = "1021049999"

        // filtriTxt50Ic.push(new Filter({
        //     path: "Saknr",
        //     operator: FilterOperator.EQ,
        //     value1: Saknr
        // }));

        this.getOwnerComponent()
          .getModel()
          .read("/Txt50IcSet", {
            filters: [],
            success: function (data) {
              oMdlText.setData(data.results);
              that
                .getView()
                .getModel("temp")
                .setProperty("/Txt50IcSet", data.results);
            },
            error: function (error) {
              var e = error;
            },
          });
      },

      onDtChange: function (oEvent) {
        var self = this,
          dateValue = self
            .getView()
            .byId(oEvent.getParameters().id)
            .getDateValue(),
          dataField = oEvent.getSource().data("dataField");

        self
          .getView()
          .getModel(MODEL_ENTITY)
          .setProperty("/Detail/" + dataField, dateValue);
      },

      getOtherData: function (value) {
        var oMdlVN = new sap.ui.model.json.JSONModel();
        var oTempModel = this.getView().getModel("temp");

        var KOSTL = _.findWhere(oTempModel.getProperty("/ZhfKostlSet"), {
          Kostl: value,
        });
        if (KOSTL != undefined) {
          var centroCosto = _.findWhere(
            oTempModel.getProperty("/ZhfKostlSet"),
            { id: KOSTL.Kostl }
          );
          this.getView().byId("DescCentroCosto").setValue(KOSTL.Ltext);
          //valoriNuovi.push(KOSTL.Kostl)
        }
        var SAKNR = _.findWhere(oTempModel.getProperty("/Txt50IcSet"), {
          Saknr: value,
        });
        if (SAKNR != undefined) {
          var contoCOGE = _.findWhere(oTempModel.getProperty("/Txt50IcSet"), {
            id: SAKNR.Saknr,
          });
          this.getView().byId("DescCoGe").setValue(SAKNR.Txt50);
          //valoriNuovi.push(SAKNR.Saknr)
        }

        var codiceGestionale = _.findWhere(
          oTempModel.getProperty("/PositionNISet"),
          { Zcodgest: value }
        );
        if (codiceGestionale != undefined) {
          var Zcodgest = _.findWhere(oTempModel.getProperty("/PositionNISet"), {
            id: codiceGestionale.Zcodgest,
          });
          this.getView()
            .byId("DescrizioneCodiceGest")
            .setValue(codiceGestionale.Zdescrcg);
        }
      },

      onBackButton: function () {
        var self = this;
        self.getView().getModel(MODEL_ENTITY).setProperty("/Header", null);
        self.getView().getModel(MODEL_ENTITY).setProperty("/Detail", null);
        self
          .getView()
          .getModel(MODEL_ENTITY)
          .setProperty("/ZdescwelsBniSet", []);
        self
          .getView()
          .getModel("temp")
          .setProperty("/SalvaImpegnoValues", null);
        window.history.go(-1);
      },

      onSaveButton: function (oEvent) {
        var self = this,
          header = self.getView().getModel(MODEL_ENTITY).getProperty("/Header"),
          detail = self.getView().getModel(MODEL_ENTITY).getProperty("/Detail"),
          newVals = [];

        if ((
            !detail.Lifnr || detail.Lifnr === null || detail.Lifnr === "" ||
            !detail.Coge || detail.Coge === null ||  detail.Coge === "" ||
            !detail.CodiceGestionale || detail.CodiceGestionale === null || detail.CodiceGestionale === "" ||
            !detail.CausalePagamento || detail.CausalePagamento === null || detail.CausalePagamento === "" ||
            !detail.Zwels || detail.Zwels === null || detail.Zwels === "" 
          ) || (detail.CdcEnable && (!detail.Cdc || detail.Cdc === null || detail.Cdc === ""))      
        )  
        {
          MessageBox.error("Alimentare tutti i campi obbligatori", {
            actions: [sap.m.MessageBox.Action.OK],
            emphasizedAction: MessageBox.Action.OK,
          });
          return false;
        }

        if (detail.DataEsigibilita && detail.DataEsigibilita !== "") {
          if (detail.DataEsigibilita < new Date(new Date().toDateString())) {
            MessageBox.error(
              "La data di esigibilità inserita non è valida. Definire un altro valore",
              {
                actions: [sap.m.MessageBox.Action.OK],
                emphasizedAction: MessageBox.Action.OK,
              }
            );
            return false;
          }
        }

        self
          .getView()
          .getModel("temp")
          .setProperty("/SalvaImpegnoValues", detail);
        self.getOwnerComponent().getRouter().navTo("salvaImpegno", {
          campo: header.Bukrs,
          campo1: header.Gjahr,
          campo2: header.Zamministr,
          campo3: header.ZchiaveNi,
          campo4: header.ZidNi,
          campo5: header.ZRagioCompe,
        });
      },

      handleValueHelpZcodGest:function(oEvent){
          var self =this;
          if(!self._zcodgest){
            self._zcodgest = sap.ui.core.Fragment.load({
              id: self.getView().getId(),
              name: "project1.fragment.Help.ValueHelpZcodGest",
              controller: self
            }).then(function(oDialog){
              return oDialog;
            }.bind(this));
          }
          self._zcodgest.then(function(oDialog){
            var oDataModel = self.getView().getModel(),
              filters=[];
            self.getView().setBusy(true);

            filters.push(new Filter({path: "FIKRS",operator: FilterOperator.EQ,value1: "S001"}));
            filters.push(new Filter({path: "ANNO",operator: FilterOperator.EQ,value1: self.getModel(MODEL_ENTITY).getProperty("/Header/Gjahr")}));
            filters.push(new Filter({path: "FASE",operator: FilterOperator.EQ,value1: "GEST"}));
            filters.push(new Filter({path: "LOEKZ",operator: FilterOperator.EQ,value1: ""}));
            filters.push(new Filter({path: "DATBIS",operator: FilterOperator.GE,value1: self.formatter.convertSimpleDate(new Date())}));
            filters.push(new Filter({path: "DATAB",operator: FilterOperator.LE,value1: self.formatter.convertSimpleDate(new Date())}));
            filters.push(new Filter({path: "MC",operator: FilterOperator.EQ,value1: "X"}));
            filters.push(new Filter({path: "REALE",operator: FilterOperator.EQ,value1: "R"}));

            var oModelGestAnag = self.getModel("ZSS4_CO_GEST_ANAGRAFICHE_SRV");
            oModelGestAnag.read("/ZES_COD_GEST_SET", {
              filters: filters,
              success: function (data) {
                var arrs = data.results.map(x=>{
                  return {codGest: x.CODICE_GESTIONALE, descr: x.DESCRIZIONE}
                });
                console.log(arrs)
                var oModelJson = new JSONModel({
                  codiceGestionale:arrs
                });
                self.getView().setBusy(false);
                oDialog.setModel(oModelJson, "codiceGestionale");
                oDialog.open();                
              },
              error: function (error) {
                console.log(error);
                self.getView().setBusy(false);
              },
            });
          });
        },

        _handleValueHelpConfirmZcodGest:function(oEvent){
          var self =this,
            table = self.getView().byId("_dialogCodiceGest"),
            selectedItem = table.getSelectedItem(),
            entityModel = self.getModel(MODEL_ENTITY);
          if (selectedItem) {
            entityModel.setProperty("/Detail/CodiceGestionale", selectedItem.data("codGest"));
            entityModel.setProperty("/Detail/Descrizione", selectedItem.data("descr"));
          }
          oEvent.getSource().getParent().close();
        },

        _handleValueHelpCloseZcodGest:function(oEvent){
          var self = this;
          oEvent.getSource().getParent().close();         
        },


        _handleValueHelpSearch:function(oEvent){
          var self =this,
            sValue = oEvent.getParameter("value");
          var oFilter = new Filter("descr", FilterOperator.Contains, sValue);
          oEvent.getSource().getBinding("items").filter([oFilter]);
        },

        onInputCodiceGestSubmit:function(oEvent){
          var self =this,
            filters=[],
            entityModel = self.getModel(MODEL_ENTITY),
            value = oEvent.getParameters().value;
          if(!value || value === null || value === "")
            return false;

          self.getView().setBusy(true);

          filters.push(new Filter({path: "FIKRS",operator: FilterOperator.EQ,value1: "S001"}));
          filters.push(new Filter({path: "ANNO",operator: FilterOperator.EQ,value1: self.getModel(MODEL_ENTITY).getProperty("/Header/Gjahr")}));
          filters.push(new Filter({path: "FASE",operator: FilterOperator.EQ,value1: "GEST"}));
          filters.push(new Filter({path: "LOEKZ",operator: FilterOperator.EQ,value1: ""}));
          filters.push(new Filter({path: "DATBIS",operator: FilterOperator.GE,value1: self.formatter.convertSimpleDate(new Date())}));
          filters.push(new Filter({path: "DATAB",operator: FilterOperator.LE,value1: self.formatter.convertSimpleDate(new Date())}));
          filters.push(new Filter({path: "MC",operator: FilterOperator.EQ,value1: "X"}));
          filters.push(new Filter({path: "REALE",operator: FilterOperator.EQ,value1: "R"}));
          filters.push(new Filter({path: "CODICE_GESTIONALE",operator: FilterOperator.EQ,value1: value}));

          var oModelGestAnag = self.getModel("ZSS4_CO_GEST_ANAGRAFICHE_SRV");
          oModelGestAnag.read("/ZES_COD_GEST_SET", {
            filters: filters,
            success: function (data) {
              self.getView().setBusy(false);
              if(data.results && data.results.length>0){
                entityModel.setProperty("/Detail/CodiceGestionale", data.results[0].CODICE_GESTIONALE);
                entityModel.setProperty("/Detail/Descrizione", data.results[0].DESCRIZIONE); 
              }
              else{
                entityModel.setProperty("/Detail/CodiceGestionale", null);
                entityModel.setProperty("/Detail/Descrizione", null); 
                MessageBox.error("Codice gestionale inesistente", {
                    actions: [sap.m.MessageBox.Action.OK],
                    emphasizedAction: MessageBox.Action.OK,
                })
              }                           
            },
            error: function (error) {
              console.log(error);
              self.getView().setBusy(false);
              entityModel.setProperty("/Detail/CodiceGestionale", null);
              entityModel.setProperty("/Detail/Descrizione", null); 
              MessageBox.error("Codice gestionale inesistente", {
                actions: [sap.m.MessageBox.Action.OK],
                emphasizedAction: MessageBox.Action.OK,
            })
            }
          });
        },

    });
  }
);
