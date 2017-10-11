var application = require("application");
var context = application.android.context;

module.exports = {
    startIntent: function() {
        var mqttControler = new eu.inuits.android.mqttlib.InuitsMqttControler();
        mqttControler.start(context);
    }
};
