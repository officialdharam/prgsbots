var winston = require('winston');
var http = require('http');
var logger = new (winston.Logger)({
	transports: [    
		new (winston.transports.File) ({filename: 'C:/1_WORK/ATG/4_BOT/MSBF/logs/notificationBot.log'})
	]
});

exports.logger = logger;
exports.httpGET = function(session, host, path, port, successFn){
	logger.log('info', 'Request for host %s port %d and path %s ', host, port, path);
	var options = {
		hostname: host,
		port: port,
		path: path,
		method: 'GET'
	};
	
	var responseBody="";
	
	var req = http.request(options, (res) => {		
		if(res.statusCode == 200) {
			res.setEncoding('utf8');
			res.on('data', (chunk) => {				
				responseBody = responseBody.concat(chunk);
			});			
			
			res.on('end', () => {				
				logger.log('info', 'Received response for path %s. Response Body : %s', path, responseBody);
				var objects = JSON.parse(responseBody);				
				successFn(session, objects);				
			});
		}
	});

	req.on('error', function(e){
		logger.log('error', 'Error while making an http call %s.', e);
		httpError(session);
	});	
	req.end();	
}


function httpError(session){
	session.endDialog('Some error occurred, please try again later');	
}

if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined' ? args[number] : match;
    });
  };
}
