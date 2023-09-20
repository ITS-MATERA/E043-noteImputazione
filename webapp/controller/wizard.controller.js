sap.ui.define(
  [
    "sap/ui/model/odata/v2/ODataModel",
    "./BaseController",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/library",
    "project1/model/DateFormatter",
  ],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (
    ODataModel,
    BaseController,
    MessageBox,
    Filter,
    FilterOperator,
    JSONModel,
    CoreLibrary,
    DateFormatter
  ) {
    "use strict";

    var ValueState = CoreLibrary.ValueState,
      oData = {
        BackButtonVisible: true,
        NextButtonVisible: true,
        PNIButtonVisible: false,
        header1Visible: true,
        header2Visible: true,
        SelezioneTitoliStep: true,
        APFStep: true,
        DatiNIStep: true,
        // HeaderNIWstep3Visible: true
      };

    return BaseController.extend("project1.controller.wizard", {
      formatter: DateFormatter,
      ZhfTipoKey: "",
      onInit: async function () {
        var oProprietà = new JSONModel(),
          oInitialModelState = Object.assign({}, oData);
        oProprietà.setData(oInitialModelState);
        this.getView().setModel(oProprietà);

        this._iSelectedStepIndex = 0;
        this._wizard = this.byId("CreateProductWizard");
        this._oNavContainer = this.byId("wizardNavContainer");
        this._oWizardContentPage = this.byId("wizardContentPage");

        this.controlPreNI();
        this.controlHeader();
        this.callVisibilità();
        this.esercizioGestione();
        this.mese();
        this.ZcompRes();
        this.strutturaAmministrativa();
        this.posizioneFinanziaria();
        this.ZhfTipoKey = "";
        // this.ZdescPgNi()
        // this.ZdescCap()
        //this.onSearch()

        var oModelJsonWizardStep1selected = new JSONModel({
          wizardStep1selected: [],
          totaleResiduoSelezionati: 0,
        });

        this.getView().setModel(
          oModelJsonWizardStep1selected,
          "wizardStep1selected"
        );
      },

      esercizioGestione: function () {
        var that = this;
        var oMdl = new sap.ui.model.json.JSONModel();
        this.getOwnerComponent()
          .getModel()
          .read("/ZgjahrEngNiSet", {
            filters: [],
            urlParameters: "",
            success: function (data) {
              oMdl.setData(data.results);
              that
                .getView()
                .getModel("temp")
                .setProperty("/ZgjahrEngNiSet", data.results);
            },
            error: function (error) {
              //that.getView().getModel("temp").setProperty(sProperty,[]);
              //that.destroyBusyDialog();
              var e = error;
            },
          });
      },

      mese: function () {
        var that = this;
        var oMdl = new sap.ui.model.json.JSONModel();
        this.getOwnerComponent()
          .getModel()
          .read("/ZmeseSet", {
            filters: [],
            urlParameters: "",
            success: function (data) {
              oMdl.setData(data.results);
              that
                .getView()
                .getModel("temp")
                .setProperty("/ZmeseSet", data.results);
            },
            error: function (error) {
              //that.getView().getModel("temp").setProperty(sProperty,[]);
              //that.destroyBusyDialog();
              var e = error;
            },
          });
      },

      ZcompRes: function () {
        var that = this;
        var oMdl = new sap.ui.model.json.JSONModel();
        this.getOwnerComponent()
          .getModel()
          .read("/ZcompResNISet", {
            filters: [],
            urlParameters: "",
            success: function (data) {
              oMdl.setData(data.results);
              that
                .getView()
                .getModel("temp")
                .setProperty("/ZcompResNISet", data.results);
            },
            error: function (error) {
              //that.getView().getModel("temp").setProperty(sProperty,[]);
              //that.destroyBusyDialog();
              var e = error;
            },
          });
      },

      strutturaAmministrativa: function () {
        var that = this;
        var oMdl = new sap.ui.model.json.JSONModel();
        this.getOwnerComponent()
          .getModel()
          .read("/FistlNiSet", {
            filters: [],
            urlParameters: "",
            success: function (data) {
              oMdl.setData(data.results);
              that
                .getView()
                .getModel("temp")
                .setProperty("/FistlNiSet", data.results);
            },
            error: function (error) {
              //that.getView().getModel("temp").setProperty(sProperty,[]);
              //that.destroyBusyDialog();
              var e = error;
            },
          });
      },

      posizioneFinanziaria: function () {
        var that = this;
        var oMdl = new sap.ui.model.json.JSONModel();
        this.getOwnerComponent()
          .getModel()
          .read("/FipexNiSet", {
            filters: [],
            urlParameters: "",
            success: function (data) {
              oMdl.setData(data.results);
              that
                .getView()
                .getModel("temp")
                .setProperty("/FipexNiSet", data.results);
            },
            error: function (error) {
              //that.getView().getModel("temp").setProperty(sProperty,[]);
              //that.destroyBusyDialog();
              var e = error;
            },
          });
      },

      ZdescPgNi: function () {
        var that = this;
        var oMdl = new sap.ui.model.json.JSONModel();
        var datiNI = [];
        var oModel = this.getOwnerComponent().getModel();
        var Zamministr = "";
        if (this.getView().getModel("temp").getData().ZamministrNiSet)
          Zamministr = this.getView().getModel("temp").getData()
            .ZamministrNiSet[0].Zamministr;

        // datiNI.push(new Filter({
        //     path: "Fipex",
        //     operator: FilterOperator.EQ,
        //     value1: this.getView().byId("input_PF").getValue()
        // }));

        // datiNI.push(new Filter({
        //     path: "Gjahr",
        //     operator: FilterOperator.EQ,
        //     value1: this.getView().byId("es_gestione").getSelectedKey()
        // }));

        // datiNI.push(new Filter({
        //     path: "Zamministr",
        //     operator: FilterOperator.EQ,
        //     value1: Zamministr
        // }));

        var chiavi = oModel.createKey("/ZdescPgNiSet", {
          Fipex: this.getView().byId("input_PF").getValue(),
          Gjahr: this.getView().byId("es_gestione").getSelectedKey(),
          Zamministr: Zamministr,
        });

        oModel.read(chiavi, {
          filters: [],
          urlParameters: "",
          success: function (data) {
            oMdl.setData(data);
            that.getView().getModel("temp").setProperty("/ZdescPgNiSet", data);
            that.getView().byId("descrizioneCap").setValue(data.DescrEstesa);
            that.ZdescCap();
          },
          error: function (error) {
            //that.getView().getModel("temp").setProperty(sProperty,[]);
            //that.destroyBusyDialog();
            var e = error;
          },
        });
      },

      ZdescCap: function () {
        var that = this;
        var oMdl = new sap.ui.model.json.JSONModel();
        var datiNI = [];
        var oModel = this.getOwnerComponent().getModel();
        var Zamministr = this.getView().getModel("temp").getData()
          .ZamministrNiSet[0].Zamministr;

        // datiNI.push(new Filter({
        //     path: "Fipex",
        //     operator: FilterOperator.EQ,
        //     value1: this.getView().byId("input_PF").getValue()
        // }));

        // datiNI.push(new Filter({
        //     path: "Gjahr",
        //     operator: FilterOperator.EQ,
        //     value1: this.getView().byId("es_gestione").getSelectedKey()
        // }));

        // datiNI.push(new Filter({
        //     path: "Zamministr",
        //     operator: FilterOperator.EQ,
        //     value1: Zamministr
        // }));

        var chiavi = oModel.createKey("/ZdescCapSet", {
          Fipex: this.getView().byId("input_PF").getValue(),
          Gjahr: this.getView().byId("es_gestione").getSelectedKey(),
          Zamministr: Zamministr,
        });

        oModel.read(chiavi, {
          filters: [],
          urlParameters: "",
          success: function (data) {
            oMdl.setData(data);
            that.getView().getModel("temp").setProperty("/ZdescCapSet", data);
            that.getView().byId("descrizionePG").setValue(data.DescrEstesa);
          },
          error: function (error) {
            //that.getView().getModel("temp").setProperty(sProperty,[]);
            //that.destroyBusyDialog();
            var e = error;
          },
        });
      },

      onCallHeader: function (oEvent) {
        var that = this;
        var oMdl = new sap.ui.model.json.JSONModel();
        this.getOwnerComponent()
          .getModel()
          .read("/HeaderNISet", {
            filters: [],
            urlParameters: "",
            success: function (data) {
              oMdl.setData(data.results);
              that
                .getView()
                .getModel("temp")
                .setProperty("/HeaderNISet", data.results);
            },
            error: function (error) {
              //that.getView().getModel("temp").setProperty(sProperty,[]);
              //that.destroyBusyDialog();
              var e = error;
            },
          });
      },

      // ZhfTipo - START
      handleValueHelpZhfTipo: function (oEvent) {
        var self = this;
        var oDialog = self.openDialog("project1.fragment.Help.zhfTipo");
        self
          .getOwnerComponent()
          .getModel()
          .read("/ZhfTipoSet", {
            success: function (data, oResponse) {
              var oModelJson = new sap.ui.model.json.JSONModel();
              oModelJson.setData(data.results);
              var oTable = sap.ui.getCore().byId("selectDialogZhfTipo");
              oTable.setModel(oModelJson, "ZhfTipoSet");
              oDialog.open();
            },
            error: function (error) {},
          });
      },

      handleValueHelpValueCloseZhfTipo: function (oEvent) {
        var self = this,
          tipologiaId = self.getView().byId("tipologia"),
          sottotipologia = self.getView().byId("sottotipologia"),
          key,
          selected = oEvent.getParameter("selectedItem");

        self.ZhfTipoKey = "";
        if (!selected) {
          self.getView().getModel("temp").setProperty("/ZhfSottotipo", []);
          self.closeDialog();
          return;
        }

        key = oEvent.getParameter("selectedItem").data("key");
        tipologiaId.setValue(selected.getTitle());
        self.ZhfTipoKey = key;

        if (key) {
          var filters = [];
          filters.push(
            new Filter({
              path: "ZcodTipo",
              operator: FilterOperator.EQ,
              value1: key,
            })
          );

          self
            .getOwnerComponent()
            .getModel()
            .read("/ZhfSottotipoSet", {
              filters: filters,
              success: function (data, oResponse) {
                self
                  .getView()
                  .getModel("temp")
                  .setProperty("/ZhfSottotipo", data.results);
              },
              error: function (error) {},
            });
        } else {
          self.getView().getModel("temp").setProperty("/ZhfSottotipo", []);
        }
        self.closeDialog();
      },

      handleValueHelpSearchZhfTipo: function (oEvent) {
        var self = this,
          sValue = oEvent.getParameter("value"),
          oFilter = [],
          qFilters = [];

        oFilter.push(
          self.createFilter(
            "Ztipo",
            sap.ui.model.FilterOperator.Contains,
            sValue,
            false
          )
        );
        qFilters = new sap.ui.model.Filter({ filters: oFilter, and: false });
        oEvent.getSource().getBinding("items").filter(qFilters);
      },

      createFilter: function (key, operator, value, useToLower) {
        return new sap.ui.model.Filter(
          key,
          operator,
          useToLower ? "'" + value.toLowerCase() + "'" : value
        );
      },
      // ZhfTipo - END

      viewHeader1_old: function () {
        var oModelHeader = new sap.ui.model.json.JSONModel();
        var rows = this.getView().byId("HeaderNIW").getSelectedItems();
        //console.log(rows)
        var lunghezza = rows.length;
        //var arrayHeader=[]
        var importoTot = 0;
        for (var i = 0; i < rows.length; i++) {
          //var campo = parseFloat(rows[i].getBindingContext("HeaderNIW").getObject().ZimpoTitolo)
          //var campo = parseFloat(rows[i].getBindingContext("HeaderNIW").getObject().ZimpoTitolo)
          var numeri = rows[i]
            .getBindingContext("HeaderNIW")
            .getObject()
            .ZimpoTitolo.split(".");
          var numeroIntero = "";
          for (var n = 0; n < numeri.length; n++) {
            numeroIntero = numeroIntero + numeri[n];
            //var numeroFloat = parseFloat(numeroIntero)
            if (numeroIntero.split(",").length > 1) {
              var virgole = numeroIntero.split(",");
              numeroIntero = virgole[0] + "." + virgole[1];
            }
          }
          if (rows.length != 1) {
            var numeroFloat = parseFloat(numeroIntero);
            importoTot = importoTot + numeroFloat;
          }
          importoTot = numeroIntero;
        }
        var num = importoTot.toString();
        var importoPrimaVirgola = num.split(".");
        //var indice = num.split("").length
        var numPunti = "";
        var migliaia = importoPrimaVirgola[0]
          .split("")
          .reverse()
          .join("")
          .match(/.{1,3}/g)
          .map(function (x) {
            return x.split("").reverse().join("");
          })
          .reverse();

        for (var i = 0; i < migliaia.length; i++) {
          numPunti = numPunti + migliaia[i] + ".";
        }

        //var ZimpoTotni = numPunti+importoPrimaVirgola[1]

        // var puntiSeparati = numPunti.split(".")
        // var numeroTotale = ""
        // for (var i = 0; i < puntiSeparati.length; i++) {
        //     if (puntiSeparati[i] != "")
        //         numeroTotale = numeroTotale + puntiSeparati[i]
        // }
        var indice = numPunti.split("").length;
        var totale =
          numPunti.substring(0, indice - 1) + "," + importoPrimaVirgola[1];
        let array = totale.split(",");
        let valoreTagliato = array[1].substring(0, 2);
        var totale = array[0] + "," + valoreTagliato;

        //console.log(importoTot)
        var es_gestione = this.getView().byId("es_gestione").getSelectedKey();
        //console.log(es_gestione)
        var Mese = this.getView().byId("mese").getSelectedItem()
          .mProperties.text;
        var competenza = this.getView().byId("competenza").getValue();
        //console.log(Mese)
        this.getView().byId("es_gestioneWH1").setText(es_gestione);
        this.getView().byId("meseWH1").setText(Mese);
        this.getView()
          .byId("n_righeTotWH1")
          .setText(lunghezza + " per un totale di " + totale);
        if (competenza == "C") competenza = "Competenza";
        if (competenza == "R") competenza = "Residui";
        this.getView().byId("compWH1").setText(competenza);

        oModelHeader.setData();
        this.getView().setModel(oModelHeader, "h1");
        //console.log(oModelHeader)
      },

      viewHeader1: function () {
        var oModelHeader = new sap.ui.model.json.JSONModel();
        // var rows = this.getView().byId("HeaderNIW").getSelectedItems()
        var rows = this.getView()
          .getModel("wizardStep1selected")
          .getProperty("/wizardStep1selected");
        //console.log(rows)
        var lunghezza = rows.length;
        //var arrayHeader=[]

        var importoTot = this.getView()
          .getModel("wizardStep1selected")
          .getProperty("/totaleResiduoSelezionati");

        // var importoTot = 0;
        // var numeroFloat = 0;
        // for (var i = 0; i < rows.length; i++) {
        //     numeroFloat = 0;
        //     numeroFloat = rows[i].getBindingContext("HeaderNIW").getObject().ZimpoTitolo;
        //     //numeroFloat = rows[i].getBindingContext("HeaderNIW").getObject().ZimpoRes;
        //     importoTot = importoTot + parseFloat(numeroFloat);
        // }
        var totale = parseFloat(importoTot).toFixed(2);
        totale = this.formatter.convertFormattedNumber(totale);
        //TODO:da canc
        // var num = importoTot.toString();
        // var importoPrimaVirgola = num.split(".")
        // //var indice = num.split("").length
        // var numPunti = ""
        // var migliaia = importoPrimaVirgola[0].split('').reverse().join('').match(/.{1,3}/g).map(function (x) {
        //     return x.split('').reverse().join('')
        // }).reverse()

        // for (var i = 0; i < migliaia.length; i++) {
        //     numPunti = (numPunti + migliaia[i] + ".")
        // }

        // //var ZimpoTotni = numPunti+importoPrimaVirgola[1]

        // // var puntiSeparati = numPunti.split(".")
        // // var numeroTotale = ""
        // // for (var i = 0; i < puntiSeparati.length; i++) {
        // //     if (puntiSeparati[i] != "")
        // //         numeroTotale = numeroTotale + puntiSeparati[i]
        // // }
        // var indice = numPunti.split("").length
        // var totale = numPunti.substring(0, indice - 1) + "," + importoPrimaVirgola[1]
        // let array = totale.split(",")
        // let valoreTagliato = array[1].substring(0, 2)
        // var totale = array[0] + "," + valoreTagliato

        //console.log(importoTot)
        var es_gestione = this.getView().byId("es_gestione").getSelectedKey();
        //console.log(es_gestione)
        var Mese = this.getView().byId("mese").getSelectedItem()
          .mProperties.text;
        var competenza = this.getView().byId("competenza").getValue();
        //console.log(Mese)
        this.getView().byId("es_gestioneWH1").setText(es_gestione);
        this.getView().byId("meseWH1").setText(Mese);
        this.getView()
          .byId("n_righeTotWH1")
          .setText(lunghezza + " per un totale di " + totale);
        if (competenza == "C") competenza = "Competenza";
        if (competenza == "R") competenza = "Residui";
        this.getView().byId("compWH1").setText(competenza);

        oModelHeader.setData();
        this.getView().setModel(oModelHeader, "h1");
        //console.log(oModelHeader)
      },

      filtriStep1: function () {
        //console.log(oMdl)

        var that = this;
        var oMdl = new sap.ui.model.json.JSONModel();
        this.getOwnerComponent()
          .getModel()
          .read("/HeaderNISet", {
            filters: [],
            urlParameters: "",
            success: function (data) {
              oMdl.setData(data.results);
              that
                .getView()
                .getModel("temp")
                .setProperty("/HeaderNISet", data.results);
            },
            error: function (error) {
              //that.getView().getModel("temp").setProperty(sProperty,[]);
              //that.destroyBusyDialog();
              var e = error;
            },
          });
      },

      viewHeader2: function () {
        //var oModelHeader = new sap.ui.model.json.JSONModel();
        var rows = this.getView().byId("HeaderNIW").getSelectedItems();
        var lunghezza = rows.length;
        var importoTot = this.getView()
          .getModel("wizardStep1selected")
          .getProperty("/totaleResiduoSelezionati");
        // var importoTot = 0;
        // var numeroFloat = 0;
        // for (var i = 0; i < rows.length; i++) {
        //     numeroFloat = 0;
        //     // numeroFloat = rows[i].getBindingContext("HeaderNIW").getObject().ZimpoTitolo;
        //     // numeroFloat = rows[i].getBindingContext("HeaderNIW").getObject().ZimpoRes;
        //     numeroFloat = rows[i].ZimpoRes;
        //     importoTot = importoTot + parseFloat(numeroFloat);
        // }
        var totale = parseFloat(importoTot).toFixed(2);
        totale = this.formatter.convertFormattedNumber(totale);

        //TODO:da canc

        // for (var i = 0; i < rows.length; i++) {
        //     //var campo = parseFloat(rows[i].getBindingContext("HeaderNIW").getObject().ZimpoTitolo)
        //     //var campo = parseFloat(rows[i].getBindingContext("HeaderNIW").getObject().ZimpoTitolo)
        //     var numeri = (rows[i].getBindingContext("HeaderNIW").getObject().ZimpoTitolo).split(".")
        //     var numeroIntero = ""
        //     for (var n = 0; n < numeri.length; n++) {
        //         numeroIntero = numeroIntero + numeri[n]
        //         //var numeroFloat = parseFloat(numeroIntero)
        //         if (numeroIntero.split(",").length > 1) {
        //             var virgole = numeroIntero.split(",")
        //             numeroIntero = virgole[0] + "." + virgole[1]
        //         }
        //     }
        //     if (rows.length != 1) {
        //         var numeroFloat = parseFloat(numeroIntero)
        //         importoTot = importoTot + numeroFloat
        //     }
        //     importoTot = numeroIntero
        // }
        // var num = importoTot.toString();
        // var importoPrimaVirgola = num.split(".")
        // //var indice = num.split("").length
        // var numPunti = ""
        // var migliaia = importoPrimaVirgola[0].split('').reverse().join('').match(/.{1,3}/g).map(function (x) {
        //     return x.split('').reverse().join('')
        // }).reverse()

        // for (var i = 0; i < migliaia.length; i++) {
        //     numPunti = (numPunti + migliaia[i] + ".")
        // }

        // //var ZimpoTotni = numPunti+importoPrimaVirgola[1]

        // // var puntiSeparati = numPunti.split(".")
        // // var numeroTotale = ""
        // // for (var i = 0; i < puntiSeparati.length; i++) {
        // //     if (puntiSeparati[i] != "")
        // //         numeroTotale = numeroTotale + puntiSeparati[i]
        // // }
        // var indice = numPunti.split("").length
        // var totale = numPunti.substring(0, indice - 1) + "," + importoPrimaVirgola[1]
        // let array = totale.split(",")
        // let valoreTagliato = array[1].substring(0, 2)
        // var totale = array[0] + "," + valoreTagliato

        //console.log(importoTot)
        var es_gestione = this.getView().byId("es_gestione").getSelectedKey();
        //console.log(es_gestione)
        var Mese = this.getView().byId("mese").getSelectedItem()
          .mProperties.text;
        var PF = this.getView().byId("input_PF").getValue();
        //var Sottotipologia = this.getView().byId("sottotipologia").getSelectedItem().mProperties.text;
        var SAR = this.getView().byId("strAmmResp").getValue();
        var competenza = this.getView().byId("competenza").getValue();
        var descCap = this.getView().byId("descrizioneCap").getValue();
        var descPG = this.getView().byId("descrizionePG").getValue();

        //console.log(Mese)

        this.getView().byId("es_gestioneWH2").setText(es_gestione);
        this.getView().byId("meseWH2").setText(Mese);
        this.getView()
          .byId("n_righeTotWH2")
          .setText(lunghezza + " per un totale di " + totale);
        this.getView().byId("desc_CapWH2").setText(descCap);
        this.getView().byId("pos_FinWH2").setText(PF);
        this.getView().byId("SARWH2").setText(SAR);
        this.getView().byId("desc_PGWH2").setText(descPG);
        if (competenza == "C") competenza = "Competenza";
        if (competenza == "R") competenza = "Residui";
        this.getView().byId("compWH2").setText(competenza);

        // oModelHeader.setData();
        // this.getView().setModel(oModelHeader, "h1");
        //console.log(oModelHeader)
      },

      filtriStep2: function () {
        var oModelHeader = new sap.ui.model.json.JSONModel();
        var Mese = this.getView().byId("mese").getSelectedItem()
          .mProperties.text;

        // switch (Mese) {
        //     case "1":
        //         var nMese = "Gennaio"
        //         break;
        //     case "2":
        //         var nMese = "Febbraio"
        //         break;
        //     case "3":
        //         var nMese = "Marzo"
        //         break;
        //     case "4":
        //         var nMese = "Aprile"
        //         break;
        //     case "5":
        //         var nMese = "Maggio"
        //         break;
        //     case "6":
        //         var nMese = "Giugno"
        //         break;
        //     case "7":
        //         var nMese = "Luglio"
        //         break;
        //     case "8":
        //         var nMese = "Agosto"
        //         break;
        //     case "9":
        //         var nMese = "Settembre"
        //         break;
        //     case "10":
        //         var nMese = "Ottobre"
        //         break;
        //     case "11":
        //         var nMese = "Novembre"
        //         break;
        //     case "12":
        //         var nMese = "Dicembre"
        //         break;
        //     default: break;

        // }

        //this.getView().byId("oggSpesa").setValue("Pagamenti interessi BTP di " + Mese)
        oModelHeader.setData();
        //console.log(oModelHeader)
      },

      selectedRow: function () {
        var rows = this.getView().byId("HeaderNIW").getSelectedItems();
        this.getView().getModel("temp").setProperty("/RigheSelezionate", rows);
        // if(rows){
        //     oProprietà.setProperty("/HeaderNIWstep3Visible", false);
        // }
        var array = [];
        var oMdlWstep3 = new sap.ui.model.json.JSONModel();
        for (var i = 0; i < rows.length; i++) {
          var campo = rows[i].getBindingContext("HeaderNIW").getObject();
          // campo.ZimpoTitolo = campo.ZimpoRes
          campo.ZimpoRes = "0.00";
          array.push(campo);
        }
        oMdlWstep3.setData(array);
        this.getView().setModel(oMdlWstep3, "HeaderNIWstep3");

        // console.log(oMdlWstep3)
      },

      onSearch: function (oEvent) {
        var es_gestione = this.getView().byId("es_gestione").getSelectedKey();
        var mese = this.getView().byId("mese").getSelectedItem();

        if (es_gestione == "" && mese == null) {
          MessageBox.error("Alimentare tutti i campi obbligatori", {
            actions: [sap.m.MessageBox.Action.OK],
            emphasizedAction: MessageBox.Action.OK,
          });
        } else if (es_gestione == "") {
          MessageBox.error("Alimentare tutti i campi obbligatori", {
            actions: [sap.m.MessageBox.Action.OK],
            emphasizedAction: MessageBox.Action.OK,
          });
        } else if (mese == null) {
          MessageBox.error("Alimentare tutti i campi obbligatori", {
            actions: [sap.m.MessageBox.Action.OK],
            emphasizedAction: MessageBox.Action.OK,
          });
        } else {
          //this.onCallHeader();
          var oModelP = this.getRendicontazione();
        }
      },

      getRendicontazione: function () {
        var self = this,
          filters = [],
          oEsercizio = self.getView().byId("es_gestione"),
          oMese = self.getView().byId("mese"),
          oTipo = self.getView().byId("tipologia"),
          oSottotipo = self.getView().byId("sottotipologia"),
          oCompetenza = self.getView().byId("competenza");

        filters.push(
          new Filter({
            path: "Gjahr",
            operator: FilterOperator.EQ,
            value1: oEsercizio.getSelectedKey(),
          })
        );
        filters.push(
          new Filter({
            path: "Zmese",
            operator: FilterOperator.EQ,
            value1: oMese.getSelectedKey(),
          })
        );

        if (oTipo && self.ZhfTipoKey !== "")
          filters.push(
            new Filter({
              path: "ZcodTipo",
              operator: FilterOperator.EQ,
              value1: self.ZhfTipoKey,
            })
          );

        if (
          oSottotipo &&
          oSottotipo.getSelectedKey() &&
          oSottotipo.getSelectedKey() !== ""
        )
          filters.push(
            new Filter({
              path: "ZcodSottotipo",
              operator: FilterOperator.EQ,
              value1: oSottotipo.getSelectedKey(),
            })
          );

        if (
          oCompetenza &&
          oCompetenza.getSelectedKey() &&
          oCompetenza.getSelectedKey() !== ""
        )
          filters.push(
            new Filter({
              path: "ZcompRes",
              operator: FilterOperator.EQ,
              value1: oCompetenza.getSelectedKey(),
            })
          );

        self
          .getOwnerComponent()
          .getModel()
          .read("/RendicontazioneSet", {
            filters: filters,
            success: function (data, oResponse) {
              var oModelJson = new sap.ui.model.json.JSONModel();
              oModelJson.setData(data.results);
              self.getView().setModel(oModelJson, "HeaderNIW");
            },
            error: function (error) {
              self.getView().setModel([], "HeaderNIW");
            },
          });
      },

      // callVisibilità: function () {
      //     var that = this
      //     var filters = []
      //     filters.push(
      //         new Filter({ path: "SEM_OBJ", operator: FilterOperator.EQ, value1: "ZS4_NOTEIMPUTAZIONI_SRV" }),
      //         new Filter({ path: "AUTH_OBJ", operator: FilterOperator.EQ, value1: "Z_GEST_NI" })
      //     )
      //     // "ODataModel" required from module "sap/ui/model/odata/v2/ODataModel"
      //     var visibilità = new ODataModel("http://10.38.125.80:8000/sap/opu/odata/sap/ZSS4_CA_CONI_VISIBILITA_SRV/");
      //     visibilità.read("/ZES_CONIAUTH_SET", {
      //         filters: filters,
      //         urlParameters: "",
      //         success: function (data) {
      //             console.log("success")
      //             //oMdl.setData(data.results);
      //             that.getView().getModel("temp").setProperty('/Visibilità', data.results)
      //             //that.pulsantiVisibiltà(data.results)
      //         },
      //         error: function (error) {
      //             console.log(error)
      //             //that.getView().getModel("temp").setProperty(sProperty,[]);
      //             //that.destroyBusyDialog();
      //             var e = error;
      //         }
      //     });
      // },

      callVisibilità: function () {
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
                .getModel("temp")
                .setProperty("/Visibilità", data.results);
              //self.pulsantiVisibiltà(data.results)
            },
            error: function (error) {
              console.log(error);
              //that.getView().getModel("temp").setProperty(sProperty,[]);
              //that.destroyBusyDialog();
              var e = error;
            },
          });
      },

      onPreimpNI: function (oEvent) {
        var countValoriMinori = 0;
        var that = this;
        var visibilità = this.getView().getModel("temp").getData()
          .Visibilità[0];
        var RigheSelezionate = this.getView()
          .getModel("temp")
          .getData().RigheSelezionate;
        //var rows= this.getView().byId("HeaderNIW").getSelectedItem()

        var N_es_gestione = this.getView().byId("es_gestione").getSelectedKey(); //header
        var N_Mese = this.getView().byId("mese").getSelectedItem()
          .mProperties.text; //header

        switch (N_Mese) {
          case "Gennaio":
            var nMese = "1";
            break;
          case "Febbraio":
            var nMese = "2";
            break;
          case "Marzo":
            var nMese = "3";
            break;
          case "Aprile":
            var nMese = "4";
            break;
          case "Maggio":
            var nMese = "5";
            break;
          case "Giugno":
            var nMese = "6";
            break;
          case "Luglio":
            var nMese = "7";
            break;
          case "Agosto":
            var nMese = "8";
            break;
          case "Settembre":
            var nMese = "9";
            break;
          case "Ottobre":
            var nMese = "10";
            break;
          case "Novembre":
            var nMese = "11";
            break;
          case "Dicembre":
            var nMese = "12";
            break;
          default:
            break;
        }
        if (this.getView().byId("tipologia").getValue() != "")
          var N_Tipologia = this.getView().byId("tipologia").getValue(); //position
        if (this.getView().byId("sottotipologia").getSelectedItem() != null)
          var N_Sottotipologia = this.getView()
            .byId("sottotipologia")
            .getSelectedItem().mProperties.text; //position
        if (
          this.getView().byId("competenza").getSelectedItem() != null ||
          this.getView().byId("competenza").getValue() != ""
        ) {
          var competenza = this.getView().byId("competenza").mProperties.value; //position
          if (competenza == "Competenza") var N_CR = "C";
          if (competenza == "Residui") var N_CR = "R";
        }
        var N_ImportoTot = this.getView()
          .byId("n_righeTotWH2")
          .getText()
          .split(" ")[5];

        var puntiSeparati = N_ImportoTot.split(".");
        var numeroTotale = "";
        for (var i = 0; i < puntiSeparati.length; i++) {
          if (puntiSeparati[i] != "")
            numeroTotale = numeroTotale + puntiSeparati[i];
        }
        var virgoleTot = numeroTotale.split(",");
        var ZimpoTotni = virgoleTot[0] + "." + virgoleTot[1];

        var N_oggSpesa = this.getView().byId("oggSpesa").getValue(); //header
        var N_esercizioPF = this.getView().byId("input_PF").getValue(); //header
        var N_strAmmResp = this.getView().byId("strAmmResp").getValue(); //header
        // var descrizioneCap = this.getView().byId("descrizioneCap").getValue()
        // var descrizionePG = this.getView().byId("descrizionePG").getValue()

        if (N_oggSpesa == "") {
          MessageBox.error("Oggetto della spesa non inserito!", {
            actions: [sap.m.MessageBox.Action.OK],
            emphasizedAction: MessageBox.Action.OK,
          });
        } else {
          var oDataModel = that.getOwnerComponent().getModel();
          //var sommaImporto = 0.00

          var oItems = that
            .getView()
            .byId("HeaderNIWstep3")
            .getBinding("items").oList;
          var deepEntity = {
            HeaderNISet: null,
            PositionNISet: [],
            Funzionalita: "PREIMPOSTAZIONE",
          };

          for (var i = 0; i < oItems.length; i++) {
            var item = oItems[i];

            deepEntity.PositionNISet.push({
              //Bukrs Passato Da BE
              Gjahr: N_es_gestione,
              //Zamministr: item.Zamministr, Passato Da BE
              //ZidNi: Valore Incrementato da BE
              //ZRagioCompe: item.ZRagioCompe, Passato Da BE
              ZposNi: item.ZposNi,
              ZgjahrEng: N_es_gestione,
              Ztipo: item.Ztipo,
              Zsottotipo: N_Sottotipologia,
              ZcompRes: N_CR,
              ZimpoTitolo: item.ZimpoTitolo,
              Zdescrizione: item.Zdescrizione,
              ZcodIsin: item.ZcodIsin,
              ZdataPag: new Date(),
            });

            //TODO:da canc
            // var numeroIntero = item.ZimpoTitolo
            // var numIntTot = ""
            // if (numeroIntero.split(".").length > 1) {
            //     var numeri = numeroIntero.split(".")
            //     for (var n = 0; n < numeri.length; n++) {
            //         numIntTot = numIntTot + numeri[n]
            //         //var numeroFloat = parseFloat(numeroIntero)
            //         if (numIntTot.split(",").length > 1) {
            //             var virgole = numIntTot.split(",")
            //             var numeroInteroSM = virgole[0] + "." + virgole[1]
            //         }
            //     }
            //     var importoPrimaVirgola = numeroIntero.split(".")
            //     var numPunti = ""
            //     var migliaia = importoPrimaVirgola[0].split('').reverse().join('').match(/.{1,3}/g).map(function (x) {
            //         return x.split('').reverse().join('')
            //     }).reverse()

            //     for (var migl = 0; migl < migliaia.length; migl++) {
            //         numPunti = (numPunti + migliaia[migl] + ".")
            //     }
            //     var indice = numPunti.split("").length
            //     var numeroIntero = numPunti.substring(0, indice - 1) + "," + importoPrimaVirgola[1]
            //     deepEntity.PositionNISet[i].ZimpoTitolo = numeroInteroSM
            // }
            // else {
            //     var importoPrimaVirgola = numeroIntero.split(",")
            //     var numeroInteroSM = importoPrimaVirgola[0] + "." + importoPrimaVirgola[1]
            //     deepEntity.PositionNISet[i].ZimpoTitolo = numeroInteroSM
            // }
          }

          deepEntity.HeaderNISet = {
            //Bukrs Passato Da BE
            Gjahr: N_es_gestione,
            //Zamministr: item.Zamministr, Passato Da BE
            //ZidNi: Valore Incrementato da BE
            //ZRagioCompe: item.ZRagioCompe, Passato Da BE
            ZcodiStatoni: "00",
            ZimpoTotni: ZimpoTotni,
            //ZzGjahrEngPos: N_es_gestione,
            Zmese: nMese,
            ZoggSpesa: N_oggSpesa,
            Fipex: N_esercizioPF,
            Fistl: N_strAmmResp,
            ZdataCreaz: new Date(),
            //ZutenteCreazione: sap.ushell.Container.getService("UserInfo").getId(),
            ZdataModiNi: new Date(),
            //ZutenteModifica: sap.ushell.Container.getService("UserInfo").getId()
          };

          var importoTot = 0.0;
          var rows = this.getView().byId("HeaderNIW").getSelectedItems();
          for (var p = 0; p < rows.length; p++) {
            var numeri = rows[p]
              .getBindingContext("HeaderNIW")
              .getObject()
              .ZimpoTitolo.split(".");
            var numeroIntero = "";
            for (var q = 0; q < numeri.length; q++) {
              numeroIntero = numeroIntero + numeri[q];
              //var numeroFloat = parseFloat(numeroIntero)
              if (numeroIntero.split(",").length > 1) {
                var virgole = numeroIntero.split(",");
                numeroIntero = virgole[0] + "." + virgole[1];
              }
            }
            var numeroFloat = parseFloat(numeroIntero);
            importoTot = importoTot + numeroFloat;
          }
          // var sommaImporto = 0.00
          // for (var x = 0; x < deepEntity.PositionNISet.length; x++) {
          //     sommaImporto = sommaImporto + parseFloat(deepEntity.PositionNISet[x].ZimpoTitolo)
          // }
          countValoriMinori = 0;
          for (
            var titolo = 0;
            titolo <
            this.getView().byId("HeaderNIWstep3").mAggregations.items.length;
            titolo++
          ) {
            var numeroInteroTitolo =
              this.getView().byId("HeaderNIWstep3").mAggregations.items[titolo]
                .oBindingContexts.HeaderNIWstep3.oModel.oData[titolo]
                .ZimpoTitolo;
            var numeroResiduo =
              this.getView().byId("HeaderNIWstep3").mAggregations.items[titolo]
                .oBindingContexts.HeaderNIWstep3.oModel.oData[titolo].ZimpoRes;

            if (parseFloat(numeroInteroTitolo) < parseFloat(numeroResiduo))
              countValoriMinori++;
          }

          //TODO:da canc
          // for (var titolo = 0; titolo < this.getView().byId("HeaderNIWstep3").mAggregations.items.length; titolo++) {

          //     var numeroInteroTitolo = this.getView().byId("HeaderNIWstep3").mAggregations.items[titolo].oBindingContexts.HeaderNIWstep3.oModel.oData[titolo].ZimpoTitolo
          //     var numIntTot = ""
          //     if (numeroInteroTitolo.split(".").length > 1) {
          //         var numeri = numeroInteroTitolo.split(".")
          //         for (var n = 0; n < numeri.length; n++) {
          //             numIntTot = numIntTot + numeri[n]
          //             //var numeroFloat = parseFloat(numeroIntero)
          //             if (numIntTot.split(",").length > 1) {
          //                 var virgole = numIntTot.split(",")
          //                 var numeroInteroTitoloPunto = virgole[0] + "." + virgole[1]
          //             }
          //         }
          //         var importoPrimaVirgola = numeroIntero.split(".")
          //         var numPunti = ""
          //         var migliaia = importoPrimaVirgola[0].split('').reverse().join('').match(/.{1,3}/g).map(function (x) {
          //             return x.split('').reverse().join('')
          //         }).reverse()

          //         for (var migl = 0; migl < migliaia.length; migl++) {
          //             numPunti = (numPunti + migliaia[migl] + ".")
          //         }
          //         var indice = numPunti.split("").length
          //         var numeroInteroTitoloVirgola = numPunti.substring(0, indice - 1) + "," + importoPrimaVirgola[1]

          //     }

          //     else {
          //         var importoPrimaVirgola = numeroInteroTitolo.split(",")
          //         var numeroInteroTitoloPunto = importoPrimaVirgola[0] + "." + importoPrimaVirgola[1]
          //     }

          //     var numeroInteroResiduo = RigheSelezionate[titolo].mAggregations.cells[5].mProperties.text
          //     var numIntTot = ""
          //     if (numeroInteroResiduo.split(".").length > 1) {
          //         var numeri = numeroIntero.split(".")
          //         for (var n = 0; n < numeri.length; n++) {
          //             numIntTot = numIntTot + numeri[n]
          //             //var numeroFloat = parseFloat(numeroInteroResiduo)
          //             if (numIntTot.split(",").length > 1) {
          //                 var virgole = numIntTot.split(",")
          //                 var numeroInteroResiduoPunto = virgole[0] + "." + virgole[1]
          //             }
          //         }
          //         var importoPrimaVirgola = numeroIntero.split(".")
          //         var numPunti = ""
          //         var migliaia = importoPrimaVirgola[0].split('').reverse().join('').match(/.{1,3}/g).map(function (x) {
          //             return x.split('').reverse().join('')
          //         }).reverse()

          //         for (var migl = 0; migl < migliaia.length; migl++) {
          //             numPunti = (numPunti + migliaia[migl] + ".")
          //         }
          //         var indice = numPunti.split("").length
          //         var numeroInteroResiduoVirgola = numPunti.substring(0, indice - 1) + "," + importoPrimaVirgola[1]

          //     }

          //     else {
          //         var importoPrimaVirgola = numeroInteroResiduo.split(",")
          //         var numeroInteroResiduoPunto = importoPrimaVirgola[0] + "." + importoPrimaVirgola[1]
          //     }

          //     if (parseFloat(numeroInteroTitoloPunto) < parseFloat(numeroInteroResiduoPunto)) {
          //         countValoriMinori = countValoriMinori++
          //     }
          // }
          // var num = importoTot.toString();
          // deepEntity.HeaderNISet.ZimpoTotni = num

          if (countValoriMinori > 0) {
            MessageBox.warning(
              "L’importo relativo ai seguenti codici ISIN è stato coperto parzialmente dalla Nota di Imputazione. Si intende procedere con l’operazione?",
              {
                title: "Copertura Importo",
                actions: [
                  sap.m.MessageBox.Action.YES,
                  sap.m.MessageBox.Action.NO,
                ],
                emphasizedAction: MessageBox.Action.YES,
                onClose: function (oAction) {
                  if (oAction === sap.m.MessageBox.Action.YES) {
                    MessageBox.warning(
                      "Sei sicuro di voler preimpostare la NI?",
                      {
                        title: "Preimpostazione NI",
                        actions: [
                          sap.m.MessageBox.Action.YES,
                          sap.m.MessageBox.Action.NO,
                        ],
                        emphasizedAction: MessageBox.Action.YES,
                        onClose: function (oAction) {
                          if (oAction === sap.m.MessageBox.Action.YES) {
                            oDataModel.create("/DeepZNIEntitySet", deepEntity, {
                              urlParameters: {
                                AutorityRole: visibilità.AGR_NAME,
                                AutorityFikrs: visibilità.FIKRS,
                                AutorityPrctr: visibilità.PRCTR,
                              },
                              success: function (result) {
                                if (result.Msgty == "E") {
                                  console.log(result.Message);
                                  MessageBox.error(
                                    "Nota d'imputazione non creata correttamente",
                                    {
                                      title: "Esito Operazione",
                                      actions: [sap.m.MessageBox.Action.OK],
                                      emphasizedAction: MessageBox.Action.OK,
                                    }
                                  );
                                }
                                if (result.Msgty == "S") {
                                  var risultato = result.Message.split(" ");
                                  let frase =
                                    risultato[0] +
                                    " " +
                                    risultato[1] +
                                    " " +
                                    risultato[2] +
                                    " " +
                                    risultato[3] +
                                    " preimpostata correttamente";
                                  MessageBox.success(frase, {
                                    title: "Esito Operazione",
                                    actions: [sap.m.MessageBox.Action.OK],
                                    emphasizedAction: MessageBox.Action.OK,
                                    onClose: function (oAction) {
                                      if (
                                        oAction === sap.m.MessageBox.Action.OK
                                      ) {
                                        that
                                          .getOwnerComponent()
                                          .getRouter()
                                          .navTo("View1");
                                        location.reload();
                                      }
                                    },
                                  });
                                }
                              },
                              error: function (err) {
                                console.log(err);
                                MessageBox.error(
                                  "Nota d'imputazione non creata correttamente",
                                  {
                                    title: "Esito Operazione",
                                    actions: [sap.m.MessageBox.Action.OK],
                                    emphasizedAction: MessageBox.Action.OK,
                                  }
                                );
                              },
                              async: true, // execute async request to not stuck the main thread
                              urlParameters: {}, // send URL parameters if required
                            });
                          }
                        },
                      }
                    );
                  }
                },
              }
            );
          } else {
            MessageBox.warning("Sei sicuro di voler preimpostare la NI?", {
              actions: [
                sap.m.MessageBox.Action.YES,
                sap.m.MessageBox.Action.NO,
              ],
              emphasizedAction: MessageBox.Action.YES,
              onClose: function (oAction) {
                if (oAction === sap.m.MessageBox.Action.YES) {
                  oDataModel.create("/DeepZNIEntitySet", deepEntity, {
                    urlParameters: {
                      AutorityRole: visibilità.AGR_NAME,
                      AutorityFikrs: visibilità.FIKRS,
                      AutorityPrctr: visibilità.PRCTR,
                    },
                    success: function (result) {
                      if (result.Msgty == "E") {
                        console.log(result.Message);
                        MessageBox.error(
                          "Nota d'imputazione non creata correttamente",
                          {
                            actions: [sap.m.MessageBox.Action.OK],
                            emphasizedAction: MessageBox.Action.OK,
                          }
                        );
                      }
                      if (result.Msgty == "S") {
                        MessageBox.success(result.Message, {
                          actions: [sap.m.MessageBox.Action.OK],
                          emphasizedAction: MessageBox.Action.OK,
                          onClose: function (oAction) {
                            if (oAction === sap.m.MessageBox.Action.OK) {
                              that
                                .getOwnerComponent()
                                .getRouter()
                                .navTo("View1");
                              location.reload();
                            }
                          },
                        });
                      }
                    },
                    error: function (err) {
                      console.log(err);
                      MessageBox.error(
                        "Nota d'imputazione non creata correttamente",
                        {
                          actions: [sap.m.MessageBox.Action.OK],
                          emphasizedAction: MessageBox.Action.OK,
                        }
                      );
                    },
                    async: true, // execute async request to not stuck the main thread
                    urlParameters: {}, // send URL parameters if required
                  });
                }
              },
            });
          }
        }
      },

      resetStep1Wizard: function () {
        var self = this,
          esGestione = self.getView().byId("es_gestione"),
          mese = self.getView().byId("mese"),
          tipologia = self.getView().byId("tipologia"),
          sottoTipologia = self.getView().byId("sottotipologia"),
          oModelJson = new sap.ui.model.json.JSONModel();

        esGestione.setSelectedKey("");
        mese.setSelectedKey("");
        tipologia.setValue("");
        sottoTipologia.setSelectedKey("");
        oModelJson.setData([]);
        self.getView().setModel(oModelJson, "HeaderNIW");
      },

      onBackButton: function () {
        this._oWizard = this.byId("CreateProductWizard");
        this._oSelectedStep =
          this._oWizard.getSteps()[this._iSelectedStepIndex];
        this._iSelectedStepIndex = this._oWizard
          .getSteps()
          .indexOf(this._oSelectedStep);
        //console.log(this._iSelectedStepIndex)

        if (this._iSelectedStepIndex == 0) {
          //console.log(this.getOwnerComponent().getRouter().navTo("View1"))
          this._iSelectedStepIndex = 0;
          this.resetStep1Wizard();
          window.history.go(-1);
          // this.getView().byId("HeaderNIW").setVisible(false);
          return;
        } else if (this._iSelectedStepIndex == 1) {
          var oNextStep =
            this._oWizard.getSteps()[this._iSelectedStepIndex - 1];
          if (this._oSelectedStep && !this._oSelectedStep.bLast) {
            this._oWizard.goToStep(oNextStep, true);
          } else {
            this.getView().byId("strAmmResp").setValue("");
            this.getView().byId("input_PF").setValue("");
            this.getView().byId("descrizioneCap").setValue("");
            this.getView().byId("descrizionePG").setValue("");
            this.getView().byId("input_PF").setEnabled(true);
            this.getView().byId("strAmmResp").setEnabled(true);
            this._oWizard.previousStep();
          }
          this._iSelectedStepIndex--;
          this._oSelectedStep = oNextStep;
          this.controlPreNI();
          this.controlHeader();
        } else if (this._iSelectedStepIndex == 2) {
          var oNextStep =
            this._oWizard.getSteps()[this._iSelectedStepIndex - 1];
          if (this._oSelectedStep && !this._oSelectedStep.bLast) {
            this._oWizard.goToStep(oNextStep, true);
          } else {
            this.getView().byId("input_PF").setEnabled(true);
            this.getView().byId("strAmmResp").setEnabled(true);
            this._oWizard.previousStep();
          }
          this._iSelectedStepIndex--;
          this._oSelectedStep = oNextStep;
          this.controlPreNI();
          this.controlHeader();
        }

        //this.controlStep()
      },

      onNextButton: function () {
        // this.onSearch()
        // this.onCommunicationPress()
        // var oModelP = new sap.ui.model.json.JSONModel("../mockdata/tabGestNI.json");
        // this.getView().setModel(oModelP, "HeaderNIW");

        var rows = this.getView().byId("HeaderNIW").getSelectedItems();
        this._oWizard = this.byId("CreateProductWizard");
        this._oSelectedStep =
          this._oWizard.getSteps()[this._iSelectedStepIndex];
        this._iSelectedStepIndex = this._oWizard
          .getSteps()
          .indexOf(this._oSelectedStep);

        if (this._iSelectedStepIndex == 0) {
          var es_gestione = this.getView().byId("es_gestione").getSelectedKey();
          var mese = this.getView().byId("mese").getSelectedItem();

          if (es_gestione == "" && mese == null) {
            MessageBox.error("Alimentare tutti i campi obbligatori", {
              actions: [sap.m.MessageBox.Action.OK],
              emphasizedAction: MessageBox.Action.OK,
            });
          } else if (es_gestione == "") {
            MessageBox.error("Alimentare tutti i campi obbligatori", {
              actions: [sap.m.MessageBox.Action.OK],
              emphasizedAction: MessageBox.Action.OK,
            });
          } else if (mese == null) {
            MessageBox.error("Alimentare tutti i campi obbligatori", {
              actions: [sap.m.MessageBox.Action.OK],
              emphasizedAction: MessageBox.Action.OK,
            });
          } else if (rows.length == 0) {
            MessageBox.error("Selezionare almeno un pagamento", {
              actions: [sap.m.MessageBox.Action.OK],
              emphasizedAction: MessageBox.Action.OK,
            });
          } else if (es_gestione != "" && mese != null) {
            var oNextStep =
              this._oWizard.getSteps()[this._iSelectedStepIndex + 1];

            if (this._oSelectedStep && !this._oSelectedStep.bLast) {
              this._oWizard.goToStep(oNextStep, true);
            } else {
              this._oWizard.nextStep();
            }

            this._iSelectedStepIndex++;
            this._oSelectedStep = oNextStep;

            // this.getView().byId("es_gestione").setEnabled(false)
            // this.getView().byId("mese").setEnabled(false)
            // this.getView().byId("tipologia").setEnabled(false)
            // this.getView().byId("sottotipologia").setEnabled(false)
            // this.getView().byId("competenza").setEnabled(false)
            this.addSelected();
            this.controlPreNI();
            this.controlHeader();
          }
        } else if (this._iSelectedStepIndex == 1) {
          var strutturaAmministrativa = this.getView()
            .byId("strAmmResp")
            .getValue();
          var posizioneFinanziaria = this.getView().byId("input_PF").getValue();

          if (posizioneFinanziaria == "") {
            MessageBox.error("Alimentare tutti i campi obbligatori", {
              actions: [sap.m.MessageBox.Action.OK],
              emphasizedAction: MessageBox.Action.OK,
            });
          } else if (strutturaAmministrativa == "") {
            MessageBox.error("Alimentare tutti i campi obbligatori", {
              actions: [sap.m.MessageBox.Action.OK],
              emphasizedAction: MessageBox.Action.OK,
            });
          } else if (
            strutturaAmministrativa == "" &&
            posizioneFinanziaria == ""
          ) {
            MessageBox.error("Alimentare tutti i campi obbligatori", {
              actions: [sap.m.MessageBox.Action.OK],
              emphasizedAction: MessageBox.Action.OK,
            });
          } else if (
            strutturaAmministrativa != "" &&
            posizioneFinanziaria != "" &&
            strutturaAmministrativa != undefined &&
            posizioneFinanziaria != undefined
          ) {
            this.getView().byId("input_PF").setEnabled(false);
            this.getView().byId("strAmmResp").setEnabled(false);

            this.callSecurity();
          }
        }
      },

      resetWizardStep1selected: function () {
        var self = this,
          model = self.getView().getModel("wizardStep1selected");
        self
          .getView()
          .getModel("wizardStep1selected")
          .setProperty("/wizardStep1selected", []);
        self
          .getView()
          .getModel("wizardStep1selected")
          .setProperty("/totaleResiduoSelezionati", 0);
      },

      addSelected: function () {
        var self = this,
          model = self.getView().getModel("wizardStep1selected"),
          selected = [],
          array = [];
        self.resetWizardStep1selected();
        selected = this.getView().byId("HeaderNIW").getSelectedItems();
        var total = 0;
        for (var i = 0; i < selected.length; i++) {
          console.log(selected[i].getBindingContext("HeaderNIW").getObject());
          var ZimpoRes = selected[i]
            .getBindingContext("HeaderNIW")
            .getObject().ZimpoRes;
          total = total + parseFloat(ZimpoRes);
          // array.push(selected[i].getBindingContext("HeaderNIW").getObject());
        }
        self
          .getView()
          .getModel("wizardStep1selected")
          .setProperty("/totaleResiduoSelezionati", total);
      },

      callSecurity: function () {
        var that = this;
        var visibilità = this.getView().getModel("temp").getData()
          .Visibilità[0];
        var Fipex = this.getView().byId("input_PF").getValue();
        var Fistl = this.getView().byId("strAmmResp").getValue();
        var Gjahr = this.getView().byId("es_gestione").getSelectedKey();

        that
          .getOwnerComponent()
          .getModel()
          .callFunction("/AutImputazioneContabile", {
            method: "GET",
            urlParameters: {
              AutorityRole: visibilità.AGR_NAME,
              AutorityFikrs: visibilità.FIKRS,
              AutorityPrctr: visibilità.PRCTR,
              Fipex: Fipex,
              Fistl: Fistl,
              Gjahr: Gjahr,
            },
            success: function (Value, response) {
              that
                .getView()
                .getModel("temp")
                .setProperty("/Autorizzazioni", Value);

              var oNextStep =
                that._oWizard.getSteps()[that._iSelectedStepIndex + 1];

              if (that._oSelectedStep && !that._oSelectedStep.bLast) {
                that._oWizard.goToStep(oNextStep, true);
              } else {
                that._oWizard.nextStep();
              }

              that._iSelectedStepIndex++;
              that._oSelectedStep = oNextStep;

              that.controlPreNI();
              that.controlHeader();
            },
            error: function (oError) {
              var err = oError;
              MessageBox.error(oError.Message, {
                title: "Esito Operazione",
                actions: [sap.m.MessageBox.Action.OK],
                emphasizedAction: MessageBox.Action.OK,
              });
            },
          });
      },
      // controlStep:function(){
      //     var oProprietà = this.getView().getModel();
      //     switch (this._iSelectedStepIndex) {
      //         case 0:
      //             oProprietà.setProperty("/SelezioneTitoliStep", true);
      //             oProprietà.setProperty("/APFStep", false);
      //             oProprietà.setProperty("/DatiNIStep", false);
      //             break;
      //         case 1:
      //             oProprietà.setProperty("/SelezioneTitoliStep", false);
      //             oProprietà.setProperty("/APFStep", true);
      //             oProprietà.setProperty("/DatiNIStep", false);
      //             break;
      //         case 2:
      //             oProprietà.setProperty("/SelezioneTitoliStep", false);
      //             oProprietà.setProperty("/APFStep", false);
      //             oProprietà.setProperty("/DatiNIStep", true);
      //             break;
      //         default: break;
      //     }
      // },

      controlPreNI: function () {
        var oProprietà = this.getView().getModel();
        switch (this._iSelectedStepIndex) {
          case 0:
            oProprietà.setProperty("/BackButtonVisible", true);
            oProprietà.setProperty("/NextButtonVisible", true);
            oProprietà.setProperty("/PNIButtonVisible", false);
            break;
          case 1:
            oProprietà.setProperty("/BackButtonVisible", true);
            oProprietà.setProperty("/NextButtonVisible", true);
            oProprietà.setProperty("/PNIButtonVisible", false);
            break;
          case 2:
            oProprietà.setProperty("/BackButtonVisible", true);
            oProprietà.setProperty("/NextButtonVisible", false);
            oProprietà.setProperty("/PNIButtonVisible", true);
            break;
          default:
            break;
        }
      },

      controlHeader: function () {
        var oProprietà = this.getView().getModel();
        switch (this._iSelectedStepIndex) {
          case 0:
            oProprietà.setProperty("/header1Visible", false);
            oProprietà.setProperty("/header2Visible", false);
            break;
          case 1:
            oProprietà.setProperty("/header1Visible", true);
            oProprietà.setProperty("/header2Visible", false);
            this.viewHeader1();
            this.filtriStep1();
            break;
          case 2:
            oProprietà.setProperty("/header1Visible", false);
            oProprietà.setProperty("/header2Visible", true);
            this.viewHeader2();
            this.filtriStep2();
            //this.controlStep()
            this.selectedRow();
            break;
          default:
            break;
        }
      },
    });
  }
);
