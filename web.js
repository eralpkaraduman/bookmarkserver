var http = require ('http');             // For serving a basic web page.
var mongoose = require ("mongoose"); // The reason for this demo.
var express = require('express');
var validator = require('validator');
var crypto = require('crypto');
var app = express();
app.use(express.bodyParser());

var algorithm = 'aes256';
var key = 'yylnexxar';
var cipher = crypto.createCipher(algorithm, key);
var decipher = crypto.createDecipher(algorithm, key);

var url = require('url');




var uristring =
process.env.MONGOLAB_URI ||
process.env.MONGOHQ_URL ||
'mongodb://localhost/HelloMongoose';

var bookmarkSchema = new mongoose.Schema({
	encrypted:String,
	bookmarkURL:String,
	videoURL:String,
	imageURL:String,
	thumbnailURL:String
});

var Bookmark = mongoose.model('Bookmarks', bookmarkSchema);

// The http server will listen to an appropriate port, or default to
// port 5000.
var port = process.env.PORT || 5000;

// Makes connection asynchronously.  Mongoose will queue up database
// operations and release them when the connection is complete.
/*
mongoose.connect(uristring, function (err, res) {
  if (err) {
  console.log ('ERROR connecting to: ' + uristring + '. ' + err);
  } else {
  console.log ('Succeeded connected to: ' + uristring);
  }
});
*/

app.post('/bookmark',function(req,res){
	res.header('Access-Control-Allow-Origin', '*')

	saveBookmark(req.body.bookmarkURL,function(err,result){
		if(err){
			res.send('error:'+err);
		}else{
			res.send('ok'+(result?":"+result:""));
		}
	});
});

app.get('/bookmarks',function(req,res){
	//res.send('sig');

	Bookmark.find({}).exec(function(err,result){
		console.log('err',err);
		console.log('result',result);

		res.send({e:err,r:result});
	});
})


function saveBookmark(bookmarkURL,callback){
	var e = false //encrypt?

	if(validator.isURL(bookmarkURL)){
		
		db(function(err, res) {
		  if (err) {
		  	console.log(err);
		  	callback('db1:'+err,null);
		  } else {

		  	var bookmark = new Bookmark({
		  		encrypted:'true',
		  		bookmarkURL:e?enc(bookmarkURL):bookmarkURL
		  	});

		  	bookmark.save(function(err){
		  		if(err){
		  			console.log(err);
		  			callback('db2'+err,null);
		  		}else{
		  			callback(null,null);
		  		}
		  	});

		  }
		});

	}else{
		callback('invalid url',null);
	}
}

function db(callback){
	mongoose.connect(uristring, function (err, res) {
		callback(callback(err,res));
	});
}

function enc(str){
	return cipher.update(str, 'utf8', 'hex') + cipher.final('hex');
}

function dec(str){
	return decipher.update(str, 'hex', 'utf8') + decipher.final('utf8');
}

app.listen(port);
