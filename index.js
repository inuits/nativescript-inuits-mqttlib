var InuitsMqtt = /** @class */ (function () {

    const constants = eu.inuits.android.mqttlib.Constants;

    function InuitsMqtt() {
        this.connector = null;
        this.application = require("application");
        this.connector = new eu.inuits.android.mqttlib.InuitsMqttControler();
        this.connector.init(this.application.android.context);
        this.callbacks = {};

        this.handlers = {
            connectionSuccessHandler: null,
            connectionErrorHandler: null,
            connectionLostHandler: null,
            subscribeErrorHandler: null
        }

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

        this.registerBroadcastReceivers();
    };

    InuitsMqtt.prototype.reconnect = function (uri, clientId, username, password) {

        /*
         * Connect to uri under selected clientId
         */
        this.connector.connect(uri, clientId, username, password);

    };


    /**
     * This will unregister all broadcasts and disconnects from the current server
     */
    InuitsMqtt.prototype.disconnect = function () {
        this.unregisterBroadcastReceivers();

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
     * @param qos
     */
    InuitsMqtt.prototype.subscribe = function (topic, callback, qos) {
        if (qos === undefined) {
            qos = constants.QOS_DEFAULT_VALUE;
        }

        /*
         * Store the JS callback
         * TODO: Check if topic is present (already subscribed), otherwise it will override callback
         */
        this.callbacks[topic] = callback;

        /*
         * Subscribe to the topic
         */
        var java_int = new java.lang.Integer(qos);
        return this.connector.subscribe(topic, java_int);
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

    InuitsMqtt.prototype.registerHandlers = function (connectionSuccessHandler, connectionErrorHandler, connectionLostHandler, subscribeErrorHandler) {
        this.registerHandler("connectionSuccessHandler", connectionSuccessHandler);
        this.registerHandler("connectionErrorHandler", connectionErrorHandler);
        this.registerHandler("connectionLostHandler", connectionLostHandler);
        this.registerHandler("subscribeErrorHandler", subscribeErrorHandler);
    };

    InuitsMqtt.prototype.registerHandler = function (handlerName, handlerCallback) {
        this.handlers[handlerName] = handlerCallback;
    };


    InuitsMqtt.prototype.registerConnectionSuccessHandler = function (connectionSuccessHandler) {
        this.registerHandler("connectionErrorHandler", connectionSuccessHandler);
    };

    InuitsMqtt.prototype.registerConnectionErrorHandler = function (connectionErrorHandler) {
        this.registerHandler("connectionErrorHandler", connectionErrorHandler);
    };

    InuitsMqtt.prototype.registerConnectionLostHandler = function (connectionLostHandler) {
        this.registerHandler("connectionLostHandler", connectionLostHandler);
    };

    InuitsMqtt.prototype.registerSubscribeErrorHandler = function (subscribeErrorHandler) {
        this.registerHandler("subscribeErrorHandler", subscribeErrorHandler);
    };



    InuitsMqtt.prototype.registerBroadcastReceivers = function () {
        // TODO: fix this hack - needed for inner function callback below
        self = this;

        /*
         * Register broadcast receiver that catches all messages
         * and if you subscribed to some topic with callback, it will call this function with message data
         */
        if (this.application.android) {
            console.log(constants.MESSAGE);

            // Handle incomming Message
            this.application.android.registerBroadcastReceiver(constants.MESSAGE,

                function onReceiveCallback(context, intent) {
                    console.log("Received Message");

                    var topic = intent.getStringExtra(constants.MESSAGE_TOPIC);
                    var data = intent.getStringExtra(constants.MESSAGE_DATA);

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

            this.application.android.registerBroadcastReceiver(constants.RESPONSE,
                function onReceiveCallback(context, intent) {

                    try {
                        console.log("Received Response");

                        var connectionSuccessMessage = intent.getStringExtra(constants.RESPONSE_CONNECTION_SUCCESS);
                        var connectionLostMessage = intent.getStringExtra(constants.RESPONSE_CONNECTION_LOST);
                        var connectionErrorMessage = intent.getStringExtra(constants.RESPONSE_CONNECTION_ERROR);
                        var connectionSubscribeMessage = intent.getStringExtra(constants.RESPONSE_SUBSCRIBE_ERROR);

                        var errorStackTrace = intent.getStringExtra(constants.RESPONSE_ERROR);

                        if (connectionSuccessMessage) {
                            // CONNECTION SUCCESS
                            if (typeof self.handlers["connectionSuccessHandler"] === 'function') {
                                self.handlers["connectionSuccessHandler"](connectionSuccessMessage, errorStackTrace);
                            } else {
                                console.log("connectionSuccessHandler is not function, printing message to console:");
                                console.log(connectionSuccessMessage);
                                console.error(errorStackTrace);
                            }

                        } else if (connectionLostMessage) {
                            // CONNECTION LOST
                            if (typeof self.handlers["connectionLostHandler"] === 'function') {
                                self.handlers["connectionLostHandler"](connectionLostMessage, errorStackTrace);
                            } else {
                                console.log("connectionLostHandler is not function, printing message to console:");
                                console.log(connectionLostMessage);
                                console.error(errorStackTrace);
                            }

                        } else if (connectionErrorMessage) {
                            // CONNECTION ERROR

                            if (typeof self.handlers["connectionErrorHandler"] === 'function') {
                                self.handlers["connectionErrorHandler"](connectionErrorMessage, errorStackTrace);
                            } else {
                                console.log("connectionErrorHandler is not function, printing message to console:");
                                console.log(connectionErrorMessage);
                                console.error(errorStackTrace);
                            }

                        } else if (connectionSubscribeMessage) {
                            // CONNECTION SUBSCRIBE ERROR
                            if (typeof self.handlers["subscribeErrorHandler"] === 'function') {
                                self.handlers["subscribeErrorHandler"](connectionSubscribeMessage, errorStackTrace);
                            } else {
                                console.log("subscribeErrorHandler is not function, printing message to console:");
                                console.log(connectionSubscribeMessage);
                                console.error(errorStackTrace);
                            }
                        }

                    } catch(err) {
                        console.error(err)
                    }
                }
            );
        }
    };

    InuitsMqtt.prototype.unregisterBroadcastReceivers = function () {
        /*
         * Unregister all broadcasts first.
         */
        if (this.application.android) {
            this.application.android.unregisterBroadcastReceiver(constants.MESSAGE);
            this.application.android.unregisterBroadcastReceiver(constants.RESPONSE);
        }
    };

    // Because of reasons!
    return InuitsMqtt;
}());

module.exports = {
    inuitsMqtt: InuitsMqtt
};
