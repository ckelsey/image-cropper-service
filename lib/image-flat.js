const sanitizer = require("./sanitize")
const fs = require("fs")
const Canvas = require("canvas")

global.document = {
	createElement: function (tag) {
		if (tag === "img") {
			return new Canvas.Image()
		} else if (tag === "canvas") {
			return new Canvas()
		}
	}
}

function drawFabric(sourceUrl, destinationUrl, options, meta) {
	return new Promise((resolve) => {

		options = options || {}
		options.viewWidth = options.viewWidth ? sanitizer.number(options.viewWidth[0]) : options.viewwidth ? sanitizer.number(options.viewwidth[0]) : meta.dimensions.width
		options.viewHeight = options.viewHeight ? sanitizer.number(options.viewHeight[0]) : options.viewheight ? sanitizer.number(options.viewheight[0]) : meta.dimensions.height

		var viewHeight = options.viewHeight
		var viewWidth = options.type === "3d" ? options.viewWidth / 2 : options.viewWidth
		var zoom = options.zoom ? sanitizer.number(options.zoom[0]) : options.z ? sanitizer.number(options.z[0]) : 0.5
		var lat = options.tilt ? sanitizer.number(options.tilt[0]) : 0
		var lon = options.pan ? sanitizer.number(options.pan[0]) : 0
		var x = options.x ? sanitizer.number(options.x[0]) : 0
		var y = options.y ? sanitizer.number(options.y[0]) : 0
		var w = options.width ? sanitizer.number(options.width[0]) : viewWidth
		var h = options.height ? sanitizer.number(options.height[0]) : viewHeight
		var pixelRatio = options.pixelRatio ? sanitizer.number(options.pixelRatio[0]) : options.pixelratio ? sanitizer.number(options.pixelratio[0]) : 2

		var img = new Canvas.Image()
		img.onload = function () {
			var loadedImg = img

			var canvas = new Canvas(viewWidth, viewHeight)
			canvas.style = {} // dummy shim to prevent errors during render.setSize

			var ctx = canvas.getContext("2d");
			ctx.scale(zoom * pixelRatio, zoom * pixelRatio);
			ctx.drawImage(loadedImg, (lon / zoom) / pixelRatio, (lat / zoom) / pixelRatio)

			var cropCanvas = new Canvas(w, h)
			cropCanvas.style = {} // dummy shim to prevent errors during render.setSize

			cropCanvas.getContext("2d").drawImage(canvas, -x, -y)

			var scaleWidth = 600
			var scaleFactor = (scaleWidth / w)

			var resizeCanvas = new Canvas(scaleWidth, h * scaleFactor)
			resizeCanvas.style = {} // dummy shim to prevent errors during render.setSize

			resizeCanvas.getContext("2d").drawImage(canvas,
				x, y, w, h,
				0, 0, resizeCanvas.width, resizeCanvas.height)

			var out = fs.createWriteStream(destinationUrl)
			var canvasStream = resizeCanvas.jpegStream()

			canvasStream.on("data", function (chunk) { out.write(chunk) })
			canvasStream.on("end", function () { resolve() })
		}

		img.src = sourceUrl
	})
}

module.exports = drawFabric