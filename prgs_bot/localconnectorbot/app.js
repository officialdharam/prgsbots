var http = require('http');
var restify = require('restify');
var builder = require('botbuilder');
var dialog = new builder.LuisDialog('https://api.projectoxford.ai/luis/v1/application?id=7b847783-c37a-4f03-a985-2bfb7d063dac&subscription-key=d366dae09f4341598189fc1b8a52fcfd');
// Create bot and add dialogs
var bot = new builder.BotConnectorBot({ appId: 'testserverbot', appSecret: 'f274c8ffa831495ebf681837efec2687' });
var hostName = "ec2-54-172-225-227.compute-1.amazonaws.com";
var customerDetailPathName = "/oebot/rest/oebot1/Customer?filter=";
var orderDetailPathName = "/oebot/rest/oebot1/Order?filter=";
var portName = 8810;

bot.add('/', dialog);

var customerDetailTemplate = "Here are the details for Customer( \nCustomer ID : {CustNum},\nName: {Name},\nPrimary Contact : {Contact}, \nSales Rep : {SalesRep}, \nCredit Limit : {CreditLimit}, \nBalance : {Balance}, \nPayment Mode : {Terms} )";

var orderDetailTemplate = "Here are the details for Order( \nOrder ID : {Ordernum}, \nCustomer ID : {CustNum}, \nOrder Date : {OrderDate} ,\nPromise Date : {PromiseDate}, \nOrder Status : {OrderStatus})";

String.prototype.format = function() {
    var formatted = this;
    for (var i = 0; i < arguments.length; i++) {
        var regexp = new RegExp('\\{'+i+'\\}', 'gi');
        formatted = formatted.replace(regexp, arguments[i]);
    }
    return formatted;
};

// Handling un recognized conversations.
dialog.on('None', function (session, args) {	
	session.send("I am sorry! Perhaps my responses are limited. Currently, I can answer : \n 1.	Customer's Phone Number. \n 1.	Customer's Primary Contact. \n 1.	Customer's Credit Limit. \n 1.	Customer's Balance \n 1.	Customer's Sales Representative");	
	printUserData(session.userData);
	session.userData.CUSTOMER_ID = undefined;
	session.userData.CUSTOMER_NAME = undefined;		
	printUserData(session.userData);
});

dialog.on('GetPhoneNumber', 
[ 
	function(session, args){
		printUserData(session.userData);
		var customerId = session.userData.CUSTOMER_ID;
		var phone = session.userData.PHONE_NUMBER;
		var customerName = session.userData.CUSTOMER_NAME;
		
		var entities = args.entities;
		var id;		
		var identifier;
		
		var ids = getIdentifierForCustomer(entities);
		if(ids){
			identifier = ids.identifier;
			id = ids.id;
		}
		
		// if identifier exists, check in the session for equivalence. If matches, return else make a HTTP call
		// If identifier doesn't exist, check in session for existence, if found return else prompt and make a call
		
		if(identifier){
			if(identifier == customerId || identifier == customerName){				
				session.send("The PHONE NUMBER for {0} is {1} ".format(customerName, phone));
			}else{
				if(id)
					url = customerDetailPathName + 'CustNum='+ identifier;	
				else
					url = customerDetailPathName + 'Name="'+ encodeURIComponent(identifier)+'"';
				makeHTTPGETCall(session, url, getCustomerSuccess, getCustomerError, "PHONE_NUMBER");				
			}
		}else{
			if(customerId){
				session.send("The PHONE NUMBER for {0} is {1} ".format(customerName, phone));								
			}else{
				builder.Prompts.text(session, "Which customer's phone number would you require?");
			}
		}
	}, function (session, results) {	
        if (results.response) {
			var txt = results.response;
			var hasNum = hasNumber(txt);
			if(hasNum){
				var num = getNumber(txt);
				url = customerDetailPathName + 'CustNum='+ num;
			}else{				
				url = customerDetailPathName + 'Name="'+ encodeURIComponent(results.response)+'"';
			}
            
			makeHTTPGETCall(session, url, getCustomerSuccess, getCustomerError,  "PHONE_NUMBER");	
        }
    }
]);	

dialog.on('GetPrimaryContact', 
[ 
	function(session, args){
		printUserData(session.userData);
		var customerId = session.userData.CUSTOMER_ID;
		var primaryContact = session.userData.PRIMARY_CONTACT;
		var customerName = session.userData.CUSTOMER_NAME;
		
		var entities = args.entities;
		var id;		
		var identifier;
		
		var ids = getIdentifierForCustomer(entities);
		if(ids){
			identifier = ids.identifier;
			id = ids.id;
		}
		
		// if identifier exists, check in the session for equivalence. If matches, return else make a HTTP call
		// If identifier doesn't exist, check in session for existence, if found return else prompt and make a call
		
		if(identifier){
			if(identifier == customerId || identifier == customerName){				
				session.send("The PRIMARY CONTACT for {0} is {1} ".format(customerName, primaryContact));
			}else{
				if(id)
					url = customerDetailPathName + 'CustNum='+ identifier;	
				else
					url = customerDetailPathName + 'Name="'+ encodeURIComponent(identifier)+'"';
				makeHTTPGETCall(session, url, getCustomerSuccess, getCustomerError, "PRIMARY_CONTACT");				
			}
		}else{
			if(customerId){
				session.send("The PRIMARY CONTACT for {0} is {1} ".format(customerName, primaryContact));								
			}else{
				builder.Prompts.text(session, "Which customer's primary contact would you require?");
			}
		}
	}, function (session, results) {	
        if (results.response) {
			var txt = results.response;
			var hasNum = hasNumber(txt);
			if(hasNum){
				var num = getNumber(txt);
				url = customerDetailPathName + 'CustNum='+ num;
			}else{				
				url = customerDetailPathName + 'Name="'+ encodeURIComponent(results.response)+'"';
			}
            
			makeHTTPGETCall(session, url, getCustomerSuccess, getCustomerError,  "PRIMARY_CONTACT");	
        }
    }
]);	

dialog.on('GetSalesRep',
[ 
	function(session, args){
		printUserData(session.userData);
		var customerId = session.userData.CUSTOMER_ID;
		var salesRep = session.userData.SALES_REP;
		var customerName = session.userData.CUSTOMER_NAME;
		
		var entities = args.entities;
		var id;		
		var identifier;
		
		var ids = getIdentifierForCustomer(entities);
		if(ids){
			identifier = ids.identifier;
			id = ids.id;
		}
		
		// if identifier exists, check in the session for equivalence. If matches, return else make a HTTP call
		// If identifier doesn't exist, check in session for existence, if found return else prompt and make a call
		
		if(identifier){
			if(identifier == customerId || identifier == customerName){				
				session.send("The SALES REPRESENTATIVE {1} ".format(customerName, salesRep));
			}else{
				if(id)
					url = customerDetailPathName + 'CustNum='+ identifier;	
				else
					url = customerDetailPathName + 'Name="'+ encodeURIComponent(identifier)+'"';
				makeHTTPGETCall(session, url, getCustomerSuccess, getCustomerError, "SALES_REP");				
			}
		}else{
			if(customerId){
				session.send("The SALES REPRESENTATIVE for {0} is {1} ".format(customerName, salesRep));								
			}else{
				builder.Prompts.text(session, "Which customer's sales rep would you require?");
			}
		}
	}, function (session, results) {	
        if (results.response) {
			var txt = results.response;
			var hasNum = hasNumber(txt);
			if(hasNum){
				var num = getNumber(txt);
				url = customerDetailPathName + 'CustNum='+ num;
			}else{				
				url = customerDetailPathName + 'Name="'+ encodeURIComponent(results.response)+'"';
			}
            
			makeHTTPGETCall(session, url, getCustomerSuccess, getCustomerError,  "SALES_REP");	
        }
    }
]);	

dialog.on('GetCreditLimit',
[ 
	function(session, args){
		printUserData(session.userData);
		var customerId = session.userData.CUSTOMER_ID;
		var creditLimit = session.userData.CREDIT_LIMIT;
		var customerName = session.userData.CUSTOMER_NAME;
		
		var entities = args.entities;
		var id;		
		var identifier;
		
		var ids = getIdentifierForCustomer(entities);
		if(ids){
			identifier = ids.identifier;
			id = ids.id;
		}
		
		// if identifier exists, check in the session for equivalence. If matches, return else make a HTTP call
		// If identifier doesn't exist, check in session for existence, if found return else prompt and make a call
		
		if(identifier){
			if(identifier == customerId || identifier == customerName){				
				session.send("The CREDIT LIMIT for {0} is {1} ".format(customerName, creditLimit));
			}else{
				if(id)
					url = customerDetailPathName + 'CustNum='+ identifier;	
				else
					url = customerDetailPathName + 'Name="'+ encodeURIComponent(identifier)+'"';
				makeHTTPGETCall(session, url, getCustomerSuccess, getCustomerError, "CREDIT_LIMIT");				
			}
		}else{
			if(customerId){
				session.send("The CREDIT LIMIT for {0} is {1} ".format(customerName, creditLimit));								
			}else{
				builder.Prompts.text(session, "Which customer's credit limit would you require?");
			}
		}
	}, function (session, results) {	
        if (results.response) {
			var txt = results.response;
			var hasNum = hasNumber(txt);
			if(hasNum){
				var num = getNumber(txt);
				url = customerDetailPathName + 'CustNum='+ num;
			}else{				
				url = customerDetailPathName + 'Name="'+ encodeURIComponent(results.response)+'"';
			}
            
			makeHTTPGETCall(session, url, getCustomerSuccess, getCustomerError,  "CREDIT_LIMIT");	
        }
    }
]);	

dialog.on('GetBalance', 
[ 
	function(session, args){
		printUserData(session.userData);
		var customerId = session.userData.CUSTOMER_ID;
		var balance = session.userData.BALANCE;
		var customerName = session.userData.CUSTOMER_NAME;
		
		var entities = args.entities;
		var id;		
		var identifier;
		
		var ids = getIdentifierForCustomer(entities);
		if(ids){
			identifier = ids.identifier;
			id = ids.id;
		}
		
		// if identifier exists, check in the session for equivalence. If matches, return else make a HTTP call
		// If identifier doesn't exist, check in session for existence, if found return else prompt and make a call
		
		if(identifier){
			if(identifier == customerId || identifier == customerName){				
				session.send("The BALANCE for {0} is {1} ".format(customerName, balance));
			}else{
				if(id)
					url = customerDetailPathName + 'CustNum='+ identifier;	
				else
					url = customerDetailPathName + 'Name="'+ encodeURIComponent(identifier)+'"';
				makeHTTPGETCall(session, url, getCustomerSuccess, getCustomerError, "BALANCE");				
			}
		}else{
			if(customerId){
				session.send("The BALANCE for {0} is {1} ".format(customerName, balance));								
			}else{
				builder.Prompts.text(session, "Which customer's balance would you require?");
			}
		}
	}, function (session, results) {	
        if (results.response) {
			var txt = results.response;
			var hasNum = hasNumber(txt);
			if(hasNum){
				var num = getNumber(txt);
				url = customerDetailPathName + 'CustNum='+ num;
			}else{				
				url = customerDetailPathName + 'Name="'+ encodeURIComponent(results.response)+'"';
			}
            
			makeHTTPGETCall(session, url, getCustomerSuccess, getCustomerError,  "BALANCE");	
        }
    }
]);	
	
dialog.on('CustomerDetail', function(session, args){
	session.userData.INTENT = 'CustomerDetail';
	//console.log(" DIALOG DATA "+JSON.stringify(session.dialogData));
	var entities = args.entities;
	var identifier;
	var url;
	
	if(entities.length > 0){
		identifier = entities[0].entity;
		var type = entities[0].type;
		if(type == 'Identity::ID'){
			url = customerDetailPathName + 'CustNum='+ identifier;
			
		}else{
			url = customerDetailPathName + 'Name="'+ encodeURIComponent(identifier)+'"';
		}		
	}
	//console.log('Intent CustomerDetail : URL '+url );
	
	var options = {
		hostname: hostName,
		port: portName,
		path: url,
		method: 'GET'
	};
	
	var req = http.request(options, (res) => {
		var responseBody ='' ;
		//console.log('STATUS: ' + res.statusCode);
		//console.log('HEADERS: ' + JSON.stringify(res.headers));
		res.setEncoding('utf8');
		res.on('data', (chunk) => {
			//console.log('BODY: '+ chunk);
			responseBody = responseBody.concat(chunk);
		});
		
		res.on('end', () => {
			//console.log("Entered");
			var customers = JSON.parse(responseBody);
			var response = customers.dsCustomer.ttCustomer[0];
			var respString = customerDetailTemplate.replace("{CustNum}",response.CustNum);
			respString = respString.replace("{Name}",response.Name);
			respString = respString.replace("{Contact}",response.Contact);
			respString = respString.replace("{SalesRep}",response.SalesRep);
			respString = respString.replace("{CreditLimit}",response.CreditLimit);
			respString = respString.replace("{Balance}",response.Balance);
			respString = respString.replace("{Terms}",response.Terms);		
			//console.log(respString );
			session.userData.CUSTOMER_ID = response.CustNum;
			session.userData.CUSTOMER_NAME = response.Name;
			//var newSession = session;			
			
			//var s = JSON.stringify(session.userData); 
			
			//console.log('============================'+s+'==================================');
			session.send(respString);
		});
	});

	req.on('error', (e) => {
	  console.log('problem with request: ' + e.message);
	});
	
	req.end();
	
});

dialog.on('OrderDetail', function(session, args){	
	//console.log(" DIALOG DATA "+JSON.stringify(session.dialogData));
	var s = JSON.stringify(session.userData); 
	//console.log('============================'+s+'==================================');
	session.userData.INTENT = 'OrderDetail';
	var entities = args.entities;
	var identifier;
	var url;
	
	if(entities.length > 0){
		identifier = entities[0].entity;
		var type = entities[0].type;
		if(type == 'Identity::ID'){
			url = orderDetailPathName + 'CustNum='+ identifier;			
		}		
	}	
	
	if(identifier == undefined || url == undefined){
		identifier = session.userData.CUSTOMER_ID;
		url = orderDetailPathName + 'CustNum='+ identifier;		
	}	
	
	var options = {
		hostname: hostName,
		port: portName,
		path: url,
		method: 'GET'
	};
	
	var req = http.request(options, (res) => {
		var responseBody ='' ;
		
		res.setEncoding('utf8');
		res.on('data', (chunk) => {			
			responseBody = responseBody.concat(chunk);
		});
		
		res.on('end', () => {
			
			var ordersJSON = JSON.parse(responseBody);
			var responseArray = ordersJSON.dsOrder.ttOrder;
			var response;
			if(responseArray.length == 1)
				response = responseArray[0];
			else{
				responseArray.sort(function(a,b){
					return new Date(a.OrderDate) - new Date(b.OrderDate);
				});
			}
			response = responseArray[0];
			
			var respString = orderDetailTemplate.replace("{Ordernum}",response.Ordernum);
			respString = respString.replace("{CustNum}",response.CustNum);
			respString = respString.replace("{OrderDate}",response.OrderDate);
			respString = respString.replace("{PromiseDate}",response.PromiseDate);
			respString = respString.replace("{OrderStatus}",response.OrderStatus);			
			
			session.userData.ORDER_ID = response.Ordernum;
			session.userData.ORDER_DATE = response.OrderDate;
			session.userData.ORDER_STATUS = response.OrderStatus;
			session.userData.ORDER_PROMISE_DATE = response.PromiseDate;
			
			session.send(respString);
		});
	});

	req.on('error', (e) => {
	  console.log('problem with request: ' + e.message);
	});
	
	req.end();
});

dialog.on('UpdateAddress', 
[
    function (session, args) {
		//console.log(" DIALOG DATA "+JSON.stringify(session.dialogData));
        session.userData.INTENT = 'UpdateAddress';
		var entities = args.entities;
		var identifier;
		var newAddress;
		var url;
		
		if(entities.length > 0){
			
			for(var i = 0 ; i < entities.length; i++){
				var e1 = entities[i].entity;
				if(e1.type == "Address"){
					newAddress = e1.entity;
				}else if(e1.type == "Identity::ID"){
					identifier = e1.entity;
				}
			}
		}	
		if(identifier == undefined){
			identifier = session.userData.ORDER_ID;
		}else{
			session.userData.ORDER_ID = identifier;
		}
		
		if(newAddress == undefined)	{
			builder.Prompts.text(session, "What is the new address you want me to update to?");
		}
    },    
    function (session, results) {
		//console.log(" DIALOG DATA "+JSON.stringify(session.dialogData));
        if (results.response) {
            session.userData.newAddress = results.response;
        }
		var respString = addressUpdateTemplate.replace("{Ordernum}",session.userData.ORDER_ID);
		respString = respString.replace("{newShippingAddress}",session.userData.newAddress);			
        session.send(respString);
    }
]
);

dialog.onDefault(function(session){
	session.send("I am sorry! Perhaps my responses are limited. Currently, I can answer : \n 1.	Customer's Phone Number. \n 1.	Customer's Primary Contact. \n 1.	Customer's Credit Limit. \n 1.	Customer's Balance \n 1.	Customer's Sales Representative");	
});

function makeHTTPGETCall(session, pathName, successFn, errorFn, information){
	console.log(new Date()+ " REST Call for "+information + " to "+ pathName);
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
				successFn(session, objects, information);
				//console.log(responseBody);				
			});
		}
	});

	req.on('error', errorFn);	
	req.end();	
}

function getCustomerSuccess(session, resp, information){
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
		var text ;
		switch(information){
			case "CUSTOMER_ID" : text = session.userData.CUSTOMER_ID; break;
			case "CUSTOMER_NAME" : text = session.userData.CUSTOMER_NAME; break;
			case "PHONE_NUMBER" : text = session.userData.PHONE_NUMBER; break;
			case "BALANCE" : text = session.userData.BALANCE; break;
			case "SALES_REP" : text = session.userData.SALES_REP; break;
			case "CREDIT_LIMIT" : text = session.userData.CREDIT_LIMIT; break;
			case "PRIMARY_CONTACT" : text = session.userData.CONTACT; break;
		}
		session.send("The {0} for customer {1} is {2}".format(information.replace("_", " "), response.Name, text ));
	}
}

function getCustomerError(err){
	console.log("Error in HTTP call");
}

function getIdentifierForCustomer(entities){
	if(entities.length <= 0)
		return;
	
	for(var i = 0 ; i < entities.length; i++){
		if(entities[i].type == 'Identity::ID'){
			identifier = entities[0].entity;
			id = true;
			break;
		}else if(entities[i].type == 'Identity::Name'){
			identifier = entities[0].entity;
			id = false;
			break;
		}
	}	
	return {"identifier":identifier, "id":id};
}

function hasNumber(myString) {
  return (/\d/.test(myString));
}

function getNumber(myString){
	return myString.replace( /^\D+/g, '');
}

function printUserData(userData){
	if(userData){
		console.log("\n");
		console.log("TIME : {0} | CUSTOMER ID : {1} | CUSTOMER NAME : {2} | PHONE NUMBER : {3} | SALES REP : {4} | CREDIT LIMIT : {5} | BALANCE : {6} | CONTACT : {7} ".format(new Date(), userData.CUSTOMER_ID, userData.CUSTOMER_NAME, userData.PHONE_NUMBER, userData.SALES_REP, userData.CREDIT_LIMIT, userData.BALANCE, userData.CONTACT));		
	}
}


// Setup Restify Server
var server = restify.createServer();
server.post('/api/messages', bot.verifyBotFramework(),  bot.listen());
server.listen(process.env.port || 8080, function () {
   console.log('%s listening to %s', server.name, server.url); 
});