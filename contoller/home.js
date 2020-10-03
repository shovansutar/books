var Book = require('../app/models/book');

module.exports = {
    index: function(req, res){
        
        var viewModel = {
            books: [],
            user: req.user
        };

        Book.find({}, {}, {sort: {created: -1}, limit:10 }, function(err, books){
            if(err) { throw err; }
            viewModel.books = books;
            console.log('No of books: ' + books.length);
            res.render('home', viewModel)
        });
    },
    search: function(req, res){        
        var viewModel = {
            books: [],
            user: req.user
        };
        console.log('searching: ' + req.body.searchText);
        var pattern = '/' + req.body.searchText + '/i';
        Book.find({ title: {$regex: req.body.searchText, $options: 'i'} } , {}, {sort: {created: -1}, limit:10 }, function(err, books){
            if(err) { throw err; }
            viewModel.books = books;
            console.log('No of books: ' + books.length);
            res.render('home', viewModel)
        });
    }
};