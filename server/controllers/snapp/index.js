/* controllers/auth/index.js */
'use strict';
const RESPOND = global.E.Respond;
const puppeteer = require('puppeteer')

const capture = function capture(req, res) {
	const path = req.path;
	const url = req.body.url;
	const opts = req.body.opts;

	takeScreenShot(url, (err,screenshot) => {
		console.log('screenshot', screenshot)
		if(err) {
			// TODO: handle errors
			let wrapper = RESPOND.wrapSuccessData({
				"message": "Capture take to " + url,
			}, path, true);
			return RESPOND.success(res, req, wrapper);
		} else {
			var img = Buffer.from(screenshot, 'base64');
			res.writeHead(200, {
				'Content-Type': 'image/png',
				'Content-Length': img.length
			});
			res.end(img);
		}

	})
};

async function takeScreenShot(url, callback) {
	try {
		const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
		const page = await browser.newPage();
		await page.goto(url);
		const screenshot =  await page.screenshot({fullPage: true});
		await browser.close();
		callback(false, screenshot)
	} catch (error) {
		callback(error);
	}
}

module.exports = {
	capture
}
