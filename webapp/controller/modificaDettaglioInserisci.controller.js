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

        return BaseController.extend("project1.controller.modificaDettaglioInserisci", {
            formatter: DateFormatter,
            onInit() {
                this.onModificaNI()
                this.getOwnerComponent().getModel("temp");
                this.getRouter().getRoute("modificaDettaglioInserisci").attachPatternMatched(this._onObjectMatched, this);
            },

            onBackButton: function () {
                this.getView().byId("idModificaDettaglioInserisci").destroyItems()
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
                this.onModificaNI()
            },


            onModificaNI: function () {

                var filtroNI = []
                var url = location.href
                var sUrl = url.split("/modificaDettaglioInserisci/")[1]
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
                    path: "ZidNi",
                    operator: FilterOperator.EQ,
                    value1: ZidNi
                }));
                filtroNI.push(new Filter({
                    path: "ZRagioCompe",
                    operator: FilterOperator.EQ,
                    value1: ZRagioCompe
                }));

                var that = this;
                var oMdlM = new sap.ui.model.json.JSONModel();
                this.getOwnerComponent().getModel().read("/HeaderNISet", {
                    filters: filtroNI,
                    urlParameters: "",
                    success: function (data) {
                        oMdlM.setData(data.results);
                        //that.getView().getModel("temp").setProperty('/HeaderNISet', data.results)
                    },
                    error: function (error) {
                        var e = error;
                    }
                });
                this.getOwnerComponent().setModel(oMdlM, "HeaderNIM");
            },

            onSaveDati: function () {
                /*update operation*/
                var that = this
                var oItems = that.getView().byId("idModificaDettaglioInserisci").getBinding("items").oList;
                //var oggSpesa = this.getView().byId("idModificaDettaglio").mBindingInfos.items.binding.oModel.oData[0].ZoggSpesa
                var dataOdierna = new Date()
                MessageBox.warning("Sei sicuro di voler modificare la NI?", {
                    title:"Salvataggio Modifiche NI",
                    actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
                    emphasizedAction: MessageBox.Action.YES,
                    onClose: function (oAction) {
                        if (oAction === sap.m.MessageBox.Action.YES) {
                            var oModel = that.getView().getModel();
                            // var editSpesa = {
                            //     ZoggSpesa: oggSpesa
                            // };
                            for (var i = 0; i < oItems.length; i++) {
                                var item = oItems[i];

                                // var editSpesa = {
                                //     Bukrs: item.Bukrs,
                                //     Gjahr: item.Gjahr,
                                //     Zamministr: item.Zamministr,
                                //     ZchiaveNi: item.ZchiaveNi,
                                //     ZidNi: item.ZidNi,
                                //     ZRagioCompe: item.ZRagioCompe,
                                //     ZoggSpesa: item.ZoggSpesa
                                // };
                                // oModel.update("/DeepZNIEntitySet", editSpesa, {
                                //     // method: "PUT",
                                //     success: function (data) {
                                //         //console.log("success");
                                //         MessageBox.success("Operazione eseguita con successo")
                                //     },
                                //     error: function (e) {
                                //         //console.log("error");
                                //         MessageBox.error("Operazione non eseguita")
                                //     }
                                // });

                                var path = oModel.createKey("/HeaderNISet", {
                                    Bukrs:item.Bukrs,
                                    Gjahr:item.Gjahr,
                                    Zamministr:item.Zamministr,
                                    ZchiaveNi:item.ZchiaveNi,
                                    ZidNi:item.ZidNi,
                                    ZRagioCompe:item.ZRagioCompe,
                                    Funzionalita: 'RETTIFICAPROVVISORIA'
                                    });

                                    var oEntry = {};
                                    oEntry.ZoggSpesa = item.ZoggSpesa;
                                    oEntry.ZdataModiNi = dataOdierna
                                
                                oModel.update(path, oEntry, {
                                    // method: "PUT",
                                    success: function (data) {
                                        //console.log("success");
                                        MessageBox.success("Operazione Eseguita con successo", {
                                            title:"Esito Operazione",
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
                                        MessageBox.error("Operazione non eseguita")
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