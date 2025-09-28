// Manager Panel JavaScript
class ManagerPanel {
    constructor() {
        this.agents = JSON.parse(localStorage.getItem('salesAgents')) || [];
        this.init();
    }

    init() {
        this.loadManagerInfo();
        this.setupEventListeners();
        this.renderAgentsList();
    }

    loadManagerInfo() {
        // In a real app, this would come from authentication
        const managerName = localStorage.getItem('managerName') || 'Manager';
        document.getElementById('manager-name').textContent = managerName;
    }

    setupEventListeners() {
        // Form submission
        document.getElementById('create-agent-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.createAgent();
        });

        // Password generation
        document.getElementById('generate-password').addEventListener('click', () => {
            this.generatePassword();
        });

        // Password confirmation check
        document.getElementById('confirm-password').addEventListener('input', () => {
            this.checkPasswordMatch();
        });

        // Password strength check
        document.getElementById('agent-password').addEventListener('input', () => {
            this.checkPasswordStrength();
        });

        // Form reset
        document.getElementById('reset-form').addEventListener('click', () => {
            this.resetForm();
        });

        // Credentials actions
        document.getElementById('copy-credentials').addEventListener('click', () => {
            this.copyCredentials();
        });

        document.getElementById('print-credentials').addEventListener('click', () => {
            this.printCredentials();
        });

        document.getElementById('close-credentials').addEventListener('click', () => {
            this.hideCredentials();
        });

        // Search functionality
        document.getElementById('search-agents').addEventListener('input', (e) => {
            this.searchAgents(e.target.value);
        });
    }

    createAgent() {
        const formData = this.getFormData();

        if (!this.validateForm(formData)) {
            return;
        }

        const agent = {
            id: Date.now().toString(),
            name: formData.name,
            email: formData.email,
            region: formData.region,
            phone: formData.phone,
            password: formData.password,
            createdAt: new Date().toISOString(),
            createdBy: document.getElementById('manager-name').textContent
        };

        this.agents.push(agent);
        this.saveAgents();
        this.showCredentials(agent);
        this.renderAgentsList();
        this.resetForm();

        this.showAlert('Sales agent account created successfully!', 'success');
    }

    getFormData() {
        return {
            name: document.getElementById('agent-name').value.trim(),
            email: document.getElementById('agent-email').value.trim(),
            region: document.getElementById('agent-region').value,
            phone: document.getElementById('agent-phone').value.trim(),
            password: document.getElementById('agent-password').value
        };
    }

    validateForm(data) {
        if (!data.name) {
            this.showAlert('Please enter the agent\'s full name', 'error');
            return false;
        }

        if (!data.email || !this.isValidEmail(data.email)) {
            this.showAlert('Please enter a valid email address', 'error');
            return false;
        }

        if (!data.region) {
            this.showAlert('Please select a sales region', 'error');
            return false;
        }

        if (!data.phone) {
            this.showAlert('Please enter a phone number', 'error');
            return false;
        }

        if (!data.password) {
            this.showAlert('Please create a password', 'error');
            return false;
        }

        if (data.password.length < 6) {
            this.showAlert('Password must be at least 6 characters long', 'error');
            return false;
        }

        if (data.password !== document.getElementById('confirm-password').value) {
            this.showAlert('Passwords do not match', 'error');
            return false;
        }

        // Check if email already exists
        if (this.agents.some(agent => agent.email === data.email)) {
            this.showAlert('An agent with this email already exists', 'error');
            return false;
        }

        return true;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    generatePassword() {
        const length = 12;
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
        let password = "";

        for (let i = 0; i < length; i++) {
            password += charset.charAt(Math.floor(Math.random() * charset.length));
        }

        document.getElementById('agent-password').value = password;
        document.getElementById('confirm-password').value = password;
        this.checkPasswordStrength();
        this.checkPasswordMatch();
    }

    checkPasswordStrength() {
        const password = document.getElementById('agent-password').value;
        const strengthBar = document.querySelector('.strength-bar');
        const strengthText = document.querySelector('.strength-text');

        let strength = 0;
        let color = '#dc3545';
        let text = 'Weak';

        if (password.length >= 8) strength += 25;
        if (/[A-Z]/.test(password)) strength += 25;
        if (/[0-9]/.test(password)) strength += 25;
        if (/[^A-Za-z0-9]/.test(password)) strength += 25;

        if (strength >= 75) {
            color = '#28a745';
            text = 'Strong';
        } else if (strength >= 50) {
            color = '#ffc107';
            text = 'Medium';
        }

        strengthBar.style.setProperty('--strength-color', color);
        strengthBar.querySelector('::after').style.width = strength + '%';
        strengthBar.style.background = `linear-gradient(to right, ${color} ${strength}%, #e9ecef ${strength}%)`;
        strengthText.textContent = text + ' password';
        strengthText.style.color = color;
    }

    checkPasswordMatch() {
        const password = document.getElementById('agent-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        const matchElement = document.getElementById('password-match');

        if (!confirmPassword) {
            matchElement.textContent = '';
            return;
        }

        if (password === confirmPassword) {
            matchElement.textContent = '✓ Passwords match';
            matchElement.style.color = '#28a745';
        } else {
            matchElement.textContent = '✗ Passwords do not match';
            matchElement.style.color = '#dc3545';
        }
    }

    showCredentials(agent) {
        document.getElementById('display-name').textContent = agent.name;
        document.getElementById('display-email').textContent = agent.email;
        document.getElementById('display-password').textContent = agent.password;
        document.getElementById('display-region').textContent = agent.region;

        document.getElementById('credentials-display').style.display = 'block';
    }

    hideCredentials() {
        document.getElementById('credentials-display').style.display = 'none';
    }

    copyCredentials() {
        const credentials = `
Full Name: ${document.getElementById('display-name').textContent}
Email: ${document.getElementById('display-email').textContent}
Password: ${document.getElementById('display-password').textContent}
Region: ${document.getElementById('display-region').textContent}
        `.trim();

        navigator.clipboard.writeText(credentials).then(() => {
            this.showAlert('Credentials copied to clipboard!', 'success');
        }).catch(() => {
            this.showAlert('Failed to copy credentials', 'error');
        });
    }

    printCredentials() {
        window.print();
    }

    resetForm() {
        document.getElementById('create-agent-form').reset();
        document.querySelector('.strength-bar').style.background = '#e9ecef';
        document.querySelector('.strength-text').textContent = 'Password strength';
        document.querySelector('.strength-text').style.color = '#6c757d';
        document.getElementById('password-match').textContent = '';
        this.hideCredentials();
    }

    renderAgentsList() {
        const agentsList = document.getElementById('agents-list');
        const emptyState = agentsList.querySelector('.empty-state');

        if (this.agents.length === 0) {
            emptyState.style.display = 'block';
            agentsList.innerHTML = '';
            agentsList.appendChild(emptyState);
            return;
        }

        emptyState.style.display = 'none';

        agentsList.innerHTML = this.agents.map(agent => `
            <div class="user-item" data-agent-id="${agent.id}">
                <div class="user-details">
                    <h4>${agent.name}</h4>
                    <p>${agent.region} • ${agent.email} • ${agent.phone}</p>
                    <div class="user-credentials">
                        <strong>Password:</strong> ${this.maskPassword(agent.password)}
                    </div>
                </div>
                <div class="user-actions">
                    <button class="btn-view" onclick="managerPanel.viewCredentials('${agent.id}')">
                        View Credentials
                    </button>
                    <button class="btn-reset" onclick="managerPanel.resetPassword('${agent.id}')">
                        Reset Password
                    </button>
                    <button class="btn-delete" onclick="managerPanel.deleteAgent('${agent.id}')">
                        Delete
                    </button>
                </div>
            </div>
        `).join('');
    }

    maskPassword(password) {
        return '•'.repeat(8);
    }

    viewCredentials(agentId) {
        const agent = this.agents.find(a => a.id === agentId);
        if (agent) {
            this.showCredentials(agent);
            this.showAlert('Agent credentials displayed', 'success');
        }
    }

    resetPassword(agentId) {
        const agent = this.agents.find(a => a.id === agentId);
        if (agent) {
            const newPassword = this.generateStrongPassword();
            agent.password = newPassword;
            this.saveAgents();

            // Show new credentials
            this.showCredentials(agent);
            this.showAlert('Password reset successfully! New credentials displayed.', 'success');
        }
    }

    generateStrongPassword() {
        const length = 12;
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
        let password = "";

        for (let i = 0; i < length; i++) {
            password += charset.charAt(Math.floor(Math.random() * charset.length));
        }

        return password;
    }

    deleteAgent(agentId) {
        if (confirm('Are you sure you want to delete this sales agent? This action cannot be undone.')) {
            this.agents = this.agents.filter(agent => agent.id !== agentId);
            this.saveAgents();
            this.renderAgentsList();
            this.showAlert('Sales agent deleted successfully', 'success');
        }
    }

    searchAgents(query) {
        const filteredAgents = this.agents.filter(agent =>
            agent.name.toLowerCase().includes(query.toLowerCase()) ||
            agent.email.toLowerCase().includes(query.toLowerCase()) ||
            agent.region.toLowerCase().includes(query.toLowerCase())
        );

        this.renderFilteredAgents(filteredAgents);
    }

    renderFilteredAgents(agents) {
        const agentsList = document.getElementById('agents-list');

        if (agents.length === 0) {
            agentsList.innerHTML = '<div class="empty-state"><p>No agents found matching your search</p></div>';
            return;
        }

        agentsList.innerHTML = agents.map(agent => `
            <div class="user-item" data-agent-id="${agent.id}">
                <div class="user-details">
                    <h4>${agent.name}</h4>
                    <p>${agent.region} • ${agent.email} • ${agent.phone}</p>
                    <div class="user-credentials">
                        <strong>Password:</strong> ${this.maskPassword(agent.password)}
                    </div>
                </div>
                <div class="user-actions">
                    <button class="btn-view" onclick="managerPanel.viewCredentials('${agent.id}')">
                        View Credentials
                    </button>
                    <button class="btn-reset" onclick="managerPanel.resetPassword('${agent.id}')">
                        Reset Password
                    </button>
                    <button class="btn-delete" onclick="managerPanel.deleteAgent('${agent.id}')">
                        Delete
                    </button>
                </div>
            </div>
        `).join('');
    }

    saveAgents() {
        localStorage.setItem('salesAgents', JSON.stringify(this.agents));
    }

    showAlert(message, type) {
        const alertContainer = document.getElementById('global-alert');
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.innerHTML = `
            <span>${message}</span>
            <button class="close-alert">&times;</button>
        `;

        alertContainer.appendChild(alert);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (alert.parentNode) {
                alert.parentNode.removeChild(alert);
            }
        }, 5000);

        // Close button functionality
        alert.querySelector('.close-alert').addEventListener('click', () => {
            alert.parentNode.removeChild(alert);
        });
    }
}

// Initialize the manager panel when the page loads
const managerPanel = new ManagerPanel();

// Add CSS for strength bar
const style = document.createElement('style');
style.textContent = `
    .strength-bar::after {
        content: '';
        display: block;
        height: 100%;
        width: var(--strength-width, 0%);
        background: var(--strength-color, #dc3545);
        transition: all 0.3s;
    }
`;
document.head.appendChild(style);