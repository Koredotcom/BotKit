var moment    = require('moment-timezone');
function getDateTimeByZone(dateObj, timeZone, format){
    return moment(dateObj).tz(timeZone).format(format);
}

module.exports = {
    getDateTimeByZone : getDateTimeByZone
}


