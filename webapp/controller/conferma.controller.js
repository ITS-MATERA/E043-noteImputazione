sap.ui.define(
    [
        "./BaseController",
        "sap/ui/model/Filter",
        "sap/ui/model/FilterOperator",
        'sap/ui/model/json/JSONModel',
        'sap/ui/export/Spreadsheet',
        "sap/ui/core/library",
        "project1/model/DateFormatter",
        "sap/m/MessageBox",
        "sap/ui/core/Core",
        "sap/ui/layout/HorizontalLayout",
        "sap/ui/layout/VerticalLayout",
        "sap/m/Dialog",
        "sap/m/Button",
        "sap/m/Label",
        "sap/m/library",
        "sap/m/MessageToast",
        "sap/m/Text",
        "sap/m/TextArea"
    ],
    /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
    function (BaseController, Filter, FilterOperator, JSONModel, Spreadsheet, CoreLibrary, DateFormatter, MessageBox, Core, HorizontalLayout, VerticalLayout, Dialog, Button, Label, mobileLibrary, MessageToast, Text, TextArea) {
        "use strict";
        var EdmType = sap.ui.export.EdmType

        var ValueState = CoreLibrary.ValueState,
            oData = {
                EditEnable: false,
                AddEnable: false,
                DeleteEnable: false,
            };

        var ButtonType = mobileLibrary.ButtonType;
        var DialogType = mobileLibrary.DialogType;
        const MODEL_ENTITY = "EntityModel";  
        return BaseController.extend("project1.controller.conferma", {
            formatter: DateFormatter,
            onInit() {

                var oProprietà = new JSONModel(),
                    oInitialModelState = Object.assign({}, oData);
                oProprietà.setData(oInitialModelState);


                var oModelJson = new JSONModel({
                  Header:null,
                  PositionNI:[],
                  // RichiamaNI:[]        
                });   
                this.getView().setModel(oModelJson,MODEL_ENTITY);

                this.getView().setModel(oProprietà);
                this.getOwnerComponent().getModel("temp");
                // this.callVisibilità()
                this.getRouter().getRoute("conferma").attachPatternMatched(this._onObjectMatched, this);

            },

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

            pulsantiVisibiltà: function (data) {
                for (var d = 0; d < data.length; d++) {
                    if (data[d].ACTV_4 == "Z12" || data[d].ACTV_4 == "Z13") {
                        this.getView().byId("revocaConferma").setEnabled(true);
                    }
                    if (data[d].ACTV_4 == "Z14") {
                        this.getView().byId("Valida").setEnabled(true);
                    }
                    if (data[d].ACTV_4 == "Z17") {
                        this.getView().byId("richiama").setEnabled(true);
                    }
                    if (data[d].ACTV_4 == "Z18") {
                        this.getView().byId("RegistraRilievoNI").setEnabled(true);
                    }
                    if (data[d].ACTV_4 == "Z21") {
                      this.getView().byId("idFascicoloIconTabFilter").setEnabled(true);
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

              if(!self.getOwnerComponent().getModel("temp").getData().Visibilità || 
                  self.getOwnerComponent().getModel("temp").getData().Visibilità === null){
                    self.callPreventVisibilitaWithCallback(function(callback){
                        if(callback){ 
                          self.pulsantiVisibiltà(self.getOwnerComponent().getModel("temp").getData().Visibilità);
                          self.callPositionNI(path);           
                        }
                    });    
                  }
                else{ 
                  self.pulsantiVisibiltà(self.getOwnerComponent().getModel("temp").getData().Visibilità);                          
                  self.callPositionNI(path);
                }
            },

            callPositionNI:function(path){
              var self =this,
              oDataModel = self.getOwnerComponent().getModel();
              
              self.getView().setBusy(true);
              self.getOwnerComponent().getModel().metadataLoaded().then(function() {
                oDataModel.read("/" + path, {
                    success:function(data, oResponse){
                        console.log(data);//TODO:da canc
                        self.getView().getModel(MODEL_ENTITY).setProperty("/Header",data);
                        // self.userInfo(); //TODO:da canc  
                        // self.callRilievi();   //TODO:da canc
                        self.callPositionNiSet(data, function(callback){
                          if(callback.success){
                            self.getView().getModel(MODEL_ENTITY).setProperty("/PositionNI",callback.data);
                            self.getView().getModel("temp").setProperty('/PositionNISet', callback.data);
                            if(callback.data.length>0){
                              var item = callback.data[0];
                              console.log(item);//TODO:da canc
                              self.loadBeneficiario(item.Lifnr);
                              self.getView().getModel(MODEL_ENTITY).setProperty("/Header/ZcompRes",item.ZcompRes);                              
                              self.getView().getModel(MODEL_ENTITY).setProperty("/Header/Lifnr",item.Lifnr);
                              self.getView().getModel(MODEL_ENTITY).setProperty("/Header/Cdc",item.Kostl);
                              self.getView().getModel(MODEL_ENTITY).setProperty("/Header/Coge",item.Saknr);
                              self.getView().getModel(MODEL_ENTITY).setProperty("/Header/CodiceGestionale",item.Zcodgest);
                              self.getView().getModel(MODEL_ENTITY).setProperty("/Header/CausalePagamento",item.Zcauspag);
                              self.getView().getModel(MODEL_ENTITY).setProperty("/Header/ModalitaPagamento",item.Zdescwels);
                              self.getView().getModel(MODEL_ENTITY).setProperty("/Header/CodiceUfficio",data.ZuffcontFirm);
                              self.getView().getModel(MODEL_ENTITY).setProperty("/Header/Dirigente",data.ZdirncRich);
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
                          setTimeout(callback({success:true, data:data.results}),1500);
                      },
                      error:function (error) {
                          console.log(error);
                          setTimeout( callback({success:false, data:[]}),1500);
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

            loadBeneficiario:function(lifnr){
              var self = this;                 

              var path = self.getOwnerComponent().getModel().createKey("/FornitoreSet", {
                  Lifnr: lifnr
              });

              self.getOwnerComponent().getModel().read(path, {
                success: function (data) {
                  if(data){
                      self.getView().getModel(MODEL_ENTITY).setProperty("/Header/LifnrDesc",data.ZzragSoc); 
                  } 
                  else
                    self.getView().getModel(MODEL_ENTITY).setProperty("/Header/LifnrDesc",null);                       
                },
                error: function (e) {
                  self.getView().getModel(MODEL_ENTITY).setProperty("/Header/LifnrDesc",null);
                  console.log(e);
                }
              });
            },




            // _onObjectMatched: function (oEvent) {
            //     this.getView().bindElement(
            //         "/HeaderNISet('Bukrs='" + oEvent.getParameters().arguments.campo +
            //         "',Gjahr='" + oEvent.getParameters().arguments.campo1 +
            //         "',Zamministr='" + oEvent.getParameters().arguments.campo2 +
            //         "',ZchiaveNi='" + oEvent.getParameters().arguments.campo3 +
            //         "',ZidNi='" + oEvent.getParameters().arguments.campo4 +
            //         "',ZRagioCompe='" + oEvent.getParameters().arguments.campo5 + "')"
            //     );
            //     this.callPositionNI()
            //     //this.viewHeader(oEvent)
            // },

            // callPositionNI_old: function () {

            //     var url = location.href
            //     var sUrl = url.split("/conferma/")[1]
            //     var aValori = sUrl.split(",")

            //     var Bukrs = aValori[0]
            //     var Gjahr = aValori[1]
            //     var Zamministr = aValori[2]
            //     var ZchiaveNi = aValori[3]
            //     var ZidNi = aValori[4]
            //     var ZRagioCompe = aValori[5]

            //     var filtroNI = []
            //     var header = this.getOwnerComponent().getModel("temp").getData().HeaderNISet
            //     //var position = this.getView().getModel("temp").getData().PositionNISet
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
            //                         that.getView().byId("conferma").getItems()[dr].mAggregations.cells[5].setText(totale)

            //                     }
            //                     that.viewHeader(data.results)
            //                 },
            //                 error: function (error) {
            //                     var e = error;
            //                 }
            //             });
            //             this.getOwnerComponent().setModel(oMdlITB, "conferma");
            //             this.callWorkflow()

            //         }
            //     }

            // },

            // viewHeader: function (position) {
            //     // console.log(this.getView().getModel("temp").getData(
            //     // "/HeaderNISet('"+ oEvent.getParameters().arguments.campo +
            //     // "','"+ oEvent.getParameters().arguments.campo1 +
            //     // "','"+ oEvent.getParameters().arguments.campo2 +
            //     // "','"+ oEvent.getParameters().arguments.campo3 +
            //     // "','"+ oEvent.getParameters().arguments.campo4 +
            //     // "','"+ oEvent.getParameters().arguments.campo5 + "')"))
            //     var url = location.href
            //     var sUrl = url.split("/conferma/")[1]
            //     var aValori = sUrl.split(",")

            //     var Bukrs = aValori[0]
            //     var Gjahr = aValori[1]
            //     var Zamministr = aValori[2]
            //     var ZchiaveNi = aValori[3]
            //     var ZidNi = aValori[4]
            //     var ZRagioCompe = aValori[5]

            //     var header = this.getView().getModel("temp").getData().HeaderNISet
            //     var position = position
            //     var firmaSet = this.getView().getModel("temp").getData().firmaSet
            //     //var valoriNuovi = this.getView().getModel("temp").getData().ValoriNuovi
            //     //var ImpegniSelezionati = this.getView().getModel("temp").getData().ImpegniSelezionati

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

            //             for (var x = 0; x < position.length; x++) {
            //                 if (position[x].Bukrs == Bukrs &&
            //                     position[x].Gjahr == Gjahr &&
            //                     position[x].Zamministr == Zamministr &&
            //                     position[x].ZchiaveNi == ZchiaveNi &&
            //                     position[x].ZidNi == ZidNi &&
            //                     position[x].ZRagioCompe == ZRagioCompe) {

            //                     var comp = position[x].ZcompRes
            //                     if (comp == "C") var n_comp = 'Competenza'
            //                     if (comp == "R") var n_comp = 'Residui'       //Position
            //                     this.getView().byId("comp1").setText(n_comp)

            //                     var beneficiario = position[x].Lifnr
            //                     this.onCallFornitore(beneficiario)
            //                     this.getView().byId("Lifnr1").setText(beneficiario)

            //                     var centroCosto = position[x].Kostl
            //                     this.getView().byId("CentroCosto1").setText(centroCosto)

            //                     var centroCOGE = position[x].Saknr
            //                     this.getView().byId("ConCoGe1").setText(centroCOGE)

            //                     var codiceGestionale = position[x].Zcodgest
            //                     this.getView().byId("CodiceGes1").setText(codiceGestionale)

            //                     var causalePagamento = position[x].Zcauspag
            //                     this.getView().byId("CausalePagamento1").setText(causalePagamento)

            //                     var modalitàPagamento = position[x].Zwels
            //                     this.getView().byId("Zwels1").setText(modalitàPagamento)
                             

            //                     //var Zattribuito = impegni[o].Zattribuito

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
            //             this.getView().byId("ImpLiq1").setText(importoTot)

            //             var codUff = header[i].ZuffcontFirm
            //             var dirigente = header[i].ZdirncRich
            //             this.getView().byId("CodiceUff1").setText(codUff)
            //             this.getView().byId("dirigente1").setText(dirigente)

            //         }
            //     }
            // },

            // onCallFornitore(beneficiario){
            //     var filtriFornitori = []
            //     var that = this
            //     var oMdlFor = new sap.ui.model.json.JSONModel();
            //     //var Lifnr = this.getView().byId("inputBeneficiario").getValue()

            //     // filtriFornitori.push(new Filter({
            //     //     path: "Lifnr",
            //     //     operator: FilterOperator.EQ,
            //     //     value1: Lifnr
            //     // }));

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

            // callWorkflow: function () {

            //     var url = location.href
            //     var sUrl = url.split("/conferma/")[1]
            //     var aValori = sUrl.split(",")

            //     var Bukrs = aValori[0]
            //     var Gjahr = aValori[1]
            //     var Zamministr = aValori[2]
            //     var ZchiaveNi = aValori[3]
            //     var ZidNi = aValori[4]
            //     var ZRagioCompe = aValori[5]
                
            //     var filtroNI = []
            //     var header = this.getView().getModel("temp").getData().HeaderNISet
            //     //var position = this.getView().getModel("temp").getData().PositionNISet
            //     for (var i = 0; i < header.length; i++) {

            //         if (header[i].Bukrs == Bukrs &&
            //             header[i].Gjahr == Gjahr &&
            //             header[i].Zamministr == Zamministr &&
            //             header[i].ZchiaveNi == ZchiaveNi &&
            //             header[i].ZidNi == ZidNi &&
            //             header[i].ZRagioCompe == ZRagioCompe) {

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
                if (key === "ListaDettagli") {
                    this.getView().byId("confermaITB").destroyContent()
                }
                else if (key === "Workflow") {
                    this.getView().byId("confermaITB").destroyContent()
                }
                else if (key === "Fascicolo") {
                }
            },

            onBackButton: function () {
              var self =this;
              self.getView().getModel(MODEL_ENTITY).setProperty("/Header",null);
              self.getView().getModel(MODEL_ENTITY).setProperty("/PositionNI",[]);
              window.history.go(-1);
            },

            // onRegistraRilievo_old: function () {
            //     var url = location.href
            //     var sUrl = url.split("/conferma/")[1]
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
            //             this.getOwnerComponent().getRouter().navTo("registrazioneRilievo", { campo: header[i].Bukrs, campo1: header[i].Gjahr, campo2: header[i].Zamministr, campo3: header[i].ZchiaveNi, campo4: header[i].ZidNi, campo5: header[i].ZRagioCompe });
            //         }
            //     }
            // },

            onRegistraRilievo: function () {
              var self =this,
                header = self.getView().getModel(MODEL_ENTITY).getProperty("/Header");

              if(!header || header === null)
                return false;  
              
              self.getOwnerComponent().getRouter().navTo("registrazioneRilievo", 
                { 
                  campo: header.Bukrs, 
                  campo1: header.Gjahr, 
                  campo2: header.Zamministr, 
                  campo3: header.ZchiaveNi, 
                  campo4: header.ZidNi, 
                  campo5: header.ZRagioCompe 
                });
            },            

            onValidaNI: function () {
              var self =this,
                oModel = self.getOwnerComponent().getModel(),
                header = self.getView().getModel(MODEL_ENTITY).getProperty("/Header");

              if(!header || header === null)
                return false;
              
              MessageBox.warning("Sei sicuro di voler validare la Nota di Imputazione n." + header.ZchiaveNi + "?", {
                title: "Valida NI",
                actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
                emphasizedAction: MessageBox.Action.YES,
                onClose: function (oAction) {
                    if (oAction === sap.m.MessageBox.Action.YES) {
                      var deepEntity = {
                        ZchiaveNi: header.ZchiaveNi,
                        HeaderNISet: header,
                        Funzionalita: 'VALIDAZIONE',
                      };
                      
                      deepEntity.HeaderNISet.ZcodiStatoni = "05";
                      delete deepEntity.HeaderNISet.ZcompRes;
                      delete deepEntity.HeaderNISet.Lifnr;
                      delete deepEntity.HeaderNISet.Cdc;              
                      delete deepEntity.HeaderNISet.Coge;
                      delete deepEntity.HeaderNISet.CodiceGestionale;
                      delete deepEntity.HeaderNISet.CausalePagamento;
                      delete deepEntity.HeaderNISet.ModalitaPagamento;
                      delete deepEntity.HeaderNISet.LifnrDesc;
                      delete deepEntity.HeaderNISet.CodiceUfficio;
                      delete deepEntity.HeaderNISet.Dirigente;
                      oModel.create("/DeepZNIEntitySet", deepEntity, {
                        success: function (data) {
                            if(data.Msgty !== "E"){
                              MessageBox.success(data.Message, {
                                  title: "Esito Operazione",
                                  actions: [sap.m.MessageBox.Action.OK],
                                  emphasizedAction: MessageBox.Action.OK,
                                  onClose: function (oAction) {
                                      if (oAction === sap.m.MessageBox.Action.OK) {
                                        self.getView().getModel(MODEL_ENTITY).setProperty("/Header",null);
                                        self.getView().getModel(MODEL_ENTITY).setProperty("/PositionNI",[]);
                                        self.getOwnerComponent().getRouter().navTo("View1");
                                        location.reload();
                                      }
                                  }
                              });
                            }
                            else{
                              MessageBox.error(data.Message, {
                                title: "Esito Operazione",
                                actions: [sap.m.MessageBox.Action.OK],
                                emphasizedAction: MessageBox.Action.OK,
                              });
                              return false;
                            }
                        },
                        error: function (e) {
                            console.log(e);
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

            // onValidaNI: function () {
            //     var that = this

            //     var url = location.href
            //     var sUrl = url.split("/conferma/")[1]
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
            //                 Funzionalita: 'VALIDAZIONE',
            //             }

            //             //var statoNI = this.getView().byId("idModificaDettaglio").mBindingInfos.items.binding.oModel.oZcodiStatoni
            //             MessageBox.warning("Sei sicuro di voler validare la Nota d'Imputazione n° " + header[i].ZchiaveNi + "?", {
            //                 title: "Validazione",
            //                 actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
            //                 emphasizedAction: MessageBox.Action.YES,
            //                 onClose: function (oAction) {
            //                     if (oAction === sap.m.MessageBox.Action.YES) {
            //                         var oModel = that.getOwnerComponent().getModel();

            //                         deepEntity.ZchiaveNi = that.getView().byId("numNI1").mProperties.text

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

            //                         deepEntity.HeaderNISet = header[indiceHeader];
            //                         deepEntity.HeaderNISet.ZcodiStatoni = "05"

            //                         oModel.create("/DeepZNIEntitySet", deepEntity, {
            //                             //urlParameters: {'funzionalita': 'ANNULLAMENTOPREIMPOSTATA'},
            //                             // method: "PUT",
            //                             success: function (data) {
            //                                 //console.log("success");
            //                                 MessageBox.success("Nota di Imputazione "+header[indiceHeader].ZchiaveNi+" validata correttamente", {
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
            // },

            // onRevocaConfermaNI: function () {
            //     var that = this

            //     var url = location.href
            //     var sUrl = url.split("/conferma/")[1]
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
            //                 Funzionalita: 'REVOCACONFERMA',
            //             }

            //             //var statoNI = this.getView().byId("idModificaDettaglio").mBindingInfos.items.binding.oModel.oZcodiStatoni
            //             MessageBox.warning("Sei sicuro di voler revocare la conferma della Nota d'Imputazione n° " + header[i].ZchiaveNi + "?", {
            //                 title: "Revoca Conferma",
            //                 actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
            //                 emphasizedAction: MessageBox.Action.YES,
            //                 onClose: function (oAction) {
            //                     if (oAction === sap.m.MessageBox.Action.YES) {
            //                         var oModel = that.getOwnerComponent().getModel();

            //                         deepEntity.ZchiaveNi = that.getView().byId("numNI1").mProperties.text

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

            //                         deepEntity.HeaderNISet = header[indiceHeader];

            //                         oModel.create("/DeepZNIEntitySet", deepEntity, {
            //                             success: function (data) {
            //                               if(data.Msgty === 'E'){
            //                                 MessageBox.error(data.Message, {
            //                                   title: "Esito Operazione",
            //                                   actions: [sap.m.MessageBox.Action.OK],
            //                                   emphasizedAction: MessageBox.Action.OK,
            //                                 });
            //                                 return false;
            //                               }
            //                               else{
            //                                 // MessageBox.success("Nota di Imputazione "+header[indiceHeader].ZchiaveNi+" revocata correttamente", {
            //                                 MessageBox.success(data.Message, {  
            //                                   title: "Esito Operazione",
            //                                   actions: [sap.m.MessageBox.Action.OK],
            //                                   emphasizedAction: MessageBox.Action.OK,
            //                                   onClose: function (oAction) {
            //                                     if (oAction === sap.m.MessageBox.Action.OK) {
            //                                         that.getOwnerComponent().getRouter().navTo("View1");
            //                                         location.reload();
            //                                     }
            //                                   }
            //                                 });
            //                               }
            //                             },
            //                             error: function (e) {
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
            // },

            onRevocaConfermaNI:function(oEvent){
              var self =this,
                oModel = self.getOwnerComponent().getModel(),
                header = self.getView().getModel(MODEL_ENTITY).getProperty("/Header");

              if(!header || header === null)
                return false;
              
              var deepEntity = {
                ZchiaveNi: header.ZchiaveNi,
                HeaderNISet: header,
                Funzionalita: 'REVOCACONFERMA',
              };
              MessageBox.warning("Sei sicuro di voler revocare la conferma della Nota d'Imputazione n° " + header.ZchiaveNi + "?", {
                title: "Revoca Conferma",
                actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
                emphasizedAction: MessageBox.Action.YES,
                onClose: function (oAction) {
                    if (oAction === sap.m.MessageBox.Action.YES) {
                      delete deepEntity.HeaderNISet.ZcompRes;
                      delete deepEntity.HeaderNISet.Lifnr;
                      delete deepEntity.HeaderNISet.Cdc;              
                      delete deepEntity.HeaderNISet.Coge;
                      delete deepEntity.HeaderNISet.CodiceGestionale;
                      delete deepEntity.HeaderNISet.CausalePagamento;
                      delete deepEntity.HeaderNISet.ModalitaPagamento;
                      delete deepEntity.HeaderNISet.LifnrDesc;
                      delete deepEntity.HeaderNISet.CodiceUfficio;
                      delete deepEntity.HeaderNISet.Dirigente;

                      oModel.create("/DeepZNIEntitySet", deepEntity, {
                        success: function (data) {
                          if(data.Msgty === 'E'){
                            MessageBox.error(data.Message, {
                              title: "Esito Operazione",
                              actions: [sap.m.MessageBox.Action.OK],
                              emphasizedAction: MessageBox.Action.OK,
                            });
                            return false;
                          }
                          else{
                            MessageBox.success(data.Message, {  
                              title: "Esito Operazione",
                              actions: [sap.m.MessageBox.Action.OK],
                              emphasizedAction: MessageBox.Action.OK,
                              onClose: function (oAction) {
                                if (oAction === sap.m.MessageBox.Action.OK) {
                                  self.getView().getModel(MODEL_ENTITY).setProperty("/Header",null);
                                  self.getView().getModel(MODEL_ENTITY).setProperty("/PositionNI",[]);
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
                          })
                        }
                      });
                    }
                }
              });
            },

            onRichiamaNI:function(oEvent){
              var self =this,
                header = self.getView().getModel(MODEL_ENTITY).getProperty("/Header");

              if(!header || header === null)
                return false;
              
              var deepEntity = {
                ZchiaveNi: header.ZchiaveNi,
                HeaderNISet: header,
                Funzionalita: 'RICHIAMOCONFERMATA',
              };
              MessageBox.warning("Sei sicuro di voler richiamare la Nota d'Imputazione n° " + header.ZchiaveNi + "?", {
                title: "Richiamo Nota di Imputazione",
                actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
                emphasizedAction: MessageBox.Action.YES,
                onClose: function (oAction) {
                    if (oAction === sap.m.MessageBox.Action.YES) {
                        self.onSubmitDialogPress(deepEntity)
                    }
                }
              });
            },

            onSubmitDialogPress:function(deepEntity){
              if (!this.oSubmitDialog){
                this.oSubmitDialog = new Dialog({
                  type: DialogType.Message,
                  title: "Motivazione Richiamo",
                  content: [
                      new TextArea("submissionNote", {
                          width: "100%",
                          placeholder: "",
                          liveChange: function (oEvent) {
                              var sText = oEvent.getParameter("value");
                              this.oSubmitDialog.getBeginButton().setEnabled(sText.length > 0);
                          }.bind(this)
                      })
                  ],
                  beginButton: new Button({
                    type: ButtonType.Emphasized,
                      text: "Ok",
                      enabled: false,
                      press: function(){
                        var self = this;
                        var oModel = self.getOwnerComponent().getModel();
                        deepEntity.HeaderNISet.ZcodiStatoni = "05";
                        
                        delete deepEntity.HeaderNISet.ZcompRes;
                        delete deepEntity.HeaderNISet.Lifnr;
                        delete deepEntity.HeaderNISet.Cdc;              
                        delete deepEntity.HeaderNISet.Coge;
                        delete deepEntity.HeaderNISet.CodiceGestionale;
                        delete deepEntity.HeaderNISet.CausalePagamento;
                        delete deepEntity.HeaderNISet.ModalitaPagamento;
                        delete deepEntity.HeaderNISet.LifnrDesc;
                        delete deepEntity.HeaderNISet.CodiceUfficio;
                        delete deepEntity.HeaderNISet.Dirigente;
                        deepEntity.HeaderNISet.Zmotrichiamo = Core.byId("submissionNote").getValue();
                        oModel.create("/DeepZNIEntitySet", deepEntity, {

                          success: function (data) {
                            if (data.Msgty == 'E') {
                              MessageBox.error(data.Message, {
                                title: "Esito Operazione",
                                actions: [sap.m.MessageBox.Action.OK],
                                emphasizedAction: MessageBox.Action.OK,
                              });
                              self.oSubmitDialog.getContent()[0].setValue(null);
                              self.oSubmitDialog.close();
                              return false;
                            }
                            if (data.Msgty == 'S') {
                                MessageBox.success("Nota di Imputazione n°"+ deepEntity.HeaderNISet.ZchiaveNi+" richiamata correttamente", {
                                  title: "Esito Operazione",
                                  actions: [sap.m.MessageBox.Action.OK],
                                  emphasizedAction: MessageBox.Action.OK,
                                  onClose: function (oAction) {
                                      if (oAction === sap.m.MessageBox.Action.OK) {
                                        self.getView().getModel(MODEL_ENTITY).setProperty("/Header",null);
                                        self.getView().getModel(MODEL_ENTITY).setProperty("/PositizionNI",[]);
                                        self.getOwnerComponent().getRouter().navTo("View1");
                                        self.oSubmitDialog.getContent()[0].setValue(null);
                                        self.oSubmitDialog.close();
                                        location.reload();
                                      }
                                  }
                                })
                            }
                          },
                          error: function (e) {
                            console.log(e);//TODO:da canc
                            MessageBox.error("Operazione non eseguita");
                            self.oSubmitDialog.getContent()[0].setValue(null);
                            self.oSubmitDialog.close();
                          }
                        });
                        this.oSubmitDialog.close();
                      }.bind(this)
                  }),
                  endButton: new Button({
                    text: "Annulla",
                    press: function () {
                        self.oSubmitDialog.close();
                    }.bind(this)
                })
              });
            }
          this.oSubmitDialog.open();
        },


            // onRichiamaNI: function () {
            //     var that = this

            //     var url = location.href
            //     var sUrl = url.split("/conferma/")[1]
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

            //             var indice = i

            //             var deepEntity = {
            //                 HeaderNISet: null,
            //                 Funzionalita: 'RICHIAMOCONFERMATA',
            //             }

            //             //var statoNI = this.getView().byId("idModificaDettaglio").mBindingInfos.items.binding.oModel.oZcodiStatoni
            //             MessageBox.warning("Sei sicuro di voler richiamare la Nota d'Imputazione n° " + header[i].ZchiaveNi + "?", {
            //                 title: "Richiamo Nota di Imputazione",
            //                 actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
            //                 emphasizedAction: MessageBox.Action.YES,
            //                 onClose: function (oAction) {
            //                     if (oAction === sap.m.MessageBox.Action.YES) {
            //                         that.onSubmitDialogPress(aValori)
            //                     }
            //                 }
            //             });
            //         }
            //     }
            // },

            // onSubmitDialogPress: function (aValori) {
            //     if (!this.oSubmitDialog) {
            //         this.oSubmitDialog = new Dialog({
            //             type: DialogType.Message,
            //             title: "Motivazione Richiamo",
            //             content: [
            //                 new TextArea("submissionNote", {
            //                     width: "100%",
            //                     placeholder: "",
            //                     liveChange: function (oEvent) {
            //                         var sText = oEvent.getParameter("value");
            //                         this.oSubmitDialog.getBeginButton().setEnabled(sText.length > 0);
            //                     }.bind(this)
            //                 })
            //             ],
            //             beginButton: new Button({
            //                 type: ButtonType.Emphasized,
            //                 text: "Ok",
            //                 enabled: false,
            //                 press: function () {
            //                     var that = this
            //                     var header = this.getView().getModel("temp").getData().HeaderNISet
            //                     for (var i = 0; i < header.length; i++) {
            //                         if (header[i].Bukrs == aValori[0] &&
            //                             header[i].Gjahr == aValori[1] &&
            //                             header[i].Zamministr == aValori[2] &&
            //                             header[i].ZchiaveNi == aValori[3] &&
            //                             header[i].ZidNi == aValori[4] &&
            //                             header[i].ZRagioCompe == aValori[5]) {

            //                             var indiceHeader = i

            //                             var deepEntity = {
            //                                 HeaderNISet: null,
            //                                 Funzionalita: 'RICHIAMOCONFERMATA',
            //                             }
            //                             var oModel = that.getOwnerComponent().getModel();

            //                             deepEntity.ZchiaveNi = that.getView().byId("numNI1").mProperties.text
            //                             deepEntity.HeaderNISet = header[indiceHeader];
            //                             deepEntity.HeaderNISet.ZcodiStatoni = "05"

            //                             var numeroIntero = header[indiceHeader].ZimpoTotni
            //                             var numIntTot = ""
            //                             if (numeroIntero.split(".").length > 1) {
            //                                 var numeri = numeroIntero.split(".")
            //                                 for (var n = 0; n < numeri.length; n++) {
            //                                     numIntTot = numIntTot + numeri[n]
            //                                     //var numeroFloat = parseFloat(numeroIntero)
            //                                     if (numIntTot.split(",").length > 1) {
            //                                         var virgole = numIntTot.split(",")
            //                                         var numeroInteroSM = virgole[0] + "." + virgole[1]
            //                                     }
            //                                 }
            //                                 var importoPrimaVirgola = numeroIntero.split(".")
            //                                 var numPunti = ""
            //                                 var migliaia = importoPrimaVirgola[0].split('').reverse().join('').match(/.{1,3}/g).map(function (x) {
            //                                     return x.split('').reverse().join('')
            //                                 }).reverse()

            //                                 for (var migl = 0; migl < migliaia.length; migl++) {
            //                                     numPunti = (numPunti + migliaia[migl] + ".")
            //                                 }
            //                                 var indice = numPunti.split("").length
            //                                 var numeroIntero = numPunti.substring(0, indice - 1) + "," + importoPrimaVirgola[1]
            //                                 header[indiceHeader].ZimpoTotni = numeroInteroSM
            //                             }

            //                             else {
            //                                 var importoPrimaVirgola = numeroIntero.split(",")
            //                                 var numeroInteroSM = importoPrimaVirgola[0] + "." + importoPrimaVirgola[1]
            //                                 header[indiceHeader].ZimpoTotni = numeroInteroSM
            //                             }

            //                             deepEntity.HeaderNISet.Zmotrichiamo = Core.byId("submissionNote").getValue();

            //                             oModel.create("/DeepZNIEntitySet", deepEntity, {
            //                                 //urlParameters: {'funzionalita': 'ANNULLAMENTOPREIMPOSTATA'},
            //                                 // method: "PUT",
            //                                 success: function (data) {
            //                                     //console.log("success");
            //                                     MessageBox.success("Nota di Imputazione n°"+header[indiceHeader].ZchiaveNi+" richiamata correttamente", {
            //                                         actions: [sap.m.MessageBox.Action.OK],
            //                                         emphasizedAction: MessageBox.Action.OK,
            //                                         onClose: function (oAction) {
            //                                             if (oAction === sap.m.MessageBox.Action.OK) {
            //                                                 that.getOwnerComponent().getRouter().navTo("View1");
            //                                                 location.reload();
            //                                             }
            //                                         }
            //                                     })
            //                                 },
            //                                 error: function (e) {
            //                                     //console.log("error");
            //                                     MessageBox.error("Operazione non eseguita")
            //                                 }
            //                             });

            //                         }
            //                     }
            //                     this.oSubmitDialog.close();
            //                 }.bind(this)
            //             }),
            //             endButton: new Button({
            //                 text: "Annulla",
            //                 press: function () {
            //                     this.oSubmitDialog.close();
            //                 }.bind(this)
            //             })
            //         });
            //     }

            //     this.oSubmitDialog.open();
            // },


        });
    }
);
