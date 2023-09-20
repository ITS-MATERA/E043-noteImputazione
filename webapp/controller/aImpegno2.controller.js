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
          Header: null,
          Detail: null,
          ZdescwelsBniSet: [],
        });

        // this.onCallImpegni()
        this.getOwnerComponent().getModel("temp");
        // this.onCallKostl()
        // //this.onCallLtextIc()
        // this.onCallTxt50Ic()

        self.getView().setModel(oModelJson, MODEL_ENTITY);
        this.getRouter()
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
          Coge: null,
          CogeDesc: null,
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
                      var item = callback.data[0];
                      self
                        .getView()
                        .getModel(MODEL_ENTITY)
                        .setProperty("/Header/ZcompRes", item.ZcompRes);
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

      // onCallLtextIc: function () {
      //     var filtriLtextIc = []
      //     var position = this.getOwnerComponent().getModel("temp").getData().PositionNISet
      //     var Kokrs = position[0].Bukrs
      //     var Kostl = "A04017ZZZZ"

      //     filtriLtextIc.push(new Filter({
      //         path: "Kokrs",
      //         operator: FilterOperator.EQ,
      //         value1: Kokrs
      //     }));
      //     filtriLtextIc.push(new Filter({
      //         path: "Kostl",
      //         operator: FilterOperator.EQ,
      //         value1: Kostl
      //     }));

      //     var that = this
      //     var oMdlText = new sap.ui.model.json.JSONModel();
      //     this.getOwnerComponent().getModel().read("/LtextIcSet", {
      //         filters: filtriLtextIc,
      //         //filters: [],
      //         // urlParameters: "",
      //         success: function (data) {
      //             oMdlText.setData(data.results);
      //             that.getView().getModel("temp").setProperty('/LtextIcSet', data.results)
      //         },
      //         error: function (error) {
      //             var e = error;
      //         }
      //     });
      // },

      // onCallModalità: function () {
      //     var filtriModalità = []
      //     var that = this
      //     var oMdlMod = new sap.ui.model.json.JSONModel();
      //     var Lifnr = this.getView().byId("inputBeneficiario").getValue()

      //     filtriModalità.push(new Filter({
      //         path: "Lifnr",
      //         operator: FilterOperator.EQ,
      //         value1: Lifnr
      //     }));

      //     this.getOwnerComponent().getModel().read("/ZdescwelsBniSet", {
      //         filters: filtriModalità,
      //         success: function (data) {
      //             oMdlMod.setData(data.results);
      //             that.getView().getModel("temp").setProperty('/ZdescwelsBniSet', data.results)
      //             that.getView().byId("ModPagamento").setValue(data.results[0].Zdescwels)

      //         },
      //         error: function (error) {
      //             var e = error;
      //         }
      //     });
      // },

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
        //var oModel= this.getView().getModel("comboBox")
        //var codiceGestionale = this.getView().byId("inputCodiceGest").getValue()
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
          //valoriNuovi.push(SAKNR.Saknr)
        }

        //oMdlVN.setData(valoriNuovi)
      },

      // viewFiltri: function (oEvent) {
      //     var header = this.getView().getModel("temp").getData().HeaderNISet
      //     var position = this.getView().getModel("temp").getData().PositionNISet
      //     //var LtextIcSet = this.getView().getModel("temp").getData().LtextIcSet
      //     var impegni = this.getView().getModel("temp").getData().ImpegniSelezionati

      //     console.log(header);
      //     console.log(position);
      //     console.log(impegni);

      //     //console.log(this.getView().getModel("temp").getData())
      //     for (var i = 0; i < header.length; i++) {
      //         if (header[i].Bukrs == oEvent.getParameters().arguments.campo &&
      //             header[i].Gjahr == oEvent.getParameters().arguments.campo1 &&
      //             header[i].Zamministr == oEvent.getParameters().arguments.campo2 &&
      //             header[i].ZchiaveNi == oEvent.getParameters().arguments.campo3 &&
      //             header[i].ZidNi == oEvent.getParameters().arguments.campo4 &&
      //             header[i].ZRagioCompe == oEvent.getParameters().arguments.campo5) {

      //             var progressivoNI = header[i].ZchiaveNi
      //             this.getView().byId("ProgressivoNI1").setText(progressivoNI)

      //             var dataRegistrazione = header[i].ZdataCreaz
      //             var dataNuova = new Date(dataRegistrazione),
      //                 mnth = ("0" + (dataNuova.getMonth() + 1)).slice(-2),
      //                 day = ("0" + dataNuova.getDate()).slice(-2);
      //             var nData = [dataNuova.getFullYear(), mnth, day].join("-");
      //             var nDate = nData.split("-").reverse().join(".");
      //             this.getView().byId("data1").setText(nDate)

      //             var strAmmResp = header[i].Fistl
      //             this.getView().byId("SAR1").setText(strAmmResp)

      //             var PF = header[i].Fipex
      //             this.getView().byId("PF1").setText(PF)

      //             var oggSpesa = header[i].ZoggSpesa
      //             this.getView().byId("oggSpesaNI1").setText(oggSpesa)

      //             var mese = header[i].Zmese
      //             this.getView().byId("mese1").setText(this.getDescrizioneMese(mese));

      //             for (var x = 0; x < position.length; x++) {
      //                 if (position[x].Bukrs == oEvent.getParameters().arguments.campo &&
      //                     position[x].Gjahr == oEvent.getParameters().arguments.campo1 &&
      //                     position[x].Zamministr == oEvent.getParameters().arguments.campo2 &&
      //                     position[x].ZchiaveNi == oEvent.getParameters().arguments.campo3 &&
      //                     position[x].ZidNi == oEvent.getParameters().arguments.campo4 &&
      //                     position[x].ZRagioCompe == oEvent.getParameters().arguments.campo5) {

      //                     var comp = position[x].ZcompRes
      //                     if (comp == "C") var n_comp = 'Competenza'
      //                     if (comp == "R") var n_comp = 'Residui'       //Position
      //                     this.getView().byId("comp1").setText(n_comp)

      //                 }
      //             }

      //             var statoNI = header[i].ZcodiStatoni
      //             this.getView().byId("statoNI1").setText(statoNI)

      //             var importoTot = header[i].ZimpoTotni
      //             this.getView().byId("importoTot1").setText(importoTot)

      //             this.getView().byId("InputImpLiq").setValue(importoTot)

      //             for (var m = 0; m < impegni.length; m++) {
      //                 var beneficiario = impegni[m].Lifnr
      //                 this.getView().byId("inputBeneficiario").setValue(beneficiario)

      //             }
      //             this.onCallModalità()
      //             this.onCallFornitore()
      //         }
      //     }
      // },

      // getDescrizioneMese:function(mese){
      //     var descr;
      //     switch (mese) {
      //         case "1":
      //             descr = "Gennaio"
      //             break;
      //         case "2":
      //             descr = "Febbraio"
      //             break;
      //         case "3":
      //             descr = "Marzo"
      //             break;
      //         case "4":
      //             descr = "Aprile"
      //             break;
      //         case "5":
      //             descr = "Maggio"
      //             break;
      //         case "6":
      //             descr = "Giugno"
      //             break;
      //         case "7":
      //             descr = "Luglio"
      //             break;
      //         case "8":
      //             descr = "Agosto"
      //             break;
      //         case "9":
      //             descr = "Settembre"
      //             break;
      //         case "10":
      //             descr = "Ottobre"
      //             break;
      //         case "11":
      //             descr = "Novembre"
      //             break;
      //         case "12":
      //             descr = "Dicembre"
      //             break;
      //         default:
      //             break;
      //     }
      //     return descr;
      // },

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

      // onCallFornitore(){
      //     var filtriFornitori = []
      //     var that = this
      //     var oMdlFor = new sap.ui.model.json.JSONModel();
      //     var Lifnr = this.getView().byId("inputBeneficiario").getValue()
      //     var chiavi = this.getOwnerComponent().getModel().createKey("/FornitoreSet", {
      //         Lifnr: this.getView().byId("inputBeneficiario").getValue()
      //     });

      //     this.getOwnerComponent().getModel().read(chiavi, {
      //         filters: filtriFornitori,
      //         success: function (data) {
      //             oMdlFor.setData(data);
      //             that.getView().getModel("temp").setProperty('/FornitoreSet', data)
      //             that.getView().byId("inputNome").setValue(data.ZzragSoc)

      //         },
      //         error: function (error) {
      //             var e = error;
      //         }
      //     });
      // },

      onSaveButton: function (oEvent) {
        var self = this,
          header = self.getView().getModel(MODEL_ENTITY).getProperty("/Header"),
          detail = self.getView().getModel(MODEL_ENTITY).getProperty("/Detail"),
          newVals = [];

        if (
          !detail.Lifnr ||
          detail.Lifnr === null ||
          detail.Lifnr === "" ||
          !detail.Cdc ||
          detail.Cdc === null ||
          detail.Cdc === "" ||
          !detail.Coge ||
          detail.Coge === null ||
          detail.Coge === "" ||
          !detail.CodiceGestionale ||
          detail.CodiceGestionale === null ||
          detail.CodiceGestionale === "" ||
          !detail.CausalePagamento ||
          detail.CausalePagamento === null ||
          detail.CausalePagamento === "" ||
          !detail.Zwels ||
          detail.Zwels === null ||
          detail.Zwels === "" ||
          !detail.Iban ||
          detail.Iban === null ||
          detail.Iban === ""
        ) {
          MessageBox.error("Alimentare tutti i campi obbligatori", {
            actions: [sap.m.MessageBox.Action.OK],
            emphasizedAction: MessageBox.Action.OK,
          });
          return false;
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
    });
  }
);
