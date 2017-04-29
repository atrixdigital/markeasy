var mongoose = require('mongoose');
var Schema = mongoose.Schema;
//this library will help us find duplications or violations of the db rules
var uniqueValidator = require('mongoose-unique-validator');
//this library will help us hash the password!
var bcrypt = require('bcrypt-nodejs');

//another validation mechanism for not too long user name etc
var validate = require('mongoose-validator');
var nameValidator = [
    validate({
        validator: 'isLength',
        arguments: [3, 30],
        message: 'Name should be between {ARGS[0]} and {ARGS[1]} characters'
    })
];
var usernameValidator = [
    validate({
        validator: 'isLength',
        arguments: [3, 30],
        message: 'username should be between {ARGS[0]} and {ARGS[1]} characters'
    }),
    validate({
        validator: 'isAlphanumeric',
        message: 'username must contain letters and numbers only'
    })
];

var emailValidator = [
    validate({
        validator: 'isEmail',
        message: 'IS NOT a valid email'
    }),
    validate({
        validator: 'isLength',
        arguments: [3, 25],
        message: 'Email should be between {ARGS[0]} and {ARGS[1]} characters'
    })
];



var UserSchema = new Schema( {
    username : {type: String , required : true, unique : true, validate: usernameValidator},
    password: {type: String, required: true},
    email: {type: String, required: true, lowercase: true, unique: true, validate: emailValidator},
    name: {type:String, validate: nameValidator},
    dateCreated: { type: Date, default: Date.now },
    memberships: {},
    relevant_assignments: [{ type : Schema.ObjectId, ref: 'Assignment' }], // with this the user will be connected to his assignments in the fastest way
    permission: {type: String, required:true, default: 'user'}
});

/*permission levels: admin moderator user.
when a user registers he gets a user permission and then can be promoted to moderator or admin
*/

UserSchema.plugin(uniqueValidator);

//connect to our database (when i store the database elsewhere it will get their address
// mongoose.connect('mongodb://localhost/loginapp');
// this is in comment because we already opened a connection in server.js !
// var db = mongoose.connection;


//now we will have all of our user functions here :

//before saving the schema just encrypt !
UserSchema.pre('save' , function (next) {
    var user = this;
    if (!user.isModified('password')) return next(); // If password was not changed or is new, ignore middleware
    bcrypt.hash(user.password, null, null, function(err,hash) {
        if(err) return next(err);
        user.password = hash;
        next();
    });
});

UserSchema.methods.getUserByUsername = function(username, callback){
    var query = {username: username};
    //we could have put it in the users.js instead of creating a special function here in the model
    //but we like to keep all the functions encapsulated in the model
    User.findOne(query, callback);
}

UserSchema.methods.getUserById = function(id, callback){
    console.log('user name is: ' + User.findById(id).username);
    User.findById(id,callback);
}
//
UserSchema.methods.comparePassword = function (password) {
    return bcrypt.compareSync(password, this.password);
}


//now we need a variable that we can access outside of this file

module.exports = mongoose.model('User', UserSchema);