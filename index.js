 // require modules and libraries
var http = require('http');
var express = require('express');
var fortune = require('./lib/fortune.js');
var formidable = require('formidable');
var credentials = require('./credentials.js');
var session = require('express-session');
var fs = require('fs');
var routesHandler = require('./route.js');

// // Initialise the Express app
 var app = express();

routesHandler(app);

// set up handlebars view engine
var handlebars = require('express-handlebars').create({
	defaultLayout: 'main',
	helpers: {
		section: function(name, options) {
			if(!this._section) this._section = {};
			this._section[name] = options.fn(this);
			return null;
		}
	}
});

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
// create PORT
 app.set('port', process.env.PORT || 3030);

// import static files from public
app.use(express.static(__dirname + '/public'));


// include cookie-parser and express-sessions
//app.use(require('cookie-parser')(credentials.cookieSecret));
app.use(session({
	secret: credentials.cookieSecret,
	resave: false,
	saveUninitialized: true,
	cookie: {secure: false}
}));

// create middleware for accessin production or testing 
app.use(function(req,res,next) {
	res.locals.showTests = app.get('env') !== 'production' && req.query.test === '1';
	next();
});


// Functions
/*
var getWeatherData = (function(){
	// our weather cache
	var c = {

	}
})*/
function getWeatherData() {

	return {
		// hard-coded data 
		locations: [
		    {
		    	name: 'Portland',
		    	forecastUrl: 'http://www.wunderground.com/US/OR/Portland.html',
		    	iconUrl: 'http://icons-ak.wxug.com/i/c/k/cloudy.gif',
		    	weather: 'Overcast',
		    	temp: '54.1 F (12.3 C)',
		    },
		    {
				name: 'Bend',
				forecastUrl: 'http://www.wunderground.com/US/OR/Bend.html',
				iconUrl: 'http://icons-ak.wxug.com/i/c/k/partlycloudy.gif',
				weather: 'Partly Cloudy',
				temp: '55.0 F (12.8 C)',
			},
			{
				name: 'Manzanita',
				forecastUrl: 'http://www.wunderground.com/US/OR/Manzanita.html',
				iconUrl: 'http://icons-ak.wxug.com/i/c/k/rain.gif',
				weather: 'Light Rain',
				temp: '55.0 F (12.8 C)',
			},
		],
	};
}
// Middleware for the Meadowlark pages
app.use(function(req,res,next) {
	if(!res.locals.partials) res.locals.partials = {};
	res.locals.partials.weatherData = getWeatherData();
	next();
});


// cookie-session routes
app.use(function(req, res, next) {
	// if there is a flash message, transfer it to the context, then clear it
	res.locals.flash = req.session.flash;
	delete req.session.flash;
	next()
});

// ROUTE ERROR HANDLING
// custom 404 page 
app.use(function(req, res) {
	res.status(404);
	res.render('404');
});

// custom 500 page
app.use(function(err, req, res, next) {
	console.error(err.stack);
	res.status(500);
	res.render('500');
});



// server 
http.createServer(app).listen(app.get('port'), function() {
	console.log('Express started in ' + app.get('env') + ' mode on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});