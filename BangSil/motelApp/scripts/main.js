// scripts/main.js

Date.prototype.toYYYYMMDDwithDash = function () {
    var yyyy = this.getFullYear().toString();
    var mm = (this.getMonth() + 1).toString();
    var dd = this.getDate().toString();
    return yyyy + '-' + (mm.length === 2 ? mm : "0" + mm[0]) + '-' + (dd.length === 2 ? dd : "0" + dd[0]);
};
