import { API_BASE_URL } from './config.js';
import { showRecipeDetails } from './recipeDetails.js';

const recipeCardTemplate = document.getElementById('recipe-card-template');
const categoryItemTemplate = document.getElementById('category-item-template');

export function initSearch(searchInput, searchBtn, searchResults, categoriesList) {
    searchBtn.addEventListener('click', async () => {
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
    });

    searchInput.addEventListener('keypress', async (e) => {
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

    loadCategories(categoriesList);
}

async function loadCategories(categoriesList) {
    try {
        const response = await fetch(`${API_BASE_URL}/categories.php`);
        const data = await response.json();
        displayCategories(data.categories, categoriesList);
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

function displayCategories(categories, categoriesList) {
    categoriesList.innerHTML = '';
    categories.forEach(category => {
        const categoryElement = categoryItemTemplate.content.cloneNode(true);
        const categoryItem = categoryElement.querySelector('.category-item');
        categoryItem.dataset.category = category.strCategory;
        categoryItem.textContent = category.strCategory;
        categoriesList.appendChild(categoryElement);
    });

    categoriesList.addEventListener('click', async (e) => {
        const category = e.target.dataset.category;
        if (category) {
            try {
                const response = await fetch(`${API_BASE_URL}/filter.php?c=${category}`);
                const data = await response.json();
                const searchResults = document.getElementById('search-results');
                displaySearchResults(data.meals, searchResults);
            } catch (error) {
                console.error('Error searching by category:', error);
            }
        }
    });
}

function displaySearchResults(meals, searchResults) {
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

    searchResults.addEventListener('click', (e) => {
        const recipeCard = e.target.closest('.recipe-card');
        if (recipeCard) {
            const mealId = recipeCard.dataset.id;
            showRecipeDetails(mealId);
        }
    });
} 