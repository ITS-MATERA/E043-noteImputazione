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
            //             that.pulsantiVisibiltà(data.results)
            //         },
            //         error: function (error) {
            //             console.log(error)
            //             //that.getView().getModel("temp").setProperty(sProperty,[]);
            //             //that.destroyBusyDialog();
            //             var e = error;
            //         }
            //     });
            // },

            // callVisibilità:function(){
            //     var self =this,
            //         filters = [];
        
            //     filters.push(
            //         new Filter({ path: "SEM_OBJ", operator: FilterOperator.EQ, value1: "ZS4_NOTEIMPUTAZIONI_SRV" }),
            //         new Filter({ path: "AUTH_OBJ", operator: FilterOperator.EQ, value1: "Z_GEST_NI" })
            //     )
            //     self.getOwnerComponent().getModel("ZSS4_CA_CONI_VISIBILITA_SRV").read("/ZES_CONIAUTH_SET", {
            //         filters: filters,        
            //         success: function (data) {
            //                 console.log("success");
            //                 self.getView().getModel("temp").setProperty('/Visibilità', data.results)
            //                 self.pulsantiVisibiltà(data.results)
            //             },
            //         error: function (error) {
            //             console.log(error)
            //             //that.getView().getModel("temp").setProperty(sProperty,[]);
            //             //that.destroyBusyDialog();
            //             var e = error;
            //         }   
            //     });
            // },
            
            pulsantiVisibiltà: function (data) {
                for (var d = 0; d < data.length; d++) {
                    if (data[d].ACTV_1 == "Z01") {
                        this.getView().byId("pressAssImpegno").setEnabled(false);
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

            // _onObjectMatched_old: function (oEvent) {
            //     this.getView().bindElement(
            //         "/HeaderNISet('Bukrs='" + oEvent.getParameters().arguments.campo +
            //         "',Gjahr='" + oEvent.getParameters().arguments.campo1 +
            //         "',Zamministr='" + oEvent.getParameters().arguments.campo2 +
            //         "',ZchiaveNi='" + oEvent.getParameters().arguments.campo3 +
            //         "',ZidNi='" + oEvent.getParameters().arguments.campo4 +
            //         "',ZRagioCompe='" + oEvent.getParameters().arguments.campo5 + "')"
            //     );
            
            //     // this.downloadFile("2023-020.08407829.49-001");    //tEST SCARICAMENTO
            //     this.collegaClausole(oEvent)
            // },

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

            // prePosition: function(){
            //     var that = this;
            //     var oMdlITB = new sap.ui.model.json.JSONModel();
            //     this.getOwnerComponent().getModel().read("/PositionNISet", {
            //         filters: [],
            //         urlParameters: "",
            //         success: function (data) {
            //             oMdlITB.setData(data.results);
            //             that.getView().getModel("temp").setProperty('/PositionNISet', data.results)
            //         },
            //         error: function (error) {
            //             var e = error;
            //         }
            //     });
            // },  

            // viewHeader: function (data) {

            //     var that = this
            //     var url = location.href
            //     var sUrl = url.split("/salvaImpegno/")[1]
            //     var aValori = sUrl.split(",")

            //     var Bukrs = aValori[0]
            //     var Gjahr = aValori[1]
            //     var Zamministr = aValori[2]
            //     var ZchiaveNi = aValori[3]
            //     var ZidNi = aValori[4]
            //     var ZRagioCompe = aValori[5]

            //     //var that = this
            //     var header = this.getView().getModel("temp").getData().HeaderNISet
            //     //var position = this.getView().getModel("temp").getData().PositionNISet
            //     var impegni = this.getView().getModel("temp").getData().ImpegniSelezionati
            //     var valoriNuovi = this.getView().getModel("temp").getData().ValoriNuovi
            //     for (var i = 0; i < header.length; i++) {
            //         if (header[i].Bukrs == Bukrs &&
            //             header[i].Gjahr == Gjahr &&
            //             header[i].Zamministr == Zamministr &&
            //             header[i].ZchiaveNi == ZchiaveNi &&
            //             header[i].ZidNi == ZidNi &&
            //             header[i].ZRagioCompe == ZRagioCompe) {

            //             var progressivoNI = header[i].ZchiaveNi
            //             this.getView().byId("numNI1").setText(progressivoNI)

            //             var dataRegistrazione = header[i].ZdataCreaz
            //             var dataNuova = new Date(dataRegistrazione),
            //                 mnth = ("0" + (dataNuova.getMonth() + 1)).slice(-2),
            //                 day = ("0" + dataNuova.getDate()).slice(-2);
            //             var nData = [dataNuova.getFullYear(), mnth, day].join("-");
            //             var nDate = nData.split("-").reverse().join(".");
            //             this.getView().byId("dataReg1").setText(nDate)

            //             var strAmmResp = header[i].Fistl
            //             this.getView().byId("SARWH2").setText(strAmmResp)

            //             var PF = header[i].Fipex
            //             this.getView().byId("pos_FinWH2").setText(PF)

            //             var oggSpesa = header[i].ZoggSpesa
            //             this.getView().byId("oggSpesa1").setText(oggSpesa)

            //             var mese = header[i].Zmese
            //             switch (mese) {
            //                 case "1":
            //                     var nMese = "Gennaio"
            //                     break;
            //                 case "2":
            //                     var nMese = "Febbraio"
            //                     break;
            //                 case "3":
            //                     var nMese = "Marzo"
            //                     break;
            //                 case "4":
            //                     var nMese = "Aprile"
            //                     break;
            //                 case "5":
            //                     var nMese = "Maggio"
            //                     break;
            //                 case "6":
            //                     var nMese = "Giugno"
            //                     break;
            //                 case "7":
            //                     var nMese = "Luglio"
            //                     break;
            //                 case "8":
            //                     var nMese = "Agosto"
            //                     break;
            //                 case "9":
            //                     var nMese = "Settembre"
            //                     break;
            //                 case "10":
            //                     var nMese = "Ottobre"
            //                     break;
            //                 case "11":
            //                     var nMese = "Novembre"
            //                     break;
            //                 case "12":
            //                     var nMese = "Dicembre"
            //                     break;
            //                 default: break;
        
            //             }
            //             this.getView().byId("mese1").setText(nMese)

            //             for (var x = 0; x < data.length; x++) {
            //                 if (data[x].Bukrs == Bukrs &&
            //                     data[x].Gjahr == Gjahr &&
            //                     data[x].Zamministr == Zamministr &&
            //                     data[x].ZchiaveNi == ZchiaveNi &&
            //                     data[x].ZidNi == ZidNi &&
            //                     data[x].ZRagioCompe == ZRagioCompe) {

            //                     var comp = data[x].ZcompRes
            //                     if (comp == "C") var n_comp = 'Competenza'
            //                     if (comp == "R") var n_comp = 'Residui'       //Position
            //                     this.getView().byId("comp1").setText(n_comp)

            //                     // var Zcodgest = data[x].Zcodgest
            //                     // this.getView().byId("CodiceGes1").setText(Zcodgest)

            //                     // var Zcauspag = data[x].Zcauspag
            //                     // this.getView().byId("CausalePagamento1").setText(Zcauspag)
            //                 }
            //             }

            //             var statoNI = header[i].ZcodiStatoni
            //             this.getView().byId("statoNI1").setText(statoNI)

            //             var importoTot = header[i].ZimpoTotni
            //             this.getView().byId("importoTot1").setText(importoTot)

            //             for (var o = 0; o < impegni.length; o++) {
            //                 var beneficiario = impegni[o].Lifnr
            //                 this.getView().byId("Lifnr1").setText(beneficiario)
            //                 //var Zattribuito = impegni[o].Zattribuito
            //                 this.getView().byId("ImpLiq1").setText(importoTot)
            //             }
            //             this.onCallFornitore(beneficiario)

            //             var centroCosto = valoriNuovi[1]
            //             this.getView().byId("CentroCosto1").setText(centroCosto)
            //             var centroCOGE = valoriNuovi[3]
            //             this.getView().byId("ConCoGe1").setText(centroCOGE)
            //             var codiceGestionale = valoriNuovi[5]
            //             this.getView().byId("CodiceGes1").setText(codiceGestionale)
            //             var causalePagamento = valoriNuovi[6]
            //             this.getView().byId("CausalePagamento1").setText(causalePagamento)
            //             var modalitàPagamento = valoriNuovi[7]
            //             this.getView().byId("Zwels1").setText(modalitàPagamento)
            //             var ZzragSoc =  
            //             this.getView().byId("Nome1").setText(ZzragSoc)

            //         }
            //     }

            // },

            // onCallFornitore(beneficiario){
            //     var filtriFornitori = []
            //     var that = this
            //     var oMdlFor = new sap.ui.model.json.JSONModel();
            //     var chiavi = this.getOwnerComponent().getModel().createKey("/FornitoreSet", {
            //         Lifnr: beneficiario
            //     });

            //     this.getOwnerComponent().getModel().read(chiavi, {
            //         filters: filtriFornitori,
            //         success: function (data) {
            //             oMdlFor.setData(data);
            //             that.getView().getModel("temp").setProperty('/FornitoreSet', data)
            //             that.getView().byId("Nome1").setText(data.ZzragSoc)

            //         },
            //         error: function (error) {
            //             var e = error;
            //         }
            //     });
            // },

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
                    positions[i].Iban = impegnoValues.Iban;
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

            // collegaClausole_old: function (oEvent) {
            //     var that = this

            //     var numeroIntero = ""
            //     var position = this.getView().getModel("temp").getData().PositionNISet
            //     var valoriNuovi = this.getView().getModel("temp").getData().ValoriNuovi
            //     var ImpegniSelezionati = this.getView().getModel("temp").getData().ImpegniSelezionati
            //     var ZdescwelsBniSet = this.getView().getModel("temp").getData().ZdescwelsBniSet


            //     var ZzragSoc =  valoriNuovi[9]
            //     var Zdataesig = valoriNuovi[10]
            //     var Iban = valoriNuovi[8]
            //     var Lifnr = valoriNuovi[0]
            //     if (valoriNuovi[7] == ZdescwelsBniSet[0].Zdescwels) {
            //         var Zwels = ZdescwelsBniSet[0].Zwels
            //     }
            //     var Kostl = valoriNuovi[1]
            //     var Ltext = valoriNuovi[2]
            //     var Saknr = valoriNuovi[3]
            //     var Txt50 = valoriNuovi[4]
            //     var Zcodgest = valoriNuovi[5]
            //     var Zcauspag = valoriNuovi[6]


            //     var deepEntity = {
            //         PositionNISet: [],
            //         ZfmimpegniIpeSet: [],
            //         Funzionalita: 'COLLEGA_CLAUSOLE'
            //     }

            //     for (var i = 0; i < position.length; i++) {

            //         position[i].Iban = Iban
            //         position[i].Lifnr = Lifnr
            //         position[i].Zwels = Zwels
            //         position[i].Kostl = Kostl
            //         //position[i].Ltext = Ltext
            //         position[i].Saknr = Saknr
            //         //position[i].Txt50 = Txt50
            //         position[i].Zcodgest = Zcodgest
            //         position[i].Zcauspag = Zcauspag
            //         position[i].Zdataesig = new Date(Zdataesig);// Zdataesig
            //         //position[i].ZzragSoc = ZzragSoc

            //         deepEntity.PositionNISet.push(position[i]);

            //         numeroIntero = position[i].ZimpoTitolo
            //         var numIntTitolo = ""
            //         if (numeroIntero.split(".").length > 1) {
            //             var numeri = numeroIntero.split(".")
            //             for (var n = 0; n < numeri.length; n++) {
            //                 numIntTitolo = numIntTitolo + numeri[n]
            //                 //var numeroFloat = parseFloat(numeroIntero)
            //                 if (numIntTitolo.split(",").length > 1) {
            //                     var virgole = numIntTitolo.split(",")
            //                     var numeroInteroSM = virgole[0] + "." + virgole[1]
            //                 }
            //             }
            //             var importoPrimaVirgola = numeroIntero.split(".")
            //             var numPunti = ""
            //             var migliaia = importoPrimaVirgola[0].split('').reverse().join('').match(/.{1,3}/g).map(function (x) {
            //                 return x.split('').reverse().join('')
            //             }).reverse()

            //             for (var migl = 0; migl < migliaia.length; migl++) {
            //                 numPunti = (numPunti + migliaia[migl] + ".")
            //             }
            //             var indice = numPunti.split("").length
            //             var numeroIntero = numPunti.substring(0, indice - 1) + "," + importoPrimaVirgola[1]
            //         }

            //         else {
            //             var importoPrimaVirgola = numeroIntero.split(",")
            //             var numeroInteroSM = importoPrimaVirgola[0] + "." + importoPrimaVirgola[1]
            //         }

            //         position[i].ZimpoTitolo = numeroInteroSM

            //     }



            //     for (var l = 0; l < ImpegniSelezionati.length; l++) {
            //         //var item = oItems[i];

            //         //ImpegniSelezionati[l].Attribuito = parseFloat(ImpegniSelezionati[l].Attribuito)
            //         //ImpegniSelezionati[l].Attribuito = 1.00
            //         deepEntity.ZfmimpegniIpeSet.push(ImpegniSelezionati[l]);
            //         //deepEntity.ZfmimpegniIpeSet[l].ZzragSoc = ZzragSoc

            //         numeroIntero = ImpegniSelezionati[l].Attribuito
            //         var numIntAttribuito = ""
            //         if (numeroIntero.split(".").length > 1) {
            //             var numeri = numeroIntero.split(".")
            //             for (var n = 0; n < numeri.length; n++) {
            //                 numIntAttribuito = numIntAttribuito + numeri[n]
            //                 //var numeroFloat = parseFloat(numeroIntero)
            //                 if (numIntAttribuito.split(",").length > 1) {
            //                     var virgole = numIntAttribuito.split(",")
            //                     var numeroInteroSM = virgole[0] + "." + virgole[1]
            //                 }
            //             }
            //             var importoPrimaVirgola = numeroIntero.split(".")
            //             var numPunti = ""
            //             var migliaia = importoPrimaVirgola[0].split('').reverse().join('').match(/.{1,3}/g).map(function (x) {
            //                 return x.split('').reverse().join('')
            //             }).reverse()

            //             for (var migl = 0; migl < migliaia.length; migl++) {
            //                 numPunti = (numPunti + migliaia[migl] + ".")
            //             }
            //             var indice = numPunti.split("").length
            //             var numeroIntero = numPunti.substring(0, indice - 1) + "," + importoPrimaVirgola[1]
            //         }

            //         else {
            //             var importoPrimaVirgola = numeroIntero.split(",")
            //             var numeroInteroSM = importoPrimaVirgola[0] + "." + importoPrimaVirgola[1]
            //         }


            //         ImpegniSelezionati[l].Attribuito = numeroInteroSM
            //     }
            //     var oDataModel = that.getOwnerComponent().getModel();
            //     oDataModel.create("/DeepPositionNISet", deepEntity, {
            //         // urlParameters: {
            //         //     'funzionalita': "PREIMPOSTAZIONE"
            //         // },
            //         success: function (result) {
            //             // if (result.Msgty == 'E') {
            //             //    console.log(result.Message)
            //             that.getView().getModel("temp").setProperty('/PositionNISet', result.PositionNISet.results)
            //             that.viewHeader(result.PositionNISet.results)

            //             var oMdlITB = new sap.ui.model.json.JSONModel();
            //             oMdlITB.setData(result.PositionNISet.results);
            //             that.getOwnerComponent().setModel(oMdlITB, "HeaderSalva");

            //             for (var dr = 0; dr < result.PositionNISet.results.length; dr++) {
            //                 if (result.PositionNISet.results[dr].ZimpoTitolo.split(".").length > 1) {
            //                     var numeroIntero = result.PositionNISet.results[dr].ZimpoTitolo
            //                     var importoPrimaVirgola = numeroIntero.split(".")
            //                     var numPunti = ""
            //                     var migliaia = importoPrimaVirgola[0].split('').reverse().join('').match(/.{1,3}/g).map(function (x) {
            //                         return x.split('').reverse().join('')
            //                     }).reverse()

            //                     for (var migl = 0; migl < migliaia.length; migl++) {
            //                         numPunti = (numPunti + migliaia[migl] + ".")
            //                     }
            //                     var indice = numPunti.split("").length
            //                     var impoTitolo = numPunti.substring(0, indice - 1) + "," + importoPrimaVirgola[1]
            //                     that.getView().byId("HeaderSalva").mAggregations.items[dr].mAggregations.cells[4].setText(impoTitolo)

            //                 }
            //                 else {
            //                     var importoPrimaVirgola = numeroIntero.split(",")
            //                     var impoTitolo = importoPrimaVirgola[0] + "." + importoPrimaVirgola[1]
            //                     that.getView().byId("HeaderSalva").mAggregations.items[dr].mAggregations.cells[4].setText(impoTitolo)
            //                 }
            //             }

            //             //}
            //             //if (result.Msgty == 'S') {
            //             //    console.log(result.Message)
            //             // }
            //         },
            //         error: function (err) {
            //             console.log(err);
            //         },
            //         async: true,  // execute async request to not stuck the main thread
            //         urlParameters: {}  // send URL parameters if required 
            //     });

            // },

            

            // callPositionNI: function () {
            //     var filtroNI = []

            //     var url = location.href
            //     var sUrl = url.split("/salvaImpegno/")[1]
            //     var aValori = sUrl.split(",")

            //     var Bukrs = aValori[0]
            //     var Gjahr = aValori[1]
            //     var Zamministr = aValori[2]
            //     var ZchiaveNi = aValori[3]
            //     var ZidNi = aValori[4]
            //     var ZRagioCompe = aValori[5]

            //     //var oItems = that.getView().byId("").getBinding("items").oList;
            //     var header = this.getView().getModel("temp").getData().HeaderNISet
            //     for (var i = 0; i < header.length; i++) {
            //         if (header[i].Bukrs == Bukrs &&
            //             header[i].Gjahr == Gjahr &&
            //             header[i].Zamministr == Zamministr &&
            //             header[i].ZchiaveNi == ZchiaveNi &&
            //             header[i].ZidNi == ZidNi &&
            //             header[i].ZRagioCompe == ZRagioCompe) {

            //             //filtroNI.push({Bukrs:Bukrs, Gjahr:Gjahr, Zamministr,Zamministr, ZchiaveNi:ZchiaveNi, ZidNi:ZidNi, ZRagioCompe:ZRagioCompe})
            //             filtroNI.push(new Filter({
            //                 path: "Bukrs",
            //                 operator: FilterOperator.EQ,
            //                 value1: header[i].Bukrs
            //             }));
            //             filtroNI.push(new Filter({
            //                 path: "Gjahr",
            //                 operator: FilterOperator.EQ,
            //                 value1: header[i].Gjahr
            //             }));
            //             filtroNI.push(new Filter({
            //                 path: "Zamministr",
            //                 operator: FilterOperator.EQ,
            //                 value1: header[i].Zamministr
            //             }));
            //             filtroNI.push(new Filter({
            //                 path: "ZchiaveNi",
            //                 operator: FilterOperator.EQ,
            //                 value1: header[i].ZchiaveNi
            //             }));
            //             filtroNI.push(new Filter({
            //                 path: "ZidNi",
            //                 operator: FilterOperator.EQ,
            //                 value1: header[i].ZidNi
            //             }));
            //             filtroNI.push(new Filter({
            //                 path: "ZRagioCompe",
            //                 operator: FilterOperator.EQ,
            //                 value1: header[i].ZRagioCompe
            //             }));
            //             // filtroNI.push(new Filter({
            //             //     path: "ZposNi",
            //             //     operator: FilterOperator.EQ,
            //             //     value1: ZposNi
            //             // }));


            //             var that = this;
            //             var oMdlITB = new sap.ui.model.json.JSONModel();
            //             this.getOwnerComponent().getModel().read("/PositionNISet", {
            //                 filters: filtroNI,
            //                 //filters: [],
            //                 urlParameters: "",

            //                 success: function (data) {
            //                     oMdlITB.setData(data.results);
            //                     //that.getView().getModel("temp").setProperty('/PositionNISet', data.results)
            //                     that.viewHeader(data.results)
            //                 },
            //                 error: function (error) {
            //                     var e = error;
            //                 }
            //             });
            //             this.getOwnerComponent().setModel(oMdlITB, "HeaderSalva");

            //         }
            //     }
            // },

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

            // onCompleteNI_old: function () {
            //     var that = this;
            //     var oDataModel = that.getOwnerComponent().getModel();
            //     var oItems = that.getView().byId("HeaderSalva").getBinding("items").oList;

            //     var url = location.href
            //     var sUrl = url.split("/salvaImpegno/")[1]
            //     var aValori = sUrl.split(",")

            //     var Bukrs = aValori[0]
            //     var Gjahr = aValori[1]
            //     var Zamministr = aValori[2]
            //     var ZchiaveNi = aValori[3]
            //     var ZidNi = aValori[4]
            //     var ZRagioCompe = aValori[5]

            //     //var oItems = that.getView().byId("").getBinding("items").oList;
            //     var header = this.getView().getModel("temp").getData().HeaderNISet
            //     for (var i = 0; i < header.length; i++) {
            //         if (header[i].Bukrs == Bukrs &&
            //             header[i].Gjahr == Gjahr &&
            //             header[i].Zamministr == Zamministr &&
            //             header[i].ZchiaveNi == ZchiaveNi &&
            //             header[i].ZidNi == ZidNi &&
            //             header[i].ZRagioCompe == ZRagioCompe) {

            //             var indiceHeader = i
            //             var deepEntity = {
            //                 HeaderNISet: null,
            //                 PositionNISet: [],
            //                 Funzionalita: 'COMPLETAMENTO',
            //                 ZchiaveNi: header[i].ZchiaveNi
            //             }
                        
            //             for (var x = 0; x < oItems.length; x++) {
            //                 var item = oItems[x];
            //                 //item.Zwels = "12"
            //                 //item.Zcodgest = "001"
            //                 deepEntity.PositionNISet.push(item);
                            
            //                 var numeroIntero = item.ZimpoTitolo
            //                 var numIntTot = ""
            //                 if (numeroIntero.split(".").length > 1) {
            //                     var numeri = numeroIntero.split(".")
            //                     for (var n = 0; n < numeri.length; n++) {
            //                         numIntTot = numIntTot + numeri[n]
            //                         //var numeroFloat = parseFloat(numeroIntero)
            //                         if (numIntTot.split(",").length > 1) {
            //                             var virgole = numIntTot.split(",")
            //                             var numeroInteroSM = virgole[0] + "." + virgole[1]
            //                         }
            //                     }
            //                     var importoPrimaVirgola = numeroIntero.split(".")
            //                     var numPunti = ""
            //                     var migliaia = importoPrimaVirgola[0].split('').reverse().join('').match(/.{1,3}/g).map(function (x) {
            //                         return x.split('').reverse().join('')
            //                     }).reverse()

            //                     for (var migl = 0; migl < migliaia.length; migl++) {
            //                         numPunti = (numPunti + migliaia[migl] + ".")
            //                     }
            //                     var indice = numPunti.split("").length
            //                     var numeroIntero = numPunti.substring(0, indice - 1) + "," + importoPrimaVirgola[1]
            //                     deepEntity.PositionNISet[x].ZimpoTitolo = numeroInteroSM
            //                 }

            //                 else {
            //                     var importoPrimaVirgola = numeroIntero.split(",")
            //                     var numeroInteroSM = importoPrimaVirgola[0] + "." + importoPrimaVirgola[1]
            //                     deepEntity.PositionNISet[x].ZimpoTitolo = numeroInteroSM
            //                 }
            //             }

            //             deepEntity.HeaderNISet = header[indiceHeader];
            //             deepEntity.HeaderNISet.ZcodiStatoni = "00"

            //             var numeroIntero = header[indiceHeader].ZimpoTotni
            //             var numIntTot = ""
            //             if (numeroIntero.split(".").length > 1) {
            //                 var numeri = numeroIntero.split(".")
            //                 for (var n = 0; n < numeri.length; n++) {
            //                     numIntTot = numIntTot + numeri[n]
            //                     //var numeroFloat = parseFloat(numeroIntero)
            //                     if (numIntTot.split(",").length > 1) {
            //                         var virgole = numIntTot.split(",")
            //                         var numeroInteroSM = virgole[0] + "." + virgole[1]
            //                     }
            //                 }
            //                 var importoPrimaVirgola = numeroIntero.split(".")
            //                 var numPunti = ""
            //                 var migliaia = importoPrimaVirgola[0].split('').reverse().join('').match(/.{1,3}/g).map(function (x) {
            //                     return x.split('').reverse().join('')
            //                 }).reverse()

            //                 for (var migl = 0; migl < migliaia.length; migl++) {
            //                     numPunti = (numPunti + migliaia[migl] + ".")
            //                 }
            //                 var indice = numPunti.split("").length
            //                 var numeroIntero = numPunti.substring(0, indice - 1) + "," + importoPrimaVirgola[1]
            //                 header[indiceHeader].ZimpoTotni = numeroInteroSM
            //             }

            //             else {
            //                 var importoPrimaVirgola = numeroIntero.split(",")
            //                 var numeroInteroSM = importoPrimaVirgola[0] + "." + importoPrimaVirgola[1]
            //                 header[indiceHeader].ZimpoTotni = numeroInteroSM
            //             }
            //         }
            //     }
            //     MessageBox.warning("Sei sicuro di voler completare la NI?", {
            //         title: "Completamento NI",
            //         actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
            //         emphasizedAction: MessageBox.Action.YES,
            //         onClose: function (oAction) {
            //             if (oAction === sap.m.MessageBox.Action.YES) {

            //                 oDataModel.create("/DeepZNIEntitySet", deepEntity, {
            //                     // urlParameters: {
            //                     //     'funzionalita': "PREIMPOSTAZIONE"
            //                     // },
            //                     success: function (result) {
            //                         if (result.Msgty == 'E') {
            //                             console.log(result.Message)
            //                             // MessageBox.error("Nota d'imputazione non completata correttamente", {
            //                             MessageBox.error(result.Message, {
            //                                 title: "Esito Operazione",
            //                                 actions: [sap.m.MessageBox.Action.OK],
            //                                 emphasizedAction: MessageBox.Action.OK,
            //                             })
            //                         }
            //                         if (result.Msgty == 'S') {
            //                             //var arraySubChiavi = []
            //                             let unique = [];
            //                             for (var asc = 0; asc < result.PositionNISet.results.length; asc++) {
            //                                 if (asc == 0 || (unique.includes(result.PositionNISet.results[asc].ZchiaveSubni)) == false) {
            //                                     unique.push(result.PositionNISet.results[asc].ZchiaveSubni);
            //                                 }
            //                             }

            //                             MessageBox.success("Le seguenti Note di Imputazione sono state completate correttamente: \n "+header[indiceHeader].ZchiaveNi+" \n"+unique+"", {
            //                                 title: "Esito Operazione",
            //                                 actions: [sap.m.MessageBox.Action.OK],
            //                                 emphasizedAction: MessageBox.Action.OK,
            //                                 onClose: function (oAction) {
            //                                     if (oAction === sap.m.MessageBox.Action.OK) {
            //                                        for(var i=0;i<unique.length;i++){
            //                                         that.downloadFile(unique[i]);
            //                                        }   
            //                                         that.getOwnerComponent().getRouter().navTo("View1");
            //                                         location.reload();
            //                                     }
            //                                 }
            //                             })
            //                         }
            //                     },
            //                     error: function (err) {
            //                         console.log(err);
            //                         MessageBox.error("Nota d'imputazione non completata correttamente", {
            //                             title: "Esito Operazione",
            //                             actions: [sap.m.MessageBox.Action.OK],
            //                             emphasizedAction: MessageBox.Action.OK,
            //                         })
            //                     },
            //                     async: true,  // execute async request to not stuck the main thread
            //                     urlParameters: {}  // send URL parameters if required 
            //                 });
            //             }
            //         }
            //     })

            // },

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

            // onCancelNI_old: function () {

            //     var that = this

            //     var url = location.href
            //     var sUrl = url.split("/salvaImpegno/")[1]
            //     var aValori = sUrl.split(",")

            //     var Bukrs = aValori[0]
            //     var Gjahr = aValori[1]
            //     var Zamministr = aValori[2]
            //     var ZchiaveNi = aValori[3]
            //     var ZidNi = aValori[4]
            //     var ZRagioCompe = aValori[5]

            //     //var oItems = that.getView().byId("").getBinding("items").oList;
            //     var header = this.getView().getModel("temp").getData().HeaderNISet
            //     for (var i = 0; i < header.length; i++) {
            //         if (header[i].Bukrs == Bukrs &&
            //             header[i].Gjahr == Gjahr &&
            //             header[i].Zamministr == Zamministr &&
            //             header[i].ZchiaveNi == ZchiaveNi &&
            //             header[i].ZidNi == ZidNi &&
            //             header[i].ZRagioCompe == ZRagioCompe) {

            //             var indiceHeader = i

            //             var deepEntity = {
            //                 HeaderNISet: null,
            //                 Funzionalita: 'ANNULLAMENTOPREIMPOSTATA',
            //             }

            //             //var statoNI = this.getView().byId("idModificaDettaglio").mBindingInfos.items.binding.oModel.oZcodiStatoni
            //             MessageBox.warning("Sei sicuro di voler annullare la Nota d'Imputazione n° " + header[indiceHeader].ZchiaveNi + "?", {
            //                 title: "Annullamento Preimpostata",
            //                 actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
            //                 emphasizedAction: MessageBox.Action.YES,
            //                 onClose: function (oAction) {
            //                     if (oAction === sap.m.MessageBox.Action.YES) {
            //                         var oModel = that.getOwnerComponent().getModel();

            //                         deepEntity.ZchiaveNi = that.getView().byId("numNI1").mProperties.text

            //                         deepEntity.HeaderNISet = header[indiceHeader];
            //                         deepEntity.HeaderNISet.ZcodiStatoni = "00"

            //                         var numeroIntero = header[indiceHeader].ZimpoTotni
            //                         var numIntTot = ""
            //                         if (numeroIntero.split(".").length > 1) {
            //                             var numeri = numeroIntero.split(".")
            //                             for (var n = 0; n < numeri.length; n++) {
            //                                 numIntTot = numIntTot + numeri[n]
            //                                 //var numeroFloat = parseFloat(numeroIntero)
            //                                 if (numIntTot.split(",").length > 1) {
            //                                     var virgole = numIntTot.split(",")
            //                                     var numeroInteroSM = virgole[0] + "." + virgole[1]
            //                                 }
            //                             }
            //                             var importoPrimaVirgola = numeroIntero.split(".")
            //                             var numPunti = ""
            //                             var migliaia = importoPrimaVirgola[0].split('').reverse().join('').match(/.{1,3}/g).map(function (x) {
            //                                 return x.split('').reverse().join('')
            //                             }).reverse()

            //                             for (var migl = 0; migl < migliaia.length; migl++) {
            //                                 numPunti = (numPunti + migliaia[migl] + ".")
            //                             }
            //                             var indice = numPunti.split("").length
            //                             var numeroIntero = numPunti.substring(0, indice - 1) + "," + importoPrimaVirgola[1]
            //                             header[indiceHeader].ZimpoTotni = numeroInteroSM
            //                         }

            //                         else {
            //                             var importoPrimaVirgola = numeroIntero.split(",")
            //                             var numeroInteroSM = importoPrimaVirgola[0] + "." + importoPrimaVirgola[1]
            //                             header[indiceHeader].ZimpoTotni = numeroInteroSM
            //                         }


            //                         oModel.create("/DeepZNIEntitySet", deepEntity, {
            //                             //urlParameters: {'funzionalita': 'ANNULLAMENTOPREIMPOSTATA'},
            //                             // method: "PUT",
            //                             success: function (data) {
            //                                 if (data.Msgty == 'E') {
            //                                     console.log(data.Message)
            //                                     MessageBox.error("Operazione non eseguita", {
            //                                         title: "Esito Operazione",
            //                                         actions: [sap.m.MessageBox.Action.OK],
            //                                         emphasizedAction: MessageBox.Action.OK,
            //                                     })
            //                                 }
            //                                 if (data.Msgty == 'S') {
            //                                     MessageBox.success("Nota di Imputazione "+header[indiceHeader].ZchiaveNi+" annullata correttamente", {
            //                                         title: "Esito Operazione",
            //                                         actions: [sap.m.MessageBox.Action.OK],
            //                                         emphasizedAction: MessageBox.Action.OK,
            //                                         onClose: function (oAction) {
            //                                             if (oAction === sap.m.MessageBox.Action.OK) {
            //                                                 that.getOwnerComponent().getRouter().navTo("View1");
            //                                                 location.reload();
            //                                             }
            //                                         }
            //                                     })
            //                                 }
            //                             },
            //                             error: function (e) {
            //                                 //console.log("error");
            //                                 MessageBox.error("Operazione non eseguita", {
            //                                     title: "Esito Operazione",
            //                                     actions: [sap.m.MessageBox.Action.OK],
            //                                     emphasizedAction: MessageBox.Action.OK,
            //                                 })
            //                             }
            //                         });
            //                     }
            //                 }
            //             });
            //         }
            //     }
            // }
        })

    });
