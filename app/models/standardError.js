/**
 * Created by Nir on 05/02/2017.
 */
/**
 * Created by Nir on 23/01/2017.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/*
    this is the basic error model. it can be added even before checking of assignments.
    it represents an error that the examiners can capture during testing of students submissions.
    standard error is always connected to the assignment that created it.

*/

var ErrorSchema = new Schema( {
    error_name : {type: String , unique: true },
    description: { type : String },
    created_by: { type : String },
    parent_assignment: { type : Schema.ObjectId, ref: 'Assignment'},
    date_created: { type: Date, default: Date.now },
    grade_impact: {type: Number,  min: 0, max: 100 , default: 0},
    last_edited: { type: Date, default: Date.now },
});





ErrorSchema.methods.getErrorByName = function(error_name, callback){
    var query = {error_name: error_name};
    User.findOne(query, callback);
}


//now we need a variable that we can access outside of this file
module.exports = mongoose.model('StandardError', ErrorSchema);