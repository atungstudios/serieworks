// Array to hold the book data with multiple categories
const books = [
    {
        title: "Travel Guide: Shenzhen, China",
        description: "Embark on the ultimate adventure with The Global Traveler, your passport to the most awe-inspiring destinations across the globe. Whether you're a seasoned explorer or a first-time traveler, this comprehensive guide will lead you through the world's most breathtaking landscapes, vibrant cities, and hidden gems. From the ancient wonders of the world to modern marvels, this book offers insider tips, detailed itineraries, and local secrets that will help you navigate your journey like a pro.",
        categories: ["Non-Fiction", "Travel"],
        amazonLink: "https://www.amazon.com",
        image: "https://via.placeholder.com/400x640"
    },
    {
        title: "Baby's First Colors",
        description: "A delightful and engaging picture book designed to introduce your little one to the colorful world around them.",
        categories: ["Fiction", "Picture Book (Ages 0-4)"],
        amazonLink: "https://www.amazon.com",
        image: "./assets/covers/Cover.png"
    },
    {
        title: "Effortless Eats: Fast Recipes",
        description: "Packed with simple, quick-to-prepare recipes, this cookbook is perfect for anyone juggling a busy schedule but still craving delicious and nutritious meals.",
        categories: ["Non-Fiction", "Food"],
        amazonLink: "https://www.amazon.com",
        image: "https://via.placeholder.com/400x640"
    },
    {
        title: "Mindful Health: Strategies for a Stronger, Healthier You",
        description: "Discover the powerful connection between mindfulness and well-being, and learn how small, intentional changes can lead to lasting improvements in your health.",
        categories: ["Non-Fiction", "Health"],
        amazonLink: "https://www.amazon.com",
        image: "https://via.placeholder.com/400x640"
    },
    {
        title: "The Talking Tree",
        description: "In The Talking Tree, young readers are introduced to a magical forest where anything is possible. When Emma and her little brother Max wander into the woods near their home, they stumble upon an ancient tree that can talk!",
        categories: ["Fiction", "Early Reader Book (Ages 5-7)"],
        amazonLink: "https://www.amazon.com",
        image: "https://via.placeholder.com/400x640"
    },
    {
        title: "The Time Traveler's Notebook",
        description: "When 12-year-old Ellie discovers a dusty, old notebook hidden in her grandmother's attic, she unknowingly unlocks the key to an extraordinary adventure. ",
        categories: ["Fiction", "Chapter Book (Ages 6-9)"],
        amazonLink: "https://www.amazon.com",
        image: "https://via.placeholder.com/400x640"
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
            <div class="category-pills">${categoryPills}</div>
            <h3>${book.title}</h3>
            <p>${book.description}</p>
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
