const uploader = require("../lib/file-upload")
const Utils = require("../lib/utils")
const image360 = require("../lib/image-360")
const fs = require("fs")
const path = require("path")
const https = require("https")

module.exports = function (res, headers, body, query, params, files) {
	function respond(response) {
		res.statusCode = response.status
		return res.end()
	}

	console.log(body)

	var file = fs.createWriteStream(new Date().getTime() + ".jpg");
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