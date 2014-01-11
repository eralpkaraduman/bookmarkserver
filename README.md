Bookmark Server
===============

Very simple node.js bookmark server with REST-ish api.
Stores bookmarks on mongodb,
You can run this on heroku with mongolab addon.

/bookmarklet
------------

Generates a bookmarklet for you to drag to your bookmarks bar.
Clicking it will bookmark web pages.

POST /bookmark/add
------------------

  - bookmarkURL : url of the page
  - title : title of the page

GET /bookmarks
--------------

Returns bookmarks as json

GET /bookmarks/delete/:bookmarkID
---------------------------------

Replace ":bookmarkID" to delete a bookmark

Encryption
----------

Server has encryption feature which is default ON
You have to provide an encryption key with one of these methods;

  - set an environment variable ENCRYPTION_KEY on heroku/your server).
  - create key.js file with "module.exports = 'yourEncryptionKey';" in it.
  - don't hide it just replace "var key = .." line with "var key = 'yourEncryptionKey'"

  If you want to turn encryption off
  Do 3rd method above than go to function saveBookmark in web,js, change var e=true to false
  If you dont provide any key, require('./key') will crash so you have to get rid of it by doing 3rd method above.
