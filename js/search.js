import { API_BASE_URL } from './config.js';
import { showRecipeDetails } from './recipeDetails.js';

const recipeCardTemplate = document.getElementById('recipe-card-template');
const categoryItemTemplate = document.getElementById('category-item-template');

// parameters are all html elements
export function initSearch(searchInput, searchBtn, searchResults, categoriesList) {
    // search button gets passed in as an argument
    searchBtn.addEventListener('click', async () => {
        // searchinput is the text field, passed in as arg
        const query = searchInput.value.trim();
        // if value exists
        if (query) {
            // try catch api call
            try {
                // get all the data with that query
                const response = await fetch(`${API_BASE_URL}/search.php?s=${query}`);
                // classic await function
                const data = await response.json();
                // call a new function with meals from api response and specifically the meals from api response
                displaySearchResults(data.meals, searchResults);
                // error handling
            } catch (error) {
                console.error('Error searching recipes:', error);
                searchResults.innerHTML = '<p>Error searching recipes. Please try again.</p>';
            }
        }
    });

    searchInput.addEventListener('keypress', async (e) => {
        // same thing again could also change this to a function
        if (e.key === 'Enter') {
            const query = searchInput.value.trim();
            if (query) {
                try {
                    const response = await fetch(`${API_BASE_URL}/search.php?s=${query}`);
                    const data = await response.json();
                    displaySearchResults(data.meals, searchResults);
                } catch (error) {
                    console.error('Error searching recipes:', error);
                    searchResults.innerHTML = '<p>Error searching recipes. Please try again.</p>';
                }
            }
        }
    });

    // send the last param of THIS function (html element categoriesList) to loading them after search init has been done
    loadCategories(categoriesList);
}


// passed in html element categories-list (div)
async function loadCategories(categoriesList) {
    try {
        // get all categories
        const response = await fetch(`${API_BASE_URL}/categories.php`);
        const data = await response.json();
        // call new function with categories from api and pass in the list again
        displayCategories(data.categories, categoriesList);
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// passed in the categories from api response and html element (div)
function displayCategories(categories, categoriesList) {
    // empty it out if searching again
    categoriesList.innerHTML = '';
    // loop through categories array from api response
    categories.forEach(category => {
        // clone the html element category-item-template (just holds a div with data-category)
        const categoryElement = categoryItemTemplate.content.cloneNode(true);
        // choose div class name of the template
        const categoryItem = categoryElement.querySelector('.category-item');
        // set data-category attribute of the div to the category value from api response
        // "strCategory": "Beef",
        categoryItem.dataset.category = category.strCategory;
        // set text content of the div to the category value from api response
        categoryItem.textContent = category.strCategory;
        // add current clone of category element template into the categories list div as its own child div element
        categoriesList.appendChild(categoryElement);
    });

    // when clicking on any given category item
    categoriesList.addEventListener('click', async (e) => {
        // select data-category attribute of div that has been clicked on (category template copy)
        const category = e.target.dataset.category;
        // if category exists
        if (category) {
            // try catch api call with category value (for example "Beef")
            try {
                // get all recipes with specific category item (for example "Beef")
                const response = await fetch(`${API_BASE_URL}/filter.php?c=${category}`);
                const data = await response.json();
                const searchResults = document.getElementById('search-results');
                // call new function with the MEALS found with that specific category item, and pass in the search results div (this is below the categories)
                displaySearchResults(data.meals, searchResults);
            } catch (error) {
                console.error('Error searching by category:', error);
            }
        }
    });
}

// api response and html element get passed in
function displaySearchResults(meals, searchResults) {
    // if empty arg
    if (!meals) {
        searchResults.innerHTML = '<p>No recipes found. Try a different search term.</p>';
        return;
    }

    // set results empty if searching multiple times
    searchResults.innerHTML = '';

    // loop through meals array api response
    meals.forEach(meal => {

        // using recipe card template from html file, create copy of template
        const recipeElement = recipeCardTemplate.content.cloneNode(true);

        // choose the values of template
        // this finds recipe card div etc.
        const recipeCard = recipeElement.querySelector('.recipe-card');
        const recipeImage = recipeElement.querySelector('.recipe-image');
        const recipeTitle = recipeElement.querySelector('.recipe-title');

        // sets data-id of the card to the meal ID value, so cards are unique with this dataID
        recipeCard.dataset.id = meal.idMeal;
        // image from api response
        recipeImage.src = meal.strMealThumb;
        // alt text from api response
        recipeImage.alt = meal.strMeal;
        // title from api response
        recipeTitle.textContent = meal.strMeal;

        // insert current clone of recipe element into search results DIV as its own child div element
        searchResults.appendChild(recipeElement);
    });

    // when clicking on any given recipe card
    searchResults.addEventListener('click', (e) => {

        // select closest recipe card
        const recipeCard = e.target.closest('.recipe-card');
        // if selected recipe card exists
        if (recipeCard) {
            // set mealid from recipecard data-id attribute
            const mealId = recipeCard.dataset.id;
            // open that exact recipe
            showRecipeDetails(mealId);
        }
    });
} 