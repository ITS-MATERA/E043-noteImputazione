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
    function (BaseController, Filter, FilterOperator, MessageBox, History, DateFormatter,JSONModel) {
        "use strict";
        const MODEL_ENTITY = "EntityModel";
        return BaseController.extend("project1.controller.modificaImporto", {
            formatter: DateFormatter,
            onInit() {
                // this.onModificaNI()//TODO:da canc
                var oModelJson = new JSONModel({
                    Header:null,
                    PositionNIMI:[]              
                });        

                var input = this.getView().byId("modificaImportoInput"); 
                input.attachBrowserEvent("keypress",this.formatter.acceptOnlyNumbers);


                this.getView().setModel(oModelJson,MODEL_ENTITY); 
                this.getOwnerComponent().getModel("temp");
                this.getRouter().getRoute("modificaImporto").attachPatternMatched(this._onObjectMatched, this);
            },

            onBackButton: function () {
                var self= this;
                // self.getView().byId("PositionNIMI").destroyItems();//TODO:da canc
                self.getView().getModel(MODEL_ENTITY).setProperty("/Header",null);
                self.getView().getModel(MODEL_ENTITY).setProperty("/PositionNIMI",[]);
                window.history.go(-1);
            },

            _onObjectMatched:function(oEvent){
                var self = this,
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
                                self.getView().getModel(MODEL_ENTITY).setProperty("/Header",data);
                                self.onModificaNISet(data, function(callback){
                                    if(callback.success){
                                        self.getView().getModel(MODEL_ENTITY).setProperty("/PositionNIMI",callback.data);
                                        if(callback.data.length>0){
                                            var item = callback.data[0];
                                            self.getView().getModel(MODEL_ENTITY).setProperty("/Header/ZcompRes",item.ZcompRes);
                                        }
                                    }
                                    else{
                                        self.getView().getModel(MODEL_ENTITY).setProperty("/PositionNIMI",callback.data);
                                        self.getView().setBusy(false);
                                    }
                                });
                                self.getView().setBusy(false);

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
                    filters = [];
                filters.push(new Filter({path: "Bukrs",operator: FilterOperator.EQ,value1: entityHeader.Bukrs}));
                filters.push(new Filter({path: "Gjahr",operator: FilterOperator.EQ,value1: entityHeader.Gjahr}));
                filters.push(new Filter({path: "Zamministr",operator: FilterOperator.EQ,value1: entityHeader.Zamministr}));
                filters.push(new Filter({path: "ZchiaveNi",operator: FilterOperator.EQ,value1: entityHeader.ZchiaveNi}));
                filters.push(new Filter({path: "ZRagioCompe",operator: FilterOperator.EQ,value1: entityHeader.ZRagioCompe}));

                self.getOwnerComponent().getModel().read("/PositionNISet", {
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

            onUpdateImporto: function () {
                var self =this,
                    oModel = self.getView().getModel(),
                    array = self.getView().getModel(MODEL_ENTITY).getProperty("/PositionNIMI");
                    
                var deepEntity = {
                    Funzionalita: 'RETTIFICANIPREIMPOSTATA',
                    PositionNISet: []
                };

                MessageBox.warning("Sei sicuro di voler modificare la NI?", {
                    title: "Salvataggio Modifiche NI",
                    actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
                    emphasizedAction: MessageBox.Action.YES,
                    onClose: function (oAction) {
                        if (oAction === sap.m.MessageBox.Action.YES) {
                            var errMessage="";
                            for (var i = 0; i < array.length; i++) {
                                var item = array[i];
                                
                                deepEntity.Bukrs = item.Bukrs;
                                deepEntity.Gjahr = item.Gjahr;
                                deepEntity.Zamministr = item.Zamministr;
                                deepEntity.ZchiaveNi = item.ZchiaveNi;
                                deepEntity.ZidNi = item.ZidNi;
                                deepEntity.ZRagioCompe = item.ZRagioCompe;
                                deepEntity.Operation = "U";
                                

                                if(parseFloat(item.ZimpoTitolo) > parseFloat(item.ZimpoRes)){
                                    i = array.length;
                                    errMessage = "L'importo del titolo non può superare l'importo residuo";
                                    continue;
                                }
                                else if(parseFloat(item.ZimpoTitolo) <= 0){
                                    i = array.length;
                                    errMessage = "Inserire un importo valido";
                                    continue;
                                }

                                deepEntity.PositionNISet.push({
                                    ZposNi: item.ZposNi,
                                    Bukrs: item.Bukrs,
                                    Gjahr: item.Gjahr,
                                    Zamministr: item.Zamministr,
                                    ZchiaveNi: item.ZchiaveNi,
                                    ZidNi: item.ZidNi,
                                    ZRagioCompe: item.ZRagioCompe,
                                    ZimpoTitolo: item.ZimpoTitolo
                                });
                            }
                            if(errMessage!==""){
                                MessageBox.error(errMessage, {
                                    actions: [sap.m.MessageBox.Action.OK],
                                    emphasizedAction: MessageBox.Action.OK,
                                });
                                return;
                            }
                            else{
                                oModel.create("/DeepPositionNISet", deepEntity, {
                                    success: function (result) {
                                        MessageBox.success("Nota di Imputazione n." + item.ZchiaveNi + " rettificata correttamente", {
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
                                        console.log(e);//TODO:da canc
                                        MessageBox.error("Modifica Importo non eseguito", {
                                            title: "Esito Operazione",
                                            actions: [sap.m.MessageBox.Action.OK],
                                            emphasizedAction: MessageBox.Action.OK,
                                        });
                                    }
                                });
                            }
                        }
                    }
                });
            },

        });
    }
);