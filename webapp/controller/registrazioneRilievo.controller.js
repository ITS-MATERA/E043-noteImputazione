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
        return BaseController.extend("project1.controller.registrazioneRilievo", {
            formatter: DateFormatter,
            onInit() {
                var oProprietà = new JSONModel(),
                    oInitialModelState = Object.assign({}, oData);
                oProprietà.setData(oInitialModelState);

                var oModelJson = new JSONModel({
                    Header:null,
                    RegistrazioneRilievo:[],
                    UserInfo:null,
                    Rilievi:{}         
                });     
                this.getView().setModel(oModelJson,MODEL_ENTITY);
                this.getView().setModel(oProprietà);
                this.getOwnerComponent().getModel("temp");
                this.getRouter().getRoute("registrazioneRilievo").attachPatternMatched(this._onObjectMatched, this);
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
                          // self.pulsantiVisibiltà(self.getOwnerComponent().getModel("temp").getData().Visibilità);
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
                      if(data.ZcodiStatoni === "07" || data.ZcodiStatoni === "7")
                        self.setFiltriRilievo();
                      self.userInfo();
                      self.callPositionNiSet(data, function(callback){
                        if(callback.success){
                          self.getView().getModel(MODEL_ENTITY).setProperty("/RegistrazioneRilievo",callback.data);
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
                            self.getView().getModel(MODEL_ENTITY).setProperty("/RegistrazioneRilievo",callback.data);
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

            // callPositionNI_old: function () {
            //     var url = location.href
            //     var sUrl = url.split("/registrazioneRilievo/")[1]
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
            //                     that.setUserInfo();
            //                 },
            //                 error: function (error) {
            //                     var e = error;
            //                 }
            //             });
            //             this.getOwnerComponent().setModel(oMdlITB, "registrazioneRilievo");

            //         }
            //     }

            // },

            userInfo:function() {
              var self =this,
                oModel = self.getOwnerComponent().getModel();
              var chiavi = oModel.createKey("/UserInfoSet", {
                  Bname: "",
              });
              self.getOwnerComponent().getModel().read(chiavi, {
                  success: function (data) {
                    console.log(data);
                    self.getView().getModel("temp").setProperty('/UserInfo', data)
                    self.getView().getModel(MODEL_ENTITY).setProperty('/UserInfo', data);
                  },
                  error: function (error) {
                      var e = error;
                  }
              });
            },



            // setUserInfo:function(){
            //     var self =this,
            //         userInfo = self.getView().getModel("temp").getProperty('/UserInfo');
            //     if(userInfo){
            //         self.getView().byId("Name").setValue(userInfo.NameFirst);
            //         self.getView().byId("Surname").setValue(userInfo.NameLast);
            //     }
            //     else{

            //         var oModel = self.getOwnerComponent().getModel();
            //         var chiavi = oModel.createKey("/UserInfoSet", {
            //             Bname: "",
            //         });

            //         self.getOwnerComponent().getModel().read(chiavi, {
            //             success: function (data) {
            //                 self.getView().getModel("temp").setProperty('/UserInfo', data);
            //                 self.getView().byId("Name").setValue(data.NameFirst);
            //                 self.getView().byId("Surname").setValue(data.NameLast);
            //             },
            //             error: function (error) {
            //                 var e = error;
            //             }
            //         });
            //     }    
            // },

            // viewHeader: function (position) {
            //     var url = location.href
            //     var sUrl = url.split("/registrazioneRilievo/")[1]
            //     var aValori = sUrl.split(",")

            //     var Bukrs = aValori[0]
            //     var Gjahr = aValori[1]
            //     var Zamministr = aValori[2]
            //     var ZchiaveNi = aValori[3]
            //     var ZidNi = aValori[4]
            //     var ZRagioCompe = aValori[5]

            //     var header = this.getView().getModel("temp").getData().HeaderNISet
            //     var position = position
            //     //var firmaSet = this.getView().getModel("temp").getData().firmaSet
            //     var valoriNuovi = this.getView().getModel("temp").getData().ValoriNuovi
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

            //             if (header[i].ZcodiStatoni == "07") {
            //                 this.setFiltriRilievo()
            //             }

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

            onBackButton: function () {
              var self = this;
              self.getView().getModel(MODEL_ENTITY).setProperty("/Header", null);
              self.getView().getModel(MODEL_ENTITY).setProperty("/RegistrazioneRilievo",[]);
              self.getView().getModel(MODEL_ENTITY).setProperty("/UserInfo",null);
              self.getView().getModel(MODEL_ENTITY).setProperty("/Rilievi",{});
              window.history.go(-1);
            },

            setFiltriRilievo:function(){
              var self =this,
                oModel = this.getOwnerComponent().getModel(),
                header = self.getView().getModel(MODEL_ENTITY).getProperty("/Header");

              if(!header || header === null)
                return false;
                            
              var path = oModel.createKey("/RilievoNiSet", {
                  Bukrs: header.Bukrs,
                  Gjahr: header.Gjahr,
                  Zamministr: header.Zamministr,
                  ZchiaveNi: header.ZchiaveNi,
                  ZidNi: header.ZidNi,
                  ZRagioCompe: header.ZRagioCompe,
                  ZidRilievo: ""
              });

              self.getOwnerComponent().getModel().read(path, {
                success: function (data) {
                  data["NProtocolloRag"] = self.getView().getModel(MODEL_ENTITY).getProperty("/Header/NProtocolloRag");
                  data["ZdataProtRag"] = self.getView().getModel(MODEL_ENTITY).getProperty("/Header/ZdataProtRag") ? 
                    self.formatter.convert(self.getView().getModel(MODEL_ENTITY).getProperty("/Header/ZdataProtRag")): null;

                  //data.ZdatRilievo = data.ZdatRilievo ? self.formatter.convert(data.ZdatRilievo) : null;
                  // data.ZdatRilievo = data.ZdatRilievo ? data.ZdatRilievo : null;
                  self.getView().getModel(MODEL_ENTITY).setProperty("/Rilievi",data); 
                  var dataRilievoControl = self.getView().byId("dataRilievo");
                  dataRilievoControl.setDateValue(data.ZdatRilievo) ;                
                },
                error: function (error) {
                  console.log(error);
                }
              });
            },

            // setFiltriRilievo_old: function () {
            //     var that = this
            //     var oModel = this.getOwnerComponent().getModel();

            //     var url = location.href
            //     var sUrl = url.split("/registrazioneRilievo/")[1]
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

            //             that.getView().byId("numProtocolloRGS").setValue(header[i].NProtocolloRag)

            //             var dataProtocolloRGS = header[i].ZdataProtRag
            //             var dataNuova = new Date(dataProtocolloRGS),
            //                 mnth = ("0" + (dataNuova.getMonth() + 1)).slice(-2),
            //                 day = ("0" + dataNuova.getDate()).slice(-2);
            //             var nData = [dataNuova.getFullYear(), mnth, day].join("-");
            //             var nDate = nData.split("-").reverse().join("/");
            //             that.getView().byId("dataProtocolloRGS").setValue(nDate)
            //         }
            //     }

            //     var chiavi = oModel.createKey("/RilievoNiSet", {
            //         Bukrs: Bukrs,
            //         Gjahr: Gjahr,
            //         Zamministr: Zamministr,
            //         ZchiaveNi: ZchiaveNi,
            //         ZidNi: ZidNi,
            //         ZRagioCompe: ZRagioCompe,
            //         ZidRilievo: ""
            //     });

            //     //var oMdlDisp = new sap.ui.model.json.JSONModel();
            //     this.getOwnerComponent().getModel().read(chiavi, {
            //         success: function (data) {
            //             that.getView().getModel("temp").setProperty('/Rilievi', data)

            //             var ZdatRilievo = data.ZdatRilievo
            //             var dataNuova = new Date(ZdatRilievo),
            //                 mnth = ("0" + (dataNuova.getMonth() + 1)).slice(-2),
            //                 day = ("0" + dataNuova.getDate()).slice(-2);
            //             var nData = [dataNuova.getFullYear(), mnth, day].join("-");
            //             var nDate = nData.split("-").reverse().join("/");
            //             that.getView().byId("dataRilievo").setValue(nDate)

            //             that.getView().byId("motivizioneRilievo").setValue(data.Zmotrilievo)

            //         },
            //         error: function (error) {
            //             var e = error;
            //         }
            //     });

            // },

            // onDtPickerChange:function(oEvent){
            //   var self = this,
            //     oControl= self.getView().byId(oEvent.getParameters().id),
            //     dateValue = oControl.getDateValue();
              
            //   var path = oControl.data("dataPathField");
            //   self.getView().getModel(MODEL_ENTITY).setProperty(path,dateValue);
            // },



            onSave:function(oEvent){
              var self =this,
                dataRilievoControl = self.getView().byId("dataRilievo"),
                header = self.getView().getModel(MODEL_ENTITY).getProperty("/Header"),
                rilievi = self.getView().getModel(MODEL_ENTITY).getProperty("/Rilievi"),
                userInfo = self.getView().getModel(MODEL_ENTITY).getProperty("/UserInfo");

              if(!header || header === null)
                return false;
              
              if(!dataRilievoControl || dataRilievoControl.getDateValue() === null || dataRilievoControl.getDateValue() === "" ||
                  !rilievi.Zmotrilievo || rilievi.Zmotrilievo === null || rilievi.Zmotrilievo === ""){
                MessageBox.warning("Alimentare tutti i campi obbligatori", {
                    title: "Esito Operazione",
                    actions: [sap.m.MessageBox.Action.OK],
                    emphasizedAction: MessageBox.Action.OK,
                });    
                return false;
              }

              var nomeRegistrazione = {
                nameFirst: !userInfo || userInfo === null ? null : userInfo.NameFirst,
                nameLast: !userInfo || userInfo === null ? null : userInfo.NameLast,
              };
              self.getView().getModel("temp").setProperty('/nomeRegistrazione', nomeRegistrazione);

              var deepEntity = {
                ZchiaveNi:header.ZchiaveNi,
                HeaderNISet: header,
                RilievoNiSet: null
              }

              var message = "", title="", messageSuccess="";
              switch(header.ZcodiStatoni){
                case "04": //NI In Verifica
                  deepEntity.Funzionalita = "REGISTRAZIONERILIEVOVERIFICA";
                  deepEntity.HeaderNISet.ZcodiStatoni = "04";
                  message = "Sei sicuro di voler registrare il rilievo della Nota d'Imputazione n° " + header.ZchiaveNi + "?";
                  messageSuccess="Rilievo della Nota di Imputazione n."+header.ZchiaveNi+" registrato correttamente";
                  title="Registrazione Rilievo Verifica";
                  deepEntity.HeaderNISet.NProtocolloRag = self.getView().getModel(MODEL_ENTITY).getProperty("/Rilievi/NProtocolloRag");
                  deepEntity.HeaderNISet.ZdataProtRag =  self.getView().getModel(MODEL_ENTITY).getProperty("/Rilievi/ZdataProtRag") && 
                          self.getView().getModel(MODEL_ENTITY).getProperty("/Rilievi/ZdataProtRag") !== null && 
                          self.getView().getModel(MODEL_ENTITY).getProperty("/Rilievi/ZdataProtRag") !== "" ?
                          self.formatter.formateDateForDeep(self.getView().byId("dataProtocolloRGS").getDateValue()):
                          null;
                  deepEntity.RilievoNiSet = {
                    Bukrs: header.Bukrs,
                    Gjahr: header.Gjahr,
                    Zamministr: header.Zamministr,
                    ZidNi: header.ZidNi,
                    ZchiaveNi: header.ZchiaveNi,
                    ZRagioCompe: header.ZRagioCompe,
                    ZdatRilievo: self.getView().getModel(MODEL_ENTITY).getProperty("/Rilievi/ZdatRilievo") && 
                          self.getView().getModel(MODEL_ENTITY).getProperty("/Rilievi/ZdatRilievo") !== null && 
                          self.getView().getModel(MODEL_ENTITY).getProperty("/Rilievi/ZdatRilievo") !== "" ?
                          self.formatter.formateDateForDeep(self.getView().byId("dataRilievo").getDateValue()):
                          null,
                    Zmotrilievo: self.getView().getModel(MODEL_ENTITY).getProperty("/Rilievi/Zmotrilievo")
                  }
                  break;
                case "05": //NI Confermata
                  deepEntity.Funzionalita = "REGISTRAZIONERILIEVOCONFERMATA";
                  deepEntity.HeaderNISet.ZcodiStatoni = "05";
                  message = "Sei sicuro di voler registrare il rilievo della Nota d'Imputazione n° " + header.ZchiaveNi + "?";
                  messageSuccess = "Rilievo della Nota di Imputazione n."+header.ZchiaveNi+" registrato correttamente";
                  title="Registrazione Rilievo Confermata";
                  deepEntity.HeaderNISet.NProtocolloRag = self.getView().getModel(MODEL_ENTITY).getProperty("/Rilievi/NProtocolloRag");
                  deepEntity.HeaderNISet.ZdataProtRag =  self.getView().getModel(MODEL_ENTITY).getProperty("/Rilievi/ZdataProtRag") && 
                          self.getView().getModel(MODEL_ENTITY).getProperty("/Rilievi/ZdataProtRag") !== null && 
                          self.getView().getModel(MODEL_ENTITY).getProperty("/Rilievi/ZdataProtRag") !== "" ?
                          self.formatter.formateDateForDeep(self.getView().byId("dataProtocolloRGS").getDateValue()):
                          null;
                  deepEntity.RilievoNiSet = {
                    Bukrs: header.Bukrs,
                    Gjahr: header.Gjahr,
                    Zamministr: header.Zamministr,
                    ZidNi: header.ZidNi,
                    ZchiaveNi: header.ZchiaveNi,
                    ZRagioCompe: header.ZRagioCompe,
                    ZdatRilievo: self.getView().getModel(MODEL_ENTITY).getProperty("/Rilievi/ZdatRilievo") && 
                          self.getView().getModel(MODEL_ENTITY).getProperty("/Rilievi/ZdatRilievo") !== null && 
                          self.getView().getModel(MODEL_ENTITY).getProperty("/Rilievi/ZdatRilievo") !== "" ?
                          self.formatter.formateDateForDeep(self.getView().byId("dataRilievo").getDateValue()):
                          null,
                    Zmotrilievo: self.getView().getModel(MODEL_ENTITY).getProperty("/Rilievi/Zmotrilievo")
                  }
                  break;
                case "07": //NI con rilievo registrato
                  deepEntity.Funzionalita = "RETTIFICARILIEVO";
                  deepEntity.HeaderNISet.ZcodiStatoni = "07";
                  message = "Sei sicuro di voler rettificare il rilievo della Nota d'Imputazione n° " + header.ZchiaveNi + "?";
                  messageSuccess = "Rilievo della Nota di Imputazione n." + header.ZchiaveNi + " rettificato correttamente";
                  title="Rettifica Rilievo";  
                  deepEntity.RilievoNiSet = rilievi;
                  deepEntity.HeaderNISet.NProtocolloRag = self.getView().getModel(MODEL_ENTITY).getProperty("/Rilievi/NProtocolloRag");
                  deepEntity.HeaderNISet.ZdataProtRag =  self.getView().getModel(MODEL_ENTITY).getProperty("/Rilievi/ZdataProtRag") && 
                          self.getView().getModel(MODEL_ENTITY).getProperty("/Rilievi/ZdataProtRag") !== null && 
                          self.getView().getModel(MODEL_ENTITY).getProperty("/Rilievi/ZdataProtRag") !== "" ?
                          self.formatter.formateDateForDeep(self.getView().byId("dataProtocolloRGS").getDateValue()):
                          null;
                  deepEntity.RilievoNiSet.ZdatRilievo= self.getView().getModel(MODEL_ENTITY).getProperty("/Rilievi/ZdatRilievo") && 
                          self.getView().getModel(MODEL_ENTITY).getProperty("/Rilievi/ZdatRilievo") !== null && 
                          self.getView().getModel(MODEL_ENTITY).getProperty("/Rilievi/ZdatRilievo") !== "" ?
                          self.formatter.formateDateForDeep(self.getView().byId("dataRilievo").getDateValue()):
                          null;
                  deepEntity.RilievoNiSet.Zmotrilievo = self.getView().getModel(MODEL_ENTITY).getProperty("/Rilievi/Zmotrilievo");
                  break;
                default:
                  console.log("default");
              }

              MessageBox.warning(message, {
                title: title,
                actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
                emphasizedAction: MessageBox.Action.YES,
                onClose: function (oAction) {
                    if (oAction === sap.m.MessageBox.Action.YES) {
                      self.getView().setBusy(true);
                        var oModel = self.getOwnerComponent().getModel();
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
                        delete deepEntity.RilievoNiSet.NProtocolloRag;
                        delete deepEntity.RilievoNiSet.ZdataProtRag;
                        oModel.create("/DeepZNIEntitySet", deepEntity, {
                          success: function (data) {
                            self.getView().setBusy(false);
                              if (data.Msgty == 'E') {
                                MessageBox.error(data.Message, {
                                    title: "Esito Operazione",
                                    actions: [sap.m.MessageBox.Action.OK],
                                    emphasizedAction: MessageBox.Action.OK,
                                });
                              }
                              if (data.Msgty == 'S') {
                                  MessageBox.success(messageSuccess, {
                                      title: "Esito Operazione",
                                      actions: [sap.m.MessageBox.Action.OK],
                                      emphasizedAction: MessageBox.Action.OK,
                                      onClose: function (oAction) {
                                          if (oAction === sap.m.MessageBox.Action.OK) {
                                            self.getView().getModel(MODEL_ENTITY).setProperty("/Header",null);
                                            self.getView().getModel(MODEL_ENTITY).setProperty("/RegistrazioneRilievo",[]);
                                            self.getView().getModel(MODEL_ENTITY).setProperty("/UserInfo",null);
                                            self.getView().getModel(MODEL_ENTITY).setProperty("/Rilievi",null);
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

            // onSave_old: function () {
            //     var that = this
            //     var nomeRegistrazione = []

            //     var nome = this.getView().byId("Name").getValue()
            //     var cognome = this.getView().byId("Surname").getValue()

            //     nomeRegistrazione.push(nome)
            //     nomeRegistrazione.push(cognome)

            //     this.getView().getModel("temp").setProperty('/nomeRegistrazione', nomeRegistrazione)

            //     var url = location.href
            //     var sUrl = url.split("/registrazioneRilievo/")[1]
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
            //             if (header[indiceHeader].ZcodiStatoni == "NI In Verifica") {

            //                 var deepEntity = {
            //                     HeaderNISet: null,
            //                     RilievoNiSet: null,
            //                     Funzionalita: 'REGISTRAZIONERILIEVOVERIFICA',
            //                 }

            //                 //var statoNI = this.getView().byId("idModificaDettaglio").mBindingInfos.items.binding.oModel.oZcodiStatoni
            //                 MessageBox.warning("Sei sicuro di voler registrare il rilievo della Nota d'Imputazione n° " + header[indiceHeader].ZchiaveNi + "?", {
            //                     title: "Registrazione Rilievo Verifica",
            //                     actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
            //                     emphasizedAction: MessageBox.Action.YES,
            //                     onClose: function (oAction) {
            //                         if (oAction === sap.m.MessageBox.Action.YES) {
            //                             var oModel = that.getOwnerComponent().getModel();

            //                             deepEntity.ZchiaveNi = that.getView().byId("numNI1").mProperties.text
            //                             //deepEntity.ZchiaveNi = header[indice]

            //                             deepEntity.HeaderNISet = header[indiceHeader];
            //                             deepEntity.HeaderNISet.ZcodiStatoni = "04"
            //                             //deepEntity.RilievoNiSet.ZdatRilievo = that.getView().byId("dataRilievo").mProperties.dateValue

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

            //                             if (that.getView().byId("numProtocolloRGS").getValue() != '') {
            //                                 deepEntity.HeaderNISet.NProtocolloRag = that.getView().byId("numProtocolloRGS").getValue()
            //                             }

            //                             if (that.getView().byId("dataProtocolloRGS").getValue() != '') {
            //                                 var numeri = that.getView().byId("dataProtocolloRGS").getValue().split("/");
            //                                 var nData = (numeri[1] + "/" + numeri[0] + "/" + numeri[2])
            //                                 var dataProvaUTC = new Date(nData)
            //                                 var anno = dataProvaUTC.getUTCFullYear()
            //                                 var nData = (anno + "-" + numeri[1] + "-" + numeri[0])
            //                                 var dataNuova = new Date(nData)

            //                                 deepEntity.HeaderNISet.ZdataProtRag = dataNuova
            //                             }
            //                             //deepEntity.RilievoNiSet.ZzMotrilievo = that.getView().byId("motivizioneRilievo").getValue()

            //                             deepEntity.RilievoNiSet = {
            //                                 Bukrs: header[indiceHeader].Bukrs,
            //                                 Gjahr: header[indiceHeader].Gjahr,
            //                                 Zamministr: header[indiceHeader].Zamministr,
            //                                 ZidNi: header[indiceHeader].ZidNi,
            //                                 ZchiaveNi: header[indiceHeader].ZchiaveNi,
            //                                 ZRagioCompe: header[indiceHeader].ZRagioCompe,
            //                                 //ZdatRilievo: that.getView().byId("dataRilievo").mProperties.dateValue,
            //                                 Zmotrilievo: that.getView().byId("motivizioneRilievo").getValue()
            //                             }

            //                             var numeri = that.getView().byId("dataRilievo").getValue().split("/");
            //                             var nData = (numeri[1] + "/" + numeri[0] + "/" + numeri[2])
            //                             var dataProvaUTC = new Date(nData)
            //                             var anno = dataProvaUTC.getUTCFullYear()
            //                             var nData = (anno + "-" + numeri[1] + "-" + numeri[0])
            //                             var dataNuova = new Date(nData)

            //                             deepEntity.RilievoNiSet.ZdatRilievo = dataNuova

            //                             oModel.create("/DeepZNIEntitySet", deepEntity, {
            //                                 //urlParameters: {'funzionalita': 'ANNULLAMENTOPREIMPOSTATA'},
            //                                 // method: "PUT",
            //                                 success: function (data) {
            //                                     if (data.Msgty == 'E') {
            //                                         console.log(data.Message)
            //                                         MessageBox.error("Operazione non eseguita", {
            //                                             title: "Esito Operazione",
            //                                             actions: [sap.m.MessageBox.Action.OK],
            //                                             emphasizedAction: MessageBox.Action.OK,
            //                                         })
            //                                     }
            //                                     if (data.Msgty == 'S') {
            //                                         MessageBox.success("Rilievo della Nota di Imputazione n."+header[indiceHeader].ZchiaveNi+" registrato correttamente", {
            //                                             title: "Esito Operazione",
            //                                             actions: [sap.m.MessageBox.Action.OK],
            //                                             emphasizedAction: MessageBox.Action.OK,
            //                                             onClose: function (oAction) {
            //                                                 if (oAction === sap.m.MessageBox.Action.OK) {
            //                                                     that.getOwnerComponent().getRouter().navTo("View1");
            //                                                     location.reload();
            //                                                 }
            //                                             }
            //                                         })
            //                                     }
            //                                 },
            //                                 error: function (e) {
            //                                     //console.log("error");
            //                                     MessageBox.error("Operazione non eseguita", {
            //                                         title: "Esito Operazione",
            //                                         actions: [sap.m.MessageBox.Action.OK],
            //                                         emphasizedAction: MessageBox.Action.OK,
            //                                     })
            //                                 }
            //                             });

            //                         }
            //                     }
            //                 });
            //             }
            //             else if (header[indiceHeader].ZcodiStatoni == "NI Confermata") {

            //                 var deepEntity = {
            //                     HeaderNISet: null,
            //                     RilievoNiSet: null,
            //                     Funzionalita: 'REGISTRAZIONERILIEVOCONFERMATA',
            //                 }

            //                 //var statoNI = this.getView().byId("idModificaDettaglio").mBindingInfos.items.binding.oModel.oZcodiStatoni
            //                 MessageBox.warning("Sei sicuro di voler registrare il rilievo della Nota d'Imputazione n° " + header[i].ZchiaveNi + "?", {
            //                     title: "Registrazione Rilievo Confermata",
            //                     actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
            //                     emphasizedAction: MessageBox.Action.YES,
            //                     onClose: function (oAction) {
            //                         if (oAction === sap.m.MessageBox.Action.YES) {
            //                             var oModel = that.getOwnerComponent().getModel();

            //                             deepEntity.ZchiaveNi = that.getView().byId("numNI1").mProperties.text
            //                             //deepEntity.ZchiaveNi = header[indice]

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

            //                             //deepEntity.RilievoNiSet.ZdatRilievo = that.getView().byId("dataRilievo").mProperties.dateValue
            //                             if (that.getView().byId("numProtocolloRGS").getValue() != '') {
            //                                 deepEntity.HeaderNISet.NProtocolloRag = that.getView().byId("numProtocolloRGS").getValue()
            //                             }

            //                             if (that.getView().byId("dataProtocolloRGS").getValue() != '') {
            //                                 var numeri = that.getView().byId("dataProtocolloRGS").getValue().split("/");
            //                                 var nData = (numeri[1] + "/" + numeri[0] + "/" + numeri[2])
            //                                 var dataProvaUTC = new Date(nData)
            //                                 var anno = dataProvaUTC.getUTCFullYear()
            //                                 var nData = (anno + "-" + numeri[1] + "-" + numeri[0])
            //                                 var dataNuova = new Date(nData)

            //                                 deepEntity.HeaderNISet.ZdataProtRag = dataNuova
            //                             }
            //                             //deepEntity.RilievoNiSet.ZzMotrilievo = that.getView().byId("motivizioneRilievo").getValue()ù

            //                             deepEntity.RilievoNiSet = {
            //                                 Bukrs: header[indiceHeader].Bukrs,
            //                                 Gjahr: header[indiceHeader].Gjahr,
            //                                 Zamministr: header[indiceHeader].Zamministr,
            //                                 ZidNi: header[indiceHeader].ZidNi,
            //                                 ZchiaveNi: header[indiceHeader].ZchiaveNi,
            //                                 ZRagioCompe: header[indiceHeader].ZRagioCompe,
            //                                 ZdatRilievo: that.getView().byId("dataRilievo").mProperties.dateValue,
            //                                 Zmotrilievo: that.getView().byId("motivizioneRilievo").getValue()
            //                             }


            //                             oModel.create("/DeepZNIEntitySet", deepEntity, {
            //                                 //urlParameters: {'funzionalita': 'ANNULLAMENTOPREIMPOSTATA'},
            //                                 // method: "PUT",
            //                                 success: function (data) {
            //                                     if (data.Msgty == 'E') {
            //                                         console.log(data.Message)
            //                                         MessageBox.error("Operazione non eseguita", {
            //                                             title: "Esito Operazione",
            //                                             actions: [sap.m.MessageBox.Action.OK],
            //                                             emphasizedAction: MessageBox.Action.OK,
            //                                         })
            //                                     }
            //                                     if (data.Msgty == 'S') {
            //                                         MessageBox.success("Rilievo della Nota di Imputazione n."+header[indiceHeader].ZchiaveNi+" registrato correttamente", {
            //                                             title: "Esito Operazione",
            //                                             actions: [sap.m.MessageBox.Action.OK],
            //                                             emphasizedAction: MessageBox.Action.OK,
            //                                             onClose: function (oAction) {
            //                                                 if (oAction === sap.m.MessageBox.Action.OK) {
            //                                                     that.getOwnerComponent().getRouter().navTo("View1");
            //                                                     location.reload();
            //                                                 }
            //                                             }
            //                                         })
            //                                     }
            //                                 },
            //                                 error: function (e) {
            //                                     //console.log("error");
            //                                     MessageBox.error("Operazione non eseguita", {
            //                                         title: "Esito Operazione",
            //                                         actions: [sap.m.MessageBox.Action.OK],
            //                                         emphasizedAction: MessageBox.Action.OK,
            //                                     })
            //                                 }
            //                             });

            //                         }
            //                     }
            //                 });
            //             }
            //             else if (header[indiceHeader].ZcodiStatoni == "NI con Rilievo Registrato") {

            //                 var deepEntity = {
            //                     HeaderNISet: null,
            //                     RilievoNiSet: null,
            //                     Funzionalita: 'RETTIFICARILIEVO',
            //                 }

            //                 //var statoNI = this.getView().byId("idModificaDettaglio").mBindingInfos.items.binding.oModel.oZcodiStatoni
            //                 MessageBox.warning("Sei sicuro di voler rettificare il rilievo della Nota d'Imputazione n° " + header[i].ZchiaveNi + "?", {
            //                     title: "Rettifica Rilievo",
            //                     actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
            //                     emphasizedAction: MessageBox.Action.YES,
            //                     onClose: function (oAction) {
            //                         if (oAction === sap.m.MessageBox.Action.YES) {
            //                             var oModel = that.getOwnerComponent().getModel();

            //                             deepEntity.ZchiaveNi = that.getView().byId("numNI1").mProperties.text
            //                             //deepEntity.ZchiaveNi = header[indice]
            //                             deepEntity.HeaderNISet = header[indiceHeader];

            //                             deepEntity.HeaderNISet.ZcodiStatoni = "07"

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

            //                             // deepEntity.HeaderNISet.NProtocolloRag = that.getView().byId("numProtocolloRGS").getValue()
            //                             // deepEntity.HeaderNISet.ZdataProtRag = new Date(that.getView().byId("dataProtocolloRGS").getValue())


            //                             var rilievi = that.getView().getModel("temp").getData().Rilievi

            //                             deepEntity.RilievoNiSet = rilievi

            //                             //deepEntity.RilievoNiSet.ZdatRilievo = new Date(that.getView().byId("dataRilievo").getValue())
            //                             deepEntity.RilievoNiSet.Zmotrilievo = that.getView().byId("motivizioneRilievo").getValue()


            //                             oModel.create("/DeepZNIEntitySet", deepEntity, {
            //                                 //urlParameters: {'funzionalita': 'ANNULLAMENTOPREIMPOSTATA'},
            //                                 // method: "PUT",
            //                                 success: function (data) {
            //                                     if (data.Msgty == 'E') {
            //                                         console.log(data.Message)
            //                                         MessageBox.error("Operazione non eseguita", {
            //                                             title: "Esito Operazione",
            //                                             actions: [sap.m.MessageBox.Action.OK],
            //                                             emphasizedAction: MessageBox.Action.OK,
            //                                         })
            //                                     }
            //                                     if (data.Msgty == 'S') {
            //                                         MessageBox.success("Rilievo della Nota di Imputazione n."+header[indiceHeader].ZchiaveNi+" rettificato", {
            //                                             title: "Esito Operazione",
            //                                             actions: [sap.m.MessageBox.Action.OK],
            //                                             emphasizedAction: MessageBox.Action.OK,
            //                                             onClose: function (oAction) {
            //                                                 if (oAction === sap.m.MessageBox.Action.OK) {
            //                                                     that.getOwnerComponent().getRouter().navTo("View1");
            //                                                     location.reload();
            //                                                 }
            //                                             }
            //                                         })
            //                                     }
            //                                 },
            //                                 error: function (e) {
            //                                     //console.log("error");
            //                                     MessageBox.error("Operazione non eseguita", {
            //                                         title: "Esito Operazione",
            //                                         actions: [sap.m.MessageBox.Action.OK],
            //                                         emphasizedAction: MessageBox.Action.OK,
            //                                     })
            //                                 }
            //                             });

            //                         }
            //                     }
            //                 });
            //             }
            //         }
            //     }
            // },
        });
    }
);
