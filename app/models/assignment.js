/**
 * Created by Nir on 23/01/2017.
 * defines the assignment schema aka the assignment object
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;





var AssignmentSchema = new Schema( {
    assignment_name : {type: String , required : true, unique : true},
    description: {type : String},
    created_by: { type : String },
    date_created: { type: Date, default: Date.now },
    due_date: {type: Date, default: Date.now},
    progress_percentage: {type: Number,  min: 0, max: 100 , default: 0},
    // last_edited: { type: Date, default: Date.now },
    examiners: [{ type : String }],
    standard_errors: [{ type : Schema.ObjectId, ref: 'StandardError' }], //this will reference to standard errors in the db
    //tested_users: [],
    //memberships: {},
    //submissions: {}, // array of students submissions
    // statistics: {type: Statistics},
    permission: {type: String, default: 'user'}
});


AssignmentSchema.pre('remove', function(next){
    this.model('User').update(
        {_id: {$in: this.users}},
        {$pull: {groups: this._id}},
        {multi: true},
        next
    );
});



AssignmentSchema.methods.getAssignmentByName = function(assignment_name, callback){
    var query = {assignment_name: assignment_name};
    User.findOne(query, callback);
}


//now we need a variable that we can access outside of this file

module.exports = mongoose.model('Assignment', AssignmentSchema);