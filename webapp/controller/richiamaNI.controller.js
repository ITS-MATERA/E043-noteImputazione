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

        return BaseController.extend("project1.controller.richiamaNI", {
            formatter: DateFormatter,
            onInit() {

                var oProprietà = new JSONModel(),
                    oInitialModelState = Object.assign({}, oData);
                oProprietà.setData(oInitialModelState);
                this.getView().setModel(oProprietà);
                this.getOwnerComponent().getModel("temp");
                this.callVisibilità()
                this.getRouter().getRoute("richiamaNI").attachPatternMatched(this._onObjectMatched, this);

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

            // callVisibilità: function () {
            //     var that = this
            //     var filters = []
            //     filters.push(
            //         new Filter({ path: "SEM_OBJ", operator: FilterOperator.EQ, value1: "ZS4_NOTEIMPUTAZIONI_SRV" }),
            //         new Filter({ path: "AUTH_OBJ", operator: FilterOperator.EQ, value1: "Z_GEST_NI" })
            //     )
            //     // "ODataModel" required from module "sap/ui/model/odata/v2/ODataModel"
            //     var visibilità = new ODataModel("http://10.38.125.80:8000/sap/opu/odata/sap/ZSS4_CA_CONI_VISIBILITA_SRV/");
            //     visibilità.read("/ZES_CONIAUTH_SET", {
            //         filters: filters,
            //         urlParameters: "",
            //         success: function (data) {
            //             console.log("success")
            //             //oMdl.setData(data.results);
            //             that.getView().getModel("temp").setProperty('/Visibilità', data.results)
            //             that.pulsantiVisibiltà(data.results)
            //         },
            //         error: function (error) {
            //             console.log(error)
            //             //that.getView().getModel("temp").setProperty(sProperty,[]);
            //             //that.destroyBusyDialog();
            //             var e = error;
            //         }
            //     });
            // },

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
                this.getView().bindElement(
                    "/HeaderNISet('Bukrs='" + oEvent.getParameters().arguments.campo +
                    "',Gjahr='" + oEvent.getParameters().arguments.campo1 +
                    "',Zamministr='" + oEvent.getParameters().arguments.campo2 +
                    "',ZchiaveNi='" + oEvent.getParameters().arguments.campo3 +
                    "',ZidNi='" + oEvent.getParameters().arguments.campo4 +
                    "',ZRagioCompe='" + oEvent.getParameters().arguments.campo5 + "')"
                );
                this.callPositionNI()
                //this.viewHeader(oEvent)
            },

            callPositionNI: function () {

                var url = location.href
                var sUrl = url.split("/richiamaNI/")[1]
                var aValori = sUrl.split(",")

                var Bukrs = aValori[0]
                var Gjahr = aValori[1]
                var Zamministr = aValori[2]
                var ZchiaveNi = aValori[3]
                var ZidNi = aValori[4]
                var ZRagioCompe = aValori[5]

                var filtroNI = []
                var header = this.getOwnerComponent().getModel("temp").getData().HeaderNISet
                //var position = this.getView().getModel("temp").getData().PositionNISet
                for (var i = 0; i < header.length; i++) {

                    if (header[i].Bukrs == Bukrs &&
                        header[i].Gjahr == Gjahr &&
                        header[i].Zamministr == Zamministr &&
                        header[i].ZchiaveNi == ZchiaveNi &&
                        header[i].ZidNi == ZidNi &&
                        header[i].ZRagioCompe == ZRagioCompe) {

                        //filtroNI.push({Bukrs:Bukrs, Gjahr:Gjahr, Zamministr,Zamministr, ZchiaveNi:ZchiaveNi, ZidNi:ZidNi, ZRagioCompe:ZRagioCompe})
                        filtroNI.push(new Filter({
                            path: "Bukrs",
                            operator: FilterOperator.EQ,
                            value1: header[i].Bukrs
                        }));
                        filtroNI.push(new Filter({
                            path: "Gjahr",
                            operator: FilterOperator.EQ,
                            value1: header[i].Gjahr
                        }));
                        filtroNI.push(new Filter({
                            path: "Zamministr",
                            operator: FilterOperator.EQ,
                            value1: header[i].Zamministr
                        }));
                        filtroNI.push(new Filter({
                            path: "ZchiaveNi",
                            operator: FilterOperator.EQ,
                            value1: header[i].ZchiaveNi
                        }));
                        filtroNI.push(new Filter({
                            path: "ZidNi",
                            operator: FilterOperator.EQ,
                            value1: header[i].ZidNi
                        }));
                        filtroNI.push(new Filter({
                            path: "ZRagioCompe",
                            operator: FilterOperator.EQ,
                            value1: header[i].ZRagioCompe
                        }));
                        // filtroNI.push(new Filter({
                        //     path: "ZposNi",
                        //     operator: FilterOperator.EQ,
                        //     value1: ZposNi
                        // }));


                        var that = this;
                        var oMdlITB = new sap.ui.model.json.JSONModel();
                        this.getOwnerComponent().getModel().read("/PositionNISet", {
                            filters: filtroNI,
                            //filters: [],
                            urlParameters: "",

                            success: function (data) {
                                oMdlITB.setData(data.results);
                                that.getView().getModel("temp").setProperty('/PositionNISet', data.results)
                                // for (var dr = 0; dr < data.results.length; dr++) {

                                //     var importoPrimaVirgola = data.results[dr].ZimpoTitolo.split(".")
                                //     //var indice = num.split("").length
                                //     var numPunti = ""
                                //     var migliaia = importoPrimaVirgola[0].split('').reverse().join('').match(/.{1,3}/g).map(function (x) {
                                //         return x.split('').reverse().join('')
                                //     }).reverse()

                                //     for (var v = 0; v < migliaia.length; v++) {
                                //         numPunti = (numPunti + migliaia[v] + ".")
                                //     }

                                //     var indice = numPunti.split("").length
                                //     var totale = numPunti.substring(0, indice - 1) + "," + importoPrimaVirgola[1]
                                //     let array = totale.split(",")
                                //     let valoreTagliato = array[1].substring(0, 2)
                                //     var totale = array[0] + "," + valoreTagliato
                                //     that.getView().byId("richiamaNI").getItems()[dr].mAggregations.cells[5].setText(totale)

                                // }
                                that.viewHeader(data.results)
                            },
                            error: function (error) {
                                var e = error;
                            }
                        });
                        this.getOwnerComponent().setModel(oMdlITB, "richiamaNI");
                        this.callWorkflow()

                    }
                }

            },

            viewHeader: function (position) {
                // console.log(this.getView().getModel("temp").getData(
                // "/HeaderNISet('"+ oEvent.getParameters().arguments.campo +
                // "','"+ oEvent.getParameters().arguments.campo1 +
                // "','"+ oEvent.getParameters().arguments.campo2 +
                // "','"+ oEvent.getParameters().arguments.campo3 +
                // "','"+ oEvent.getParameters().arguments.campo4 +
                // "','"+ oEvent.getParameters().arguments.campo5 + "')"))
                var url = location.href
                var sUrl = url.split("/richiamaNI/")[1]
                var aValori = sUrl.split(",")

                var Bukrs = aValori[0]
                var Gjahr = aValori[1]
                var Zamministr = aValori[2]
                var ZchiaveNi = aValori[3]
                var ZidNi = aValori[4]
                var ZRagioCompe = aValori[5]

                var header = this.getView().getModel("temp").getData().HeaderNISet
                var position = position
                var firmaSet = this.getView().getModel("temp").getData().firmaSet
                //var valoriNuovi = this.getView().getModel("temp").getData().ValoriNuovi
                //var ImpegniSelezionati = this.getView().getModel("temp").getData().ImpegniSelezionati

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
                        this.getView().byId("mese1").setText(nMese)

                        for (var x = 0; x < position.length; x++) {
                            if (position[x].Bukrs == Bukrs &&
                                position[x].Gjahr == Gjahr &&
                                position[x].Zamministr == Zamministr &&
                                position[x].ZchiaveNi == ZchiaveNi &&
                                position[x].ZidNi == ZidNi &&
                                position[x].ZRagioCompe == ZRagioCompe) {

                                var comp = position[x].ZcompRes
                                if (comp == "C") var n_comp = 'Competenza'
                                if (comp == "R") var n_comp = 'Residui'       //Position
                                this.getView().byId("comp1").setText(n_comp)

                                var beneficiario = position[x].Lifnr
                                this.onCallFornitore(beneficiario)
                                this.getView().byId("Lifnr1").setText(beneficiario)

                                var centroCosto = position[x].Kostl
                                this.getView().byId("CentroCosto1").setText(centroCosto)

                                var centroCOGE = position[x].Saknr
                                this.getView().byId("ConCoGe1").setText(centroCOGE)

                                var codiceGestionale = position[x].Zcodgest
                                this.getView().byId("CodiceGes1").setText(codiceGestionale)

                                var causalePagamento = position[x].Zcauspag
                                this.getView().byId("CausalePagamento1").setText(causalePagamento)

                                // var modalitàPagamento = position[x].Zwels
                                var modalitàPagamento = position[x].Zdescwels;
                                this.getView().byId("Zwels1").setText(modalitàPagamento)

                                // var Zcodgest = data[x].Zcodgest
                                // this.getView().byId("CodiceGes1").setText(Zcodgest)

                                // var Zcauspag = data[x].Zcauspag
                                // this.getView().byId("CausalePagamento1").setText(Zcauspag)
                            }
                        }

                        var statoNI = header[i].ZcodiStatoni
                        this.getView().byId("statoNI1").setText(statoNI)

                        var importoTot = header[i].ZimpoTotni
                        this.getView().byId("importoTot1").setText(importoTot)
                        this.getView().byId("ImpLiq1").setText(importoTot)

                        var codUff = header[i].ZuffcontFirm
                        var dirigente = header[i].ZdirncRich
                        this.getView().byId("CodiceUff1").setText(codUff)
                        this.getView().byId("dirigente1").setText(dirigente)

                    }
                }
            },

            onCallFornitore(beneficiario){
                var filtriFornitori = []
                var that = this
                var oMdlFor = new sap.ui.model.json.JSONModel();
                //var Lifnr = this.getView().byId("inputBeneficiario").getValue()

                // filtriFornitori.push(new Filter({
                //     path: "Lifnr",
                //     operator: FilterOperator.EQ,
                //     value1: Lifnr
                // }));

                var chiavi = this.getOwnerComponent().getModel().createKey("/FornitoreSet", {
                    Lifnr: beneficiario
                });

                this.getOwnerComponent().getModel().read(chiavi, {
                    filters: filtriFornitori,
                    success: function (data) {
                        oMdlFor.setData(data);
                        that.getView().getModel("temp").setProperty('/FornitoreSet', data)
                        that.getView().byId("Nome1").setText(data.ZzragSoc)

                    },
                    error: function (error) {
                        var e = error;
                    }
                });
            },

            callWorkflow: function () {

                var url = location.href
                var sUrl = url.split("/richiamaNI/")[1]
                var aValori = sUrl.split(",")

                var Bukrs = aValori[0]
                var Gjahr = aValori[1]
                var Zamministr = aValori[2]
                var ZchiaveNi = aValori[3]
                var ZidNi = aValori[4]
                var ZRagioCompe = aValori[5]
                
                var filtroNI = []
                var header = this.getView().getModel("temp").getData().HeaderNISet
                //var position = this.getView().getModel("temp").getData().PositionNISet
                for (var i = 0; i < header.length; i++) {

                    if (header[i].Bukrs == Bukrs &&
                        header[i].Gjahr == Gjahr &&
                        header[i].Zamministr == Zamministr &&
                        header[i].ZchiaveNi == ZchiaveNi &&
                        header[i].ZidNi == ZidNi &&
                        header[i].ZRagioCompe == ZRagioCompe) {

                        //filtroNI.push({Bukrs:Bukrs, Gjahr:Gjahr, Zamministr,Zamministr, ZchiaveNi:ZchiaveNi, ZidNi:ZidNi, ZRagioCompe:ZRagioCompe})
                        filtroNI.push(new Filter({
                            path: "ZchiaveNi",
                            operator: FilterOperator.EQ,
                            value1: header[i].ZchiaveNi
                        }));

                        var that = this;
                        //var oMdlITB = new sap.ui.model.json.JSONModel();
                        this.getOwnerComponent().getModel().read("/WFStateNISet", {
                            filters: filtroNI,
                            //filters: [],
                            urlParameters: "",

                            success: function (data) {
                                that.getView().getModel("temp").setProperty('/WFStateNI', data.results)
                            
                            },
                            error: function (error) {
                                var e = error;
                            }
                        });
                    }
                }

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
                window.history.go(-1);
            },

            onRegistraRilievo: function () {
                var url = location.href
                var sUrl = url.split("/richiamaNI/")[1]
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
                        this.getOwnerComponent().getRouter().navTo("registrazioneRilievo", { campo: header[i].Bukrs, campo1: header[i].Gjahr, campo2: header[i].Zamministr, campo3: header[i].ZchiaveNi, campo4: header[i].ZidNi, campo5: header[i].ZRagioCompe });
                    }
                }
            },

            onConfermaNI: function () {
                var that = this

                var url = location.href
                var sUrl = url.split("/richiamaNI/")[1]
                var aValori = sUrl.split(",")

                var Bukrs = aValori[0]
                var Gjahr = aValori[1]
                var Zamministr = aValori[2]
                var ZchiaveNi = aValori[3]
                var ZidNi = aValori[4]
                var ZRagioCompe = aValori[5]

                //var oItems = that.getView().byId("").getBinding("items").oList;
                var header = this.getView().getModel("temp").getData().HeaderNISet
                for (var i = 0; i < header.length; i++) {
                    if (header[i].Bukrs == Bukrs &&
                        header[i].Gjahr == Gjahr &&
                        header[i].Zamministr == Zamministr &&
                        header[i].ZchiaveNi == ZchiaveNi &&
                        header[i].ZidNi == ZidNi &&
                        header[i].ZRagioCompe == ZRagioCompe) {

                        var indiceHeader = i

                        var deepEntity = {
                            HeaderNISet: null,
                            Funzionalita: 'CONFERMA',
                        }

                        //var statoNI = this.getView().byId("idModificaDettaglio").mBindingInfos.items.binding.oModel.oZcodiStatoni
                        MessageBox.warning("Sei sicuro di voler confermare la Nota d'Imputazione n° " + header[i].ZchiaveNi + "?", {
                            title: "Conferma",
                            actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
                            emphasizedAction: MessageBox.Action.YES,
                            onClose: function (oAction) {
                                if (oAction === sap.m.MessageBox.Action.YES) {
                                    var oModel = that.getOwnerComponent().getModel();

                                    deepEntity.ZchiaveNi = that.getView().byId("numNI1").mProperties.text
                                    deepEntity.HeaderNISet = header[indiceHeader];
                                    deepEntity.HeaderNISet.ZcodiStatoni = "02"

                                    var numeroIntero = header[indiceHeader].ZimpoTotni
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
                                        header[indiceHeader].ZimpoTotni = numeroInteroSM
                                    }

                                    else {
                                        var importoPrimaVirgola = numeroIntero.split(",")
                                        var numeroInteroSM = importoPrimaVirgola[0] + "." + importoPrimaVirgola[1]
                                        header[indiceHeader].ZimpoTotni = numeroInteroSM
                                    }

                                    oModel.create("/DeepZNIEntitySet", deepEntity, {
                                        //urlParameters: {'funzionalita': 'ANNULLAMENTOPREIMPOSTATA'},
                                        // method: "PUT",
                                        success: function (data) {
                                            if (data.Msgty == 'E') {
                                                console.log(data.Message)
                                                MessageBox.error("Operazione non eseguita", {
                                                    title: "Esito Operazione",
                                                    actions: [sap.m.MessageBox.Action.OK],
                                                    emphasizedAction: MessageBox.Action.OK,
                                                })
                                            }
                                            if (data.Msgty == 'S') {
                                                MessageBox.success("Nota di Imputazione "+header[indiceHeader].ZchiaveNi+" confermata correttamente", {
                                                    title: "Esito Operazione",
                                                    actions: [sap.m.MessageBox.Action.OK],
                                                    emphasizedAction: MessageBox.Action.OK,
                                                    onClose: function (oAction) {
                                                        if (oAction === sap.m.MessageBox.Action.OK) {
                                                            that.getOwnerComponent().getRouter().navTo("View1");
                                                            location.reload();
                                                        }
                                                    }
                                                })
                                            }
                                        },
                                        error: function (e) {
                                            //console.log("error");
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
                    }
                }
            },

            // onRevocaConfermaNI: function () {
            //     var that = this

            //     var url = location.href
            //     var sUrl = url.split("/richiamaNI/")[1]
            //     var aValori = sUrl.split(",")

            //     var Bukrs = aValori[0]
            //     var Gjahr = aValori[1]
            //     var Zamministr = aValori[2]
            //     var ZchiaveNi = aValori[3]
            //     var ZidNi = aValori[4]
            //     var ZRagioCompe = aValori[5]

            //     //var oItems = that.getView().byId("").getBinding("items").oList;
            //     var header = this.getView().getModel("temp").getData().HeaderNISet
            //     for (var i = 0; i < header.length; i++) {
            //         if (header[i].Bukrs == Bukrs &&
            //             header[i].Gjahr == Gjahr &&
            //             header[i].Zamministr == Zamministr &&
            //             header[i].ZchiaveNi == ZchiaveNi &&
            //             header[i].ZidNi == ZidNi &&
            //             header[i].ZRagioCompe == ZRagioCompe) {

            //             var indice = i

            //             var deepEntity = {
            //                 HeaderNISet: null,
            //                 Funzionalita: 'REVOCACONFERMA',
            //             }

            //             //var statoNI = this.getView().byId("idModificaDettaglio").mBindingInfos.items.binding.oModel.oZcodiStatoni
            //             MessageBox.warning("Sei sicuro di voler revocare la Nota d'Imputazione n° " + header[i].ZchiaveNi + "?", {
            //                 title: "Revoca Conferma",
            //                 actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
            //                 emphasizedAction: MessageBox.Action.YES,
            //                 onClose: function (oAction) {
            //                     if (oAction === sap.m.MessageBox.Action.YES) {
            //                         var oModel = that.getOwnerComponent().getModel();

            //                         for (var i = 0; i < header.length; i++) {
            //                             // var item = header[i];
            //                             // var scompostaZamministr = that.getView().byId("numNI1").mProperties.text.split("-")[1]
            //                             // var Zamministr = scompostaZamministr.split(".")[0]

            //                             deepEntity.ZchiaveNi = that.getView().byId("numNI1").mProperties.text


            //                             deepEntity.HeaderNISet = header[indice];
            //                         }
            //                         oModel.create("/DeepZNIEntitySet", deepEntity, {
            //                             //urlParameters: {'funzionalita': 'ANNULLAMENTOPREIMPOSTATA'},
            //                             // method: "PUT",
            //                             success: function (data) {
            //                                 //console.log("success");
            //                                 MessageBox.success("Operazione eseguita con successo", {
            //                                     title: "Esito Operazione",
            //                                     actions: [sap.m.MessageBox.Action.OK],
            //                                     emphasizedAction: MessageBox.Action.OK,
            //                                     onClose: function (oAction) {
            //                                         if (oAction === sap.m.MessageBox.Action.OK) {
            //                                             that.getOwnerComponent().getRouter().navTo("View1");
            //                                             location.reload();
            //                                         }
            //                                     }
            //                                 })
            //                             },
            //                             error: function (e) {
            //                                 //console.log("error");
            //                                 MessageBox.error("Operazione non eseguita", {
            //                                     title: "Esito Operazione",
            //                                     actions: [sap.m.MessageBox.Action.OK],
            //                                     emphasizedAction: MessageBox.Action.OK,
            //                                 })
            //                             }
            //                         });

            //                     }
            //                 }
            //             });
            //         }
            //     }
            // },


            onRichiamaNI: function () {
                var that = this

                var url = location.href
                var sUrl = url.split("/richiamaNI/")[1]
                var aValori = sUrl.split(",")

                var Bukrs = aValori[0]
                var Gjahr = aValori[1]
                var Zamministr = aValori[2]
                var ZchiaveNi = aValori[3]
                var ZidNi = aValori[4]
                var ZRagioCompe = aValori[5]

                //var oItems = that.getView().byId("").getBinding("items").oList;
                var header = this.getView().getModel("temp").getData().HeaderNISet
                for (var i = 0; i < header.length; i++) {
                    if (header[i].Bukrs == Bukrs &&
                        header[i].Gjahr == Gjahr &&
                        header[i].Zamministr == Zamministr &&
                        header[i].ZchiaveNi == ZchiaveNi &&
                        header[i].ZidNi == ZidNi &&
                        header[i].ZRagioCompe == ZRagioCompe) {

                        var indice = i

                        var deepEntity = {
                            HeaderNISet: null,
                            Funzionalita: 'RICHIAMOVERIFICA',
                        }

                        //var statoNI = this.getView().byId("idModificaDettaglio").mBindingInfos.items.binding.oModel.oZcodiStatoni
                        MessageBox.warning("Sei sicuro di voler richiamare la Nota d'Imputazione n° " + header[i].ZchiaveNi + "?", {
                            title: "Richiamo Nota di Imputazione",
                            actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
                            emphasizedAction: MessageBox.Action.YES,
                            onClose: function (oAction) {
                                if (oAction === sap.m.MessageBox.Action.YES) {
                                    that.onSubmitDialogPress(aValori)
                                }
                            }
                        });
                    }
                }
            },

            onSubmitDialogPress: function (aValori) {
                if (!this.oSubmitDialog) {
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
                            press: function () {
                                var that = this
                                var header = this.getView().getModel("temp").getData().HeaderNISet
                                for (var i = 0; i < header.length; i++) {
                                    if (header[i].Bukrs == aValori[0] &&
                                        header[i].Gjahr == aValori[1] &&
                                        header[i].Zamministr == aValori[2] &&
                                        header[i].ZchiaveNi == aValori[3] &&
                                        header[i].ZidNi == aValori[4] &&
                                        header[i].ZRagioCompe == aValori[5]) {

                                        var indiceHeader = i

                                        var deepEntity = {
                                            HeaderNISet: null,
                                            Funzionalita: 'RICHIAMOVERIFICA',
                                        }
                                        var oModel = that.getOwnerComponent().getModel();

                                        for (var i = 0; i < header.length; i++) {
                                            // var item = header[i];
                                            // var scompostaZamministr = that.getView().byId("numNI1").mProperties.text.split("-")[1]
                                            // var Zamministr = scompostaZamministr.split(".")[0]

                                            deepEntity.ZchiaveNi = that.getView().byId("numNI1").mProperties.text
                                            deepEntity.HeaderNISet = header[indiceHeader];
                                            deepEntity.HeaderNISet.ZcodiStatoni = "02"
                                            var numeroIntero = header[indiceHeader].ZimpoTotni
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
                                                header[indiceHeader].ZimpoTotni = numeroInteroSM
                                            }

                                            else {
                                                var importoPrimaVirgola = numeroIntero.split(",")
                                                var numeroInteroSM = importoPrimaVirgola[0] + "." + importoPrimaVirgola[1]
                                                header[indiceHeader].ZimpoTotni = numeroInteroSM
                                            }

                                            deepEntity.HeaderNISet.Zmotrichiamo = Core.byId("submissionNote").getValue();
                                        }
                                        oModel.create("/DeepZNIEntitySet", deepEntity, {
                                            //urlParameters: {'funzionalita': 'ANNULLAMENTOPREIMPOSTATA'},
                                            // method: "PUT",
                                            success: function (data) {
                                                if (data.Msgty == 'E') {
                                                    console.log(data.Message)
                                                    MessageBox.error("Operazione non eseguita", {
                                                        title: "Esito Operazione",
                                                        actions: [sap.m.MessageBox.Action.OK],
                                                        emphasizedAction: MessageBox.Action.OK,
                                                    })
                                                }
                                                if (data.Msgty == 'S') {
                                                    MessageBox.success("Nota di Imputazione n°"+header[indiceHeader].ZchiaveNi+" richiamata correttamente", {
                                                        title: "Esito Operazione",
                                                        actions: [sap.m.MessageBox.Action.OK],
                                                        emphasizedAction: MessageBox.Action.OK,
                                                        onClose: function (oAction) {
                                                            if (oAction === sap.m.MessageBox.Action.OK) {
                                                                that.getOwnerComponent().getRouter().navTo("View1");
                                                                location.reload();
                                                            }
                                                        }
                                                    })
                                                }
                                            },
                                            error: function (e) {
                                                //console.log("error");
                                                MessageBox.error("Operazione non eseguita")
                                            }
                                        });

                                    }
                                }
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
            },


        });
    }
);
