sap.ui.define([
    "./BaseController",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    'sap/ui/model/json/JSONModel',
    "sap/m/MessageBox",
    'sap/ui/export/Spreadsheet',
    "sap/ui/core/library",
    "project1/model/DateFormatter"
],

    function (BaseController, Filter, FilterOperator, JSONModel, MessageBox, Spreadsheet, CoreLibrary, DateFormatter) {
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
        return BaseController.extend("project1.controller.annullataNI", {
            formatter: DateFormatter,
            onInit() {
                var self=this;
                var oProprietà = new JSONModel(),
                    oInitialModelState = Object.assign({}, oButton);
                oProprietà.setData(oInitialModelState);
                this.getView().setModel(oProprietà);
                this.getOwnerComponent().getModel("temp");
                //this.prePosition()

                var oModelJson = new JSONModel({
                    includeCols:true,
                    Header:null,
                    annullataNI:[]              
                });    
                self.getView().setModel(oModelJson,MODEL_ENTITY); 
                this.getRouter().getRoute("annullataNI").attachPatternMatched(this._onObjectMatched, this);
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
            //     this.callPositionNI(oEvent)
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
                self.getView().setBusy(true);
                if(!self.getOwnerComponent().getModel("temp").getData().Visibilità || 
                    self.getOwnerComponent().getModel("temp").getData().Visibilità === null){
                    self.callPreventVisibilitaWithCallback(function(callback){
                        if(callback){   
                          self.pulsantiVisibiltà(self.getOwnerComponent().getModel("temp").getData().Visibilità);  
                          self.loadView(path);                      
                        }
                    });    
                }
                else{
                  self.pulsantiVisibiltà(self.getOwnerComponent().getModel("temp").getData().Visibilità);
                  self.loadView(path);
                }    
            },

            loadView:function(path){
              var self = this,
                oDataModel = self.getOwnerComponent().getModel();
              self.getOwnerComponent().getModel().metadataLoaded().then(function() {
                  oDataModel.read("/" + path, {
                      success: function(data, oResponse){
                          self.getView().getModel(MODEL_ENTITY).setProperty("/Header",data);
                          self.getPositionNI(data, function(callback){
                            if(callback.success){
                              if(callback.data.length>0){
                                var item = callback.data[0];
                                console.log(item);//TODO:da canc
                                self.getView().getModel(MODEL_ENTITY).setProperty("/Header/ZcompRes",item.ZcompRes);
                                self.getView().getModel(MODEL_ENTITY).setProperty("/includeCols",!item.ZchiaveSubni || item.ZchiaveSubni === null || item.ZchiaveSubni === "" ? false : true );
                                self.getView().getModel(MODEL_ENTITY).setProperty("/annullataNI",callback.data);
                              }
                              self.callWorkflowSet(self.getView().getModel(MODEL_ENTITY).getProperty("/Header"), function(callbackWF){
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

            getPositionNI:function(header,callback){
              var self =this,
                filters = [];
              
              filters.push(new Filter({path: "Bukrs",operator: FilterOperator.EQ,value1: header.Bukrs}));
              filters.push(new Filter({path: "Gjahr",operator: FilterOperator.EQ,value1: header.Gjahr}));
              filters.push(new Filter({path: "Zamministr",operator: FilterOperator.EQ,value1: header.Zamministr}));
              filters.push(new Filter({path: "ZchiaveNi",operator: FilterOperator.EQ,value1: header.ZchiaveNi}));
              filters.push(new Filter({path: "ZidNi",operator: FilterOperator.EQ,value1: header.ZidNi}));
              filters.push(new Filter({path: "ZRagioCompe",operator: FilterOperator.EQ,value1: header.ZRagioCompe}));

              this.getOwnerComponent().getModel().read("/PositionNISet", {
                filters: filters,
                success: function (data) {
                  console.log(data.results);
                  callback({success:true,data:data.results}); 
                },
                error: function (error) {
                  console.log(error);
                  callback({success:false,data:[]});  
                }
              });
            },

            pulsantiVisibiltà: function (data) {
              for (var d = 0; d < data.length; d++) {
                  if (data[d].ACTV_4 == "Z21") {
                    this.getView().byId("idFascicoloIconTabFilter").setEnabled(true);
                }
              }
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
            //     var sUrl = url.split("/annullataNI/")[1]
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
            //                     // for (var dr = 0; dr < data.results.length; dr++) {

            //                     //     var importoPrimaVirgola = data.results[dr].ZimpoTitolo.split(".")
            //                     //     var numPunti = ""
            //                     //     var migliaia = importoPrimaVirgola[0].split('').reverse().join('').match(/.{1,3}/g).map(function (x) {
            //                     //         return x.split('').reverse().join('')
            //                     //     }).reverse()

            //                     //     for (var v = 0; v < migliaia.length; v++) {
            //                     //         numPunti = (numPunti + migliaia[v] + ".")
            //                     //     }

            //                     //     var indice = numPunti.split("").length
            //                     //     var totale = numPunti.substring(0, indice - 1) + "," + importoPrimaVirgola[1]
            //                     //     let array = totale.split(",")
            //                     //     let valoreTagliato = array[1].substring(0, 2)
            //                     //     var totale = array[0] + "," + valoreTagliato
            //                     //     that.getView().byId("annullataNI").getItems()[dr].mAggregations.cells[4].setText(totale)

            //                     // }
            //                     that.viewHeader(data.results)
            //                 },
            //                 error: function (error) {
            //                     var e = error;
            //                 }
            //             });
            //             this.getOwnerComponent().setModel(oMdlITB, "annullataNI");
            //             this.callWorkflow(oEvent)

            //         }
            //     }

            // },

            callWorkflowSet:function(header,callbackWF){
              var self =this,
                  filters = [];

              filters.push(new Filter({path: "ZchiaveNi",operator: FilterOperator.EQ,value1: header.ZchiaveNi}));
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
                    this.getView().byId("annullataNIITB").destroyContent()
                }
                else if (key === "Workflow") {
                    this.getView().byId("annullataNIITB").destroyContent()
                }
                else if (key === "Fascicolo") {
                }
            },

            onBackButton: function () {
              var self =this;
              self.getView().getModel(MODEL_ENTITY).setProperty("/Header",null);
              self.getView().getModel(MODEL_ENTITY).setProperty("/annullataNI",[]);
              window.history.go(-1);
            },
        })

    });
