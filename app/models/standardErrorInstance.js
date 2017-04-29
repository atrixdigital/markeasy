/**
 * Created by Nir on 24/02/2017.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/*
    this object should represent an error instance, meaning it will be generated when the examiner
    stumbled upon a standard mistake made by the student, the latter will hold simple data such as:
    which is the parent standard error? what should be the proportional damage effect , who marked this error,
    when was it created and why ? we use this model to differentiate between to standard errors that can occur
    in different level of severity. submission check will be comprised of error instances!
*/

var ErrorInstanceSchema = new Schema( {
    standard_error_parent : { type : Schema.ObjectId, ref: 'StandardError' },
    error_effect: {type: Number,  min: 0, max: 100 , default: 100},
    marked_by: { type : String },
    description: { type : String },
    date_marked: { type: Date, default: Date.now }
});





ErrorInstanceSchema.methods.getErrorByName = function(error_name, callback){
    var query = {error_name: error_name};
    User.findOne(query, callback);
}


//now we need a variable that we can access outside of this file
module.exports = mongoose.model('ErrorInstance', ErrorInstanceSchema);