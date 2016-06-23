var restify = require('restify');
var builder = require('botbuilder');
var Util = require('./utility');

var dialog = new builder.LuisDialog('https://api.projectoxford.ai/luis/v1/application?id=769f6dc0-4eea-4b8c-acb4-e4c225a33669&subscription-key=d366dae09f4341598189fc1b8a52fcfd');


var hostName = "ec2-54-172-225-227.compute-1.amazonaws.com";
var customerPath = "/oebot/rest/oebot1/Customer?filter=";
var orderPath = "/oebot/rest/oebot1/Order?filter=";
var portName = 8810;


// Create bot and add dialogs
var bot = new builder.BotConnectorBot({ appId: 'notfbot', appSecret: '9c8126e3faf547828cb6d81b21450102' });
var orderid;
bot.add('/', dialog);

var reviewTemplate = 'For test ! The order is placed by our customer {CUSTOMER_NAME}. You can contact their representative <a href="mailto:{EMAIL_ADDRESS}">{CONTACT_PERSON}</a> at <a href="tel:{PHONE_NUMBER}"> {PHONE_NUMBER_TXT} </a>. Their credit limit is {CREDIT_LIMIT} and their current balance is {BALANCE}. \n Would you like to approve it?';

// Handling un recognized conversations.
dialog.on('None', function (session, args) {
	console.log('in none intent');	
	session.send("I am sorry! I am a bot, perhaps not programmed to understand this command");			
});

dialog.on('Notify', 
	function(session, args){
		console.log('in notify ');
		session.send('we just got an urgent order. Wanna review it?');		
	}
);

dialog.on('Review', 
[ 
	function(session, args){			
		if(!orderid){
			orderid = 5;
		}
		
		var txt = session.message.text;
		if(txt.match(Util.regExNegation)){
			session.endDialog('Very well! I will get back to you if something else needs your attention');
		}else if(txt.match(Util.regExAffirmative)){
			var respOrder = Util.httpSyncGET(hostName, portName, orderPath+"Ordernum="+orderid);
			var order = respOrder.dsOrder.ttOrder[0];
			console.log(JSON.stringify(respOrder));
			var respCustomer = Util.httpSyncGET(hostName, portName, customerPath+"CustNum="+order.CustNum)
			var customer = respCustomer.dsCustomer.ttCustomer[0];
			console.log(JSON.stringify(respCustomer));
			var resp = prepareReviewResponse(customer.Name, customer.Phone, customer.Contact, customer.CreditLimit, customer.Balance);
			builder.Prompts.confirm(session, resp);		
		}else{
			session.endDialog('Thank you and have a nice day! I will get back to you if something else needs your attention');
		}		
	}, 
	function (session, results) {
		console.log('in the prompts answer' +results.response);
        if (results.response) {			
			session.endDialog('Very well then! I will notify the concerned department for further processing. I will get back if something else needs your attention. Have a nice day!');				
		}else{
			session.endDialog('Very well! I will update the order as not approved. I will get back when there are more notifications!');
		
        }
    }
]);	



dialog.onDefault(function(session){
	session.send("I am sorry! I am a bot, perhaps not programmed to understand this command");	
});

function notify(mode, oid){
	console.log('begin dialog');
	orderid = oid;
	console.log(orderid +" orderid");
	
	var arr = ["8:live:officialdharam","8:growoncloud"];
	for(var i = 0 ; i < arr.length ; i++){
		if(mode == "skype"){
			console.log("skype");
			bot.beginDialog({
				to: { "address": arr[i], "channelId": "skype" , "id": "7JitRpa2At5", "isBot": false},
				from: { "address": "notfbot", "channelId": "skype", "id": "notfbot", "isBot": true},
				text: "Notify Usecase"
			}, '/');
		}else if(mode == "phone"){
			bot.beginDialog({
				to: { "address": "+16175383601", "channelId": "sms" , "id": "7JitRpa2At5", "isBot": false},
				from: { "address": "+12292990653", "channelId": "sms", "id": "notfbot", "isBot": true},
				text: "Notify Usecase"
			}, '/');
		}else if(mode == 'emulator'){
			bot.beginDialog({
				to: { "address": "User1", "channelId": "emulator" , "id": "7JitRpa2At5", "isBot": false},
				from: { "address": "testbot", "channelId": "emulator", "id": "testbot", "isBot": true},
				text: "Notify Usecase"
			}, '/');
		}
	}
}


function prepareReviewResponse(customerName, phoneNumber, contactPerson, creditLimit, balance){
	var respTemplate  = reviewTemplate;
	var emailAddress = contactPerson.replace(/ /g,'')+'@gmail.com';
	var phone = phoneNumber.replace(/ /g,'');
	phone = phone.replace(/-/g,'');
	phone = phone.replace(/\(/g,'');
	phone = phone.replace(/\)/g,'');	
	respTemplate = respTemplate.replace("{CUSTOMER_NAME}", customerName);
	respTemplate = respTemplate.replace("{PHONE_NUMBER}", phone);
	respTemplate = respTemplate.replace("{PHONE_NUMBER_TXT}", phoneNumber);
	respTemplate = respTemplate.replace("{EMAIL_ADDRESS}", emailAddress);
	respTemplate = respTemplate.replace("{CONTACT_PERSON}", contactPerson);
	respTemplate = respTemplate.replace("{CREDIT_LIMIT}", creditLimit);
	respTemplate = respTemplate.replace("{BALANCE}", balance);
	return respTemplate;
}

// Setup Restify Server
var server = restify.createServer();
server.use(restify.queryParser());

server.get('/api/trigger',function(req, res){
	res.send('hello ');
	console.log('received a trigger'+req.query.mode +" " +req.query.orderid+" ");
	notify(req.query.mode, req.query.orderid);	
});


server.post('/api/messages', bot.verifyBotFramework(),  bot.listen());
server.listen(process.env.port || 8080, function () {
   console.log('%s listening to %s', server.name, server.url); 
});

