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
        return BaseController.extend("project1.controller.modificaDettaglio", {
            formatter: DateFormatter,
            onInit() {
                var self =this;
                // this.onModificaNI()
                var oModelJson = new JSONModel({
                    Header:null,
                    PositionNIMI:[]              
                });     
                self.getOwnerComponent().getModel("temp");
                self.getView().setModel(oModelJson,MODEL_ENTITY); 
                self.getRouter().getRoute("modificaDettaglio").attachPatternMatched(self._onObjectMatched, self);
            },

            onBackButton: function () {
                var self = this;
                // this.getView().byId("idModificaDettaglio").destroyItems() //TODO:da canc
                self.getView().getModel(MODEL_ENTITY).setProperty("/Header",null);
                self.getView().getModel(MODEL_ENTITY).setProperty("/PositionNIMI",[]);
                window.history.go(-1);
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
                            self.loadView(path);                      
                        }
                    });    
                }
                else{
                    self.loadView(path);
                }    
            },

            loadView:function(path){
                var self =this,
                    oDataModel = self.getOwnerComponent().getModel();
                self.getOwnerComponent().getModel().metadataLoaded().then(function() {
                    oDataModel.read("/" + path, {
                        success: function(data, oResponse){
                            self.getView().getModel(MODEL_ENTITY).setProperty("/Header",data);
                            self.getView().getModel(MODEL_ENTITY).setProperty("/PositionNIMI",[data]);
                            self.onModificaNISet(data, function(callback){
                                if(callback.success){
                                    if(callback.data.length>0){
                                        var item = callback.data[0];
                                        self.getView().getModel(MODEL_ENTITY).setProperty("/Header/ZcompRes",item.ZcompRes);
                                    }
                                    self.getView().setBusy(false);
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
                        console.log(data.results);
                        callback({success:true,data:data.results});  
                    },
                    error: function (error) {
                        console.log(error);
                        callback({success:false,data:[]});                        
                    }
                });
            },

            onSaveDati: function () {
                var self =this,
                    oModel = self.getView().getModel(),
                    array = self.getView().getModel(MODEL_ENTITY).getProperty("/PositionNIMI");

                if(array.length===0)
                    return false;

                MessageBox.warning("Sei sicuro di voler modificare la NI?", {
                    title:"Salvataggio Modifiche NI",
                    actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
                    emphasizedAction: MessageBox.Action.YES,
                    onClose: function (oAction) {
                        if (oAction === sap.m.MessageBox.Action.YES) {
                            var item = array[0];
                            var path = oModel.createKey("/HeaderNISet", {
                                Bukrs:item.Bukrs,
                                Gjahr:item.Gjahr,
                                Zamministr:item.Zamministr,
                                ZchiaveNi:item.ZchiaveNi,
                                ZidNi:item.ZidNi,
                                ZRagioCompe:item.ZRagioCompe,
                                Funzionalita: 'RETTIFICANIPREIMPOSTATA'
                            });
                            var oEntry = {
                                ZoggSpesa: item.ZoggSpesa,
                                ZdataModiNi: new Date()
                            };

                            oModel.update(path, oEntry, {
                                success: function (data) {
                                    MessageBox.success("Nota di Imputazione n."+ item.ZchiaveNi +" rettificata correttamente", {
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
                                },
                                error: function (e) {
                                    console.log(e);
                                    MessageBox.error("Operazione non eseguita", {
                                        title:"Esito Operazione",
                                        actions: [sap.m.MessageBox.Action.OK],
                                        emphasizedAction: MessageBox.Action.OK,
                                    })
                                }
                            });                                    
                        }
                    }
                });
            },

        });
    }
);