chrome.runtime.onInstalled.addListener(function() {
	chrome.storage.sync.set({color: '#3aa757'}, function() {
		console.log("The color is green. of what?");
	});
	chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
		chrome.declarativeContent.onPageChanged.addRules([{
			actions: [new chrome.declarativeContent.ShowPageAction()]
		}]);
	});
	chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
		let url = tabs[0].url;
		console.log(url);
		// use `url` here inside the callback because it's asynchronous!
	});
});