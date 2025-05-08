import { API_BASE_URL } from './config.js';
import { showRecipeDetails } from './recipeDetails.js';
import { myRecipes } from './recipeDetails.js';

const recipeCardTemplate = document.getElementById('recipe-card-template');

export function initMyRecipes(myRecipesList) {
    displayMyRecipes(myRecipesList);
}

// takes div of saved recipes list
export async function displayMyRecipes(myRecipesList) {
    // if no saved recipes from localstorage
    if (myRecipes.length === 0) {
        myRecipesList.innerHTML = '<p>No saved recipes yet. Search for recipes and save them to your collection!</p>';
        return;
    }

    try {
        // get all recipes from api with ids from localstorage and save to recipes map array (array of promises)
        const recipes = await Promise.all(
            myRecipes.map(id => fetch(`${API_BASE_URL}/lookup.php?i=${id}`).then(res => res.json()))
        );

        // reset recipe list
        myRecipesList.innerHTML = '';
        // iterate through array of promises
        recipes.forEach(data => {
            // grab first meal from each api response
            const meal = data.meals[0];
            // clone of recipe card html template
            const recipeElement = recipeCardTemplate.content.cloneNode(true);
            // take values of html template
            const recipeCard = recipeElement.querySelector('.recipe-card');
            const recipeImage = recipeElement.querySelector('.recipe-image');
            const recipeTitle = recipeElement.querySelector('.recipe-title');

            // set dataid,image,alt,title of recipe from api responses
            recipeCard.dataset.id = meal.idMeal;
            recipeImage.src = meal.strMealThumb;
            recipeImage.alt = meal.strMeal;
            recipeTitle.textContent = meal.strMeal;

            // add recipe clone to list of MY recipes
            myRecipesList.appendChild(recipeElement);
        });

        // add click listeners to each recipe card
        myRecipesList.querySelectorAll('.recipe-card').forEach(card => {
            card.addEventListener('click', () => {
                // save mealid from card clicked
                const mealId = card.dataset.id;
                // open that exact recipe details
                showRecipeDetails(mealId);
            });
        });
    } catch (error) {
        console.error('Error loading saved recipes:', error);
        myRecipesList.innerHTML = '<p>Error loading saved recipes. Please try again.</p>';
    }
} 