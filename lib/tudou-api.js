const axios = require('axios')
const qs = require('querystring')

const baseUrl = 'http://www.6tudou.com:9000/devapi/'
const isPhone = /^[1][0-9]{10}$/

const err = {
	nodata: 'No_Data',
	yescan: 'Yes_Can',
	nocan: 'No_Can',
	notexist: 'No_Exist',
	nodataMsg: 'no_data'
}

const getMsg = data => {
	let msg
	switch (data) {
		case err.nodata:
			msg = '没有可用号码'
			break
		case err.nocan:
			msg = '号码不可用'
			break
		case err.notexist:
			msg = '号码不存在'
			break
		case err.nodataMsg:
			msg = '未获取到验证码'
			break
		default:
			msg = data
			break
	}
	return msg
}

const isSendSms = data => {
	return ['sending', 'ok', 'fail'].includes(data)
}

const sendStatus = {
	sending: 'sending',
	ok: 'ok',
	fail: 'fail'
}

const getSendMsg = data => {
	let msg
	switch (data) {
		case sendStatus.sending:
			msg = '发送中'
			break
		case sendStatus.fail:
			msg = '发送失败'
			break
		default:
			msg = data
			break
	}
	return msg
}

function login(username, password) {
	let url = baseUrl + 'loginIn'
	return axios.post(url, qs.stringify({ uid: username, pwd: password })).then(res => {
		let data = res.data
		if (typeof data === 'string') {
			return { code: 0, msg: data }
		} else {
			let result = {}
			for (let key in data) {
				result[key.toLowerCase()] = data[key]
			}
			result.token = decodeURIComponent(result.token)
			result.code = 1
			return result
		}
	})
}

function getMobilenum({ uid, pid, token, assgin, type, province, channelId, nonVirtual }) {
	let url = baseUrl + 'getMobilenum'
	return axios.post(url, qs.stringify(arguments[0])).then(res => {
		let data = res.data
		if (isPhone.test(data)) {
			return { code: 1, phone: data }
		} else if (data === err.yescan) {
			return { code: 1, phone: assgin }
		} else {
			let msg = getMsg(data)
			return { code: 0, msg }
		}
	})
}

function getVcodeAndHoldMobilenum({ mobile, uid, pid, token, next_pid, author_uid, channelId }) {
	let url = baseUrl + 'getVcodeAndHoldMobilenum'
	return axios.post(url, qs.stringify(arguments[0])).then(res => {
		let data = res.data
		if (~data.indexOf('|')) {
			data = data.split('|')
			let status = data[0]
			let content = data[1]
			if (status === err.yescan) {
				return { code: 1, phone: mobile, content }
			} else {
				let msg = getMsg(status)
				return { code: 1, msg, content }
			}
		} else {
			let msg = getMsg(data)
			return { code: 0, msg }
		}
	})
}

function getVcodeAndReleaseMobile({ mobile, uid, pid, token, author_uid, channelId }) {
	let url = baseUrl + 'getVcodeAndReleaseMobile'
	return axios.post(url, qs.stringify(arguments[0])).then(res => {
		let data = res.data
		if (~data.indexOf('|')) {
			data = data.split('|')
			let phone = data[0]
			let content = data[1]
			return { code: 1, phone, content }
		} else if (isSendSms(data)) {
			if (data === sendStatus.ok) {
				return { code: 1, msg: '发送成功' }
			} else {
				return { code: 0, msg: getSendMsg(data) }
			}
		} else {
			let msg = getMsg(data)
			return { code: 0, msg }
		}
	})
}

function sendSms({ phone, uid, pid, token, sms, author_uid, channelId }) {
	let url = baseUrl + 'sendSms'
	return axios.post(url, qs.stringify(arguments[0])).then(res => {
		let data = +res.data
		let msg
		switch (data) {
			case -1:
				data = 0
				msg = '非发送短信项目'
				break
			case 0:
				msg = '发送失败'
				break
			case 1:
				msg = '发送成功'
				break
			default:
				msg = '发送失败'
				break
		}
		return { code: data, msg }
	})
}

function addIgnoreList({ pid, mobiles, uid, token, channelId }) {
	let url = baseUrl + 'addIgnoreList'
	return axios.post(url, qs.stringify(arguments[0])).then(res => {
		let data = +res.data
		if (data > 0) {
			return { code: 1 }
		} else {
			return { code: 0 }
		}
	})
}

function cancelSMSRecv({ mobile, uid, token, channelId }) {
	let url = baseUrl + 'cancelSMSRecv'
	return axios.post(url, qs.stringify(arguments[0])).then(res => {
		if (res.data) {
			return { code: 1 }
		} else {
			return { code: 0 }
		}
	})
}

function cancelSMSRecvAll({ uid, token, channelId }) {
	let url = baseUrl + 'cancelSMSRecvAll'
	return axios.post(url, qs.stringify(arguments[0])).then(res => {
		if (res.data) {
			return { code: 1 }
		} else {
			return { code: 0 }
		}
	})
}

module.exports = {
	login,
	getMobilenum,
	getVcodeAndHoldMobilenum,
	getVcodeAndReleaseMobile,
	sendSms,
	addIgnoreList,
	cancelSMSRecv,
	cancelSMSRecvAll
}
