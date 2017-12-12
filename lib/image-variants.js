const Utils = require("./utils")
const easyimg = require('easyimage')
const image360 = require("./image-360")
const imageFlat = require("./image-flat")

module.exports = function (imgUrl, meta, options) {
	return new Promise((resolve) => {
		const filenameParts = imgUrl.split(".")
		var large = filenameParts[0] + "_large.jpg"
		var small = filenameParts[0] + "_small.jpg"
		var thumb = filenameParts[0] + "_thumb.jpg"
		var smallWidth = 1080

		function resize(dest, w, h, quality) {
			return easyimg.resize({
				src: imgUrl,
				dst: dest,
				quality,
				width: w, height: h
			})
		}

		function respond() {
			large = "v1/image" + large.split(Utils.tempDir)[1]
			small = "v1/image" + small.split(Utils.tempDir)[1]
			thumb = "v1/image" + thumb.split(Utils.tempDir)[1]

			resolve({
				meta,
				urls: {large, small, thumb}
			})
		}

		meta.dimensions.height = parseInt(meta.dimensions.height)
		meta.dimensions.width = parseInt(meta.dimensions.width)

		resize(small, smallWidth, parseInt(meta.dimensions.height * (smallWidth / meta.dimensions.width)), 33).then(() => {
			if (meta["360"]) {

				resize(large, 4096, parseInt(meta.dimensions.height * (4096 / meta.dimensions.width)), 80).then(() => {

					options.sourceWidth = meta.dimensions.width
					options.sourceHeight = meta.dimensions.height

					image360(imgUrl, thumb, options).then(() => {
						respond()
					})
				})

			} else {

				resize(large, meta.dimensions.width, meta.dimensions.height, 80).then(() => {

					imageFlat(imgUrl, thumb, options, meta).then(() => {
						respond()
					})
				})

			}
		})
	})
}