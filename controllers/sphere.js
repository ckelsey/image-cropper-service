const uploader = require("../lib/file-upload")
const Utils = require("../lib/utils")
const image360 = require("../lib/image-360")
const fs = require("fs")

module.exports = function (res, headers, body, query, params, files) {
	function respond(response) {
		res.statusCode = response.status
		return res.end()
	}

	console.log(body)

	if (!files) {
		files = body
	}

	uploader(headers, files, body, query, Utils.tempDir)
		.then((uploadResult) => {

			console.log("UPLOAD RESULT", uploadResult);

			if (uploadResult.properties.done) {
				var thumbUrlParts = uploadResult.result.url.split("/")
				var thumbName = "thumb_" + thumbUrlParts[thumbUrlParts.length - 1]
				thumbUrlParts.pop()
				var thumbUrl = thumbUrlParts.join("/") + "/" + thumbName

				console.log("thumbUrl", thumbUrl);

				image360(uploadResult.result.url, thumbUrl).then(function () {
					var fileStream = fs.createReadStream(thumbUrl)
					fileStream.on("open", function () {
						res.setHeader("Content-Type", "image/jpeg")
						fileStream.pipe(res)
					})
				}, function (e) {
					console.log("EERRR", e);
					respond({status:500})
				})

			} else {
				respond(uploadResult)
			}
		}, (uploadResult) => {
			console.log("E", uploadResult);
			respond(uploadResult)
		})
}