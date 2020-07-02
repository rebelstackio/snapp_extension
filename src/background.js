chrome.runtime.onInstalled.addListener(function() {
	chrome.storage.sync.set({magnets: []}, function() {
		console.log("init magnets");
	});
});

chrome.identity.getProfileUserInfo(function(user) {
	chrome.storage.sync.set({ auth: user }, () => {
		console.log('Set user: ', user.id, ' to storage');
	});
});