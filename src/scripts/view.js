let client = null;

document.addEventListener('DOMContentLoaded', () => {
	client = new WebTorrent();
	chrome.storage.sync.get(['magnets'], (data) => {
		const { magnets } = data;
		fillWithMagnets(magnets);
	});
})


/**
 * 
 * @param {Array} magnets 
 */
async function fillWithMagnets(magnets) {
	const _body = document.querySelector('#main-view');
	magnets.forEach(async (mg, i) => {
		const file = await addTorrent(mg);
		file.getBlobURL((error,blob) => {
			if(error) throw error
			appendImg(blob, mg);
		})
		
	});
}


/**
 * download, seed and append the image from magnet
 * @param {String} magnetID MagnetURL
 */
function addTorrent(magnetID) {
	return new Promise((resolve, reject) => {
		try {
			client.add(magnetID, (_t) => {
				resolve(
					_t.files.find(function (file) {
						return file.name.endsWith('.png')
					})
				)
			})
		} catch (error) {
			reject(error)
		}
	})
}
/**
 * append the downloaded image
 * @param {String} urlBlob URLBLOB
 * @param {String} magnet MagnetURL
 */
function appendImg(urlBlob, magnet) {
	const box = Div({className: 'img-box'}, [
		Img({ src: urlBlob }),
		Div({}, [
			Button({onclick: share(magnet)}, 'Share'),
			Button({onclick: download(urlBlob)}, 'Download')
		])
	]);
	const body = document.querySelector('#main-view');
	body.appendChild(box);
}
/**
 * Copy the magnet url to the clipboard
 * @param {String} magnet MagnetURL
 */
function share(magnet) {
	return () => {
		const _input = HTMLElementCreator('input',{ value: magnet });
		document.body.appendChild(_input);
		_input.select();
		_input.setSelectionRange(0, 99999);
		document.execCommand("copy");
		_input.remove();
	}
}
/**
 * Download image from urlblob
 * @param {String} urlBlob blob url
 */
function download(urlBlob) {
	return () => {
		const _d = new Date().toDateString();
		chrome.downloads.download({
			url: urlBlob,
			filename: "snapp_downloads/"+_d+"-snapp.capture.png"
		});
	}
}