var momenttz    = require('moment-timezone');

function getDateTimeByZone(dateObj, timeZone, format){
    return momenttz(dateObj).tz(timeZone).format(format);
}

module.exports = {
    getDateTimeByZone : getDateTimeByZone
}
