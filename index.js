var InuitsMqtt = /** @class */ (function () {
    function InuitsMqtt() {
        this.connector = null;
        this.application = require("application");
        this.connector = new eu.inuits.android.mqttlib.InuitsMqttControler();
        this.connector.init(this.application.android.context);
        this.callbacks = {};
    }

    /**
     * Connects to the uri with clientId.
     * Then it registers callbacks.
     * TODO: use some wrapper for connection option, for now there is only username and password,
     *       but for additional things there should be a map or something like this.
     *
     * @param uri connection uri (eg. "wss://example.com:443/mqtt")
     * @param clientId (in ideal case Unique ID) if null, random UUID will be generated
     * @param username optional username for connection, set null if not needed
     * @param password optional username for connection, set null if not needed
     */
    InuitsMqtt.prototype.connect = function (uri, clientId, username, password) {

        /*
         * Connect to uri under selected clientId
         */
        this.connector.connect(uri, clientId, username, password);

        // TODO: fix this hack - needed for inner function callback below
        self = this;

        /*
         * Register broadcast receiver that catches all messages
         * and if you subscribed to some topic with callback, it will call this function with message data
         * TODO: move to separate method if there will be another "registerBroadcastReceiver" call
         */
        if (this.application.android) {
            this.application.android.registerBroadcastReceiver("eu.inuits.android.mqttlib.MESSAGE",
                function onReceiveCallback(context, intent) {
                    var topic = intent.getStringExtra("eu.inuits.android.mqttlib.MESSAGE_TOPIC");
                    var data = intent.getStringExtra("eu.inuits.android.mqttlib.MESSAGE_DATA");

                    try {
                        if (typeof self.callbacks[topic] === 'function') {
                            self.callbacks[topic](data);
                        } else {
                            console.error("Can't find callback to following topic: " + topic);
                        }
                    } catch(err) {
                        console.error(err)
                    }
                }
            );
        }
    };

    /**
     * This will unregister all broadcasts and disconnects from the current server
     */
    InuitsMqtt.prototype.disconnect = function () {
        /*
         * Unregister all broadcasts first.
         * TODO: move to separate method if there will be another "unregisterBroadcastReceiver" call
         */
        if (this.application.android) {
            this.application.android.unregisterBroadcastReceiver("eu.inuits.android.mqttlib.MESSAGE");
        }

        /*
         * Disconnect
         */
        return this.connector.disconnect();
    };

    /**
     * Subscribes to a topic. When the message from that topic is received, the callback with data is called.
     * The callback have to take exactly one argument, the data.
     * @param topic
     * @param callback
     */
    InuitsMqtt.prototype.subscribe = function (topic, callback) {

        /*
         * Store the JS callback
         * TODO: Check if topic is present (already subscribed), otherwise it will override callback
         */
        this.callbacks[topic] = callback;

        /*
         * Subscribe to the topic
         */
        return this.connector.subscribe(topic);
    };

    /**
     * Remove a callback and then unsubscribe from some topic.
     * @param topic
     */
    InuitsMqtt.prototype.unsubscribe = function (topic) {
        delete this.callbacks[topic];
        return this.connector.unsubscribe(topic);
    };

    /**
     * Publish message to a topic
     * @param topic
     * @param message
     */
    InuitsMqtt.prototype.publish = function (topic, message) {
        return this.connector.publish(topic, message);
    };

    // Because of reasons!
    return InuitsMqtt;
}());

module.exports = {
    inuitsMqtt: InuitsMqtt
};
