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

navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const page = e.target.dataset.page;
        showPage(page);
    });
});

function showPage(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(`${page}-page`).classList.add('active');
    navLinks.forEach(link => {
        link.classList.toggle('active', link.dataset.page === page);
    });
    setCurrentPage(page);
    
    if (page === 'my-recipes') {
        initMyRecipes(myRecipesList);
    }
}

initSearch(searchInput, searchBtn, searchResults, categoriesList);
initRecipeDetails(recipeDetails, backBtn, showPage);
initMyRecipes(myRecipesList);

async function loadCategories() {
    try {
        const response = await fetch(`${API_BASE_URL}/categories.php`);
        const data = await response.json();
        displayCategories(data.categories);
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

function displayCategories(categories) {
    categoriesList.innerHTML = '';
    categories.forEach(category => {
        const categoryElement = categoryItemTemplate.content.cloneNode(true);
        const categoryItem = categoryElement.querySelector('.category-item');
        categoryItem.dataset.category = category.strCategory;
        categoryItem.textContent = category.strCategory;
        categoriesList.appendChild(categoryElement);
    });

    categoriesList.addEventListener('click', (e) => {
        const category = e.target.dataset.category;
        if (category) {
            searchByCategory(category);
        }
    });
}

async function searchByCategory(category) {
    try {
        const response = await fetch(`${API_BASE_URL}/filter.php?c=${category}`);
        const data = await response.json();
        displaySearchResults(data.meals);
    } catch (error) {
        console.error('Error searching by category:', error);
    }
}

function displaySearchResults(meals) {
    if (!meals) {
        searchResults.innerHTML = '<p>No recipes found. Try a different search term.</p>';
        return;
    }

    searchResults.innerHTML = '';
    meals.forEach(meal => {
        const recipeElement = recipeCardTemplate.content.cloneNode(true);
        const recipeCard = recipeElement.querySelector('.recipe-card');
        const recipeImage = recipeElement.querySelector('.recipe-image');
        const recipeTitle = recipeElement.querySelector('.recipe-title');

        recipeCard.dataset.id = meal.idMeal;
        recipeImage.src = meal.strMealThumb;
        recipeImage.alt = meal.strMeal;
        recipeTitle.textContent = meal.strMeal;

        searchResults.appendChild(recipeElement);
    });

    document.querySelectorAll('.recipe-card').forEach(card => {
        card.addEventListener('click', () => {
            const mealId = card.dataset.id;
            showRecipeDetails(mealId);
        });
    });
}

async function showRecipeDetails(mealId) {
    try {
        const response = await fetch(`${API_BASE_URL}/lookup.php?i=${mealId}`);
        const data = await response.json();
        const meal = data.meals[0];
        
        const ingredients = [];
        for (let i = 1; i <= 20; i++) {
            const ingredient = meal[`strIngredient${i}`];
            const measure = meal[`strMeasure${i}`];
            if (ingredient && ingredient.trim()) {
                ingredients.push(`${measure} ${ingredient}`);
            }
        }

        const detailsElement = recipeDetailsTemplate.content.cloneNode(true);
        
        detailsElement.querySelector('h2').textContent = meal.strMeal;
        detailsElement.querySelector('.save-recipe-btn').dataset.id = meal.idMeal;
        detailsElement.querySelector('.save-recipe-btn').textContent = 
            myRecipes.includes(meal.idMeal) ? 'Remove from My Recipes' : 'Save to My Recipes';
        
        detailsElement.querySelector('.recipe-detail-image').src = meal.strMealThumb;
        detailsElement.querySelector('.recipe-detail-image').alt = meal.strMeal;
        
        detailsElement.querySelector('.category').textContent = meal.strCategory;
        detailsElement.querySelector('.area').textContent = meal.strArea;
        
        const ingredientsList = detailsElement.querySelector('.ingredients-list');
        ingredients.forEach(ing => {
            const li = document.createElement('li');
            li.textContent = ing;
            ingredientsList.appendChild(li);
        });
        
        detailsElement.querySelector('.instructions').textContent = meal.strInstructions;

        recipeDetails.innerHTML = '';
        recipeDetails.appendChild(detailsElement);
        showPage('recipe-details');

        const saveBtn = recipeDetails.querySelector('.save-recipe-btn');
        saveBtn.addEventListener('click', () => {
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
