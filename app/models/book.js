// load the things we need
var mongoose = require('mongoose');

// define the schema for our book model
var bookSchema = mongoose.Schema({
    title           : String,
    author          : String,
    category        : String,
    purpose         : String,
    description     : String,
    contactName     : String,
    phone           : String,
    city            : String,
    created         : Date,
    status          : String,
    image1          : String
});


// create the model for users and expose it to our app
module.exports = mongoose.model('Book', bookSchema);
