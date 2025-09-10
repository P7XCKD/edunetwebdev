// Study Planner Application
class StudyPlanner {
    constructor() {
        this.goals = JSON.parse(localStorage.getItem('studyGoals')) || [];
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.displayGoals();
        this.updateStats();
    }

    setupEventListeners() {
        // Form submission
        document.getElementById('studyForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addGoal();
        });

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });
    }

    addGoal() {
        const subject = document.getElementById('subject').value.trim();
        const topic = document.getElementById('topic').value.trim();
        const dueDate = document.getElementById('dueDate').value;
        const priority = document.getElementById('priority').value;
        const description = document.getElementById('description').value.trim();

        if (!subject || !topic || !dueDate) {
            alert('Please fill in all required fields.');
            return;
        }

        const newGoal = {
            id: Date.now(),
            subject: subject,
            topic: topic,
            dueDate: dueDate,
            priority: priority,
            description: description,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.goals.push(newGoal);
        this.saveToLocalStorage();
        this.displayGoals();
        this.updateStats();
        this.clearForm();
        
        // Show success message
        this.showMessage('Study goal added successfully!', 'success');
    }

    deleteGoal(id) {
        if (confirm('Are you sure you want to delete this goal?')) {
            this.goals = this.goals.filter(goal => goal.id !== id);
            this.saveToLocalStorage();
            this.displayGoals();
            this.updateStats();
            this.showMessage('Goal deleted successfully!', 'success');
        }
    }

    toggleComplete(id) {
        const goal = this.goals.find(g => g.id === id);
        if (goal) {
            goal.completed = !goal.completed;
            goal.completedAt = goal.completed ? new Date().toISOString() : null;
            this.saveToLocalStorage();
            this.displayGoals();
            this.updateStats();
            
            const message = goal.completed ? 'Goal completed! 🎉' : 'Goal marked as pending';
            this.showMessage(message, 'success');
        }
    }

    setFilter(filter) {
        this.currentFilter = filter;
        
        // Update active filter button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
        
        this.displayGoals();
    }

    getFilteredGoals() {
        switch (this.currentFilter) {
            case 'completed':
                return this.goals.filter(goal => goal.completed);
            case 'pending':
                return this.goals.filter(goal => !goal.completed);
            default:
                return this.goals;
        }
    }

    isOverdue(dueDate) {
        const today = new Date();
        const due = new Date(dueDate);
        return due < today;
    }

    displayGoals() {
        const goalsList = document.getElementById('goalsList');
        const filteredGoals = this.getFilteredGoals();

        if (filteredGoals.length === 0) {
            goalsList.innerHTML = `
                <div class="empty-state">
                    <h3>No goals found</h3>
                    <p>Start by adding your first study goal!</p>
                </div>
            `;
            return;
        }

        // Sort goals: pending first, then by due date, then by priority
        filteredGoals.sort((a, b) => {
            // Completed goals at the end
            if (a.completed && !b.completed) return 1;
            if (!a.completed && b.completed) return -1;
            
            // Then by due date
            const dateA = new Date(a.dueDate);
            const dateB = new Date(b.dueDate);
            if (dateA !== dateB) return dateA - dateB;
            
            // Then by priority (high > medium > low)
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        });

        goalsList.innerHTML = filteredGoals.map(goal => {
            const overdue = !goal.completed && this.isOverdue(goal.dueDate);
            const dueDate = new Date(goal.dueDate).toLocaleDateString();
            
            return `
                <div class="goal-item ${goal.completed ? 'completed' : ''} ${overdue ? 'overdue' : ''}">
                    <div class="goal-header">
                        <div class="goal-title">${goal.topic}</div>
                        <div class="goal-subject">${goal.subject}</div>
                    </div>
                    
                    <div class="goal-info">
                        <span><strong>Due:</strong> ${dueDate} ${overdue ? '⚠️ Overdue' : ''}</span>
                        <span class="priority ${goal.priority}">
                            ${goal.priority.toUpperCase()}
                        </span>
                        <span><strong>Status:</strong> ${goal.completed ? '✅ Completed' : '⏳ Pending'}</span>
                    </div>
                    
                    ${goal.description ? `<div class="goal-description">"${goal.description}"</div>` : ''}
                    
                    <div class="goal-actions">
                        <button class="btn-complete ${goal.completed ? 'disabled' : ''}" 
                                onclick="planner.toggleComplete(${goal.id})"
                                ${goal.completed ? 'disabled' : ''}>
                            ${goal.completed ? 'Completed ✓' : 'Mark Complete'}
                        </button>
                        <button class="btn-delete" onclick="planner.deleteGoal(${goal.id})">
                            Delete
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    updateStats() {
        const totalGoals = this.goals.length;
        const completedGoals = this.goals.filter(g => g.completed).length;
        const pendingGoals = totalGoals - completedGoals;
        const overdueGoals = this.goals.filter(g => !g.completed && this.isOverdue(g.dueDate)).length;

        document.getElementById('totalGoals').textContent = totalGoals;
        document.getElementById('completedGoals').textContent = completedGoals;
        document.getElementById('pendingGoals').textContent = pendingGoals;
        document.getElementById('overdue').textContent = overdueGoals;
    }

    clearForm() {
        document.getElementById('studyForm').reset();
        // Set default date to tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        document.getElementById('dueDate').value = tomorrow.toISOString().split('T')[0];
    }

    saveToLocalStorage() {
        localStorage.setItem('studyGoals', JSON.stringify(this.goals));
    }

    showMessage(message, type = 'info') {
        // Create a simple toast notification
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background: ${type === 'success' ? '#27ae60' : '#3498db'};
            color: white;
            border-radius: 4px;
            z-index: 1000;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        `;
        toast.textContent = message;
        document.body.appendChild(toast);

        // Remove toast after 3 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 3000);
    }

    // Export data functionality (bonus feature)
    exportData() {
        const dataStr = JSON.stringify(this.goals, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = 'study-goals-backup.json';
        link.click();
        
        URL.revokeObjectURL(url);
        this.showMessage('Data exported successfully!', 'success');
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.planner = new StudyPlanner();
    
    // Set default date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    document.getElementById('dueDate').value = tomorrow.toISOString().split('T')[0];
    
    // Optional: Add export functionality
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'e') {
            e.preventDefault();
            planner.exportData();
        }
    });
    
    console.log('Smart Study Planner loaded successfully!');
    console.log('Pro tip: Press Ctrl+E to export your data');
});
