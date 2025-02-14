import { toddlerBooks } from './data/toddlerBooks.js';
import { preschoolBooks } from './data/preschoolBooks.js';
import { gradeschoolerBooks } from './data/gradeschoolerBooks.js';
import { teenBooks } from './data/teenBooks.js';
import { youngAdultBooks } from './data/youngAdultBooks.js';
import { adultBooks } from './data/adultBooks.js';

const books = [...toddlerBooks, ...preschoolBooks, ...gradeschoolerBooks, ...teenBooks, ...youngAdultBooks, ...adultBooks];

// Shuffle books before displaying
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
}
shuffleArray(books);

const booksContainer = document.getElementById('books-container');
const loadMoreButton = document.createElement('button');
loadMoreButton.textContent = "Load More";
loadMoreButton.classList.add('load-more');

// Create "Back to Top" button
const backToTopButton = document.createElement('button');
backToTopButton.textContent = "🔝";
backToTopButton.classList.add('back-to-top');
document.body.appendChild(backToTopButton);

// Event listener for scrolling to show/hide the button
window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
        backToTopButton.classList.add('visible');
    } else {
        backToTopButton.classList.remove('visible');
    }
});

// Scroll to top function
backToTopButton.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

let booksPerPage = 10; // Load in batches of 10
let currentIndex = 0;
let filteredBooks = books; // Stores the current filtered book list

// Function to render books incrementally
function renderBooks(append = false) {
    if (!append) {
        booksContainer.innerHTML = ''; // Clear books when resetting
        currentIndex = 0; // Reset index on new filter/search
    }

    const slice = filteredBooks.slice(currentIndex, currentIndex + booksPerPage);

    slice.forEach(book => {
        const bookCard = document.createElement('div');
        bookCard.classList.add('book-card');

        // Create category pills
        const categoryPills = book.categories.map(category => 
            `<span class="category-pill ${category.replace(/\s+/g, '')}">${category}</span>`
        ).join('');

        bookCard.innerHTML = `
            <img src="${book.image}" alt="${book.title}" loading="lazy" />
            <div class="category-pills">${categoryPills}</div>
            <h3>${book.title}</h3>
            <p>${book.description}</p>
            <a href="${book.amazonLink}" class="amazon-link" target="_blank">View on Amazon</a>
        `;

        booksContainer.appendChild(bookCard);
    });

    currentIndex += booksPerPage;

    // Ensure "Load More" button stays at the end
    if (currentIndex < filteredBooks.length) {
        loadMoreButton.style.display = "block";
    } else {
        loadMoreButton.style.display = "none";
    }
}

// Load more books on button click
loadMoreButton.addEventListener('click', () => {
    renderBooks(true);
});

// Function to debounce search input
function debounce(func, delay) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), delay);
    };
}

// Initialize event listeners when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    renderBooks(); // Load first set of books

    // Add "Load More" button outside of booksContainer to keep it at the end
    booksContainer.parentNode.appendChild(loadMoreButton);

    // Set up search functionality (Only searches in book titles now)
    const searchInput = document.getElementById('book-search');
    searchInput.addEventListener('input', debounce((event) => {
        const searchTerm = event.target.value.toLowerCase();
        filteredBooks = books.filter(book => book.title.toLowerCase().includes(searchTerm)); // Only filter by title
        renderBooks();
    }, 300)); // 300ms delay for better performance

    // Set up category filter
    const categoryButtons = document.querySelectorAll('.category-button');
    categoryButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            categoryButtons.forEach(btn => btn.classList.toggle('active', btn === event.target));

            const category = event.target.dataset.category;
            filteredBooks = category === 'all' ? books : books.filter(book => book.categories.includes(category));

            renderBooks();
        });
    });
});

//dummy