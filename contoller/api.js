// REST API code
var Book = require('../app/models/book');
var Category = require('../app/models/category');
var fs = require('fs');
var path = require('path');

module.exports = {
    index: function(req, res){
        res.json("{api: 'hello'}");
    },
    category: function(req, res){
        Category.find({}, function(err, cats){
            if(err) { 
                console.log("Categories not found");
                res.json({msg: 'categories not found'});
            } else {
                res.json(cats);    
            }
        });
    },
    bookAll: function(req, res){        
        Book.find({}, {}, {sort: {created: -1}, limit:10 }, function(err, books){
            if(err) { 
                console.log("Book not found: " + bookId);
                res.json({msg: 'book not found'});
            } else {
                console.log('No of books: ' + books.length);
                res.json(books);    
            }
        });
    },
    bookOne: function(req, res){        
        var bookId = req.params.book_id;
        if(bookId){
            Book.findById(bookId, function(err, cbook){
                if(err) { 
                    console.log("Book not found: " + bookId);
                    res.json({msg: 'book not found'});
                    // throw err; 
                } else {
                    res.json(cbook);
                }
            })
        }
    },
    addBook: function(req, res){        
        var newbook = new Book(req.body);
        newbook.created = new Date();
        // res.json({msg: 'Success'});
        newbook.save(function(err, comment){
            if (err) { 
                console.log("Error creating book: " + err);
                res.json({msg: 'Failed to add book'});
            } else {
                console.log('Added book');
                res.json({msg: 'Success', key: newbook._id});
            }
        });
    },
    updateBook: function(req, res){        
        var bookId = req.params.book_id;
        console.log("update book id: " + bookId);
        if(bookId){
            Book.findOneAndUpdate({_id: bookId}, req.body, {new:true}, function(err, cbook){
                if(err) { 
                    console.log("Book not found: " + bookId);
                    res.json({msg: 'Error updating book'});
                    // throw err; 
                } else {
                    console.log('Updated: ' + cbook);
                    res.json({msg: 'Success', book: cbook});
                }
            });
        } else {
            res.json({msg: 'Book not found: ' + bookId});
        }
    },
    remove: function(req, res){        
        var bookId = req.params.book_id;
        console.log("delete id: " + bookId);
        if(bookId){
            Book.findOneAndDelete({_id: bookId}, function(err, cbook){
                if(err) { 
                    console.log("Book not found: " + bookId);
                    res.json({msg: 'Error deleting book'});
                    // throw err; 
                } else {
                    console.log('Deleting: ' + cbook);
                    if(cbook != null){
                        var imagePath = cbook.image1;
                        if(imagePath != null){
                            fs.unlink(imagePath, function (err) {
                                if (err) {
                                    console.log("Error removing image: " + err);
                                    // res.json({msg: 'Error Removing Image'});
                                }
                            });
                        }    
                        res.json({msg: 'Success'});
                    } else {
                        res.json({msg: 'Book not found'});
                    }
                }
            });
        }
    },
    saveTempFile: function(req, res){
        console.log('Save Temp File');
        if(req.file){
            console.log('File: ' + req.file.path);
            console.log('title: ' + req.body.title);
            
            var tempPath = req.file.path;
            var ext = path.extname(req.file.originalname).toLowerCase();
            var targetPath = tempPath + ext;
            var url = 'public/upload/' + req.file.filename + ext;
            console.log('url:' + url); 
            if (ext === '.png' || ext === '.jpg' || ext === '.jpeg' || ext === '.gif') {
                fs.rename(tempPath, targetPath, function (err) {
                    if (err){
                        console.log('Error saving file: ' + err);
                    } else {
                        res.json({file: url});
                    }
                });
            } else {
                fs.unlink(tempPath, function (err) {
                    if (err) throw err;
                    res.status(500).json({msg: 'Only image files are allowed: png/jpg/jpeg/gif.',
                                         code: 'BAD_FILE_TYPE'});
                });
            }
        } else {
            res.status(500).json({msg: 'Invalid File Upload Request', code: 'UNKNOWN_ERR'});
        }
    }
};