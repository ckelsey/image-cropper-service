const image360 = require("../lib/image-360")
const fs = require("fs")
const https = require("https")

module.exports = function (res, headers, body, query, params, files) {
	function respond(response) {
		res.statusCode = response.status
		return res.end()
	}

	console.log(body)

	var ext = body.image.split(".")
	ext = ext[ext.length - 1]
	var file = fs.createWriteStream(new Date().getTime() + "." + ext);

	https.get(body.image, function (response) {
		response.pipe(file);

		file.on('finish', function () {
			file.close(function () {

				var thumbName = "thumb_" + new Date().getTime() + ".jpg"

				image360(file.path, thumbName).then(function () {
					var thumb = fs.readFileSync(thumbName);
					res.end(new Buffer(thumb).toString('base64'))
					fs.unlink(file.path)
					fs.unlink(thumbName)
				}, function () {
					respond({ status: 500 })
				})
			});

		});
	});
}