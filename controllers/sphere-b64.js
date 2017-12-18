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

	var thumbName = "thumb_" + new Date().toDateString() + ".jpg"

	image360(body.image, thumbName).then(function () {
		var fileStream = fs.createReadStream(thumbName)
		fileStream.on("open", function () {
			res.setHeader("Content-Type", "image/jpeg")
			fileStream.pipe(res)
		})
	}, function () {
		respond({ status: 500 })
	})

	respond({status: 200})
}