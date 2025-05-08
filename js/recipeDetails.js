import { API_BASE_URL, currentPage, setCurrentPage } from './config.js';
import { displayMyRecipes } from './myRecipes.js';

export let myRecipes = JSON.parse(localStorage.getItem('myRecipes')) || [];
const recipeDetailsTemplate = document.getElementById('recipe-details-template');

export function initRecipeDetails(recipeDetails, backBtn, showPage) {
    backBtn.addEventListener('click', () => showPage('search'));
}

// passing in the data-id from method call
export async function showRecipeDetails(mealId) {
    try {
        // call api with meal id (53085 for example - not plaintext category)
        const response = await fetch(`${API_BASE_URL}/lookup.php?i=${mealId}`);
        const data = await response.json();
        // grab the first meal from the api response (there is only one meal in the api response xd)
        const meal = data.meals[0];

        // get the recipe details div from <main>
        const recipeDetails = document.getElementById('recipe-details');

        // clone the recipe details template node
        const detailsElement = recipeDetailsTemplate.content.cloneNode(true);
        // select the header text inside template, set to meal name
        detailsElement.querySelector('h2').textContent = meal.strMeal;
        // grab save button into variable
        const saveBtn = detailsElement.querySelector('.save-recipe-btn');
        // set into button data-id to mealid
        saveBtn.dataset.id = meal.idMeal;
        // ternary arg for if contains recipe already or not, if not, set text to 'Save to My Recipes'
        saveBtn.textContent = myRecipes.includes(meal.idMeal) ? 'Remove from My Recipes' : 'Save to My Recipes';
        // select recipe <img> element from template
        const recipeImage = detailsElement.querySelector('.recipe-detail-image');
        // set src and alt to meal image and name respectively
        recipeImage.src = meal.strMealThumb;
        recipeImage.alt = meal.strMeal;

        // select meal category and area <p> elements from html and set to api response elements
        // <p><strong>Area:</strong> <span class="area">THIS TEXT HERE</span></p>
        detailsElement.querySelector('.category').textContent = meal.strCategory;
        detailsElement.querySelector('.area').textContent = meal.strArea;


        // grab ingredients list item from html template (UL)
        const ingredientsList = detailsElement.querySelector('.ingredients-list');
        // go through the max count of ingredients (20) and add them to the list
        for (let i = 1; i <= 20; i++) {
            // grab the ingredient and measure from api response
            const ingredient = meal[`strIngredient${i}`];
            const measure = meal[`strMeasure${i}`];
            // if ingredient exists (bool i think) and not empty string or just whitespace
            if (ingredient && ingredient.trim()) {
                // create li element and set text content to ingredient and measure
                const li = document.createElement('li');
                li.textContent = `${measure} ${ingredient}`;
                // append li to UL
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