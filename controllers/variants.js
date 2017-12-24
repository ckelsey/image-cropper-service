const https = require("https")
const http = require("http")
const fs = require("fs")
const image360 = require("../lib/image-360")
const imageFlat = require("../lib/image-flat")
const easyimg = require("easyimage")
const Utils = require("./../lib/utils")
const AWS = require("aws-sdk")
const s3Config = require("./../s3.config.json")

/** Load Config File */
AWS.config.loadFromPath("./s3.config.json")

/** After config file load, create object for s3*/
const s3 = new AWS.S3({ region: s3Config.region })

const createItemObject = (callback, imageName, image) => {
	const params = {
		Bucket: s3Config.bucket,
		Key: imageName,
		ACL: 'public-read',
		Body: image
	};
	s3.putObject(params, function (err, data) {
		if (err) {
			callback(err, null)
		} else {
			callback(null, data)
		}
	})
}

module.exports = function (res, headers, body, query) {

	function respond(response) {
		res.statusCode = response.status
		res.write(JSON.stringify({
			message: response.message,
			success: response.status === 200,
			result: response.result
		}))
		return res.end()
	}

	if (query && query.image) {

		if (!body) {
			body = {}
		}

		body.image = query.image
	} else if (!body || !body.image) {
		return respond({
			message: "No supplied image url",
			success: false,
			result: false
		})
	}

	body.viewWidth = body.view_width !== undefined ? body.view_width : query.view_width !== undefined ? [query.view_width] : null
	body.viewHeight = body.view_height !== undefined ? body.view_height : query.view_height !== undefined ? [query.view_height] : null
	body.width = body.width !== undefined ? body.width : query.width !== undefined ? [query.width] : null
	body.height = body.height !== undefined ? body.height : query.height !== undefined ? [query.height] : null
	body.x = body.x !== undefined ? body.x : query.x !== undefined ? [query.x] : null
	body.y = body.y !== undefined ? body.y : query.y !== undefined ? [query.y] : null
	body.z = body.z !== undefined ? body.z : query.z !== undefined ? [query.z] : null
	body.pan = body.pan !== undefined ? body.pan : query.pan !== undefined ? [query.pan] : null
	body.tilt = body.tilt !== undefined ? body.tilt : query.tilt !== undefined ? [query.tilt] : null
	body.pixelRatio = body.pixel_ratio !== undefined ? body.pixel_ratio : query.pixel_ratio !== undefined ? [query.pixel_ratio] : null
	body["360"] = body["360"] !== undefined ? body["360"] : query["360"] !== undefined ? query["360"] : null
	body.name = body.name !== undefined ? body.name : query.name !== undefined ? query.name : (new Buffer(body.image).toString("base64")).split("=").join("") + new Date().getTime() + ".jpg"
	body.path = body.path !== undefined ? body.path : query.path !== undefined ? query.path : ""

	console.log(body);

	var file = fs.createWriteStream(Utils.tempDir + "/" + body.name);
	var results = {
		thumb: "",
		large: "",
		small: ""
	}

	var thumbMethod, protocolMethod

	if (body["360"]) {
		thumbMethod = image360
	} else {
		thumbMethod = imageFlat
	}

	if (body.image.indexOf("https") > -1) {
		protocolMethod = https
	} else {
		protocolMethod = http
	}

	var thumbName = Utils.tempDir + "/thumb_" + body.name
	var largeName = Utils.tempDir + "/large_" + body.name
	var smallName = Utils.tempDir + "/small_" + body.name
	var dimensions = null

	function errorOut(err) {
		fs.unlink(thumbName)
		fs.unlink(largeName)
		fs.unlink(smallName)
		fs.unlink(Utils.tempDir + "/" + body.name)
		respond({ status: 500, message: err })
	}

	protocolMethod.get(body.image, function (response) {
		response.pipe(file);

		file.on("finish", function () {
			file.close(function () {

				easyimg.info(file.path)
					.then(function (dim) {
						dimensions = dim
						return
					})
					.then(function () {
						return thumbMethod(file.path, thumbName, body, {dimensions: dimensions})
					})
					.then(function () {
						results.thumb = body.path + "/thumb_" + body.name
						return easyimg.resize({
							src: file.path,
							dst: largeName,
							quality: 85,
							width: dimensions.width,
							height: dimensions.height
						})
					})
					.then(function () {
						results.large = body.path + "/large_" + body.name

						return easyimg.resize({
							src: file.path,
							dst: smallName,
							quality: 25,
							width: dimensions.width / 4,
							height: dimensions.height / 4
						})
					})
					.then(function () {

						results.small = body.path + "/small_" + body.name

						return
					})
					.then(function () {

						createItemObject(function (err) {

							if (err) {
								return errorOut(err)
							}

							fs.unlink(largeName)
							fs.unlink(Utils.tempDir + "/" + body.name)

							createItemObject(function (err) {

								if (err) {
									return errorOut(err)
								}

								fs.unlink(smallName)

								createItemObject(function (err) {

									if (err) {
										return errorOut(err)
									}

									fs.unlink(thumbName)

									return respond({
										status: 200,
										success: true,
										result: results
									})
								}, body.path + "thumb_" + body.name, fs.readFileSync(thumbName))
							}, body.path + "small_" + body.name, fs.readFileSync(smallName))
						}, body.path + "large_" + body.name, fs.readFileSync(largeName) )
					})
					.catch(function (e) {
						respond({ status: 500, message: e })
					})
			})
		})
	})
}