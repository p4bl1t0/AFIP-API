'use strict';

var fs = require('fs'),
	soap = require('soap'),
	moment = require('moment'),
	xml2js = require('xml2js'),
	parseString = xml2js.parseString,
	ntpClient = require('ntp-client'),
	SignHelper = require('./SignHelper'),
	AfipURLs = require('./urls');

class Tokens {
	constructor(production) {
		if (global.keys && fs.existsSync(global.keys.private)) {
			console.log('global exist', global);
			this.privateKey = fs.readFileSync(global.keys.private, 'utf8');
			this.publicKey = fs.readFileSync(global.keys.public, 'utf8');
		}
		this.AfipURLs = new AfipURLs(production);
		console.log('url', this.AfipURLs.getWSAA());

		this.client = false;
		if (fs.existsSync(global.files.cache)) {
			// Do something
			this.cache = JSON.parse(fs.readFileSync(global.files.cache, 'utf8'));
			console.log('cache read', this.cache);
		} else {
			this.cache = {};
		}

		// this.cache = JSON.parse('{"wsfe":{"date":"2018-08-06T11:49:25.907Z","credentials":{"token":"PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9InllcyI/Pgo8c3NvIHZlcnNpb249IjIuMCI+CiAgICA8aWQgc3JjPSJDTj13c2FhaG9tbywgTz1BRklQLCBDPUFSLCBTRVJJQUxOVU1CRVI9Q1VJVCAzMzY5MzQ1MDIzOSIgZHN0PSJDTj13c2ZlLCBPPUFGSVAsIEM9QVIiIHVuaXF1ZV9pZD0iMjIyMzkyODYwMiIgZ2VuX3RpbWU9IjE1MzM1NTYxMDUiIGV4cF90aW1lPSIxNTMzNTk5MzY1Ii8+CiAgICA8b3BlcmF0aW9uIHR5cGU9ImxvZ2luIiB2YWx1ZT0iZ3JhbnRlZCI+CiAgICAgICAgPGxvZ2luIGVudGl0eT0iMzM2OTM0NTAyMzkiIHNlcnZpY2U9IndzZmUiIHVpZD0iU0VSSUFMTlVNQkVSPUNVSVQgMjAzMzA2OTQyNTUsIENOPXBhYmxvYm90dGEiIGF1dGhtZXRob2Q9ImNtcyIgcmVnbWV0aG9kPSIyMiI+CiAgICAgICAgICAgIDxyZWxhdGlvbnM+CiAgICAgICAgICAgICAgICA8cmVsYXRpb24ga2V5PSIyMDMzMDY5NDI1NSIgcmVsdHlwZT0iNCIvPgogICAgICAgICAgICA8L3JlbGF0aW9ucz4KICAgICAgICA8L2xvZ2luPgogICAgPC9vcGVyYXRpb24+Cjwvc3NvPgo=","sign":"c2JCfLbDPVdXFVVyPFFArIX2R9x5YpmEZYq5lN4KQrCLqx4OAsoeoRwZgXDlB9tme+LInh7+23NzDlX+uWyMD11BOTUAIO5sWIyjo7oKlTNhETQba56E9pqDda/ZlbCcaRC1U6dnGKJPQ+Xaq8zaem9ZicTPT3kcz9e5gA74IYo="}}}');
	}

	createClient() {
		return new Promise((resolve, reject) => {
			if (this.client) {
				resolve(this.client);
			} else {
				soap.createClient(this.AfipURLs.getWSAA(), (err, client) => {
					if (err && !client) {
						reject();
					} else {
						this.client = client;

						resolve(this.client);
					}

				});
			}
		});
	}

	isExpired(service) {
		try {
			if (this.cache[service] && this.cache[service].date) {
				if (typeof this.cache[service].date === 'string') {
					this.cache[service].date = new Date(this.cache[service].date);
				}
				var hours = Math.abs((new Date()) - this.cache[service].date) / 36e5;
				console.log('isExpired', hours, this.cache[service].date);
				return (hours > 12);
			} else {
				return true;
			}
		} catch (e) {
			return true;
		}
	}

	getCurrentTime() {
		return new Promise((resolve, reject) => {
			ntpClient.getNetworkTime("time.afip.gov.ar", 123, function (err, date) {
				if (err) {
					reject(err);
				} else {
					console.log("Current time: ", date);
					resolve(date);
				}
			});
		});
	}

	openssl_pkcs7_sign(data, callback) {
		console.log('openssl path', global.openssl_path);
		SignHelper.sign({
			content: data,
			key: global.keys.private,
			cert: global.keys.public,
			openssl_path: global.openssl_path
		}).catch(function (err) {
			console.log(err);
			callback(err);
		}).then(function (result) {
			callback(null, result);
		});
	}

	encryptXML(xml) {
		return new Promise((resolve) => {
			this.openssl_pkcs7_sign(xml, (err, enc) => {
				resolve(enc);
			});
		});
	}

	parseXML(data) {
		return new Promise((resolve, reject) => {
			parseString(data, {
				normalizeTags: true,
				normalize: true,
				explicitArray: false,
				attrkey: 'header',
				tagNameProcessors: [(key) => { return key.replace('soapenv:', ''); }]
			}, (err, res) => {
				if (err) reject(err);
				else resolve(res);
			});
		});
	}

	formatDate(date) {
		return moment(date).format().replace('-03:00', '');
	}

	generateCMS(service) {
		return new Promise((resolve, reject) => {
			this.getCurrentTime().then((date) => {
				var tomorrow = new Date();

				// add a day
				tomorrow.setDate(date.getDate() + 1);

				tomorrow.setMinutes(date.getMinutes() - 61);

				var xml = `<?xml version="1.0" encoding="UTF-8" ?><loginTicketRequest version="1.0"><header><uniqueId>{uniqueId}</uniqueId><generationTime>{generationTime}</generationTime><expirationTime>{expirationTime}</expirationTime></header><service>{service}</service></loginTicketRequest>`;

				xml = xml.replace('{uniqueId}', moment().format('X'));
				xml = xml.replace('{generationTime}', this.formatDate(date));
				xml = xml.replace('{expirationTime}', this.formatDate(tomorrow));
				console.log('expirationTime', tomorrow);
				xml = xml.replace('{service}', service);

				xml = xml.trim();

				this.encryptXML(xml).then(resolve).catch();
			});
		});
	}

	generateToken(service, refresh = false) {
		// Parse some of the Services
		if (service == 'wsfev1') {
			service = 'wsfe';
		}

		return new Promise((resolve, reject) => {
			console.log('generateToken', this.isExpired(service));
			if (this.isExpired(service) || refresh === true) {

				this.createClient().then((client) => {

					this.generateCMS(service).then((data) => {
						client.loginCms({
							in0: data
						}, (err, result, raw, soapHeader) => {
							this.parseXML(raw).then((res) => {
								if (res.envelope.body.logincmsresponse) {
									var xml_response = res.envelope.body.logincmsresponse.logincmsreturn;

									if (xml_response) {
										this.parseXML(xml_response).then((res) => {
											//console.info(res.loginticketresponse.header);
											var credentials = res.loginticketresponse.credentials;
	
											this.cache[service] = {
												date: new Date(),
												credentials: credentials
											};
											console.log('cache', JSON.stringify(this.cache));
											fs.writeFile(global.files.cache, JSON.stringify(this.cache), function(err) {
												if(err) {
													return console.log(err);
												}
												console.log("The file was saved!");
											}); 

											resolve(credentials);
										}).catch(reject);
									}
								} else {
									reject(res.envelope.body.fault);
								}
							}).catch(reject);
						});
					});

				});

			} else {
				resolve(this.cache[service].credentials);
			}

		});
	}
}

module.exports = Tokens;
