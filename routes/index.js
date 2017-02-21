
/*
 * routes/index.js
 *
 * Routes contains the functions (callbacks) associated with request urls.
 */

// our db model
var Information = require("../models/model.js");

/**
 * GET '/'
 * Default home route. Just relays a success message back.
 * @param  {Object} req
 * @return {Object} json
 */

exports.index = function(req, res) {

	console.log("main route requested");

	var data = {
		status: 'OK',
		message: 'Welcome to the Web 1 - UNICEN v1 API'
	}

	// respond back with the data
	res.json(data);

}

/**
 * POST '/api/thing'
 * Receives a POST request of the new thing and group, saves to db, responds back
 * @param  {Object} req. An object containing the different attributes of the Person
 * @return {Object} JSON
 */

exports.create = function(req,res){

	console.log(req.body);

	// pull out the name and location
	var name = req.body.group;
	var thing = req.body.thing;

	if (name == null || thing == null){
		var jsonData = {status:'ERROR', message: 'You must send information to save.'};
		return res.status(400).json(jsonData)
	}

	var information = Information({
		group: name,
		thing: thing
	});

	// now, save that person to the database
	// mongoose method, see http://mongoosejs.com/docs/api.html#model_Model-save
	information.save(function(err,data){
		// if err saving, respond back with error
		if (err){
			var jsonData = {status:'ERROR', message: 'Error saving information'};
			return res.json(jsonData);
		}

		console.log('saved a new information!');
		console.log(data);

		// now return the json data of the new person
		var jsonData = {
			status: 'OK',
			information: data
		}

		return res.json(jsonData);

	});

}

/**
 * GET '/api/thing/:id'
 * Receives a GET request specifying the thing to get
 * @param  {String} req.param('id'). The userId
 * @return {Object} JSON
 */
exports.getOne = function(req,res){

	var requestedId = req.param('id');

	// mongoose method, see http://mongoosejs.com/docs/api.html#model_Model.findById
	Information.findById(requestedId, function(err,data){

		// if err or no user found, respond with error
		if(err || data == null){
  		var jsonData = {status:'ERROR', message: 'Could not find that information'};
  		 return res.json(jsonData);
  	}

  	// otherwise respond with JSON data of the user
  	var jsonData = {
  		status: 'OK',
  		information: data
  	}

  	return res.json(jsonData);

	})
}

/**
 * GET '/api/thing/group/:id'
 * Receives a GET request specifying the group to get all the thing for that group.
 * @param  {String} req.param('id'). The userId
 * @return {Object} JSON
 */
exports.getByGroup = function(req,res){

	var requestedGroup = req.param('group');

	// mongoose method, see http://mongoosejs.com/docs/api.html#model_Model.findById
	Information.find({ group: requestedGroup }, function(err,data){

		// if err or no user found, respond with error
		if(err || data == null){
  		var jsonData = {status:'ERROR', message: 'Could not find that group'};
  		 return res.json(jsonData);
  	}

  	// otherwise respond with JSON data of the user
  	var jsonData = {
  		status: 'OK',
  		information: data
  	}

  	return res.json(jsonData);

	})


}

/**
 * GET '/api/thing'
 * Receives a GET request to get all the things.
 * @return {Object} JSON
 */

exports.getAll = function(req,res){

	// mongoose method, see http://mongoosejs.com/docs/api.html#model_Model.find
	Information.find(function(err, data){
		// if err or no users found, respond with error
		if(err || data == null){
  		var jsonData = {status:'ERROR', message: 'Could not find information'};
  		return res.json(jsonData);
  	}

  	// otherwise, respond with the data

  	var jsonData = {
  		status: 'OK',
  		information: data
  	}

  	res.json(jsonData);

	})

}

/**
 * PUT '/api/:id'
 * Receives a PUT request with data of the thing to update, updates db, responds back
 * @param  {String} req.param('id'). The userId to update
 * @param  {Object} req. An object containing the different attributes of the Person
 * @return {Object} JSON
 */

exports.update = function(req,res){

	var requestedId = req.param('id');

	// pull out the name and location
	var name = req.body.name;
	var location = req.body.location;

	//now, geocode that location
	geocoder.geocode(location, function ( err, data ) {

		console.log(data);

  	// if we get an error, or don't have any results, respond back with error
  	if (err || data.status == 'ZERO_RESULTS'){
  		var jsonData = {status:'ERROR', message: 'Error finding location'};
  		res.json(jsonData);
  	}

  	// otherwise, update the user

	  var locationName = data.results[0].formatted_address; // the location name
	  var lon = data.results[0].geometry.location.lng;
		var lat = data.results[0].geometry.location.lat;

  	// need to put the geo co-ordinates in a lng-lat array for saving
  	var lnglat_array = [lon,lat];

	  var dataToUpdate = {
	  	name: name,
	  	locationName: locationName,
	  	locationGeo: lnglat_array
	  };

	  // now, update that person
		// mongoose method, see http://mongoosejs.com/docs/api.html#model_Model.findByIdAndUpdate
	  Person.findByIdAndUpdate(requestedId, dataToUpdate, function(err,data){
	  	// if err saving, respond back with error
	  	if (err){
	  		var jsonData = {status:'ERROR', message: 'Error updating person'};
	  		return res.json(jsonData);
	  	}

	  	console.log('updated the person!');
	  	console.log(data);

	  	// now return the json data of the new person
	  	var jsonData = {
	  		status: 'OK',
	  		person: data
	  	}

	  	return res.json(jsonData);

	  })

	});

}

/**
 * Delete '/api/thing/:id'
 * Receives a DELETE request specifying the thing to delete
 * @param  {String} req.param('id'). The userId
 * @return {Object} JSON
 */

exports.remove = function(req,res){

	var requestedId = req.param('id');

	// Mongoose method, http://mongoosejs.com/docs/api.html#model_Model.findByIdAndRemove
	Information.findByIdAndRemove(requestedId,function(err, data){
		if(err || data == null){
  		var jsonData = {status:'ERROR', message: 'Could not find that information to delete'};
  		return res.json(jsonData);
		}

		// otherwise, respond back with success
		var jsonData = {
			status: 'OK',
			message: 'Successfully deleted id ' + requestedId
		}

		res.json(jsonData);

	})

}


/**
 * GET '/api/html'
 * Receives a GET request to retrive a piece of HTML
 * @return {Object} HTML
 */

exports.getHTML = function(req,res){

  	res.send("<h1>PARTIAL RENDER</h1><p>Este texto fue cargado con partiarl render usando AJAX!!!</p><button type=\"button\" class=\"btn btn-default js-comportamiento\">Boton</button>");

}
