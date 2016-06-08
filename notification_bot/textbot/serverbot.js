var http = require('http');
var restify = require('restify');
var builder = require('botbuilder');
var dialog = new builder.LuisDialog('https://api.projectoxford.ai/luis/v1/application?id=c5150c0f-10ce-47e3-b94a-630cf8f9ef89&subscription-key=d366dae09f4341598189fc1b8a52fcfd');

// Create bot and add dialogs
var bot = new builder.BotConnectorBot({ appId: 'notificationbot', appSecret: '7c21e7ea1a6444b88dcf8c4bbb79f263' });
var s3URL = "http://s3.amazonaws.com/bot-poc";

bot.add('/', dialog);

function notify(){
	console.log('begin dialog');
	bot.beginDialog({
		to: { "address": "8:live:officialdharam", "channelId": "skype" , "id": "7JitRpa2At5", "isBot": false},
		from: { "address": "notificationbot", "channelId": "skype", "id": "notificationbot", "isBot": true}
	}, '/');
	
	/*bot.beginDialog({
		to: { "address": "+16175383601", "channelId": "sms" , "id": "7JitRpa2At5", "isBot": false},
		from: { "address": "+12292990653", "channelId": "sms", "id": "notificationbot", "isBot": true}
	}, '/');*/
	
}

// Handling un recognized conversations.
dialog.on('None', function (session, args) {
	console.log("In the None Intent");	
});


dialog.onDefault([function(session){	
	console.log("default intent handler");
	builder.Prompts.text(session, "We just got an urgent order from Good Match. Would you like to review the order and approve it?");	
}, function(session, results){
	console.log(results.response);
}]);



function makeHTTPURL(duration){
	var months = ["january","february","march","april","may","june","july","august","september","october","november","december"];
	var years = ["2010","2011","2012","2013","2014","2015","2016","last year"];
	var index = months.indexOf(duration.toLowerCase());
	
	if(index > 0){
		index+=1;
		return s3URL + "/monthly/"+index;
	}else if (years.indexOf(duration.toLowerCase()) > 0 ){
		index = years.indexOf(duration.toLowerCase()) + 1;
		return s3URL + "/yearly/"+index;
	}
}

function getIdentifiers(entities){
	if(entities.length <= 0)
		return;
	
	var itemname, duration;
	for(var i = 0 ; i < entities.length; i++){
		if(entities[i].type === 'builtin.datetime.date'){
			duration = entities[i].entity;			
		}else if(entities[i].type == 'itemname'){
			itemname = entities[i].entity;			
		}
	}	
	return {"itemname":itemname, "duration":duration};
}

function sendMessageSalesReport(session, url, duration, itemname){
	
	session.send("Below is the stats for sales of {0} for the duration {1}. You can also click on the link below to check out a more interactive chart".format(itemname, duration));
	var msg =    {
		"attachments": [
			{
				"contentType": "image/png",
				"contentUrl": url+".png"
			}
		]
	};
	
	session.send(msg);
	session.send(url+".html");
	
}

String.prototype.format = function() {
    var formatted = this;
    for (var i = 0; i < arguments.length; i++) {
        var regexp = new RegExp('\\{'+i+'\\}', 'gi');
        formatted = formatted.replace(regexp, arguments[i]);
    }
    return formatted;
};


// Setup Restify Server
var server = restify.createServer();
server.post('/api/messages', bot.verifyBotFramework(),  bot.listen());
server.get('/api/trigger',function(req, res){
	res.send('hello ');
	console.log('received a trigger');
	notify();	
});


server.listen(process.env.port || 8080, function () {
   console.log('%s listening to %s', server.name, server.url); 
});