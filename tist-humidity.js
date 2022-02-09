var mqtt = require('mqtt');
var os = require("os");
const ACCESS_TOKEN = process.argv[2]; 
const password = process.argv[3];

var client  = mqtt.connect('mqtt://demodsp.hpcc.vn',{
    username: ACCESS_TOKEN,
	password: password
});

var humidity = 10;
var latitude = 10.774688116550124;
var longitude = 106.6657480460412;

client.on('connect', function () {
    console.log('connected');
    client.subscribe('v1/devices/me/rpc/request/+');
    setInterval(publishTelemetry, 300000);
});

client.on('message', function (topic, message) {
    console.log('request.topic: ' + topic);
    console.log('request.body: ' + message.toString());
    var requestId = topic.slice('v1/devices/me/rpc/request/'.length), messageData = JSON.parse(message.toString());
    if (messageData.method === 'checkHumiditySensorActive') {
    	client.publish('v1/devices/me/rpc/response/' + requestId, JSON.stringify({active: true}));
    }
	if (messageData.method === 'checkHumiditySensorAccurate') {
    	client.publish('v1/devices/me/rpc/response/' + requestId, JSON.stringify({deranged: false}));
    }
});

function publishTelemetry() {
	emulateHumidityChanging();
	var msg = JSON.stringify({name: 'TIST Humidity Sensor 1',latitude: latitude, longitude: longitude, humidity: humidity });
	client.publish('v1/devices/me/telemetry', msg);
	console.log('Uploading humidity data: ', humidity);
}

function emulateHumidityChanging() {
	var randomNumber = Math.random()*20;
	if(randomNumber<4||randomNumber>16){
		humidity = 5 + randomNumber;
	}
	else if(randomNumber<4.5){
		humidity = -5;
	}
	else if(randomNumber>15.5){
		humidity = 105;
	}
	else{
		humidity = 60 + randomNumber;
	}
	// Round to at most 2 decimal places (optional)
	humidity = Math.round( humidity * 100 ) / 100;
}