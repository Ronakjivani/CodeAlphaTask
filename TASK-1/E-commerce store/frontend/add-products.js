// Sample products data
const products = [
    // Electronics Category
    {
        name: "Wireless Bluetooth Headphones",
        description: "High-quality wireless headphones with noise cancellation and 20-hour battery life",
        price: 2999,
        category: "electronics",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80",
        stock: 50,
        featured: true
    },
    {
        name: "Smart Watch Series 5",
        description: "Advanced smartwatch with health monitoring, GPS, and water resistance",
        price: 4999,
        category: "electronics",
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80",
        stock: 30,
        featured: true
    },
    {
        name: "Portable Power Bank",
        description: "20000mAh power bank with fast charging and multiple USB ports",
        price: 1499,
        category: "electronics",
        image: "https://images.unsplash.com/photo-1609592424823-0c2c297b1b1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80",
        stock: 100,
        featured: false
    },
    {
        name: "Wireless Earbuds Pro",
        description: "True wireless earbuds with active noise cancellation and touch controls",
        price: 3999,
        category: "electronics",
        image: "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80",
        stock: 75,
        featured: true
    },
    {
        name: "4K Ultra HD Smart TV",
        description: "55-inch 4K Smart TV with HDR and built-in streaming apps",
        price: 49999,
        category: "electronics",
        image: "https://images.unsplash.com/photo-1593784991095-a205069470b6?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80",
        stock: 20,
        featured: true
    },

    // Fashion Category (using 'clothing' as per schema)
    {
        name: "Classic Denim Jacket",
        description: "Premium quality denim jacket with modern fit and style",
        price: 2499,
        category: "clothing",
        image: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80",
        stock: 40,
        featured: true
    },
    {
        name: "Leather Crossbody Bag",
        description: "Handcrafted genuine leather bag with adjustable strap",
        price: 1999,
        category: "clothing",
        image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80",
        stock: 25,
        featured: false
    },
    {
        name: "Premium Cotton T-Shirt",
        description: "100% organic cotton t-shirt with modern fit",
        price: 799,
        category: "clothing",
        image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80",
        stock: 200,
        featured: true
    },
    {
        name: "Designer Sunglasses",
        description: "UV protection sunglasses with polarized lenses",
        price: 1499,
        category: "clothing",
        image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80",
        stock: 50,
        featured: false
    },
    {
        name: "Casual Sneakers",
        description: "Comfortable sneakers with memory foam insoles",
        price: 2999,
        category: "clothing",
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80",
        stock: 60,
        featured: true
    },

    // Home & Living Category (using 'home' as per schema)
    {
        name: "Modern Coffee Table",
        description: "Contemporary coffee table with storage space",
        price: 5999,
        category: "home",
        image: "https://images.unsplash.com/photo-1532372320572-cda25653a26f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80",
        stock: 15,
        featured: true
    },
    {
        name: "LED Floor Lamp",
        description: "Adjustable LED floor lamp with multiple brightness levels",
        price: 1999,
        category: "home",
        image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80",
        stock: 30,
        featured: false
    },
    {
        name: "Decorative Wall Clock",
        description: "Modern wall clock with silent movement",
        price: 999,
        category: "home",
        image: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80",
        stock: 45,
        featured: false
    },
    {
        name: "Throw Pillow Set",
        description: "Set of 4 decorative throw pillows with premium fabric",
        price: 1499,
        category: "home",
        image: "https://images.unsplash.com/photo-1584100936595-c0655b3a6e5f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80",
        stock: 35,
        featured: true
    },
    {
        name: "Plant Stand Set",
        description: "Set of 3 modern plant stands for indoor plants",
        price: 2499,
        category: "home",
        image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80",
        stock: 20,
        featured: false
    }
];

// Function to add products to the database
async function addProducts() {
    const API_URL = 'http://localhost:5000/api';
    const statusDiv = document.getElementById('status');
    const addButton = document.getElementById('addButton');
    
    statusDiv.innerHTML = 'Adding products...';
    addButton.disabled = true;
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const product of products) {
        try {
            const response = await fetch(`${API_URL}/products`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(product)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Failed to add product: ${product.name} - ${errorData.message || 'Unknown error'}`);
            }

            successCount++;
            console.log(`Successfully added product: ${product.name}`);
        } catch (error) {
            errorCount++;
            console.error(`Error adding product ${product.name}:`, error);
        }
    }
    
    statusDiv.innerHTML = `
        <p class="success">Successfully added ${successCount} products</p>
        ${errorCount > 0 ? `<p class="error">Failed to add ${errorCount} products</p>` : ''}
    `;
    addButton.disabled = false;
}

// Make addProducts available globally
window.addProducts = addProducts; 