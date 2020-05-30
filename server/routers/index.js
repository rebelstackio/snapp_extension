/* routes/index.js */

function registerRouters(app) {

	app.use('/api/v1/', require('./snapp')());

};

module.exports = registerRouters;
