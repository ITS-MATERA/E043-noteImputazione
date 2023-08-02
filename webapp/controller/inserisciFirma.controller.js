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
        return BaseController.extend("project1.controller.inserisciFirma", {
            formatter: DateFormatter,
            onInit() {
                var oProprietà = new JSONModel(),
                    oInitialModelState = Object.assign({}, oData);

                var oModelJson = new JSONModel({
                    Header:null,
                    Form:{}
                    // Form:{
                    //   CodiceUfficio:null,
                    //   Dirigente:null,
                    //   DataProtocollo:null,
                    //   NumeroProtocollo:null
                    // }         
                });            
                this.getView().setModel(oModelJson,MODEL_ENTITY);     

                oProprietà.setData(oInitialModelState);
                this.getView().setModel(oProprietà);
                this.getOwnerComponent().getModel("temp");
                this.getRouter().getRoute("inserisciFirma").attachPatternMatched(this._onObjectMatched, this);
                //this.ShZdirncRichSet() //TODO:da capire

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
                          // self.getView().getModel(MODEL_ENTITY).setProperty("/HeaderNIM",callback.data);
                          self.getView().getModel("temp").setProperty('/PositionNISet', callback.data);
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
                          self.getView().setBusy(false);                          
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
                          self.prevalorizzaCodiceUfficio();
                          callback({success:true, data:data.results});
                      },
                      error:function (error) {
                          console.log(error);
                          callback({success:false, data:[]});
                      }
                    })
                });    
            },
            
            prevalorizzaCodiceUfficio:function(){
              var self =this,
                  oDataModel = self.getOwnerComponent().getModel();

              self.getOwnerComponent().getModel().metadataLoaded().then(function() {
                oDataModel.read("/ZUffContFirmSet" , {
                  success: function (data) {
                    if(data && data.results && data.results.length>0){
                      self.getView().getModel(MODEL_ENTITY).setProperty("/Form/CodiceUfficio",data.results[0].Fkber); 
                    } 
                    else
                      self.getView().getModel(MODEL_ENTITY).setProperty("/Form/CodiceUfficio",null);   
                  },
                  error:function (error) {
                      console.log(error);
                      self.getView().getModel(MODEL_ENTITY).setProperty("/Form/CodiceUfficio",null);
                  }
                })
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
            //     var sUrl = url.split("/inserisciFirma/")[1]
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
            //             this.getOwnerComponent().setModel(oMdlITB, "HeaderInserisci");

            //         }
            //     }
            // },

            // viewHeader: function (position) {
            //     var url = location.href
            //     var sUrl = url.split("/inserisciFirma/")[1]
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
            //                     this.onCallFornitore()
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


            ShZdirncRichSet: function () {
                var that = this
                var filtriShZdirncRich = []
                var url = location.href
                var sUrl = url.split("/inserisciFirma/")[1]
                var aValori = sUrl.split(",")

                var Bukrs = aValori[0]
                var Gjahr = aValori[1]
                var Zamministr = aValori[2]
                var ZchiaveNi = aValori[3]
                var ZidNi = aValori[4]
                var ZRagioCompe = aValori[5]

                var header = this.getOwnerComponent().getModel("temp").getData().HeaderNISet
                for (var i = 0; i < header.length; i++) {
                    if (header[i].Bukrs == Bukrs &&
                        header[i].Gjahr == Gjahr &&
                        header[i].Zamministr == Zamministr &&
                        header[i].ZchiaveNi == ZchiaveNi &&
                        header[i].ZidNi == ZidNi &&
                        header[i].ZRagioCompe == ZRagioCompe) {

                        filtriShZdirncRich.push(new Filter({
                            path: "Zamministr",
                            operator: FilterOperator.EQ,
                            value1: Zamministr
                        }));
                        filtriShZdirncRich.push(new Filter({
                            path: "ZuffcontFirm",
                            operator: FilterOperator.EQ,
                            value1: "020.0021"
                        }));

                        this.getOwnerComponent().getModel().read("/ShZdirncRichSet", {
                            filters: filtriShZdirncRich,
                            success: function (data) {
                                //oMdlText.setData(data.results);
                                that.getView().getModel("temp").setProperty('/ShZdirncRichSet', data.results)
                            },
                            error: function (error) {
                                var e = error;
                            }
                        });

                    }
                }
            },

            codiceUfficioLiveChange:function(oEvent){
              var self =this,
                value=oEvent.getParameters().value;
                // oController= self.getView().byId(oEvent.getParameters().id);
              self.getView().getModel(MODEL_ENTITY).setProperty("/Form/CodiceUfficio",value);
            },
            
            onConfirm:function(oEvent){
              var self =this,
                header= self.getView().getModel(MODEL_ENTITY).getProperty("/Header"),
                form= self.getView().getModel(MODEL_ENTITY).getProperty("/Form");
               
              if(!form.CodiceUfficio || form.CodiceUfficio === null || form.CodiceUfficio=== "" || 
                !form.Dirigente || form.Dirigente === null || form.Dirigente=== "" || 
                !form.DataProtocollo || form.DataProtocollo === null || form.DataProtocollo=== "" || 
                !form.NumeroProtocollo || form.NumeroProtocollo === null || form.NumeroProtocollo=== ""){
                  MessageBox.error("Inserire i dati per l'invio alla firma", {
                      title:"Esito Operazione",
                      actions: [sap.m.MessageBox.Action.OK],
                      emphasizedAction: MessageBox.Action.OK,
                  });
                  return false;
                }
                var firmaSet={
                  codiceUff: form.CodiceUfficio,
                  dirigente: form.Dirigente,
                  dataProtocollo:form.DataProtocollo,
                  numProtocollo:form.NumeroProtocollo
                };

                self.getView().getModel("temp").setProperty('/firmaSet', firmaSet);
                self.getOwnerComponent().getRouter().navTo("FirmaInserita", 
                  { 
                    campo: header.Bukrs, 
                    campo1: header.Gjahr, 
                    campo2: header.Zamministr, 
                    campo3: header.ZchiaveNi, 
                    campo4: header.ZidNi, 
                    campo5: header.ZRagioCompe 
                  });
            },

            // onConfirm_old: function () {
            //     var firmaSet = []
            //     var codUff = this.getView().byId("codUfficio").getValue()
            //     var dirigente = this.getView().byId("dirigente").getValue()
            //     if (this.getView().byId("DataPro").getValue() != '') {
            //         var dataProtocollo = this.getView().byId("DataPro").getValue()
            //     }
            //     else {
            //         var dataProtocollo = ''
            //     }
            //     if (this.getView().byId("numProtocollo").getValue() != '') {
            //         var numProtocollo = this.getView().byId("numProtocollo").getValue()
            //     }
            //     else {
            //         var numProtocollo = ''
            //     }

            //     firmaSet.push(codUff)
            //     firmaSet.push(dirigente)
            //     firmaSet.push(dataProtocollo)
            //     firmaSet.push(numProtocollo)

            //     this.getView().getModel("temp").setProperty('/firmaSet', firmaSet)

            //     var url = location.href
            //     var sUrl = url.split("/inserisciFirma/")[1]
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
            //             this.getOwnerComponent().getRouter().navTo("FirmaInserita", { campo: header[i].Bukrs, campo1: header[i].Gjahr, campo2: header[i].Zamministr, campo3: header[i].ZchiaveNi, campo4: header[i].ZidNi, campo5: header[i].ZRagioCompe });
            //         }
            //     }
            // },

            onBackButton: function () {
              var self =this;
              var form = {
                CodiceUfficio:null,
                Dirigente:null,
                DataProtocollo:null,
                NumeroProtocollo:null
              };

              self.getView().getModel(MODEL_ENTITY).setProperty("/Header", null);
              self.getView().getModel(MODEL_ENTITY).setProperty("/Form", form);
              self.getView().getModel("temp").setProperty('/firmaSet', null);
              window.history.go(-1);
            },

        });
    }
);
