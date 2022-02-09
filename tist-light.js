var mqtt = require('mqtt');
var os = require("os");
const ACCESS_TOKEN = process.argv[2]; 
const password = process.argv[3];

var client  = mqtt.connect('mqtt://demodsp.hpcc.vn',{
    username: ACCESS_TOKEN,
	password: password
});

var intensity = 400;
var latitude = 10.776386192550019;
var longitude = 106.6627489460308;

client.on('connect', function () {
    console.log('connected');
    client.subscribe('v1/devices/me/rpc/request/+');
    setInterval(publishTelemetry, 350000);
});

client.on('message', function (topic, message) {
    console.log('request.topic: ' + topic);
    console.log('request.body: ' + message.toString());
    var requestId = topic.slice('v1/devices/me/rpc/request/'.length), messageData = JSON.parse(message.toString());
    if (messageData.method === 'checkLightSensorActive') {
    	client.publish('v1/devices/me/rpc/response/' + requestId, JSON.stringify({active: true}));
    }
	if (messageData.method === 'checkLightSensorAccurate') {
    	client.publish('v1/devices/me/rpc/response/' + requestId, JSON.stringify({deranged: false}));
    }
});

function publishTelemetry() {
	emulateIntensityChanging();
	var msg = JSON.stringify({name: 'TIST Light Sensor 1',latitude: latitude, longitude: longitude, intensity: intensity });
	client.publish('v1/devices/me/telemetry', msg);
	console.log('Uploading intensity data: ', intensity);
}

function emulateIntensityChanging() {
	var randomNumber = Math.random()*20;
	if(randomNumber<4||randomNumber>16){
		intensity = 100 + randomNumber;
	}
	else if(randomNumber<4.5){
		intensity = -5;
	}
	else if(randomNumber>15.5){
		intensity = 1050;
	}
	else{
		intensity = 400 + randomNumber;
	}
	// Round to at most 2 decimal places (optional)
	intensity = Math.round( intensity * 100 ) / 100;
}