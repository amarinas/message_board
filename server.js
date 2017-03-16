/**
 * Created by amarinas on 3/14/17.
 */
//require npm package
var express = require('express'),
    path = require('path'),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose');

var app = express();
app.use(bodyParser.urlencoded(true));
app.set('views', path.join(__dirname, "./views"))
app.set('view engine', 'ejs');

//connect and create db if not created already
mongoose.connect('mongodb://localhost/message_board');


var Schema = mongoose.Schema;
var MessageSchema = new mongoose.Schema({
    name: { type: String, required: true, minlength: 4},
    message: { type: String, required: true, minlength: 4},
    comments:[{type: Schema.Types.ObjectId, ref: 'Comment'}]
});

MessageSchema.path('name').required(true, 'Name Cannot be blank');
MessageSchema.path('message').required(true, 'message cannot be blank')
mongoose.model("Message", MessageSchema);
var Message = mongoose.model('Message');
var CommentSchema = new mongoose.Schema({
    _message:{type: Schema.Types.ObjectId, ref: 'Message'},
    name: { type: String, required: true, minlength: 4},
    text: { type: String, required: true, minlength: 4}

});
CommentSchema.path('name').required(true,'name cannot be blank');
CommentSchema.path('text').required(true,'comment cannot be blank');
mongoose.model('Comment', CommentSchema);
var Comment = mongoose.model('Comment');

mongoose.Promise = global.Promise;


//routes and root request

//get url

app.use(function(req, res, next) {
    req.getUrl = function() {
        return "(" + req.method + ") " + req.protocol + "://" + req.get('host') + req.originalUrl;
    }
    console.log("Request: " + req.getUrl());
    //console.log('request: ', req )
    return next();

});


app.get('/', function(req, res){
    Message.find({})
        .populate("comments")

        .exec(function (err, results) {

        if(err){console.log(err);}
        res.render('index',{result: results})
    } )

});

app.post('/message', function (req, res) {

    var postMessage = new Message({name: req.body.name, message: req.body.message});
    postMessage.save(function (err) {
        if(err){console.log(err);
            res.render('index.ejs', {errors: postMessage.errors});
        }else{
            console.log('message saved to the database');
            res.redirect('/');
        }

    })

})

app.post('/addComment/:id', function(req, res){

    var message_id = req.params.id;
    Message.findOne({_id:message_id}, function (err, message) {
        var newComment = new Comment({name: req.body.name, text: req.body.comment});

        newComment._message = message.id;
        Message.update({_id: message.id}, {$push: {"comments": newComment}}, function (err) {

        })
        newComment.save(function (err) {
            if(err){
                res.render('index.ejs', {errors: newComment.errors});

            }else{
                console.log('comment added')
                res.redirect('/')
            }
        })
    })

})

// setting the server and port
app.listen(9000, function () {
    console.log('listening on port 9000 for project mongoose message board')

})