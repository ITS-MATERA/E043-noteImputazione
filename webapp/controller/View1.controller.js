sap.ui.define([
    "sap/ui/model/odata/v2/ODataModel",
    // "sap/ui/core/mvc/Controller",
    "./BaseController",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    'sap/ui/export/Spreadsheet',
    'project1/model/DateFormatter'

],

    function (ODataModel, BaseController, Filter, FilterOperator, MessageBox, Spreadsheet, DateFormatter) {
        "use strict";
        var EdmType = sap.ui.export.EdmType

        //popupino warning
        return BaseController.extend("project1.controller.View1", {
            formatter: DateFormatter,

            onInit: function () {
                //console.log("onInit View1 controller")
                this.callVisibilità()
                // this.esercizioDecreto()
                //this.chiaveNI()
                this.getHeaderInfo();

                // this.Zamministr()
                // this.ZRagioCompe()
                this.mese()
                this.esercizioGestione()
                this.EsercizioPosizioneFinanziaria()
                this.onCallStateNI()
            },

            getHeaderInfo:function(){
                var self =this;

                self.getHeaderGjahr(function(callback){
                    if(callback)
                        self.getHeaderAmministrazione(function(callback){
                            if(callback)
                                self.getHeaderZRagioCompe(function(callback){
                        });
                    });
                })
            },

            getHeaderGjahr:function(callback){
                var self =this;
                var oMdl = new sap.ui.model.json.JSONModel();
                self.getOwnerComponent().getModel().read("/ZgjahrEngNiSet", {
                    success: function (data) {
                        oMdl.setData(data.results);
                        self.getView().getModel("temp").setProperty('/ZgjahrEngNiSet', data.results);
                        callback(true);
                        return;
                    },
                    error: function (error) {
                        console.log(error);
                        callback(false);
                        return;
                    }
                });
            },

            getHeaderAmministrazione:function(callback){
                var self =this;
                var oMdl = new sap.ui.model.json.JSONModel();
                self.getOwnerComponent().getModel().read("/ZamministrNiSet", {
                    filters: [],
                    urlParameters: "",
                    success: function (data) {
                        oMdl.setData(data.results);
                        self.getView().getModel("temp").setProperty('/ZamministrNiSet', data.results)
                        self.getView().byId("amministrazioneEG1").setValue(data.results[0].Zamministr);
                        callback(true);
                        return;
                    },
                    error: function (error) {
                        console.log(error);
                        callback(false);
                        return;
                    }
                });
            },

            getHeaderZRagioCompe:function(callback){
                var self =this;
                var oModel = self.getOwnerComponent().getModel();
                var oMdl = new sap.ui.model.json.JSONModel();
                var ZamministrNiSet = self.getView().getModel("temp").getData().ZamministrNiSet
                var Gjahr = new Date();
                var Zamministr = ZamministrNiSet[0].Zamministr

                 var path = oModel.createKey("/ZRagioCompeSet", {
                        Gjahr:Gjahr.getFullYear(),
                        Zamministr:Zamministr
                        });
                
                self.getOwnerComponent().getModel().read(path, {
                    success: function (data) {
                        oMdl.setData(data);
                        self.getView().getModel("temp").setProperty('/ZRagioCompeSet', data)
                        self.getView().byId("ragioneria1").setValue(data.CodiceRagioneria)
                        callback(true);
                    },
                    error: function (error) {
                        console.log(error);
                        callback(false);
                        return;
                    }
                });
            },

            onWarning2MessageBoxPress: function () {
                MessageBox.warning("Sei sicuro di voler completare la Nota di Imputazione n.X?", {
                    actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                    emphasizedAction: MessageBox.Action.OK,
                    onClose: function (oAction) {
                        MessageBox.warning("Conferma", {
                            actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL]
                        }
                        )
                    }
                })
            },

            callVisibilità:function(){
                var self =this,
                    filters = [];
        
                filters.push(
                    new Filter({ path: "SEM_OBJ", operator: FilterOperator.EQ, value1: "ZS4_NOTEIMPUTAZIONI_SRV" }),
                    new Filter({ path: "AUTH_OBJ", operator: FilterOperator.EQ, value1: "Z_GEST_NI" })
                )
                self.getOwnerComponent().getModel("ZSS4_CA_CONI_VISIBILITA_SRV").read("/ZES_CONIAUTH_SET", {
                    filters: filters,        
                    success: function (data) {
                            console.log("ZES_CONIAUTH_SET");
                            self.getView().getModel("temp").setProperty('/Visibilità', data.results);
                            self.pulsantiVisibiltà(data.results);
                            console.log(data.results);
                        },
                    error: function (error) {
                        console.log(error)
                        var e = error;
                    }   
                });
            },

            pulsantiVisibiltà: function (data) {
                for (var d = 0; d < data.length; d++) {
                    if (data[d].ACTV_1 == "Z01") {
                        this.getView().byId("PreimpostazioneNI").setEnabled(true);
                    }
                    // if (data[d].ACTV_3 == "Z03") {                        
                    //     console.log("qua");
                    //     this.getView().byId("DettagliNI").setEnabled(true);
                    // }
                }
            },

            mese: function () {
                var that = this;
                var oMdl = new sap.ui.model.json.JSONModel();
                this.getOwnerComponent().getModel().read("/ZmeseSet", {
                    filters: [],
                    urlParameters: "",
                    success: function (data) {
                        oMdl.setData(data.results);
                        that.getView().getModel("temp").setProperty('/ZmeseSet', data.results)
                    },
                    error: function (error) {
                        //that.getView().getModel("temp").setProperty(sProperty,[]);
                        //that.destroyBusyDialog();
                        var e = error;
                    }
                });
            },

            Zamministr: function(){
                var that = this;
                var oMdl = new sap.ui.model.json.JSONModel();
                this.getOwnerComponent().getModel().read("/ZamministrNiSet", {
                    filters: [],
                    urlParameters: "",
                    success: function (data) {
                        oMdl.setData(data.results);
                        that.getView().getModel("temp").setProperty('/ZamministrNiSet', data.results)
                        that.getView().byId("amministrazioneEG1").setValue(data.results[0].Zamministr)
                    },
                    error: function (error) {
                        //that.getView().getModel("temp").setProperty(sProperty,[]);
                        //that.destroyBusyDialog();
                        var e = error;
                    }
                });
            },

            ZRagioCompe: function(){
                var that = this;
                var oModel = this.getOwnerComponent().getModel();
                var oMdl = new sap.ui.model.json.JSONModel();
                var ZamministrNiSet = this.getView().getModel("temp").getData().ZamministrNiSet
                var Gjahr = this.getView().byId("es_gestione").getSelectedItem().mProperties.text
                var Zamministr = ZamministrNiSet[0].Zamministr

                 var path = oModel.createKey("/ZRagioCompeSet", {
                        Gjahr:Gjahr,
                        Zamministr:Zamministr
                        });
                
                this.getOwnerComponent().getModel().read(path, {
                    filters: [],
                    urlParameters: "",
                    success: function (data) {
                        oMdl.setData(data);
                        that.getView().getModel("temp").setProperty('/ZRagioCompeSet', data)
                        that.getView().byId("ragioneria1").setValue(data.CodiceRagioneria)
                    },
                    error: function (error) {
                        //that.getView().getModel("temp").setProperty(sProperty,[]);
                        //that.destroyBusyDialog();
                        var e = error;
                    }
                });
            },

            esercizioDecreto: function () {
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

            esercizioGestione: function () {
                var that = this;
                var oMdl = new sap.ui.model.json.JSONModel();
                this.getOwnerComponent().getModel().read("/GjahrNiSet", {
                    filters: [],
                    urlParameters: "",
                    success: function (data) {
                        oMdl.setData(data.results);
                        that.getView().getModel("temp").setProperty('/GjahrNiSet', data.results)
                    },
                    error: function (error) {
                        //that.getView().getModel("temp").setProperty(sProperty,[]);
                        //that.destroyBusyDialog();
                        var e = error;
                    }
                });
            },

            createColumnConfig: function () {
                var aCols = [];

                aCols.push({
                    property: 'ZchiaveNi',
                    type: EdmType.String
                });

                aCols.push({
                    property: 'Fistl',
                    type: EdmType.String
                });

                aCols.push({
                    property: 'Fipex',
                    type: EdmType.String
                });

                aCols.push({
                    property: 'ZoggSpesa',
                    type: EdmType.String
                });

                aCols.push({
                    property: 'Zmese',
                    type: EdmType.String
                });

                aCols.push({
                    property: 'ZcodiStatoni',
                    type: EdmType.String
                });

                aCols.push({
                    property: 'ZimpoTotni',
                    type: EdmType.Number
                });

                return aCols;
            },

            onExport: function () {
                //console.log("onExport")
                var aCols, oRowBinding, oSettings, oSheet, oTable;

                if (!this._oTable) {
                    this._oTable = this.byId('HeaderNI');
                }

                oTable = this._oTable;


                // var oSelectedItemPath = oEvent.getSource().getParent().getBindingContextPath();
                // var oSelectedItem = this.getOwnerComponent().getModel("booksMdl").getObject(oSelectedItemPath);

                //console.log("table1: " + oTable)
                oRowBinding = oTable.getBinding('items');
                //console.log("row binding: " + oRowBinding);
                aCols = this.createColumnConfig();

                oSettings = {
                    workbook: {
                        columns: aCols,
                        hierarchyLevel: 'Level'
                    },
                    dataSource: oRowBinding,
                    fileName: 'Esportazione NI',
                    worker: false // We need to disable worker because we are using a MockServer as OData Service
                };

                oSheet = new sap.ui.export.Spreadsheet(oSettings);
                oSheet.build().finally(function () {
                    oSheet.destroy();
                });
            },

            // onNavToIconTB: function () {
            //     var row = this.getView().byId("HeaderNI").getSelectedItem().getBindingContext("HeaderNI").getObject();

            //     if (row.ZcodiStatoni == "NI Preimpostata")
            //         this.getOwnerComponent().getRouter().navTo("iconTabBar", { campo: row.Bukrs, campo1: row.Gjahr, campo2: row.Zamministr, campo3: row.ZchiaveNi, campo4: row.ZidNi, campo5: row.ZRagioCompe })
            //     if (row.ZcodiStatoni == "NI Provvisoria")
            //         this.getOwnerComponent().getRouter().navTo("inserisciInvioFirma", { campo: row.Bukrs, campo1: row.Gjahr, campo2: row.Zamministr, campo3: row.ZchiaveNi, campo4: row.ZidNi, campo5: row.ZRagioCompe })
            //     if (row.ZcodiStatoni == "NI Inviata alla firma")
            //         this.getOwnerComponent().getRouter().navTo("revocaFirma", { campo: row.Bukrs, campo1: row.Gjahr, campo2: row.Zamministr, campo3: row.ZchiaveNi, campo4: row.ZidNi, campo5: row.ZRagioCompe })
            //     if (row.ZcodiStatoni == "")
            //         this.getOwnerComponent().getRouter().navTo("passaggioStato", { campo: row.Bukrs, campo1: row.Gjahr, campo2: row.Zamministr, campo3: row.ZchiaveNi, campo4: row.ZidNi, campo5: row.ZRagioCompe })
            //     if (row.ZcodiStatoni == "NI In Verifica")
            //         this.getOwnerComponent().getRouter().navTo("richiamaNI", { campo: row.Bukrs, campo1: row.Gjahr, campo2: row.Zamministr, campo3: row.ZchiaveNi, campo4: row.ZidNi, campo5: row.ZRagioCompe })
            //     if (row.ZcodiStatoni == "NI Confermata")
            //         this.getOwnerComponent().getRouter().navTo("conferma", { campo: row.Bukrs, campo1: row.Gjahr, campo2: row.Zamministr, campo3: row.ZchiaveNi, campo4: row.ZidNi, campo5: row.ZRagioCompe })
            //     if (row.ZcodiStatoni == "NI Validata RGS")
            //         this.getOwnerComponent().getRouter().navTo("richiamoNIRGS", { campo: row.Bukrs, campo1: row.Gjahr, campo2: row.Zamministr, campo3: row.ZchiaveNi, campo4: row.ZidNi, campo5: row.ZRagioCompe })
            //     if (row.ZcodiStatoni == "NI con Rilievo Registrato")
            //         this.getOwnerComponent().getRouter().navTo("richiamoRilievoRegistrato", { campo: row.Bukrs, campo1: row.Gjahr, campo2: row.Zamministr, campo3: row.ZchiaveNi, campo4: row.ZidNi, campo5: row.ZRagioCompe })
            //     if (row.ZcodiStatoni == "NI Annullata")
            //         this.getOwnerComponent().getRouter().navTo("annullataNI", { campo: row.Bukrs, campo1: row.Gjahr, campo2: row.Zamministr, campo3: row.ZchiaveNi, campo4: row.ZidNi, campo5: row.ZRagioCompe })
            //     if (row.ZcodiStatoni == "NI Annullata per Richiamo")
            //         this.getOwnerComponent().getRouter().navTo("annullataNIRichiamo", { campo: row.Bukrs, campo1: row.Gjahr, campo2: row.Zamministr, campo3: row.ZchiaveNi, campo4: row.ZidNi, campo5: row.ZRagioCompe })
            //     if (row.ZcodiStatoni == "NI Annullata per Rilievo")
            //         this.getOwnerComponent().getRouter().navTo("annullataNIRilievo", { campo: row.Bukrs, campo1: row.Gjahr, campo2: row.Zamministr, campo3: row.ZchiaveNi, campo4: row.ZidNi, campo5: row.ZRagioCompe })
            // },

            navToDettagliNI: function (oEvent) {
                var self =this;
                var row = self.getView().byId("HeaderNI").getSelectedItem().getBindingContext("HeaderNI").getObject();

                if (row.ZcodiStatoni === "00")//NI Preimpostata
                    this.getOwnerComponent().getRouter().navTo("iconTabBar", { campo: row.Bukrs, campo1: row.Gjahr, campo2: row.Zamministr, campo3: row.ZchiaveNi, campo4: row.ZidNi, campo5: row.ZRagioCompe })
                if (row.ZcodiStatoni === "01")//NI Provvisoria
                    this.getOwnerComponent().getRouter().navTo("inserisciInvioFirma", { campo: row.Bukrs, campo1: row.Gjahr, campo2: row.Zamministr, campo3: row.ZchiaveNi, campo4: row.ZidNi, campo5: row.ZRagioCompe })
                if (row.ZcodiStatoni === "02")//NI Inviata alla firma
                    this.getOwnerComponent().getRouter().navTo("revocaFirma", { campo: row.Bukrs, campo1: row.Gjahr, campo2: row.Zamministr, campo3: row.ZchiaveNi, campo4: row.ZidNi, campo5: row.ZRagioCompe })
                if (row.ZcodiStatoni === "")
                    this.getOwnerComponent().getRouter().navTo("passaggioStato", { campo: row.Bukrs, campo1: row.Gjahr, campo2: row.Zamministr, campo3: row.ZchiaveNi, campo4: row.ZidNi, campo5: row.ZRagioCompe })
                if (row.ZcodiStatoni === "04")//NI In Verifica
                    this.getOwnerComponent().getRouter().navTo("richiamaNI", { campo: row.Bukrs, campo1: row.Gjahr, campo2: row.Zamministr, campo3: row.ZchiaveNi, campo4: row.ZidNi, campo5: row.ZRagioCompe })
                if (row.ZcodiStatoni === "05")//NI Confermata
                    this.getOwnerComponent().getRouter().navTo("conferma", { campo: row.Bukrs, campo1: row.Gjahr, campo2: row.Zamministr, campo3: row.ZchiaveNi, campo4: row.ZidNi, campo5: row.ZRagioCompe })
                if (row.ZcodiStatoni === "06")//NI Validata RGS
                    this.getOwnerComponent().getRouter().navTo("richiamoNIRGS", { campo: row.Bukrs, campo1: row.Gjahr, campo2: row.Zamministr, campo3: row.ZchiaveNi, campo4: row.ZidNi, campo5: row.ZRagioCompe })
                if (row.ZcodiStatoni === "07")//NI con Rilievo Registrato
                    this.getOwnerComponent().getRouter().navTo("richiamoRilievoRegistrato", { campo: row.Bukrs, campo1: row.Gjahr, campo2: row.Zamministr, campo3: row.ZchiaveNi, campo4: row.ZidNi, campo5: row.ZRagioCompe })
                if (row.ZcodiStatoni === "09")//NI Annullata
                    this.getOwnerComponent().getRouter().navTo("annullataNI", { campo: row.Bukrs, campo1: row.Gjahr, campo2: row.Zamministr, campo3: row.ZchiaveNi, campo4: row.ZidNi, campo5: row.ZRagioCompe })
                if (row.ZcodiStatoni === "10")//NI Annullata per Richiamo
                    this.getOwnerComponent().getRouter().navTo("annullataNIRichiamo", { campo: row.Bukrs, campo1: row.Gjahr, campo2: row.Zamministr, campo3: row.ZchiaveNi, campo4: row.ZidNi, campo5: row.ZRagioCompe })
                if (row.ZcodiStatoni === "11")//NI Annullata per Rilievo
                    this.getOwnerComponent().getRouter().navTo("annullataNIRilievo", { campo: row.Bukrs, campo1: row.Gjahr, campo2: row.Zamministr, campo3: row.ZchiaveNi, campo4: row.ZidNi, campo5: row.ZRagioCompe })
           
            },


            //CONTROLLO PER FAR VISUALIZZARE SOLO UN FILTRO NELLE COMBOBOX

            // checkItemCB: function (oEvent) {
            //     //this.getView().byId("filterbar").mAggregations.filterGroupItems
            //     var listaDoppEG = []
            //     var listaEG = []
            //     var numFilter = oEvent.getParameters().selectionSet.length;
            //     for (var i = 0; i < numFilter; i++) {
            //         var valore = oEvent.getParameters().selectionSet[i].mProperties.value
            //         if (valore && valore != "null") {
            //             if (!listaEG.includes(valore)) {
            //                 listaEG.push({
            //                     code: valore
            //                 });
            //                 listaDoppEG.push(valore)
            //             }

            //         }

            //     }
            //     var esGestioneModel = new sap.ui.model.json.JSONModel(listaEG);
            //     this.getOwnerComponent().setModel(esGestioneModel, "esGestioneModel");
            // },

            //ZgjahrEngNi

            chiaveNI: function () {
                this.chiaveSubNI()
                this.ZRagioCompe()
                var that = this
                var datiNI = []
                var visibilità = this.getView().getModel("temp").getData().Visibilità[0]
                var Gjahr = this.getView().byId("es_gestione").getSelectedItem().mProperties.text

                datiNI.push(new Filter({
                    path: "Gjahr",
                    operator: FilterOperator.EQ,
                    value1: Gjahr,
                }));

                if(Gjahr && Gjahr !== ""){
                    this.getView().getModel("temp").setProperty('/EsercizioGestioneMC', Gjahr);
                }

                this.getView().getModel().read("/ZhfNotabozzaSet", {
                    filters: datiNI,
                    urlParameters: { "AutorityRole": visibilità.AGR_NAME, "AutorityFikrs": visibilità.FIKRS, "AutorityPrctr": visibilità.PRCTR },
                    success: function (data) {
                        //oMdl.setData(data.results);
                        that.getView().getModel("temp").setProperty('/ZhfNotabozzaSet', data.results)
                        //that.setDescrizioneStato(data.results)
                    },
                    error: function (error) {
                        //that.getView().getModel("temp").setProperty(sProperty,[]);
                        //that.destroyBusyDialog();
                        var e = error;
                    }
                })
            },

            chiaveSubNI: function () {
                var that = this
                var datiNI = []
                var visibilità = this.getView().getModel("temp").getData().Visibilità[0]
                var Gjahr = this.getView().byId("es_gestione").getSelectedItem().mProperties.text

                datiNI.push(new Filter({
                    path: "Gjahr",
                    operator: FilterOperator.EQ,
                    value1: Gjahr,
                }));

                this.getView().getModel().read("/ZhfNotaimpSet", {
                    filters: datiNI,
                    urlParameters: { "AutorityRole": visibilità.AGR_NAME, "AutorityFikrs": visibilità.FIKRS, "AutorityPrctr": visibilità.PRCTR },
                    success: function (data) {
                        //oMdl.setData(data.results);
                        that.getView().getModel("temp").setProperty('/ZhfNotaimpSet', data.results)
                        //that.setDescrizioneStato(data.results)
                    },
                    error: function (error) {
                        //that.getView().getModel("temp").setProperty(sProperty,[]);
                        //that.destroyBusyDialog();
                        var e = error;
                    }
                })
            },

            EsercizioPosizioneFinanziaria: function () {
                var that = this;
                var oMdl = new sap.ui.model.json.JSONModel();
                this.getOwnerComponent().getModel().read("/EsercizioNiSet", {
                    filters: [],
                    urlParameters: "",
                    success: function (data) {
                        oMdl.setData(data.results);
                        that.getView().getModel("temp").setProperty('/EsercizioNiSet', data.results)
                    },
                    error: function (error) {
                        //that.getView().getModel("temp").setProperty(sProperty,[]);
                        //that.destroyBusyDialog();
                        var e = error;
                    }
                });
            },

            getFilters:function(){
                var self = this,
                    filter = [],
                    esGestione = self.getView().byId("es_gestione"),//						 				->select	
                    amministrazione  = self.getView().byId("amministrazioneEG1"),// 							->input
                    ragioneria  = self.getView().byId("ragioneria1"),// 										->input
                    capitolo  = self.getView().byId("capitolo1"),// 											->input
                    progressivoNIDa  = self.getView().byId("progressivoNIDa1"),// 							-> input
                    progressivoNIA  = self.getView().byId("progressivoNIA1"),//
                    numNIDa  = self.getView().byId("NumNIDa1"),//
                    numNIA  = self.getView().byId("NumNIA1"),//
                    dataRegNIDA = self.getView().byId("dataRegNIDa1"),//									->dtp
                    dataRegNIA = self.getView().byId("dataRegNIA1"),// 										-dtp
                    mese = self.getView().byId("mese1"),// 													-> sleect
                    statoNI = self.getView().byId("statoNI1"),//												->sleect
                    esDecreto = self.getView().byId("es_decreto1"),// 										-> sleect
                    amministrazioneED = self.getView().byId("amministrazioneED1"),// 
                    uffLivello = self.getView().byId("uff1Livello1"),//
                    uffLivello2 = self.getView().byId("uff2Livello2"),//
                    numDecDa = self.getView().byId("numDecretoDa1"),//
                    numDecA = self.getView().byId("numDecretoA1"),//
                    numIPEDa = self.getView().byId("numIPEDa1"),//
                    numIPEA = self.getView().byId("numIPEA1"),//
                    numClausolaDa = self.getView().byId("numClausolaDa1"),//
                    numClausolaA = self.getView().byId("numClausolaA1"),//
                    dataFirmaAmm = self.getView().byId("dataFirmaAmmDa1"),// 								-> dpèt
                    dataFirmaAmmA = self.getView().byId("dataFirmaAmmA1"),//								-> dopt
                    dataProtocolloAmmDa = self.getView().byId("dataProtocolloAmmDa1"),// 					->dpt
                    dataProtocollaAmmA = self.getView().byId("dataProtocolloAmmA1"),// 						->dpt
                    dataProtocolloRGSDA = self.getView().byId("dataProtocolloRGSDa1"),//					->dpt
                    dataProtocolloRGSA = self.getView().byId("dataProtocolloRGSA1"),// 						->dpt
                    numProtocolloRGS = self.getView().byId("numProtocolloRGS1"),//
                    esPF = self.getView().byId("es_PF1"),//													->select
                    struttAmm = self.getView().byId("idFilterStruttAmmResp"),
                    inputPosFin = self.getView().byId("inputPosFin"),//
                    autorizzazione = self.getView().byId("autorizzazione1"),//								->select
                    nProtocolloAmm = self.getView().byId("numProtocolloAmm1"),
                    epr = self.getView().byId("EPR1");//													->

                if(esGestione && esGestione.getSelectedKey()){
                    filter.push(new sap.ui.model.Filter("Gjahr",sap.ui.model.FilterOperator.EQ,esGestione.getSelectedKey()));
                }    
                if(amministrazione && amministrazione.getValue()!== undefined && amministrazione.getValue() !== ""){
                    filter.push(new sap.ui.model.Filter("Zamministr",sap.ui.model.FilterOperator.EQ,amministrazione.getValue()));
                }
                if(ragioneria && ragioneria.getValue()!== undefined && ragioneria.getValue() !== ""){
                    filter.push(new sap.ui.model.Filter("ZRagioCompe",sap.ui.model.FilterOperator.EQ,ragioneria.getValue()));
                }
                if(capitolo && capitolo.getValue()!== undefined && capitolo.getValue() !== ""){
                    filter.push(new sap.ui.model.Filter("Zcapitolo",sap.ui.model.FilterOperator.EQ,capitolo.getValue()));
                }
                if(progressivoNIDa && progressivoNIDa.getValue()!== undefined && progressivoNIDa.getValue() !== ""){
                    if(progressivoNIA && progressivoNIA.getValue()!== undefined && progressivoNIA.getValue() !== ""){
                        filter.push(new sap.ui.model.Filter("ZchiaveNi",sap.ui.model.FilterOperator.BT,
                            progressivoNIDa.getValue(),
                            progressivoNIA.getValue()
                        ));
                    }
                    else{
                        filter.push(new sap.ui.model.Filter("ZchiaveNi",sap.ui.model.FilterOperator.EQ,progressivoNIDa.getValue()));
                    }
                }

                if(numNIDa && numNIDa.getValue()!== undefined && numNIDa.getValue() !== ""){
                    if(numNIA && numNIA.getValue()!== undefined && numNIA.getValue() !== ""){
                        filter.push(new sap.ui.model.Filter("ZzChiaveSubniPos",sap.ui.model.FilterOperator.BT,
                            numNIDa.getValue(),
                            numNIA.getValue()
                        ));
                    }
                    else{
                        filter.push(new sap.ui.model.Filter("ZzChiaveSubniPos",sap.ui.model.FilterOperator.EQ,numNIDa.getValue()));
                    }
                }

                if(dataRegNIDA?.getValue() && dataRegNIDA.getValue()!== undefined && dataRegNIDA.getValue() !== ""){
                    if(dataRegNIA && dataRegNIA.getValue()!== undefined && dataRegNIA.getValue() && dataRegNIA.getValue() !== ""){
                        filter.push(new sap.ui.model.Filter("ZdataCreaz",sap.ui.model.FilterOperator.BT, 
                            self.formateDateForFilter(dataRegNIDA.getDateValue()),self.formateDateForFilter(dataRegNIA.getDateValue()) ));
                    }
                    else{
                        filter.push(new sap.ui.model.Filter("ZdataCreaz",sap.ui.model.FilterOperator.EQ, self.formateDateForFilter(dataRegNIDA?.getDateValue())));  
                    }
                                      
                }
                
                if(mese && mese.getSelectedKey()){
                    filter.push(new sap.ui.model.Filter("Zmese",sap.ui.model.FilterOperator.EQ,mese.getSelectedKey()));
                }   
                if(statoNI && statoNI.getSelectedKey()){
                    filter.push(new sap.ui.model.Filter("ZcodiStatoni",sap.ui.model.FilterOperator.EQ,statoNI.getSelectedKey()));
                }  
                if(esDecreto && esDecreto.getSelectedKey()){
                    filter.push(new sap.ui.model.Filter("ZzGjahrEngPos",sap.ui.model.FilterOperator.EQ,esDecreto.getSelectedKey()));
                } 
                if(amministrazioneED && amministrazioneED.getValue()!== undefined && amministrazioneED.getValue() !== ""){
                    filter.push(new sap.ui.model.Filter("ZzAmminDec",sap.ui.model.FilterOperator.EQ,amministrazioneED.getValue()));
                }
                if(uffLivello && uffLivello.getValue()!== undefined && uffLivello.getValue() !== ""){
                    filter.push(new sap.ui.model.Filter("ZzUfficioliv1Pos",sap.ui.model.FilterOperator.EQ,uffLivello.getValue()));
                }
                if(uffLivello2 && uffLivello2.getValue()!== undefined && uffLivello2.getValue() !== ""){
                    filter.push(new sap.ui.model.Filter("ZzUfficioliv2Pos",sap.ui.model.FilterOperator.EQ,uffLivello2.getValue()));
                }

                if(numDecDa && numDecDa.getValue()!== undefined && numDecDa.getValue() !== ""){
                    if(numDecA && numDecA.getValue()!== undefined && numDecA.getValue() !== ""){
                        filter.push(new sap.ui.model.Filter("ZzCoddecrPos",sap.ui.model.FilterOperator.BT,
                        numDecDa.getValue(),
                        numDecA.getValue()
                        ));
                    }
                    else{
                        filter.push(new sap.ui.model.Filter("ZzCoddecrPos",sap.ui.model.FilterOperator.EQ,numDecDa.getValue()));
                    }
                }

                if(numIPEDa && numIPEDa.getValue()!== undefined && numIPEDa.getValue() !== ""){
                    if(numIPEA && numIPEA.getValue()!== undefined && numIPEA.getValue() !== ""){
                        filter.push(new sap.ui.model.Filter("ZzCodIpePos",sap.ui.model.FilterOperator.BT,
                        numIPEDa.getValue(),
                        numIPEA.getValue()
                        ));
                    }
                    else{
                        filter.push(new sap.ui.model.Filter("ZzCodIpePos",sap.ui.model.FilterOperator.EQ,numIPEDa.getValue()));
                    }
                }

                if(numClausolaDa && numClausolaDa.getValue()!== undefined && numClausolaDa.getValue() !== ""){
                    if(numClausolaA && numClausolaA.getValue()!== undefined && numClausolaA.getValue() !== ""){
                        filter.push(new sap.ui.model.Filter("ZzNumClaPos",sap.ui.model.FilterOperator.BT,
                        numClausolaDa.getValue(),
                        numClausolaA.getValue()
                        ));
                    }
                    else{
                        filter.push(new sap.ui.model.Filter("ZzNumClaPos",sap.ui.model.FilterOperator.EQ,numClausolaDa.getValue()));
                    }
                }

                if(dataFirmaAmm?.getValue() && dataFirmaAmm.getValue()!== undefined && dataFirmaAmm.getValue() !== ""){
                    if(dataFirmaAmmA && dataFirmaAmmA.getValue()!== undefined &&  dataFirmaAmmA.getValue() && dataFirmaAmmA.getValue() !== ""){
                        filter.push(new sap.ui.model.Filter("ZdataFirmNi",sap.ui.model.FilterOperator.BT, 
                        self.formateDateForFilter(dataFirmaAmm.getDateValue()),self.formateDateForFilter(dataFirmaAmmA.getDateValue()) ));
                    }
                    else
                        filter.push(new sap.ui.model.Filter("ZdataFirmNi",sap.ui.model.FilterOperator.EQ, self.formateDateForFilter(dataFirmaAmm.getDateValue())));                    
                }

                if(dataProtocolloAmmDa?.getValue() && dataProtocolloAmmDa.getValue()!== undefined && dataProtocolloAmmDa.getValue() !== ""){
                    if(dataProtocollaAmmA && dataProtocollaAmmA.getValue()!== undefined && dataProtocollaAmmA.getValue() && dataProtocollaAmmA.getValue() !== ""){
                        filter.push(new sap.ui.model.Filter("ZdataProtAmm",sap.ui.model.FilterOperator.BT, 
                        self.formateDateForFilter(dataProtocolloAmmDa.getDateValue()),self.formateDateForFilter(dataProtocollaAmmA.getDateValue()) ));
                    }
                    else
                        filter.push(new sap.ui.model.Filter("ZdataProtAmm",sap.ui.model.FilterOperator.EQ, self.formateDateForFilter(dataProtocolloAmmDa.getDateValue())));                    
                }

                if(dataProtocolloRGSDA?.getValue() && dataProtocolloRGSDA.getValue() !== undefined && dataProtocolloRGSDA.getValue() !== ""){
                    if(dataProtocolloRGSA && dataProtocolloRGSA.getValue()!== undefined && dataProtocolloRGSA.getValue() && dataProtocolloRGSA.getValue() !== ""){
                        filter.push(new sap.ui.model.Filter("ZdataProtRag",sap.ui.model.FilterOperator.BT, 
                        self.formateDateForFilter(dataProtocolloRGSDA.getDateValue()),self.formateDateForFilter(dataProtocolloRGSA.getDateValue()) ));
                    }
                    else
                        filter.push(new sap.ui.model.Filter("ZdataProtRag",sap.ui.model.FilterOperator.EQ, self.formateDateForFilter(dataProtocolloRGSDA.getDateValue())));                    
                }
                
                if(numProtocolloRGS && numProtocolloRGS.getValue()!== undefined && numProtocolloRGS.getValue() !== ""){
                    filter.push(new sap.ui.model.Filter("NProtocolloRag",sap.ui.model.FilterOperator.EQ,numProtocolloRGS.getValue()));
                } 
                if(esPF && esPF.getSelectedKey()){
                    filter.push(new sap.ui.model.Filter("Esercizio",sap.ui.model.FilterOperator.EQ,esPF.getSelectedKey()));
                } 
                if(struttAmm && struttAmm.getValue()!== undefined && struttAmm.getValue() !== ""){
                    filter.push(new sap.ui.model.Filter("Fistl",sap.ui.model.FilterOperator.EQ,struttAmm.getValue()));
                } 
                if(inputPosFin && inputPosFin.getValue()!== undefined && inputPosFin.getValue() !== ""){
                    filter.push(new sap.ui.model.Filter("Fipex",sap.ui.model.FilterOperator.EQ,inputPosFin.getValue()));
                } 
                if(autorizzazione && autorizzazione.getSelectedKey()){
                    filter.push(new sap.ui.model.Filter("ZzZgeberPos",sap.ui.model.FilterOperator.EQ,autorizzazione.getSelectedKey()));
                }  
                if(epr && epr.getValue()!== undefined && epr.getValue() !== ""){
                    filter.push(new sap.ui.model.Filter("ZzEprPos",sap.ui.model.FilterOperator.EQ,epr.getValue()));
                } 

                if(nProtocolloAmm && nProtocolloAmm.getValue()!== undefined && nProtocolloAmm.getValue() !== ""){
                    filter.push(new sap.ui.model.Filter("NProtocolloAmm",sap.ui.model.FilterOperator.EQ,nProtocolloAmm.getValue()));
                }
                
                return filter;
            },

            onSearch: function (oEvent) {
                // this.getView().byId("PreimpostazioneNI").setEnabled(true);
                var visibilità = this.getView().getModel("temp").getData().Visibilità[0]

                var esGestione = this.getView().byId("es_gestione");	
                if(!esGestione || esGestione.getSelectedKey() === ""){
                    MessageBox.error("Valorizzare Esercizio di gestione", {
                        actions: [sap.m.MessageBox.Action.OK],
                        emphasizedAction: MessageBox.Action.OK,
                    });
                    return false;
                }
                var that = this;
                var datiNI = [];

                //TODO:da canc
                // var abc=this.getView().byId("filterbar").getAllFilterItems();

                // var bindingInfo = ""
                // var path = ""

                // var numFilter = oEvent.getParameters().selectionSet.length;

                datiNI = this.getFilters();


                //TODO:da canc
                // for (let i = 0; i < numFilter; i++) {

                //     bindingInfo = "items"
                //     path = oEvent.getParameters().selectionSet[i].getBindingInfo(bindingInfo)
                //     if (path == undefined) {
                //         bindingInfo = "suggestionItems"
                //         path = oEvent.getParameters().selectionSet[i].getBindingInfo(bindingInfo)
                //     }
                //     var filtro = oEvent.getParameters().selectionSet[i]

                //     if (filtro) {
                //         if (i == 4) {
                //             if (oEvent.getParameters().selectionSet[4].mProperties.value != '') {
                //                 datiNI.push(new Filter({
                //                     path: "ZchiaveNi",
                //                     operator: FilterOperator.BT,
                //                     value1: oEvent.getParameters().selectionSet[4].mProperties.value,
                //                     value2: oEvent.getParameters().selectionSet[5].mProperties.value
                //                 }));
                //             }
                //         }
                //         if (i == 6) {
                //             if (oEvent.getParameters().selectionSet[6].mProperties.value != '') {
                //                 datiNI.push(new Filter({
                //                     path: "ZzChiaveSubniPos",
                //                     operator: FilterOperator.BT,
                //                     value1: oEvent.getParameters().selectionSet[6].mProperties.value,
                //                     value2: oEvent.getParameters().selectionSet[7].mProperties.value
                //                 }));
                //             }
                //         }
                //         if (i == 16) {
                //             if (oEvent.getParameters().selectionSet[16].mProperties.value != '') {
                //                 datiNI.push(new Filter({
                //                     path: "Zcoddecr",
                //                     operator: FilterOperator.BT,
                //                     value1: oEvent.getParameters().selectionSet[16].mProperties.value,
                //                     value2: oEvent.getParameters().selectionSet[17].mProperties.value
                //                 }));
                //             }
                //         }
                //         if (i == 18) {
                //             if (oEvent.getParameters().selectionSet[18].mProperties.value != '') {
                //                 datiNI.push(new Filter({
                //                     path: "ZzCodIpePos",
                //                     operator: FilterOperator.BT,
                //                     value1: oEvent.getParameters().selectionSet[18].mProperties.value,
                //                     value2: oEvent.getParameters().selectionSet[19].mProperties.value
                //                 }));
                //             }
                //         }
                //         if (i == 20) {
                //             if (oEvent.getParameters().selectionSet[20].mProperties.value != '') {
                //                 datiNI.push(new Filter({
                //                     path: "ZzNumClaPos",
                //                     operator: FilterOperator.BT,
                //                     value1: oEvent.getParameters().selectionSet[20].mProperties.value,
                //                     value2: oEvent.getParameters().selectionSet[21].mProperties.value
                //                 }));
                //             }
                //         }



                //         else if (i == 5 || i == 7 || i == 17 || i == 19 || i == 21) {
                //             continue
                //         }

                //         if (filtro.mProperties.dateValue instanceof Date || !isNaN(filtro.mProperties.dateValue)) {
                //             if (i == 8) {
                //                 if (oEvent.getParameters().selectionSet[8].mProperties.value != '') {
                //                     datiNI.push(new Filter({
                //                         path: "ZdataCreaz",
                //                         operator: FilterOperator.BT,
                //                         value1: oEvent.getParameters().selectionSet[8].mProperties.value,
                //                         value2: oEvent.getParameters().selectionSet[9].mProperties.value
                //                     }));
                //                 }
                //             }
                //             if (i == 20) {
                //                 if (oEvent.getParameters().selectionSet[18].mProperties.value != '') {
                //                     datiNI.push(new Filter({
                //                         path: "ZdataFirmNi",
                //                         operator: FilterOperator.BT,
                //                         value1: oEvent.getParameters().selectionSet[20].mProperties.value,
                //                         value2: oEvent.getParameters().selectionSet[21].mProperties.value
                //                     }));
                //                 }
                //             }
                //             if (i == 22) {
                //                 if (oEvent.getParameters().selectionSet[20].mProperties.value != '') {
                //                     datiNI.push(new Filter({
                //                         path: "ZdataProtAmm",
                //                         operator: FilterOperator.BT,
                //                         value1: oEvent.getParameters().selectionSet[22].mProperties.value,
                //                         value2: oEvent.getParameters().selectionSet[23].mProperties.value
                //                     }));
                //                 }
                //             }
                //             if (i == 25) {
                //                 if (oEvent.getParameters().selectionSet[23].mProperties.value != '') {
                //                     datiNI.push(new Filter({
                //                         path: "ZdataProtRag",
                //                         operator: FilterOperator.BT,
                //                         value1: oEvent.getParameters().selectionSet[25].mProperties.value,
                //                         value2: oEvent.getParameters().selectionSet[26].mProperties.value
                //                     }));
                //                 }
                //             }
                //         }
                //         else if (oEvent.getParameters().selectionSet[i].mProperties.value != '' && i != 4 && i != 6 && i != 11 && i != 10 && i != 16 && i != 18 && i != 20) {
                //             datiNI.push(new Filter({
                //                 path: path.sorter.sPath,
                //                 operator: FilterOperator.EQ,
                //                 // value1: filtro.getValue()
                //                 value1: filtro.getSelectedKey()
                //             }));
                //             //datiNI.push("?$filter= "+path.sorter.sPath+" eq '" + filtro.getValue() + "'");
                //         }
                //         else if (i == 9 || i == 21 || i == 23 || i == 26) {
                //             continue
                //         }

                //         else if (i == 0) {
                //             if (oEvent.getParameters().selectionSet[i].mProperties.value == '') {
                //                 MessageBox.error("Valorizzare Esercizio di gestione", {
                //                     actions: [sap.m.MessageBox.Action.OK],
                //                     emphasizedAction: MessageBox.Action.OK,
                //                 })
                //             }
                //         }
                //         else if (i == 11) {
                //             var stati = this.getView().getModel("temp").getData().StateNI
                //             for (var st = 0; st < stati.length; st++) {
                //                 if (oEvent.getParameters().selectionSet[i].mProperties.value == stati[st].ZstatoDescNi) {
                //                     datiNI.push(new Filter({
                //                         path: "ZcodiStatoni",
                //                         operator: FilterOperator.EQ,
                //                         value1: stati[st].ZcodiStatoni
                //                     }));
                //                 }

                //             }

                //         }
                //         else if (i == 10) {
                //             var mese = this.getView().getModel("temp").getData().ZmeseSet
                //             for (var me = 0; me < mese.length; me++) {
                //                 if (oEvent.getParameters().selectionSet[i].mProperties.value == mese[me].Descrizione) {
                //                     switch (mese[me].Descrizione) {
                //                         case "Gennaio":
                //                             var nMese = "1"
                //                             break;
                //                         case "Febbraio":
                //                             var nMese = "2"
                //                             break;
                //                         case "Marzo":
                //                             var nMese = "3"
                //                             break;
                //                         case "Aprile":
                //                             var nMese = "4"
                //                             break;
                //                         case "Maggio":
                //                             var nMese = "5"
                //                             break;
                //                         case "Giugno":
                //                             var nMese = "6"
                //                             break;
                //                         case "Luglio":
                //                             var nMese = "7"
                //                             break;
                //                         case "Agosto":
                //                             var nMese = "8"
                //                             break;
                //                         case "Settembre":
                //                             var nMese = "9"
                //                             break;
                //                         case "Ottobre":
                //                             var nMese = "10"
                //                             break;
                //                         case "Novembre":
                //                             var nMese = "11"
                //                             break;
                //                         case "Dicembre":
                //                             var nMese = "12"
                //                             break;
                //                         default: break;
                //                     }

                //                     datiNI.push(new Filter({
                //                         path: "Zmese",
                //                         operator: FilterOperator.EQ,
                //                         value1: nMese
                //                     }));
                //                 }

                //             }

                //         }
                //     }
                // }
                // if (datiNI.length != 0 && datiNI[0].sPath == "Gjahr") {
                    //console.log(datiNI)
                    var that = this;
                    var oMdl = new sap.ui.model.json.JSONModel();
                    
                    this.getView().setBusy(true);
                    this.getView().getModel().read("/HeaderNISet", {
                        filters: datiNI,
                        urlParameters: { "AutorityRole": visibilità.AGR_NAME, "AutorityFikrs": visibilità.FIKRS, "AutorityPrctr": visibilità.PRCTR },
                        success: function (data) {
                            oMdl.setData(data.results);
                            that.getView().getModel("temp").setProperty('/HeaderNISet', data.results)
                            //that.setVirgolaMigliaia(data.results)
                            // that.setDescrizioneStato(data.results)
                            that.getView().setBusy(false);
                        },
                        error: function (error) {
                            that.getView().setBusy(false);
                            var message = JSON.parse(error.responseText);
                            MessageBox.error(message.error.message.value, {
                                actions: [sap.m.MessageBox.Action.OK],
                                emphasizedAction: MessageBox.Action.OK,
                            })
                        }
                    });

                // }

                this.getOwnerComponent().setModel(oMdl, "HeaderNI");
                //sap.ui.getCore().TableModel = oMdlW;
                this.getView().byId("Esporta").setEnabled(true);

                //this.checkItemCB(oEvent)
            },

            setVirgolaMigliaia: function (header) {
                for (var x = 0; x < header.length; x++) {
                    var arrayVirgola = header[x].ZimpoTotni.split(".")
                    // var importoVirgola = arrayVirgola[0]+","+arrayVirgola[1]

                    var numPunti = ""
                    var migliaia = arrayVirgola[0].split('').reverse().join('').match(/.{1,3}/g).map(function (x) {
                        return x.split('').reverse().join('')
                    }).reverse()
                    for (var i = 0; i < migliaia.length; i++) {
                        numPunti = (numPunti + migliaia[i] + ".")
                    }

                    var indice = numPunti.split("").length
                    var totale = numPunti.substring(0, indice - 1) + "," + arrayVirgola[1]
                    let array = totale.split(",")
                    let valoreTagliato = array[1].substring(0, 2)
                    header[x].ZimpoTotni = array[0] + "," + valoreTagliato
                }

                var oMdl = new sap.ui.model.json.JSONModel();
                this.getView().getModel("temp").setProperty('/HeaderNISet', header)
                oMdl.setData(header);
                this.getOwnerComponent().setModel(oMdl, "HeaderNI");
            },

            setDescrizioneStato: function (header) {
                var that = this
                for (var x = 0; x < header.length; x++) {
                    switch (header[x].ZcodiStatoni) {
                        case "00":
                            that.getView().byId("HeaderNI").getItems()[x].mAggregations.cells[5].setText("NI Preimpostata")
                            break;
                        case "01":
                            that.getView().byId("HeaderNI").getItems()[x].mAggregations.cells[5].setText("NI Provvisoria")
                            break;
                        case "02":
                            that.getView().byId("HeaderNI").getItems()[x].mAggregations.cells[5].setText("NI Inviata alla firma")
                            break;
                        case "03":
                            that.getView().byId("HeaderNI").getItems()[x].mAggregations.cells[5].setText("NI Firmata Amm.")
                            break;
                        case "04":
                            that.getView().byId("HeaderNI").getItems()[x].mAggregations.cells[5].setText("NI In Verifica")
                            break;
                        case "05":
                            that.getView().byId("HeaderNI").getItems()[x].mAggregations.cells[5].setText("NI Confermata")
                            break;
                        case "06":
                            that.getView().byId("HeaderNI").getItems()[x].mAggregations.cells[5].setText("NI Validata RGS")
                            break;
                        case "07":
                            that.getView().byId("HeaderNI").getItems()[x].mAggregations.cells[5].setText("NI con Rilievo Registrato")
                            break;
                        case "08":
                            that.getView().byId("HeaderNI").getItems()[x].mAggregations.cells[5].setText("NI con Rilievo Validato RGS")
                            break;
                        case "09":
                            that.getView().byId("HeaderNI").getItems()[x].mAggregations.cells[5].setText("NI Annullata")
                            break;
                        case "10":
                            that.getView().byId("HeaderNI").getItems()[x].mAggregations.cells[5].setText("NI Annullata per Richiamo")
                            break;
                        case "11":
                            that.getView().byId("HeaderNI").getItems()[x].mAggregations.cells[5].setText("NI Annullata per Rilievo")
                            break;
                        case "12":
                            that.getView().byId("HeaderNI").getItems()[x].mAggregations.cells[5].setText("NI Inviata a BKI")
                            break;
                    }
                }
            },

            navToWizard: function (oEvent) {
                this.getOwnerComponent().getRouter().navTo("wizard");
            },

            navToWizard2: function (oEvent) {
                this.getOwnerComponent().getRouter().navTo("wizard2");
            },

            onRowSelectionChange: function (oEvent) {
                var self= this;
                //TODO:da canc
                //this.getView().byId("PreimpostazioneNI").setEnabled(false); //
                // self.getView().byId("DettagliNI").setEnabled(true);
                var authConiModel = self.getView().getModel("temp").getProperty("/Visibilità");
                self.getView().byId("DettagliNI").setEnabled(true)//self.isUserEnabled(authConiModel,"ACTV_3",'Z03'));
            },

            onCallStateNI: function () {
                var that = this;
                //var oMdlITB = new sap.ui.model.json.JSONModel();
                this.getOwnerComponent().getModel().read("/StateNISet", {
                    filters: [],
                    //filters: [],
                    urlParameters: "",

                    success: function (data) {
                        that.getView().getModel("temp").setProperty('/StateNI', data.results)

                    },
                    error: function (error) {
                        var e = error;
                    }
                });
            }
        });
    });