var mongoose = require('mongoose');
var async = require('async');
var configDB = require('./config/database.js');

var Category       = require('./app/models/category');
function addCat(category, callback){
    //console.log('processing: ' + category.id);
    Category.findOne({ 'categoryId' :  category.id }, function(err, cat){
        if(!cat){
            //console.log('inerting:' + category.id);
            var newCat = new Category();
            newCat.categoryId = category.id;
            newCat.categoryName = category.name;
            newCat.save(function(err){
                if(err)
                    console.log(err);
                else
                    console.log('saved category: ' + category.name );
                callback();
            });
        } else {
            console.log('Skipped: ' + category.name);
            callback();
        }
    });    
};

var allCats = [
    {id:'100', name : 'Astrology'},
    {id:'101', name : 'Novel'},
    {id:'102', name : 'Cooking'},
    {id:'103', name : 'Kids'},
    {id:'104', name : 'Science'},
    {id:'105', name : 'Arts'}
];

mongoose.connect(configDB.url,{ useNewUrlParser: true });

Category.deleteMany({}, function(err){
    if(err != null){
        console.log(err);
    } else {
        async.each(allCats, addCat, function(err){
            console.log('done');
            process.exit();
        });         
    }
});


