const axios = require('axios')
const qs = require('querystring')

const url = 'http://api.hellotrue.com/api/do.php'

function login(apiUser, password) {
	return axios.post(url, qs.stringify({ action: 'loginIn', name: apiUser, password })).then(res => {
		let data = res.data.split('|')
		if (+data[0]) {
			return { code: +data[0], token: data[1] }
		} else {
			return { code: +data[0], msg: data[1] }
		}
	})
}

function getPhone({ sid, token, locationMatching, locationLevel, location, phone, phoneType }) {
	return axios.post(url, qs.stringify({ action: 'getPhone', ...arguments[0] })).then(res => {
		let data = res.data.split('|')
		if (+data[0]) {
			return { code: +data[0], phone: data[1] }
		} else {
			return { code: +data[0], msg: data[1] }
		}
	})
}

function getMessage({ sid, token, phone, author }) {
	return axios.post(url, qs.stringify({ action: 'getMessage', ...arguments[0] })).then(res => {
		let data = res.data.split('|')
		if (+data[0]) {
			return { code: +data[0], content: data[1] }
		} else {
			return { code: +data[0], msg: data[1] }
		}
	})
}

function putSentMessage({ sid, token, phone, author, message }) {
	return axios.post(url, qs.stringify({ action: 'putSentMessage', ...arguments[0] })).then(res => {
		let data = res.data.split('|')
		if (+data[0]) {
			return { code: +data[0], content: data[1], message: data[2] }
		} else {
			return { code: +data[0], msg: data[1] }
		}
	})
}

function addBlacklist({ sid, token, phone }) {
	return axios.post(url, qs.stringify({ action: 'addBlacklist', ...arguments[0] })).then(res => {
		let data = res.data.split('|')
		if (+data[0]) {
			return { code: +data[0], content: data[1] }
		} else {
			return { code: +data[0], msg: data[1] }
		}
	})
}

function cancelRecv({ sid, token, phone }) {
	return axios.post(url, qs.stringify({ action: 'cancelRecv', ...arguments[0] })).then(res => {
		let data = res.data.split('|')
		if (+data[0]) {
			return { code: +data[0], content: data[1] }
		} else {
			return { code: +data[0], msg: data[1] }
		}
	})
}

function getSentMessageStatus({ sid, token, phone }) {
	return axios.post(url, qs.stringify({ action: 'getSentMessageStatus', ...arguments[0] })).then(res => {
		let data = res.data.split('|')
		if (+data[0]) {
			return { code: +data[0], content: data[1] }
		} else {
			return { code: +data[0], msg: data[1] }
		}
	})
}

function cancelAllRecv(token) {
	return axios.post(url, qs.stringify({ action: 'cancelAllRecv', token })).then(res => {
		let data = res.data.split('|')
		if (+data[0]) {
			return { code: +data[0], content: data[1] }
		} else {
			return { code: +data[0], msg: data[1] }
		}
	})
}

function getSummary(token) {
	return axios.post(url, qs.stringify({ action: 'getSummary', token })).then(res => {
		let data = res.data.split('|')
		if (+data[0]) {
			return { code: +data[0], balance: data[1], level: data[2], maxPhone: data[3], userType: data[4] }
		} else {
			return { code: +data[0], msg: data[1] }
		}
	})
}

module.exports = {
	login,
	getPhone,
	getMessage,
	putSentMessage,
	addBlacklist,
	cancelRecv,
	cancelAllRecv,
	getSentMessageStatus,
	getSummary
}
