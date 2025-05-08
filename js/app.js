import { initSearch } from './search.js';
import { initRecipeDetails, toggleSaveRecipe } from './recipeDetails.js';
import { initMyRecipes } from './myRecipes.js';
import {API_BASE_URL, setCurrentPage} from './config.js';

const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const searchResults = document.getElementById('search-results');
const categoriesList = document.getElementById('categories-list');
const myRecipesList = document.getElementById('my-recipes-list');
const recipeDetails = document.getElementById('recipe-details');
const backBtn = document.getElementById('back-btn');
const navLinks = document.querySelectorAll('.nav-link');

const recipeCardTemplate = document.getElementById('recipe-card-template');
const recipeDetailsTemplate = document.getElementById('recipe-details-template');
const categoryItemTemplate = document.getElementById('category-item-template');

// add click listeners to each nav link (my recipes, search)
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        // prevent default action of link click (go to href)
        e.preventDefault();
        // get data-page attribute of clicked link
        const page = e.target.dataset.page;
        // call showpage with page argument (my recipes, search)
        showPage(page);
    });
});


// receives page name
function showPage(page) {
    // remove active class from all elements with class page, basically hiding all pages
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    // shows the page which id matches the page argument
    document.getElementById(`${page}-page`).classList.add('active');
    // iterates through all nav links and adds active class to the one that matches the page argument
    navLinks.forEach(link => {
        link.classList.toggle('active', link.dataset.page === page);
    });
    // call setcurrent page with page argument
    setCurrentPage(page);

    if (page === 'my-recipes') {
        initMyRecipes(myRecipesList);
    }
}

// init functions
initSearch(searchInput, searchBtn, searchResults, categoriesList);
initRecipeDetails(recipeDetails, backBtn, showPage);
initMyRecipes(myRecipesList);

// load all categories from api
async function loadCategories() {
    try {
        const response = await fetch(`${API_BASE_URL}/categories.php`);
        const data = await response.json();
        // call a new function with categories from api
        displayCategories(data.categories);
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

function displayCategories(categories) {
    categoriesList.innerHTML = '';
    // iterate through categories array from api response
    categories.forEach(category => {
        // clone the html element category-item-template (just holds a div with data-category)
        const categoryElement = categoryItemTemplate.content.cloneNode(true);

        // get the div of the template
        const categoryItem = categoryElement.querySelector('.category-item');
        // set data-category attribute of the div to the category value from api response
        categoryItem.dataset.category = category.strCategory;
        // same to the text content of the div
        categoryItem.textContent = category.strCategory;
        // add clone to the categories list div as its own child div element
        categoriesList.appendChild(categoryElement);
    });

    // add click listeners to each category item
    categoriesList.addEventListener('click', (e) => {
        const category = e.target.dataset.category;
        // call searchByCategory with category argument on click of item
        if (category) {
            searchByCategory(category);
        }
    });
}


// main menu category buttons (chicken etc.)
async function searchByCategory(category) {
    try {
        const response = await fetch(`${API_BASE_URL}/filter.php?c=${category}`);
        const data = await response.json();
        // call a function that displays the results of the category search
        displaySearchResults(data.meals);
    } catch (error) {
        console.error('Error searching by category:', error);
    }
}

// passed in api response of meals from any category
function displaySearchResults(meals) {
    if (!meals) {
        searchResults.innerHTML = '<p>No recipes found. Try a different search term.</p>';
        return;
    }

    searchResults.innerHTML = '';
    // go through every meal found in api response
    meals.forEach(meal => {
        // create clone of recipe card template
        const recipeElement = recipeCardTemplate.content.cloneNode(true);

        // get the div of the template
        const recipeCard = recipeElement.querySelector('.recipe-card');
        const recipeImage = recipeElement.querySelector('.recipe-image');
        const recipeTitle = recipeElement.querySelector('.recipe-title');

        // set data-id of the card to the meal id value so cards are unique
        recipeCard.dataset.id = meal.idMeal;
        //images and text
        recipeImage.src = meal.strMealThumb;
        recipeImage.alt = meal.strMeal;
        recipeTitle.textContent = meal.strMeal;

        // add clone to searchresults div
        searchResults.appendChild(recipeElement);
    });

    // add click listeners to each recipe card from search results
    document.querySelectorAll('.recipe-card').forEach(card => {
        card.addEventListener('click', () => {
            // get mealid from data-id
            const mealId = card.dataset.id;
            // call showRecipeDetails with mealid from recipe card div
            showRecipeDetails(mealId);
        });
    });
}

// open sesame
async function showRecipeDetails(mealId) {
    try {
        //get meal via mealid
        const response = await fetch(`${API_BASE_URL}/lookup.php?i=${mealId}`);
        const data = await response.json();
        const meal = data.meals[0];

        // create ingredients array
        const ingredients = [];
        for (let i = 1; i <= 20; i++) {
            // add items to array in order (ingredient: amount)
            const ingredient = meal[`strIngredient${i}`];
            const measure = meal[`strMeasure${i}`];
            if (ingredient && ingredient.trim()) {
                ingredients.push(`${measure} ${ingredient}`);
            }
        }

        // clone recipe details template
        const detailsElement = recipeDetailsTemplate.content.cloneNode(true);

        // set header text to meal name
        detailsElement.querySelector('h2').textContent = meal.strMeal;

        // set save button data-id to mealid
        detailsElement.querySelector('.save-recipe-btn').dataset.id = meal.idMeal;

        // set text content of save button to save if not already in my recipes else remove
        detailsElement.querySelector('.save-recipe-btn').textContent = 
            myRecipes.includes(meal.idMeal) ? 'Remove from My Recipes' : 'Save to My Recipes';

        // add image data-src and alt to meal image and name
        detailsElement.querySelector('.recipe-detail-image').src = meal.strMealThumb;
        detailsElement.querySelector('.recipe-detail-image').alt = meal.strMeal;

        // add meal category and area <p> elements from html and set to api response elements
        detailsElement.querySelector('.category').textContent = meal.strCategory;
        detailsElement.querySelector('.area').textContent = meal.strArea;

        // get ingredients list item from html template (UL)
        const ingredientsList = detailsElement.querySelector('.ingredients-list');

        // iterate through ingredients array and add each item to the list
        ingredients.forEach(ing => {
            const li = document.createElement('li');
            li.textContent = ing;
            ingredientsList.appendChild(li);
        });

        // set instructions text to api response
        detailsElement.querySelector('.instructions').textContent = meal.strInstructions;

        recipeDetails.innerHTML = '';
        // add clone to recipe details div
        recipeDetails.appendChild(detailsElement);
        // show recipe details
        showPage('recipe-details');

        // grab save button to var
        const saveBtn = recipeDetails.querySelector('.save-recipe-btn');

        // add click listener to save button
        saveBtn.addEventListener('click', () => {
            // toggle save recipe with mealid
            toggleSaveRecipe(meal.idMeal);
        });
        
    } catch (error) {
        console.error('Error loading recipe details:', error);
        recipeDetails.innerHTML = '<p>Error loading recipe details. Please try again.</p>';
    }
}

backBtn.addEventListener('click', () => {
    showPage(previousPage);
});

loadCategories();
