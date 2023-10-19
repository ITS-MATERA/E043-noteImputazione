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
                self.callVisibilità();
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
                    if (data[d].ACTV_1 === "Z01") {
                        this.getView().byId("pressAssImpegno").setEnabled(true);
                    }
                    if (data[d].ACTV_2 === "Z02") {
                        this.getView().byId("rettificaNI").setEnabled(true);
                    }
                    if (data[d].ACTV_4 === "Z07") {
                        this.getView().byId("AnnullaNI").setEnabled(true);
                    }
                    if (data[d].ACTV_4 === "Z21") {
                        this.getView().byId("idFascicoloIconTab").setEnabled(true);
                    }
                }
            },

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
                this.getView().byId("HeaderITB").destroyItems();                
                this.getView().byId("editImporto").setEnabled(false);
                this.getView().byId("editRow").setEnabled(false);
                this.getView().byId("addRow").setEnabled(false);
                this.getView().byId("deleteRow").setEnabled(false);
                this.getView().byId("pressAssImpegno").setEnabled(true);
                self.getView().getModel(MODEL_ENTITY).setProperty("/Header",null);
                self.getView().getModel(MODEL_ENTITY).setProperty("/PositionNI",[]);
                self.getView().byId("HeaderITB").removeSelections(true);
                self.getOwnerComponent().getRouter().navTo("View1");
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

            pressRettificaNI: function () {
                this.getView().byId("editImporto").setEnabled(true);
                this.getView().byId("editRow").setEnabled(true);
                this.getView().byId("addRow").setEnabled(true);
                this.getView().byId("deleteRow").setEnabled(true);
                // this.getView().byId("pressAssImpegno").setEnabled(false);
            },

            onDeleteRow: function (oEvent) {
              var self = this,
                header = self.getView().getModel(MODEL_ENTITY).getProperty("/Header"),
                oModel = self.getOwnerComponent().getModel(),
                oTable = self.getView().byId("HeaderITB"),
                selectedPosition = oTable.getSelectedContextPaths();

              if(selectedPosition.length === 0){
                MessageBox.warning("Selezionare almeno una riga da eliminare", {
                  title: "Esito Operazione",
                  actions: [sap.m.MessageBox.Action.OK],
                  emphasizedAction: MessageBox.Action.OK,
                });
                return false;
              }

              if(selectedPosition.length === oTable.getItems().length){
                MessageBox.warning("Per cancellare tutte le posizioni in elaborazione, procedere con l’annullamento della Nota", {
                  title: "Esito Operazione",
                  actions: [sap.m.MessageBox.Action.OK],
                  emphasizedAction: MessageBox.Action.OK,
                });
                return false;
              }

              var deepEntity = {
                Bukrs:header.Bukrs,
                Gjahr:header.Gjahr,
                Zamministr:header.Zamministr,
                ZchiaveNi:header.ZchiaveNi,
                ZidNi:header.ZidNi,
                ZRagioCompe:header.ZRagioCompe,
                Operation:"D",
                Funzionalita: 'RETTIFICANIPREIMPOSTATA',
                PositionNISet: []
              }
            
              for (var i = 0; i < selectedPosition.length; i++) {
                var item = self.getView().getModel(MODEL_ENTITY).getObject(selectedPosition[i]);
                deepEntity.PositionNISet.push({
                    ZposNi: item.ZposNi,
                    Bukrs: item.Bukrs,
                    Gjahr: item.Gjahr,
                    Zamministr: item.Zamministr,
                    ZchiaveNi: item.ZchiaveNi,
                    ZidNi: item.ZidNi,
                    ZRagioCompe: item.ZRagioCompe,
                });
              }

              MessageBox.warning("Sei sicuro di voler rettificare la Nota d'Imputazione n° " + header.ZchiaveNi + "?", {
                title: "Elimina Riga",
                actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
                emphasizedAction: MessageBox.Action.YES,
                onClose: function (oAction) {
                    if (oAction === sap.m.MessageBox.Action.YES) {
                      oModel.create("/DeepPositionNISet", deepEntity, {
                          success: function (result) {
                              if (result.Msgty == 'E') {
                                  console.log(result.Message)//TODO:da canc
                                  MessageBox.error("Operazione eseguita non correttamente", {
                                      title: "Esito Operazione",
                                      actions: [sap.m.MessageBox.Action.OK],
                                      emphasizedAction: MessageBox.Action.OK,
                                  })
                              }
                              if (result.Msgty == 'S') {
                                  MessageBox.success("Nota di Imputazione n."+item.ZchiaveNi+" rettificata correttamente", {
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
                              }
                          },
                          error: function (e) {
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
                            deepEntity.ZchiaveNi = header.ZchiaveNi;
                            deepEntity.HeaderNISet = header;
                            deepEntity.HeaderNISet.ZcodiStatoni = "00";

                            oModel.create("/DeepZNIEntitySet", deepEntity, {
                                success: function (data) {

                                    if(data.Msgty!=="E"){
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
                                        });
                                    }
                                    else{
                                        MessageBox.error(data.Message, {
                                            title: "Esito Operazione",
                                            actions: [sap.m.MessageBox.Action.OK],
                                            emphasizedAction: MessageBox.Action.OK,
                                            onClose: function (oAction) {}
                                        });
                                    }
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

        })

    });
