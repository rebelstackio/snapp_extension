
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
					// use `url` here inside the callback because it's asynchronous!
				});
			}
		}, 'camera')
	])
})

function takeCapture(url, options = false) {
	
}