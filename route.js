var fortune = require('./lib/fortune.js');
var bodyParser = require('body-parser');
var fs = require('fs');
// Create the body parser
var urlencodedParser = bodyParser.urlencoded({ extended: false})

module.exports = function(app) {
	// ROUTES
	

	/*app.post('/process', function(req, res) {
		if(req.xhr || req.accepts('json, html') === 'json') {
			// if there were an error, we woulf send {error: 'error description'}
			res.send({success: true});
		} else {
			// if there were an error, we would redirect to an error page
			res.redirect(303, '/thank-you');
		}
	});
	*/
	// routes to the Home and About views
	app.get('/',  function(req, res) {
		res.render('home');
	});

	app.get('/about', function(req, res){
		res.render('about', {fortune: fortune.getFortune(), pageTestScript: '/qa/tests-about.js'});
	});

	app.get('/thank-you', function(req, res) {
		res.send('<h1>thank-you!</h1>');
	});
	// Routes to the newsletter page
	app.get('/newsletter', urlencodedParser, function(req, res) {
		// provide a dummy value
		res.render('newsletter', {csrf: 'CSRF token goes here'});
	});

	

	// this has not yet worked, debug and make it work 
	app.post('/newsletter', urlencodedParser, function(req,res) {
		var name = req.body.fieldName || '';
		var email = req.body.email || '';
		console.log(name)
		// input validation
		if (!email) {
			if(req.xhr) return res.json({ error: 'Invalid name email address.'});
			req.session.flash = {
				type: 'danger',
				intro: 'Validation error',
				message: 'The email address you entered was not valid.',
			};
			return res.redirect(303, '/newsletter/archive');
		}

		new NewsletterSignup({name: name, email: email}).save(function(err) {
			if(err) {
				if(req.xhr) return res.json({error: 'Database error.'});
				req.session.flash = {
					type: 'danger',
					intro: 'Database error',
					message: 'There was a database error; please try again later.',
				}
				return res.redirect(303, '/newsletter/archive');
			}
			if (req.xhr) return res.json({ success: true});
			req.session.flash = {
				type: 'success',
				intro: 'Thank you',
				message: 'You have now been signed up for the newsletter.',
			};
			return res.redirect(303, '/newsletter/archive');
		});
	});
// middleware for the newsletter.handlebars view
	app.post('/process', urlencodedParser, function(req, res) {
		console.log('Form (from querystring): ' + req.query.form);
		console.log('CSRF token (fron hidden from field): ' + req.body._csrf);
		console.log('Name (from visible form field): ' + req.body.name);
		console.log('Email (from visible from field): ' + req.body.email);
		res.redirect(303, '/thank-you');
	});


	// FILE UPLOAD AND DATA PERSISTENCE

	// Make sure data directory exists
	var dataDir = __dirname + '/data';
	var vacationPhotoDir = dataDir + '/vacation-photo';
	fs.existsSync(dataDir) || fs.mkdirSync(dataDir);
	fs.existsSync(vacationPhotoDir) || fs.mkdirSync(vacationPhotoDir);

	function saveContestEntry(contestName, email, year, month, photoPath) {
		// Will be right back to sort you out.
	}

	// file upload route 
	app.get('/contest/vacation-photo', function(req, res) {
		var now = new Date();
		res.render('contest/vacation-photo', {
			year: now.getFullYear(), month: now.getMonth()
		});
	});
	// route to post upload file to a local fs db on the local dir and redirect
	app.post('/contest/vacation-photo/:year/:month', function(req, res) {
		var form = new formidable.IncomingForm();
		form.parse(req, function(err, fields, files) {
			if (err) return res.redirect(303, '/error');
			if (err) {
				res.session.flash = {
					type: 'danger',
					intro: 'Oops!',
					message: 'There was an error processing your submission. ' + 'Please try again.',
				};
				return res.redirect(303, '/contes/vacation-photo')
			}
			// save the photo uploaded to the path created 
			var photo = files.photo;
			var dir = vacationPhotoDir + '/' + Date.now();
			var path = dir + '/' + photo.name;
			fs.mkdirSync(dir);
			fs.renameSync(photo.path, dir + '/' + photo.name);
			saveContestEntry('vacation-photo', fields.email, req.params.year, req.params.month, path);
			req.session.flash = {
				type: 'success',
				intro: 'Good luck!',
				message: 'You have been entered into the contest.',
			};
			return res.redirect(303, '/contest/vacation-photo/entries');

			// The codes below were used to test if this route worked.

			// console.log('received fields: ');
			// console.log(fields);
			// console.log('received files: ');
			// console.log(files);
			//res.redirect(303, '/thank-you');
		});
	});

	// routes to out tour page
	app.get('/tour/hood-river', function() {
		res.render('tours/hood-river');
	});
	app.get('/tours/request-group-rate', function() {
		res.render('tours/request-group-rate');
	});
}