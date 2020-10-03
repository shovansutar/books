// load the things we need
var mongoose = require('mongoose');

// define the schema for our category model
var categorySchema = mongoose.Schema({
    categoryId      : String,
    categoryName    : String
});


// create the model for users and expose it to our app
module.exports = mongoose.model('Category', categorySchema);
