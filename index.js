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
            this.application.android.registerBroadcastReceiver("eu.inuits.android.mqttlib.MESSAGE",

                function onReceiveCallback(context, intent) {

                    var topic = intent.getStringExtra("eu.inuits.android.mqttlib.MESSAGE_TOPIC");
                    var data = intent.getStringExtra("eu.inuits.android.mqttlib.MESSAGE_DATA");

                    console.log("Intent: " + intent);
                    console.log("Intent topic: " + topic);
                    console.log("Intent data: " + data);
                    console.log(self.callbacks);
                    self.callbacks[topic](data);
                });
        }
    };
    InuitsMqtt.prototype.disconnect = function () {
        if (this.application.android) {
            this.application.android.unregisterBroadcastReceiver("eu.inuits.android.mqttlib.MESSAGE");
        }

        return this.connector.disconnect();
    };
    InuitsMqtt.prototype.subscribe = function (topic, callback) {
        console.log("Subscribing");
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
