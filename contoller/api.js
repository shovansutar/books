// REST API code
var Book = require('../app/models/book');
var Request = require('../app/models/request');
var Category = require('../app/models/category');
var fs = require('fs');
var path = require('path');
const User = require('../app/models/user');
const conf = require('../config/auth');
const jwt = require('jsonwebtoken');

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
    bookSearch: function(req, res){ 
        var pattern = req.params.pattern;  
        Book.find({
            $or:
                [
                    { title: { $regex: pattern, $options: 'i' } },
                    { description: { $regex: pattern, $options: 'i' } },
                    { author: { $regex: pattern, $options: 'i' } },
                    { category: { $regex: pattern, $options: 'i' } }
                ]
            },
            function (err, books) {
                if (err) {
                    console.log("Book not found: " + bookId);
                    res.json({ msg: 'book not found' });
                } else {
                    console.log('No of books: ' + books.length);
                    res.json(books);
                }
            }
        ).limit(50);
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
        var userid = req.userid;
        console.log("delete id: " + bookId);
        if(bookId){
            Book.findById(bookId, function(err, cbook){
                if(cbook != null){
                    var owner = cbook.ownerId;
                    console.log("User/Owner: ",userid,"/",owner);
                    if(owner == userid){
                        console.log("Will delete");
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
                                    res.status(200).send({msg: 'Success'});
                                } else {
                                    res.json({msg: 'Book not found'});
                                }
                            }
                        });
                    } else {
                        res.status(401).send({msg: 'Not the Owner, Cannot delete'});
                    }
                }
            })
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
    },
    register: function (req, res) {
        let userData = req.body
        
        User.findOne({ email: userData.email }, (err, user) => {
            if (user != null) {
                console.log("Email ID already registered");
                res.status(401).send({ err: "e-mail ID is already registered"});
            } else {
                let user = new User(userData)
                user.save((err, registeredUser) => {
                    if (err) {
                        console.log(err)
                    } else {
                        let payload = { subject: registeredUser._id }
                        let token = jwt.sign(payload, conf.secretKey);
                        res.status(200).send({ 
                            token, name: 
                            registeredUser.name, 
                            email:user.email, 
                            userid: registeredUser._id  
                        })
                    }
                })
            }
        })
    },
    myProfile: function(req, res){ 
        var userid = req.userid;
        console.log('UserId: ', userid);
        User.findById(userid, function (err, user) {
                if (err) {
                    console.log("User not found");
                    res.json({ msg: 'User not found' });
                } else {
                    res.json(user);
                }
            }
        );
    },
    login: function (req, res) {
        let userData = req.body
        User.findOne({ email: userData.email }, (err, user) => {
            if (err) {
                console.log(err)
            } else {
                if (!user) {
                    res.status(401).send('Invalid Email')
                } else {
                    if (user.password !== userData.password) {
                        res.status(401).send('Invalid Password')
                    } else {
                        let payload = { subject: user._id }
                        let token = jwt.sign(payload, conf.secretKey, { expiresIn: conf.expireSec })
                        let name = user.name;
                        let userid = user._id; 
                        res.status(200).send({ token, name, email:user.email, userid })
                    }
                }
            }
        })
    },
    requestOne: function(req, res){        
        var reqId = req.params.request_id;
        if(reqId){
            Request.findById(reqId, function(err, creq){
                if(err) { 
                    console.log("Request not found: " + reqId);
                    res.json({msg: 'Request not found'});
                    // throw err; 
                } else {
                    res.json(creq);
                }
            })
        }
    },
    myRequests: function(req, res){ 
        var userid = req.userid;
        console.log('UserID: ',userid);
        Request.find({requesterId: userid}, {}, {sort: {created: -1}, limit:100}, 
            function (err, reqs) {
                if (err) {
                    console.log("Request not found");
                    res.json({ msg: 'Request not found' });
                } else {
                    console.log('No of reqs: ' + reqs.length);
                    res.json(reqs);
                }
            }
        );
    },
    pendingRequests: function(req, res){ 
        var userid = req.userid;
        console.log('UserID: ',userid);
        Request.find({ownerId: userid}, {}, {sort: {created: -1}, limit:100}, 
            function (err, reqs) {
                if (err) {
                    console.log("Request not found");
                    res.json({ msg: 'Request not found' });
                } else {
                    console.log('No of reqs: ' + reqs.length);
                    res.json(reqs);
                }
            }
        );
    },
    addRequest: function(req, res){        
        var newreq = new Request(req.body);
        var userid = req.userid;
        newreq.requesterId = userid;
        newreq.status = 'New';
        newreq.created = new Date();
        // res.json({msg: 'Success'});
        newreq.save(function(err, comment){
            if (err) { 
                console.log("Error creating request: " + err);
                res.json({msg: 'Failed to add request'});
            } else {
                console.log('Added request');
                res.json({msg: 'Success', key: newreq._id});
            }
        });
    },
    updateRequest: function(req, res){        
        var reqId = req.params.request_id;
        var userId = req.userid;
        
        console.log("update request id: " + reqId);
        if(reqId){
            Request.findById(reqId, function(err, creq){
                if(err) { 
                    console.log("Request not found: " + reqId);
                    res.json({msg: 'Request not found'});
                    // throw err; 
                } else {
                    if (userId == creq.requesterId || userId == creq.ownerId){
                        Request.findOneAndUpdate({_id: reqId}, req.body, {new:true}, function(err, r){
                            if(err) { 
                                console.log("Request not found: " + reqId);
                                res.json({msg: 'Error updating request'});
                                // throw err; 
                            } else {
                                console.log('values: ', req.body);
                                console.log('Updated: ' + r);
                                res.json({msg: 'Success', request: r});
                            }
                        });
                    } else {
                        res.status(401).json({msg: 'User doesnt own this request'});
                    }
                }
            })
        } else {
            res.json({msg: 'Request not found: ' + reqId});
        }
    }
};