let __USER;
loading(true)

chrome.storage.sync.get(['auth'], (data) => {
	console.log(data);
	__USER = data.auth;
	loading()
})

/**
 * Main action button (capture)
 */
const ActionBTN = Button({
	className: 'action-btn',
	onclick: () => {
		chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
			let url = tabs[0].url;
			console.log(url);
			takeCapture(url, false, __USER)
		});
	}
}, 'Capture');
/**
 * on loading event
 */
ActionBTN.onStoreEvent('ON_LOADING', (state, el) => {
	el.setAttributes({disabled: ''})
	el.classList.add('loading');
	el.innerHTML = ''
});
/**
 * off loading event
 */
ActionBTN.onStoreEvent('OFF_LOADING', (state, el) => {
	el.removeAttribute('disabled')
	el.innerHTML = 'Capture';
	el.classList.remove('loading');
});
/**
 * Options box
 */
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
 * call capture server api
 * @param {String} url url you want to fetch (default the tab you're)
 * @param {*} options 
 */
async function takeCapture(url, options = false, user) {
	try {
		loading(true)
		// TODO: set server url as env variable
		const _f = await fetch('http://localhost:8888/api/v1/capture',{
			method: 'POST',
			body: JSON.stringify({url,options, user}),
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
		openViewer(magnet);
		loading();
	} catch (error) {
		console.error('popup.takeCaputre Error: ', error)
	}
}
/**
 * open viewer tab if exits or create it
 * @param {*} magnet new magnet (only when the tab is open to force download)
 */
function openViewer(magnet) {
	//chrome-extension://hmalcmnfldipejchinnanmnhlhgcmhlp/src/viewer.html
	chrome.tabs.getAllInWindow(null, (tabs) => {
		let isFound = false;
		for (var i = 0; i < tabs.length; i++) {
			const tab = tabs[i];
			if (tab?.title === 'Sanpps||Viewer') {
				isFound = true;
				chrome.tabs.update(tab.id, { active: true })
				chrome.tabs.sendMessage(tab.id, { newMagnet: magnet })
			}
		}
		if(!isFound) {
			chrome.tabs.create({url: chrome.extension.getURL('/src/viewer.html')});
		}
	});
}

/**
 * Loading state 
 * @param {Boolean} isLoading 
 */
function loading(isLoading = false) {
	window.storage.dispatch({type: isLoading ? 'ON_LOADING' : 'OFF_LOADING'})
}