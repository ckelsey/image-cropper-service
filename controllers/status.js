module.exports = function (res) {
	res.statusCode = 200
	res.write(JSON.stringify({
		status: "OK"
	}))
	return res.end()
}