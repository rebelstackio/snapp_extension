
document.addEventListener('DOMContentLoaded', () => {
	console.log('excuted');
	const wrapper = document.querySelector('#main-content');
	wrapper.Div({},[
		H3({}, 'Snapp'),
		Button({
			onclick: () => {
				console.log('clicked');
				chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
					let url = tabs[0].url;
					console.log(url);
					takeCapture(url)
				});
			}
		}, 'camera')
	])
})
/**
 * 
 * @param {String} url url you want to fetch (default the tab you're)
 * @param {*} options 
 */
async function takeCapture(url, options = false) {
	try {
		// TODO: set server url as env variable
		const _f = await fetch('http://localhost:8888/api/v1/capture',{
			method: 'POST',
			body: JSON.stringify({url,options}),
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			}
		});
		const _img = await _f.blob()
		const outside = URL.createObjectURL(_img)
		console.log(outside)
		chrome.downloads.download({ url: outside }, (err) => {
			if (err) console.error(err)
		})
		//console.log(_img);
	} catch (error) {
		console.error('popup.takeCaputre Error: ', error)
	}
}