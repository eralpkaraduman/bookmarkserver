javascript:(function(){
	var data = new FormData();
	data.append('bookmarkURL', window.location.href);
	data.append('title', document.title);
	var xhr = new XMLHttpRequest();
	xhr.open('POST', 'http://supervault.herokuapp.com/bookmark', true);
	xhr.onload = function () {
	    alert(this.response);
	};
	xhr.send(data);
})();


//min

javascript:(function(){var e=new FormData;e.append("bookmarkURL",window.location.href);var t=new XMLHttpRequest;t.open("POST","http://localhost:5000/bookmark",true);t.onload=function(){alert(this.response)};t.send(e)})()