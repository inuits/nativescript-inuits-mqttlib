# Nativescript MQTT lib wrapper around intent-controlled MQTT PAHO ECLISPSE ANDROID SERVICE

This repository is simple plugin for nativescript, that exposes External Native-Android (java) code.

This repository was created because nativescript-mqtt is using customized Paho JS MQTT library, which does not work in 
some cases like using SSL or configuring proper HTTP Headers for protocol switch.

The callbacks are made by catching incomming Message intents.

## Interface

There is simple interface with few methods that allows most of the work done in simple way.
See index.js

### connect(uri, clientId)

This will connect to specified URI with custom clientId. Is clientId is not specified, underlying library will 
generate random UUID as client id.

### disconnect()

This will disconnect from current connection

### subscribe(topic, callback)

This will subscribe to the specified topic and call the callback when message arrives.
The callbacks are handled inside this JS class. This is not shared among multiple instances.

### unsubscribe(topic)

This will unsubscribe from specified topic

## publish(topic, message)

This will publish message to specified topic