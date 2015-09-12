var express = require('express');
var app = express();
var needle = require('needle');
var Crawler = require('crawler');
var url = require('url');
var sugar = require('sugar');

var sendError = function(res, errorMessage) {
  res.send({
    'type': 'error',
    'message': errorMessage
  });
};

//get and parse videos
var parsePage = new Crawler({
	callback: function(error, result, $){
		var videos = [];
		$('.channels-content-item').each(function(i, element){
			var link = $(this).find('.yt-lockup-title').children().attr('href');
			var date = Date.create($(this).find('.yt-lockup-meta-info').children().eq(1).text()).short();
			var title = $(this).find('.yt-lockup-title').children().attr('title');
			if(link){
				videos.push({
					datePublished: date,
					link: link,
					title: title
				});
			}
		});
		result.options.sendData(videos);
	}
});

var youtubeSearch = function(user){
	return "https://www.youtube.com/user/" + user + "/videos";
};

var getVideos = function(res, id){
	parsePage.queue({
		uri: youtubeSearch(id),
		sendData: function(data){
			res.send({
				id: id,
				videos: data
			});
		}
	});
};

var allowCrossDomain = function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

  // intercept OPTIONS method
  if ('OPTIONS' == req.method) {
    res.send(200);
  }
  else {
    next();
  }
};

app.use(allowCrossDomain);
app.get('/:id?', function(req, res){
  var id = req.params.id;
  var videos = [];

  if (!id) {
    sendError(res, 'Please send a valid id');
  } else {
	videos = getVideos(res, id);
  }

});

var port = process.env.PORT || 3300;
app.listen(port);