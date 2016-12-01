var invokeAPI = require("./invokePlatformAPIs");

module.exports = function(getDialogURL, callback) {
    return invokeAPI.get(getDialogURL)
        .then(function(res) {
            try {
                return JSON.parse(res.body);
            } catch(e) {
                return {};
            }
        })
        .nodeify(callback);
};
