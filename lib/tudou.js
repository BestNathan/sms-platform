const api = require('./tudou-api')
const { sleep } = require('./util')

class Tudou {
	constructor({ username, password, author = 'a308719298', querySleep = 3000, queryTimes = 40, pid, channelId }) {
		if (!username || !password || !pid) {
			throw new Error('username, password and pid are required')
		}

		this.username = username
		this.password = password
		this.pid = pid
		this.channelId = channelId
		this.author = author
		this.querySleep = querySleep
		this.queryTimes = queryTimes
		this.token = null
		this.uid = null
		this.logined = false
	}
	setAuthor(author) {
		this.author = author
	}
	async login() {
		let res = await api.login(this.username, this.password)
		if (!res.code) {
			throw new Error(res.msg)
		}

		this.token = res.token
		this.uid = res.uid
		this.logined = true
		return res
	}
	async getPhone({ phone, province, type, nonVirtual } = {}) {
		if (!this.logined) {
			throw new Error('invoke login first')
		}
		let res = await api.getMobilenum({
			uid: this.uid,
			pid: this.pid,
			token: this.token,
			assgin: phone,
			type,
			province,
			channelId: this.channelId,
			nonVirtual
		})

		if (res.code) {
			return res.phone + ''
		} else {
			throw new Error(res.msg)
		}
	}
	async getMessage(phone) {
		if (!this.logined) {
			throw new Error('invoke login first')
		}
		if (!phone) {
			throw new Error('phone is required')
		}

		let res,
			times = 0
		while (times < this.queryTimes) {
			await sleep(this.querySleep)
			res = await api.getVcodeAndReleaseMobile({
				uid: this.uid,
				pid: this.pid,
				channelId: this.channelId,
				mobile: phone,
				token: this.token,
				author_uid: this.author
			})
			if (res.code) {
				return res.content
			}
			times++
		}
		await this.invokeOpration({ addBlacklist: true, phone })
		throw new Error('overtime')
	}
	async sendMessageAndGetStatus({ phone, sms }) {
		if (!this.logined) {
			throw new Error('invoke login first')
		}
		let res,
			times = 0
		res = await api.sendSms({
			uid: this.uid,
			pid: this.pid,
			token: this.token,
			phone,
			author_uid: this.author,
			sms,
			channelId: this.channelId
		})
		if (!res.code) {
			throw new Error(res.msg)
		}

		while (times < this.queryTimes) {
			await sleep(this.querySleep)
			res = await api.getVcodeAndReleaseMobile({
				uid: this.uid,
				pid: this.pid,
				channelId: this.channelId,
				mobile: phone,
				token: this.token,
				author_uid: this.author
			})
			if (res.code) {
				return res.msg
			}
			times++
		}
		await this.invokeOpration({ addBlacklist: true, phone })
		throw new Error('overtime')
	}
	async invokeOpration({ phone, cancelPhone = false, addBlacklist = false, cancelAll = false }) {
		if (!this.logined) {
			throw new Error('invoke login first')
		}
		if (cancelPhone && phone) {
			await api.cancelSMSRecv({ uid: this.uid, token: this.token, mobile: phone, channelId: this.channelId })
		}

		if (addBlacklist && phone) {
			await api.addIgnoreList({
				pid: this.pid,
				uid: this.uid,
				token: this.token,
				mobiles: phone,
				channelId: this.channelId
			})
		}

		if (cancelAll) {
			await api.cancelSMSRecvAll({ uid: this.uid, token: this.token, channelId: this.channelId })
		}
	}
}

module.exports = Tudou
