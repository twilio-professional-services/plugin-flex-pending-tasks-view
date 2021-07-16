const JWEValidator = require('twilio-flex-token-validator').functionValidator;

exports.handler = JWEValidator(async function (context, event, callback) {
	// set up twilio client
	const client = context.getTwilioClient();

	// setup a response object
	const response = new Twilio.Response();
	response.appendHeader('Access-Control-Allow-Origin', '*');
	response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS, POST');
	response.appendHeader(
		'Access-Control-Allow-Headers',
		'Content-Type, Authorization, Content-Length, X-Requested-With, User-Agent'
	);

	// parse data form the incoming http request
	const originalTaskSid = event.taskSid;
	const workerSid = event.workerSid;
	try {
		// retrieve attributes of the original task
		let originalTask = await client.taskrouter
			.workspaces(context.TWILIO_WORKSPACE_SID)
			.tasks(originalTaskSid)
			.fetch();
		let newAttributes = JSON.parse(originalTask.attributes);

		//Set attributes for routing to specific worker in "Manual" task queue
		newAttributes.manual = 1;
		newAttributes.worker_sid = workerSid;

		// update task 
		await client.taskrouter
			.workspaces(context.TWILIO_WORKSPACE_SID)
			.tasks(originalTaskSid)
			.update({
				attributes: JSON.stringify(newAttributes),
			});

		response.setBody({
			taskSid: originalTaskSid,
		});
		response.appendHeader('Content-Type', 'application/json');
		callback(null, response);
	}
	catch (err) {
		response.appendHeader('Content-Type', 'plain/text');
		response.setBody(err.message);
		console.log(err.message);
		response.setStatusCode(500);
		// If there's an error, send an error response
		// Keep using the response object for CORS purposes
		callback(null, response);

	}

});
