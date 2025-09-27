// Data storage (in a real app, this would be a database)
let managers = JSON.parse(localStorage.getItem('mayondo_managers')) || [];
let salesAgents = JSON.parse(localStorage.getItem('mayondo_sales_agents')) || [];
let currentManager = null;

// DOM Elements
let tabs, tabContents, createManagerForm, managerLoginForm, createAgentForm;
let credentialsDisplay, managersList, agentsList, userInfo, copyCredentialsBtn, globalAlert;

// Initialize the application
document.addEventListener('DOMContentLoaded', function () {
    console.log('Settings.js loaded successfully');
    initializeApp();
});

function initializeApp() {
    console.log('Initializing app...');

    // Initialize DOM elements
    initializeDOMElements();

    // Set up tab switching
    setupTabs();

    // Set up form event listeners
    setupForms();

    // Load initial data
    loadInitialData();

    // Check URL hash for tab navigation
    checkUrlHash();
}

function initializeDOMElements() {
    tabs = document.querySelectorAll('.tab-btn');
    tabContents = document.querySelectorAll('.tab-content');
    createManagerForm = document.getElementById('create-manager-form');
    managerLoginForm = document.getElementById('manager-login-form');
    createAgentForm = document.getElementById('create-agent-form');
    credentialsDisplay = document.getElementById('credentials-display');
    managersList = document.getElementById('managers-list');
    agentsList = document.getElementById('agents-list');
    userInfo = document.getElementById('user-info');
    copyCredentialsBtn = document.getElementById('copy-credentials');
    globalAlert = document.getElementById('global-alert');

    console.log('DOM Elements initialized:');
    console.log('- agentsList:', agentsList);
    console.log('- managersList:', managersList);
}

function setupTabs() {
    console.log('Setting up tabs...', tabs.length);

    tabs.forEach(tab => {
        tab.addEventListener('click', function (e) {
            e.preventDefault();
            console.log('Tab clicked:', this.getAttribute('data-tab'));

            const tabId = this.getAttribute('data-tab');
            switchTab(tabId);
        });
    });
}

function switchTab(tabId) {
    console.log('Switching to tab:', tabId);

    // Update active tab
    tabs.forEach(tab => {
        if (tab.getAttribute('data-tab') === tabId) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });

    // Show corresponding content
    tabContents.forEach(content => {
        if (content.id === tabId) {
            content.classList.add('active');
            console.log('Showing content:', content.id);

            // Refresh the data when switching to these tabs
            if (tabId === 'admin') {
                displayManagers();
            } else if (tabId === 'manager-panel' && currentManager) {
                displayAgents();
            }
        } else {
            content.classList.remove('active');
        }
    });

    // Update URL hash
    window.location.hash = tabId;

    // Update user info display
    updateUserInfo();

    // If switching to manager panel without login, redirect to login
    if (tabId === 'manager-panel' && !currentManager) {
        setTimeout(() => {
            showAlert('Please login first to access the manager panel', 'error');
            switchTab('manager-login');
        }, 100);
    }
}

function setupForms() {
    console.log('Setting up forms...');

    // Create manager form
    if (createManagerForm) {
        createManagerForm.addEventListener('submit', handleCreateManager);
    }

    // Manager login form
    if (managerLoginForm) {
        managerLoginForm.addEventListener('submit', handleManagerLogin);
    }

    // Create agent form
    if (createAgentForm) {
        createAgentForm.addEventListener('submit', handleCreateAgent);
    }

    // Copy credentials button
    if (copyCredentialsBtn) {
        copyCredentialsBtn.addEventListener('click', function () {
            copyCredentialsToClipboard();
        });
    }
}

function loadInitialData() {
    console.log('Loading initial data...');
    displayManagers();
    updateUserInfo();
}

function checkUrlHash() {
    const hash = window.location.hash.replace('#', '');
    console.log('URL hash:', hash);

    if (hash && document.getElementById(hash)) {
        console.log('Switching to tab from URL hash:', hash);
        switchTab(hash);
    } else {
        // Default to admin tab
        switchTab('admin');
    }
}

// Generate random password
function generatePassword() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
}

// Create manager account
function handleCreateManager(e) {
    e.preventDefault();
    console.log('Creating manager account...');

    const name = document.getElementById('manager-name').value;
    const email = document.getElementById('manager-email').value;
    const department = document.getElementById('manager-department').value;
    const sendMethod = document.getElementById('send-method').value;
    const phone = document.getElementById('manager-phone').value;

    // Validate email format
    if (!isValidEmail(email)) {
        showAlert('Please enter a valid email address', 'error');
        return;
    }

    // Check if email already exists
    if (managers.some(manager => manager.email === email)) {
        showAlert('A manager with this email already exists', 'error');
        return;
    }

    // Generate credentials
    const username = email.split('@')[0] + Math.floor(Math.random() * 100);
    const password = generatePassword();
    const loginUrl = window.location.href.split('#')[0] + '#manager-login';

    // Create manager object
    const manager = {
        id: Date.now(),
        name,
        email,
        department,
        phone,
        username,
        password,
        status: 'active',
        createdAt: new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    };

    // Save to storage
    managers.push(manager);
    localStorage.setItem('mayondo_managers', JSON.stringify(managers));

    // Clear previous credentials and display new ones
    clearCredentialsDisplay();
    document.getElementById('display-username').textContent = username;
    document.getElementById('display-password').textContent = password;
    document.getElementById('display-url').textContent = loginUrl;
    credentialsDisplay.style.display = 'block';

    // Show success message
    showAlert(`Manager account created successfully! Credentials sent via ${sendMethod}.`, 'success');

    // Update managers list
    displayManagers();

    // Reset form
    createManagerForm.reset();

    // Scroll to credentials
    credentialsDisplay.scrollIntoView({ behavior: 'smooth' });
}

// Manager login
function handleManagerLogin(e) {
    e.preventDefault();
    console.log('Manager login attempt...');

    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    // Find manager with matching credentials
    const manager = managers.find(m => m.username === username && m.password === password);

    if (manager) {
        if (manager.status === 'inactive') {
            showAlert('This account has been deactivated. Please contact an administrator.', 'error');
            return;
        }

        currentManager = manager;
        console.log('Login successful:', manager.name);

        // Show success and switch to manager panel
        showAlert('Login successful! Redirecting to manager panel...', 'success');

        // Update UI
        document.getElementById('manager-name-display').textContent = manager.name;
        displayAgents();

        // Switch to manager panel after a delay
        setTimeout(() => {
            switchTab('manager-panel');
        }, 1500);
    } else {
        console.log('Login failed - invalid credentials');
        showAlert('Invalid username or password. Please try again.', 'error');
    }

    // Reset form
    managerLoginForm.reset();
}

// Create sales agent account
function handleCreateAgent(e) {
    e.preventDefault();
    console.log('Creating sales agent account...');

    if (!currentManager) {
        showAlert('Please login to the manager panel first.', 'error');
        switchTab('manager-login');
        return;
    }

    const name = document.getElementById('agent-name').value;
    const email = document.getElementById('agent-email').value;
    const region = document.getElementById('agent-region').value;
    const phone = document.getElementById('agent-phone').value;

    // Validate email format
    if (!isValidEmail(email)) {
        showAlert('Please enter a valid email address', 'error');
        return;
    }

    // Check if email already exists
    if (salesAgents.some(agent => agent.email === email)) {
        showAlert('A sales agent with this email already exists', 'error');
        return;
    }

    // Generate credentials
    const username = email.split('@')[0] + Math.floor(Math.random() * 100);
    const password = generatePassword();

    // Create agent object
    const agent = {
        id: Date.now(),
        name,
        email,
        region,
        phone,
        username,
        password,
        managerId: currentManager.id,
        managerName: currentManager.name,
        status: 'active',
        createdAt: new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    };

    // Save to storage
    salesAgents.push(agent);
    localStorage.setItem('mayondo_sales_agents', JSON.stringify(salesAgents));

    // Show credentials in alert
    showAlert(`Sales agent account created successfully! 
    
    CREDENTIALS:
    Username: ${username}
    Password: ${password}
    
    Please save these credentials immediately!`, 'success');

    // Also show in a permanent box (like manager credentials)
    showAgentCredentials(username, password);

    // Update agents list
    displayAgents();

    // Reset form
    createAgentForm.reset();
}

// Function to show agent credentials permanently
function showAgentCredentials(username, password) {
    // Create or update credentials display for agents
    let agentCredentialsDiv = document.getElementById('agent-credentials-display');

    if (!agentCredentialsDiv) {
        agentCredentialsDiv = document.createElement('div');
        agentCredentialsDiv.id = 'agent-credentials-display';
        agentCredentialsDiv.className = 'credentials-card';
        agentCredentialsDiv.style.marginTop = '20px';

        // Insert after the create agent form
        createAgentForm.parentNode.insertBefore(agentCredentialsDiv, createAgentForm.nextSibling);
    }

    agentCredentialsDiv.innerHTML = `
        <h3>
            <i class="icon">🔑</i>
            Sales Agent Credentials
        </h3>
        <div class="credentials-info">
            <div class="credential-item">
                <span class="label">Username:</span>
                <span class="value">${username}</span>
            </div>
            <div class="credential-item">
                <span class="label">Password:</span>
                <span class="value">${password}</span>
            </div>
        </div>
        <button class="btn btn-secondary" onclick="copyAgentCredentials()">
            <i class="icon">📋</i>
            Copy Credentials
        </button>
    `;
    agentCredentialsDiv.style.display = 'block';
}

// Copy credentials to clipboard
function copyCredentialsToClipboard() {
    const username = document.getElementById('display-username').textContent;
    const password = document.getElementById('display-password').textContent;
    const url = document.getElementById('display-url').textContent;

    const text = `Mayondo Wood & Furniture - Manager Account Credentials\n\nUsername: ${username}\nPassword: ${password}\nLogin URL: ${url}\n\nPlease keep these credentials secure.`;

    navigator.clipboard.writeText(text).then(() => {
        showAlert('Credentials copied to clipboard!', 'success');
        copyCredentialsBtn.innerHTML = '<i class="icon">✓</i> Copied!';
        setTimeout(() => {
            copyCredentialsBtn.innerHTML = '<i class="icon">📋</i> Copy All Credentials';
        }, 2000);
    }).catch(err => {
        showAlert('Failed to copy credentials. Please copy manually.', 'error');
    });
}

// Display managers list
function displayManagers() {
    if (!managersList) {
        console.error('managersList element not found');
        return;
    }

    console.log('Displaying managers:', managers);

    managersList.innerHTML = '';

    if (managers.length === 0) {
        managersList.innerHTML = `
            <div class="empty-state">
                <i class="icon">👥</i>
                <p>No managers created yet</p>
            </div>
        `;
        return;
    }

    managers.forEach(manager => {
        const managerItem = document.createElement('div');
        managerItem.className = 'user-item';
        managerItem.innerHTML = `
            <div class="user-info">
                <h4>${manager.name}</h4>
                <p>${manager.email} | ${manager.department} Department</p>
                <p>Created: ${manager.createdAt} | Status: <span class="status-badge status-${manager.status}">${manager.status}</span></p>
            </div>
            <div class="user-actions">
                <button class="btn btn-secondary" onclick="resendCredentials(${manager.id})">
                    <i class="icon">📨</i>
                    Resend
                </button>
                <button class="btn ${manager.status === 'active' ? 'btn-secondary' : 'btn-primary'}" 
                        onclick="toggleManagerStatus(${manager.id})">
                    <i class="icon">${manager.status === 'active' ? '⏸️' : '▶️'}</i>
                    ${manager.status === 'active' ? 'Deactivate' : 'Activate'}
                </button>
            </div>
        `;
        managersList.appendChild(managerItem);
    });
}

// Display sales agents list
function displayAgents() {
    if (!agentsList) {
        console.error('agentsList element not found');
        // Try to find it again
        agentsList = document.getElementById('agents-list');
        if (!agentsList) {
            console.error('Still cannot find agents-list element');
            return;
        }
    }

    console.log('Displaying agents for manager:', currentManager?.id);

    // Filter agents by current manager
    const managerAgents = salesAgents.filter(agent => agent.managerId === currentManager?.id);

    console.log('Found agents:', managerAgents);

    agentsList.innerHTML = '';

    if (managerAgents.length === 0) {
        agentsList.innerHTML = `
            <div class="empty-state">
                <i class="icon">👥</i>
                <p>No sales agents registered yet</p>
            </div>
        `;
        return;
    }

    managerAgents.forEach(agent => {
        const agentItem = document.createElement('div');
        agentItem.className = 'user-item';
        agentItem.innerHTML = `
            <div class="user-info">
                <h4>${agent.name}</h4>
                <p>${agent.email} | ${agent.region} Region</p>
                <p>Created: ${agent.createdAt} | Status: <span class="status-badge status-${agent.status}">${agent.status}</span></p>
            </div>
            <div class="user-actions">
                <button class="btn btn-secondary" onclick="resendAgentCredentials(${agent.id})">
                    <i class="icon">📨</i>
                    Resend
                </button>
                <button class="btn ${agent.status === 'active' ? 'btn-secondary' : 'btn-primary'}" 
                        onclick="toggleAgentStatus(${agent.id})">
                    <i class="icon">${agent.status === 'active' ? '⏸️' : '▶️'}</i>
                    ${agent.status === 'active' ? 'Deactivate' : 'Activate'}
                </button>
            </div>
        `;
        agentsList.appendChild(agentItem);
    });

    console.log('Agents list updated with', managerAgents.length, 'agents');
}

// Show alert message
function showAlert(message, type) {
    if (!globalAlert) return;

    const typeClass = type === 'error' ? 'alert-error' : type === 'success' ? 'alert-success' : 'alert-info';

    globalAlert.innerHTML = `
        <div class="alert ${typeClass}">
            ${message}
        </div>
    `;

    // Auto-hide after 5 seconds
    setTimeout(() => {
        if (globalAlert) {
            globalAlert.innerHTML = '';
        }
    }, 5000);
}

// Update user info display
function updateUserInfo() {
    if (!userInfo) return;

    if (currentManager) {
        userInfo.innerHTML = `
            <i class="icon">👤</i>
            Logged in as: <strong>${currentManager.name}</strong> 
            | <a href="#" onclick="logout()" style="color: white; text-decoration: underline;">Logout</a>
        `;
    } else {
        userInfo.innerHTML = '';
    }
}

// Utility function to validate email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Function to copy agent credentials
window.copyAgentCredentials = function () {
    const agentCredentialsDiv = document.getElementById('agent-credentials-display');
    if (agentCredentialsDiv) {
        const username = agentCredentialsDiv.querySelector('.credential-item .value').textContent;
        const password = agentCredentialsDiv.querySelectorAll('.credential-item .value')[1].textContent;

        const text = `Sales Agent Credentials:\nUsername: ${username}\nPassword: ${password}`;

        navigator.clipboard.writeText(text).then(() => {
            showAlert('Agent credentials copied to clipboard!', 'success');
        });
    }
};

// Function to clear credentials display
function clearCredentialsDisplay() {
    document.getElementById('display-username').textContent = '';
    document.getElementById('display-password').textContent = '';
    document.getElementById('display-url').textContent = '';
    if (credentialsDisplay) {
        credentialsDisplay.style.display = 'none';
    }
}

// Manager functions (called from HTML)
window.resendCredentials = function (managerId) {
    const manager = managers.find(m => m.id === managerId);
    if (manager) {
        // Switch to admin tab first (in case we're on another tab)
        switchTab('admin');

        // Wait a bit for the tab switch to complete, then display credentials
        setTimeout(() => {
            // Fill the credentials display form
            document.getElementById('display-username').textContent = manager.username;
            document.getElementById('display-password').textContent = manager.password;
            document.getElementById('display-url').textContent = window.location.href.split('#')[0] + '#manager-login';

            // Show the credentials display
            credentialsDisplay.style.display = 'block';

            // Scroll to the credentials section
            credentialsDisplay.scrollIntoView({ behavior: 'smooth' });

            // Show success message
            showAlert(`Credentials for ${manager.name} displayed above. You can now copy them.`, 'success');
        }, 300);
    }
};

window.resendAgentCredentials = function (agentId) {
    const agent = salesAgents.find(a => a.id === agentId);
    if (agent) {
        // Switch to manager panel first
        switchTab('manager-panel');

        // Wait a bit for the tab switch to complete, then display credentials
        setTimeout(() => {
            // Show credentials in the agent credentials display
            showAgentCredentials(agent.username, agent.password);

            // Scroll to the credentials section
            const agentCredentialsDiv = document.getElementById('agent-credentials-display');
            if (agentCredentialsDiv) {
                agentCredentialsDiv.scrollIntoView({ behavior: 'smooth' });
            }

            // Show success message
            showAlert(`Credentials for ${agent.name} displayed above. You can now copy them.`, 'success');
        }, 300);
    }
};

window.toggleManagerStatus = function (managerId) {
    const manager = managers.find(m => m.id === managerId);
    if (manager) {
        manager.status = manager.status === 'active' ? 'inactive' : 'active';
        localStorage.setItem('mayondo_managers', JSON.stringify(managers));
        displayManagers();

        showAlert(`Manager ${manager.name} has been ${manager.status === 'active' ? 'activated' : 'deactivated'}`, 'success');
    }
};

window.toggleAgentStatus = function (agentId) {
    const agent = salesAgents.find(a => a.id === agentId);
    if (agent) {
        agent.status = agent.status === 'active' ? 'inactive' : 'active';
        localStorage.setItem('mayondo_sales_agents', JSON.stringify(salesAgents));
        displayAgents();

        showAlert(`Sales agent ${agent.name} has been ${agent.status === 'active' ? 'activated' : 'deactivated'}`, 'success');
    }
};

window.logout = function () {
    currentManager = null;
    updateUserInfo();
    showAlert('You have been logged out successfully', 'success');
    switchTab('admin');
    return false;
};

// Debug function
window.debugState = function () {
    console.log('Current Manager:', currentManager);
    console.log('All Managers:', managers);
    console.log('All Agents:', salesAgents);
    console.log('Active Tab:', document.querySelector('.tab-btn.active')?.getAttribute('data-tab'));
    console.log('agentsList element:', document.getElementById('agents-list'));
};

// Force refresh agents display
window.refreshAgents = function () {
    console.log('Forcing agents refresh...');
    displayAgents();
};