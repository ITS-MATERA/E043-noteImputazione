sap.ui.define(
    [
        "./BaseController",
        "sap/ui/model/Filter",
        "sap/ui/model/FilterOperator",
        "sap/m/MessageBox",
        "sap/ui/core/routing/History",
        'project1/model/DateFormatter',
        'sap/ui/model/json/JSONModel',
    ],
    function (BaseController, Filter, FilterOperator, MessageBox, History, DateFormatter, JSONModel) {
        "use strict";

        const MODEL_ENTITY = "EntityModel";
        return BaseController.extend("project1.controller.RettificaNI", {
            formatter: DateFormatter,
            onInit() {

              var oModelJson = new JSONModel({
                  Header:null,
                  HeaderNIM:[]              
              });     
              this.getView().setModel(oModelJson,MODEL_ENTITY);
              this.getOwnerComponent().getModel("temp");
              this.getRouter().getRoute("RettificaNI").attachPatternMatched(this._onObjectMatched, this);
            },

            onBackButton:function(oEvent){
              var self =this;
              self.getView().getModel(MODEL_ENTITY).setProperty("/Header",null);
              self.getView().getModel(MODEL_ENTITY).setProperty("/HeaderNIM",[]);
              window.history.go(-1);
            },

            // onBackButton: function () {
            //     this.getView().byId("idRettificaNI").destroyItems()
            //     window.history.go(-1);
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

            pulsantiVisibiltà: function (data) {
              for (var d = 0; d < data.length; d++) {
                  // if (data[d].ACTV_2 == "Z02") {
                  //     this.getView().byId("editRow").setEnabled(true);
                  // }
                  // if (data[d].ACTV_4 == "Z04") {
                  //     this.getView().byId("pressFirma").setEnabled(false);
                  //     this.getView().byId("InviaNI").setEnabled(true);
                  // }
                  if (data[d].ACTV_4 === "Z21") {
                    this.getView().byId("idFascicoloIconTab").setEnabled(true);
                  }
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
                          // self.getView().getModel(MODEL_ENTITY).setProperty("/HeaderNIM",callback.data);
                          // self.getView().getModel("temp").setProperty('/PositionNISet', callback.data);
                          if(callback.data.length>0){
                            var item = callback.data[0];
                            console.log(item);
                            self.loadBeneficiario(item.Lifnr);
                            self.getView().getModel(MODEL_ENTITY).setProperty("/Header/ZcompRes",item.ZcompRes);                              
                            self.getView().getModel(MODEL_ENTITY).setProperty("/Header/Lifnr",item.Lifnr);
                            self.getView().getModel(MODEL_ENTITY).setProperty("/Header/Cdc",item.Kostl);
                            self.getView().getModel(MODEL_ENTITY).setProperty("/Header/Coge",item.Saknr);
                            self.getView().getModel(MODEL_ENTITY).setProperty("/Header/CodiceGestionale",item.Zcodgest);
                            self.getView().getModel(MODEL_ENTITY).setProperty("/Header/CausalePagamento",item.Zcauspag);
                            self.getView().getModel(MODEL_ENTITY).setProperty("/Header/ModalitaPagamento",item.Zdescwels);
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
                            self.getView().getModel(MODEL_ENTITY).setProperty("/HeaderInserisci",callback.data);
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
                        self.onModificaNI();
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

            // callPositionNI_old: function () {

            //     var url = location.href
            //     var sUrl = url.split("/RettificaNI/")[1]
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
            //             this.getOwnerComponent().setModel(oMdlITB, "HeaderInserisci");

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
            //     var sUrl = url.split("/RettificaNI/")[1]
            //     var aValori = sUrl.split(",")

            //     var Bukrs = aValori[0]
            //     var Gjahr = aValori[1]
            //     var Zamministr = aValori[2]
            //     var ZchiaveNi = aValori[3]
            //     var ZidNi = aValori[4]
            //     var ZRagioCompe = aValori[5]

            //     var header = this.getView().getModel("temp").getData().HeaderNISet
            //     var position = position
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

                       
            //         }
            //     }
            //     this.onModificaNI()
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

            onModificaNI: function () {
              var self =this,
                  filters = [],
                  visibilita = self.getOwnerComponent().getModel("temp").getData().Visibilità[0],
                  header = self.getView().getModel(MODEL_ENTITY).getProperty("/Header");

              filters.push(new Filter({path: "Bukrs",operator: FilterOperator.EQ,value1: header.Bukrs}));
              filters.push(new Filter({path: "Gjahr",operator: FilterOperator.EQ,value1: header.Gjahr}));
              filters.push(new Filter({path: "Zamministr",operator: FilterOperator.EQ,value1: header.Zamministr}));
              filters.push(new Filter({path: "ZchiaveNi",operator: FilterOperator.EQ,value1: header.ZchiaveNi}));
              filters.push(new Filter({path: "ZidNi",operator: FilterOperator.EQ,value1: header.ZidNi}));
              filters.push(new Filter({path: "ZRagioCompe",operator: FilterOperator.EQ,value1: header.ZRagioCompe}));

              self.getOwnerComponent().getModel().read("/HeaderNISet", {
                  filters: filters,
                  urlParameters: { "AutorityRole": visibilita.AGR_NAME, "AutorityFikrs": visibilita.FIKRS, "AutorityPrctr": visibilita.PRCTR },
                  success: function (data) {
                    console.log(data);
                    self.getView().getModel(MODEL_ENTITY).setProperty("/HeaderNIM",data.results);                         
                  },
                  error: function (error) {
                    console.log(error);
                    var e = error;
                  }
              });
            },

            // onModificaNI_old: function () {
            //     var visibilità = this.getOwnerComponent().getModel("temp").getData().Visibilità[0]

            //     var filtroNI = []
            //     var url = location.href
            //     var sUrl = url.split("/RettificaNI/")[1]
            //     var aValori = sUrl.split(",")

            //     var Bukrs = aValori[0]
            //     var Gjahr = aValori[1]
            //     var Zamministr = aValori[2]
            //     var ZchiaveNi = aValori[3]
            //     var ZidNi = aValori[4]
            //     var ZRagioCompe = aValori[5]

            //     //filtroNI.push({Bukrs:Bukrs, Gjahr:Gjahr, Zamministr,Zamministr, ZchiaveNi:ZchiaveNi, ZidNi:ZidNi, ZRagioCompe:ZRagioCompe})
            //     filtroNI.push(new Filter({
            //         path: "Bukrs",
            //         operator: FilterOperator.EQ,
            //         value1: Bukrs
            //     }));
            //     filtroNI.push(new Filter({
            //         path: "Gjahr",
            //         operator: FilterOperator.EQ,
            //         value1: Gjahr
            //     }));
            //     filtroNI.push(new Filter({
            //         path: "Zamministr",
            //         operator: FilterOperator.EQ,
            //         value1: Zamministr
            //     }));
            //     filtroNI.push(new Filter({
            //         path: "ZchiaveNi",
            //         operator: FilterOperator.EQ,
            //         value1: ZchiaveNi
            //     }));
            //     filtroNI.push(new Filter({
            //         path: "ZidNi",
            //         operator: FilterOperator.EQ,
            //         value1: ZidNi
            //     }));
            //     filtroNI.push(new Filter({
            //         path: "ZRagioCompe",
            //         operator: FilterOperator.EQ,
            //         value1: ZRagioCompe
            //     }));

            //     var that = this;
            //     var oMdlM = new sap.ui.model.json.JSONModel();
            //     this.getOwnerComponent().getModel().read("/HeaderNISet", {
            //         filters: filtroNI,
            //         urlParameters: { "AutorityRole": visibilità.AGR_NAME, "AutorityFikrs": visibilità.FIKRS, "AutorityPrctr": visibilità.PRCTR },
            //         success: function (data) {
            //             oMdlM.setData(data.results);
            //         },
            //         error: function (error) {
            //             var e = error;
            //         }
            //     });
            //     this.getOwnerComponent().setModel(oMdlM, "HeaderNIM");
            // },

            onSaveDati:function(oEvent){
              var self =this,
                  header = self.getView().getModel(MODEL_ENTITY).getProperty("/Header"),
                  headerNIM = self.getView().getModel(MODEL_ENTITY).getProperty("/HeaderNIM");

              if(!header || header === null || !headerNIM || headerNIM === null || headerNIM.length === 0)
                return false;    

              var deepEntity = {
                  ZchiaveNi: header.ZchiaveNi,
                  HeaderNISet: header,
                  Funzionalita: 'RETTIFICAPROVVISORIA',
              };
              deepEntity.HeaderNISet.ZoggSpesa =  headerNIM[0].ZoggSpesa;
              
              delete deepEntity.HeaderNISet.ZcompRes;
              delete deepEntity.HeaderNISet.Lifnr;
              delete deepEntity.HeaderNISet.Cdc;              
              delete deepEntity.HeaderNISet.Coge;
              delete deepEntity.HeaderNISet.CodiceGestionale;
              delete deepEntity.HeaderNISet.CausalePagamento;
              delete deepEntity.HeaderNISet.ModalitaPagamento;
              delete deepEntity.HeaderNISet.LifnrDesc;
              console.log(deepEntity);//TODO:da canc
              MessageBox.warning("Sei sicuro di voler rettificare la Nota d'Imputazione n° " + header.ZchiaveNi + "?", {
                title:"Rettifica Provvisoria",
                actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
                emphasizedAction: MessageBox.Action.YES,
                onClose: function (oAction) {
                    if (oAction === sap.m.MessageBox.Action.YES) {
                        var oModel = self.getOwnerComponent().getModel();
                        oModel.create("/DeepZNIEntitySet", deepEntity, {
                          success: function (result) {
                              if (result.Msgty == 'E') {
                                  console.log(result.Message)
                                  MessageBox.error("Modifica non eseguita correttamente", {
                                      title:"Esito Operazione",
                                      actions: [sap.m.MessageBox.Action.OK],
                                      emphasizedAction: MessageBox.Action.OK,
                                  })
                              }
                              if (result.Msgty == 'S') {
                                  MessageBox.success("Nota di Imputazione "+ header.ZchiaveNi+" rettificata correttamente", {
                                      title:"Esito Operazione",
                                      actions: [sap.m.MessageBox.Action.OK],
                                      emphasizedAction: MessageBox.Action.OK,
                                      onClose: function (oAction) {
                                          if (oAction === sap.m.MessageBox.Action.OK) {
                                              self.getOwnerComponent().getRouter().navTo("View1");
                                              location.reload();
                                          }
                                      }
                                  })
                              }
                          },
                          error: function (e) {
                            console.log(e);
                            MessageBox.error("Modifica non eseguita", {
                                title:"Esito Operazione",
                                actions: [sap.m.MessageBox.Action.OK],
                                emphasizedAction: MessageBox.Action.OK,
                            });
                          }
                      });
                    }
                  }
                });
            },




        //     onSaveDati_old: function () {
        //         var that = this
        //         var url = location.href
        //         var sUrl = url.split("/RettificaNI/")[1]
        //         var aValori = sUrl.split(",")

        //         var Bukrs = aValori[0]
        //         var Gjahr = aValori[1]
        //         var Zamministr = aValori[2]
        //         var ZchiaveNi = aValori[3]
        //         var ZidNi = aValori[4]
        //         var ZRagioCompe = aValori[5]

        //         //var oItems = that.getView().byId("").getBinding("items").oList;
        //         var header = this.getView().getModel("temp").getData().HeaderNISet
        //         for (var i = 0; i < header.length; i++) {
        //             if (header[i].Bukrs == Bukrs &&
        //                 header[i].Gjahr == Gjahr &&
        //                 header[i].Zamministr == Zamministr &&
        //                 header[i].ZchiaveNi == ZchiaveNi &&
        //                 header[i].ZidNi == ZidNi &&
        //                 header[i].ZRagioCompe == ZRagioCompe) {

        //                 var indiceHeader = i

        //                 var deepEntity = {
        //                     HeaderNISet: null,
        //                     Funzionalita: 'RETTIFICAPROVVISORIA',
        //                 }

        //                 //var statoNI = this.getView().byId("idModificaDettaglio").mBindingInfos.items.binding.oModel.oZcodiStatoni
        //                 MessageBox.warning("Sei sicuro di voler rettificare la Nota d'Imputazione n° " + header[i].ZchiaveNi + "?", {
        //                     title:"Rettifica Provvisoria",
        //                     actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
        //                     emphasizedAction: MessageBox.Action.YES,
        //                     onClose: function (oAction) {
        //                         if (oAction === sap.m.MessageBox.Action.YES) {
        //                             var oModel = that.getOwnerComponent().getModel();

        //                             for (var i = 0; i < header.length; i++) {
        //                                 deepEntity.ZchiaveNi = that.getView().byId("numNI1").mProperties.text
        //                                 deepEntity.HeaderNISet = header[indiceHeader];
        //                             }
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
        //                                 deepEntity.HeaderNISet.ZoggSpesa = that.getView().byId("idRettificaNI").mAggregations.items[0].mAggregations.cells[2].mProperties.value
        //                                 oModel.create("/DeepZNIEntitySet", deepEntity, {
        //                                     //urlParameters: {'funzionalita': 'ANNULLAMENTOPREIMPOSTATA'},
        //                                     // method: "PUT",
        //                                     success: function (result) {
        //                                         if (result.Msgty == 'E') {
        //                                             console.log(result.Message)
        //                                             MessageBox.error("Modifica non eseguita correttamente", {
        //                                                 title:"Esito Operazione",
        //                                                 actions: [sap.m.MessageBox.Action.OK],
        //                                                 emphasizedAction: MessageBox.Action.OK,
        //                                             })
        //                                         }
        //                                         if (result.Msgty == 'S') {
        //                                             MessageBox.success("Nota di Imputazione "+header[indiceHeader].ZchiaveNi+" rettificata correttamente", {
        //                                                 title:"Esito Operazione",
        //                                                 actions: [sap.m.MessageBox.Action.OK],
        //                                                 emphasizedAction: MessageBox.Action.OK,
        //                                                 onClose: function (oAction) {
        //                                                     if (oAction === sap.m.MessageBox.Action.OK) {
        //                                                         that.getOwnerComponent().getRouter().navTo("View1");
        //                                                         location.reload();
        //                                                     }
        //                                                 }
        //                                             })
        //                                         }
        //                                     },
        //                                     error: function (e) {
        //                                         //console.log("error");
        //                                         MessageBox.error("Modifica non eseguita", {
        //                                             title:"Esito Operazione",
        //                                             actions: [sap.m.MessageBox.Action.OK],
        //                                             emphasizedAction: MessageBox.Action.OK,
        //                                         })
        //                                     }
        //                                 });
                                        
        //                             }
        //                         }
        //                     });
        //             }
        //         }

        // }
    });

    }
);