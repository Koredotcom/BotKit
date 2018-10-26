var momenttz    = require('moment-timezone');

function getDateTimeByZone(dateObj, timeZone, format){
    return momenttz(dateObj).tz(timeZone).format(format);
}

function getMinutes(offset){
    var _off = offset.split(':');
    var hour = Number(_off[0]);
    var minutes = Number(_off[1]);

    if(hour !== 0)
        return -(hour*60+minutes);
    else
        return 0;
}

function getOffsetByZone(timeZone){
	return moment().tz(timeZone).format('Z');
}

module.exports = {
    getDateTimeByZone : getDateTimeByZone,
    getOffsetByZone   : getOffsetByZone,
    getMinutes        : getMinutes
}
