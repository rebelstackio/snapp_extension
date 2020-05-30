/* routers/com/index.js */
'use strict';
const JSONValidator = require('@rebelstack-io/expressif').JSONValidator;
const Router = require('@rebelstack-io/expressif').Router;
const RX = require('@rebelstack-io/expressif').ReqValidator;
const sc = require('schemas/snapp');
const cc = require('controllers/snapp');

const AuthRouter = function AuthRouter(auth) {
	let jv = new JSONValidator(sc, { allErrors: true, jsonPointers: true });
	const routes = [
		{
			method: 'post', path: '/capture', rprivs: null, mwares: [cc.capture],
			rxvalid: RX.NOT_APP_JSON | RX.NOT_ACCEPT_JSON,
			validreq: 'capture'
		}
	];
	const router = new Router({}, auth, jv);
	router.addRoutes(routes);
	return router.router;
}

module.exports = AuthRouter;
