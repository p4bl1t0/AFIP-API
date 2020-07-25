'use strict';

var _ = require('lodash'),
	soap = require('soap'),
	WSAA = require('./helpers/wsaa'),
	AfipURLs = require('./helpers/urls');


class Afip {

	constructor(production) {
		this.clients = {};
		this.AfipURLs = new AfipURLs(production); 
		this.wsaa = new WSAA(production);
	}

	createClientForService(service) {
		return new Promise((resolve, reject) => {
			if (this.clients[service]) {
				resolve(this.clients[service]);
			} else {
				soap.createClient(this.AfipURLs.getService(service), (err, client) => {
					if (err && !client) {
						reject(err);
					} else {
						this.clients[service] = client;

						resolve(client);
					}
				});
			}
		});
	}

	recreate_token(req, res) {
		var service = req.params.service;

		this.wsaa.generateToken(service)
			.then((tokens) => res.json(tokens))
			.catch((err) => {
				res.json({
					result: false,
					err: err.message
				});
			});
	}

	endpoint(service, endpoint, body) {

		return this.wsaa.generateToken(service).then((tokens) => {

			return this.createClientForService(service).then((client) => {
				var params = {};

				params[`${body.auth.key}`] = {
					//Token: tokens.token,
					//Sign: tokens.sign
				};

				params[`${body.auth.key}`][`${body.auth.token}`] = tokens.token;
				params[`${body.auth.key}`][`${body.auth.sign}`] = tokens.sign;

				params = _.merge(params, body.params);

				// console.info(params);

				return new Promise(function(resolve, reject) {
					client[endpoint](params, (err, result) => {
						try {
							// console.log('Resultado ===============================');
							// console.log(JSON.stringify(result));
							// console.log(result);
							resolve(result);
						} catch (e) {
							// console.log('Error',e, err, result);
							reject(e, err, result);
						}
					});
				});
				//console.log(JSON.stringify(client.lastRequest));
			}).catch(err => {
				console.info(err);
				return Promise.reject(err);
			});

		}).catch((err) => {
			console.info(err);
			return Promise.reject(err);
		});
	}

	describe(req, res) {
		var service = req.params.service;

		WSAA.generateToken(service).then((tokens) => {

			this.createClientForService(service).then((client) => {
				res.json(client.describe());
			});

		}).catch((err) => {
			res.json({
				result: false,
				err: err.message
			});
		});
	}

}

module.exports = Afip;
