
function initializeAdmin() {
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const adminExists = users.find(user => user.username === "admin");
    
    if (!adminExists) {
        users.push({
            username: "admin",
            names: "Administrator",
            phone: "0000000000",
            password: "admin123",
            isAdmin: true
        });
        localStorage.setItem("users", JSON.stringify(users));
    }
}

// Initialize admin on page load
initializeAdmin();

// ========================================
// THEME MANAGEMENT
// ========================================
document.addEventListener("DOMContentLoaded", () => {
    const savedTheme = localStorage.getItem("theme") || "light";
    document.body.className = savedTheme;
    
    // Update theme button text if it exists
    const themeToggle = document.getElementById("themeToggle");
    if (themeToggle) {
        themeToggle.textContent = savedTheme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode";
    }
});

function changeTheme() {
    const currentTheme = document.body.classList.contains("light") ? "light" : "dark";
    const newTheme = currentTheme === "light" ? "dark" : "light";
    
    document.body.className = newTheme;
    localStorage.setItem("theme", newTheme);
    
    const themeToggle = document.getElementById("themeToggle");
    if (themeToggle) {
        themeToggle.textContent = newTheme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode";
    }
}

// Theme toggle button event listener
const themeToggle = document.getElementById("themeToggle");
if (themeToggle) {
    themeToggle.addEventListener("click", changeTheme);
}

// Keyboard shortcut for theme toggle (press 'f')
document.addEventListener("keydown", (event) => {
    if (event.key === "f" || event.key === "F") {
        changeTheme();
    }
});

// ========================================
// REGISTRATION PAGE
// ========================================
const registerForm = document.getElementById("registerForm");
if (registerForm) {
    registerForm.addEventListener("submit", function(e) {
        e.preventDefault();
        
        const username = document.getElementById("username").value.trim();
        const names = document.getElementById("names").value.trim();
        const phone = document.getElementById("phone").value.trim();
        const password = document.getElementById("password").value;
        
        // Validation
        if (!validateName(names)) {
            showMessage("Names must contain only letters and spaces", "error");
            return;
        }
        
        // Check if username already exists
        const users = JSON.parse(localStorage.getItem("users")) || [];
        const userExists = users.find(user => user.username === username);
        
        if (userExists) {
            showMessage("Username already exists", "error");
            return;
        }
        
        // Add new user
        users.push({
            username: username,
            names: names,
            phone: phone,
            password: password,
            isAdmin: false
        });
        
        localStorage.setItem("users", JSON.stringify(users));
        showMessage("Registration successful! Redirecting to login...", "success");
        
        setTimeout(() => {
            window.location.href = "login.html";
        }, 2000);
    });
}

// ========================================
// LOGIN PAGE
// ========================================
const loginForm = document.getElementById("loginForm");
if (loginForm) {
    loginForm.addEventListener("submit", function(e) {
        e.preventDefault();
        
        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value;
        
        const users = JSON.parse(localStorage.getItem("users")) || [];
        const user = users.find(u => u.username === username && u.password === password);
        
        if (user) {
            // Save current user session
            localStorage.setItem("currentUser", username);
            showMessage("Login successful! Redirecting...", "success");
            
            setTimeout(() => {
                if (user.isAdmin) {
                    window.location.href = "admin.html";
                } else {
                    window.location.href = "inventory.html";
                }
            }, 1000);
        } else {
            showMessage("Invalid username or password", "error");
        }
    });
}

// ========================================
// INVENTORY PAGE (Regular User)
// ========================================
if (window.location.pathname.includes("inventory.html")) {
    // Check if user is logged in
    const currentUser = localStorage.getItem("currentUser");
    if (!currentUser) {
        window.location.href = "login.html";
    }
    
    // Display welcome message
    const welcomeUser = document.getElementById("welcomeUser");
    if (welcomeUser) {
        const users = JSON.parse(localStorage.getItem("users")) || [];
        const user = users.find(u => u.username === currentUser);
        if (user) {
            welcomeUser.textContent = `Welcome, ${user.names}`;
        }
    }
    
    let editingItemId = null;
    
    // Inventory Form Submit
    const inventoryForm = document.getElementById("inventoryForm");
    if (inventoryForm) {
        inventoryForm.addEventListener("submit", function(e) {
            e.preventDefault();
            
            const itemName = document.getElementById("itemName").value.trim();
            const quantity = document.getElementById("quantity").value;
            const price = document.getElementById("price").value;
            const status = document.getElementById("status").value;
            
            // Validation
            if (!validateName(itemName)) {
                showMessage("Item name must contain only letters and spaces", "error");
                return;
            }
            
            if (quantity < 0) {
                showMessage("Quantity must be a positive number", "error");
                return;
            }
            
            if (price < 0) {
                showMessage("Price must be a positive number", "error");
                return;
            }
            
            const inventory = JSON.parse(localStorage.getItem("inventory")) || [];
            
            if (editingItemId !== null) {
                // Update existing item
                const itemIndex = inventory.findIndex(item => 
                    item.id === editingItemId && item.username === currentUser
                );
                
                if (itemIndex !== -1) {
                    inventory[itemIndex] = {
                        ...inventory[itemIndex],
                        name: itemName,
                        quantity: parseFloat(quantity),
                        price: parseFloat(price),
                        status: status
                    };
                    showMessage("Item updated successfully!", "success");
                }
                
                editingItemId = null;
                document.getElementById("formTitle").textContent = "Add New Item";
                document.getElementById("submitBtn").textContent = "Add Item";
                document.getElementById("cancelBtn").style.display = "none";
            } else {
                // Add new item
                const newItem = {
                    id: Date.now(),
                    username: currentUser,
                    name: itemName,
                    quantity: parseFloat(quantity),
                    price: parseFloat(price),
                    status: status
                };
                
                inventory.push(newItem);
                showMessage("Item added successfully!", "success");
            }
            
            localStorage.setItem("inventory", JSON.stringify(inventory));
            inventoryForm.reset();
            displayInventory();
        });
    }
    
    // Cancel Edit Button
    const cancelBtn = document.getElementById("cancelBtn");
    if (cancelBtn) {
        cancelBtn.addEventListener("click", function() {
            editingItemId = null;
            inventoryForm.reset();
            document.getElementById("formTitle").textContent = "Add New Item";
            document.getElementById("submitBtn").textContent = "Add Item";
            cancelBtn.style.display = "none";
        });
    }
    
    // Display Inventory Function
    function displayInventory() {
        const inventory = JSON.parse(localStorage.getItem("inventory")) || [];
        const userInventory = inventory.filter(item => item.username === currentUser);
        
        const searchTerm = document.getElementById("searchBar")?.value.toLowerCase() || "";
        const filterStatus = document.getElementById("filterStatus")?.value || "";
        
        // Filter items
        const filteredItems = userInventory.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(searchTerm);
            const matchesStatus = filterStatus === "" || item.status === filterStatus;
            return matchesSearch && matchesStatus;
        });
        
        const tableBody = document.getElementById("inventoryTableBody");
        const noItems = document.getElementById("noItems");
        
        if (filteredItems.length === 0) {
            tableBody.innerHTML = "";
            noItems.style.display = "block";
        } else {
            noItems.style.display = "none";
            tableBody.innerHTML = filteredItems.map(item => `
                <tr>
                    <td>${item.name}</td>
                    <td>${item.quantity}</td>
                    <td>$${item.price.toFixed(2)}</td>
                    <td>${item.status}</td>
                    <td>
                        <button class="btn-edit" data-id="${item.id}">Edit</button>
                        <button class="btn-delete" data-id="${item.id}">Delete</button>
                    </td>
                </tr>
            `).join("");
        }
    }
    
    // Event Delegation for Edit and Delete buttons
    const inventoryTableBody = document.getElementById("inventoryTableBody");
    if (inventoryTableBody) {
        inventoryTableBody.addEventListener("click", function(e) {
            const itemId = parseInt(e.target.dataset.id);
            
            if (e.target.classList.contains("btn-edit")) {
                // Edit item
                const inventory = JSON.parse(localStorage.getItem("inventory")) || [];
                const item = inventory.find(i => i.id === itemId && i.username === currentUser);
                
                if (item) {
                    document.getElementById("itemName").value = item.name;
                    document.getElementById("quantity").value = item.quantity;
                    document.getElementById("price").value = item.price;
                    document.getElementById("status").value = item.status;
                    
                    editingItemId = itemId;
                    document.getElementById("formTitle").textContent = "Edit Item";
                    document.getElementById("submitBtn").textContent = "Update Item";
                    document.getElementById("cancelBtn").style.display = "inline-block";
                    
                    // Scroll to form
                    inventoryForm.scrollIntoView({ behavior: "smooth" });
                }
            }
            
            if (e.target.classList.contains("btn-delete")) {
                // Delete item
                if (confirm("Are you sure you want to delete this item?")) {
                    let inventory = JSON.parse(localStorage.getItem("inventory")) || [];
                    inventory = inventory.filter(i => !(i.id === itemId && i.username === currentUser));
                    localStorage.setItem("inventory", JSON.stringify(inventory));
                    showMessage("Item deleted successfully!", "success");
                    displayInventory();
                }
            }
        });
    }
    
    // Search and Filter Event Listeners
    const searchBar = document.getElementById("searchBar");
    if (searchBar) {
        searchBar.addEventListener("input", displayInventory);
    }
    
    const filterStatus = document.getElementById("filterStatus");
    if (filterStatus) {
        filterStatus.addEventListener("change", displayInventory);
    }
    
    // Load inventory on page load
    displayInventory();
}

// ========================================
// ADMIN PAGE
// ========================================
if (window.location.pathname.includes("admin.html")) {
    // Check if admin is logged in
    const currentUser = localStorage.getItem("currentUser");
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const user = users.find(u => u.username === currentUser);
    
    if (!currentUser || !user || !user.isAdmin) {
        window.location.href = "login.html";
    }
    
    // Display welcome message
    const welcomeUser = document.getElementById("welcomeUser");
    if (welcomeUser) {
        welcomeUser.textContent = `Welcome, Admin`;
    }
    
    // Tab Navigation
    const tabButtons = document.querySelectorAll(".tab-btn");
    tabButtons.forEach(btn => {
        btn.addEventListener("click", function() {
            const tabName = this.dataset.tab;
            
            // Remove active class from all tabs
            document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
            document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
            
            // Add active class to clicked tab
            this.classList.add("active");
            document.getElementById(tabName + "Tab").classList.add("active");
            
            // Load appropriate content
            if (tabName === "users") {
                displayUsers();
            } else if (tabName === "inventory") {
                displayAllInventory();
            }
        });
    });
    
    // Display Users Function
    function displayUsers() {
        const users = JSON.parse(localStorage.getItem("users")) || [];
        const regularUsers = users.filter(u => !u.isAdmin);
        
        const tableBody = document.getElementById("usersTableBody");
        tableBody.innerHTML = regularUsers.map(user => `
            <tr>
                <td>${user.username}</td>
                <td>${user.names}</td>
                <td>${user.phone}</td>
                <td>
                    <button class="btn-edit" data-username="${user.username}">Edit</button>
                    <button class="btn-delete" data-username="${user.username}">Delete</button>
                </td>
            </tr>
        `).join("");
    }
    
    // Event Delegation for User Edit and Delete
    const usersTableBody = document.getElementById("usersTableBody");
    if (usersTableBody) {
        usersTableBody.addEventListener("click", function(e) {
            const username = e.target.dataset.username;
            
            if (e.target.classList.contains("btn-edit")) {
                // Edit user
                const users = JSON.parse(localStorage.getItem("users")) || [];
                const user = users.find(u => u.username === username);
                
                if (user) {
                    document.getElementById("editUsername").value = user.username;
                    document.getElementById("editNames").value = user.names;
                    document.getElementById("editPhone").value = user.phone;
                    document.getElementById("editPassword").value = "";
                    
                    document.getElementById("editUserModal").style.display = "block";
                }
            }
            
            if (e.target.classList.contains("btn-delete")) {
                // Delete user
                if (confirm(`Are you sure you want to delete user ${username}? This will also delete all their inventory items.`)) {
                    let users = JSON.parse(localStorage.getItem("users")) || [];
                    users = users.filter(u => u.username !== username);
                    localStorage.setItem("users", JSON.stringify(users));
                    
                    // Delete user's inventory
                    let inventory = JSON.parse(localStorage.getItem("inventory")) || [];
                    inventory = inventory.filter(i => i.username !== username);
                    localStorage.setItem("inventory", JSON.stringify(inventory));
                    
                    alert("User deleted successfully!");
                    displayUsers();
                }
            }
        });
    }
    
    // Edit User Form Submit
    const editUserForm = document.getElementById("editUserForm");
    if (editUserForm) {
        editUserForm.addEventListener("submit", function(e) {
            e.preventDefault();
            
            const username = document.getElementById("editUsername").value;
            const names = document.getElementById("editNames").value.trim();
            const phone = document.getElementById("editPhone").value.trim();
            const password = document.getElementById("editPassword").value;
            
            // Validation
            if (!validateName(names)) {
                alert("Names must contain only letters and spaces");
                return;
            }
            
            const users = JSON.parse(localStorage.getItem("users")) || [];
            const userIndex = users.findIndex(u => u.username === username);
            
            if (userIndex !== -1) {
                users[userIndex].names = names;
                users[userIndex].phone = phone;
                if (password) {
                    users[userIndex].password = password;
                }
                
                localStorage.setItem("users", JSON.stringify(users));
                alert("User updated successfully!");
                document.getElementById("editUserModal").style.display = "none";
                displayUsers();
            }
        });
    }
    
    // Close Modal
    const closeModal = document.querySelector(".close");
    if (closeModal) {
        closeModal.addEventListener("click", function() {
            document.getElementById("editUserModal").style.display = "none";
        });
    }
    
    // Close modal when clicking outside
    window.addEventListener("click", function(event) {
        const modal = document.getElementById("editUserModal");
        if (event.target === modal) {
            modal.style.display = "none";
        }
    });
    
    // Display All Inventory Function
    function displayAllInventory() {
        const inventory = JSON.parse(localStorage.getItem("inventory")) || [];
        const users = JSON.parse(localStorage.getItem("users")) || [];
        
        // Populate user filter dropdown
        const filterUser = document.getElementById("filterUser");
        const uniqueUsers = [...new Set(inventory.map(item => item.username))];
        filterUser.innerHTML = '<option value="">All Users</option>' + 
            uniqueUsers.map(username => `<option value="${username}">${username}</option>`).join("");
        
        const searchTerm = document.getElementById("searchBar")?.value.toLowerCase() || "";
        const filterUserValue = filterUser?.value || "";
        const filterStatus = document.getElementById("filterStatus")?.value || "";
        
        // Filter items
        const filteredItems = inventory.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(searchTerm);
            const matchesUser = filterUserValue === "" || item.username === filterUserValue;
            const matchesStatus = filterStatus === "" || item.status === filterStatus;
            return matchesSearch && matchesUser && matchesStatus;
        });
        
        const tableBody = document.getElementById("allInventoryTableBody");
        const noItems = document.getElementById("noItems");
        
        if (filteredItems.length === 0) {
            tableBody.innerHTML = "";
            noItems.style.display = "block";
        } else {
            noItems.style.display = "none";
            tableBody.innerHTML = filteredItems.map(item => `
                <tr>
                    <td>${item.username}</td>
                    <td>${item.name}</td>
                    <td>${item.quantity}</td>
                    <td>$${item.price.toFixed(2)}</td>
                    <td>${item.status}</td>
                </tr>
            `).join("");
        }
    }
    
    // Search and Filter Event Listeners for Inventory Tab
    const searchBar = document.getElementById("searchBar");
    if (searchBar) {
        searchBar.addEventListener("input", displayAllInventory);
    }
    
    const filterUser = document.getElementById("filterUser");
    if (filterUser) {
        filterUser.addEventListener("change", displayAllInventory);
    }
    
    const filterStatus = document.getElementById("filterStatus");
    if (filterStatus) {
        filterStatus.addEventListener("change", displayAllInventory);
    }
    
    // Add New User Form
    const addUserForm = document.getElementById("addUserForm");
    if (addUserForm) {
        addUserForm.addEventListener("submit", function(e) {
            e.preventDefault();
            
            const username = document.getElementById("newUsername").value.trim();
            const names = document.getElementById("newNames").value.trim();
            const phone = document.getElementById("newPhone").value.trim();
            const password = document.getElementById("newPassword").value;
            
            // Validation
            if (!validateName(names)) {
                showMessageInElement("addUserMessage", "Names must contain only letters and spaces", "error");
                return;
            }
            
            const users = JSON.parse(localStorage.getItem("users")) || [];
            const userExists = users.find(u => u.username === username);
            
            if (userExists) {
                showMessageInElement("addUserMessage", "Username already exists", "error");
                return;
            }
            
            users.push({
                username: username,
                names: names,
                phone: phone,
                password: password,
                isAdmin: false
            });
            
            localStorage.setItem("users", JSON.stringify(users));
            showMessageInElement("addUserMessage", "User added successfully!", "success");
            addUserForm.reset();
        });
    }
    
    // Load initial tab
    displayUsers();
}

// ========================================
// LOGOUT FUNCTIONALITY
// ========================================
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
    logoutBtn.addEventListener("click", function() {
        localStorage.removeItem("currentUser");
        window.location.href = "login.html";
    });
}

// ========================================
// HELPER FUNCTIONS
// ========================================
function showMessage(message, type) {
    const messageDiv = document.getElementById("message");
    if (messageDiv) {
        messageDiv.textContent = message;
        messageDiv.className = `message ${type}`;
        messageDiv.style.display = "block";
        
        setTimeout(() => {
            messageDiv.style.display = "none";
        }, 3000);
    }
}

function showMessageInElement(elementId, message, type) {
    const messageDiv = document.getElementById(elementId);
    if (messageDiv) {
        messageDiv.textContent = message;
        messageDiv.className = `message ${type}`;
        messageDiv.style.display = "block";
        
        setTimeout(() => {
            messageDiv.style.display = "none";
        }, 3000);
    }
}

function validateName(name) {
    // Check if name contains only letters and spaces
    const nameRegex = /^[a-zA-Z\s]+$/;
    return nameRegex.test(name);
}