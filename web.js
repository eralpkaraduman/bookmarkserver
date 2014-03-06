var http = require ('http');
var UglifyJS = require("uglify-js");
var mongoose = require('mongoose');
var express = require('express');
var validator = require('validator');
var crypto = require('crypto');
var app = express();
app.use(express.bodyParser());


var _db;
var algorithm = 'aes256';

// storing your key
// 1) set an environment variable on heroku.
// 2) create key.js with "module.exports = "yourEncryptionKey";" in it.
// 3) don't hide it just replace line below with var key="yourEncryptionKey".
var key = process.env.ENCRYPTION_KEY || require('./key') || "yourEncryptionKey";
console.log('using encryptionKey : '+key);

var url = require('url');

// you need a mongodb uri create a file named mongodb_uri.js with
// module.exports = "mongodb:// .." in it.
var uristring = require('./mongodb_uri');

mongoose.connect(uristring);
_db = mongoose.connection;
_db.on('error', console.error.bind(console, 'connection error:'));
_db.once('open', function callback () {
	console.log('db connection opened');

});

var bookmarkSchema = new mongoose.Schema({
	title:String,
	encrypted:String,
	bookmarkURL:String,
	videoURL:String,
	imageURL:String,
	thumbnailURL:String
});

var Bookmark = mongoose.model('Bookmarks', bookmarkSchema);



app.post('/bookmarks/add',function(req,res){
	res.header('Access-Control-Allow-Origin', '*')

	saveBookmark(req.body.bookmarkURL,req.body.title,function(err,result){
		if(err){
			res.send('error:'+err);
		}else{
			res.send('ok'+(result?":"+result:""));
		}

	});
});

app.get('/bookmarks/delete/:bookmarkID',function(req,res){

	res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8'});
	var response = {result:false,id:req.params.bookmarkID};

	if(_db.readyState){
		Bookmark.remove({ _id: response.id }, function(err) {
		    if (!err) {
				response.result = true;
		    }
		    else {
				response.error = err;
		    }
		    res.end(JSON.stringify(response,null, 4));
		});
	}else{
		response.error = 'db not connected';
		res.end(JSON.stringify(response,null, 4));
	}

});

app.get('/bookmarks',function(req,res){

	var fullURL = req.protocol + "://" + req.get('host');

	res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8'});

		var response = {};

		if(_db.readyState){

			Bookmark.find({}).exec(function(err,result){

					if(err){
						response.result = false;
						response.error = err+"";
					}else{
						response.result = true;

						response.bookmarks = [];

						result.forEach(function(b) {

						    var _b = {};
						    var e = (b.encrypted == "true");



						    _b = {
						    	encrypted:e,
						    	title:e?dec(b.title):b.title,
						    	bookmarkURL:e?dec(b.bookmarkURL):b.bookmarkURL,
						    	id:b._id,
								deleteURL:fullURL+"/bookmarks/delete/"+b._id
						    }

						    response.bookmarks.push(_b);
						});


					}
					res.end(JSON.stringify(response,null, 4));
			});

		}else{
			response.result = false;
	  		response.error = "db not connected";
	  		res.end(JSON.stringify(response,null, 4));
		}

})

app.get('/bookmarklet',function(req,res){

	res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8'});

	var fullURL = req.protocol + "://" + req.get('host');

	var script = "(function(){ \
					var data = new FormData(); \
					data.append('bookmarkURL', window.location.href); \
					data.append('title', document.title); \
					var xhr = new XMLHttpRequest(); \
					xhr.open('POST', '"+fullURL+"/bookmarks/add', true); \
					xhr.onload = function () { \
					    alert(this.response); \
					}; \
					xhr.send(data); \
				})();";

	script = "javascript:"+UglifyJS.minify(script, {fromString: true}).code;


	var html = "<html><body> \
		<a href='"+script+"'>bookmark</a> \
		<br /> \
		<pre><textarea width='200px' rows='5' cols='50' >"+script+"</textarea></pre>\
	</body></html>";

	res.end(html);

});


function saveBookmark(bookmarkURL,title,callback){
	// TURN ON/OFF ENCRYPTION FROM HERE
	var e = true;

	if(validator.isURL(bookmarkURL)){


		if(_db.readyState){
			var bookmark = new Bookmark({
				encrypted:'true',
				title:e?enc(title):title,
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
		}else{
			callback('db not connected',null);
		}


	}else{
		callback('invalid url',null);
	}
}

function enc(str){
	var cipher = crypto.createCipher(algorithm, key);
	return cipher.update(str, 'utf8', 'hex') + cipher.final('hex');
}

function dec(str){
	var decipher = crypto.createDecipher(algorithm, key);
	return decipher.update(str, 'hex', 'utf8') + decipher.final('utf8');
}

// The http server will listen to an appropriate port, or default to
// port 5000.
var port = process.env.PORT || 5000;
app.listen(port);
