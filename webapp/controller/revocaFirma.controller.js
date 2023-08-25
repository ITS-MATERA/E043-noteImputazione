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
    ],
    /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
    function (BaseController, Filter, FilterOperator, JSONModel, Spreadsheet, CoreLibrary, DateFormatter, MessageBox) {
        "use strict";
        var EdmType = sap.ui.export.EdmType

        var ValueState = CoreLibrary.ValueState,
            oData = {
                EditEnable: false,
                AddEnable: false,
                DeleteEnable: false,
            };
        const MODEL_ENTITY = "EntityModel";     
        return BaseController.extend("project1.controller.revocaFirma", {
            formatter: DateFormatter,
            onInit() {
                var oProprietà = new JSONModel(),
                    oInitialModelState = Object.assign({}, oData);
                oProprietà.setData(oInitialModelState);

                var oModelJson = new JSONModel({
                    Header:null,
                    revocaFirma:[]         
                });     
                this.getView().setModel(oModelJson,MODEL_ENTITY);

                this.getView().setModel(oProprietà);
                this.getOwnerComponent().getModel("temp");
                // this.callVisibilità()
                this.getRouter().getRoute("revocaFirma").attachPatternMatched(this._onObjectMatched, this);

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
          

            pulsantiVisibiltà: function (data) {
                for (var d = 0; d < data.length; d++) {
                    if (data[d].ACTV_4 == "Z05") {
                        this.getView().byId("AnnullaNI2").setEnabled(true);
                    }
                    if (data[d].ACTV_4 == "Z06") {
                        this.getView().byId("InviaNI").setEnabled(true);
                    }                  
                }
            },

            _onObjectMatched:function(oEvent){
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
                      self.callPositionNiSet(data, function(callback){
                        if(callback.success){
                          self.getView().getModel(MODEL_ENTITY).setProperty("/revocaFirma",callback.data);
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
                            self.getView().getModel(MODEL_ENTITY).setProperty("/Header/DataProtocollo",
                              data.ZdataProtAmm ? self.formatter.convert(data.ZdataProtAmm) : null);
                            self.getView().getModel(MODEL_ENTITY).setProperty("/Header/NumeroProtocollo",data.NProtocolloAmm);
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
                            self.getView().getModel(MODEL_ENTITY).setProperty("/revocaFirma",callback.data);
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


            // callPositionNI_OLD: function () {

            //     var url = location.href
            //     var sUrl = url.split("/revocaFirma/")[1]
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
            //                     that.viewHeader(data.results)
            //                 },
            //                 error: function (error) {
            //                     var e = error;
            //                 }
            //             });
            //             this.getOwnerComponent().setModel(oMdlITB, "revocaFirma");
            //             this.callWorkflow()

            //         }
            //     }

            // },

            // viewHeader: function (position) {
            //     var url = location.href
            //     var sUrl = url.split("/revocaFirma/")[1]
            //     var aValori = sUrl.split(",")

            //     var Bukrs = aValori[0]
            //     var Gjahr = aValori[1]
            //     var Zamministr = aValori[2]
            //     var ZchiaveNi = aValori[3]
            //     var ZidNi = aValori[4]
            //     var ZRagioCompe = aValori[5]

            //     var header = this.getView().getModel("temp").getData().HeaderNISet
            //     var position = position

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

            //                     // var modalitàPagamento = position[x].Zwels
            //                     var modalitàPagamento = position[x].Zdescwels;
            //                     this.getView().byId("Zwels1").setText(modalitàPagamento)


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
            //     var sUrl = url.split("/revocaFirma/")[1]
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
                    this.getView().byId("revocaFirmaITB").destroyContent()
                }
                else if (key === "Workflow") {
                    this.getView().byId("revocaFirmaITB").destroyContent()
                }
                else if (key === "Fascicolo") {
                }
            },

            onBackButton: function () {
              var self =this;
              self.getView().getModel(MODEL_ENTITY).setProperty("/Header",null);
              self.getView().getModel(MODEL_ENTITY).setProperty("/revocaFirma",[]);
              window.history.go(-1);
            },

            onRevocaNI:function(oEvent){
              var self =this,
                oBundle=self.getResourceBundle(),
                header = self.getView().getModel(MODEL_ENTITY).getProperty("/Header");

              if(!header || header === null)
                return false;

              var deepEntity = {
                ZchiaveNi: header.ZchiaveNi,
                HeaderNISet: header,
                Funzionalita: 'REVOCAINVIOFIRMA',
              };  

              MessageBox.warning("Sei sicuro di voler revocare la Nota d'Imputazione n° " + header.ZchiaveNi + "?", {
                title: "Revoca Invio Firma",
                actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
                emphasizedAction: MessageBox.Action.YES,
                onClose: function (oAction) {
                    if (oAction === sap.m.MessageBox.Action.YES) {
                        var oModel = self.getOwnerComponent().getModel();
                        deepEntity.HeaderNISet.ZcodiStatoni = "02";
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
                        delete deepEntity.HeaderNISet.DataProtocollo;
                        delete deepEntity.HeaderNISet.NumeroProtocollo;

                        oModel.create("/DeepZNIEntitySet", deepEntity, {
                          success: function (data) {
                              if (data.Msgty == 'E') {
                                  console.log(data.Message)
                                  MessageBox.error("Operazione non eseguita", {
                                      title: "Esito Operazione",
                                      actions: [sap.m.MessageBox.Action.OK],
                                      emphasizedAction: MessageBox.Action.OK,
                                  });
                              }
                              if (data.Msgty == 'S') {
                                  MessageBox.success("Invio alla firma della Nota di Imputazione n. "+header.ZchiaveNi+" revocato correttamente", {
                                      title: "Esito Operazione",
                                      actions: [sap.m.MessageBox.Action.OK],
                                      emphasizedAction: MessageBox.Action.OK,
                                      onClose: function (oAction) {
                                          if (oAction === sap.m.MessageBox.Action.OK) {
                                            self.getView().getModel(MODEL_ENTITY).setProperty("/Header",null);
                                            self.getView().getModel(MODEL_ENTITY).setProperty("/revocaFirma",[]);
                                            self.getOwnerComponent().getRouter().navTo("View1");
                                            location.reload();
                                          }
                                      }
                                  })
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

            // onRevocaNI_old: function () {
            //     var that = this

            //     var url = location.href
            //     var sUrl = url.split("/revocaFirma/")[1]
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
            //                 Funzionalita: 'REVOCAINVIOFIRMA',
            //             }

            //             //var statoNI = this.getView().byId("idModificaDettaglio").mBindingInfos.items.binding.oModel.oZcodiStatoni
            //             MessageBox.warning("Sei sicuro di voler revocare la Nota d'Imputazione n° " + header[i].ZchiaveNi + "?", {
            //                 title: "Revoca Invio Firma",
            //                 actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
            //                 emphasizedAction: MessageBox.Action.YES,
            //                 onClose: function (oAction) {
            //                     if (oAction === sap.m.MessageBox.Action.YES) {
            //                         var oModel = that.getOwnerComponent().getModel();

            //                         for (var i = 0; i < header.length; i++) {
            //                             // var item = header[i];
            //                             // var scompostaZamministr = that.getView().byId("numNI1").mProperties.text.split("-")[1]
            //                             // var Zamministr = scompostaZamministr.split(".")[0]

            //                             deepEntity.ZchiaveNi = that.getView().byId("numNI1").mProperties.text

            //                             if (header[indiceHeader].ZimpoTotni.split(".").length > 1) {
            //                                 var importoPrimaVirgola = header[indiceHeader].ZimpoTotni.split(".")
            //                                 var numPunti = ""
            //                                 var migliaia = importoPrimaVirgola[0].split('').reverse().join('').match(/.{1,3}/g).map(function (x) {
            //                                     return x.split('').reverse().join('')
            //                                 }).reverse()

            //                                 for (var migl = 0; migl < migliaia.length; migl++) {
            //                                     numPunti = (numPunti + migliaia[migl] + ".")
            //                                 }
            //                                 var indice = numPunti.split("").length
            //                                 var totale = numPunti.substring(0, indice - 1) + "," + importoPrimaVirgola[1]
            //                                 header[indiceHeader].ZimpoTotni = totale
            //                             }
            //                             else {
            //                                 var virgole = header[indiceHeader].ZimpoTotni.split(",")
            //                                 var totale = virgole[0] + "." + virgole[1]
            //                                 header[indiceHeader].ZimpoTotni = totale
            //                             }

            //                             deepEntity.HeaderNISet = header[indiceHeader];
            //                             deepEntity.HeaderNISet.ZcodiStatoni = "02"
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
            //                                     MessageBox.success("Nota di Imputazione "+header[indiceHeader].ZchiaveNi+" revocata correttamente", {
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
            // },

            onFirmaNI:function(oEvent){
              var self =this,
                header = self.getView().getModel(MODEL_ENTITY).getProperty("/Header"),
                positions = self.getView().getModel(MODEL_ENTITY).getProperty("/revocaFirma");

              if(!header || header === null)
                return false;


              var deepEntity = {
                ZchiaveNi: header.ZchiaveNi,  
                HeaderNISet: header,
                PositionNISet: positions,
                Funzionalita: 'FIRMA',
              }  

              MessageBox.warning("Sei sicuro di voler firmare la Nota di Imputazione n° " + header.ZchiaveNi + "?", {
                actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
                emphasizedAction: MessageBox.Action.YES,
                onClose: function (oAction) {
                    if (oAction === sap.m.MessageBox.Action.YES) {
                        var oModel = self.getOwnerComponent().getModel();
                        deepEntity.HeaderNISet.ZcodiStatoni = "02";
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
                        delete deepEntity.HeaderNISet.DataProtocollo;
                        delete deepEntity.HeaderNISet.NumeroProtocollo;
                        oModel.create("/DeepZNIEntitySet", deepEntity, {
                          success: function (result) {
                            if (result.Msgty == 'E') {
                                console.log(result.Message)
                                MessageBox.error("Invio non eseguito correttamente", {
                                    title: "Esito Operazione",
                                    actions: [sap.m.MessageBox.Action.OK],
                                    emphasizedAction: MessageBox.Action.OK,
                                })
                            }
                            if (result.Msgty == 'S') {
                                MessageBox.success("Nota di Imputazione n°"+header.ZchiaveNi+" firmata correttamente", {
                                    title: "Esito Operazione",
                                    actions: [sap.m.MessageBox.Action.OK],
                                    emphasizedAction: MessageBox.Action.OK,
                                    onClose: function (oAction) {
                                      if (oAction === sap.m.MessageBox.Action.OK) {
                                        self.getView().getModel(MODEL_ENTITY).setProperty("/Header",null);
                                        self.getView().getModel(MODEL_ENTITY).setProperty("/revocaFirma",[]);
                                        self.getOwnerComponent().getRouter().navTo("View1");
                                        location.reload();
                                      }
                                    }
                                })
                            }
                          },
                          error: function (e) {
                              console.log(e);//TODO:da canc
                              MessageBox.error("Invio non eseguito");
                          }
                        });
                    }
                  }
                });             
            },

            // onFirmaNI_old: function () {
            //     var that = this

            //     var url = location.href
            //     var sUrl = url.split("/revocaFirma/")[1]
            //     var aValori = sUrl.split(",")

            //     var Bukrs = aValori[0]
            //     var Gjahr = aValori[1]
            //     var Zamministr = aValori[2]
            //     var ZchiaveNi = aValori[3]
            //     var ZidNi = aValori[4]
            //     var ZRagioCompe = aValori[5]

            //     //var oItems = that.getView().byId("").getBinding("items").oList;
            //     var header = this.getView().getModel("temp").getData().HeaderNISet
            //     //var firmaSet = this.getView().getModel("temp").getData().firmaSet
            //     var oItems = that.getView().byId("revocaFirma").getBinding("items").oList

            //     var deepEntity = {
            //         HeaderNISet: null,
            //         PositionNISet: [],
            //         Funzionalita: 'FIRMA',
            //     }

            //     for (var i = 0; i < header.length; i++) {
            //         if (header[i].Bukrs == Bukrs &&
            //             header[i].Gjahr == Gjahr &&
            //             header[i].Zamministr == Zamministr &&
            //             header[i].ZchiaveNi == ZchiaveNi &&
            //             header[i].ZidNi == ZidNi &&
            //             header[i].ZRagioCompe == ZRagioCompe) {

            //             var indiceHeader = i
            //             //var prova = new Date

            //             for (var x = 0; x < oItems.length; x++) {
            //                 var item = oItems[x]
            //                 deepEntity.PositionNISet.push(oItems[x]);

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

            //             //for (var x = 0; x < oItems.length; x++) {
            //             // deepEntity.PositionNISet.push(oItems[x]);
            //             //}

            //             deepEntity.ZchiaveNi = that.getView().byId("numNI1").mProperties.text

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

            //             deepEntity.HeaderNISet = header[indiceHeader];
            //             deepEntity.HeaderNISet.ZcodiStatoni = "02"

            //             //var statoNI = this.getView().byId("idModificaDettaglio").mBindingInfos.items.binding.oModel.oZcodiStatoni
            //             MessageBox.warning("Sei sicuro di voler inviare la firma della Nota d'Imputazione n° " + header[indiceHeader].ZchiaveNi + "?", {

            //                 actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
            //                 emphasizedAction: MessageBox.Action.YES,
            //                 onClose: function (oAction) {
            //                     if (oAction === sap.m.MessageBox.Action.YES) {
            //                         var oModel = that.getOwnerComponent().getModel();
            //                         oModel.create("/DeepZNIEntitySet", deepEntity, {
            //                             //urlParameters: {'funzionalita': 'ANNULLAMENTOPREIMPOSTATA'},
            //                             // method: "PUT",
            //                             success: function (result) {
            //                                 if (result.Msgty == 'E') {
            //                                     console.log(result.Message)
            //                                     MessageBox.error("Invio non eseguito correttamente", {
            //                                         title: "Esito Operazione",
            //                                         actions: [sap.m.MessageBox.Action.OK],
            //                                         emphasizedAction: MessageBox.Action.OK,
            //                                     })
            //                                 }
            //                                 if (result.Msgty == 'S') {
            //                                     MessageBox.success("Nota di Imputazione n°"+header[indiceHeader].ZchiaveNi+" firmata correttamente", {
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
            //                                 MessageBox.error("Invio non eseguito")
            //                             }
            //                         });

            //                     }
            //                 }

            //             });
            //         }
            //     }
            // }
        });
    }
);
