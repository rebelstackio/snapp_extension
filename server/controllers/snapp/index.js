/* controllers/snapp/index.js */
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
	const user = req.body.user;
	console.log('**> user: ', user.id);
	// TODO: handle options
	const opts = req.body.opts;
	console.log('starting capture to: ', url)
	takeScreenShot(url, (err,screenshot) => {
		if(err) {
			console.error(err);
			return RESPOND.serverError(res, req, err);
		} else {
			const dir = saveFile(screenshot, url, user);
			console.log('file saved to: ', dir);
			seed(dir, (magnet) => {
				console.log('seeding file to this magnet: ', magnet)
				let wrapper = RESPOND.wrapSuccessData({
					"message": "Capture take to " + url,
					"magnet": magnet
				}, path, true);
				console.log('send the response to client')
				return RESPOND.success(res, req, wrapper);
			})
		}

	})
};

/**
 * Save the capture to filesystem hashed to time stampt
 * @param {Buffer} buffer img buffer
 * @param {String} url URL from
 */
function saveFile(buffer, url, user) {
	const _bdir = global._baseDir + '/snapps/';
	const _udir = `${_bdir}${user.id}-${Buffer.from(user.email).toString('base64')}/`;
	let fileName = crypt(Date.now() + url) + '.png';
	const dir = _udir + fileName;
	if (!fs.existsSync(_bdir)) {
		fs.mkdirSync(_bdir)
	}
	if(!fs.existsSync(_udir)) {
		fs.mkdirSync(_udir);
	}
	fs.writeFileSync(dir,buffer, 'buffer');
	return dir;
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
function seed(url, callback) {
	console.log('seeding')
	client.seed(url, false, (t) => {
		callback(t.magnetURI)
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
