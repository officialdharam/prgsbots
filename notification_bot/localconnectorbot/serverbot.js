var http = require('http');
var restify = require('restify');
var builder = require('botbuilder');
var dialog = new builder.LuisDialog('https://api.projectoxford.ai/luis/v1/application?id=769f6dc0-4eea-4b8c-acb4-e4c225a33669&subscription-key=d366dae09f4341598189fc1b8a52fcfd');

var hostName = "ec2-54-172-225-227.compute-1.amazonaws.com";
var customerDetailPathName = "/oebot/rest/oebot1/Customer?filter=";
var orderDetailPathName = "/oebot/rest/oebot1/Order?filter=";
var portName = 8810;

// Create bot and add dialogs
var bot = new builder.BotConnectorBot({ appId: 'notificationbot', appSecret: '7c21e7ea1a6444b88dcf8c4bbb79f263' });
var orderid;
bot.add('/', dialog);

// Handling un recognized conversations.
dialog.on('None', function (session, args) {
	console.log("In the None Intent");	
});

dialog.onDefault(function(session){	
	console.log("default intent handler" +orderid);
	var url = orderDetailPathName + 'Ordernum='+orderid;
	makeHTTPGETCall(session, url, orderSuccess, orderError);
	
});

dialog.on('Approval', [function(session, args){	
	console.log("approval intent handler" +orderid);
	var url = orderDetailPathName + 'Ordernum='+orderid;
	makeHTTPGETCall(session, url, orderSuccess, orderError);
	
}, function(session, results){
	console.log('in waterfall');
}]);

String.prototype.format = function() {
    var formatted = this;
    for (var i = 0; i < arguments.length; i++) {
        var regexp = new RegExp('\\{'+i+'\\}', 'gi');
        formatted = formatted.replace(regexp, arguments[i]);
    }
    return formatted;
};

function notify(mode, oid){
	console.log('begin dialog');
	orderid = oid;
	if(mode == "skype"){
		console.log("skype");
		bot.beginDialog({
			to: { "address": "8:live:officialdharam", "channelId": "skype" , "id": "7JitRpa2At5", "isBot": false},
			from: { "address": "notificationbot", "channelId": "skype", "id": "notificationbot", "isBot": true},
			text: "Approval Usecase"
		}, '/');
	}else if(mode == "phone"){
		bot.beginDialog({
			to: { "address": "+16175383601", "channelId": "sms" , "id": "7JitRpa2At5", "isBot": false},
			from: { "address": "+12292990653", "channelId": "sms", "id": "notificationbot", "isBot": true},
			text: "Approval Usecase"
		}, '/');
	}
}


function makeHTTPGETCall(session, pathName, successFn, errorFn){
	console.log(new Date()+ " REST Call to "+ pathName);
	var responseBody="";
	
	var options = {
		hostname: hostName,
		port: portName,
		path: pathName,
		method: 'GET'
	};
	
	var req = http.request(options, (res) => {
		
		if(res.statusCode == 200) {
			res.setEncoding('utf8');
			res.on('data', (chunk) => {				
				responseBody = responseBody.concat(chunk);
				//console.log(responseBody);
			});
			
			
			res.on('end', () => {				
				var objects = JSON.parse(responseBody);
				successFn(session, objects);
				//console.log(responseBody);				
			});
		}
	});

	req.on('error', function(e){
		console.log(e);
	});	
	req.end();	
}


function orderSuccess(session, resp){
	var orders = resp.dsOrder;
	var ttOrder = orders.ttOrder;	
	if(ttOrder == undefined){
		console.log('No order found');
		session.send('We just got an urgent order from Game Match, would you like to approve it');
	}else{
		var response = ttOrder[0];
		session.userData.ORDER_ID = response.Ordernum;
		session.userData.PROMISE_DATE = response.PromiseDate;
		session.userData.CARRIER = response.Carrier;
		session.userData.SALES_REP = response.SalesRep;
		var url = customerDetailPathName + 'CustNum='+ response.CustNum;	
		makeHTTPGETCall(session, url, customerSuccess, customerError);		
	}
}

function orderError(e){
	console.log("Error in HTTP call"+e);
	//session.endDialog();
}

function customerSuccess(session, resp){
	var customers = resp.dsCustomer;
	var ttCustomer = customers.ttCustomer;	
	if(ttCustomer == undefined){
		session.send("No customer with the identifier was found");
		session.endDialog();
	}else{
		var response = ttCustomer[0];
		session.userData.CUSTOMER_ID = response.CustNum;
		session.userData.CUSTOMER_NAME = response.Name;
		session.userData.PHONE_NUMBER = response.Phone;
		session.userData.SALES_REP = response.SalesRep;
		session.userData.CREDIT_LIMIT = response.CreditLimit;
		session.userData.BALANCE = response.Balance;
		session.userData.CONTACT = response.Contact;				
		builder.Prompts.text(session, "We just received an urgent order from {0}. Would you like to review it?".format(session.userData.CUSTOMER_NAME));
	}
}

function customerError(err){
	console.log("Error in HTTP call");
}


// Setup Restify Server
var server = restify.createServer();
server.use(restify.queryParser());
server.post('/api/messages', bot.verifyBotFramework(),  bot.listen());
server.get('/api/trigger',function(req, res){
	res.send('hello ');
	console.log('received a trigger'+req.query.mode +" " +req.query.orderid+" ");
	notify(req.query.mode, req.query.orderid);	
});


server.listen(process.env.port || 8080, function () {
   console.log('%s listening to %s', server.name, server.url); 
});