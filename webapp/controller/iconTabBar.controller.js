sap.ui.define([
    "sap/ui/model/odata/v2/ODataModel",
    "./BaseController",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    'sap/ui/model/json/JSONModel',
    "sap/m/MessageBox",
    'sap/ui/export/Spreadsheet',
    "sap/ui/core/library",
    "project1/model/DateFormatter"
],

    function (ODataModel, BaseController, Filter, FilterOperator, JSONModel, MessageBox, Spreadsheet, CoreLibrary, DateFormatter) {
        "use strict";
        var EdmType = sap.ui.export.EdmType

        var ValueState = CoreLibrary.ValueState,
            oButton = {
                EditEnable: false,
                AddEnable: false,
                DeleteEnable: false,
                TableVisible: false
            };

        const MODEL_ENTITY = "EntityModel";
        return BaseController.extend("project1.controller.iconTabBar", {
            formatter: DateFormatter,
            onInit() {
                var oProprietà = new JSONModel(),
                    oInitialModelState = Object.assign({}, oButton);
                oProprietà.setData(oInitialModelState);
                this.getView().setModel(oProprietà);
                this.getOwnerComponent().getModel("temp");
                this.callVisibilità()
                //this.prePosition()

                var oModelJson = new JSONModel({
                    Header:null,
                    PositionNI:[]              
                });        

                this.getView().setModel(oModelJson,MODEL_ENTITY); 
                this.getRouter().getRoute("iconTabBar").attachPatternMatched(this._onObjectMatched, this);

            },

            _onObjectMatched: function (oEvent) {
                var self =this,
                    oDataModel = self.getOwnerComponent().getModel();
                
                var path = self.getOwnerComponent().getModel().createKey("HeaderNISet", {
                    Bukrs: oEvent.getParameters().arguments.campo,                    
                    Gjahr: oEvent.getParameters().arguments.campo1,
                    Zamministr: oEvent.getParameters().arguments.campo2,
                    ZchiaveNi: oEvent.getParameters().arguments.campo3,
                    ZidNi: oEvent.getParameters().arguments.campo4,
                    ZRagioCompe: oEvent.getParameters().arguments.campo5
                }); 
                self.getView().setBusy(true);
                self.getOwnerComponent().getModel().metadataLoaded().then(function() {
                    oDataModel.read("/" + path, {
                        success: function(data, oResponse){
                            console.log(data);//TODO:da canc
                            self.getView().getModel(MODEL_ENTITY).setProperty("/Header",data);
                            self.callPositionNiSet(data, function(callback){
                                if(callback.success){
                                    self.getView().getModel(MODEL_ENTITY).setProperty("/PositionNI",callback.data);
                                    self.getView().getModel("temp").setProperty('/PositionNISet', callback.data);
                                    if(callback.data.length>0){
                                        var item = callback.data[0];
                                        self.getView().getModel(MODEL_ENTITY).setProperty("/Header/ZcompRes",item.ZcompRes);
                                    }
                                    self.callWorkflowSet(data, function(callbackWF){
                                        if(callbackWF.success){
                                            self.getView().getModel("temp").setProperty('/WFStateNI', callbackWF.data);
                                            self.getView().setBusy(false);
                                        }
                                        else{
                                            self.getView().setBusy(false);
                                        }
                                    });

                                }
                                else{
                                    self.getView().getModel(MODEL_ENTITY).setProperty("/PositionNI",callback.data);
                                    self.getView().getModel("temp").setProperty('/PositionNISet', callback.data);
                                    self.getView().setBusy(false);
                                }
                            });
                        },
                        error: function(error){
                            console.log(error);
                            self.getView().setBusy(false);
                        }
                    });
                });
            },

            callPositionNiSet:function(headerEntity, callback){
                var self =this,
                    filters = [],
                    oDataModel = self.getOwnerComponent().getModel();
                filters.push(new Filter({path: "Bukrs",operator: FilterOperator.EQ,value1: headerEntity.Bukrs}));
                filters.push(new Filter({path: "Gjahr",operator: FilterOperator.EQ,value1: headerEntity.Gjahr}));
                filters.push(new Filter({path: "Zamministr",operator: FilterOperator.EQ,value1: headerEntity.Zamministr}));
                filters.push(new Filter({path: "ZchiaveNi",operator: FilterOperator.EQ,value1: headerEntity.ZchiaveNi}));
                filters.push(new Filter({path: "ZidNi",operator: FilterOperator.EQ,value1: headerEntity.ZidNi}));
                filters.push(new Filter({path: "ZRagioCompe",operator: FilterOperator.EQ,value1: headerEntity.ZRagioCompe}));

                self.getOwnerComponent().getModel().metadataLoaded().then(function() {
                        oDataModel.read("/PositionNISet" , {
                            filters: filters,
                            success: function (data) {
                                console.log(data.results);//TODO:da canc
                                callback({success:true, data:data.results});
                            },
                            error:function (error) {
                                console.log(error);
                                callback({success:false, data:[]});
                            }
                    })
                });    
            },

            callWorkflowSet:function(headerEntity, callbackWF){
                var self =this,
                    filters = [];

                filters.push(new Filter({path: "ZchiaveNi",operator: FilterOperator.EQ,value1: headerEntity.ZchiaveNi}));
                self.getOwnerComponent().getModel().read("/WFStateNISet", {
                    filters: filters,
                    success: function (data) {
                        console.log(data.results);//TODO:Da canc
                        data.results.map((odata)=> {
                            odata.DataStato = new Date(odata.DataOraString)
                        });
                        callbackWF({success:true,data:data.results});
                    },
                    error: function (error) {
                        console.log(error);
                        callbackWF({success:false,data:[]});
                    }
                });
            },


            // _onObjectMatched_old: function (oEvent) { //TODO:da canc
            //     this.getView().bindElement(
            //         "/HeaderNISet('Bukrs='" + oEvent.getParameters().arguments.campo +
            //         "',Gjahr='" + oEvent.getParameters().arguments.campo1 +
            //         "',Zamministr='" + oEvent.getParameters().arguments.campo2 +
            //         "',ZchiaveNi='" + oEvent.getParameters().arguments.campo3 +
            //         "',ZidNi='" + oEvent.getParameters().arguments.campo4 +
            //         "',ZRagioCompe='" + oEvent.getParameters().arguments.campo5 + "')"
            //     );
            //     this.callPositionNI(oEvent)
            // },

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
            callVisibilità:function(){
                var self =this,
                    filters = [];
        
                filters.push(
                    new Filter({ path: "SEM_OBJ", operator: FilterOperator.EQ, value1: "ZS4_NOTEIMPUTAZIONI_SRV" }),
                    new Filter({ path: "AUTH_OBJ", operator: FilterOperator.EQ, value1: "Z_GEST_NI" })
                )
                console.log(self.getOwnerComponent().getModel("ZSS4_CA_CONI_VISIBILITA_SRV"));
                self.getOwnerComponent().getModel("ZSS4_CA_CONI_VISIBILITA_SRV").read("/ZES_CONIAUTH_SET", {
                    filters: filters,        
                    success: function (data) {
                            console.log("success");
                            self.getView().getModel("temp").setProperty('/Visibilità', data.results)
                            self.pulsantiVisibiltà(data.results)
                        },
                    error: function (error) {
                        console.log(error)
                        //that.getView().getModel("temp").setProperty(sProperty,[]);
                        //that.destroyBusyDialog();
                        var e = error;
                    }   
                });
            },

            pulsantiVisibiltà: function (data) {
                for (var d = 0; d < data.length; d++) {
                    if (data[d].ACTV_1 == "Z01") {
                        this.getView().byId("pressAssImpegno").setEnabled(true);
                    }
                    if (data[d].ACTV_2 == "Z02") {
                        this.getView().byId("rettificaNI").setEnabled(true);
                    }
                    if (data[d].ACTV_4 == "Z07") {
                        this.getView().byId("AnnullaNI").setEnabled(true);
                    }
                }
            },

            // viewHeader: function (data) {

            //     var that = this
            //     var url = location.href
            //     var sUrl = url.split("/iconTabBar/")[1]
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

            //                 }
            //             }

            //             var statoNI = header[i].ZcodiStatoni
            //             this.getView().byId("statoNI1").setText(statoNI)

            //             var importoTot = header[i].ZimpoTotni
            //             this.getView().byId("importoTot1").setText(importoTot)

            //         }
            //     }

            // },

            // callPositionNI: function (oEvent) {
            //     var filtroNI = []
            //     var header = this.getView().getModel("temp").getData().HeaderNISet
            //     //var position = this.getView().getModel("temp").getData().PositionNISet
            //     for (var i = 0; i < header.length; i++) {

            //         if (header[i].Bukrs == oEvent.getParameters().arguments.campo &&
            //             header[i].Gjahr == oEvent.getParameters().arguments.campo1 &&
            //             header[i].Zamministr == oEvent.getParameters().arguments.campo2 &&
            //             header[i].ZchiaveNi == oEvent.getParameters().arguments.campo3 &&
            //             header[i].ZidNi == oEvent.getParameters().arguments.campo4 &&
            //             header[i].ZRagioCompe == oEvent.getParameters().arguments.campo5) {

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
            //                     that.getView().getModel("temp").setProperty('/PositionNISet', data.results)
            //                     for (var dr = 0; dr < data.results.length; dr++) {

            //                         var importoPrimaVirgola = data.results[dr].ZimpoTitolo.split(".")
            //                         //var indice = num.split("").length
            //                         var numPunti = ""
            //                         var migliaia = importoPrimaVirgola[0].split('').reverse().join('').match(/.{1,3}/g).map(function (x) {
            //                             return x.split('').reverse().join('')
            //                         }).reverse()

            //                         for (var v = 0; v < migliaia.length; v++) {
            //                             numPunti = (numPunti + migliaia[v] + ".")
            //                         }

            //                         var indice = numPunti.split("").length
            //                         var totale = numPunti.substring(0, indice - 1) + "," + importoPrimaVirgola[1]
            //                         let array = totale.split(",")
            //                         let valoreTagliato = array[1].substring(0, 2)
            //                         var totale = array[0] + "," + valoreTagliato
            //                         that.getView().byId("HeaderITB").getItems()[dr].mAggregations.cells[4].setText(totale)

            //                     }
            //                     that.viewHeader(data.results)
            //                 },
            //                 error: function (error) {
            //                     var e = error;
            //                 }
            //             });
            //             this.getOwnerComponent().setModel(oMdlITB, "HeaderITB");
            //             this.callWorkflow(oEvent)

            //         }
            //     }

            // },

            // callWorkflow: function (oEvent) {
            //     var filtroNI = []
            //     var header = this.getView().getModel("temp").getData().HeaderNISet
            //     //var position = this.getView().getModel("temp").getData().PositionNISet
            //     for (var i = 0; i < header.length; i++) {

            //         if (header[i].Bukrs == oEvent.getParameters().arguments.campo &&
            //             header[i].Gjahr == oEvent.getParameters().arguments.campo1 &&
            //             header[i].Zamministr == oEvent.getParameters().arguments.campo2 &&
            //             header[i].ZchiaveNi == oEvent.getParameters().arguments.campo3 &&
            //             header[i].ZidNi == oEvent.getParameters().arguments.campo4 &&
            //             header[i].ZRagioCompe == oEvent.getParameters().arguments.campo5) {

            //             //filtroNI.push({Bukrs:Bukrs, Gjahr:Gjahr, Zamministr,Zamministr, ZchiaveNi:ZchiaveNi, ZidNi:ZidNi, ZRagioCompe:ZRagioCompe})
            //             filtroNI.push(new Filter({
            //                 path: "ZchiaveNi",
            //                 operator: FilterOperator.EQ,
            //                 value1: header[i].ZchiaveNi
            //             }));

            //             var that = this;
            //             //var oMdlITB = new sap.ui.model.json.JSONModel();
            //             this.getOwnerComponent().getModel().read("/WFStateNISet", {
            //                 filters: filtroNI,
            //                 //filters: [],
            //                 urlParameters: "",

            //                 success: function (data) {
            //                     that.getView().getModel("temp").setProperty('/WFStateNI', data.results)

            //                 },
            //                 error: function (error) {
            //                     var e = error;
            //                 }
            //             });
            //         }
            //     }

            // },

            onSelect: function (oEvent) {
                var key = oEvent.getParameters().key;
                if (key === "dettagliNI") {
                    //this.callPositionNI()
                    this.getView().byId("idIconTabBar").destroyContent()
                }

                else if (key === "Workflow") {
                    this.getView().byId("idIconTabBar").destroyContent()
                }
                else if (key === "Fascicolo") {

                }


            },

            onBackButton: function () {
                var self =this;
                this.getView().byId("HeaderITB").destroyItems()
                self.getOwnerComponent().getRouter().navTo("View1");
                this.getView().byId("editImporto").setEnabled(false);
                this.getView().byId("editRow").setEnabled(false);
                this.getView().byId("addRow").setEnabled(false);
                this.getView().byId("deleteRow").setEnabled(false);
                this.getView().byId("pressAssImpegno").setEnabled(true);
                self.getView().getModel(MODEL_ENTITY).setProperty("/Header",null);
                self.getView().getModel(MODEL_ENTITY).setProperty("/PositionNI",[]);
            },

            pressAssociaImpegno: function (oEvent) {
                var self= this,
                    header = self.getView().getModel(MODEL_ENTITY).getProperty("/Header");

                self.getOwnerComponent().getRouter().navTo("aImpegno", 
                    { 
                        campo: header.Bukrs, 
                        campo1: header.Gjahr, 
                        campo2: header.Zamministr, 
                        campo3: header.ZchiaveNi, 
                        campo4: header.ZidNi, 
                        campo5: header.ZRagioCompe 
                    });
            },

            // pressAssociaImpegno_old: function () {
            //     var url = location.href
            //     var sUrl = url.split("/iconTabBar/")[1]
            //     var aValori = sUrl.split(",")

            //     var Bukrs = aValori[0]
            //     var Gjahr = aValori[1]
            //     var Zamministr = aValori[2]
            //     var ZchiaveNi = aValori[3]
            //     var ZidNi = aValori[4]
            //     var ZRagioCompe = aValori[5]

            //     var header = this.getView().getModel("temp").getData().HeaderNISet
            //     for (var i = 0; i < header.length; i++) {
            //         if (header[i].Bukrs == Bukrs &&
            //             header[i].Gjahr == Gjahr &&
            //             header[i].Zamministr == Zamministr &&
            //             header[i].ZchiaveNi == ZchiaveNi &&
            //             header[i].ZidNi == ZidNi &&
            //             header[i].ZRagioCompe == ZRagioCompe) {
            //             this.getOwnerComponent().getRouter().navTo("aImpegno", { campo: header[i].Bukrs, campo1: header[i].Gjahr, campo2: header[i].Zamministr, campo3: header[i].ZchiaveNi, campo4: header[i].ZidNi, campo5: header[i].ZRagioCompe });
            //         }
            //     }

            // },

            onEditImporto: function () {
                var self =this,
                    header = self.getView().getModel(MODEL_ENTITY).getProperty("/Header");

                if(!header || header == null)
                    return false;

                self.getOwnerComponent().getRouter().navTo("modificaImporto", 
                    { 
                        campo: header.Bukrs, 
                        campo1: header.Gjahr, 
                        campo2: header.Zamministr, 
                        campo3: header.ZchiaveNi, 
                        campo4: header.ZidNi, 
                        campo5: header.ZRagioCompe 
                    });

                self.getView().byId("editImporto").setEnabled(false);
                self.getView().byId("editRow").setEnabled(false);
                self.getView().byId("addRow").setEnabled(false);
                self.getView().byId("deleteRow").setEnabled(false);
                self.getView().byId("pressAssImpegno").setEnabled(true);
                        
            },

            // onEditImporto_old: function () {
            //     var url = location.href
            //     var sUrl = url.split("/iconTabBar/")[1]
            //     var aValori = sUrl.split(",")

            //     var Bukrs = aValori[0]
            //     var Gjahr = aValori[1]
            //     var Zamministr = aValori[2]
            //     var ZchiaveNi = aValori[3]
            //     var ZidNi = aValori[4]
            //     var ZRagioCompe = aValori[5]

            //     var header = this.getView().getModel("temp").getData().HeaderNISet
            //     for (var i = 0; i < header.length; i++) {
            //         if (header[i].Bukrs == Bukrs &&
            //             header[i].Gjahr == Gjahr &&
            //             header[i].Zamministr == Zamministr &&
            //             header[i].ZchiaveNi == ZchiaveNi &&
            //             header[i].ZidNi == ZidNi &&
            //             header[i].ZRagioCompe == ZRagioCompe) {
            //             this.getOwnerComponent().getRouter().navTo("modificaImporto", { campo: header[i].Bukrs, campo1: header[i].Gjahr, campo2: header[i].Zamministr, campo3: header[i].ZchiaveNi, campo4: header[i].ZidNi, campo5: header[i].ZRagioCompe });
            //         }
            //     }
            //     this.getView().byId("editImporto").setEnabled(false);
            //     this.getView().byId("editRow").setEnabled(false);
            //     this.getView().byId("addRow").setEnabled(false);
            //     this.getView().byId("deleteRow").setEnabled(false);
            //     this.getView().byId("pressAssImpegno").setEnabled(true);
            // },

            onEditRow: function () {
                var self= this,
                    header = self.getView().getModel(MODEL_ENTITY).getProperty("/Header");

                if(!header || header === null)
                    return false;
                
                self.getOwnerComponent().getRouter().navTo("modificaDettaglio", 
                    { 
                        campo: header.Bukrs, 
                        campo1: header.Gjahr, 
                        campo2: header.Zamministr, 
                        campo3: header.ZchiaveNi, 
                        campo4: header.ZidNi, 
                        campo5: header.ZRagioCompe 
                    });
                
                self.getView().byId("editImporto").setEnabled(false);
                self.getView().byId("editRow").setEnabled(false);
                self.getView().byId("addRow").setEnabled(false);
                self.getView().byId("deleteRow").setEnabled(false);
                self.getView().byId("pressAssImpegno").setEnabled(true);
                    
                    //TODO:da canc
                // var url = location.href
                // var sUrl = url.split("/iconTabBar/")[1]
                // var aValori = sUrl.split(",")

                // var Bukrs = aValori[0]
                // var Gjahr = aValori[1]
                // var Zamministr = aValori[2]
                // var ZchiaveNi = aValori[3]
                // var ZidNi = aValori[4]
                // var ZRagioCompe = aValori[5]

                // var header = this.getView().getModel("temp").getData().HeaderNISet
                // for (var i = 0; i < header.length; i++) {
                //     if (header[i].Bukrs == Bukrs &&
                //         header[i].Gjahr == Gjahr &&
                //         header[i].Zamministr == Zamministr &&
                //         header[i].ZchiaveNi == ZchiaveNi &&
                //         header[i].ZidNi == ZidNi &&
                //         header[i].ZRagioCompe == ZRagioCompe) {
                //         this.getOwnerComponent().getRouter().navTo("modificaDettaglio", { campo: header[i].Bukrs, campo1: header[i].Gjahr, campo2: header[i].Zamministr, campo3: header[i].ZchiaveNi, campo4: header[i].ZidNi, campo5: header[i].ZRagioCompe });
                //     }
                // }
                // this.getView().byId("editImporto").setEnabled(false);
                // this.getView().byId("editRow").setEnabled(false);
                // this.getView().byId("addRow").setEnabled(false);
                // this.getView().byId("deleteRow").setEnabled(false);
                // this.getView().byId("pressAssImpegno").setEnabled(true);
            },

            onAddRow: function (oEvent) {
                var self =this,
                    header = self.getView().getModel(MODEL_ENTITY).getProperty("/Header");
                
                if(!header || header === null)
                    return false;

                self.getOwnerComponent().getRouter().navTo("wizardInserisciRiga", 
                    { 
                        campo: header.Bukrs, 
                        campo1: header.Gjahr, 
                        campo2: header.Zamministr, 
                        campo3: header.ZchiaveNi, 
                        campo4: header.ZidNi, 
                        campo5: header.ZRagioCompe 
                    });
                   
                self.getView().byId("editImporto").setEnabled(false);
                self.getView().byId("editRow").setEnabled(false);
                self.getView().byId("addRow").setEnabled(false);
                self.getView().byId("deleteRow").setEnabled(false);
                self.getView().byId("pressAssImpegno").setEnabled(true);
            },

            // onAddRow_old: function () {
            //     var url = location.href
            //     var sUrl = url.split("/iconTabBar/")[1]
            //     var aValori = sUrl.split(",")

            //     var Bukrs = aValori[0]
            //     var Gjahr = aValori[1]
            //     var Zamministr = aValori[2]
            //     var ZchiaveNi = aValori[3]
            //     var ZidNi = aValori[4]
            //     var ZRagioCompe = aValori[5]

            //     var header = this.getView().getModel("temp").getData().HeaderNISet
            //     for (var i = 0; i < header.length; i++) {
            //         if (header[i].Bukrs == Bukrs &&
            //             header[i].Gjahr == Gjahr &&
            //             header[i].Zamministr == Zamministr &&
            //             header[i].ZchiaveNi == ZchiaveNi &&
            //             header[i].ZidNi == ZidNi &&
            //             header[i].ZRagioCompe == ZRagioCompe) {
            //             this.getOwnerComponent().getRouter().navTo("wizardInserisciRiga", { campo: header[i].Bukrs, campo1: header[i].Gjahr, campo2: header[i].Zamministr, campo3: header[i].ZchiaveNi, campo4: header[i].ZidNi, campo5: header[i].ZRagioCompe });
            //         }
            //     }
            //     this.getView().byId("editImporto").setEnabled(false);
            //     this.getView().byId("editRow").setEnabled(false);
            //     this.getView().byId("addRow").setEnabled(false);
            //     this.getView().byId("deleteRow").setEnabled(false);
            //     this.getView().byId("pressAssImpegno").setEnabled(true);
            // },

            pressRettificaNI: function () {
                this.getView().byId("editImporto").setEnabled(true);
                this.getView().byId("editRow").setEnabled(true);
                this.getView().byId("addRow").setEnabled(true);
                this.getView().byId("deleteRow").setEnabled(true);
                // this.getView().byId("pressAssImpegno").setEnabled(false);
            },


            onDeleteRow: function (oEvent) {
                var that = this;
                //var position = this.getView().getModel("temp").getData().PositionNISet
                var selectedPosition = this.getView().byId("HeaderITB").getSelectedItems()

                var deepEntity = {
                    Funzionalita: 'RETTIFICANIPREIMPOSTATA',
                    PositionNISet: []
                }

                for (var i = 0; i < selectedPosition.length; i++) {

                    var item = selectedPosition[i].getBindingContext("HeaderITB").getObject();
                    //var indice = i
                    var oModel = that.getOwnerComponent().getModel();

                    deepEntity.Bukrs = item.Bukrs,
                        deepEntity.Gjahr = item.Gjahr,
                        deepEntity.Zamministr = item.Zamministr,
                        deepEntity.ZchiaveNi = item.ZchiaveNi,
                        deepEntity.ZidNi = item.ZidNi,
                        deepEntity.ZRagioCompe = item.ZRagioCompe,
                        deepEntity.Operation = "D",

                        deepEntity.PositionNISet.push({
                            ZposNi: item.ZposNi,
                            Bukrs: item.Bukrs,
                            Gjahr: item.Gjahr,
                            Zamministr: item.Zamministr,
                            ZchiaveNi: item.ZchiaveNi,
                            ZidNi: item.ZidNi,
                            ZRagioCompe: item.ZRagioCompe,
                        })
                }
                MessageBox.warning("Sei sicuro di voler rettificare la Nota d'Imputazione n° " + item.ZchiaveNi + "?", {
                    title: "Elimina Riga",
                    actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
                    emphasizedAction: MessageBox.Action.YES,
                    onClose: function (oAction) {
                        if (oAction === sap.m.MessageBox.Action.YES) {

                            oModel.create("/DeepPositionNISet", deepEntity, {
                                // method: "PUT",
                                success: function (result) {
                                    if (result.Msgty == 'E') {
                                        console.log(result.Message)
                                        MessageBox.error("Operazione eseguita non correttamente", {
                                            title: "Esito Operazione",
                                            actions: [sap.m.MessageBox.Action.OK],
                                            emphasizedAction: MessageBox.Action.OK,
                                        })
                                    }
                                    if (result.Msgty == 'S') {
                                        MessageBox.success("Nota di Imputazione "+item.ZchiaveNi+" rettificata correttamente", {
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
                                    }
                                },
                                error: function (e) {
                                    //console.log("error");
                                    MessageBox.error("Operazione non eseguita", {
                                        title: "Esito Operazione",
                                        actions: [sap.m.MessageBox.Action.OK],
                                        emphasizedAction: MessageBox.Action.OK,
                                    })
                                }
                            });
                        }

                    }
                });
            },

            onCancelNI: function (oEvent) {
                var self =this,
                    oModel = self.getOwnerComponent().getModel(),
                    header = self.getView().getModel(MODEL_ENTITY).getProperty("/Header");

                var deepEntity = {
                    HeaderNISet: null,
                    Funzionalita: 'ANNULLAMENTOPREIMPOSTATA',
                }

                MessageBox.warning("Sei sicuro di voler annullare la Nota d'Imputazione n° " + header.ZchiaveNi + "?", {
                    title: "Annullamento Preimpostata",
                    actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
                    emphasizedAction: MessageBox.Action.YES,
                    onClose: function (oAction) {
                        if (oAction === sap.m.MessageBox.Action.YES) {
                            delete header.ZcompRes;
                            deepEntity.ZchiaveNi = header.ZidNi;
                            deepEntity.HeaderNISet = header;
                            deepEntity.HeaderNISet.ZcodiStatoni = "00";

                            oModel.create("/DeepZNIEntitySet", deepEntity, {
                                success: function (data) {
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
                                    })
                                },
                                error: function (e) {
                                    console.log("error");
                                    MessageBox.error("Operazione non eseguita", {
                                        title: "Esito Operazione",
                                        actions: [sap.m.MessageBox.Action.OK],
                                        emphasizedAction: MessageBox.Action.OK,
                                    })
                                }
                            });

                        }
                    }
                });
            },  


            //deepHeaderNISet
            // onCancelNI_old: function () {
            //     var that = this
            //     var url = location.href
            //     var sUrl = url.split("/iconTabBar/")[1]
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
            //                                 //console.log("success");
            //                                 MessageBox.success("Nota di Imputazione "+header[indiceHeader].ZchiaveNi+" annullata correttamente", {
            //                                     title: "Esito Operazione",
            //                                     actions: [sap.m.MessageBox.Action.OK],
            //                                     emphasizedAction: MessageBox.Action.OK,
            //                                     onClose: function (oAction) {
            //                                         if (oAction === sap.m.MessageBox.Action.OK) {
            //                                             that.getOwnerComponent().getRouter().navTo("View1");
            //                                             location.reload();
            //                                         }
            //                                     }
            //                                 })
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
            // onDeleteRecord: function (oEvent) {
            //      var oSelectedItemPath = oEvent.getSource().getParent().getBindingContextPath();
            //      var oSelectedItem = this.getOwnerComponent().getModel("modelTabGestNI").getObject(oSelectedItemPath);
            //     //console.log(oSelectedItem);
            //     var sKey = oSelectedItem.ID; // campo che identifica il record
            //     var sType = "DELETE";
            //     var sUrl = "/odata/v4/EmployeeService/Request(ID=" + sKey + ")"; //url dell'odata service
            //     var that = this;
            //     var aData = jQuery.ajax({
            //         type: sType,
            //         contentType: "application/json",
            //          url: sUrl,
            //          dataType: "json",
            //          async: false,
            //         success: function (data, textStatus, jqXHR) {
            //             MessageBox.success("Record deleted correctly");
            //             that.getHRdb();
            //         },
            //         error: function (error) {
            //             MessageBox.error("Record NO deleted correctly");
            //             var e = error;
            //         }
            //     });

            // },

        })

    });
