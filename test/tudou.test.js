const expect = require('chai').expect
const Tudou = require('../lib/tudou')

const username = 'a15512013807'
const password = 'zhangdage2011'
const author = username
const pid = '31820'

describe('tudou test', () => {
	let tudou

	describe('test instance', () => {
		it('should get an Error without username or password or pid', () => {
			try {
				new Tudou({ password, pid })
			} catch (e) {
				expect(e.message).to.be.include('required')
			}
		})
	})

	describe('test login', () => {
		it('should get info of the user', done => {
			tudou = new Tudou({ username, password, author, pid })
			tudou
				.login()
				.then(res => {
					expect(res)
						.to.be.an('object')
						.which.has.property('uid')
					done()
				})
				.catch(done)
		})

		it('should get an Error if not login first', done => {
			new Tudou({ username, password, author, pid }).getPhone().catch(e => {
                expect(e.message).to.be.include('first')
                done()
			})
		})
	})

	describe('test get phone', done => {
		let phone
		it('should get a phone number', done => {
			tudou
				.getPhone()
				.then(p => {
					expect(p).to.be.a('string')
					expect(p).to.be.lengthOf(11)
					phone = p
					return tudou.invokeOpration({ addBlacklist: true })
                })
                .then(res => done())
				.catch(done)
		})

		it('should get a phone that last test gets', done => {
			tudou
				.getPhone({ phone })
				.then(p => {
					expect(p).to.be.a('string')
					expect(p).to.be.lengthOf(11)
					expect(p).to.be.equal(phone)
					return tudou.invokeOpration({ addBlacklist: true })
                })
                .then(res => done())
				.catch(done)
		})
	})
})
