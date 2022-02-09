var mqtt = require('mqtt');
var os = require("os");
const ACCESS_TOKEN = process.argv[2]; 
const password = process.argv[3];

var client  = mqtt.connect('mqtt://demodsp.hpcc.vn',{
    username: ACCESS_TOKEN,
	password: password
});

var temperature = 30;
var latitude = 10.774386112550014;
var longitude = 106.6607480460301;

client.on('connect', function () {
    console.log('connected');
    client.subscribe('v1/devices/me/rpc/request/+');
    setInterval(publishTelemetry, 500000);
});

client.on('message', function (topic, message) {
    console.log('request.topic: ' + topic);
    console.log('request.body: ' + message.toString());
    var requestId = topic.slice('v1/devices/me/rpc/request/'.length), messageData = JSON.parse(message.toString());
    if (messageData.method === 'checkTemperatureSensorActive') {
    	client.publish('v1/devices/me/rpc/response/' + requestId, JSON.stringify({active: true}));
    }
	if (messageData.method === 'checkTemperatureSensorAccurate') {
    	client.publish('v1/devices/me/rpc/response/' + requestId, JSON.stringify({deranged: false}));
    }
});

function publishTelemetry() {
	emulateTemperatureChanging();
	var msg = JSON.stringify({name: 'TIST Temperature Sensor 1',latitude: latitude, longitude: longitude, temperature: temperature });
	client.publish('v1/devices/me/telemetry', msg);
	console.log('Uploading temperature data: ', temperature);
}

function emulateTemperatureChanging() {
	var randomNumber = Math.random()*20;
	if(randomNumber<4||randomNumber>16){
		temperature = -5 + randomNumber;
	}
	else if(randomNumber<4.5){
		temperature = -15;
	}
	else if(randomNumber>15.5){
		temperature = 55;
	}
	else{
		temperature = 30 + randomNumber;
	}
	// Round to at most 2 decimal places (optional)
	temperature = Math.round( temperature * 100 ) / 100;
}