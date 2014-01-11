var http = require ('http'); 
var mongoose = require('mongoose');
var _db;
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

// The http server will listen to an appropriate port, or default to
// port 5000.
var port = process.env.PORT || 5000;

app.post('/bookmark',function(req,res){
	res.header('Access-Control-Allow-Origin', '*')

	saveBookmark(req.body.bookmarkURL,req.body.title,function(err,result){
		if(err){gthfr
			res.send('error:'+err);
		}else{
			res.send('ok'+(result?":"+result:""));
		}

	});
});

app.get('/bookmarks/delete/:bookmarkID',function(req,res){
	res.writeHead(200, { 'Content-Type': 'application/json'});
	var response = {result:false,id:req.params.bookmarkID};

	if(_db.readyState){
		Bookmark.remove({ _id: bookmarkID }, function(err) {
		    if (!err) {
				response.result = true;
		    }
		    else {
				response.error = error;
		    }
		    res.end(JSON.stringify(response,null, 4));
		});
	}else{
		response.error = 'db not connected';
		res.end(JSON.stringify(response,null, 4));
	}
	
});

app.get('/bookmarks',function(req,res){
	
	res.writeHead(200, { 'Content-Type': 'application/json'});

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
						    	bookmarkURL:e?dec(b.title):b.title,
						    	title:e?dec(b.bookmarkURL):b.bookmarkURL,
						    	id:b._id,
						    	deleteURL:"/bookmarks/delete/"+b._id
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


function saveBookmark(bookmarkURL,title,callback){
	var e = true; //encrypt?

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

		  //}
		//});

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

app.listen(port);
