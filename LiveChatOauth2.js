var config = require('./config.json');
var liveChat = config.LiveChat;
var rp = require('request-promise');
var redirect_uri = config.app.url + config.app.apiPrefix + '/authCode/callback';
var baseAccountsUrl = 'https://accounts.livechat.com';

var oAuth2Class = {
    agentToken: undefined,
    authorise: function () {
        //Todo: figure out way to send with out cookie info.
        //Todo: Also find some pre defined oAuth class
        var options = {
            'method': 'GET',
            'url': baseAccountsUrl + '?response_type=code&client_id=' + liveChat.clientId + '&redirect_uri=' + redirect_uri,
            'headers': {
                'Cookie': '_gcl_au=1.1.658563599.1593424692; _ga=GA1.3.281353257.1593424692; _fbp=fb.1.1593424692641.667847735; amplitude_id_841104a62d8040f86beb1b507a0ea8eelivechat.com=eyJkZXZpY2VJZCI6ImUxNDc1NDcxLWRhMmEtNGYwMC05ZjUxLTY3ZGI3ZGQ0YjE4OVIiLCJ1c2VySWQiOm51bGwsIm9wdE91dCI6ZmFsc2UsInNlc3Npb25JZCI6MTU5MzQyNDY5MTUxNSwibGFzdEV2ZW50VGltZSI6MTU5MzQyNDcwNzUyNSwiZXZlbnRJZCI6MSwiaWRlbnRpZnlJZCI6MCwic2VxdWVuY2VOdW1iZXIiOjF9; __ia_3_v3=77cccfdaf66fb5a69ff571d97545ec48088a221129ca231c11ce8fb05c3acbd3'
            }
        };
        return rp(options).then(function (response) {
            return response;
        }).catch(function (err) {
            console.error("Error in getting agent auth code");
            return Promise.reject(err);
        })
    },
    token: function (code) {
        var options = {
            'method': 'POST',
            'url': baseAccountsUrl + '/token',
            'headers': {
                'content-type': 'application/x-www-form-urlencoded'
            },
            form: {
                'grant_type': 'authorization_code',
                'client_id': liveChat.clientId,
                'client_secret': liveChat.client_secret,
                'code': code,
                'redirect_uri': redirect_uri
            }
        };
        return rp(options).then(function (response) {
            var parResp = JSON.parse(response);
            return parResp.access_token;
        }).catch(function (err) {
            console.error("Error in getting agent token");
            return Promise.reject(err);
        })
    }
}

function getCustomerAccessToken(agentToken, customerId) {
    var options = {
        'method': 'POST',
        'url': baseAccountsUrl + '/customer/',
        'headers': {
            'Authorization': 'Bearer ' + agentToken,
            'Content-Type': 'application/json',
            'Cookie': '_gcl_au=1.1.658563599.1593424692; _ga=GA1.3.281353257.1593424692; _fbp=fb.1.1593424692641.667847735; amplitude_id_841104a62d8040f86beb1b507a0ea8eelivechat.com=eyJkZXZpY2VJZCI6ImUxNDc1NDcxLWRhMmEtNGYwMC05ZjUxLTY3ZGI3ZGQ0YjE4OVIiLCJ1c2VySWQiOm51bGwsIm9wdE91dCI6ZmFsc2UsInNlc3Npb25JZCI6MTU5MzQyNDY5MTUxNSwibGFzdEV2ZW50VGltZSI6MTU5MzQyNDcwNzUyNSwiZXZlbnRJZCI6MSwiaWRlbnRpZnlJZCI6MCwic2VxdWVuY2VOdW1iZXIiOjF9; __ia_3_v3=77cccfdaf66fb5a69ff571d97545ec48088a221129ca231c11ce8fb05c3acbd3'
        },
        body: JSON.stringify({
            "client_id": liveChat.clientId,
            "response_type": "token",
            "redirect_uri": redirect_uri,
            "entity_id": customerId
        })
    };
    return rp(options).then(function (response) {
        var parResp = JSON.parse(response)
        console.log("Customer token : ", parResp.access_token);
        return parResp.access_token;
    }).catch(function (err) {
        console.error("Error in getting customer token");
        return Promise.reject(err);
    });
}

function agentOAuth() {}

agentOAuth.prototype.getToken = function () {
    oAuth2Class.agentToken = undefined;
    return oAuth2Class.authorise().then(function (_data) {
        console.log("Agent token : ", oAuth2Class.agentToken);
        return oAuth2Class.agentToken;
    }).catch(function (err) {
        console.error("Error in from get token prototype", err.message);
        return ("Exception : " + err.message)
    });
}
agentOAuth.prototype.callBack = function (req, res) {
    console.log(req.query.code);
    return oAuth2Class.token(req.query.code).then(function (_token) {
        oAuth2Class.agentToken = _token;
        return res.send(oAuth2Class.agentToken);
    }).catch(function (err) {
        console.error("Error in handling callback ", err.message);
        return res.send(err.message);
    })
}

module.exports.authoriseAgent = agentOAuth;
module.exports.authoriseCustomer = getCustomerAccessToken;
