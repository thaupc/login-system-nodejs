var express = require('express');
var router = express.Router();

var multer = require('multer'); // image upload
var upload = multer({dest: './uploads'});

//passport and login validation
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var User = require('../models/user');  //connect to User object which is used to access db

/* GET users listing. the route / in this case means /users */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

// the route will be /user/register
router.get('/register', function(req, res, next) {
  res.render('register', {title: 'Register'});
});

// post method for register function - which hold upload image ability also
router.post('/register', upload.single('profileimage'), function(req, res, next) {
	var name = req.body.name;
	var email = req.body.email;
	var username = req.body.username;
	var password = req.body.password;
	var password2 = req.body.password2;

	if(req.file){
		console.log('Image file uploaded...');
		var profileimage = req.file.filename;
	} else {
		console.log('No image file uploading');
		var profileimage = 'noimage.jpg';
	}

	// form validation with express-validator
	req.checkBody('name', 'Name is required').notEmpty();
	req.checkBody('email', 'Email is required').notEmpty();
	req.checkBody('email', 'Email is not valid').isEmail();
	req.checkBody('username', 'Username is required').notEmpty();
	req.checkBody('password', 'Password is required').notEmpty();
	req.checkBody('password2', 'Password is not match').equals(req.body.password);

	// check errors from form validation
	// if there is no error, process to connect db and register new user
	var errors = req.validationErrors();
	if(errors){
		res.render('register', {
			errors: errors
		});
	} else {
		var newUser = new User({	//new instance of User to access db
			name: name,	// assign name field in db = variable name which declared above (req.body.name)
			email: email, // same
			username: username,
			password: password,
			profileimage: profileimage
		});
		User.createUser(newUser, function(err, user){  //call back function to create user just like in model
			if(err) throw err;
			console.log(user);
		});

		// show success message # NEED TO INCLUDE INTO LAYOUT.JADE TOO
		req.flash('success', 'You are now registered. Use login info to enter the system');

		res.location('/');
		res.redirect('/'); //redirect back to /
	}

});

// the route will be /user/login
router.get('/login', function(req, res, next) {
  res.render('login', {title: 'Login'});
});

router.post('/login',
  passport.authenticate('local', {failureRedirect:'/users/login', failureFlash: 'Invalid username or password'}),
  function(req, res) {
  	req.flash('success', 'You are now logged in');
  	res.redirect('/');
 });

//serialize user
passport.serializeUser(function(user, done) {
  done(null, user.id);
});
//deserialize user
passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});


// passport will create a local strategy
passport.use(new LocalStrategy(function(username, password, done){
	// get user by username
	User.getUserByUsername(username, function(err, user){
		if(err) throw err;  // if there is error, show error
		if(!user){
			return done(null, false, {message: 'Unknown User'}); // if there is no user match
		}

		//if there is user, then call comparePassword function
		User.comparePassword(password, user.password, function(err, isMatch){
			if(err) return done(err); // show password if there is
			if(isMatch){
				return done(null, user); // password matching, pass along user
			} else {
				return done(null, false, {message: 'Invalid Password'}); // show error if password no matching
			}
		});
	});
}));


// logout function
router.get('/logout', function(req, res, next) {
  req.logout();
  req.flash('success', 'You are now logged out');

  res.redirect('/users/login');
});

module.exports = router;
