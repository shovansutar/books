var mongoose = require('mongoose');

// define the schema for our book model
var requestSchema = mongoose.Schema({
    bookName            : String,
    bookId              : String,
    ownerId             : String,
    requesterId         : String,
    created             : Date,
    approved            : Date,
    delivered           : Date,
    status              : String, // 
    ownerContact        : String,
    requesterContact    : String,
    message             : String
});


// create the model for users and expose it to our app
module.exports = mongoose.model('Request', requestSchema);