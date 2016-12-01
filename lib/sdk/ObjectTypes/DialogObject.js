function Dialog(dialogJson){
    this.dialogId = dialogJson._id;
    this.nodes    = dialogJson.nodes;

    var componentMap = {};
    if (Array.isArray(dialogJson.components)) {
        dialogJson.components.forEach(function(component) {
            componentMap[component.name] = component;
        });
    }
    this.getComponent = function(componentName) {
        return componentMap[componentName];
    };
}

module.exports = Dialog;
