sap.ui.define([
    "./BaseController",
    "sap/ui/model/Filter",
    "sap/m/MessageBox",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/routing/History",
    'project1/model/DateFormatter',          
    'sap/ui/model/json/JSONModel',
],
    function (BaseController, Filter, MessageBox, FilterOperator, History, DateFormatter,JSONModel) {
        "use strict";

        const MODEL_ENTITY = "EntityModel";
        return BaseController.extend("project1.controller.aImpegno", {
            formatter: DateFormatter,
            onInit() {
                var self =this;
                var oModelJson = new JSONModel({
                    Header:null,
                    HeaderNIAssImp:[],
                    PositionNI:[],
                    TotAttribuito:self.formatter.convertFormattedNumber((0).toFixed(2))
                    // TotAttribuito:(0).toFixed(2)              
                });     

                var oInputZattributo = self.getView().byId("Zattributo");
                oInputZattributo.attachBrowserEvent("keypress",
                DateFormatter.acceptOnlyNumbers
                );

                self.getOwnerComponent().getModel("temp");
                self.getView().setModel(oModelJson,MODEL_ENTITY); 
                self.getRouter().getRoute("aImpegno").attachPatternMatched(self._onObjectMatched, self);
                // self.setEsercizio_Amministrazione()
                //this.onCallZdispon()
            },
            
            _onObjectMatched: function (oEvent) {
                var self =this;
                self.getView().getModel("temp").setProperty('/SalvaImpegnoValues', null);
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
                            self.onModificaNISet(data, function(callback){
                                if(callback.success){
                                    if(callback.data.length>0){
                                        var item = callback.data[0];
                                        self.getView().getModel(MODEL_ENTITY).setProperty("/Header/ZcompRes",item.ZcompRes);
                                    }
                                    self.setEsercizio_Amministrazione();
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

            onBackButton: function () {
                var self =this,
                    table = self.getView().byId("HeaderNIAssImp");
                self.getView().getModel(MODEL_ENTITY).setProperty("/Header",null);
                self.getView().getModel(MODEL_ENTITY).setProperty("/HeaderNIAssImp",[]);
                self.getView().getModel(MODEL_ENTITY).setProperty("/PositionNI",[]);
                self.getView().getModel(MODEL_ENTITY).setProperty("/TotAttribuito",(0).toFixed(2));
                self.getView().getModel("temp").setProperty("/ImpegniSelezionati", []);
                table.removeSelections(true);
                table.setSelectedContextPaths([]);
                window.history.go(-1);
            },

            onForwardButton: function (oEvent) {
                var self =this,
                    oBundle = self.getResourceBundle(),
                    table = self.getView().byId("HeaderNIAssImp"),
                    selectedArray = table.getSelectedContextPaths(),
                    header = self.getView().getModel(MODEL_ENTITY).getProperty("/Header"),
                    tableAss = self.getView().getModel(MODEL_ENTITY).getProperty("/HeaderNIAssImp");

                var validObj ={
                    validate:true,
                    message:""
                };    
                
                var importoTotaleNI = header.ZimpoTotni;
                var total = 0,
                    impegni = [];
                for(var i=0;i<selectedArray.length;i++){
                    var item = self.getView().getModel(MODEL_ENTITY).getProperty(selectedArray[i]);
                    if(parseFloat(item.Wtfree) < parseFloat(item.Attribuito)){
                        validObj.validate=false;
                        validObj.message = "Il valore del campo Importo Attribuito non può essere maggiore al campo Disponibilità Impegno";
                        i = selectedArray.length;
                    }
                    total = parseFloat(total) + parseFloat(item.Attribuito);
                    impegni.push(item);
                }

                if(!validObj.validate){
                    sap.m.MessageBox.error(validObj.message,          
                    {          
                        title: oBundle.getText("titleDialogError"),          
                        onClose: function (oAction) {
                            return false;          
                        },
                    });
                    return false;
                }

                if(parseFloat(importoTotaleNI) !== parseFloat(total)){
                    sap.m.MessageBox.error("La somma dei campi Importo Attribuito deve essere uguale all'Importo Totale della nota",          
                    {          
                        title: oBundle.getText("titleDialogError"),          
                        onClose: function (oAction) {
                            return false;          
                        },
                    });
                    return false;
                }

                self.getView().getModel("temp").setProperty("/ImpegniSelezionati", impegni);
                self.getOwnerComponent().getRouter().navTo("aImpegno2", 
                    { 
                        campo: header.Bukrs, 
                        campo1: header.Gjahr, 
                        campo2: header.Zamministr, 
                        campo3: header.ZchiaveNi, 
                        campo4: header.ZidNi, 
                        campo5: header.ZRagioCompe
                    });                          

            },


            setEsercizio_Amministrazione: function () {
                var self =this,
                    header = self.getView().getModel(MODEL_ENTITY).getProperty("/Header");
                
                self.getView().byId("es_gestione").setValue(header.Gjahr);
                self.getView().byId("inputAmm").setValue(header.Zamministr);    
            },

            onSearch: function (oEvent) {
                var self =this,
                    filters = [],
                    header = self.getView().getModel(MODEL_ENTITY).getProperty("/Header");

                if(!header || header === null)
                    return false;
                self.getView().setBusy(true);
            
                if (self.getView().byId("es_gestione") && self.getView().byId("es_gestione").getValue() !== "") {
                    filters.push(new Filter({path: "Gjahr",operator: FilterOperator.EQ,value1: self.getView().byId("es_gestione").getValue()}));
                }

                if (self.getView().byId("inputDecreto") && self.getView().byId("inputDecreto").getValue() !== "") {
                    filters.push(new Filter({path: "Zcoddecr",operator: FilterOperator.EQ,value1: self.getView().byId("inputDecreto").getValue()}));
                }

                if (self.getView().byId("inputAmm") && self.getView().byId("inputAmm").getValue() !== "") {
                    filters.push(new Filter({path: "Zammin",operator: FilterOperator.EQ,value1: self.getView().byId("inputAmm").getValue()}));
                }

                if (self.getView().byId("inputIPE") && self.getView().byId("inputIPE").getValue()  !== "") {
                    filters.push(new Filter({path: "ZCodIpe",operator: FilterOperator.EQ,value1: self.getView().byId("inputIPE").getValue()}));
                }

                if (self.getView().byId("inputaUff") && self.getView().byId("inputaUff").getValue() !== "") {
                    filters.push(new Filter({path: "Zufficioliv1",operator: FilterOperator.EQ,value1: self.getView().byId("inputaUff").getValue()}));
                }

                if (self.getView().byId("inputbUff") && self.getView().byId("inputbUff").getValue() !== "") {
                    filters.push(new Filter({path: "Zufficioliv2",operator: FilterOperator.EQ,value1: self.getView().byId("inputbUff").getValue()}));
                }

                if (self.getView().byId("inputClaus") && self.getView().byId("inputClaus").getValue() !== "") {
                    filters.push(new Filter({path: "ZNumCla",operator: FilterOperator.EQ,value1: self.getView().byId("inputClaus").getValue()}));
                }
                if (header.Fipex && header.Fipex !== "") {
                    filters.push(new Filter({path: "Fipex",operator: FilterOperator.EQ,value1: header.Fipex}));
                }
                if (header.Fistl && header.Fistl !== "") {
                    filters.push(new Filter({path: "Fistl",operator: FilterOperator.EQ,value1: header.Fistl}));                        
                }
                if (header.Bukrs && header.Bukrs !== "") {
                    filters.push(new Filter({path: "Bukrs",operator: FilterOperator.EQ,value1: header.Bukrs}));                            
                }

                self.getOwnerComponent().getModel().read("/ZfmimpegniIpeSet", {
                    urlParameters: {'hasWtfree': 'X' },
                    filters: filters,
                    success: function (data) {
                        console.log(data.results);
                        self.getView().getModel("temp").setProperty('/ZfmimpegniIpeSet', data.results);
                        self.getView().getModel(MODEL_ENTITY).setProperty("/HeaderNIAssImp", data.results);
                        self.getView().setBusy(false);
                    },
                    error: function (e) {
                        console.log(e);
                        self.getView().setBusy(false);
                    }
                });
            },

            onCalcolaPress: function (oEvent) {
                var self =this,
                    oBundle = self.getResourceBundle(),
                    header = self.getView().getModel(MODEL_ENTITY).getProperty("/Header"),
                    tableAss = self.getView().getModel(MODEL_ENTITY).getProperty("/HeaderNIAssImp"),
                    table = self.getView().byId("HeaderNIAssImp"),
                    selectedArray = table.getSelectedContextPaths();

                if(!header || header === null)
                    return false;    

                if(!selectedArray || selectedArray === null || selectedArray.length === 0){
                    sap.m.MessageBox.error("Nesuna riga selezionata",          
                    {          
                        title: oBundle.getText("titleDialogError"),          
                        onClose: function (oAction) {
                            return false;          
                        },
                    });
                    return false;
                }
                selectedArray.sort();
                var importoTotaleNI = header.ZimpoTotni;
                var full=false;
                for(var i=0; i<selectedArray.length;i++){
                  var item = self.getView().getModel(MODEL_ENTITY).getProperty(selectedArray[i]);
                  if(!full){
                    if(parseFloat(importoTotaleNI) <= parseFloat(item.Wtfree)){
                        self.getView().getModel(MODEL_ENTITY).setProperty(selectedArray[i]+"/Attribuito",parseFloat(importoTotaleNI).toFixed(2));
                        full= true;
                        // i=selectedArray.length;
                    }else{
                        self.getView().getModel(MODEL_ENTITY).setProperty(selectedArray[i]+"/Attribuito",parseFloat(item.Wtfree).toFixed(2));
                        importoTotaleNI = parseFloat(importoTotaleNI) - parseFloat(item.Wtfree);
                    }
                  }
                  else{
                    self.getView().getModel(MODEL_ENTITY).setProperty(selectedArray[i]+"/Attribuito",parseFloat(0).toFixed(2));
                  }
                }

                var tot = 0;
                for(var i=0; i< selectedArray.length;i++){
                    var item = self.getView().getModel(MODEL_ENTITY).getProperty(selectedArray[i]);
                    tot = tot + parseFloat(item.Attribuito);
                }
                self.getView().getModel(MODEL_ENTITY).setProperty("/TotAttribuito", self.formatter.convertFormattedNumber(tot.toFixed(2)));                 
            },


            zAttribuitoLiveChange:function(oEvent){
                var self =this,
                    table = self.getView().byId("HeaderNIAssImp"),
                    path  =oEvent.getSource().getParent().getBindingContextPath(),
                    value = oEvent.getParameters().value,
                    tot = 0;

                self.getView().getModel(MODEL_ENTITY).setProperty(path+"/Attribuito",value === "" ? 0 : value);
                var selectedArray = table.getSelectedContextPaths();
                //var table = self.getView().getModel(MODEL_ENTITY).getProperty("/HeaderNIAssImp");
                for(var i=0;i<selectedArray.length;i++){
                    var item = self.getView().getModel(MODEL_ENTITY).getProperty(selectedArray[i]);
                    tot = tot + parseFloat(item.Attribuito);
                }
                // self.getView().getModel(MODEL_ENTITY).setProperty("/TotAttribuito", tot.toFixed(2));
                self.getView().getModel(MODEL_ENTITY).setProperty("/TotAttribuito", self.formatter.convertFormattedNumber(tot.toFixed(2))); 
            },

            zAttribuitoLiveChange_old:function(oEvent){
                var self =this,
                    path  =oEvent.getSource().getParent().getBindingContextPath(),
                    value = oEvent.getParameters().value,
                    tot = 0;

                self.getView().getModel(MODEL_ENTITY).setProperty(path+"/Attribuito",value === "" ? 0 : value);

                var table = self.getView().getModel(MODEL_ENTITY).getProperty("/HeaderNIAssImp");
                for(var i=0;i<table.length;i++){
                    var item = table[i];
                    tot = tot + parseFloat(item.Attribuito);
                }
                self.getView().getModel(MODEL_ENTITY).setProperty("/TotAttribuito", tot.toFixed(2));
            },

        });
    },
);