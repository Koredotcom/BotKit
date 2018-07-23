var _ = require('lodash');

function DataStore() {
    var botVariables = [];
}

DataStore.prototype.saveAllVariables = function(response, langArr) {
    this.botVariables = [];
    for (var i = 0; i < langArr.length; i++) {
        if (response[i].errors) {
            console.log(response[i].errors[0].msg);
            var obj = {
                "variables": [],
                "error": response[i].errors[0].msg
            };
            this.botVariables.push(obj);
        } else {
            this.botVariables.push(response[i]);
        }
    }
};

DataStore.prototype.addVariable = function(variable, arrIndex) {
    if (!this.botVariables[arrIndex].error) {
        this.botVariables[arrIndex].variables.push(variable);
        this.botVariables[arrIndex].count = this.botVariables[arrIndex].count + 1;
    }
};

DataStore.prototype.updateVariable = function(variable, langArr, index) {
    var eleIndex = _.findIndex(this.botVariables[index].variables, ['_id', variable._id]);
    if (eleIndex > -1) {
        if (variable.variableType === "env") {
            for (var i = 0; i < langArr.length; i++) {
                this.botVariables[i].variables[eleIndex] = variable;
            }
        } else {
            this.botVariables[index].variables[eleIndex] = variable;
        }
    }
};

DataStore.prototype.deleteVariable = function(variable, langArr) {
    for (var i = 0; i < langArr.length; i++) {
        if (!this.botVariables[i].error) {
            var eleIndex = _.findIndex(this.botVariables[i].variables, ['_id', variable._id]);
            this.botVariables[i].variables.splice(eleIndex, 1);
            this.botVariables[i].count = this.botVariables[i].count - 1;
        }
    }

};

module.exports.getInst = function() {
    return new DataStore();
};