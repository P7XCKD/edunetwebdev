// Smart Study Planner - Kanban Style (NotesHub inspired)
class StudyPlannerKanban {
    constructor() {
        this.cards = JSON.parse(localStorage.getItem('studyCards')) || [];
        this.currentEditId = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderCards();
        this.updateStats();
    }

    setupEventListeners() {
        // Header buttons
        document.getElementById('addCardBtn').addEventListener('click', () => {
            this.openCardModal();
        });
        
        document.getElementById('statsBtn').addEventListener('click', () => {
            this.openStatsModal();
        });

        // Column add buttons
        document.querySelectorAll('.add-card-column-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const status = e.target.dataset.status;
                this.openCardModal(null, status);
            });
        });

        // Modal event listeners
        document.getElementById('closeModal').addEventListener('click', () => {
            this.closeCardModal();
        });

        document.getElementById('closeStatsModal').addEventListener('click', () => {
            this.closeStatsModal();
        });

        document.getElementById('saveCard').addEventListener('click', () => {
            this.saveCard();
        });

        document.getElementById('cancelCard').addEventListener('click', () => {
            this.closeCardModal();
        });

        document.getElementById('deleteCard').addEventListener('click', () => {
            this.deleteCard();
        });

        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            const cardModal = document.getElementById('cardModal');
            const statsModal = document.getElementById('statsModal');
            
            if (e.target === cardModal) {
                this.closeCardModal();
            }
            if (e.target === statsModal) {
                this.closeStatsModal();
            }
        });
    }

    openCardModal(card = null, defaultStatus = 'todo') {
        const modal = document.getElementById('cardModal');
        const titleElement = document.getElementById('modalTitle');
        const deleteBtn = document.getElementById('deleteCard');

        if (card) {
            // Edit existing card
            this.currentEditId = card.id;
            titleElement.textContent = 'Edit Card';
            deleteBtn.style.display = 'block';
            
            document.getElementById('cardTitle').value = card.title;
            document.getElementById('cardDueDate').value = card.dueDate || '';
            document.getElementById('cardPriority').value = card.priority;
            document.getElementById('cardSubject').value = card.subject || '';
            document.getElementById('cardDescription').value = card.description || '';
        } else {
            // Create new card
            this.currentEditId = null;
            titleElement.textContent = 'Add New Card';
            deleteBtn.style.display = 'none';
            
            document.getElementById('cardTitle').value = '';
            document.getElementById('cardDueDate').value = '';
            document.getElementById('cardPriority').value = 'medium';
            document.getElementById('cardSubject').value = '';
            document.getElementById('cardDescription').value = '';
        }

        modal.style.display = 'block';
        document.getElementById('cardTitle').focus();
    }

    closeCardModal() {
        document.getElementById('cardModal').style.display = 'none';
        this.currentEditId = null;
    }

    openStatsModal() {
        this.updateStats();
        document.getElementById('statsModal').style.display = 'block';
    }

    closeStatsModal() {
        document.getElementById('statsModal').style.display = 'none';
    }

    saveCard() {
        const title = document.getElementById('cardTitle').value.trim();
        const dueDate = document.getElementById('cardDueDate').value;
        const priority = document.getElementById('cardPriority').value;
        const subject = document.getElementById('cardSubject').value.trim();
        const description = document.getElementById('cardDescription').value.trim();

        if (!title) {
            alert('Title is required');
            return;
        }

        const cardData = {
            title,
            dueDate,
            priority,
            subject,
            description,
            createdAt: new Date().toISOString()
        };

        if (this.currentEditId) {
            // Update existing card
            const cardIndex = this.cards.findIndex(c => c.id === this.currentEditId);
            if (cardIndex !== -1) {
                this.cards[cardIndex] = { ...this.cards[cardIndex], ...cardData };
                this.showNotification('Card updated successfully');
            }
        } else {
            // Create new card
            const newCard = {
                id: Date.now(),
                status: 'todo',
                ...cardData
            };
            this.cards.push(newCard);
            this.showNotification('Card created successfully');
        }

        this.saveToStorage();
        this.renderCards();
        this.updateStats();
        this.closeCardModal();
    }

    deleteCard() {
        if (!this.currentEditId) return;

        if (confirm('Are you sure you want to delete this card?')) {
            this.cards = this.cards.filter(c => c.id !== this.currentEditId);
            this.saveToStorage();
            this.renderCards();
            this.updateStats();
            this.closeCardModal();
            this.showNotification('Card deleted successfully');
        }
    }

    moveCard(cardId, newStatus) {
        const card = this.cards.find(c => c.id === cardId);
        if (card && card.status !== newStatus) {
            card.status = newStatus;
            this.saveToStorage();
            this.renderCards();
            this.updateStats();
            this.showNotification(`Card moved to ${this.getStatusLabel(newStatus)}`);
        }
    }

    getStatusLabel(status) {
        const labels = {
            'todo': 'To Do',
            'in-progress': 'In Progress',
            'completed': 'Completed'
        };
        return labels[status] || status;
    }

    renderCards() {
        const columns = {
            'todo': document.getElementById('todoColumn'),
            'in-progress': document.getElementById('inProgressColumn'),
            'completed': document.getElementById('completedColumn')
        };

        // Clear all columns
        Object.values(columns).forEach(column => {
            const cards = column.querySelectorAll('.study-card');
            cards.forEach(card => card.remove());
        });

        // Group cards by status
        const cardsByStatus = {
            'todo': [],
            'in-progress': [],
            'completed': []
        };

        this.cards.forEach(card => {
            if (cardsByStatus[card.status]) {
                cardsByStatus[card.status].push(card);
            }
        });

        // Sort cards by priority and due date
        Object.keys(cardsByStatus).forEach(status => {
            cardsByStatus[status].sort((a, b) => {
                // First by priority
                const priorityOrder = { high: 3, medium: 2, low: 1 };
                const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
                if (priorityDiff !== 0) return priorityDiff;

                // Then by due date
                if (a.dueDate && b.dueDate) {
                    return new Date(a.dueDate) - new Date(b.dueDate);
                }
                if (a.dueDate && !b.dueDate) return -1;
                if (!a.dueDate && b.dueDate) return 1;
                
                return 0;
            });
        });

        // Render cards in each column
        Object.keys(cardsByStatus).forEach(status => {
            const column = columns[status];
            const addButton = column.querySelector('.add-card-column-btn');
            
            cardsByStatus[status].forEach(card => {
                const cardElement = this.createCardElement(card);
                column.insertBefore(cardElement, addButton);
            });
        });
    }

    createCardElement(card) {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'study-card';
        cardDiv.setAttribute('data-id', card.id);

        const isOverdue = card.dueDate && new Date(card.dueDate) < new Date() && card.status !== 'completed';
        const isTomorrow = card.dueDate && this.isTomorrow(card.dueDate);

        let dueDateHtml = '';
        if (card.dueDate) {
            const formattedDate = new Date(card.dueDate).toLocaleDateString();
            let dueDateClass = '';
            let dueDateText = formattedDate;

            if (isOverdue) {
                dueDateClass = 'overdue';
                dueDateText = `${formattedDate} (overdue)`;
            } else if (isTomorrow) {
                dueDateClass = 'tomorrow';
                dueDateText = `${formattedDate} (tomorrow)`;
            }

            dueDateHtml = `<span class="card-due-date ${dueDateClass}">${dueDateText}</span>`;
        }

        cardDiv.innerHTML = `
            <div class="card-title">${card.title}</div>
            <div class="card-meta">
                ${card.subject ? `<span class="card-subject">${card.subject}</span>` : ''}
                ${dueDateHtml}
                <span class="priority-tag priority-${card.priority}">${card.priority}</span>
            </div>
            ${card.description ? `<div class="card-description">${card.description}</div>` : ''}
        `;

        // Add click handler to edit card
        cardDiv.addEventListener('click', () => {
            this.openCardModal(card);
        });

        // Add context menu for status change
        cardDiv.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.showContextMenu(e, card);
        });

        return cardDiv;
    }

    showContextMenu(event, card) {
        // Remove existing context menu
        const existingMenu = document.querySelector('.context-menu');
        if (existingMenu) {
            existingMenu.remove();
        }

        const menu = document.createElement('div');
        menu.className = 'context-menu';
        menu.style.cssText = `
            position: fixed;
            top: ${event.clientY}px;
            left: ${event.clientX}px;
            background: #3d3d3d;
            border: 1px solid #555;
            border-radius: 6px;
            padding: 8px 0;
            z-index: 1001;
            min-width: 150px;
        `;

        const statuses = [
            { key: 'todo', label: 'To Do' },
            { key: 'in-progress', label: 'In Progress' },
            { key: 'completed', label: 'Completed' }
        ];

        statuses.forEach(status => {
            if (status.key !== card.status) {
                const item = document.createElement('div');
                item.style.cssText = `
                    padding: 8px 16px;
                    color: #e1e1e1;
                    cursor: pointer;
                    font-size: 14px;
                `;
                item.textContent = `Move to ${status.label}`;
                
                item.addEventListener('mouseover', () => {
                    item.style.backgroundColor = '#4d4d4d';
                });
                
                item.addEventListener('mouseout', () => {
                    item.style.backgroundColor = 'transparent';
                });

                item.addEventListener('click', () => {
                    this.moveCard(card.id, status.key);
                    menu.remove();
                });

                menu.appendChild(item);
            }
        });

        document.body.appendChild(menu);

        // Remove menu when clicking elsewhere
        const removeMenu = () => {
            if (menu.parentNode) {
                menu.remove();
            }
            document.removeEventListener('click', removeMenu);
        };
        
        setTimeout(() => {
            document.addEventListener('click', removeMenu);
        }, 100);
    }

    isTomorrow(dateString) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const cardDate = new Date(dateString);
        
        return tomorrow.toDateString() === cardDate.toDateString();
    }

    updateStats() {
        const stats = {
            total: this.cards.length,
            todo: this.cards.filter(c => c.status === 'todo').length,
            inProgress: this.cards.filter(c => c.status === 'in-progress').length,
            completed: this.cards.filter(c => c.status === 'completed').length,
            overdue: this.cards.filter(c => 
                c.dueDate && 
                new Date(c.dueDate) < new Date() && 
                c.status !== 'completed'
            ).length
        };

        // Update header stats if elements exist
        const totalElement = document.getElementById('totalCards');
        const todoElement = document.getElementById('todoCards');
        const inProgressElement = document.getElementById('inProgressCards');
        const completedElement = document.getElementById('completedCards');
        const overdueElement = document.getElementById('overdueCards');

        if (totalElement) totalElement.textContent = stats.total;
        if (todoElement) todoElement.textContent = stats.todo;
        if (inProgressElement) inProgressElement.textContent = stats.inProgress;
        if (completedElement) completedElement.textContent = stats.completed;
        if (overdueElement) overdueElement.textContent = stats.overdue;
    }

    saveToStorage() {
        localStorage.setItem('studyCards', JSON.stringify(this.cards));
    }

    showNotification(message) {
        // Create toast notification
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 12px 20px;
            border-radius: 6px;
            z-index: 1002;
            font-size: 14px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
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

    // Export functionality
    exportData() {
        const dataStr = JSON.stringify(this.cards, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = 'study-planner-backup.json';
        link.click();
        
        URL.revokeObjectURL(url);
        this.showNotification('Data exported successfully');
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    window.studyPlanner = new StudyPlannerKanban();
    
    console.log('Smart Study Planner (Kanban) loaded successfully!');
    console.log('Right-click on cards to move between columns');
    console.log('Press Ctrl+E to export your data');
    
    // Export shortcut
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'e') {
            e.preventDefault();
            studyPlanner.exportData();
        }
    });
});
