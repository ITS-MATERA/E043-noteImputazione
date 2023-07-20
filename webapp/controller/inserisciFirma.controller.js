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
    ],
    /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
    function (BaseController, Filter, FilterOperator, JSONModel, Spreadsheet, CoreLibrary, DateFormatter, MessageBox) {
        "use strict";
        var EdmType = sap.ui.export.EdmType

        var ValueState = CoreLibrary.ValueState,
            oData = {
                EditEnable: false,
                AddEnable: false,
                DeleteEnable: false,
            };

        return BaseController.extend("project1.controller.inserisciFirma", {
            formatter: DateFormatter,
            onInit() {
                var oProprietà = new JSONModel(),
                    oInitialModelState = Object.assign({}, oData);
                oProprietà.setData(oInitialModelState);
                this.getView().setModel(oProprietà);
                this.getOwnerComponent().getModel("temp");
                this.getRouter().getRoute("inserisciFirma").attachPatternMatched(this._onObjectMatched, this);
                this.ShZdirncRichSet()

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
                var sUrl = url.split("/inserisciFirma/")[1]
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
                                that.viewHeader(data.results)
                            },
                            error: function (error) {
                                var e = error;
                            }
                        });
                        this.getOwnerComponent().setModel(oMdlITB, "HeaderInserisci");

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
                var sUrl = url.split("/inserisciFirma/")[1]
                var aValori = sUrl.split(",")

                var Bukrs = aValori[0]
                var Gjahr = aValori[1]
                var Zamministr = aValori[2]
                var ZchiaveNi = aValori[3]
                var ZidNi = aValori[4]
                var ZRagioCompe = aValori[5]

                var header = this.getView().getModel("temp").getData().HeaderNISet
                var position = position
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
                                this.onCallFornitore()
                                this.getView().byId("Lifnr1").setText(beneficiario)

                                var centroCosto = position[x].Kostl
                                this.getView().byId("CentroCosto1").setText(centroCosto)

                                var centroCOGE = position[x].Saknr
                                this.getView().byId("ConCoGe1").setText(centroCOGE)

                                var codiceGestionale = position[x].Zcodgest
                                this.getView().byId("CodiceGes1").setText(codiceGestionale)

                                var causalePagamento = position[x].Zcauspag
                                this.getView().byId("CausalePagamento1").setText(causalePagamento)

                                var modalitàPagamento = position[x].Zwels
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


            ShZdirncRichSet: function () {
                var that = this
                var filtriShZdirncRich = []
                var url = location.href
                var sUrl = url.split("/inserisciFirma/")[1]
                var aValori = sUrl.split(",")

                var Bukrs = aValori[0]
                var Gjahr = aValori[1]
                var Zamministr = aValori[2]
                var ZchiaveNi = aValori[3]
                var ZidNi = aValori[4]
                var ZRagioCompe = aValori[5]

                var header = this.getOwnerComponent().getModel("temp").getData().HeaderNISet
                for (var i = 0; i < header.length; i++) {
                    if (header[i].Bukrs == Bukrs &&
                        header[i].Gjahr == Gjahr &&
                        header[i].Zamministr == Zamministr &&
                        header[i].ZchiaveNi == ZchiaveNi &&
                        header[i].ZidNi == ZidNi &&
                        header[i].ZRagioCompe == ZRagioCompe) {

                        filtriShZdirncRich.push(new Filter({
                            path: "Zamministr",
                            operator: FilterOperator.EQ,
                            value1: Zamministr
                        }));
                        filtriShZdirncRich.push(new Filter({
                            path: "ZuffcontFirm",
                            operator: FilterOperator.EQ,
                            value1: "020.0021"
                        }));

                        this.getOwnerComponent().getModel().read("/ShZdirncRichSet", {
                            filters: filtriShZdirncRich,
                            success: function (data) {
                                //oMdlText.setData(data.results);
                                that.getView().getModel("temp").setProperty('/ShZdirncRichSet', data.results)
                            },
                            error: function (error) {
                                var e = error;
                            }
                        });

                    }
                }
            },

            onConfirm: function () {
                var firmaSet = []
                var codUff = this.getView().byId("codUfficio").getValue()
                var dirigente = this.getView().byId("dirigente").getValue()
                if (this.getView().byId("DataPro").getValue() != '') {
                    var dataProtocollo = this.getView().byId("DataPro").getValue()
                }
                else {
                    var dataProtocollo = ''
                }
                if (this.getView().byId("numProtocollo").getValue() != '') {
                    var numProtocollo = this.getView().byId("numProtocollo").getValue()
                }
                else {
                    var numProtocollo = ''
                }

                firmaSet.push(codUff)
                firmaSet.push(dirigente)
                firmaSet.push(dataProtocollo)
                firmaSet.push(numProtocollo)

                this.getView().getModel("temp").setProperty('/firmaSet', firmaSet)

                var url = location.href
                var sUrl = url.split("/inserisciFirma/")[1]
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
                        this.getOwnerComponent().getRouter().navTo("FirmaInserita", { campo: header[i].Bukrs, campo1: header[i].Gjahr, campo2: header[i].Zamministr, campo3: header[i].ZchiaveNi, campo4: header[i].ZidNi, campo5: header[i].ZRagioCompe });
                    }
                }
            },

            onBackButton: function () {
                window.history.go(-1);
            },

        });
    }
);
