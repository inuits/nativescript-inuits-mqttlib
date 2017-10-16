var InuitsMqtt = /** @class */ (function () {
    function InuitsMqtt() {
        this.connector = null;
        this.application = require("application");
        this.connector = new eu.inuits.android.mqttlib.InuitsMqttControler();
        this.connector.init(this.application.android.context);
        this.callbacks = {};
    }
    InuitsMqtt.prototype.connect = function (uri, clientId) {
        this.connector.connect(uri, clientId);

        // TODO: fix this hack - needed for inner function callback below
        self = this;

        if (this.application.android) {
            this.application.android.registerBroadcastReceiver("android.intent.action.MQTT_MESSAGE_RECEIVED",

                function onReceiveCallback(context, intent) {

                    var topic = intent.getStringExtra("eu.inuits.android.mqttlib.MESSAGE_TOPIC");
                    var data = intent.getStringExtra("eu.inuits.android.mqttlib.MESSAGE_DATA");

                    // TODO: Check if self.callbacks are defined before calling!
                    self.callbacks[topic](data);

                });
        }
    };
    InuitsMqtt.prototype.disconnect = function () {
        if (this.application.android) {
            this.application.android.unregisterBroadcastReceiver("android.intent.action.MQTT_MESSAGE_RECEIVED");
        }

        return this.connector.disconnect();
    };
    InuitsMqtt.prototype.subscribe = function (topic, callback) {
        // TODO: Check if topic is present (already subscribed), otherwise it will override callback
        this.callbacks[topic] = callback;
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
};
