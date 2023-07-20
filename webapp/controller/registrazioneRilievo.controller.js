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

        return BaseController.extend("project1.controller.registrazioneRilievo", {
            formatter: DateFormatter,
            onInit() {
                var oProprietà = new JSONModel(),
                    oInitialModelState = Object.assign({}, oData);
                oProprietà.setData(oInitialModelState);
                this.getView().setModel(oProprietà);
                this.getOwnerComponent().getModel("temp");
                this.getRouter().getRoute("registrazioneRilievo").attachPatternMatched(this._onObjectMatched, this);

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
                var sUrl = url.split("/registrazioneRilievo/")[1]
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
                                that.setUserInfo();
                            },
                            error: function (error) {
                                var e = error;
                            }
                        });
                        this.getOwnerComponent().setModel(oMdlITB, "registrazioneRilievo");

                    }
                }

            },

            setUserInfo:function(){
                var self =this,
                    userInfo = self.getView().getModel("temp").getProperty('/UserInfo');
                if(userInfo){
                    self.getView().byId("Name").setValue(userInfo.NameFirst);
                    self.getView().byId("Surname").setValue(userInfo.NameLast);
                }
                else{

                    var oModel = self.getOwnerComponent().getModel();
                    var chiavi = oModel.createKey("/UserInfoSet", {
                        Bname: "",
                    });

                    self.getOwnerComponent().getModel().read(chiavi, {
                        success: function (data) {
                            self.getView().getModel("temp").setProperty('/UserInfo', data);
                            self.getView().byId("Name").setValue(data.NameFirst);
                            self.getView().byId("Surname").setValue(data.NameLast);
                        },
                        error: function (error) {
                            var e = error;
                        }
                    });
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
                var sUrl = url.split("/registrazioneRilievo/")[1]
                var aValori = sUrl.split(",")

                var Bukrs = aValori[0]
                var Gjahr = aValori[1]
                var Zamministr = aValori[2]
                var ZchiaveNi = aValori[3]
                var ZidNi = aValori[4]
                var ZRagioCompe = aValori[5]

                var header = this.getView().getModel("temp").getData().HeaderNISet
                var position = position
                //var firmaSet = this.getView().getModel("temp").getData().firmaSet
                var valoriNuovi = this.getView().getModel("temp").getData().ValoriNuovi
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

                        var codUff = header[i].ZuffcontFirm
                        var dirigente = header[i].ZdirncRich
                        this.getView().byId("CodiceUff1").setText(codUff)
                        this.getView().byId("dirigente1").setText(dirigente)

                        if (header[i].ZcodiStatoni == "07") {
                            this.setFiltriRilievo()
                        }

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

            onBackButton: function () {
                window.history.go(-1);
            },

            setFiltriRilievo: function () {
                var that = this
                var oModel = this.getOwnerComponent().getModel();

                var url = location.href
                var sUrl = url.split("/registrazioneRilievo/")[1]
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

                        that.getView().byId("numProtocolloRGS").setValue(header[i].NProtocolloRag)

                        var dataProtocolloRGS = header[i].ZdataProtRag
                        var dataNuova = new Date(dataProtocolloRGS),
                            mnth = ("0" + (dataNuova.getMonth() + 1)).slice(-2),
                            day = ("0" + dataNuova.getDate()).slice(-2);
                        var nData = [dataNuova.getFullYear(), mnth, day].join("-");
                        var nDate = nData.split("-").reverse().join("/");
                        that.getView().byId("dataProtocolloRGS").setValue(nDate)
                    }
                }

                var chiavi = oModel.createKey("/RilievoNiSet", {
                    Bukrs: Bukrs,
                    Gjahr: Gjahr,
                    Zamministr: Zamministr,
                    ZchiaveNi: ZchiaveNi,
                    ZidNi: ZidNi,
                    ZRagioCompe: ZRagioCompe,
                    ZidRilievo: ""
                });

                //var oMdlDisp = new sap.ui.model.json.JSONModel();
                this.getOwnerComponent().getModel().read(chiavi, {
                    success: function (data) {
                        that.getView().getModel("temp").setProperty('/Rilievi', data)

                        var ZdatRilievo = data.ZdatRilievo
                        var dataNuova = new Date(ZdatRilievo),
                            mnth = ("0" + (dataNuova.getMonth() + 1)).slice(-2),
                            day = ("0" + dataNuova.getDate()).slice(-2);
                        var nData = [dataNuova.getFullYear(), mnth, day].join("-");
                        var nDate = nData.split("-").reverse().join("/");
                        that.getView().byId("dataRilievo").setValue(nDate)

                        that.getView().byId("motivizioneRilievo").setValue(data.Zmotrilievo)

                    },
                    error: function (error) {
                        var e = error;
                    }
                });

            },

            onSave: function () {
                var that = this
                var nomeRegistrazione = []

                var nome = this.getView().byId("Name").getValue()
                var cognome = this.getView().byId("Surname").getValue()

                nomeRegistrazione.push(nome)
                nomeRegistrazione.push(cognome)

                this.getView().getModel("temp").setProperty('/nomeRegistrazione', nomeRegistrazione)

                var url = location.href
                var sUrl = url.split("/registrazioneRilievo/")[1]
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
                        if (header[indiceHeader].ZcodiStatoni == "NI In Verifica") {

                            var deepEntity = {
                                HeaderNISet: null,
                                RilievoNiSet: null,
                                Funzionalita: 'REGISTRAZIONERILIEVOVERIFICA',
                            }

                            //var statoNI = this.getView().byId("idModificaDettaglio").mBindingInfos.items.binding.oModel.oZcodiStatoni
                            MessageBox.warning("Sei sicuro di voler registrare il rilievo della Nota d'Imputazione n° " + header[indiceHeader].ZchiaveNi + "?", {
                                title: "Registrazione Rilievo Verifica",
                                actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
                                emphasizedAction: MessageBox.Action.YES,
                                onClose: function (oAction) {
                                    if (oAction === sap.m.MessageBox.Action.YES) {
                                        var oModel = that.getOwnerComponent().getModel();

                                        deepEntity.ZchiaveNi = that.getView().byId("numNI1").mProperties.text
                                        //deepEntity.ZchiaveNi = header[indice]

                                        deepEntity.HeaderNISet = header[indiceHeader];
                                        deepEntity.HeaderNISet.ZcodiStatoni = "04"
                                        //deepEntity.RilievoNiSet.ZdatRilievo = that.getView().byId("dataRilievo").mProperties.dateValue

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

                                        if (that.getView().byId("numProtocolloRGS").getValue() != '') {
                                            deepEntity.HeaderNISet.NProtocolloRag = that.getView().byId("numProtocolloRGS").getValue()
                                        }

                                        if (that.getView().byId("dataProtocolloRGS").getValue() != '') {
                                            var numeri = that.getView().byId("dataProtocolloRGS").getValue().split("/");
                                            var nData = (numeri[1] + "/" + numeri[0] + "/" + numeri[2])
                                            var dataProvaUTC = new Date(nData)
                                            var anno = dataProvaUTC.getUTCFullYear()
                                            var nData = (anno + "-" + numeri[1] + "-" + numeri[0])
                                            var dataNuova = new Date(nData)

                                            deepEntity.HeaderNISet.ZdataProtRag = dataNuova
                                        }
                                        //deepEntity.RilievoNiSet.ZzMotrilievo = that.getView().byId("motivizioneRilievo").getValue()

                                        deepEntity.RilievoNiSet = {
                                            Bukrs: header[indiceHeader].Bukrs,
                                            Gjahr: header[indiceHeader].Gjahr,
                                            Zamministr: header[indiceHeader].Zamministr,
                                            ZidNi: header[indiceHeader].ZidNi,
                                            ZchiaveNi: header[indiceHeader].ZchiaveNi,
                                            ZRagioCompe: header[indiceHeader].ZRagioCompe,
                                            //ZdatRilievo: that.getView().byId("dataRilievo").mProperties.dateValue,
                                            Zmotrilievo: that.getView().byId("motivizioneRilievo").getValue()
                                        }

                                        var numeri = that.getView().byId("dataRilievo").getValue().split("/");
                                        var nData = (numeri[1] + "/" + numeri[0] + "/" + numeri[2])
                                        var dataProvaUTC = new Date(nData)
                                        var anno = dataProvaUTC.getUTCFullYear()
                                        var nData = (anno + "-" + numeri[1] + "-" + numeri[0])
                                        var dataNuova = new Date(nData)

                                        deepEntity.RilievoNiSet.ZdatRilievo = dataNuova

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
                                                    MessageBox.success("Rilievo della Nota di Imputazione n."+header[indiceHeader].ZchiaveNi+" registrato correttamente", {
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
                        else if (header[indiceHeader].ZcodiStatoni == "NI Confermata") {

                            var deepEntity = {
                                HeaderNISet: null,
                                RilievoNiSet: null,
                                Funzionalita: 'REGISTRAZIONERILIEVOCONFERMATA',
                            }

                            //var statoNI = this.getView().byId("idModificaDettaglio").mBindingInfos.items.binding.oModel.oZcodiStatoni
                            MessageBox.warning("Sei sicuro di voler registrare il rilievo della Nota d'Imputazione n° " + header[i].ZchiaveNi + "?", {
                                title: "Registrazione Rilievo Confermata",
                                actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
                                emphasizedAction: MessageBox.Action.YES,
                                onClose: function (oAction) {
                                    if (oAction === sap.m.MessageBox.Action.YES) {
                                        var oModel = that.getOwnerComponent().getModel();

                                        deepEntity.ZchiaveNi = that.getView().byId("numNI1").mProperties.text
                                        //deepEntity.ZchiaveNi = header[indice]

                                        deepEntity.HeaderNISet = header[indiceHeader];
                                        deepEntity.HeaderNISet.ZcodiStatoni = "05"

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

                                        //deepEntity.RilievoNiSet.ZdatRilievo = that.getView().byId("dataRilievo").mProperties.dateValue
                                        if (that.getView().byId("numProtocolloRGS").getValue() != '') {
                                            deepEntity.HeaderNISet.NProtocolloRag = that.getView().byId("numProtocolloRGS").getValue()
                                        }

                                        if (that.getView().byId("dataProtocolloRGS").getValue() != '') {
                                            var numeri = that.getView().byId("dataProtocolloRGS").getValue().split("/");
                                            var nData = (numeri[1] + "/" + numeri[0] + "/" + numeri[2])
                                            var dataProvaUTC = new Date(nData)
                                            var anno = dataProvaUTC.getUTCFullYear()
                                            var nData = (anno + "-" + numeri[1] + "-" + numeri[0])
                                            var dataNuova = new Date(nData)

                                            deepEntity.HeaderNISet.ZdataProtRag = dataNuova
                                        }
                                        //deepEntity.RilievoNiSet.ZzMotrilievo = that.getView().byId("motivizioneRilievo").getValue()ù

                                        deepEntity.RilievoNiSet = {
                                            Bukrs: header[indiceHeader].Bukrs,
                                            Gjahr: header[indiceHeader].Gjahr,
                                            Zamministr: header[indiceHeader].Zamministr,
                                            ZidNi: header[indiceHeader].ZidNi,
                                            ZchiaveNi: header[indiceHeader].ZchiaveNi,
                                            ZRagioCompe: header[indiceHeader].ZRagioCompe,
                                            ZdatRilievo: that.getView().byId("dataRilievo").mProperties.dateValue,
                                            Zmotrilievo: that.getView().byId("motivizioneRilievo").getValue()
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
                                                    MessageBox.success("Rilievo della Nota di Imputazione n."+header[indiceHeader].ZchiaveNi+" registrato correttamente", {
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
                        else if (header[indiceHeader].ZcodiStatoni == "NI con Rilievo Registrato") {

                            var deepEntity = {
                                HeaderNISet: null,
                                RilievoNiSet: null,
                                Funzionalita: 'RETTIFICARILIEVO',
                            }

                            //var statoNI = this.getView().byId("idModificaDettaglio").mBindingInfos.items.binding.oModel.oZcodiStatoni
                            MessageBox.warning("Sei sicuro di voler rettificare il rilievo della Nota d'Imputazione n° " + header[i].ZchiaveNi + "?", {
                                title: "Rettifica Rilievo",
                                actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
                                emphasizedAction: MessageBox.Action.YES,
                                onClose: function (oAction) {
                                    if (oAction === sap.m.MessageBox.Action.YES) {
                                        var oModel = that.getOwnerComponent().getModel();

                                        deepEntity.ZchiaveNi = that.getView().byId("numNI1").mProperties.text
                                        //deepEntity.ZchiaveNi = header[indice]
                                        deepEntity.HeaderNISet = header[indiceHeader];

                                        deepEntity.HeaderNISet.ZcodiStatoni = "07"

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

                                        // deepEntity.HeaderNISet.NProtocolloRag = that.getView().byId("numProtocolloRGS").getValue()
                                        // deepEntity.HeaderNISet.ZdataProtRag = new Date(that.getView().byId("dataProtocolloRGS").getValue())


                                        var rilievi = that.getView().getModel("temp").getData().Rilievi

                                        deepEntity.RilievoNiSet = rilievi

                                        //deepEntity.RilievoNiSet.ZdatRilievo = new Date(that.getView().byId("dataRilievo").getValue())
                                        deepEntity.RilievoNiSet.Zmotrilievo = that.getView().byId("motivizioneRilievo").getValue()


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
                                                    MessageBox.success("Rilievo della Nota di Imputazione n."+header[indiceHeader].ZchiaveNi+" rettificato", {
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
                }
            },
        });
    }
);
