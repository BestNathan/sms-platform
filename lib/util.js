const sleep = function(sleep) {
	return new Promise(resolve => {
		setTimeout(() => {
			resolve('')
		}, sleep)
	})
}

module.exports = {
    sleep
}