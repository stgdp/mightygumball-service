var log, cities;

/* serverJsonp.js */

// var http = require('http');
// var url = require('url');
// var cities = require("./cities.js");

// var time;


// updateLog();

// var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080;
// var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || "0.0.0.0";

// http.createServer(function (req, res) {
//     var uri = url.parse(req.url).pathname;
//     res.writeHead(200, {'Content-Type': 'text/plain'});
//     res.end(getResponse(url.parse(req.url).query));
// }).listen(server_port, server_ip_address);
// console.log("Server running at " + server_ip_address);
// console.log("Listening on port " + server_port);

function getResponse(query) {
	var now = 0;
	var time;
	var callback;
	if (query) {
		for( let pair of query.entries() ) {
			console.log( pair )
			switch( pair[0] ) {
				case "callback":
					callback = pair[1];
					break;
				case "random":
					now = pair[1];
					break;
				case "lastreporttime":
					time = pair[1]
					break;
			}
		}
	}
	else {
		time = query;
	}

	var response = [];
	var start;

	if (parseInt(time)) {
		start = getStart(time);
	} else {
		start = 1;
	}


	// create the response using the <start> newest
	// cities. The newest timestamp is at response[0]!!
	//for (i = 0; i <= start; i++) {
	for (i = start; i >= 0; i--) {
		response.push(log[i]);
	}

	if (callback != "" && callback != undefined) {
		return callback + "(" + JSON.stringify(response) + ");";
	}
	// work with the prev index.html
	else {
		return JSON.stringify(response);
	}
}

// find the cities since the last request
// based on the "lastreporttime" paramter.
// If no info, then return 9 (so we return 9 cities)
function getStart(time) {
	time = parseInt(time, 10);

	if (!time) return 1;
	for(i = 0; i <= 999;i++) {
		var cityTime = parseInt(log[i].time, 10);
		if (time >= cityTime) {
			return i-1;
		}
	}
	return 9;
}

// create the initial log
function createLog() {
   let log = [];

   for(i=0;i<1000;i++) {
      log[i] = createGumballReport();
   }
   return log;
}

// update the log by shifting everything in the log
// down by one (so log[1] gets the value of log[0]).
// Then create a new city report for log[0].
// Do this every few miliseconds.
// function updateLog() {
// 	var log2 = [];
// 	for(i = 0; i < 999; i++) {
// 		log2[i+1] = log[i];
// 	}

//     log2[0] = createGumballReport();
// 	log = log2;

// 	console.log("update with " + log2[0].name);
// 	setTimeout(updateLog, Math.floor(Math.random()*5000 + 2000));
// }

function createGumballReport() {
	var date = new Date();
	ind = Math.floor(Math.random() * cities.length);
	sold = Math.floor(Math.random()*9 + 1);
	cityName = cities[ind].Name;
	cityTime = date.getTime();
	cityLong = cities[ind].Longitude;
	cityLat = cities[ind].Latitude;

	return {name: cityName, time: cityTime, sales: sold, longitude: cityLong, latitude: cityLat };
}

async function handleRequest(request) {
	cities = await GUMBALL.get("cities", "json");
	log = createLog();

	let parsed = new URL( request.url )
	let params = new URLSearchParams( parsed.search )
	const data = getResponse(params)

	return new Response(data, {
		headers: {
		  "content-type": "application/javascript;charset=UTF-8"
		}
	  })

}
addEventListener("fetch", event => {
	event.respondWith(handleRequest(event.request))
  })