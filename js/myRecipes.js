import { API_BASE_URL } from './config.js';
import { showRecipeDetails } from './recipeDetails.js';
import { myRecipes } from './recipeDetails.js';

const recipeCardTemplate = document.getElementById('recipe-card-template');

export function initMyRecipes(myRecipesList) {
    displayMyRecipes(myRecipesList);
}

export async function displayMyRecipes(myRecipesList) {
    if (myRecipes.length === 0) {
        myRecipesList.innerHTML = '<p>No saved recipes yet. Search for recipes and save them to your collection!</p>';
        return;
    }

    try {
        const recipes = await Promise.all(
            myRecipes.map(id => fetch(`${API_BASE_URL}/lookup.php?i=${id}`).then(res => res.json()))
        );

        myRecipesList.innerHTML = '';
        recipes.forEach(data => {
            const meal = data.meals[0];
            const recipeElement = recipeCardTemplate.content.cloneNode(true);
            const recipeCard = recipeElement.querySelector('.recipe-card');
            const recipeImage = recipeElement.querySelector('.recipe-image');
            const recipeTitle = recipeElement.querySelector('.recipe-title');

            recipeCard.dataset.id = meal.idMeal;
            recipeImage.src = meal.strMealThumb;
            recipeImage.alt = meal.strMeal;
            recipeTitle.textContent = meal.strMeal;

            myRecipesList.appendChild(recipeElement);
        });

        myRecipesList.querySelectorAll('.recipe-card').forEach(card => {
            card.addEventListener('click', () => {
                const mealId = card.dataset.id;
                showRecipeDetails(mealId);
            });
        });
    } catch (error) {
        console.error('Error loading saved recipes:', error);
        myRecipesList.innerHTML = '<p>Error loading saved recipes. Please try again.</p>';
    }
} 