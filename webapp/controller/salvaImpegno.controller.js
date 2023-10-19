sap.ui.define([
    "sap/ui/model/odata/v2/ODataModel",
    "./BaseController",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    'sap/ui/model/json/JSONModel',
    "sap/m/MessageBox",
    'sap/ui/export/Spreadsheet',
    "sap/ui/core/library",
    "project1/model/DateFormatter",
    "sap/ui/core/routing/History",
    'sap/m/library',

],

    function (ODataModel, BaseController, Filter, FilterOperator, JSONModel, MessageBox, Spreadsheet, CoreLibrary, DateFormatter, History, mobileLibrary) {
        "use strict";
        const MODEL_ENTITY = "EntityModel";   
        var EdmType = sap.ui.export.EdmType

        var ValueState = CoreLibrary.ValueState,
            oButton = {
                TableVisible: false
            };

        return BaseController.extend("project1.controller.salvaImpegno", {
            formatter: DateFormatter,
            onInit() {
                var self =this;

                var oProprietà = new JSONModel(),
                    oInitialModelState = Object.assign({}, oButton);
                oProprietà.setData(oInitialModelState);
                this.getView().setModel(oProprietà);
                this.getOwnerComponent().getModel("temp");
                //this.prePosition()
                // this.callVisibilità()

                var oModelJson = new JSONModel({
                    Header:null,
                    ImpegnoValues:null,
                    PositionNI:[],
                    HeaderSalva:[],
                    ZdescwelsBniSet:[]             
                }); 

                self.getView().setModel(oModelJson,MODEL_ENTITY);
                self.getRouter().getRoute("salvaImpegno").attachPatternMatched(self._onObjectMatched, self);
            },
            
            pulsantiVisibiltà: function (data) {
                for (var d = 0; d < data.length; d++) {
                    if (data[d].ACTV_1 == "Z01") {
                       //this.getView().byId("pressAssImpegno").setEnabled(false);
                        this.getView().byId("CompletaNI").setEnabled(true);
                    }
                    // if (data[d].ACTV_2 == "Z02") {
                    //     this.getView().byId("rettificaNI").setEnabled(true);
                    // }
                    if (data[d].ACTV_4 == "Z07") {
                        this.getView().byId("AnnullaNI").setEnabled(true);
                    }
                }
            },

            _onObjectMatched: function (oEvent) {
                var self =this;

                var path = self.getOwnerComponent().getModel().createKey("HeaderNISet", {
                    Bukrs: oEvent.getParameters().arguments.campo,                    
                    Gjahr: oEvent.getParameters().arguments.campo1,
                    Zamministr: oEvent.getParameters().arguments.campo2,
                    ZchiaveNi: oEvent.getParameters().arguments.campo3,
                    ZidNi: oEvent.getParameters().arguments.campo4,
                    ZRagioCompe: oEvent.getParameters().arguments.campo5
                }); 

                if(!self.getView().getModel("temp").getProperty("/ImpegniSelezionati") || self.getView().getModel("temp").getProperty("/ImpegniSelezionati") === null ||  
                !self.getView().getModel("temp").getProperty('/SalvaImpegnoValues') || self.getView().getModel("temp").getProperty('/SalvaImpegnoValues') === null){
                    self.getOwnerComponent().getRouter().navTo("aImpegno", 
                    { 
                        campo: oEvent.getParameters().arguments.campo, 
                        campo1: oEvent.getParameters().arguments.campo1, 
                        campo2: oEvent.getParameters().arguments.campo2, 
                        campo3: oEvent.getParameters().arguments.campo3, 
                        campo4: oEvent.getParameters().arguments.campo4, 
                        campo5: oEvent.getParameters().arguments.campo5 
                    });  
                }
                else{   
                    if(!self.getOwnerComponent().getModel("temp").getData().Visibilità || 
                        self.getOwnerComponent().getModel("temp").getData().Visibilità === null){

                        self.callPreventVisibilitaWithCallback(function(callback){
                            if(callback){     
                                self.pulsantiVisibiltà(self.getOwnerComponent().getModel("temp").getProperty("/Visibilità"));
                                self.loadView(path);                
                            }
                        });    
                    }
                    else{
                        self.pulsantiVisibiltà(self.getOwnerComponent().getModel("temp").getProperty("/Visibilità"));
                        self.loadView(path);
                    }    
                }
            },

            loadView:function(path){
                var self =this,
                    oDataModel = self.getOwnerComponent().getModel();
                self.getOwnerComponent().getModel().metadataLoaded().then(function() {
                    oDataModel.read("/" + path, {
                        success: function(data, oResponse){
                            self.getView().getModel(MODEL_ENTITY).setProperty("/Header",data);                            
                            self.onModificaNISet(data, function(callback){
                                self.getView().getModel(MODEL_ENTITY).setProperty("/PositionNI",[]);
                                if(callback.success){
                                    if(callback.data.length>0){
                                        self.getView().getModel(MODEL_ENTITY).setProperty("/PositionNI",callback.data);
                                        var item = callback.data[0];
                                        self.getView().getModel(MODEL_ENTITY).setProperty("/Header/ZcompRes",item.ZcompRes);
                                    }
                                    self.collegaClausole();
                                    self.getView().setBusy(false);
                                }
                                else{
                                    self.collegaClausole();
                                    self.getView().setBusy(false);
                                }
                            });
                        },
                        error: function(error){
                            console.log(error);
                            self.getView().setBusy(false);
                        }
                    })
                });
            },

            downloadFile:function(key){
                var self = this;
                var URLHelper = mobileLibrary.URLHelper;
                URLHelper.redirect("/sap/opu/odata/sap/ZS4_NOTEIMPUTAZIONI_SRV/FileSet(Key='"+ key + "')/$value", true);                                
            },

            onModificaNISet:function(entityHeader, callback){
                var self =this,
                    visibilita = self.getOwnerComponent().getModel("temp").getData().Visibilità[0],
                    filters = [];
                filters.push(new Filter({path: "Bukrs",operator: FilterOperator.EQ,value1: entityHeader.Bukrs}));
                filters.push(new Filter({path: "Gjahr",operator: FilterOperator.EQ,value1: entityHeader.Gjahr}));
                filters.push(new Filter({path: "Zamministr",operator: FilterOperator.EQ,value1: entityHeader.Zamministr}));
                filters.push(new Filter({path: "ZchiaveNi",operator: FilterOperator.EQ,value1: entityHeader.ZchiaveNi}));
                filters.push(new Filter({path: "ZRagioCompe",operator: FilterOperator.EQ,value1: entityHeader.ZRagioCompe}));

                self.getOwnerComponent().getModel().read("/PositionNISet", {
                    filters: filters,
                    urlParameters: { "AutorityRole": visibilita.AGR_NAME, "AutorityFikrs": visibilita.FIKRS, "AutorityPrctr": visibilita.PRCTR },
                    success: function (data) {
                        callback({success:true,data:data.results});  
                    },
                    error: function (error) {
                        console.log(error);
                        callback({success:false,data:[]});                        
                    }
                });
            },

            completeHeader:function(impegnoValues){
                var self =this;
                var header2 = {
                    ImpegnoValues_Lifnr: impegnoValues.Lifnr,
                    ImpegnoValues_Nome: impegnoValues.Nome,
                    ImpegnoValues_Cdc: impegnoValues.Cdc,
                    ImpegnoValues_Coge: impegnoValues.Coge,
                    ImpegnoValues_CausalePagamento: impegnoValues.CausalePagamento,
                    ImpegnoValues_Zwels: impegnoValues.Zwels,
                    ImpegnoValues_ZwelsDesc: impegnoValues.ZwelsDesc,
                    ImpegnoValues_CodiceGestionale: impegnoValues.CodiceGestionale,
                    ImpegnoValues_DataProtocollo: impegnoValues.DataProtocollo, 
                    ImpegnoValues_NProtocollo: impegnoValues.NProtocollo,
                    ImpegnoValues_Descrizione: impegnoValues.Descrizione,
                    ImpegnoValues_ZonaIntervento: impegnoValues.ZonaIntervento,
                    ImpegnoValues_LocalitaPagamento: impegnoValues.LocalitaPagamento,
                    ImpegnoValues_CogeDesc: impegnoValues.CogeDesc,
                    ImpegnoValues_CdcDesc: impegnoValues.CdcDesc,
                    ImpegnoValues_DataEsigibilita: impegnoValues.DataEsigibilita,

                    ImpegnoValues_DataProtocollo_Header: impegnoValues.DataProtocollo ? self.formatter.convert(impegnoValues.DataProtocollo) : null,
                    ImpegnoValues_DataEsigibilita_Header: impegnoValues.DataEsigibilita ? self.formatter.convert(impegnoValues.DataEsigibilita) : null
                }
                self.getView().getModel(MODEL_ENTITY).setProperty("/ImpegnoValues", header2);
            },

            collegaClausole: function () {
                var self =this,
                    impegnoValues= self.getView().getModel("temp").getProperty('/SalvaImpegnoValues'),
                    header = self.getView().getModel(MODEL_ENTITY).getProperty("/Header"), 
                    positions = self.getView().getModel(MODEL_ENTITY).getProperty("/PositionNI"),
                    impegniSelezionati = self.getView().getModel("temp").getProperty("/ImpegniSelezionati");  
                self.getView().setBusy(true);
                self.completeHeader(impegnoValues);
                var deepEntity = {
                    PositionNISet: [],
                    ZfmimpegniIpeSet: [],
                    Funzionalita: 'COLLEGA_CLAUSOLE'
                }

                for (var i=0; i<positions.length;i++) {
                    //positions[i].Iban = impegnoValues.Iban;
                    positions[i].Lifnr = impegnoValues.Lifnr;
                    positions[i].Zwels = impegnoValues.Zwels;
                    positions[i].Kostl = impegnoValues.Cdc;
                    positions[i].Saknr = impegnoValues.Coge;
                    positions[i].Zcodgest = impegnoValues.CodiceGestionale;
                    positions[i].Zcauspag = impegnoValues.CausalePagamento;
                    positions[i].Zdataesig = impegnoValues.DataEsigibilita;                    
                    positions[i].Zlocpag = impegnoValues.LocalitaPagamento;
                    positions[i].Zzonaint = impegnoValues.ZonaIntervento;
                    deepEntity.PositionNISet.push(positions[i]);
                }

                for (var i=0; i<impegniSelezionati.length; i++) {
                    impegniSelezionati[i].Attribuito = parseFloat(impegniSelezionati[i].Attribuito).toFixed(2);
                    deepEntity.ZfmimpegniIpeSet.push(impegniSelezionati[i]);
                }

                var oDataModel = self.getOwnerComponent().getModel();
                oDataModel.create("/DeepPositionNISet", deepEntity, {
                    success: function (data) {
                        //TODO: ci sarà da mettere nella versione successiva un controllo bloccante in caso di errore.
                        self.getView().getModel("temp").setProperty('/PositionNISet', data.PositionNISet.results);
                        self.getView().getModel(MODEL_ENTITY).setProperty("/PositionNI",data.PositionNISet.results);
                        self.getView().getModel(MODEL_ENTITY).setProperty("/HeaderSalva",data.PositionNISet.results);
                        self.getView().setBusy(false);
                    },
                    error: function (err) {
                        self.getView().setBusy(false);
                        console.log(err);
                    },
                    async: true,  // execute async request to not stuck the main thread
                    urlParameters: {}  // send URL parameters if required 
                });
            },  

            onSelect: function (oEvent) {
                var key = oEvent.getParameters().key;
                if (key === "dettagliNI") {
                    //this.callPositionNI()
                    this.getView().byId("salvaImpegnoITB").destroyContent()
                }

                else if (key === "Workflow") {
                    this.getView().byId("salvaImpegnoITB").destroyContent()
                }
                else if (key === "Fascicolo") {
                }
            },

            onBackButton: function () {
                var self =this;
                self.getView().getModel(MODEL_ENTITY).setProperty("/Header", []);
                self.getView().getModel(MODEL_ENTITY).setProperty("/HeaderSalva", []);
                self.getView().getModel(MODEL_ENTITY).setProperty("/PositionNI", []);
                window.history.go(-1);
            },

            onCompleteNI: function () {
                var self =this,
                    oDataModel = self.getOwnerComponent().getModel(),
                    header =self.getView().getModel(MODEL_ENTITY).getProperty("/Header"),
                    impegnoValues = self.getView().getModel(MODEL_ENTITY).getProperty("/ImpegnoValues"),
                    headerSalva = self.getView().getModel(MODEL_ENTITY).getProperty("/HeaderSalva");
                                    
                var deepEntity = {
                    HeaderNISet: null,
                    PositionNISet: [],
                    Funzionalita: 'COMPLETAMENTO',
                    ZchiaveNi: header.ZchiaveNi
                };

                delete header.ZcompRes;
                deepEntity.HeaderNISet = header;
                deepEntity.HeaderNISet.ZcodiStatoni = "00";
                deepEntity.HeaderNISet.ZdataProtAmm = impegnoValues.ImpegnoValues_DataProtocollo && 
                        impegnoValues.ImpegnoValues_DataProtocollo !== null &&
                        impegnoValues.ImpegnoValues_DataProtocollo !== "" ? 
                            DateFormatter.formateDateForDeep(impegnoValues.ImpegnoValues_DataProtocollo) : null;
                deepEntity.HeaderNISet.NProtocolloAmm = impegnoValues.ImpegnoValues_NProtocollo;
                for(var i=0; i<headerSalva.length;i++){
                    var item = Object.assign({}, headerSalva[i]);
                    item.Zdataesig =  impegnoValues.ImpegnoValues_DataEsigibilita ? 
                        DateFormatter.formateDateForDeep(impegnoValues.ImpegnoValues_DataEsigibilita) : null;
                    deepEntity.PositionNISet.push(item);
                }

                MessageBox.warning("Sei sicuro di voler completare la NI?", {
                    title: "Completamento NI",
                    actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
                    emphasizedAction: MessageBox.Action.YES,
                    onClose: function (oAction) {
                        if (oAction === sap.m.MessageBox.Action.YES) {
                            self.getView().setBusy(true);
                            oDataModel.create("/DeepZNIEntitySet", deepEntity, {
                                success: function (result) {
                                  self.getView().setBusy(false);
                                    if (result.Msgty == 'E') {
                                        console.log(result.Message);//TODO:da canc
                                        MessageBox.error(result.Message, {
                                            title: "Esito Operazione",
                                            actions: [sap.m.MessageBox.Action.OK],
                                            emphasizedAction: MessageBox.Action.OK,
                                        })
                                    }
                                    else{
                                        let unique = [];
                                        for (var asc = 0; asc < result.PositionNISet.results.length; asc++) {
                                            if (asc == 0 || (unique.includes(result.PositionNISet.results[asc].ZchiaveSubni)) === false) {
                                                unique.push(result.PositionNISet.results[asc].ZchiaveSubni);
                                            }
                                        }
                                        MessageBox.success("Le seguenti Note di Imputazione sono state completate correttamente: \n "+header.ZchiaveNi+" \n"+unique+"", {
                                            title: "Esito Operazione",
                                            actions: [sap.m.MessageBox.Action.OK],
                                            emphasizedAction: MessageBox.Action.OK,
                                            onClose: function (oAction) {
                                                if (oAction === sap.m.MessageBox.Action.OK) {
                                                   for(var i=0;i<unique.length;i++){
                                                    self.downloadFile(unique[i]);
                                                   }   
                                                    self.getOwnerComponent().getRouter().navTo("View1");
                                                    location.reload();
                                                }
                                            }
                                        })
                                    }
                                },
                                error: function (err) {
                                    console.log(err);
                                    self.getView().setBusy(false);
                                    MessageBox.error("Nota d'imputazione non completata correttamente", {
                                        title: "Esito Operazione",
                                        actions: [sap.m.MessageBox.Action.OK],
                                        emphasizedAction: MessageBox.Action.OK,
                                    });
                                },
                                async: true,  
                                urlParameters: {}
                            });
                        }
                    }
                });
            },

            onCancelNI: function () {
                var self= this,
                    oModel = self.getOwnerComponent().getModel(),
                    header = self.getView().getModel(MODEL_ENTITY).getProperty("/Header");

                var deepEntity = {
                    HeaderNISet: null,
                    Funzionalita: 'ANNULLAMENTOPREIMPOSTATA',
                    ZchiaveNi: header.ZchiaveNi
                };
                deepEntity.HeaderNISet = header;
                deepEntity.HeaderNISet.ZcodiStatoni = "00";

                MessageBox.warning("Sei sicuro di voler annullare la Nota d'Imputazione n° " + header.ZchiaveNi + "?", {
                    title: "Annullamento Preimpostata",
                    actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
                    emphasizedAction: MessageBox.Action.YES,
                    onClose: function (oAction) {
                        if (oAction === sap.m.MessageBox.Action.YES) {
                            oModel.create("/DeepZNIEntitySet", deepEntity, {
                                success: function (data) {
                                    if (data.Msgty == 'E') {
                                        console.log(data.Message);//TODO:da canc
                                        MessageBox.error("Operazione non eseguita", {
                                            title: "Esito Operazione",
                                            actions: [sap.m.MessageBox.Action.OK],
                                            emphasizedAction: MessageBox.Action.OK,
                                        });
                                    }
                                    else{
                                        MessageBox.success("Nota di Imputazione " + header.ZchiaveNi + " annullata correttamente", {
                                            title: "Esito Operazione",
                                            actions: [sap.m.MessageBox.Action.OK],
                                            emphasizedAction: MessageBox.Action.OK,
                                            onClose: function (oAction) {
                                                if (oAction === sap.m.MessageBox.Action.OK) {
                                                    self.getOwnerComponent().getRouter().navTo("View1");
                                                    location.reload();
                                                }
                                            }
                                        });
                                    }
                                },
                                error: function (e) {
                                    console.log(e);
                                    MessageBox.error("Operazione non eseguita", {
                                        title: "Esito Operazione",
                                        actions: [sap.m.MessageBox.Action.OK],
                                        emphasizedAction: MessageBox.Action.OK,
                                    });
                                }
                            });
                        }
                    }
                });
            },

        })

    });
