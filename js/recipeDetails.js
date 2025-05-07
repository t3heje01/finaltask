import { API_BASE_URL, currentPage, setCurrentPage } from './config.js';
import { displayMyRecipes } from './myRecipes.js';

export let myRecipes = JSON.parse(localStorage.getItem('myRecipes')) || [];
const recipeDetailsTemplate = document.getElementById('recipe-details-template');

export function initRecipeDetails(recipeDetails, backBtn, showPage) {
    backBtn.addEventListener('click', () => showPage('search'));
}

export async function showRecipeDetails(mealId) {
    try {
        const response = await fetch(`${API_BASE_URL}/lookup.php?i=${mealId}`);
        const data = await response.json();
        const meal = data.meals[0];
        
        const recipeDetails = document.getElementById('recipe-details');
        const detailsElement = recipeDetailsTemplate.content.cloneNode(true);
        
        detailsElement.querySelector('h2').textContent = meal.strMeal;
        const saveBtn = detailsElement.querySelector('.save-recipe-btn');
        saveBtn.dataset.id = meal.idMeal;
        saveBtn.textContent = myRecipes.includes(meal.idMeal) ? 'Remove from My Recipes' : 'Save to My Recipes';
        
        const recipeImage = detailsElement.querySelector('.recipe-detail-image');
        recipeImage.src = meal.strMealThumb;
        recipeImage.alt = meal.strMeal;
        
        detailsElement.querySelector('.category').textContent = meal.strCategory;
        detailsElement.querySelector('.area').textContent = meal.strArea;
        
        const ingredientsList = detailsElement.querySelector('.ingredients-list');
        for (let i = 1; i <= 20; i++) {
            const ingredient = meal[`strIngredient${i}`];
            const measure = meal[`strMeasure${i}`];
            if (ingredient && ingredient.trim()) {
                const li = document.createElement('li');
                li.textContent = `${measure} ${ingredient}`;
                ingredientsList.appendChild(li);
            }
        }
        
        detailsElement.querySelector('.instructions').textContent = meal.strInstructions;

        recipeDetails.innerHTML = '';
        recipeDetails.appendChild(detailsElement);

        saveBtn.addEventListener('click', () => toggleSaveRecipe(meal.idMeal));

        setCurrentPage('recipe-details');
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.getElementById('recipe-details-page').classList.add('active');
    } catch (error) {
        console.error('Error loading recipe details:', error);
        recipeDetails.innerHTML = '<p>Error loading recipe details. Please try again.</p>';
    }
}

export function toggleSaveRecipe(mealId) {
    const index = myRecipes.indexOf(mealId);
    if (index === -1) {
        myRecipes.push(mealId);
    } else {
        myRecipes.splice(index, 1);
    }
    localStorage.setItem('myRecipes', JSON.stringify(myRecipes));
    
    const saveBtn = document.querySelector('.save-recipe-btn');
    saveBtn.textContent = myRecipes.includes(mealId) ? 'Remove from My Recipes' : 'Save to My Recipes';
    
    if (currentPage === 'my-recipes') {
        const myRecipesList = document.getElementById('my-recipes-list');
        displayMyRecipes(myRecipesList);
    }
} 