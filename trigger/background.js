chrome.runtime.onInstalled.addListener(function() {
    chrome.storage.sync.set({
        censorWords: false,
        categories: {
            "Violence": true,
            "Sexual": true,
            "Substance": false,
            "Self Harm": false
        }
    }, function() {
        console.log('Initial settings saved');
    });
});
