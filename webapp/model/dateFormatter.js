sap.ui.define([], function () {
    return {

        acceptOnlyNumbers:function(e){
            console.log(e.keyCode);
            if(e.keyCode == 46 ) {
                e.preventDefault();
            }
        },


        numberUnit : function (sValue) {
            if (!sValue) {
                return "";
            }
            return parseFloat(sValue).toFixed(2);
        },

        convertFormattedNumber : function (sValue) {
            if (!sValue) {
                return "";
            }
            
            sValue = sValue.replace(".",",");
            return sValue.toString().replace(/\B(?<!\,\d*)(?=(\d{3})+(?!\d))/g, ".");            
        },

        convert: function(str) {
            if (!str) {
                return "";
            }

            var date = new Date(str),
              mnth = ("0" + (date.getMonth() + 1)).slice(-2),
              day = ("0" + date.getDate()).slice(-2);
             var nData= [date.getFullYear(), mnth, day].join("-");
             var nDate = nData.split("-").reverse().join(".");
             return nDate
          },
          
          


        formatDate: function (sDate) {
            //sDate = sDate.split('.').join('/');
            if (sDate && sDate !== undefined && sDate !== null && sDate !== '') {
                var date = new Date(parseInt(sDate.substr(6))).toISOString().slice(0, 10);
                var nDate = date.split("-").reverse().join(".");

                // var date = sDate.getDate().toString().padStart(2,'0') + "/" + (sDate.getMonth() + 1).toString().padStart(2,'0') + "/" + sDate.getFullYear()  
                return nDate;
            }
            return '';
        },
        formatDateTwoParams: function (sDate, sHour) {
            //sDate = sDate.split('.').join('/');
            if (sDate && sDate !== undefined && sDate !== null && sDate !== '') {
                var date =
                    sDate.getDate().toString().padStart(2, '0') + "/" +
                    (sDate.getMonth() + 1).toString().padStart(2, '0') + "/" +
                    sDate.getFullYear()
                return date + "\n" + sHour;
            }
        },
        getMonthName: function (monthNumber) {
            const date = new Date();
            date.setMonth(monthNumber - 1);
            var mese= date.toLocaleString('it-IT', { month: 'long' });
            const meseG = mese.charAt(0).toUpperCase() + mese.slice(1);
            return meseG
        },

        formateDateForDeep(dateValue) {
            var self = this,
              value,
              month,
              stringMonth;
      
            month = dateValue.getMonth() + 1;
      
            if (month < 10) {
              stringMonth = "0" + month.toString();
            } else stringMonth = month.toString();
      
            value =
              dateValue.getFullYear().toString() +
              "-" +
              stringMonth +
              "-" +
              dateValue.getDate().toString();
      
            return value + "T00:00:00";
          },
    }
})