var InuitsMqtt = /** @class */ (function () {
    function InuitsMqtt() {
        this.connector = null;
        var application = require("application");
        var context = application.android.context;
        this.connector = new eu.inuits.android.mqttlib.InuitsMqttControler();
        this.connector.init(context);
    }
    InuitsMqtt.prototype.connect = function (uri) {
        this.connector.connect(uri);
    };
    InuitsMqtt.prototype.disconnect = function () {
        return this.connector.disconnect();
    };
    InuitsMqtt.prototype.subscribe = function (topic) {
        var application = require("application");
        var intent = this.connector.subscribe(topic);
        console.log(intent);
        
        return this.connector.subscribe(topic);
    };
    InuitsMqtt.prototype.unsubscribe = function (topic) {
        return this.connector.unsubscribe(topic);
    };
    InuitsMqtt.prototype.publish = function (topic, message) {
        return this.connector.publish(topic, message);
    };

    return InuitsMqtt;
}());

module.exports = {
    inuitsMqtt: InuitsMqtt
}