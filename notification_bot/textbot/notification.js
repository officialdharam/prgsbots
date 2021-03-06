var http = require('http');
var restify = require('restify');
var builder = require('botbuilder');

var bot = new builder.TextBot();

var dialog = new builder.LuisDialog('https://api.projectoxford.ai/luis/v1/application?id=c5150c0f-10ce-47e3-b94a-630cf8f9ef89&subscription-key=d366dae09f4341598189fc1b8a52fcfd');

var s3URL = "http://s3.amazonaws.com/bot-poc";

bot.add('/', dialog);

bot.beginDialog({
     to: { address: "User1", channelId: "emulator" , id: "2c1c7fa3"},
     from: { address: "notificationbot", channelId: "emulator", id: "notificationbot"}
 }, '/');

// Handling un recognized conversations.
dialog.on('None', function (session, args) {
	console.log("In the None Intent");	
});


dialog.onDefault(function(session){
	session.send("I'm sending you a proactive message! DO you have some work for me?");
});



dialog.on('ItemSale', 
[ 
	function(session, args){	
		session.userData.ITEM_NAME = undefined;
		session.userData.DURATION = undefined;	
		console.log("In the ItemSale Intent Step 1");
		var itemname, duration;				
		
		var entities = args.entities;		
		var ids = getIdentifiers(entities);
		
		if(ids){
			itemname = ids.itemname;
			duration = ids.duration;
			console.log("1. item name {0} , duration {1}".format(itemname, duration));
			if(itemname){
				session.userData.ITEM_NAME = itemname;
				if(duration){
					session.userData.DURATION = duration;
					sendMessageSalesReport(session, makeHTTPURL(duration), session.userData.DURATION, session.userData.ITEM_NAME);		
					session.endDialog();
				}else{
					builder.Prompts.text(session, "Please enter the duration of stat.");
				}
			}else{
				builder.Prompts.text(session, "Please enter the item name.");
			}
		}else{
			builder.Prompts.text(session, "Please enter the item name.");
		}		
				
	}, function (session, results) {		
        var itemname = session.userData.ITEM_NAME;
		var duration = session.userData.DURATION;
		console.log("2. item name {0} , duration {1}".format(itemname, duration));
		
		if(!itemname){		
			console.log("2. In the ItemSale Intent Step 2" + results.response);
			if(results.response){
				itemname = results.response;
				session.userData.ITEM_NAME = itemname;
				builder.Prompts.text(session, "Please enter the duration of stat.");
			}
		}else{
			if(results.response){
				console.log("In the ItemSale Intent Step 2.5" + results.response);
				duration = results.response;
				session.userData.DURATION = duration;
				sendMessageSalesReport(session, makeHTTPURL(duration), session.userData.DURATION, session.userData.ITEM_NAME);		
				session.endDialog();
			}
		}
    }, function (session, results) {	
		console.log("3. In the ItemSale Intent Step 3")	;
		if(results.response){
			var duration = results.response;
			session.userData.DURATION = duration;
			
			if(duration){
				console.log("3. duration {0}".format(duration));
				sendMessageSalesReport(session, makeHTTPURL(duration), session.userData.DURATION, session.userData.ITEM_NAME);
			}
		}
		
    }
]);	


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
bot.listenStdin();