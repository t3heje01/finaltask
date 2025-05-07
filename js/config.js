export const API_BASE_URL = 'https://www.themealdb.com/api/json/v1/1';

export let currentPage = 'search';
export let previousPage = 'search';

export function setCurrentPage(page) {
    previousPage = currentPage;
    currentPage = page;
} 