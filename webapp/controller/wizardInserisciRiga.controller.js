sap.ui.define([
    "./BaseController",
    "sap/ui/model/Filter",
    "sap/m/MessageBox",
    'sap/ui/model/json/JSONModel',
    "sap/ui/core/library",
    "project1/model/DateFormatter",
    "sap/ui/model/FilterOperator",
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (BaseController, Filter, MessageBox, JSONModel, CoreLibrary, DateFormatter, FilterOperator) {
        "use strict";
        var ValueState = CoreLibrary.ValueState,
            oData = {
                BackButtonVisible: true,
                NextButtonVisible: true,
                PNIButtonVisible: false,
                headerVisible: true,
                // HeaderNIWstep3Visible: true
            };

        const MODEL_ENTITY = "EntityModel";    
        const PREIMPOSTAZIONENI_MODEL = "preimpostazioneModel";
        const COMPONENT_MODEL = "componentModel";
        return BaseController.extend("project1.controller.wizardInserisciRiga", {
            formatter: DateFormatter,
            ZhfTipoKey:"",
            onInit: async function () {

                var oProprietà = new JSONModel(),
                    oInitialModelState = Object.assign({}, oData);
                oProprietà.setData(oInitialModelState);
                this.getView().setModel(oProprietà);

                this._iSelectedStepIndex = 0;
                this._wizard = this.byId("CreateProductWizard");
                this._oNavContainer = this.byId("wizardNavContainer");
                this._oWizardContentPage = this.byId("wizardContentPage");

                this.getOwnerComponent().getModel("temp");
                this.getRouter().getRoute("wizardInserisciRiga").attachPatternMatched(this._onObjectMatched, this);

                // this.controlPreNI()
                // this.controlHeader()
                // this.esercizioGestione()
                this.ZhfTipoKey = "";

                var self =this;
                self.loadZcompRes();
               
                var oModelJson = new JSONModel({
                    Header:null,
                    RendicontazioneSet:[],
                    ZhfTipo:[], 
                    ZhfSottotipo:[],
                    ZcompResNISet:[]          
                });        

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

                self.getView().setModel(oModelJson,MODEL_ENTITY); 
                self.getView().setModel(oModelJsonComponent, COMPONENT_MODEL);
                self.getView().setModel(oModelJsonPreimpostazioneNi,PREIMPOSTAZIONENI_MODEL); 
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
            //     this.viewFiltri(oEvent)
            // },

            
            _onObjectMatched: function (oEvent) {
                var self =this,
                  visibilita =null;            
                
                var path = self.getOwnerComponent().getModel().createKey("HeaderNISet", {
                    Bukrs: oEvent.getParameters().arguments.campo,                    
                    Gjahr: oEvent.getParameters().arguments.campo1,
                    Zamministr: oEvent.getParameters().arguments.campo2,
                    ZchiaveNi: oEvent.getParameters().arguments.campo3,
                    ZidNi: oEvent.getParameters().arguments.campo4,
                    ZRagioCompe: oEvent.getParameters().arguments.campo5
                }); 


                if(!self.getView().getModel(MODEL_ENTITY).getProperty("/Visibilita") || 
                  self.getView().getModel(MODEL_ENTITY).getProperty("/Visibilita")===null ||
                  self.getView().getModel(MODEL_ENTITY).getProperty("/Visibilita").length === 0){

                  self.callVisibilitaWithCallbackLocal(function(callback){
                      if(callback){
                        visibilita = self.getView().getModel(MODEL_ENTITY).getProperty("/Visibilita")[0];
                        if(!self.getView().getModel("temp").getProperty("/InitInfoMc") || 
                          self.getView().getModel("temp").getProperty("/InitInfoMc") === null){
                            self.getView().getModel("temp").setProperty("/InitInfoMc",
                            self.setInitInfoMC(visibilita));    
                        }
                      }
                  });   
                }
                else{
                  visibilita = self.getView().getModel(MODEL_ENTITY).getProperty("/Visibilita")[0];  
                  if(!self.getView().getModel("temp").getProperty("/InitInfoMc") || 
                    self.getView().getModel("temp").getProperty("/InitInfoMc") === null){
                      self.getView().getModel("temp").setProperty("/InitInfoMc",
                      self.setInitInfoMC(visibilita));    
                  }
                }


                self.getView().getModel(MODEL_ENTITY).setProperty("/ZcompRes", oEvent.getParameters().arguments.campo6);
                self.getView().setBusy(true);
                self.loadView(path);
            },

            loadView:function(path){
              var self =this,
                oDataModel = self.getOwnerComponent().getModel();

                self.getOwnerComponent().getModel().metadataLoaded().then(function() {
                  oDataModel.read("/" + path, {
                    success: function(data, oResponse){
                      console.log(data);
                      self.getView().getModel(MODEL_ENTITY).setProperty("/Header",data);
                      self.getView().getModel(PREIMPOSTAZIONENI_MODEL).setProperty("/descrizioneCapitolo", null);
                      self.getView().getModel(PREIMPOSTAZIONENI_MODEL).setProperty("/descrizionePG",null);
                      self.getView().getModel(PREIMPOSTAZIONENI_MODEL).setProperty("/fistl", data.Fistl);
                      self.getView().getModel(PREIMPOSTAZIONENI_MODEL).setProperty("/fipex",data.Fipex);
                     
                      if(data.Gjahr && data.Gjahr !== "" && data.Fipex && data.Fipex !== "")
                        self.getDescCapDescPG(data.Gjahr, data.Fipex,function(callback){ 
                            if(callback.success && callback.entity){
                              self.getView().getModel(PREIMPOSTAZIONENI_MODEL).setProperty("/descrizioneCapitolo", callback.entity.DescCap);
                              self.getView().getModel(PREIMPOSTAZIONENI_MODEL).setProperty("/descrizionePG",callback.entity.DescPg);
                            }
                          }
                        );

                      self.getView().getModel(PREIMPOSTAZIONENI_MODEL).setProperty("/ZgjahrEng",data.Gjahr);
                      self.getView().getModel(PREIMPOSTAZIONENI_MODEL).setProperty("/meseValore",data.Zmese);
                      self.getView().getModel(PREIMPOSTAZIONENI_MODEL).setProperty("/meseDescrizione",self.formatter.getMonthName(data.Zmese));
                      self.getView().getModel(PREIMPOSTAZIONENI_MODEL).setProperty("/oggettoSpesa",data.ZoggSpesa);
                      self.getView().setBusy(false);
                    },
                    error:function(error){
                      console.log(error);
                      self.getView().setBusy(false);
                    }
                  })
                });
            },

            loadZcompRes:function () {
              var self = this;
              self.getOwnerComponent().getModel().read("/ZcompResNISet", {
                  success: function (data) {
                      self.getView().getModel(MODEL_ENTITY).setProperty('/ZcompResNISet', data.results);
                  },
                  error: function (error) {
                      var e = error;
                      console.log(e);
                  }
              });
            },

            handleValueHelpZhfTipo:function(oEvent){
              var self =this;
              var oDialog = self.openDialog("project1.fragment.Help.zhfTipo");
              self.getOwnerComponent().getModel().read("/ZhfTipoSet", {
                  success: function(data, oResponse){
                      var oModelJson = new sap.ui.model.json.JSONModel();
                      oModelJson.setData(data.results);
                      self.getView().getModel(MODEL_ENTITY).setProperty('/ZhfTipo', data.results);
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
                  self.getView().getModel(MODEL_ENTITY).setProperty('/ZhfSottotipo', []);      
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
                          self.getView().getModel(MODEL_ENTITY).setProperty('/ZhfSottotipo', data.results);
                      },
                      error: function(error){
                      }
                  });
              }
              else{
                  self.getView().getModel(MODEL_ENTITY).setProperty('/ZhfSottotipo', []);
              }
              self.closeDialog();
            },

            ZhfTipoOnDelete:function(oEvent){
                var self= this;
                self.getView().getModel(PREIMPOSTAZIONENI_MODEL).setProperty("/tipologia","");
                self.getView().getModel(PREIMPOSTAZIONENI_MODEL).setProperty("/tipologiaDescrizione",""); 
                self.getView().getModel(MODEL_ENTITY).setProperty('/ZhfSottotipo', []);
                self.getView().getModel(PREIMPOSTAZIONENI_MODEL).setProperty("/sottotipologia","");
                self.getView().getModel(PREIMPOSTAZIONENI_MODEL).setProperty("/sottotipologiaDescrizione",""); 
            },

            sottotipologiaSelectionChange:function(oEvent){
                var self= this,
                    selected = oEvent.getParameters().selectedItem;
                
                self.getView().getModel(PREIMPOSTAZIONENI_MODEL).setProperty("/sottotipolgia",selected.getProperty("key"));
                self.getView().getModel(PREIMPOSTAZIONENI_MODEL).setProperty("/sottotipolgiaDescrizione",selected.getProperty("text"));
            },

            // 

            // viewFiltri: function (oEvent) {
            //     var header = this.getView().getModel("temp").getData().HeaderNISet
            //     var position = this.getView().getModel("temp").getData().PositionNISet
            //     for (var i = 0; i < header.length; i++) {
            //         if (header[i].Bukrs == oEvent.getParameters().arguments.campo &&
            //             header[i].Gjahr == oEvent.getParameters().arguments.campo1 &&
            //             header[i].Zamministr == oEvent.getParameters().arguments.campo2 &&
            //             header[i].ZchiaveNi == oEvent.getParameters().arguments.campo3 &&
            //             header[i].ZidNi == oEvent.getParameters().arguments.campo4 &&
            //             header[i].ZRagioCompe == oEvent.getParameters().arguments.campo5) {

            //             var ZgjahrEng = position[0].ZgjahrEng
            //             this.getView().byId("es_gestione").setValue(ZgjahrEng)

            //             var Zmese = header[i].Zmese;
            //             this.getView().byId("mese").setSelectedKey(Zmese);

            //             // var ZcompRes = position[0].ZcompRes
            //             // this.getView().byId("competenza").setValue(ZcompRes)

            //             // var Zsottotipo = position[0].Zsottotipo
            //             // this.getView().byId("sottotipologia").setValue(Zsottotipo)

            //             // var Ztipo = position[0].Ztipo
            //             // this.getView().byId("tipologia").setValue(Ztipo)

            //         }
            //     }
            // },

            // ZhfTipo - START
            // handleValueHelpZhfTipo:function(oEvent){
            //     var self =this;
            //     var oDialog = self.openDialog("project1.fragment.Help.zhfTipo");
            //     self.getOwnerComponent().getModel().read("/ZhfTipoSet", {
            //         success: function(data, oResponse){
            //             var oModelJson = new sap.ui.model.json.JSONModel();
            //             oModelJson.setData(data.results);
            //             var oTable = sap.ui.getCore().byId("selectDialogZhfTipo");
            //             oTable.setModel(oModelJson,"ZhfTipoSet");
            //             oDialog.open();
            //         },
            //         error: function(error){
            //         }
            //     });
            // },

            // handleValueHelpValueCloseZhfTipo:function(oEvent){
            //     var self = this,
            //         tipologiaId = self.getView().byId("tipologia"),
            //         sottotipologia = self.getView().byId("sottotipologia"),
            //         key,
            //         selected = oEvent.getParameter("selectedItem");

            //     self.ZhfTipoKey = "";
            //     if(!selected){            
            //         self.getView().getModel("temp").setProperty('/ZhfSottotipo', []);         
            //         self.closeDialog();
            //         return;
            //     }

            //     key = oEvent.getParameter("selectedItem").data("key");
            //     tipologiaId.setValue(selected.getTitle());
            //     self.ZhfTipoKey = key;
                
            //     if(key){
            //         var filters = []
            //         filters.push(
            //             new Filter({ path: "ZcodTipo", operator: FilterOperator.EQ, value1: key })
            //         )

            //         self.getOwnerComponent().getModel().read("/ZhfSottotipoSet", {
            //             filters: filters,
            //             success: function(data, oResponse){
            //                 self.getView().getModel("temp").setProperty('/ZhfSottotipo', data.results);
            //             },
            //             error: function(error){
            //             }
            //         });
            //     }
            //     else{
            //         self.getView().getModel("temp").setProperty('/ZhfSottotipo', []); 
            //     }
            //     self.closeDialog();
            // },

            handleValueHelpSearchZhfTipo:function(oEvent){
                var self = this,
                    sValue = oEvent.getParameter("value"),
                    oFilter = [],
                    qFilters = [];
            
                oFilter.push(self.createFilter("Ztipo", sap.ui.model.FilterOperator.Contains, sValue, false));
                qFilters = new sap.ui.model.Filter({filters:oFilter,and:false}); 
                oEvent.getSource().getBinding("items").filter(qFilters);
            },

            createFilter: function(key, operator, value, useToLower) {
                return new sap.ui.model.Filter(key, operator, useToLower ? "'" + value.toLowerCase() + "'" : value);
            },
            // ZhfTipo - END


            // esercizioGestione: function () {
            //     var that = this;
            //     var oMdl = new sap.ui.model.json.JSONModel();
            //     this.getOwnerComponent().getModel().read("/ZgjahrEngNiSet", {
            //         filters: [],
            //         urlParameters: "",
            //         success: function (data) {
            //             oMdl.setData(data.results);
            //             that.getView().getModel("temp").setProperty('/ZgjahrEngNiSet', data.results)
            //         },
            //         error: function (error) {
            //             var e = error;
            //         }
            //     });
            // },

            onCallHeader: function (oEvent) {
                var that = this;
                var oMdl = new sap.ui.model.json.JSONModel();
                this.getOwnerComponent().getModel().read("/HeaderNISet", {
                    filters: [],
                    urlParameters: "",
                    success: function (data) {
                        oMdl.setData(data.results);
                        that.getView().getModel("temp").setProperty('/HeaderNISet', data.results)
                    },
                    error: function (error) {
                        //that.getView().getModel("temp").setProperty(sProperty,[]);
                        //that.destroyBusyDialog();
                        var e = error;
                    }
                });
            },

            viewHeader1: function () {
                var url = location.href
                var sUrl = url.split("/wizardInserisciRiga/")[1]
                var aValori = sUrl.split(",")

                var Bukrs = aValori[0]
                var Gjahr = aValori[1]
                var Zamministr = aValori[2]
                var ZchiaveNi = aValori[3]
                var ZidNi = aValori[4]
                var ZRagioCompe = aValori[5]

                var header = this.getView().getModel("temp").getData().HeaderNISet
                for (var i = 0; i < header.length; i++) {
                    if (header[i].Bukrs == Bukrs &&
                        header[i].Gjahr == Gjahr &&
                        header[i].Zamministr == Zamministr &&
                        header[i].ZchiaveNi == ZchiaveNi &&
                        header[i].ZidNi == ZidNi &&
                        header[i].ZRagioCompe == ZRagioCompe) {

                        var progressivoNI = header[i].ZchiaveNi
                        this.getView().byId("numNI1").setText(progressivoNI)

                        var dataRegistrazione = header[i].ZdataCreaz
                        var dataNuova = new Date(dataRegistrazione),
                            mnth = ("0" + (dataNuova.getMonth() + 1)).slice(-2),
                            day = ("0" + dataNuova.getDate()).slice(-2);
                        var nData = [dataNuova.getFullYear(), mnth, day].join("-");
                        var nDate = nData.split("-").reverse().join(".");
                        this.getView().byId("dataReg1").setText(nDate)

                        var strAmmResp = header[i].Fistl
                        this.getView().byId("SARWH2").setText(strAmmResp)

                        var PF = header[i].Fipex
                        this.getView().byId("pos_FinWH2").setText(PF)

                        var oggSpesa = header[i].ZoggSpesa
                        this.getView().byId("oggSpesa1").setText(oggSpesa)

                        var mese = header[i].Zmese
                        switch (mese) {
                            case "1":
                                var nMese = "Gennaio"
                                break;
                            case "2":
                                var nMese = "Febbraio"
                                break;
                            case "3":
                                var nMese = "Marzo"
                                break;
                            case "4":
                                var nMese = "Aprile"
                                break;
                            case "5":
                                var nMese = "Maggio"
                                break;
                            case "6":
                                var nMese = "Giugno"
                                break;
                            case "7":
                                var nMese = "Luglio"
                                break;
                            case "8":
                                var nMese = "Agosto"
                                break;
                            case "9":
                                var nMese = "Settembre"
                                break;
                            case "10":
                                var nMese = "Ottobre"
                                break;
                            case "11":
                                var nMese = "Novembre"
                                break;
                            case "12":
                                var nMese = "Dicembre"
                                break;
                            default: break;
        
                        }
                        this.getView().byId("mese2").setText(nMese)

                        var statoNI = header[i].ZcodiStatoni
                        this.getView().byId("statoNI1").setText(statoNI)

                        var importoTot = header[i].ZimpoTotni

                        var num = importoTot.toString();
                        var importoPrimaVirgola = num.split(".")
                        //var indice = num.split("").length
                        var numPunti = ""
                        var migliaia = importoPrimaVirgola[0].split('').reverse().join('').match(/.{1,3}/g).map(function (x) {
                            return x.split('').reverse().join('')
                        }).reverse()

                        for (var v = 0; v < migliaia.length; v++) {
                            numPunti = (numPunti + migliaia[v] + ".")
                        }

                        var indice = numPunti.split("").length
                        var totale = numPunti.substring(0, indice - 1) + "," + importoPrimaVirgola[1]
                        let array = totale.split(",")
                        let valoreTagliato = array[1].substring(0, 2)
                        var totale = array[0] + "," + valoreTagliato
                        this.getView().byId("importoTot1").setText(totale)

                    }
                }
            },

            filtriStep1: function () {
                //console.log(oMdl)
                var url = location.href
                var sUrl = url.split("/wizardInserisciRiga/")[1]
                var aValori = sUrl.split(",")

                var Bukrs = aValori[0]
                var Gjahr = aValori[1]
                var Zamministr = aValori[2]
                var ZchiaveNi = aValori[3]
                var ZidNi = aValori[4]
                var ZRagioCompe = aValori[5]

                var header = this.getView().getModel("temp").getData().HeaderNISet
                //var position = this.getView().getModel("temp").getData().PositionNISet
                for (var i = 0; i < header.length; i++) {
                    if (header[i].Bukrs == Bukrs &&
                        header[i].Gjahr == Gjahr &&
                        header[i].Zamministr == Zamministr &&
                        header[i].ZchiaveNi == ZchiaveNi &&
                        header[i].ZidNi == ZidNi &&
                        header[i].ZRagioCompe == ZRagioCompe) {

                        var Fistl = header[i].Fistl
                        this.getView().byId("strAmmResp").setValue(Fistl)

                        var Fipex = header[i].Fipex
                        this.getView().byId("input_PF").setValue(Fipex)

                    }
                }
            },

            selectedRow: function () {
                var rows = this.getView().byId("HeaderNIW").getSelectedItems()
                // if(rows){
                //     oProprietà.setProperty("/HeaderNIWstep3Visible", false);
                // }
                var array = this.getView().getModel("temp").getData().PositionNISet
                for (var arr = 0; arr < array.length; arr++) {
                    var campo = array[arr]
                    var numeroIntero = array[arr].ZimpoTitolo
                    var numIntTot = ""
                    if (numeroIntero.split(".").length > 1) {
                        var numeri = numeroIntero.split(".")
                        for (var n = 0; n < numeri.length; n++) {
                            numIntTot = numIntTot + numeri[n]
                            //var numeroFloat = parseFloat(numeroIntero)
                            if (numIntTot.split(",").length > 1) {
                                var virgole = numIntTot.split(",")
                                var numeroInteroSM = virgole[0] + "." + virgole[1]
                            }
                        }
                        var importoPrimaVirgola = numeroIntero.split(".")
                        var numPunti = ""
                        var migliaia = importoPrimaVirgola[0].split('').reverse().join('').match(/.{1,3}/g).map(function (x) {
                            return x.split('').reverse().join('')
                        }).reverse()

                        for (var migl = 0; migl < migliaia.length; migl++) {
                            numPunti = (numPunti + migliaia[migl] + ".")
                        }
                        var indice = numPunti.split("").length
                        var numeroIntero = numPunti.substring(0, indice - 1) + "," + importoPrimaVirgola[1]
                        campo.ZimpoTitolo = numIntTot
                    }

                    else {
                        var importoPrimaVirgola = numeroIntero.split(",")
                        var numeroInteroSM = importoPrimaVirgola[0] + "." + importoPrimaVirgola[1]
                        campo.ZimpoTitolo = numeroIntero
                    }
                }
                //var array = []
                var oMdlWstep3 = new sap.ui.model.json.JSONModel();
                for (var i = 0; i < rows.length; i++) {
                    var campo = rows[i].getBindingContext("HeaderNIW").getObject()
                    campo.ZimpoTitolo = campo.ZimpoRes
                    campo.ZimpoRes = "0.00"
                    array.push(campo)
                }
                oMdlWstep3.setData(array);
                this.getView().setModel(oMdlWstep3, "HeaderNIWstep3");
                // console.log(oMdlWstep3)
            },

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
                  arrs=[],
                  filters = [];
              
              filters.push(new Filter({ path: "Gjahr", operator: FilterOperator.EQ, value1: self.getView().getModel(PREIMPOSTAZIONENI_MODEL).getProperty("/ZgjahrEng") }));
              filters.push(new Filter({ path: "Zmese", operator: FilterOperator.EQ, value1: self.getView().getModel(PREIMPOSTAZIONENI_MODEL).getProperty("/meseValore") }));

              if(self.getView().getModel(PREIMPOSTAZIONENI_MODEL).getProperty("/tipologia") !== ""){
                arrs = self.getView().getModel(PREIMPOSTAZIONENI_MODEL).getProperty("/tipologia").split(",");
                for(var i=0; i<arrs.length;i++){
                  var item = arrs[i];
                  filters.push(new Filter({ path: "ZcodTipo", operator: FilterOperator.EQ, value1: item }));
                }
              }
              //filters.push(new Filter({ path: "ZcodTipo", operator: FilterOperator.EQ, value1: self.getView().getModel(PREIMPOSTAZIONENI_MODEL).getProperty("/tipologia") }));
              
              if(self.getView().getModel(PREIMPOSTAZIONENI_MODEL).getProperty("/sottotipologia") !== ""){
                arrs = self.getView().getModel(PREIMPOSTAZIONENI_MODEL).getProperty("/sottotipologia").split(",");
                for(var i=0; i<arrs.length;i++){
                  var item = arrs[i];
                  filters.push(new Filter({ path: "ZcodSottotipo", operator: FilterOperator.EQ, value1: item }));
                }
              }
              //filters.push(new Filter({ path: "ZcodSottotipo", operator: FilterOperator.EQ, value1: self.getView().getModel(PREIMPOSTAZIONENI_MODEL).getProperty("/sottotipologia") }));
              
              if(self.getView().getModel(PREIMPOSTAZIONENI_MODEL).getProperty("/competenza") !== "")
                  filters.push(new Filter({ path: "ZcompRes", operator: FilterOperator.EQ, value1: self.getView().getModel(PREIMPOSTAZIONENI_MODEL).getProperty("/competenza").toUpperCase() }));
              
              if(self.getView().getModel(MODEL_ENTITY).getProperty("/Header/ZchiaveNi") && self.getView().getModel(MODEL_ENTITY).getProperty("/Header/ZchiaveNi") !== "")
                filters.push(new Filter({ path: "ZchiaveNi", operator: FilterOperator.EQ, value1: self.getView().getModel(MODEL_ENTITY).getProperty("/Header/ZchiaveNi") }));
              
              self.getView().setBusy(true);
              self.getOwnerComponent().getModel().read("/RendicontazioneSet", {
                  filters:filters,
                  success: function(data, oResponse){
                      self.getView().getModel(MODEL_ENTITY).setProperty('/RendicontazioneSet', data.results);
                      self.getView().setBusy(false);
                  },
                  error: function(error){
                      self.getView().getModel(MODEL_ENTITY).setProperty('/RendicontazioneSet', []);
                      self.getView().setBusy(false);
                  }
              });
          },

            onPreimpNI: function (oEvent) {
              var self = this,
                header = self.getView().getModel(MODEL_ENTITY).getProperty("/Header"),
                array = self.getView().getModel(PREIMPOSTAZIONENI_MODEL).getProperty("/titoliSelezionatiStep3"), 
                oDataModel = self.getOwnerComponent().getModel();

              var deepEntity = {
                Bukrs:  header.Bukrs,
                Gjahr: header.Gjahr,
                Zamministr: header.Zamministr,
                ZchiaveNi: header.ZchiaveNi,      //dichiarati fuori dal ciclo e presi dal item 0 perchè sono tutte uguali
                ZidNi: header.ZidNi,
                ZRagioCompe: header.ZRagioCompe,
                Operation: "I",
                Funzionalita: 'RETTIFICANIPREIMPOSTATA',
                PositionNISet: []
              }

              for (var i = 0; i < array.length; i++) {
                var item = array[i];
                deepEntity.PositionNISet.push({
                  Bukrs: header.Bukrs,                     
                  Gjahr: header.Gjahr,                     
                  Zamministr: header.Zamministr,           
                  ZchiaveNi: header.ZchiaveNi,             
                  ZidNi: header.ZidNi,                     
                  ZRagioCompe: header.ZRagioCompe,         
                  ZposNi: item.ZposNi,    
                  
                  Ztipo: item.Ztipo,
                  Zsottotipo: item.Zsottotipo,
                  ZcompRes: item.ZcompRes,
                  ZimpoTitolo: item.ZimpoTitolo,
                  Zdescrizione: item.Zdescrizione, 
                  ZcodIsin: item.ZcodIsin,        
                  ZdataPag: new Date(item.ZdataPag),
                  
                  Ztassoint: item.Ztasso,
                  ZdataInizio: item.ZdataInizio,
                  Iban: item.ZibanAdd,  
                  Zfbdt: item.ZdataScad,
                  Zidentificativo: item.Zidentificativo
                });
              }

              MessageBox.warning("Sei sicuro di voler rettificare la nota d'imputazione?", {
                title: "Inserire Posizione",
                actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
                emphasizedAction: MessageBox.Action.YES,
                onClose: function (oAction) {
                    if (oAction === sap.m.MessageBox.Action.YES) {
                        oDataModel.create("/DeepPositionNISet", deepEntity, {
                            success: function (result) {
                                if(result.Msgty === 'S'){
                                    MessageBox.success("Nota di Imputazione n." + header.ZchiaveNi + " rettificata correttamente", {
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
                                    });
                                }
                                else{
                                  MessageBox.error(result.Message, {
                                    actions: [sap.m.MessageBox.Action.OK],
                                    emphasizedAction: MessageBox.Action.OK,
                                  });
                                }
                            },
                            error: function (err) {
                                console.log(err);
                                MessageBox.error("Nota d'imputazione non rettificata correttamente", {
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
            },

            onBackButton:function(oEvent){
              var self =this,
                  wizard = self.getView().byId("InserisciRigaWizard"),
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

            resetModelsForExitWizard:function(){
              var self= this,
                oTable = self.getView().byId("HeaderNIW");
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

              self.getView().getModel(MODEL_ENTITY).setProperty("/Header",[]);
              self.getView().getModel(MODEL_ENTITY).setProperty("/RendicontazioneSet",[]);
              self.getView().getModel(MODEL_ENTITY).setProperty("/ZhfTipo",[]);
              self.getView().getModel(MODEL_ENTITY).setProperty("/ZhfSottotipo",[]);
              oTable.setSelectedContextPaths([]);
            },


            onNextButton:function(oEvent){
              var self =this,                    
                  wizard = self.getView().byId("InserisciRigaWizard"),
                  oTable = self.getView().byId("HeaderNIW"),
                  currentStep = self.getView().byId(wizard.getCurrentStep()).data("stepId"),
                  visibilita=null;
              if(!self.getView().getModel(MODEL_ENTITY).getProperty("/Visibilita") || 
                  self.getView().getModel(MODEL_ENTITY).getProperty("/Visibilita")===null ||
                  self.getView().getModel(MODEL_ENTITY).getProperty("/Visibilita").length === 0){

                  self.callVisibilitaWithCallbackLocal(function(callback){
                      if(callback){
                          visibilita = self.getView().getModel(MODEL_ENTITY).getProperty("/Visibilita")[0];
                      }
                  });   
              }
              else
                  visibilita = self.getView().getModel(MODEL_ENTITY).getProperty("/Visibilita")[0];    

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
                  });
                  break;
                case "3":
                  wizard.nextStep();
                  break;
                default:
                  console.log("default");
              }
            },

            _getSelectedStep1:function(){
              var self = this,
                  array=[],
                  rendicontazioneTotale=0,
                  oTable = self.getView().byId("HeaderNIW"),
                  oTableModel = self.getView().getModel(MODEL_ENTITY).getProperty("/RendicontazioneSet");
              
              console.log(oTableModel);
              for(var i=0; i<oTable.getSelectedContextPaths().length;i++){
                  var item = oTable.getModel(MODEL_ENTITY).getObject(oTable.getSelectedContextPaths()[i]);
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
              
              self.callPositionNiSet(self.getView().getModel(MODEL_ENTITY).getProperty("/Header"),function(callback){
                if(callback.success){
                  for(var i=0; i<callback.data.length;i++){
                    var item = {
                      Bukrs: callback.data[i].Bukrs,
                      Gjahr: callback.data[i].Gjahr,
                      ZchiaveNi: callback.data[i].ZchiaveNi,
                      ZcodIsin: callback.data[i].ZcodIsin,
                      ZcompRes:callback.data[i].ZcompRes,
                      ZdataInizio:callback.data[i].ZdataInizio,
                      ZdataPag:callback.data[i].ZdataPag,
                      ZdataScad:null,
                      Zdescrizione:callback.data[i].Zdescrizione,
                      ZibanAdd:callback.data[i].Iban,
                      ZimpoRes:callback.data[i].ZimpoRes,
                      ZimpoTitolo:callback.data[i].ZimpoTitolo,
                      Zmese: self.getView().getModel(MODEL_ENTITY).getProperty("/Header").Zmese,
                      Zsottotipo:callback.data[i].Zsottotipo,
                      Ztipo: callback.data[i].Ztipo,
                      Ztipologia: callback.data[i].Ztipologia,
                      ZposNi:callback.data[i].ZposNi,
                    };
                    arrayStep3.push(item);
                  }
                }
                self.getView().getModel(PREIMPOSTAZIONENI_MODEL).setProperty("/titoliSelezionatiStep3",arrayStep3);
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

            callVisibilitaWithCallbackLocal:function(callback){
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
                    self.getView().getModel(MODEL_ENTITY).setProperty("/Visibilita", data.results);
                    callback(true);
                  },
                error: function (error) {
                  console.log(error)
                  var e = error;
                  callback(false);
                }   
              });
            },

        });
    });