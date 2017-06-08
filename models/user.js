var mongoose = require('mongoose');  // require mongoose orm instance
var bcrypt = require('bcryptjs');

mongoose.connect('mongodb://localhost/nodeauth'); //assign db nodeauth to connect

var db = mongoose.connection; //and connect it

// user schema
var UserSchema = mongoose.Schema({
	username: {
		type: String,
		index: true
	},
	password: {
		type: String
	},
	email: {
		type: String
	},
	name: {
		type: String
	},
	profileimage: {
		type: String
	}
});

// create function User to create user
var User = module.exports = mongoose.model('User', UserSchema);

// new user creation with callback method - method exports cuz using outsite the file
module.exports.createUser = function(newUser, callback){
	bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(newUser.password, salt, function(err, hash) {
    	newUser.password = hash;
    	newUser.save(callback);
    	});
	});	
}

// get user by id function using in login
module.exports.getUserById = function(id, callback){
	User.findById(id, callback);
}

// get user by username function using in login
module.exports.getUserByUsername = function(username, callback){
	var query = {username: username};
	User.findOne(query, callback);
}

// compare password function using in login
module.exports.comparePassword = function(candidatePassword, hash, callback){
	bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
    	callback(null, isMatch);
	});
}

