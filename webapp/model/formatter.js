sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/ui/Device",
    "sap/ui/model/Filter",
], function (JSONModel, Device, Filter) {
    "use strict";
    // sap.ui.define([], function () {
    // 	"use strict";

    return {

        formatDate: function (sDate) {
            //sDate = sDate.split('.').join('/');
            if(sDate && sDate !== undefined && sDate !== null && sDate !== ''){
                var date =
                sDate.getDate().toString().padStart(2,'0') + "/" + 
                (sDate.getMonth() + 1).toString().padStart(2,'0') + "/" + 
                sDate.getFullYear()  
                return date;
            }
            return 'Data non disponibile';
        },
        formatDateTwoParams: function (sDate,sHour) {
            //sDate = sDate.split('.').join('/');
            if(sDate && sDate !== undefined && sDate !== null && sDate !== ''){
                var date =
                sDate.getDate().toString().padStart(2,'0') + "/" + 
                (sDate.getMonth() + 1).toString().padStart(2,'0') + "/" + 
                sDate.getFullYear()  
                return date + "\n" + sHour;
            }
        },

        headerColor: function () {
            this.addStyleClass("headerColor");
        },
        
        numberUnit : function (sValue) {
            if (!sValue) {
                return "";
            }
            return parseFloat(sValue).toFixed(2);
        },

    };
}, true);