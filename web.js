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

// Here we find an appropriate database to connect to, defaulting to
// localhost if we don't find one.
var uristring =
process.env.MONGOLAB_URI ||
process.env.MONGOHQ_URL ||
'mongodb://localhost/HelloMongoose';

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


function saveBookmark(bookmarkURL,callback){
	if(validator.isURL(bookmarkURL)){
		
		mongoose.connect(uristring, function (err, res) {
		  if (err) {
		  	console.log(err);
		  	callback('db:'+err,null);
		  } else {
		  	callback(null,"db-connect-ok");
		  }
		});

	}else{
		callback('invalid url',null);
	}
}

function enc(str){
	return cipher.update(str, 'utf8', 'hex') + cipher.final('hex');
}

function dec(str){
	return decipher.update(str, 'hex', 'utf8') + decipher.final('utf8');
}

app.listen(port);
