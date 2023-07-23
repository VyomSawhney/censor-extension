chrome.storage.sync.get({
    categoryStates: {},
    triggerWords: {}
}, function(items) {
    let categoryStates = items.categoryStates;
    let triggerWords = items.triggerWords;
    warnPage(triggerWords, categoryStates);
});

function warnPage(triggerWords, categoryStates) {
    let bodyText = document.body.innerText;
    let triggeredCategories = [];

    for (let category in triggerWords) {
        if (categoryStates[category]) {
            for (let i = 0; i < triggerWords[category].length; i++) {
                let word = triggerWords[category][i];
                let wordRegex = new RegExp('\\b' + word + '\\b', 'gi');
                if (bodyText.match(wordRegex)) {
                    if (!triggeredCategories.includes(category)) {
                        triggeredCategories.push(category);
                    }
                }
            }
        }
    }

    if (triggeredCategories.length > 0) {
        blurPage(triggerWords, categoryStates, triggeredCategories);
    }
}

function blurPage(triggerWords, categoryStates, categories) {
    let overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
    overlay.style.zIndex = '100000';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.flexDirection = 'column';

    let warning = document.createElement('h1');
    warning.textContent = 'TW: ' + categories.join(', ');
    warning.style.marginBottom = '20px';
    warning.style.fontSize = '3em';
    warning.style.fontWeight = 'bold';

    let returnButton = document.createElement('button');
    returnButton.textContent = 'Return';
    returnButton.onclick = function() {
        history.back();
    };
    returnButton.style.margin = '10px';

    let continueButton = document.createElement('button');
    continueButton.textContent = 'Continue Anyway';
    continueButton.onclick = function() {
        document.body.removeChild(overlay);
    };
    continueButton.style.margin = '10px';

    let continueWithCensorButton = document.createElement('button');
    continueWithCensorButton.textContent = 'Continue with Censor';
    continueWithCensorButton.onclick = function() {
        document.body.removeChild(overlay);
        censorPage(triggerWords, categoryStates);
    };
    continueWithCensorButton.style.margin = '10px';

    overlay.appendChild(warning);
    overlay.appendChild(returnButton);
    overlay.appendChild(continueButton);
    overlay.appendChild(continueWithCensorButton);

    document.body.appendChild(overlay);
}

function censorPage(triggerWords, categoryStates) {
    let bodyText = document.body.innerText;
    for (let category in triggerWords) {
        if (categoryStates[category]) {
            for (let i = 0; i < triggerWords[category].length; i++) {
                let word = triggerWords[category][i];
                let wordRegex = new RegExp('\\b' + word + '\\b', 'gi');
                if (bodyText.match(wordRegex)) {
                    censorWord(word);
                }
            }
        }
    }
}

function censorWord(word) {
    let wordRegex = new RegExp('\\b' + word + '\\b', 'gi');
    document.body.innerHTML = document.body.innerHTML.replace(wordRegex, '*'.repeat(word.length));
}
