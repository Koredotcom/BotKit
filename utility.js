/*var moment    = require('moment-timezone');
function getDateTimeByZone(dateObj, timeZone, format){
    return moment(dateObj).tz(timeZone).format(format);
}

module.exports = {
    getDateTimeByZone : getDateTimeByZone
}*/


var momenttz    = require('moment-timezone');
var moment      = require('moment');

function getDateTimeByZone(dateObj, timeZone, format){
    return momenttz(dateObj).tz(timeZone).format(format);
}

function getTimeByZoneAndHour(date, time, zone){
	var _from   = date;
	var fromDt = new Date(_from);
	var offset = moment().tz(zone).format('Z');
	offset = getMinutes(offset);
	var timeStart = (time+offset) * 60000;
	var reqMill = fromDt.getTime()+timeStart; 
	
	return moment.tz(reqMill, zone);
}

function getMinutes(offset){
	var _off    = offset.split(':');
	var hour    = Number(_off[0]);
	var minutes = Number(_off[1]);

	if(hour !== 0)
		return -(hour*60+minutes);	
	else
		return 0;
}

module.exports = {
    getDateTimeByZone : getDateTimeByZone,
    getTimeByZoneAndHour : getTimeByZoneAndHour
}
