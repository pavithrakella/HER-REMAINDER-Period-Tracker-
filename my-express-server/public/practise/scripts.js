// Function to show all products initially
function showAllProducts() {
    showCategory('home'); // Show all products category
    document.querySelector('.navbar-brand').classList.add('active'); // Highlight "Period Care Products" in navbar
}

// Function to show specific category based on clicked link
function showCategory(categoryId) {
    // Hide all categories
    const categories = document.querySelectorAll('.category');
    categories.forEach(category => {
        category.classList.remove('active');
    });

    // Show the selected category
    const selectedCategory = document.getElementById(categoryId);
    if (selectedCategory) {
        selectedCategory.classList.add('active');
    }

    // Highlight the selected link in the navbar
    const navbarLinks = document.querySelectorAll('nav a');
    navbarLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${categoryId}`) {
            link.classList.add('active');
        }
    });
}

// Function to open product details (dummy function for demonstration)
function openProduct(productLink) {
    // Replace with actual functionality to open product link
    console.log(`Opening product: ${productLink}`);
}

// Initial setup: Show all products on page load
document.addEventListener('DOMContentLoaded', function() {
    showAllProducts();
});

function openProduct(productLink) {
    // Example: Fetch product details including image URL and product name
    const productData = fetchProductDetails(productLink); // Implement this function
    
    // Select the product card and its components
    const productCard = document.querySelector('.product-card');
    const productImage = productCard.querySelector('.product-image');
    const productName = productCard.querySelector('.product-name');
    
    // Update image source and product name based on fetched data
    productImage.src = productData.imageURL;
    productName.textContent = productData.name;
}
