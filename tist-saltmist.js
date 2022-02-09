var mqtt = require('mqtt');
var os = require("os");
const ACCESS_TOKEN = process.argv[2]; 
const password = process.argv[3];

var client  = mqtt.connect('mqtt://demodsp.hpcc.vn',{
    username: ACCESS_TOKEN,
	password: password
});

var concentration = 10;
var latitude = 10.774688812550017;
var longitude = 106.6627482460310;

client.on('connect', function () {
    console.log('connected');
    client.subscribe('v1/devices/me/rpc/request/+');
    setInterval(publishTelemetry, 450000);
});

client.on('message', function (topic, message) {
    console.log('request.topic: ' + topic);
    console.log('request.body: ' + message.toString());
    var requestId = topic.slice('v1/devices/me/rpc/request/'.length), messageData = JSON.parse(message.toString());
    if (messageData.method === 'checkSaltMistSensorActive') {
    	client.publish('v1/devices/me/rpc/response/' + requestId, JSON.stringify({active: true}));
    }
	if (messageData.method === 'checkSaltMistSensorAccurate') {
    	client.publish('v1/devices/me/rpc/response/' + requestId, JSON.stringify({deranged: false}));
    }
});

function publishTelemetry() {
	emulateConcentrationChanging();
	var msg = JSON.stringify({name: 'TIST Salt Mist Sensor 1',latitude: latitude, longitude: longitude, concentration: concentration });
	client.publish('v1/devices/me/telemetry', msg);
	console.log('Uploading concentration data: ', concentration);
}

function emulateConcentrationChanging() {
	var randomNumber = Math.random()*20;
	if(randomNumber<4||randomNumber>16){
		concentration = 5 + randomNumber;
	}
	else if(randomNumber<4.5){
		concentration = -5;
	}
	else if(randomNumber>15.5){
		concentration = 105;
	}
	else{
		concentration = 10 + randomNumber;
	}
	// Round to at most 2 decimal places (optional)
	concentration = Math.round( concentration * 100 ) / 100;
}