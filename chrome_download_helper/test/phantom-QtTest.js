var page = require('webpage').create();

page.open("http://www.vimeo.com", function (status) {
	var output = page.evaluate(function () {
		var results = []
		rersults.push(hiddenField.value);
		return results
	    });
	console.log(JSON.stringify(output));
	phantom.exit();
    });