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
