chrome.storage.sync.get({
    categoryStates: {},
    triggerWords: {}
}, function(items) {
    let categoryStates = items.categoryStates;
    let triggerWords = items.triggerWords;
    let categoriesDiv = document.getElementById('categories');
    let categorySelect = document.getElementById('category-select');
    let wordsList = document.getElementById('words-list');

    // Populate the existing categories
    for (let category in triggerWords) {
        createCategorySwitch(category);
        createCategoryOption(category);
    }

    // Add new category
    document.getElementById('add-category').onclick = function() {
        let newCategory = document.getElementById('new-category').value;

        if (newCategory && !(newCategory in triggerWords)) {
            triggerWords[newCategory] = [];
            categoryStates[newCategory] = true;
            chrome.storage.sync.set({
                categoryStates: categoryStates,
                triggerWords: triggerWords
            }, function() {
                createCategorySwitch(newCategory);
                createCategoryOption(newCategory);
                updateWordsList();
            });
        }

        document.getElementById('new-category').value = '';
    };

    // Add new word
    document.getElementById('add-word').onclick = function() {
        let selectedCategory = categorySelect.value;
        let newWord = document.getElementById('new-word').value;

        if (selectedCategory && newWord) {
            triggerWords[selectedCategory].push(newWord);
            chrome.storage.sync.set({triggerWords: triggerWords}, updateWordsList);
        }

        document.getElementById('new-word').value = '';
    };

    // Remove word
    document.getElementById('remove-word').onclick = function() {
        let selectedCategory = categorySelect.value;
        let selectedWord = wordsList.value;

        if (selectedCategory && selectedWord) {
            let index = triggerWords[selectedCategory].indexOf(selectedWord);

            if (index > -1) {
                triggerWords[selectedCategory].splice(index, 1);
                chrome.storage.sync.set({triggerWords: triggerWords}, updateWordsList);
            }
        }
    };

    // Remove category
    document.getElementById('remove-category').onclick = function() {
        let selectedCategory = categorySelect.value;

        if (selectedCategory) {
            delete triggerWords[selectedCategory];
            delete categoryStates[selectedCategory];
            chrome.storage.sync.set({triggerWords: triggerWords, categoryStates: categoryStates}, function() {
                // Remove the category switch
                document.getElementById(selectedCategory).remove();
                // Remove the category option
                let oldOption = categorySelect.querySelector(`option[value='${selectedCategory}']`);
                categorySelect.removeChild(oldOption);
                // Create a new select dropdown to force an update
                let newSelect = categorySelect.cloneNode(false);  // Don't clone children
                categorySelect.parentNode.replaceChild(newSelect, categorySelect);
                categorySelect = newSelect;

                // Remove words of the deleted category from the words list
                while (wordsList.firstChild) {
                    wordsList.removeChild(wordsList.firstChild);
                }
            });
        }
    };

    categorySelect.onchange = updateWordsList;

    function createCategorySwitch(category) {
        let categoryDiv = document.createElement('div');

        let switchLabel = document.createElement('label');
        switchLabel.className = 'switch';

        let switchInput = document.createElement('input');
        switchInput.type = 'checkbox';
        switchInput.checked = categoryStates[category];
        switchInput.onchange = function() {
            // Save the new setting when the switch is toggled
            categoryStates[category] = this.checked;
            chrome.storage.sync.set({categoryStates: categoryStates});
        };

        let switchSlider = document.createElement('span');
        switchSlider.className = 'slider round';

        switchLabel.appendChild(switchInput);
        switchLabel.appendChild(switchSlider);

        categoryDiv.textContent = category + ': ';
        categoryDiv.appendChild(switchLabel);

        categoriesDiv.appendChild(categoryDiv);
    }
    
    function createCategoryOption(category) {
        let option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
    }

    function updateWordsList() {
        let selectedCategory = categorySelect.value;
        wordsList.innerHTML = '';

        if (selectedCategory) {
            for (let i = 0; i < triggerWords[selectedCategory].length; i++) {
                let wordOption = document.createElement('option');
                wordOption.value = triggerWords[selectedCategory][i];
                wordOption.textContent = triggerWords[selectedCategory][i];
                wordsList.appendChild(wordOption);
            }
        }
    }

    // Initialize words list
    updateWordsList();
});
