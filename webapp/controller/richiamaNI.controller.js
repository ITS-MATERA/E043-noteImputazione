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
        return BaseController.extend("project1.controller.richiamaNI", {
            formatter: DateFormatter,
            onInit() {

                var oProprietà = new JSONModel(),
                    oInitialModelState = Object.assign({}, oData);
                oProprietà.setData(oInitialModelState);
                var oModelJson = new JSONModel({
                    Header:null,
                    RichiamaNI:[],
                    // Rilievi:null,
                    // UserInfo:null         
                });     
                this.getView().setModel(oModelJson,MODEL_ENTITY);

                this.getView().setModel(oProprietà);
                this.getOwnerComponent().getModel("temp");
                // this.callVisibilità()
                this.getRouter().getRoute("richiamaNI").attachPatternMatched(this._onObjectMatched, this);
            },
            
            pulsantiVisibiltà: function (data) {
                for (var d = 0; d < data.length; d++) {
                    if (data[d].ACTV_4 == "Z11") {
                        this.getView().byId("Conferma").setEnabled(true);
                    }
                    if (data[d].ACTV_4 == "Z17") {
                        this.getView().byId("richiama").setEnabled(true);
                    }
                    if (data[d].ACTV_4 == "Z18") {
                        this.getView().byId("RegistraRilievoNI").setEnabled(true);
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
                            self.getView().getModel(MODEL_ENTITY).setProperty("/RichiamaNI",callback.data);
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
                              self.getView().getModel(MODEL_ENTITY).setProperty("/RichiamaNI",callback.data);
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

            onSelect: function (oEvent) {
                var key = oEvent.getParameters().key;
                if (key === "ListaDettagli") {
                    this.getView().byId("richiamaNIITB").destroyContent()
                }
                else if (key === "Workflow") {
                    this.getView().byId("richiamaNIITB").destroyContent()
                }
                else if (key === "Fascicolo") {
                }
            },

            onBackButton: function () {
              var self =this;
              self.getView().getModel(MODEL_ENTITY).setProperty("/Header",null);
              self.getView().getModel(MODEL_ENTITY).setProperty("/RichiamaNI",[]);
              window.history.go(-1);
            },

            onRegistraRilievo:function(oEvent){
              var self =this,
                header= self.getView().getModel(MODEL_ENTITY).getProperty("/Header");
              
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

            onConfermaNI:function(oEvent){
              var self =this,
                header= self.getView().getModel(MODEL_ENTITY).getProperty("/Header");
              
              if(!header || header === null)
                return false;
              
              var deepEntity = {
                ZchiaveNi: header.ZchiaveNi,
                HeaderNISet: header,
                Funzionalita: 'CONFERMA',
              }; 

              MessageBox.warning("Sei sicuro di voler confermare la Nota d'Imputazione n° " + header.ZchiaveNi + "?", {
              title: "Conferma",
              actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
              emphasizedAction: MessageBox.Action.YES,
              onClose: function (oAction) {
                  if (oAction === sap.m.MessageBox.Action.YES) {
                    self.getView().setBusy(true);
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
                            MessageBox.success("Nota di Imputazione "+header.ZchiaveNi+" confermata correttamente", {
                                title: "Esito Operazione",
                                actions: [sap.m.MessageBox.Action.OK],
                                emphasizedAction: MessageBox.Action.OK,
                                onClose: function (oAction) {
                                  if (oAction === sap.m.MessageBox.Action.OK) {
                                    self.getView().getModel(MODEL_ENTITY).setProperty("/Header",null);
                                    self.getView().getModel(MODEL_ENTITY).setProperty("/RichiamaNI",[]);
                                    self.getOwnerComponent().getRouter().navTo("View1");
                                    location.reload();
                                  }
                                }
                            });
                          }
                      },
                      error: function (e) {
                        self.getView().setBusy(false);
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

            onRichiamaNI:function(oEvent){
              var self =this,
                header = self.getView().getModel(MODEL_ENTITY).getProperty("/Header");

              if(!header || header === null)
                return false;
              
              var deepEntity = {
                ZchiaveNi: header.ZchiaveNi,
                HeaderNISet: header,
                Funzionalita: 'RICHIAMOVERIFICA',
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
                        deepEntity.HeaderNISet.Zmotrichiamo = Core.byId("submissionNote").getValue();
                        oModel.create("/DeepZNIEntitySet", deepEntity, {
                          success: function (data) {
                            if (data.Msgty == 'E') {
                              MessageBox.error(data.Message, {
                                title: "Esito Operazione",
                                actions: [sap.m.MessageBox.Action.OK],
                                emphasizedAction: MessageBox.Action.OK,
                              });
                              self.oSubmitDialog.getContent()[0].setValue(null)
                              return false;
                            }
                            if (data.Msgty == 'S') {
                                MessageBox.success("Nota di Imputazione n°" + deepEntity.HeaderNISet.ZchiaveNi + " richiamata correttamente", {
                                  title: "Esito Operazione",
                                  actions: [sap.m.MessageBox.Action.OK],
                                  emphasizedAction: MessageBox.Action.OK,
                                  onClose: function (oAction) {
                                      if (oAction === sap.m.MessageBox.Action.OK) {
                                        self.getView().getModel(MODEL_ENTITY).setProperty("/Header",null);
                                        self.getView().getModel(MODEL_ENTITY).setProperty("/RichiamaNI",[]);
                                        self.getOwnerComponent().getRouter().navTo("View1");
                                        self.oSubmitDialog.getContent()[0].setValue(null)
                                        location.reload();
                                      }
                                  }
                                })
                            }
                          },
                          error: function (e) {
                            console.log(e);//TODO:da canc
                            MessageBox.error("Operazione non eseguita");      
                            self.oSubmitDialog.getContent()[0].setValue(null)                      
                          }
                        });
                        this.oSubmitDialog.close();
                      }.bind(this)
                  }),
                  endButton: new Button({
                      text: "Annulla",
                      press: function () {
                          this.oSubmitDialog.close();
                      }.bind(this)
                  })
                });
              }
              this.oSubmitDialog.open();
            }

        });
    }
);
