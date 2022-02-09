var mqtt = require('mqtt');
var os = require("os");
const ACCESS_TOKEN = process.argv[2]; 
const password = process.argv[3];

var client  = mqtt.connect('mqtt://demodsp.hpcc.vn',{
    username: ACCESS_TOKEN,
	password: password
});

var soil_moisture = 20;
var latitude = 10.777888562650015;
var longitude = 106.6627686660305;

client.on('connect', function () {
    console.log('connected');
    client.subscribe('v1/devices/me/rpc/request/+');
    setInterval(publishTelemetry, 500000);
});

client.on('message', function (topic, message) {
    console.log('request.topic: ' + topic);
    console.log('request.body: ' + message.toString());
    var requestId = topic.slice('v1/devices/me/rpc/request/'.length), messageData = JSON.parse(message.toString());
    if (messageData.method === 'checkSoilMoistureSensorActive') {
    	client.publish('v1/devices/me/rpc/response/' + requestId, JSON.stringify({active: true}));
    }
	if (messageData.method === 'checkSoilMoistureSensorAccurate') {
    	client.publish('v1/devices/me/rpc/response/' + requestId, JSON.stringify({deranged: false}));
    }
});

function publishTelemetry() {
	emulateSoilMoistureChanging();
	var msg = JSON.stringify({name: 'TIST Soil Moisture Sensor 1',latitude: latitude, longitude: longitude, soil_moisture: soil_moisture });
	client.publish('v1/devices/me/telemetry', msg);
	console.log('Uploading soil moisture data: ', soil_moisture);
}

function emulateSoilMoistureChanging() {
	var randomNumber = Math.random()*20;
	if(randomNumber<4||randomNumber>16){
		soil_moisture = 5 + randomNumber;
	}
	else if(randomNumber<4.5){
		soil_moisture = -5;
	}
	else if(randomNumber>15.5){
		soil_moisture = 105;
	}
	else{
		soil_moisture = 60 + randomNumber;
	}
	// Round to at most 2 decimal places (optional)
	soil_moisture = Math.round( soil_moisture * 100 ) / 100;
}