const image360 = require("../lib/image-360")
const fs = require("fs")
const https = require("https")

module.exports = function (res, headers, body, query, params, files) {
	function respond(response) {
		res.statusCode = response.status
		return res.end()
	}

	var ext = body.image.split(".")[body.image.split(".").length - 1]
	var file = fs.createWriteStream(new Date().getTime() + "." + ext);
	https.get(body.image, function (response) {
		response.pipe(file);

		file.on('finish', function () {
			file.close(function () {

				var thumbName = "thumb_" + new Date().getTime()

				image360(file.path, thumbName).then(function () {
					var fileStream = fs.createReadStream(thumbName)
					fileStream.on("open", function () {
						res.setHeader("Content-Type", "image/jpeg")
						fileStream.pipe(res)
					})
				}, function () {
					respond({ status: 500 })
				})
			});

		});
	});
}