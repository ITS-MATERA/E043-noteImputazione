sap.ui.define([
    "sap/ui/model/odata/v2/ODataModel",
    "./BaseController",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    'sap/ui/model/json/JSONModel',
    "sap/ui/core/library",
    "project1/model/DateFormatter"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (ODataModel, BaseController, MessageBox, Filter, FilterOperator, JSONModel, CoreLibrary, DateFormatter) {
        "use strict";

        const COMPONENT_MODEL = "componentModel";
        const WIZARD_ENTITIES_MODEL = "wizardEntitiesModel";
        const PREIMPOSTAZIONENI_MODEL = "preimpostazioneModel";

        return BaseController.extend("project1.controller.wizard2", {
            formatter: DateFormatter,
            ZhfTipoKey:"",

            onInit:async function(){
                var self =this;
                self.callVisibilita();
                var input = self.getView().byId("step3Input"); 
                input.attachBrowserEvent("keypress",self.formatter.acceptOnlyNumbers);
                self.loadEsercizioGestione();
                self.loadMese();
                self.loadZcompRes();

                self.loadStrutturaAmministrativa();
                self.loadPosizioneFinanziaria();

                var  oModelJsonPreimpostazioneNi = new JSONModel({
                    ZgjahrEng:"",
                    meseValore:"",
                    meseDescrizione:"",
                    tipologia:"",
                    tipologiaDescrizione:"",
                    sottotipologia:"",
                    sottotipologiaDescrizione:"",
                    competenza:"C",
                    competenzaDescrizione:"Competenza",
                    rendicontazioneSumRowSelected:0,
                    rendicontazioneSumRowSelectedString:"0,00",
                    rendicontazioneRowNum:"0",
                    fistl:"",
                    fipex:"",
                    descrizioneCapitolo:"",
                    descrizionePG:"",
                    oggettoSpesa:"",
                    titoliSelezionati:[],
                    titoliSelezionatiStep3:[]
                });

                var oModelJsonComponent = new JSONModel({
                    headerStep2Visible:false,
                    headerStep3Visible:false,
                    btnPreimpostaNiVisible:false,
                    btnBackVisible:true,
                    btnNextVisible:true
                });    
                
                var oModelJsonEntities = new JSONModel({
                    ZgjahrEngNiSet:[],
                    ZmeseSet:[],
                    RendicontazioneSet:[], //da canc nel reset
                    ZhfTipo:[], //da canc nel reset
                    ZhfSottotipo:[], //da canc nel reset
                    ZcompResNISet:[],
                    FipexNiSet:[],
                    FistlNiSet:[]              
                });        

                self.getView().setModel(oModelJsonPreimpostazioneNi,PREIMPOSTAZIONENI_MODEL); 
                self.getView().setModel(oModelJsonComponent, COMPONENT_MODEL); 
                self.getView().setModel(oModelJsonEntities,WIZARD_ENTITIES_MODEL);
            },

            callVisibilita:function(){
                var self =this,
                    filters = [];
        
                filters.push(
                    new Filter({ path: "SEM_OBJ", operator: FilterOperator.EQ, value1: "ZS4_NOTEIMPUTAZIONI_SRV" }),
                    new Filter({ path: "AUTH_OBJ", operator: FilterOperator.EQ, value1: "Z_GEST_NI" })
                )
                self.getOwnerComponent().getModel("ZSS4_CA_CONI_VISIBILITA_SRV").read("/ZES_CONIAUTH_SET", {
                    filters: filters,        
                    success: function (data) {
                            console.log("success");
                            self.getView().getModel(WIZARD_ENTITIES_MODEL).setProperty("/Visibilita", data.results);
                            // self.getView().getModel("temp").setProperty('/Visibilita', data.results)
                            //self.pulsantiVisibiltà(data.results)
                        },
                    error: function (error) {
                        console.log(error)
                        var e = error;
                    }   
                });
            },

            loadEsercizioGestione:function(){
                var self =this;
                self.getOwnerComponent().getModel().read("/ZgjahrEngNiSet", {
                    success: function (data) {
                        self.getView().getModel(WIZARD_ENTITIES_MODEL).setProperty('/ZgjahrEngNiSet', data.results);
                    },
                    error: function (error) {
                        var e = error;
                        console.log(e);
                    }
                });
            },

            loadMese:function(){
                var self =this;
                self.getOwnerComponent().getModel().read("/ZmeseSet", {
                    success: function (data) {
                        self.getView().getModel(WIZARD_ENTITIES_MODEL).setProperty('/ZmeseSet', data.results)
                    },
                    error: function (error) {
                        var e = error;
                        console.log(e);
                    }
                });
            },

            loadZcompRes:function () {
                var self = this;
                self.getOwnerComponent().getModel().read("/ZcompResNISet", {
                    success: function (data) {
                        self.getView().getModel(WIZARD_ENTITIES_MODEL).setProperty('/ZcompResNISet', data.results);
                    },
                    error: function (error) {
                        var e = error;
                        console.log(e);
                    }
                });
            },

            loadStrutturaAmministrativa: function () {
                var self = this;
                var oMdl = new sap.ui.model.json.JSONModel();
                self.getOwnerComponent().getModel().read("/FistlNiSet", {
                    success: function (data) {
                        oMdl.setData(data.results);
                        self.getView().getModel(WIZARD_ENTITIES_MODEL).setProperty('/FistlNiSet', data.results);
                    },
                    error: function (error) {
                        var e = error;
                        console.log(e);
                    }
                });
            },

            loadPosizioneFinanziaria: function () {
                var self = this;
                self.getOwnerComponent().getModel().read("/FipexNiSet", {
                    success: function (data) {
                        self.getView().getModel(WIZARD_ENTITIES_MODEL).setProperty('/FipexNiSet', data.results);
                    },
                    error: function (error) {
                        var e = error;
                        console.log(e);
                    }
                });
            },

            esGestioneSelectionChange:function(oEvent){
                var self =this,
                    selected = oEvent.getParameters().selectedItem;

                self.getView().getModel(PREIMPOSTAZIONENI_MODEL).setProperty("/ZgjahrEng",selected.getProperty("key"));
            },
            
            meseSelectionChange:function(oEvent){
                var self=this,
                    selected = oEvent.getParameters().selectedItem;
                
                self.getView().getModel(PREIMPOSTAZIONENI_MODEL).setProperty("/meseValore",selected.getProperty("key"));
                self.getView().getModel(PREIMPOSTAZIONENI_MODEL).setProperty("/meseDescrizione",selected.getProperty("text"));
            },

            handleValueHelpZhfTipo:function(oEvent){
                var self =this;
                var oDialog = self.openDialog("project1.fragment.Help.zhfTipo");
                self.getOwnerComponent().getModel().read("/ZhfTipoSet", {
                    success: function(data, oResponse){
                        var oModelJson = new sap.ui.model.json.JSONModel();
                        oModelJson.setData(data.results);
                        self.getView().getModel(WIZARD_ENTITIES_MODEL).setProperty('/ZhfTipo', data.results);
                        var oTable = sap.ui.getCore().byId("selectDialogZhfTipo");
                        oTable.setModel(oModelJson,"ZhfTipoSet");
                        oDialog.open();
                    },
                    error: function(error){
                    }
                });
            },

            handleValueHelpValueCloseZhfTipo:function(oEvent){
                var self = this,
                    tipologiaId = self.getView().byId("tipologia"),
                    sottotipologia = self.getView().byId("sottotipologia"),
                    key,
                    selected = oEvent.getParameter("selectedItem");

                if(!selected){              
                    self.getView().getModel(WIZARD_ENTITIES_MODEL).setProperty('/ZhfSottotipo', []);      
                    self.closeDialog();
                    return;
                }
                
                key = oEvent.getParameter("selectedItem").data("key");
                self.getView().getModel(PREIMPOSTAZIONENI_MODEL).setProperty("/tipologia",key);
                self.getView().getModel(PREIMPOSTAZIONENI_MODEL).setProperty("/tipologiaDescrizione",selected.getTitle());
                                
                if(key){
                    var filters = [];
                    filters.push(new Filter({ path: "ZcodTipo", operator: FilterOperator.EQ, value1: key }));
                    self.getOwnerComponent().getModel().read("/ZhfSottotipoSet", {
                        filters: filters,
                        success: function(data, oResponse){
                            self.getView().getModel(WIZARD_ENTITIES_MODEL).setProperty('/ZhfSottotipo', data.results);
                        },
                        error: function(error){
                        }
                    });
                }
                else{
                    self.getView().getModel(WIZARD_ENTITIES_MODEL).setProperty('/ZhfSottotipo', []);
                }
                self.closeDialog();
            },

            ZhfTipoOnDelete:function(oEvent){
                var self= this;
                self.getView().getModel(PREIMPOSTAZIONENI_MODEL).setProperty("/tipologia","");
                self.getView().getModel(PREIMPOSTAZIONENI_MODEL).setProperty("/tipologiaDescrizione",""); 
                self.getView().getModel(WIZARD_ENTITIES_MODEL).setProperty('/ZhfSottotipo', []);
                self.getView().getModel(PREIMPOSTAZIONENI_MODEL).setProperty("/sottotipologia","");
                self.getView().getModel(PREIMPOSTAZIONENI_MODEL).setProperty("/sottotipologiaDescrizione",""); 
            },

            sottotipologiaSelectionChange:function(oEvent){
                var self= this,
                    selected = oEvent.getParameters().selectedItem;
                
                self.getView().getModel(PREIMPOSTAZIONENI_MODEL).setProperty("/sottotipolgia",selected.getProperty("key"));
                self.getView().getModel(PREIMPOSTAZIONENI_MODEL).setProperty("/sottotipolgiaDescrizione",selected.getProperty("text"));
            },

            strutturaAmministrativaLiveChange:function(oEvent){
                var self = this;
                self.getView().getModel(PREIMPOSTAZIONENI_MODEL).setProperty("/fistl",oEvent.getParameters().value);
            },
            
            posizioneFinanziariaLiveChange:function(oEvent) {
                var self = this,
                    descrizioneCapitoloControl = self.getView().byId("descrizioneCap"),
                    descrizionePGControl = self.getView().byId("descrizionePG");
                    
                self.getView().getModel(PREIMPOSTAZIONENI_MODEL).setProperty("/fipex",oEvent.getParameters().value);
                self.getView().getModel(PREIMPOSTAZIONENI_MODEL).setProperty("/descrizioneCapitolo", descrizioneCapitoloControl.getValue());
                self.getView().getModel(PREIMPOSTAZIONENI_MODEL).setProperty("/descrizionePG",descrizionePGControl.getValue());
            },

            oggSpesaLiveChange:function(oEvent){
                var self =this;
                self.getView().getModel(PREIMPOSTAZIONENI_MODEL).setProperty("/oggettoSpesa",oEvent.getParameters().value);
            },
            

            // posizioneFinanziariaLiveChange: function () {
            //     var that = this;
            //     var oMdl = new sap.ui.model.json.JSONModel();
            //     var datiNI = []
            //     var oModel = this.getOwnerComponent().getModel();
            //     var Zamministr="";
            //     if(this.getView().getModel("temp").getData().ZamministrNiSet)
            //         Zamministr= this.getView().getModel("temp").getData().ZamministrNiSet[0].Zamministr;
                
            //     var path = oModel.createKey("/ZdescPgNiSet", {
            //         Fipex: this.getView().byId("input_PF").getValue(),
            //         Gjahr: this.getView().byId("es_gestione").getSelectedKey(),
            //         Zamministr: Zamministr,
            //     });

            //     oModel.read(path, {
            //         filters: [],
            //         urlParameters: "",
            //         success: function (data) {
            //             oMdl.setData(data);
            //             that.getView().getModel("temp").setProperty('/ZdescPgNiSet', data)
            //             that.getView().byId("descrizioneCap").setValue(data.DescrEstesa)
            //             that.ZdescCap()
            //         },
            //         error: function (error) {
            //             var e = error;
            //             console.log(e);
            //         }
            //     });
            // },


            resetModelsForExitWizard:function(){
                var self= this;

                self.getView().getModel(PREIMPOSTAZIONENI_MODEL).setProperty("/ZgjahrEng","");
                self.getView().getModel(PREIMPOSTAZIONENI_MODEL).setProperty("/meseValore","");
                self.getView().getModel(PREIMPOSTAZIONENI_MODEL).setProperty("/meseDescrizione","");
                self.getView().getModel(PREIMPOSTAZIONENI_MODEL).setProperty("/tipologia","");
                self.getView().getModel(PREIMPOSTAZIONENI_MODEL).setProperty("/tipologiaDescrizione","");
                self.getView().getModel(PREIMPOSTAZIONENI_MODEL).setProperty("/sottotipologia","");
                self.getView().getModel(PREIMPOSTAZIONENI_MODEL).setProperty("/sottotipologiaDescrizione","");
                self.getView().getModel(PREIMPOSTAZIONENI_MODEL).setProperty("/competenza","c");
                self.getView().getModel(PREIMPOSTAZIONENI_MODEL).setProperty("/competenzaDescrizione","Competenza");
                self.getView().getModel(PREIMPOSTAZIONENI_MODEL).setProperty("/rendicontazioneSumRowSelected",0);
                self.getView().getModel(PREIMPOSTAZIONENI_MODEL).setProperty("/rendicontazioneSumRowSelectedString","0,00");
                self.getView().getModel(PREIMPOSTAZIONENI_MODEL).setProperty("/rendicontazioneRowNum","0");
                self.getView().getModel(PREIMPOSTAZIONENI_MODEL).setProperty("/fistl","");
                self.getView().getModel(PREIMPOSTAZIONENI_MODEL).setProperty("/fipex","");
                self.getView().getModel(PREIMPOSTAZIONENI_MODEL).setProperty("/descrizioneCapitolo","");
                self.getView().getModel(PREIMPOSTAZIONENI_MODEL).setProperty("/descrizionePG","");
                self.getView().getModel(PREIMPOSTAZIONENI_MODEL).setProperty("/oggettoSpesa","");
                self.getView().getModel(PREIMPOSTAZIONENI_MODEL).setProperty("/titoliSelezionati",[]);
                self.getView().getModel(PREIMPOSTAZIONENI_MODEL).setProperty("/titoliSelezionatiStep3",[]);

                self.getView().getModel(WIZARD_ENTITIES_MODEL).setProperty("/RendicontazioneSet",[]);
                self.getView().getModel(WIZARD_ENTITIES_MODEL).setProperty("/ZhfTipo",[]);
                self.getView().getModel(WIZARD_ENTITIES_MODEL).setProperty("/ZhfSottotipo",[]);
            },

            /********************/
            
            onSearch:function(oEvent){
                var self = this;

                if(self.getView().getModel(PREIMPOSTAZIONENI_MODEL).getProperty("/ZgjahrEng") === "" || 
                    self.getView().getModel(PREIMPOSTAZIONENI_MODEL).getProperty("/meseValore") === ""){
                    MessageBox.error("Alimentare tutti i campi obbligatori", {
                        actions: [sap.m.MessageBox.Action.OK],
                        emphasizedAction: MessageBox.Action.OK,
                    });
                }
                else{
                    self._getRendicontazione();        
                }
            },

            _getRendicontazione:function(){
                var self = this,
                    filters = [];
                
                filters.push(new Filter({ path: "Gjahr", operator: FilterOperator.EQ, value1: self.getView().getModel(PREIMPOSTAZIONENI_MODEL).getProperty("/ZgjahrEng") }));
                filters.push(new Filter({ path: "Zmese", operator: FilterOperator.EQ, value1: self.getView().getModel(PREIMPOSTAZIONENI_MODEL).getProperty("/meseValore") }));

                if(self.getView().getModel(PREIMPOSTAZIONENI_MODEL).getProperty("/tipologia") !== "")
                    filters.push(new Filter({ path: "ZcodTipo", operator: FilterOperator.EQ, value1: self.getView().getModel(PREIMPOSTAZIONENI_MODEL).getProperty("/tipologia") }));
                
                if(self.getView().getModel(PREIMPOSTAZIONENI_MODEL).getProperty("/sottotipologia") !== "")
                    filters.push(new Filter({ path: "ZcodSottotipo", operator: FilterOperator.EQ, value1: self.getView().getModel(PREIMPOSTAZIONENI_MODEL).getProperty("/sottotipologia") }));
                
                if(self.getView().getModel(PREIMPOSTAZIONENI_MODEL).getProperty("/competenza") !== "")
                    filters.push(new Filter({ path: "ZcompRes", operator: FilterOperator.EQ, value1: self.getView().getModel(PREIMPOSTAZIONENI_MODEL).getProperty("/competenza") }));
                
                self.getView().setBusy(true);
                self.getOwnerComponent().getModel().read("/RendicontazioneSet", {
                    filters:filters,
                    success: function(data, oResponse){
                        self.getView().getModel(WIZARD_ENTITIES_MODEL).setProperty('/RendicontazioneSet', data.results);
                        self.getView().setBusy(false);
                    },
                    error: function(error){
                        self.getView().getModel(WIZARD_ENTITIES_MODEL).setProperty('/RendicontazioneSet', []);
                        self.getView().setBusy(false);
                    }
                });
            },

            _getSelectedStep1:function(){
                var self = this,
                    array=[],
                    rendicontazioneTotale=0,
                    oTable = self.getView().byId("HeaderNIW"),
                    oTableModel = self.getView().getModel("wizardEntitiesModel").getProperty("/RendicontazioneSet");
                
                console.log(oTableModel);
                for(var i=0; i<oTable.getSelectedContextPaths().length;i++){
                    var item = oTable.getModel(WIZARD_ENTITIES_MODEL).getObject(oTable.getSelectedContextPaths()[i]);
                    rendicontazioneTotale = rendicontazioneTotale + parseFloat(item.ZimpoRes);
                    array.push(item);                    
                }
                self.getView().getModel(PREIMPOSTAZIONENI_MODEL).setProperty("/titoliSelezionati",array);
                self.getView().getModel(PREIMPOSTAZIONENI_MODEL).setProperty("/rendicontazioneSumRowSelected",rendicontazioneTotale);   
                self.getView().getModel(PREIMPOSTAZIONENI_MODEL).setProperty("/rendicontazioneSumRowSelectedString",
                    self.formatter.convertFormattedNumber(rendicontazioneTotale.toFixed(2))); 
                self.getView().getModel(PREIMPOSTAZIONENI_MODEL).setProperty("/rendicontazioneRowNum",oTable.getSelectedContextPaths().length > 0 ? 
                    oTable.getSelectedContextPaths().length.toString() : "0");
            },

            _setDataStep3:function(){
                var self = this,
                    arrayStep3 = [];    
                self.getView().getModel(PREIMPOSTAZIONENI_MODEL).setProperty("/titoliSelezionatiStep3",[]);
                var array = self.getView().getModel(PREIMPOSTAZIONENI_MODEL).getProperty("/titoliSelezionati");
                for(var i=0; i<array.length; i++){
                    var item = array[i];
                    var clone = _.clone(item);
                    clone.ZimpoTitolo = item.ZimpoRes;
                    clone.ZimpoRes = "0,00";
                    arrayStep3.push(clone);
                } 
                self.getView().getModel(PREIMPOSTAZIONENI_MODEL).setProperty("/titoliSelezionatiStep3",arrayStep3);
            },


            _setZimpoNiStep3:function(){
                var self = this,
                    valueSum = 0,
                    array=[];

                array=self.getView().getModel(PREIMPOSTAZIONENI_MODEL).getProperty("/titoliSelezionatiStep3");    
                for(var i=0; i<array.length;i++){
                    var item = array[i];
                    var value = item.ZimpoTitolo;
                    value = value.replace(",",".");
                    valueSum = valueSum + parseFloat(value);    
                }
                console.log(valueSum);//TODO:da canc
                return valueSum;
            },
            
            onNextButton:function(oEvent){
                var self =this,                    
                    wizard = self.getView().byId("wizardPreimpostazioneNI"),
                    oTable = self.getView().byId("HeaderNIW"),
                    currentStep = self.getView().byId(wizard.getCurrentStep()).data("stepId"),
                    visibilita=null;

                    if(!self.getView().getModel(WIZARD_ENTITIES_MODEL).getProperty("/Visibilita") || 
                        self.getView().getModel(WIZARD_ENTITIES_MODEL).getProperty("/Visibilita")===null ||
                        self.getView().getModel(WIZARD_ENTITIES_MODEL).getProperty("/Visibilita").length === 0){

                        self.callVisibilitaWithCallback(function(callback){
                            if(callback){
                                visibilita = self.getView().getModel(WIZARD_ENTITIES_MODEL).getProperty("/Visibilita")[0];
                            }
                        });    

                        // self.callVisibilita();     
                        //     // setTimeout(function() {
                        //     //     fEanMobile.focus();
                        //     //     fEanMobile.setValue("");
                        //     // }, 350);
                        // visibilita = self.getView().getModel(WIZARD_ENTITIES_MODEL).getProperty("/Visibilita");
                    }
                    else
                        visibilita = self.getView().getModel(WIZARD_ENTITIES_MODEL).getProperty("/Visibilita")[0];
                    
                
                switch(currentStep){
                    case "1":
                        if(self.getView().getModel(PREIMPOSTAZIONENI_MODEL).getProperty("/ZgjahrEng") === "" || 
                            self.getView().getModel(PREIMPOSTAZIONENI_MODEL).getProperty("/meseValore") === ""){
                            MessageBox.error("Alimentare tutti i campi obbligatori", {
                                actions: [sap.m.MessageBox.Action.OK],
                                emphasizedAction: MessageBox.Action.OK,
                            });
                            return;
                        }
                        if(oTable.getSelectedContextPaths().length == 0){
                            MessageBox.error("Selezionare almeno un pagamento", {
                                actions: [sap.m.MessageBox.Action.OK],
                                emphasizedAction: MessageBox.Action.OK,
                            });
                            return;
                        }
                        self._getSelectedStep1();
                        self.getView().getModel(COMPONENT_MODEL).setProperty("/headerStep2Visible",true);  
                        self.getView().getModel(COMPONENT_MODEL).setProperty("/headerStep3Visible",false);  
                        self.getView().getModel(COMPONENT_MODEL).setProperty("/btnNextVisible",true);
                        self.getView().getModel(COMPONENT_MODEL).setProperty("/btnPreimpostaNiVisible",false);
                        wizard.nextStep();
                        break;
                    case "2":
                        if(self.getView().getModel(PREIMPOSTAZIONENI_MODEL).getProperty("/fistl") === "" || 
                            self.getView().getModel(PREIMPOSTAZIONENI_MODEL).getProperty("/fipex") === ""){
                            MessageBox.error("Alimentare tutti i campi obbligatori", {
                                actions: [sap.m.MessageBox.Action.OK],
                                emphasizedAction: MessageBox.Action.OK,
                            });
                            return;
                        }    
                        self.getView().setBusy(true);
                        console.log(visibilita);
                        self.getOwnerComponent().getModel().callFunction("/AutImputazioneContabile", {
                            method: "GET",
                            urlParameters: { "AutorityRole": visibilita.AGR_NAME, 
                                             "AutorityFikrs": visibilita.FIKRS, 
                                             "AutorityPrctr": visibilita.PRCTR, 
                                             "Fipex": self.getView().getModel(PREIMPOSTAZIONENI_MODEL).getProperty("/fipex"), 
                                             "Fistl": self.getView().getModel(PREIMPOSTAZIONENI_MODEL).getProperty("/fistl"), 
                                             "Gjahr": self.getView().getModel(PREIMPOSTAZIONENI_MODEL).getProperty("/ZgjahrEng") 
                                            },
                            success: function (data, response) {
                                self.getView().setBusy(false);
                                if(data.Value === 'E'){
                                    MessageBox.error(data.Message, {
                                        title: "Esito Operazione",
                                        actions: [sap.m.MessageBox.Action.OK],
                                        emphasizedAction: MessageBox.Action.OK,
                                    })
                                    return;
                                }
                                else{
                                    self._setDataStep3();
                                    self.getView().getModel(COMPONENT_MODEL).setProperty("/headerStep2Visible",false);
                                    self.getView().getModel(COMPONENT_MODEL).setProperty("/headerStep3Visible",true);
                                    self.getView().getModel(COMPONENT_MODEL).setProperty("/btnNextVisible",false);
                                    self.getView().getModel(COMPONENT_MODEL).setProperty("/btnPreimpostaNiVisible",true);
                                    wizard.nextStep();
                                    return;
                                }        
                            },
                            error: function (oError) {
                                self.getView().setBusy(false);
                                MessageBox.error(oError.Message, {
                                    title: "Esito Operazione",
                                    actions: [sap.m.MessageBox.Action.OK],
                                    emphasizedAction: MessageBox.Action.OK,
                                })
                                return;
                            }
                        })
                        break;
                    case "3":
                        wizard.nextStep();
                        break;
                    default:
                        console.log("default");
                }                
            },

            // callSecurity: function () {
            //     var that = this
            //     var visibilità = this.getView().getModel("temp").getData().Visibilità[0]
            //     var Fipex = this.getView().byId("input_PF").getValue();
            //     var Fistl = this.getView().byId("strAmmResp").getValue();
            //     var Gjahr = this.getView().byId("es_gestione").getSelectedKey();

            //     that.getOwnerComponent().getModel().callFunction("/AutImputazioneContabile", {
            //         method: "GET",
            //         urlParameters: { "AutorityRole": visibilità.AGR_NAME, "AutorityFikrs": visibilità.FIKRS, "AutorityPrctr": visibilità.PRCTR, "Fipex": Fipex, "Fistl": Fistl, "Gjahr": Gjahr },
            //         success: function (Value, response) {
            //             that.getView().getModel("temp").setProperty('/Autorizzazioni', Value);

            //             var oNextStep = that._oWizard.getSteps()[that._iSelectedStepIndex + 1];

            //             if (that._oSelectedStep && !that._oSelectedStep.bLast) {
            //                 that._oWizard.goToStep(oNextStep, true);
            //             } else {
            //                 that._oWizard.nextStep();
            //             }

            //             that._iSelectedStepIndex++;
            //             that._oSelectedStep = oNextStep;


            //             that.controlPreNI()
            //             that.controlHeader()

            //         },
            //         error: function (oError) {
            //             var err = oError
            //             MessageBox.error(oError.Message, {
            //                 title: "Esito Operazione",
            //                 actions: [sap.m.MessageBox.Action.OK],
            //                 emphasizedAction: MessageBox.Action.OK,
            //             })
            //         }
            //     })
            // },



            onBackButton:function(oEvent){
                var self =this,
                    wizard = self.getView().byId("wizardPreimpostazioneNI"),
                    currentStep = self.getView().byId(wizard.getCurrentStep()).data("stepId");

                switch(currentStep){
                    case "1":      
                        self.resetModelsForExitWizard(); 
                        window.history.go(-1);   
                        return;               
                        break;
                    case "2":
                        self.getView().getModel(COMPONENT_MODEL).setProperty("/headerStep2Visible",false);  
                        self.getView().getModel(COMPONENT_MODEL).setProperty("/headerStep3Visible",false);  
                        break;
                    case "3":
                        self.getView().getModel(COMPONENT_MODEL).setProperty("/headerStep2Visible",true);
                        self.getView().getModel(COMPONENT_MODEL).setProperty("/headerStep3Visible",false);
                        self.getView().getModel(COMPONENT_MODEL).setProperty("/btnNextVisible",true);
                        self.getView().getModel(COMPONENT_MODEL).setProperty("/btnPreimpostaNiVisible",false);
                        break;
                    default:
                        console.log("default");
                }              
                wizard.previousStep();
            },

            getTitoloSelezionato:function(list, zcodIsin){
                var self =this,
                    found =null;

                for(var i=0; i<list.length;i++){
                    var item = list[i];
                    if(item.ZcodIsin !== zcodIsin)
                        continue;
                    
                    found = item;
                    i=list.length;
                }
                return found;
            },

            onPreimpNI:function(oEvent){
                var self =this,
                    visibilita = self.getView().getModel(WIZARD_ENTITIES_MODEL).getProperty("/Visibilita")[0],
                    oDataModel = self.getOwnerComponent().getModel(),
                    positionArray = self.getView().getModel(PREIMPOSTAZIONENI_MODEL).getProperty("/titoliSelezionatiStep3"),
                    titoliSelezionati = self.getView().getModel(PREIMPOSTAZIONENI_MODEL).getProperty("/titoliSelezionati");


                if(self.getView().getModel(PREIMPOSTAZIONENI_MODEL).getProperty("/oggettoSpesa") === ""){
                    MessageBox.error("Oggetto della spesa non inserito", {
                        actions: [sap.m.MessageBox.Action.OK],
                        emphasizedAction: MessageBox.Action.OK,
                    });
                    return;
                }

                var mex=null;
                for(var i=0; i<positionArray.length;i++){
                    var item = positionArray[i];
                    var titoloSelezionato = self.getTitoloSelezionato(titoliSelezionati, item.ZcodIsin);
                    var impRes = titoloSelezionato.ZimpoRes;
                    impRes = impRes.replace(".","");
                    impRes = impRes.replace(",",".");
                    if(parseFloat(item.ZimpoTitolo) > parseFloat(impRes)){
                        i = positionArray.length;
                        mex = "L'importo del titolo non può superare l'importo residuo";
                    }
                    else if(parseFloat(item.ZimpoTitolo) <= 0){
                        i = positionArray.length;
                        mex = "Inserire un importo valido";
                    }
                }
                if(mex && mex !== ""){
                    MessageBox.error(mex, {
                        actions: [sap.m.MessageBox.Action.OK],
                        emphasizedAction: MessageBox.Action.OK,
                    });
                    return;
                }

                /* inizializzo oggetto */
                var deepEntity = {
                    HeaderNISet: null,
                    PositionNISet: [],
                    Funzionalita: 'PREIMPOSTAZIONE'
                }

                for(var i=0; i<positionArray.length;i++){
                    var item = positionArray[i];
                    deepEntity.PositionNISet.push({
                        //Bukrs Passato Da BE
                        Gjahr: self.getView().getModel(PREIMPOSTAZIONENI_MODEL).getProperty("/ZgjahrEng"),
                        //Zamministr: item.Zamministr, Passato Da BE
                        //ZidNi: Valore Incrementato da BE
                        //ZRagioCompe: item.ZRagioCompe, Passato Da BE
                        Ztipologia: item.Ztipologia,
                        ZposNi: item.ZposNi,
                        //ZgjahrEng: self.getView().getModel(PREIMPOSTAZIONENI_MODEL).getProperty("/ZgjahrEng"),
                        Ztipo: item.Ztipo,
                        Zsottotipo: self.getView().getModel(PREIMPOSTAZIONENI_MODEL).getProperty("/sottotipologiaDescrizione"),
                        ZcompRes: self.getView().getModel(PREIMPOSTAZIONENI_MODEL).getProperty("/competenza"),
                        ZimpoTitolo: item.ZimpoTitolo,                 
                        Zdescrizione: item.Zdescrizione,                
                        ZcodIsin: item.ZcodIsin,                       
                        ZdataPag: new Date(),
                        Iban:item.ZibanAdd,
                        Ztassoint: item.Ztasso,
                        ZdataInizio: item.ZdataInizio,
                        Zfbdt: item.ZdataScad,
                        Zidentificativo: item.Zidentificativo,
                        ZdataPag: item.ZdataPag
                    });
                }

                var zImpoTotni = self._setZimpoNiStep3();
                deepEntity.HeaderNISet = {
                    //Bukrs Passato Da BE
                    Gjahr: self.getView().getModel(PREIMPOSTAZIONENI_MODEL).getProperty("/ZgjahrEng"),
                    //Zamministr: item.Zamministr, Passato Da BE
                    //ZidNi: Valore Incrementato da BE
                    //ZRagioCompe: item.ZRagioCompe, Passato Da BE
                    ZcodiStatoni: "00",
                    ZimpoTotni: zImpoTotni.toFixed(2),
                    //ZzGjahrEngPos: N_es_gestione,
                    Zmese: self.getView().getModel(PREIMPOSTAZIONENI_MODEL).getProperty("/meseValore"),
                    ZoggSpesa: self.getView().getModel(PREIMPOSTAZIONENI_MODEL).getProperty("/oggettoSpesa"),
                    Fipex: self.getView().getModel(PREIMPOSTAZIONENI_MODEL).getProperty("/fipex"),
                    Fistl: self.getView().getModel(PREIMPOSTAZIONENI_MODEL).getProperty("/fistl"),
                    ZdataCreaz: new Date(),
                    //ZutenteCreazione: sap.ushell.Container.getService("UserInfo").getId(),
                    ZdataModiNi: new Date(),
                    //ZutenteModifica: sap.ushell.Container.getService("UserInfo").getId()
                };

                var countValoriMinori = 0;
                var isinString ="";
                for(var i=0; i<positionArray.length;i++){
                    var item = positionArray[i];                    
                    if(parseFloat(item.ZimpoTitolo) < self.getView().getModel(PREIMPOSTAZIONENI_MODEL).getProperty("/rendicontazioneSumRowSelected")){
                        countValoriMinori++
                        isinString = isinString + "\n" + item.ZcodIsin;                    
                    }
                }                
                
                if (countValoriMinori > 0) {
                    var messageText = "L’importo relativo ai seguenti codici ISIN è stato coperto parzialmente dalla Nota di Imputazione:" + isinString;
                    messageText = messageText + "\nSi intende procedere con l’operazione?";
                                    
                    MessageBox.warning(messageText, {
                        title: "Copertura Importo",
                        actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
                        emphasizedAction: MessageBox.Action.YES,
                        onClose: function (oAction) {
                            if(oAction === sap.m.MessageBox.Action.YES){
                                MessageBox.warning("Sei sicuro di voler preimpostare la NI?", {
                                    title: "Preimpostazione NI",
                                    actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
                                    emphasizedAction: MessageBox.Action.YES,
                                    onClose: function (oAction) {
                                        if (oAction === sap.m.MessageBox.Action.YES){
                                            oDataModel.create("/DeepZNIEntitySet", deepEntity, {
                                                urlParameters: { "AutorityRole": visibilita.AGR_NAME, "AutorityFikrs": visibilita.FIKRS, "AutorityPrctr": visibilita.PRCTR },
                                                success: function (result) {
                                                    if (result.Msgty == 'E') {
                                                        console.log(result.Message);//TODO:da canc
                                                        MessageBox.error(result.Message, {
                                                            title: "Esito Operazione",
                                                            actions: [sap.m.MessageBox.Action.OK],
                                                            emphasizedAction: MessageBox.Action.OK,
                                                        })
                                                    }
                                                    if (result.Msgty == 'S') {
                                                        var risultato = result.Message.split(" ")
                                                        let frase = risultato[0] + " " + risultato[1] + " " + risultato[2] + " " + risultato[3] + " preimpostata correttamente"
                                                        MessageBox.success(frase, {
                                                            title: "Esito Operazione",
                                                            actions: [sap.m.MessageBox.Action.OK],
                                                            emphasizedAction: MessageBox.Action.OK,
                                                            onClose: function (oAction) {
                                                                if (oAction === sap.m.MessageBox.Action.OK) {
                                                                    self.resetModelsForExitWizard();
                                                                    self.getOwnerComponent().getRouter().navTo("View1");
                                                                    location.reload();
                                                                }
                                                            }
                                                        })
                                                    }
                                                },
                                                error: function (err) {
                                                    console.log(err);
                                                    MessageBox.error("Nota d'imputazione non creata correttamente", {
                                                        title: "Esito Operazione",
                                                        actions: [sap.m.MessageBox.Action.OK],
                                                        emphasizedAction: MessageBox.Action.OK,
                                                    })
                                                },
                                                async: true,  // execute async request to not stuck the main thread
                                                urlParameters: {}  // send URL parameters if required 
                                            });
                                        }
                                    }
                                });
                            }
                        }
                    });
                }
                else{
                    MessageBox.warning("Sei sicuro di voler preimpostare la NI?", {
                        actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
                        emphasizedAction: MessageBox.Action.YES,
                        onClose: function (oAction) {
                            if (oAction === sap.m.MessageBox.Action.YES) {
                                oDataModel.create("/DeepZNIEntitySet", deepEntity, {
                                    urlParameters: { "AutorityRole": visibilita.AGR_NAME, "AutorityFikrs": visibilita.FIKRS, "AutorityPrctr": visibilita.PRCTR },
                                    success: function (result) {
                                        if (result.Msgty == 'E') {
                                            console.log(result.Message)
                                            MessageBox.error("Nota d'imputazione non creata correttamente", {
                                                actions: [sap.m.MessageBox.Action.OK],
                                                emphasizedAction: MessageBox.Action.OK,
                                            })
                                        }
                                        if (result.Msgty == 'S') {
                                            MessageBox.success(result.Message, {
                                                actions: [sap.m.MessageBox.Action.OK],
                                                emphasizedAction: MessageBox.Action.OK,
                                                onClose: function (oAction) {
                                                    if (oAction === sap.m.MessageBox.Action.OK) {
                                                        self.resetModelsForExitWizard();
                                                        self.getOwnerComponent().getRouter().navTo("View1");
                                                        location.reload();
                                                    }
                                                }
                                            })
                                        }
                                    },
                                    error: function (err) {
                                        console.log(err);
                                        MessageBox.error("Nota d'imputazione non creata correttamente", {
                                            actions: [sap.m.MessageBox.Action.OK],
                                            emphasizedAction: MessageBox.Action.OK,
                                        })
                                    },
                                    async: true,  // execute async request to not stuck the main thread
                                    urlParameters: {}  // send URL parameters if required 
                                });
                            }
                        }
                    });
                }
            }

        });
    });