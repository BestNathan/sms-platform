const api = require('./ilz-api')
const { sleep } = require('./util')

class Ilz {
	constructor({ username, password, author = 'a308719298', querySleep = 3000, queryTimes = 40, sid }) {
		if (!username || !password || !sid) {
			throw new Error('username, password and sid are required')
        }
        if (!~username.indexOf('api')) {
            throw new Error('username must be an api-username')
        }
		this.username = username
		this.password = password
		this.sid = sid
		this.author = author
		this.querySleep = querySleep
		this.queryTimes = queryTimes
		this.token = null
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
		this.logined = true
		this.token = res.token
		res = await api.getSummary(this.token)
		if (!res.code) {
			throw new Error(res.msg)
		}

		return res
	}
	async getPhone({ phone, location, phoneType } = {}) {
		if (!this.logined) {
            throw new Error('invoke login first')
        }
		let options = { sid: this.sid, phone, phoneType }
		if (location) {
			if (~location.indexOf('市')) {
				options.locationLevel = 'c'
				location = location.replace('市', '')
			} else {
				options.locationLevel = 'p'
				location = location.replace('省', '')
			}
			options.locationMatching = 'include'
			options.location = location
		}

		let res = await api.getPhone(options)
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
			res = await api.getMessage({ sid: this.sid, phone, token: this.token, author: this.author })
			if (res.code) {
				return res.content
			}
			times++
		}
		await this.invokeOpration({ addBlacklist: true, phone })
		throw new Error('overtime')
	}
	async sendMessageAndGetStatus({ phone, message }) {
		if (!this.logined) {
            throw new Error('invoke login first')
        }
		let res,
			times = 0
		res = await api.putSentMessage({ sid: this.sid, token: this.token, phone, author: this.author, message })
		if (!res.code) {
			throw new Error(res.msg)
		}

		while (times < this.queryTimes) {
			await sleep(this.querySleep)
			res = await api.getSentMessageStatus({ sid: this.sid, phone, token: this.token })
			if (res.code) {
				return res.content
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
			await api.cancelRecv({ sid: this.sid, token: this.token, phone })
		}

		if (addBlacklist && phone) {
			await api.addBlacklist({ sid: this.sid, token: this.token, phone })
		}

		if (cancelAll) {
			await api.cancelAllRecv(this.token)
		}
	}
}

module.exports = Ilz