sap.ui.define(
    [
        "./BaseController",
        "sap/ui/model/Filter",
        "sap/ui/model/FilterOperator",
        "sap/m/MessageBox",
        "sap/ui/core/routing/History",
        'project1/model/DateFormatter'
    ],
    function (BaseController, Filter, FilterOperator, MessageBox, History, DateFormatter) {
        "use strict";

        return BaseController.extend("project1.controller.modificaImporto", {
            formatter: DateFormatter,
            onInit() {
                this.onModificaNI()
                this.getOwnerComponent().getModel("temp");
                this.getRouter().getRoute("modificaImporto").attachPatternMatched(this._onObjectMatched, this);
            },

            onBackButton: function () {
                this.getView().byId("PositionNIMI").destroyItems()
                window.history.go(-1);
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
                this.viewHeader(oEvent)
            },

            viewHeader: function (oEvent) {

                var header = this.getView().getModel("temp").getData().HeaderNISet
                var position = this.getView().getModel("temp").getData().PositionNISet
                for (var i = 0; i < header.length; i++) {
                    if (header[i].Bukrs == oEvent.getParameters().arguments.campo &&
                        header[i].Gjahr == oEvent.getParameters().arguments.campo1 &&
                        header[i].Zamministr == oEvent.getParameters().arguments.campo2 &&
                        header[i].ZchiaveNi == oEvent.getParameters().arguments.campo3 &&
                        header[i].ZidNi == oEvent.getParameters().arguments.campo4 &&
                        header[i].ZRagioCompe == oEvent.getParameters().arguments.campo5) {

                        var progressivoNI = header[i].ZchiaveNi
                        this.getView().byId("ProgressivoNI1").setText(progressivoNI)

                        var dataRegistrazione = header[i].ZdataCreaz
                        var dataNuova = new Date(dataRegistrazione),
                            mnth = ("0" + (dataNuova.getMonth() + 1)).slice(-2),
                            day = ("0" + dataNuova.getDate()).slice(-2);
                        var nData = [dataNuova.getFullYear(), mnth, day].join("-");
                        var nDate = nData.split("-").reverse().join(".");
                        this.getView().byId("data1").setText(nDate)

                        var strAmmResp = header[i].Fistl
                        this.getView().byId("SAR1").setText(strAmmResp)

                        var PF = header[i].Fipex
                        this.getView().byId("PF1").setText(PF)

                        var oggSpesa = header[i].ZoggSpesa
                        this.getView().byId("oggSpesaNI1").setText(oggSpesa)

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
                            if (position[x].Bukrs == oEvent.getParameters().arguments.campo &&
                                position[x].Gjahr == oEvent.getParameters().arguments.campo1 &&
                                position[x].Zamministr == oEvent.getParameters().arguments.campo2 &&
                                position[x].ZchiaveNi == oEvent.getParameters().arguments.campo3 &&
                                position[x].ZidNi == oEvent.getParameters().arguments.campo4 &&
                                position[x].ZRagioCompe == oEvent.getParameters().arguments.campo5) {

                                var comp = position[x].ZcompRes
                                if (comp == "C") var n_comp = 'Competenza'
                                if (comp == "R") var n_comp = 'Residui'       //Position
                                this.getView().byId("comp1").setText(n_comp)

                            }
                        }

                        var statoNI = header[i].ZcodiStatoni
                        this.getView().byId("statoNI1").setText(statoNI)

                        var importoTot = header[i].ZimpoTotni
                        this.getView().byId("importoTot1").setText(importoTot)

                    }
                }

            },

            onModificaNI: function () {
                var filtroNI = []
                var url = location.href
                var sUrl = url.split("/modificaImporto/")[1]
                var aValori = sUrl.split(",")

                var Bukrs = aValori[0]
                var Gjahr = aValori[1]
                var Zamministr = aValori[2]
                var ZchiaveNi = aValori[3]
                var ZidNi = aValori[4]
                var ZRagioCompe = aValori[5]

                //filtroNI.push({Bukrs:Bukrs, Gjahr:Gjahr, Zamministr,Zamministr, ZchiaveNi:ZchiaveNi, ZidNi:ZidNi, ZRagioCompe:ZRagioCompe})
                filtroNI.push(new Filter({
                    path: "Bukrs",
                    operator: FilterOperator.EQ,
                    value1: Bukrs
                }));
                filtroNI.push(new Filter({
                    path: "Gjahr",
                    operator: FilterOperator.EQ,
                    value1: Gjahr
                }));
                filtroNI.push(new Filter({
                    path: "Zamministr",
                    operator: FilterOperator.EQ,
                    value1: Zamministr
                }));
                filtroNI.push(new Filter({
                    path: "ZchiaveNi",
                    operator: FilterOperator.EQ,
                    value1: ZchiaveNi
                }));
                filtroNI.push(new Filter({
                    path: "ZRagioCompe",
                    operator: FilterOperator.EQ,
                    value1: ZRagioCompe
                }));

                var that = this;
                var oMdlM = new sap.ui.model.json.JSONModel();
                this.getOwnerComponent().getModel().read("/PositionNISet", {
                    filters: filtroNI,
                    urlParameters: "",
                    success: function (data) {
                        oMdlM.setData(data.results);
                        that.getView().getModel("temp").setProperty('/PositionNISetFiltrata', data.results)

                        for (var dr = 0; dr < data.results.length; dr++) {
                            if (data.results[dr].ZimpoTitolo.split(".").length > 1) {
                                var numeroIntero = data.results[dr].ZimpoTitolo
                                var importoPrimaVirgola = numeroIntero.split(".")
                                var numPunti = ""
                                var migliaia = importoPrimaVirgola[0].split('').reverse().join('').match(/.{1,3}/g).map(function (x) {
                                    return x.split('').reverse().join('')
                                }).reverse()

                                for (var migl = 0; migl < migliaia.length; migl++) {
                                    numPunti = (numPunti + migliaia[migl] + ".")
                                }
                                var indice = numPunti.split("").length
                                var impoTitolo = numPunti.substring(0, indice - 1) + "," + importoPrimaVirgola[1]
                                let array = impoTitolo.split(",")
                                let valoreTagliato = array[1].substring(0, 2)
                                var impoTitolo = array[0] + "," + valoreTagliato
                                that.getView().byId("PositionNIMI").mAggregations.items[dr].mAggregations.cells[4].setValue(impoTitolo)

                            }
                            else {
                                var importoPrimaVirgola = numeroIntero.split(",")
                                var impoTitolo = importoPrimaVirgola[0] + "." + importoPrimaVirgola[1]
                                that.getView().byId("PositionNIMI").mAggregations.items[dr].mAggregations.cells[4].setValue(impoTitolo)
                            }
                        }

                    },
                    error: function (error) {
                        var e = error;
                    }
                });
                this.getOwnerComponent().setModel(oMdlM, "PositionNIMI");
            },

            onUpdateImporto: function () {
                /*update operation*/
                var that = this
                var oItems = that.getView().byId("PositionNIMI").getBinding("items").oList;

                var deepEntity = {
                    Funzionalita: 'RETTIFICANIPREIMPOSTATA',
                    PositionNISet: []
                }
                //var dataOdierna = new Date()
                MessageBox.warning("Sei sicuro di voler modificare la NI?", {
                    title: "Salvataggio Modifiche NI",
                    actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
                    emphasizedAction: MessageBox.Action.YES,
                    onClose: function (oAction) {
                        if (oAction === sap.m.MessageBox.Action.YES) {
                            var oModel = that.getView().getModel();

                            for (var i = 0; i < oItems.length; i++) {
                                var item = oItems[i];

                                deepEntity.Bukrs = item.Bukrs,
                                    deepEntity.Gjahr = item.Gjahr,
                                    deepEntity.Zamministr = item.Zamministr,
                                    deepEntity.ZchiaveNi = item.ZchiaveNi,
                                    deepEntity.ZidNi = item.ZidNi,
                                    deepEntity.ZRagioCompe = item.ZRagioCompe,
                                    deepEntity.Operation = "U",

                                    deepEntity.PositionNISet.push({
                                        ZposNi: item.ZposNi,
                                        Bukrs: item.Bukrs,
                                        Gjahr: item.Gjahr,
                                        Zamministr: item.Zamministr,
                                        ZchiaveNi: item.ZchiaveNi,
                                        ZidNi: item.ZidNi,
                                        ZRagioCompe: item.ZRagioCompe,

                                        //ZimpoTitolo: item.ZimpoTitolo
                                    })

                                var numeroIntero = item.ZimpoTitolo
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
                                    deepEntity.PositionNISet[i].ZimpoTitolo = numeroInteroSM
                                }

                                else {
                                    var importoPrimaVirgola = numeroIntero.split(",")
                                    var numeroInteroSM = importoPrimaVirgola[0] + "." + importoPrimaVirgola[1]
                                    deepEntity.PositionNISet[i].ZimpoTitolo = numeroInteroSM
                                }
                            }
                            // var oEntry = {};
                            // oEntry.ZimpoTitolo = item.ZimpoTitolo;
                            //oEntry.ZimpoRes = item.ZimpoRes

                            oModel.create("/DeepPositionNISet", deepEntity, {
                                // method: "PUT",
                                success: function (result) {
                                    MessageBox.success("Nota di Imputazione "+item.ZchiaveNi+" rettificata correttamente", {
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
                                },
                                error: function (e) {
                                    //console.log("error");
                                    MessageBox.error("Modifica Importo non eseguito", {
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

            // onSaveDati: function () {
            //     //aggiunge dati
            //     var oMdlM = new sap.ui.model.json.JSONModel();
            //     var spesa= this.getView().byId("HeaderNIM")
            //     MessageBox.warning("Sei sicuro di voler modificare la NI?", {
            //         actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
            //         emphasizedAction: MessageBox.Action.YES,
            //         onClose: function (oAction) {
            //             if (oAction === sap.m.MessageBox.Action.YES) {
            //                 //var oggSpesa = this.getView().byId("oggSpesa").getValue()
            //                 var that = this;
            //                 var aData = jQuery.ajax({
            //                     type: "PATCH",
            //                     contentType: "application/json",
            //                     url: "/sap/opu/odata/sap/ZS4_NOTEIMPUTAZIONI_SRV/HeaderNISet",
            //                     dataType: "json",
            //                     async: false,
            //                     body: JSON.stringify({
            //                         ZoggSpesa: oggSpesa
            //                       }),
            //                     success: function (data, textStatus, jqXHR) {
            //                         // resolve(data.value)
            //                         //console.log(data)
            //                         oMdlITB.setData(data.d.results);
            //                         //that.getView().getModel("temp").setProperty('/PositionNISet', data.d.results)
            //                         //console.log(data.d.results)
            //                     },
            //                     error: function (error) {
            //                         var e = error;
            //                     }
            //                 });
            //                 MessageBox.success("Operazione eseguita con successo")
            //             }
            //         }
            //     })
            // },


        });
    }
);