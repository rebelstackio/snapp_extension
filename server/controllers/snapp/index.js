/* controllers/auth/index.js */
'use strict';
const RESPOND = global.E.Respond;
const puppeteer = require('puppeteer');
const fs = require('fs');
const crypto = require('crypto');
const wtorrent = require('webtorrent-hybrid');

const client = new wtorrent();

const capture = function capture(req, res) {
	const path = req.path;
	const url = req.body.url;
	const opts = req.body.opts;

	takeScreenShot(url, (err,screenshot) => {
		//console.log('screenshot', screenshot)
		if(err) {
			// TODO: handle errors
			let wrapper = RESPOND.wrapSuccessData({
				"message": "Capture take to " + url,
			}, path, true);
			return RESPOND.success(res, req, wrapper);
		} else {

			var img = Buffer.from(screenshot, 'base64');
			saveToStampt(screenshot, url);
			res.writeHead(200, {
				'Content-Type': 'image/png',
				'Content-Length': img.length
			});
			res.end(img);
		}

	})
};

/**
 * Save the capture to filesystem hashed to time stampt
 * @param {Buffer} buffer img buffer
 * @param {String} url URL from
 */
function saveToStampt(buffer, url) {
	let fileName = crypt(Date.now() + url) + '.png';
	const dir = global._baseDir + '/snapps/' + fileName;
	fs.writeFile(dir,buffer, 'buffer',(err) => {
		if(err) throw err
		seed(dir);
	})
}
/**
 * hash the file name from the url taken and date
 * @param {String} string filename
 */
function crypt(string) {
	return crypto.createHash('md5').update(string).digest('hex');
}
/**
 * use webtorrent to seed the image
 * @param {String} url URL from filesystem
 */
function seed(url) {
	console.log(wtorrent.WEBRTC_SUPPORT);
	client.seed(url, false, (t) => {
		console.log(t.magnetURI)
	})
}

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
