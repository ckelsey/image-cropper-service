const uploader = require("../lib/file-upload")
const Utils = require("../lib/utils")
const image360 = require("../lib/image-360")
const fs = require("fs")
const path = require("path")

module.exports = function (res, headers, body, query, params, files) {
	function respond(response) {
		res.statusCode = response.status
		return res.end()
	}

	uploader(headers, files, body, query, Utils.tempDir)
		.then((uploadResult) => {

			if (uploadResult.properties.done) {
				var thumbUrlParts = uploadResult.result.url.split("/")
				var thumbName = "thumb_" + thumbUrlParts[thumbUrlParts.length - 1]
				thumbUrlParts.pop()
				var thumbUrl = thumbUrlParts.join("/") + "/" + thumbName

				image360(uploadResult.result.url, thumbUrl).then(function () {
					console.log(thumbUrl);

					var fileStream = fs.createReadStream(thumbUrl)
					fileStream.on("open", function () {
						res.setHeader("Content-Type", "image/jpeg")
						fileStream.pipe(res)
					})
				}, function () {
					respond({status:500})
				})

			} else {
				respond(uploadResult)
			}
		}, (uploadResult) => {

			respond(uploadResult)
		})
}