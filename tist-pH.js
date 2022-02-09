var mqtt = require('mqtt');
var os = require("os");
const ACCESS_TOKEN = process.argv[2]; 
const password = process.argv[3];

var client  = mqtt.connect('mqtt://demodsp.hpcc.vn',{
    username: ACCESS_TOKEN,
	password: password
});

var pH = 7;
var latitude = 10.776386112550018;
var longitude = 106.6617480460303;

client.on('connect', function () {
    console.log('connected');
    client.subscribe('v1/devices/me/rpc/request/+');
    setInterval(publishTelemetry, 400000);
});

client.on('message', function (topic, message) {
    console.log('request.topic: ' + topic);
    console.log('request.body: ' + message.toString());
    var requestId = topic.slice('v1/devices/me/rpc/request/'.length), messageData = JSON.parse(message.toString());
    if (messageData.method === 'checkpHSensorActive') {
    	client.publish('v1/devices/me/rpc/response/' + requestId, JSON.stringify({active: true}));
    }
	if (messageData.method === 'checkpHSensorAccurate') {
    	client.publish('v1/devices/me/rpc/response/' + requestId, JSON.stringify({deranged: false}));
    }
});

function publishTelemetry() {
	emulatepHChanging();
	var msg = JSON.stringify({name: 'TIST pH Sensor 1',latitude: latitude, longitude: longitude, pH: pH });
	client.publish('v1/devices/me/telemetry', msg);
	console.log('Uploading pH data: ', pH);
}

function emulatepHChanging() {
	var randomNumber = Math.random()*20;
	if(randomNumber<4||randomNumber>16){
		pH = 4 + randomNumber;
	}
	else if(randomNumber<4.5){
		pH = -1;
	}
	else if(randomNumber>15.5){
		pH = 15;
	}
	else{
		pH = 6.5 + randomNumber;
	}
	// Round to at most 2 decimal places (optional)
	pH = Math.round( pH * 100 ) / 100;
}