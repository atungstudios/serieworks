// Array to hold the project data
const projects = [
    {
        title: "Project 1",
        description: "Description of Project 1",
        image: "https://via.placeholder.com/816x1056"
    },
    {
        title: "Project 2",
        description: "Description of Project 2",
        image: "https://via.placeholder.com/816x1056"
    },
    {
        title: "Project 3",
        description: "Description of Project 3",
        image: "https://via.placeholder.com/816x1056"
    }
];

// Function to render the projects dynamically
function renderProjects(filteredProjects) {
    const projectsContainer = document.getElementById("projects-container");
    projectsContainer.innerHTML = '';  // Clear any existing content

    // Loop through the filtered projects array and generate HTML for each project
    filteredProjects.forEach(project => {
        const projectCard = document.createElement("div");
        projectCard.classList.add("project-card");

        // Add data to the project card
        projectCard.innerHTML = `
            <img src="${project.image}" alt="${project.title}" class="project-image">
            <h3>${project.title}</h3>
            <p>${project.description}</p>
        `;

        // Append the card to the container
        projectsContainer.appendChild(projectCard);
    });
}

// Call the function to render all projects initially
document.addEventListener("DOMContentLoaded", () => {
    renderProjects(projects);  // Display all projects when page loads

    // Set up the search functionality
    const searchInput = document.getElementById("project-search");
    searchInput.addEventListener("input", (event) => {
        const searchTerm = event.target.value.toLowerCase();  // Convert search input to lowercase

        // Filter the projects based on the search term
        const filteredProjects = projects.filter(project => {
            return project.title.toLowerCase().includes(searchTerm) || 
                   project.description.toLowerCase().includes(searchTerm);
        });

        // Re-render the filtered projects
        renderProjects(filteredProjects);
    });
});
