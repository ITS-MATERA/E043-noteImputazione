sap.ui.define([
    "./BaseController",
    "sap/ui/model/Filter",
    "sap/m/MessageBox",
    'sap/ui/model/json/JSONModel',
    "sap/ui/core/library",
    "project1/model/DateFormatter",
    "sap/ui/model/FilterOperator",
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (BaseController, Filter, MessageBox, JSONModel, CoreLibrary, DateFormatter, FilterOperator) {
        "use strict";
        var ValueState = CoreLibrary.ValueState,
            oData = {
                BackButtonVisible: true,
                NextButtonVisible: true,
                PNIButtonVisible: false,
                headerVisible: true,
                // HeaderNIWstep3Visible: true
            };

        return BaseController.extend("project1.controller.wizardInserisciRiga", {
            formatter: DateFormatter,
            ZhfTipoKey:"",
            onInit: async function () {

                var oProprietà = new JSONModel(),
                    oInitialModelState = Object.assign({}, oData);
                oProprietà.setData(oInitialModelState);
                this.getView().setModel(oProprietà);

                this._iSelectedStepIndex = 0;
                this._wizard = this.byId("CreateProductWizard");
                this._oNavContainer = this.byId("wizardNavContainer");
                this._oWizardContentPage = this.byId("wizardContentPage");

                this.getOwnerComponent().getModel("temp");
                this.getRouter().getRoute("wizardInserisciRiga").attachPatternMatched(this._onObjectMatched, this);

                this.controlPreNI()
                this.controlHeader()
                this.esercizioGestione()
                this.ZhfTipoKey = "";
                //this.onSearch()

            },

            _onObjectMatched: function (oEvent) {
                this.getView().bindElement(
                    "/HeaderNISet('Bukrs='" + oEvent.getParameters().arguments.campo +
                    "',Gjahr='" + oEvent.getParameters().arguments.campo1 +
                    "',Zamministr='" + oEvent.getParameters().arguments.campo2 +
                    "',ZchiaveNi='" + oEvent.getParameters().arguments.campo3 +
                    "',ZidNi='" + oEvent.getParameters().arguments.campo4 +
                    "',ZRagioCompe='" + oEvent.getParameters().arguments.campo5 + "')"
                );
                this.viewFiltri(oEvent)
            },

            viewFiltri: function (oEvent) {
                var header = this.getView().getModel("temp").getData().HeaderNISet
                var position = this.getView().getModel("temp").getData().PositionNISet
                for (var i = 0; i < header.length; i++) {
                    if (header[i].Bukrs == oEvent.getParameters().arguments.campo &&
                        header[i].Gjahr == oEvent.getParameters().arguments.campo1 &&
                        header[i].Zamministr == oEvent.getParameters().arguments.campo2 &&
                        header[i].ZchiaveNi == oEvent.getParameters().arguments.campo3 &&
                        header[i].ZidNi == oEvent.getParameters().arguments.campo4 &&
                        header[i].ZRagioCompe == oEvent.getParameters().arguments.campo5) {

                        var ZgjahrEng = position[0].ZgjahrEng
                        this.getView().byId("es_gestione").setValue(ZgjahrEng)

                        var Zmese = header[i].Zmese;
                        this.getView().byId("mese").setSelectedKey(Zmese);

                        // var ZcompRes = position[0].ZcompRes
                        // this.getView().byId("competenza").setValue(ZcompRes)

                        // var Zsottotipo = position[0].Zsottotipo
                        // this.getView().byId("sottotipologia").setValue(Zsottotipo)

                        // var Ztipo = position[0].Ztipo
                        // this.getView().byId("tipologia").setValue(Ztipo)

                    }
                }
            },

            // ZhfTipo - START
            handleValueHelpZhfTipo:function(oEvent){
                var self =this;
                var oDialog = self.openDialog("project1.fragment.Help.zhfTipo");
                self.getOwnerComponent().getModel().read("/ZhfTipoSet", {
                    success: function(data, oResponse){
                        var oModelJson = new sap.ui.model.json.JSONModel();
                        oModelJson.setData(data.results);
                        var oTable = sap.ui.getCore().byId("selectDialogZhfTipo");
                        oTable.setModel(oModelJson,"ZhfTipoSet");
                        oDialog.open();
                    },
                    error: function(error){
                    }
                });
            },

            handleValueHelpValueCloseZhfTipo:function(oEvent){
                var self = this,
                    tipologiaId = self.getView().byId("tipologia"),
                    sottotipologia = self.getView().byId("sottotipologia"),
                    key,
                    selected = oEvent.getParameter("selectedItem");

                self.ZhfTipoKey = "";
                if(!selected){            
                    self.getView().getModel("temp").setProperty('/ZhfSottotipo', []);         
                    self.closeDialog();
                    return;
                }

                key = oEvent.getParameter("selectedItem").data("key");
                tipologiaId.setValue(selected.getTitle());
                self.ZhfTipoKey = key;
                
                if(key){
                    var filters = []
                    filters.push(
                        new Filter({ path: "ZcodTipo", operator: FilterOperator.EQ, value1: key })
                    )

                    self.getOwnerComponent().getModel().read("/ZhfSottotipoSet", {
                        filters: filters,
                        success: function(data, oResponse){
                            self.getView().getModel("temp").setProperty('/ZhfSottotipo', data.results);
                        },
                        error: function(error){
                        }
                    });
                }
                else{
                    self.getView().getModel("temp").setProperty('/ZhfSottotipo', []); 
                }
                self.closeDialog();
            },

            handleValueHelpSearchZhfTipo:function(oEvent){
                var self = this,
                    sValue = oEvent.getParameter("value"),
                    oFilter = [],
                    qFilters = [];
            
                oFilter.push(self.createFilter("Ztipo", sap.ui.model.FilterOperator.Contains, sValue, false));
                qFilters = new sap.ui.model.Filter({filters:oFilter,and:false}); 
                oEvent.getSource().getBinding("items").filter(qFilters);
            },

            createFilter: function(key, operator, value, useToLower) {
                return new sap.ui.model.Filter(key, operator, useToLower ? "'" + value.toLowerCase() + "'" : value);
            },
            // ZhfTipo - END


            esercizioGestione: function () {
                var that = this;
                var oMdl = new sap.ui.model.json.JSONModel();
                this.getOwnerComponent().getModel().read("/ZgjahrEngNiSet", {
                    filters: [],
                    urlParameters: "",
                    success: function (data) {
                        oMdl.setData(data.results);
                        that.getView().getModel("temp").setProperty('/ZgjahrEngNiSet', data.results)
                    },
                    error: function (error) {
                        //that.getView().getModel("temp").setProperty(sProperty,[]);
                        //that.destroyBusyDialog();
                        var e = error;
                    }
                });
            },

            onCallHeader: function (oEvent) {
                var that = this;
                var oMdl = new sap.ui.model.json.JSONModel();
                this.getOwnerComponent().getModel().read("/HeaderNISet", {
                    filters: [],
                    urlParameters: "",
                    success: function (data) {
                        oMdl.setData(data.results);
                        that.getView().getModel("temp").setProperty('/HeaderNISet', data.results)
                    },
                    error: function (error) {
                        //that.getView().getModel("temp").setProperty(sProperty,[]);
                        //that.destroyBusyDialog();
                        var e = error;
                    }
                });
            },

            viewHeader1: function () {
                var url = location.href
                var sUrl = url.split("/wizardInserisciRiga/")[1]
                var aValori = sUrl.split(",")

                var Bukrs = aValori[0]
                var Gjahr = aValori[1]
                var Zamministr = aValori[2]
                var ZchiaveNi = aValori[3]
                var ZidNi = aValori[4]
                var ZRagioCompe = aValori[5]

                var header = this.getView().getModel("temp").getData().HeaderNISet
                for (var i = 0; i < header.length; i++) {
                    if (header[i].Bukrs == Bukrs &&
                        header[i].Gjahr == Gjahr &&
                        header[i].Zamministr == Zamministr &&
                        header[i].ZchiaveNi == ZchiaveNi &&
                        header[i].ZidNi == ZidNi &&
                        header[i].ZRagioCompe == ZRagioCompe) {

                        var progressivoNI = header[i].ZchiaveNi
                        this.getView().byId("numNI1").setText(progressivoNI)

                        var dataRegistrazione = header[i].ZdataCreaz
                        var dataNuova = new Date(dataRegistrazione),
                            mnth = ("0" + (dataNuova.getMonth() + 1)).slice(-2),
                            day = ("0" + dataNuova.getDate()).slice(-2);
                        var nData = [dataNuova.getFullYear(), mnth, day].join("-");
                        var nDate = nData.split("-").reverse().join(".");
                        this.getView().byId("dataReg1").setText(nDate)

                        var strAmmResp = header[i].Fistl
                        this.getView().byId("SARWH2").setText(strAmmResp)

                        var PF = header[i].Fipex
                        this.getView().byId("pos_FinWH2").setText(PF)

                        var oggSpesa = header[i].ZoggSpesa
                        this.getView().byId("oggSpesa1").setText(oggSpesa)

                        var mese = header[i].Zmese
                        switch (mese) {
                            case "1":
                                var nMese = "Gennaio"
                                break;
                            case "2":
                                var nMese = "Febbraio"
                                break;
                            case "3":
                                var nMese = "Marzo"
                                break;
                            case "4":
                                var nMese = "Aprile"
                                break;
                            case "5":
                                var nMese = "Maggio"
                                break;
                            case "6":
                                var nMese = "Giugno"
                                break;
                            case "7":
                                var nMese = "Luglio"
                                break;
                            case "8":
                                var nMese = "Agosto"
                                break;
                            case "9":
                                var nMese = "Settembre"
                                break;
                            case "10":
                                var nMese = "Ottobre"
                                break;
                            case "11":
                                var nMese = "Novembre"
                                break;
                            case "12":
                                var nMese = "Dicembre"
                                break;
                            default: break;
        
                        }
                        this.getView().byId("mese2").setText(nMese)

                        var statoNI = header[i].ZcodiStatoni
                        this.getView().byId("statoNI1").setText(statoNI)

                        var importoTot = header[i].ZimpoTotni

                        var num = importoTot.toString();
                        var importoPrimaVirgola = num.split(".")
                        //var indice = num.split("").length
                        var numPunti = ""
                        var migliaia = importoPrimaVirgola[0].split('').reverse().join('').match(/.{1,3}/g).map(function (x) {
                            return x.split('').reverse().join('')
                        }).reverse()

                        for (var v = 0; v < migliaia.length; v++) {
                            numPunti = (numPunti + migliaia[v] + ".")
                        }

                        var indice = numPunti.split("").length
                        var totale = numPunti.substring(0, indice - 1) + "," + importoPrimaVirgola[1]
                        let array = totale.split(",")
                        let valoreTagliato = array[1].substring(0, 2)
                        var totale = array[0] + "," + valoreTagliato
                        this.getView().byId("importoTot1").setText(totale)

                    }
                }
            },

            filtriStep1: function () {
                //console.log(oMdl)
                var url = location.href
                var sUrl = url.split("/wizardInserisciRiga/")[1]
                var aValori = sUrl.split(",")

                var Bukrs = aValori[0]
                var Gjahr = aValori[1]
                var Zamministr = aValori[2]
                var ZchiaveNi = aValori[3]
                var ZidNi = aValori[4]
                var ZRagioCompe = aValori[5]

                var header = this.getView().getModel("temp").getData().HeaderNISet
                //var position = this.getView().getModel("temp").getData().PositionNISet
                for (var i = 0; i < header.length; i++) {
                    if (header[i].Bukrs == Bukrs &&
                        header[i].Gjahr == Gjahr &&
                        header[i].Zamministr == Zamministr &&
                        header[i].ZchiaveNi == ZchiaveNi &&
                        header[i].ZidNi == ZidNi &&
                        header[i].ZRagioCompe == ZRagioCompe) {

                        var Fistl = header[i].Fistl
                        this.getView().byId("strAmmResp").setValue(Fistl)

                        var Fipex = header[i].Fipex
                        this.getView().byId("input_PF").setValue(Fipex)

                    }
                }
            },

            selectedRow: function () {
                var rows = this.getView().byId("HeaderNIW").getSelectedItems()
                // if(rows){
                //     oProprietà.setProperty("/HeaderNIWstep3Visible", false);
                // }
                var array = this.getView().getModel("temp").getData().PositionNISet
                for (var arr = 0; arr < array.length; arr++) {
                    var campo = array[arr]
                    var numeroIntero = array[arr].ZimpoTitolo
                    var numIntTot = ""
                    if (numeroIntero.split(".").length > 1) {
                        var numeri = numeroIntero.split(".")
                        for (var n = 0; n < numeri.length; n++) {
                            numIntTot = numIntTot + numeri[n]
                            //var numeroFloat = parseFloat(numeroIntero)
                            if (numIntTot.split(",").length > 1) {
                                var virgole = numIntTot.split(",")
                                var numeroInteroSM = virgole[0] + "." + virgole[1]
                            }
                        }
                        var importoPrimaVirgola = numeroIntero.split(".")
                        var numPunti = ""
                        var migliaia = importoPrimaVirgola[0].split('').reverse().join('').match(/.{1,3}/g).map(function (x) {
                            return x.split('').reverse().join('')
                        }).reverse()

                        for (var migl = 0; migl < migliaia.length; migl++) {
                            numPunti = (numPunti + migliaia[migl] + ".")
                        }
                        var indice = numPunti.split("").length
                        var numeroIntero = numPunti.substring(0, indice - 1) + "," + importoPrimaVirgola[1]
                        campo.ZimpoTitolo = numIntTot
                    }

                    else {
                        var importoPrimaVirgola = numeroIntero.split(",")
                        var numeroInteroSM = importoPrimaVirgola[0] + "." + importoPrimaVirgola[1]
                        campo.ZimpoTitolo = numeroIntero
                    }
                }
                //var array = []
                var oMdlWstep3 = new sap.ui.model.json.JSONModel();
                for (var i = 0; i < rows.length; i++) {
                    var campo = rows[i].getBindingContext("HeaderNIW").getObject()
                    campo.ZimpoTitolo = campo.ZimpoRes
                    campo.ZimpoRes = "0.00"
                    array.push(campo)
                }
                oMdlWstep3.setData(array);
                this.getView().setModel(oMdlWstep3, "HeaderNIWstep3");
                // console.log(oMdlWstep3)
            },

            onSearch: function (oEvent) {
                this.onCallHeader()
                // var oModelP = this.getView().getModel("tabRendicontazione")
                var oModelP = this.getRendicontazione();
                //var oModelP = new sap.ui.model.json.JSONModel("../mockdata/tabRendicontazione.json");
                this.getView().setModel(oModelP, "HeaderNIW");
                // var that = this;
                this.getView().byId("HeaderNIW").setVisible(true);
            },

            getRendicontazione:function(){
                var self = this,
                    filters = [],
                    oEsercizio = self.getView().byId("es_gestione"),
                    oMese = self.getView().byId("mese"),
                    oTipo = self.getView().byId("tipologia"),
                    oSottotipo = self.getView().byId("sottotipologia"),
                    oCompetenza = self.getView().byId("competenza");
                
                var header = this.getView().getModel("temp").getData().HeaderNISet[0];
                console.log(header.ZchiaveNi);
                filters.push(new Filter({ path: "Gjahr", operator: FilterOperator.EQ, value1: oEsercizio.getSelectedKey() }));
                filters.push(new Filter({ path: "Zmese", operator: FilterOperator.EQ, value1: oMese.getSelectedKey() }));
                filters.push(new Filter({ path: "ZchiaveNi", operator: FilterOperator.EQ, value1: header.ZchiaveNi }));

                if(oTipo && self.ZhfTipoKey !== "")
                    filters.push(new Filter({ path: "ZcodTipo", operator: FilterOperator.EQ, value1: self.ZhfTipoKey }));
                
                if(oSottotipo && oSottotipo.getSelectedKey() && oSottotipo.getSelectedKey() !== "")
                    filters.push(new Filter({ path: "ZcodSottotipo", operator: FilterOperator.EQ, value1: oSottotipo.getSelectedKey() }));
                
                if(oCompetenza && oCompetenza.getSelectedKey() && oCompetenza.getSelectedKey() !== "")
                    filters.push(new Filter({ path: "ZcompRes", operator: FilterOperator.EQ, value1: oCompetenza.getSelectedKey() }));

                self.getOwnerComponent().getModel().read("/RendicontazioneSet", {
                    filters:filters,
                    success: function(data, oResponse){
                        var oModelJson = new sap.ui.model.json.JSONModel();
                        oModelJson.setData(data.results);
                        return oModelJson;
                    },
                    error: function(error){
                        return [];
                    }
                });
            },


            onPreimpNI: function (oEvent) {
                var that = this;
                //var rows= this.getView().byId("HeaderNIW").getSelectedItem()

                var N_es_gestione = this.getView().byId("es_gestione").mProperties.value; //header
                var N_Tipologia = this.getView().byId("tipologia").getValue();  //position
                var N_Sottotipologia = this.getView().byId("sottotipologia").getValue()  //position
                var N_CR = this.getView().byId("competenza").mProperties.value  //position

                var oDataModel = that.getOwnerComponent().getModel();

                var oItems = that.getView().byId("HeaderNIWstep3").getBinding("items").oList;
                //var selectedRows = that.getView().byId("HeaderNIW").getSelectedItems().length

                var deepEntity = {
                    Funzionalita: 'RETTIFICANIPREIMPOSTATA',
                    PositionNISet: []
                }


                deepEntity.Bukrs = oItems[0].Bukrs,
                    deepEntity.Gjahr = oItems[0].Gjahr,
                    deepEntity.Zamministr = oItems[0].Zamministr,
                    deepEntity.ZchiaveNi = oItems[0].ZchiaveNi,      //dichiarati fuori dal ciclo e presi dal item 0 perchè sono tutte uguali
                    deepEntity.ZidNi = oItems[0].ZidNi,
                    deepEntity.ZRagioCompe = oItems[0].ZRagioCompe,
                    deepEntity.Operation = "I"

                for (var i = 0; i < oItems.length; i++) {
                    var item = oItems[i];

                    deepEntity.PositionNISet.push({
                        Bukrs: oItems[0].Bukrs,                     //campi chiave Posizione
                        Gjahr: oItems[0].Gjahr,                     //campi chiave Posizione
                        Zamministr: oItems[0].Zamministr,           //campi chiave Posizione
                        ZchiaveNi: oItems[0].ZchiaveNi,             //campi chiave Posizione
                        ZidNi: oItems[0].ZidNi,                     //campi chiave Posizione
                        ZRagioCompe: oItems[0].ZRagioCompe,         //campi chiave Posizione
                        ZposNi: item.ZposNi,                        //campi chiave Posizione

                        ZgjahrEng: N_es_gestione,
                        Ztipo: N_Tipologia,
                        Zsottotipo: N_Sottotipologia,
                        ZcompRes: N_CR,
                        //ZimpoTitolo: ZimpoTitolo,                 //aggiornare mock
                        Zdescrizione: item.Zdescrizione,                //aggiornare mock 
                        ZcodIsin: item.ZcodIsin,                       //aggiornare mock
                        ZdataPag: new Date(item.ZdataPag),
                    });

                    var numeroIntero = item.ZimpoTitolo
                    var numIntTot = ""
                    if (numeroIntero.split(".").length > 1) {
                        var numeri = numeroIntero.split(".")
                        for (var n = 0; n < numeri.length; n++) {
                            numIntTot = numIntTot + numeri[n]
                            //var numeroFloat = parseFloat(numeroIntero)
                            if (numIntTot.split(",").length > 1) {
                                var virgole = numIntTot.split(",")
                                var numeroInteroSM = virgole[0] + "." + virgole[1]
                            }
                        }
                        var importoPrimaVirgola = numeroIntero.split(".")
                        var numPunti = ""
                        var migliaia = importoPrimaVirgola[0].split('').reverse().join('').match(/.{1,3}/g).map(function (x) {
                            return x.split('').reverse().join('')
                        }).reverse()

                        for (var migl = 0; migl < migliaia.length; migl++) {
                            numPunti = (numPunti + migliaia[migl] + ".")
                        }
                        var indice = numPunti.split("").length
                        var numeroIntero = numPunti.substring(0, indice - 1) + "," + importoPrimaVirgola[1]
                        deepEntity.PositionNISet[i].ZimpoTitolo = numeroInteroSM
                    }

                    else {
                        var importoPrimaVirgola = numeroIntero.split(",")
                        var numeroInteroSM = importoPrimaVirgola[0] + "." + importoPrimaVirgola[1]
                        deepEntity.PositionNISet[i].ZimpoTitolo = numeroInteroSM
                    }


                }

                MessageBox.warning("Sei sicuro di voler rettificare la nota d'imputazione?", {
                    title: "Inserire Posizione",
                    actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
                    emphasizedAction: MessageBox.Action.YES,
                    onClose: function (oAction) {
                        if (oAction === sap.m.MessageBox.Action.YES) {

                            oDataModel.create("/DeepPositionNISet", deepEntity, {
                                success: function (result) {
                                    MessageBox.success("Nota di Imputazione "+oItems[0].ZchiaveNi+" rettificata correttamente", {
                                        title: "Esito Operazione",
                                        actions: [sap.m.MessageBox.Action.OK],
                                        emphasizedAction: MessageBox.Action.OK,
                                        onClose: function (oAction) {
                                            if (oAction === sap.m.MessageBox.Action.OK) {
                                                that.getOwnerComponent().getRouter().navTo("View1");
                                                location.reload();
                                            }
                                        }
                                    })
                                },
                                error: function (err) {
                                    console.log(err);
                                    MessageBox.error("Nota d'imputazione non rettificata correttamente", {
                                        actions: [sap.m.MessageBox.Action.OK],
                                        emphasizedAction: MessageBox.Action.OK,
                                    })
                                },
                                async: true,  // execute async request to not stuck the main thread
                                urlParameters: {}  // send URL parameters if required 
                            });
                        }
                    }
                })
            },

            onBackButton: function () {
                this._oWizard = this.byId("CreateProductWizard");
                this._oSelectedStep = this._oWizard.getSteps()[this._iSelectedStepIndex];
                this._iSelectedStepIndex = this._oWizard.getSteps().indexOf(this._oSelectedStep);
                //console.log(this._iSelectedStepIndex)
                if (this._iSelectedStepIndex == 0) {
                    //console.log(this.getOwnerComponent().getRouter().navTo("View1"))
                    this._iSelectedStepIndex = 0
                    window.history.go(-1);
                    this.getView().byId("HeaderNIW").setVisible(false);
                    return;
                }
                var oNextStep = this._oWizard.getSteps()[this._iSelectedStepIndex - 1];
                if (this._oSelectedStep && !this._oSelectedStep.bLast) {
                    this._oWizard.goToStep(oNextStep, true);
                } else {
                    this._oWizard.previousStep();
                }
                this._iSelectedStepIndex--
                this._oSelectedStep = oNextStep;
                this.controlPreNI();
                this.controlHeader()
                //cancella item tabella
            },

            onNextButton: function () {
                // this.onSearch()
                // this.onCommunicationPress()
                // var oModelP = new sap.ui.model.json.JSONModel("../mockdata/tabGestNI.json");
                // this.getView().setModel(oModelP, "HeaderNIW");
                this._oWizard = this.byId("CreateProductWizard");
                this._oSelectedStep = this._oWizard.getSteps()[this._iSelectedStepIndex];
                this._iSelectedStepIndex = this._oWizard.getSteps().indexOf(this._oSelectedStep);
                var oNextStep = this._oWizard.getSteps()[this._iSelectedStepIndex + 1];

                if (this._oSelectedStep && !this._oSelectedStep.bLast) {
                    this._oWizard.goToStep(oNextStep, true);
                } else {
                    this._oWizard.nextStep();
                }

                this._iSelectedStepIndex++;
                this._oSelectedStep = oNextStep;

                this.controlPreNI()
                this.controlHeader()

            },


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
                    default: break;
                }
            },

            controlHeader: function () {
                var oProprietà = this.getView().getModel();
                switch (this._iSelectedStepIndex) {
                    case 0:
                        oProprietà.setProperty("/headerVisible", false);
                        break;
                    case 1:
                        oProprietà.setProperty("/headerVisible", true);
                        this.viewHeader1()
                        this.filtriStep1()
                        break;
                    case 2:
                        oProprietà.setProperty("/headerVisible", true);
                        this.selectedRow()
                        break;
                    default: break;
                }
            },
        });
    });