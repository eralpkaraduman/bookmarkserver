var http = require ('http');             // For serving a basic web page.
var mongoose = require ("mongoose"); // The reason for this demo.
var express = require('express');
var validator = require('validator');
var crypto = require('crypto');
var app = express();
app.use(express.bodyParser());

var algorithm = 'aes256';
var key = 'yylnexxar';


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
	
	res.writeHead(200, { 'Content-Type': 'application/json'});

	db(false,function(err, db_res) {
	  
		var response = {};

		if (!err) {
			Bookmark.find({}).exec(function(err,result){
			
				if(err){
					response.result = false;
					response.error = err+"";
				}else{
					response.result = true;
					response.bookmarks = [];
				}
		});

	  }else{

		response.result = false;
	  	response.error = err+"";
	  }

	  
	  res.end(JSON.stringify(response,null, 4));

	});


	
})


function saveBookmark(bookmarkURL,callback){
	var e = true; //encrypt?

	if(validator.isURL(bookmarkURL)){
		
		db(true,function(err, res) {
		  if (!err) {
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

function db(catchError,callback){
	
	mongoose.connect(uristring, function (err, res) {

		if(err && catchError==true){
			err = 'db1:'+err;
			console.log(err);
		  	callback(err,null);
		}else{
			callback(callback(err,res));	
		}
		
	});
}

function enc(str){
	var cipher = crypto.createCipher(algorithm, key);
	return cipher.update(str, 'utf8', 'hex') + cipher.final('hex');
}

function dec(str){
	var decipher = crypto.createDecipher(algorithm, key);
	return decipher.update(str, 'hex', 'utf8') + decipher.final('utf8');
}

app.listen(port);
