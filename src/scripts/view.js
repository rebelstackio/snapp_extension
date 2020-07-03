let client = null;

document.addEventListener('DOMContentLoaded', () => {
	client = new WebTorrent();
	chrome.storage.sync.get(['magnets'], (data) => {
		const { magnets } = data;
		console.log('start filling the view')
		console.log('#> magnets size ', magnets.length);
		fillWithMagnets(magnets);
	});
	chrome.runtime.onMessage.addListener(onMessage);
	handleSharedLing();
})
/**
 * handle message from new magnet if this tab is already open
 * @param {*} message 
 */
function onMessage(message) {
	console.log(message)
	fillWithMagnets([message.newMagnet])
}
/**
 * handle input shared link
 */
function handleSharedLing() {
	const _input = document.querySelector('.header > input');
	_input.addEventListener('keydown', (ev) => {
		if(ev.key === 'Enter') {
			if (_input.value !== ''){
				fillWithMagnets([_input.value]);
				chrome.storage.sync.get(['magnets'], (data) => {
					const {magnets} = data
					magnets.push(_input.value);
					_input.value = '';
					chrome.storage.sync.set({magnets})
				})
			}
		}
	})
}


/**
 * fill the view adding the magnets to webtorret
 * @param {Array} magnets 
 */
function fillWithMagnets(magnets) {
	const _body = document.querySelector('#main-view');
	magnets.forEach((mg) => {
		console.log('#> manget: ', mg)
		addTorrent(mg, (err, res) => {
			if(err) throw err;
			res.file.getBlobURL((error,blob) => {
				if(error) throw error
				console.log('file downloaded to blob url', blob)
				appendImg(blob, mg, res.peers);
			})
		});
		
	});
}


/**
 * download, seed and append the image from magnet
 * @param {String} magnetID MagnetURL
 */
function addTorrent(magnetID, callback) {
	console.log('start downloading')
	try {
		client.add(magnetID, (_t) => {
			callback(false,{
				file: _t.files.find(function (file) {
						console.log('file downloaded: ', file.name)
						return file.name.endsWith('.png')
					}
				),
				peers: _t.numPeers + 1 // +1 is this peer
			})
		})
	} catch (error) {
		callback(error)
	}
}

/**
 * append the downloaded image
 * @param {String} urlBlob URLBLOB
 * @param {String} magnet MagnetURL
 */
function appendImg(urlBlob, magnet, peers) {
	const box = Div({className: 'img-box'}, [
		Img({ src: urlBlob }),
		Div({className: 'expand-area', onclick: expandImg(urlBlob)},
			IconButton({}, 'src/img/icons/expand.svg')
		),
		Div({}, [
			Button({onclick: share(magnet)}, 'Share'),
			Button({onclick: download(urlBlob)}, 'Download'),
			Span({}, `Seeding: ${peers} ${peers > 1 ? 'peers' : 'peer'}`)
		])
	]);
	const body = document.querySelector('#main-view');
	body.appendChild(box);
	console.log('appended image to view')
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

function expandImg(urlBlob) {
	return (ev) => {
		const imgToExpand = document.querySelector(`img[src="${urlBlob}"`);
		const parentEl = imgToExpand.parentElement;
		const btnState = parentEl.classList.toggle('expanded');
		console.log(ev.target)
		const btnIcon = (ev.target instanceof HTMLImageElement)
			? ev.target
			: ev.target.firstElementChild;
		btnIcon.src = chrome.runtime.getURL(`src/img/icons/${btnState ? 'compress' : 'expand'}.svg`)
	}
}

/** helper components */
function IconButton(props, url) {
	props = Object.assign({}, props, { classList: ['incon-btn'] });
	if (!url) return Button(props)
	url = chrome.runtime.getURL(url);
	return Button( props, Img({src: url, className: 'icon-sm'}) )
}