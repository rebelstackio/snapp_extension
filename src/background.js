chrome.runtime.onInstalled.addListener(function() {
	chrome.storage.sync.set({magnets: []}, function() {
		console.log("init magnets");
	});
});