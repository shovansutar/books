var Category = require('../app/models/category');
var path = require('path');
var fs = require('fs');
var Book = require('../app/models/book');

module.exports = {
    index: function(req, res){
        
        var viewModel = {
            categories: []
        };
        var bookId = req.params.book_id;
        console.log('Book ID: ' + bookId);
        Category.find({}, function(err, cats){
            if(err) { throw err; }
            viewModel.categories = cats;
            console.log('No of cats: ' + cats.length);
            if(bookId){
                Book.findById(bookId, function(err, cbook){
                    if(err) { throw err; }
                    viewModel.currBook = cbook;
                    console.log('Found Book: ' + viewModel.currBook.title);
                    res.render('editbook', viewModel);
                })
            } else {
                res.render('editbook', viewModel)
            }
        });
    },
    save: function(req, res){
        var viewModel = {
            categories: []
        };

        console.log('editbook -> save');
        // create new book
        var newbook = new Book(req.body);
        newbook.created = new Date();
        if(req.file){
            console.log('File: ' + req.file.path);
            console.log('title: ' + req.body.title);
            
            var tempPath = req.file.path,
                ext = path.extname(req.file.originalname).toLowerCase(),
                targetPath = tempPath + ext;
            var url = 'public/upload/' + req.file.filename + ext;
            console.log('url:' + url); 
            if (ext === '.png' || ext === '.jpg' || ext === '.jpeg' || ext === '.gif') {
                fs.rename(tempPath, targetPath, function (err) {
                    if (err) throw err;
                    // Update image url
                    newbook.image1 = url;
                    newbook.save(function(err, comment){
                        if (err) { throw err; }
                        console.log('Saved book details');
                        res.redirect('home');
                    });                 
                })
            } else {
                fs.unlink(tempPath, function (err) {
                    if (err) throw err;
                    res.status(500).json('Only image files are allowed: png/jpg/jpeg/gif.');
                });
            }
        } else {
            console.log('saving book without image');
            newbook.save(function(err, comment){
                if (err) { throw err; }
                console.log('Saved book details');
                res.redirect('home');
            });   
        }

        // res.render('editbook', viewModel);
    }
};