const http = require('http')
const sanitize = require("./lib/sanitize")
const multiparty = require('multiparty')

console.log(process.env.NODE_ENV, new Date())


/* SET CONTROLLERS */

const controllers = {
	image: require("./controllers/image"),
	imageServe: require("./controllers/image.serve"),
	sphere: require("./controllers/sphere"),
	sphereUrl: require("./controllers/sphere-url"),
	sphereUrlB64: require("./controllers/sphere-url-b64"),
	variants: require("./controllers/variants")
};



var routes = {
	"get": {
		"/v1/image": "imageServe",
		"/v1/variants": "variants"
	},

	"post": {
		"/v1/image": "image",
		"/v1/sphere": "sphere",
		"/v1/sphere-url": "sphereUrl",
		"/v1/sphere-url-b64": "sphereUrlB64",
		"/v1/variants": "variants"
	}
}



/* SINCE RESTIFY AND EXPRESS WON'T PASS SECOPS, ROLLING OWN */

function parseQuery(url) {
	var query = url.split("?")[1]

	if (query) {
		let _query = query.split("&")
		query = {}

		_query.forEach(function (element) {
			let elements = element.split("=")
			if (elements[0]) {
				query[elements[0]] = elements[1] === undefined ? true : elements[1]
			}
		}, this)

		query = sanitize.object(query)

		return query
	}

	return {}
}

function parseBody(body) {
	body = body.replace(/</g, "&lt;").replace(/>/g, "&gt;")
	try {
		body = JSON.parse(body)
	} catch (e) {

		if (typeof body === "string") {

			var _body = body.split("&")
			body = {}

			_body.forEach(function (el) {
				el = el.split("=")
				body[el[0]] = el[1]
			})
		} else {
			body = {}
		}
	}

	return sanitize.object(body)
}

function handleRequest(res, headers, url, method, body, params, query, files) {
	if (!controllers[routes[method][url]]) {
		return require("./controllers/status")(res)
	}

	controllers[
		routes[method][url]
	](res, headers, body, query, params, files)
}

var server = http.createServer().listen(13463);

server.on("request", (req, res) => {
	var url = sanitize.url(req.url)
	var headers = sanitize.object(req.headers)
	var method = sanitize.string(req.method.toLowerCase())
	var query = parseQuery(url)
	let body = ''
	var params = {}
	var files = {}
	url = url.split("?")[0]

	if (method === "get" && url.includes("/v1/image/")) {
		let urlParts = url.split("/v1/image/")
		params.url = urlParts[1]
		url = "/v1/image"
	}

	if (headers["content-type"] && headers["content-type"].split("multipart/form-data; boundary=")[1]) {
		var form = new multiparty.Form();
		form.parse(req, function (err, fields, files) {
			handleRequest(res, headers, url, method, fields, params, query, files)
		});

	} else {

		req.on('error', (err) => {

			res.statusCode = 500;
			res.write(JSON.stringify({
				success: false,
				message: err
			}));
			res.end();

		}).on('data', (chunk) => {

			body += chunk

		}).on('end', () => {
			body = parseBody(body)

			handleRequest(res, headers, url, method, body, params, query, files)
		})
	}

})