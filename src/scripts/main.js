const ActionBTN = Button({
	className: 'action-btn',
	onclick: () => {
		chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
			let url = tabs[0].url;
			console.log(url);
			takeCapture(url)
		});
	}
}, 'Capture');

function Input(props = {}, content = false) {
	if (content) props.content = content;
	return HTMLElementCreator('input', props)
}

ActionBTN.onStoreEvent('ON_LOADING', (state, el) => {
	el.setAttributes({disabled: ''})
	el.classList.add('loading');
	el.innerHTML = ''
});

ActionBTN.onStoreEvent('OFF_LOADING', (state, el) => {
	el.removeAttribute('disabled')
	el.innerHTML = 'Capture';
	el.classList.remove('loading');
});

const OPTS = Div({className: 'opt-box'},[
	Label({attributes: {for: 'secs'}}, 'Wait Time in Secconds'),
	Input({attributes: {name: 'secs', placeholder: 'secs', value: '0'}})
])

document.addEventListener('DOMContentLoaded', () => {
	console.log('excuted');
	const wrapper = document.querySelector('#main-content');
	wrapper.Div({className: 'action-wrapper'},[
		H2({}, 'Snapp'),
		ActionBTN,
		OPTS
	])
})

/**
 * 
 * @param {String} url url you want to fetch (default the tab you're)
 * @param {*} options 
 */
async function takeCapture(url, options = false) {
	try {
		window.storage.dispatch({type: 'ON_LOADING'})
		// TODO: set server url as env variable
		const _f = await fetch('http://localhost:8888/api/v1/capture',{
			method: 'POST',
			body: JSON.stringify({url,options}),
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			}
		});
		const resObj = await _f.json()
		const { magnet } = resObj.data;
		console.log(magnet);
		chrome.storage.sync.get(['magnets'], (data) => {
			data.magnets.push(magnet);
			console.log(data);
			chrome.storage.sync.set({magnets: data.magnets})
		});
		openViewer();
		window.storage.dispatch({type: 'OFF_LOADING'})
	} catch (error) {
		console.error('popup.takeCaputre Error: ', error)
	}
}

function openViewer() {
	chrome.tabs.create({url: chrome.extension.getURL('/src/viewer.html')});
}

function download() {
			/*
		const _img = await _f.blob()
		const outside = URL.createObjectURL(_img)
		const _d = new Date().toDateString();
		chrome.downloads.download({
			url: outside,
			filename: "snapp_downloads/"+_d+"-snapp.capture.png"
		});

		URL.revokeObjectURL(url);
		*/
}