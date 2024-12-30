// Array to hold the book data with multiple categories
const books = [
    {
        title: "The Great Gatsby",
        description: "A classic novel by F. Scott Fitzgerald set in the Jazz Age.",
        categories: ["Fiction", "Classics"],
        amazonLink: "https://www.amazon.com/dp/0743273567",
        image: "https://via.placeholder.com/816x1056"
    },
    {
        title: "Sapiens: A Brief History of Humankind",
        description: "An exploration of the history of humans by Yuval Noah Harari.",
        categories: ["Non-Fiction", "History"],
        amazonLink: "https://www.amazon.com/dp/0062316095",
        image: "https://via.placeholder.com/816x1056"
    },
    {
        title: "The Silent Patient",
        description: "A psychological thriller by Alex Michaelides.",
        categories: ["Mystery", "Thriller"],
        amazonLink: "https://www.amazon.com/dp/1250301696",
        image: "https://via.placeholder.com/816x1056"
    },
    {
        title: "Harry Potter and the Sorcerer's Stone",
        description: "The first book in the Harry Potter series by J.K. Rowling.",
        categories: ["Fantasy", "Young Adult"],
        amazonLink: "https://www.amazon.com/dp/059035342X",
        image: "https://via.placeholder.com/816x1056"
    }
];

// Function to render books
function renderBooks(filteredBooks) {
    const booksContainer = document.getElementById('books-container');
    booksContainer.innerHTML = ''; // Clear existing books

    filteredBooks.forEach(book => {
        const bookCard = document.createElement('div');
        bookCard.classList.add('book-card');

        // Create category pills
        const categoryPills = book.categories.map(category => {
            return `<span class="category-pill ${category.replace(/\s+/g, '')}">${category}</span>`;
        }).join(''); // Join pills as a single string

        bookCard.innerHTML = `
            <img src="${book.image}" alt="${book.title}" />
            <h3>${book.title}</h3>
            <p>${book.description}</p>
            <div class="category-pills">${categoryPills}</div>
            <a href="${book.amazonLink}" class="amazon-link" target="_blank">View on Amazon</a>
        `;

        booksContainer.appendChild(bookCard);
    });
}

// Call renderBooks on initial load
document.addEventListener('DOMContentLoaded', () => {
    renderBooks(books); // Display all books initially

    // Set up the search functionality
    const searchInput = document.getElementById('book-search');
    searchInput.addEventListener('input', (event) => {
        const searchTerm = event.target.value.toLowerCase(); // Convert search input to lowercase

        const filteredBooks = books.filter(book => {
            return book.title.toLowerCase().includes(searchTerm) || 
                   book.description.toLowerCase().includes(searchTerm);
        });

        renderBooks(filteredBooks); // Re-render the filtered books
    });

    // Set up the category filter
    const categoryButtons = document.querySelectorAll('.category-button');
    categoryButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const category = event.target.dataset.category;

            // Update the active class for buttons
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');

            // Filter books by category (matching any of the selected categories)
            const filteredBooks = books.filter(book => {
                if (category === 'all') {
                    return true; // Show all books if "all" is selected
                }
                return book.categories.includes(category); // Show books that have the selected category
            });

            renderBooks(filteredBooks); // Re-render the filtered books
        });
    });
});
