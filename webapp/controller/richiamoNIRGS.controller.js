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
        return BaseController.extend("project1.controller.richiamoNIRGS", {
            formatter: DateFormatter,
            onInit() {

                var oProprietà = new JSONModel(),
                    oInitialModelState = Object.assign({}, oData);
                oProprietà.setData(oInitialModelState);
                this.getView().setModel(oProprietà);
                this.getOwnerComponent().getModel("temp");
                this.callVisibilità();

              var oModelJson = new JSONModel({
                Header:null,
                PositionNI:[]              
              });        

              this.getView().setModel(oModelJson,MODEL_ENTITY); 
              this.getRouter().getRoute("richiamoNIRGS").attachPatternMatched(this._onObjectMatched, this);

            },


            callVisibilità:function(){
                var self =this,
                    filters = [];
        
                filters.push(
                    new Filter({ path: "SEM_OBJ", operator: FilterOperator.EQ, value1: "ZS4_NOTEIMPUTAZIONI_SRV" }),
                    new Filter({ path: "AUTH_OBJ", operator: FilterOperator.EQ, value1: "Z_GEST_NI" })
                )
                self.getOwnerComponent().getModel("ZSS4_CA_CONI_VISIBILITA_SRV").read("/ZES_CONIAUTH_SET", {
                    filters: filters,        
                    success: function (data) {
                            self.getView().getModel("temp").setProperty('/Visibilità', data.results);
                            self.pulsantiVisibiltà(data.results);
                        },
                    error: function (error) {
                        console.log(error);
                        var e = error;
                    }   
                });
            },
            
            pulsantiVisibiltà: function (data) {
                for (var d = 0; d < data.length; d++) {
                    if (data[d].ACTV_4 == "Z15" || data[d].ACTV_4 == "Z16") {
                        this.getView().byId("RevocaValidazioneNI").setEnabled(true);
                    }
                    if (data[d].ACTV_4 == "Z17") {
                        this.getView().byId("richiama2").setEnabled(true);
                    }
                    if (data[d].ACTV_4 == "Z21") {
                      this.getView().byId("idFascicoloIconTabFilter").setEnabled(true);
                  }
                }
            },

            _onObjectMatched: function (oEvent) {
                var self = this;
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
                self.loadView(path);
            },

            loadView:function(path){
              var self =this,
                oDataModel = self.getOwnerComponent().getModel();

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
                                  console.log(item);  
                                  self.loadBeneficiario(item.Lifnr);
                                  self.getView().getModel(MODEL_ENTITY).setProperty("/Header/Lifnr",item.Lifnr);                                
                                  self.getView().getModel(MODEL_ENTITY).setProperty("/Header/ModalitaPagamento",item.Zdescwels);
                                  self.getView().getModel(MODEL_ENTITY).setProperty("/Header/Cdc",item.Kostl);
                                  self.getView().getModel(MODEL_ENTITY).setProperty("/Header/Coge",item.Saknr);
                                  self.getView().getModel(MODEL_ENTITY).setProperty("/Header/CodiceGestionale",item.Zcodgest);
                                  self.getView().getModel(MODEL_ENTITY).setProperty("/Header/CausalePagamento",item.Zcauspag);
                                  self.getView().getModel(MODEL_ENTITY).setProperty("/Header/CodiceUfficio",data.ZuffcontFirm);
                                  self.getView().getModel(MODEL_ENTITY).setProperty("/Header/Dirigente",data.ZdirncRich);
                                  self.getView().setBusy(false);
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
                    error:function(error){
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

            onSelect: function (oEvent) {
                var key = oEvent.getParameters().key;
                if (key === "ListaDettagli") {
                    this.getView().byId("richiamaNIRGSITB").destroyContent()
                }
                else if (key === "Workflow") {
                    this.getView().byId("richiamaNIRGSITB").destroyContent()
                }
                else if (key === "Fascicolo") {                }
            },

            onBackButton: function () {
              var self = this;
              self.getView().getModel("temp").setProperty('/PositionNISet', []);
              self.getView().getModel(MODEL_ENTITY).setProperty("/Header",null);
              self.getView().getModel(MODEL_ENTITY).setProperty("/PositionNI",[]);
              self.getOwnerComponent().getRouter().navTo("View1");
            },

            onRevocaValidazione:function(oEvent){
              var self =this,
                header = self.getView().getModel(MODEL_ENTITY).getProperty("/Header");

              MessageBox.warning("Sei sicuro di voler revocare la Nota d'Imputazione n° " + header.ZchiaveNi + "?", {
                title: "Revoca Validazione",
                actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
                emphasizedAction: MessageBox.Action.YES,
                onClose: function (oAction) {
                  if (oAction === sap.m.MessageBox.Action.YES) {
                    var oModel = self.getOwnerComponent().getModel();
                    var deepEntity = {
                      ZchiaveNi: header.ZchiaveNi,                      
                      HeaderNISet: header,
                      Funzionalita: 'REVOCAVALIDAZIONE',
                    };
                    deepEntity.HeaderNISet.ZcodiStatoni = "06";
                    delete deepEntity.HeaderNISet.ZcompRes; 
                    delete deepEntity.HeaderNISet.LifnrDesc;
                    delete deepEntity.HeaderNISet.Lifnr;                                
                    delete deepEntity.HeaderNISet.ModalitaPagamento;
                    delete deepEntity.HeaderNISet.Cdc;
                    delete deepEntity.HeaderNISet.Coge;
                    delete deepEntity.HeaderNISet.CodiceGestionale;
                    delete deepEntity.HeaderNISet.CausalePagamento;
                    delete deepEntity.HeaderNISet.CodiceUfficio;
                    delete deepEntity.HeaderNISet.Dirigente;

                    oModel.create("/DeepZNIEntitySet", deepEntity, {
                      success: function (data) {
                        console.log(data);//TODO:da canc
                        if (data.Msgty == 'E') {
                          MessageBox.error("Operazione non eseguita", {
                              title: "Esito Operazione",
                              actions: [sap.m.MessageBox.Action.OK],
                              emphasizedAction: MessageBox.Action.OK,
                          })
                        }
                        if (data.Msgty == 'S') {
                          MessageBox.success("Validazione Nota di Imputazione n." + header.ZchiaveNi + " revocata correttamente", {
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
                      },
                      error: function (e) {
                          console.log(e);//TODO:da canc
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

            onRichiamaNI:function(oEvent){
              var self = this,
                header = self.getView().getModel(MODEL_ENTITY).getProperty("/Header");

              MessageBox.warning("Sei sicuro di voler richiamare la Nota d'Imputazione n° " + header.ZchiaveNi + "?", {
                title: "Richiamo Nota di Imputazione",
                actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
                emphasizedAction: MessageBox.Action.YES,
                onClose: function (oAction) {
                  if (oAction === sap.m.MessageBox.Action.YES) {
                      self.onSubmitDialogPress(header);
                  }
                }
              });
            },


            onSubmitDialogPress: function (header) {
              var self =this;
              if (!this.oSubmitDialog) {
                self.oSubmitDialog = new Dialog({
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

                      var deepEntity = {
                        ZchiaveNi : header.ZchiaveNi,                        
                        HeaderNISet: header,
                        Funzionalita: 'RICHIAMOVALIDATARGS',
                      }
                      deepEntity.HeaderNISet.ZcodiStatoni = '06';
                      deepEntity.HeaderNISet.Zmotrichiamo = Core.byId("submissionNote").getValue();

                      delete deepEntity.HeaderNISet.ZcompRes; 
                      delete deepEntity.HeaderNISet.LifnrDesc;
                      delete deepEntity.HeaderNISet.Lifnr;                                
                      delete deepEntity.HeaderNISet.ModalitaPagamento;
                      delete deepEntity.HeaderNISet.Cdc;
                      delete deepEntity.HeaderNISet.Coge;
                      delete deepEntity.HeaderNISet.CodiceGestionale;
                      delete deepEntity.HeaderNISet.CausalePagamento;
                      delete deepEntity.HeaderNISet.CodiceUfficio;
                      delete deepEntity.HeaderNISet.Dirigente;

                      var oModel = self.getOwnerComponent().getModel();
                      oModel.create("/DeepZNIEntitySet", deepEntity, {                        
                        success: function (data) {
                          console.log(data);//TODO:da canc
                            if (data.Msgty == 'E') {                                
                                MessageBox.error(data.Message, {
                                    title: "Esito Operazione",
                                    actions: [sap.m.MessageBox.Action.OK],
                                    emphasizedAction: MessageBox.Action.OK,
                                })
                                self.oSubmitDialog.getContent()[0].setValue(null);
                                self.oSubmitDialog.close();
                                return false;
                            }
                            if (data.Msgty == 'S') {
                                MessageBox.success("Nota di Imputazione n°" + header.ZchiaveNi + " richiamata correttamente", {
                                    title: "Esito Operazione",
                                    actions: [sap.m.MessageBox.Action.OK],
                                    emphasizedAction: MessageBox.Action.OK,
                                    onClose: function (oAction) {
                                        if (oAction === sap.m.MessageBox.Action.OK) {
                                            this.getOwnerComponent().getRouter().navTo("View1");
                                            self.oSubmitDialog.getContent()[0].setValue(null);
                                            self.oSubmitDialog.close();
                                            location.reload();
                                        }
                                    }
                                })
                            }
                        },
                        error: function (e) {
                            console.log(e);//TODO:da canc
                            MessageBox.error("Operazione non eseguita");
                            self.oSubmitDialog.getContent()[0].setValue(null);
                            self.oSubmitDialog.close();
                        }
                      });
                    }.bind(this)
                  }),
                  endButton: new Button({
                    text: "Annulla",
                    press: function () {
                        self.oSubmitDialog.close();
                    }.bind(this)
                  })
               });
              }
              self.oSubmitDialog.open();
            },


        });
    }
);
