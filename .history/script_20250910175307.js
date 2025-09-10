// Smart Study Planner - Kanban Style with Dynamic Columns
class StudyPlannerKanban {
    constructor() {
        this.cards = JSON.parse(localStorage.getItem('studyCards')) || [];
        this.columns = JSON.parse(localStorage.getItem('studyColumns')) || this.getDefaultColumns();
        this.currentEditId = null;
        this.currentEditColumnId = null;
        this.init();
    }

    getDefaultColumns() {
        return [
            { id: 'todo', name: 'To Do', color: 'default', order: 1 },
            { id: 'in-progress', name: 'In Progress', color: 'blue', order: 2 },
            { id: 'completed', name: 'Completed', color: 'green', order: 3 }
        ];
    }

    init() {
        this.setupEventListeners();
        this.renderColumns();
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

        // Add column button
        document.getElementById('addColumnBtn').addEventListener('click', () => {
            this.openColumnModal();
        });

        // Column modal events
        document.getElementById('closeColumnModal').addEventListener('click', () => {
            this.closeColumnModal();
        });

        document.getElementById('saveColumn').addEventListener('click', () => {
            this.saveColumn();
        });

        document.getElementById('cancelColumn').addEventListener('click', () => {
            this.closeColumnModal();
        });

        document.getElementById('deleteColumn').addEventListener('click', () => {
            this.deleteColumn();
        });

        // Card modal events
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
            const columnModal = document.getElementById('columnModal');
            
            if (e.target === cardModal) {
                this.closeCardModal();
            }
            if (e.target === statsModal) {
                this.closeStatsModal();
            }
            if (e.target === columnModal) {
                this.closeColumnModal();
            }
        });
    }

    // Column Management
    openColumnModal(column = null) {
        const modal = document.getElementById('columnModal');
        const titleElement = document.getElementById('columnModalTitle');
        const deleteBtn = document.getElementById('deleteColumn');

        if (column) {
            // Edit existing column
            this.currentEditColumnId = column.id;
            titleElement.textContent = 'Edit Section';
            deleteBtn.style.display = 'block';
            
            document.getElementById('columnName').value = column.name;
            document.getElementById('columnColor').value = column.color;
        } else {
            // Create new column
            this.currentEditColumnId = null;
            titleElement.textContent = 'Add New Section';
            deleteBtn.style.display = 'none';
            
            document.getElementById('columnName').value = '';
            document.getElementById('columnColor').value = 'default';
        }

        modal.style.display = 'block';
        document.getElementById('columnName').focus();
    }

    closeColumnModal() {
        document.getElementById('columnModal').style.display = 'none';
        this.currentEditColumnId = null;
    }

    saveColumn() {
        const name = document.getElementById('columnName').value.trim();
        const color = document.getElementById('columnColor').value;

        if (!name) {
            alert('Section name is required');
            return;
        }

        if (this.currentEditColumnId) {
            // Update existing column
            const column = this.columns.find(c => c.id === this.currentEditColumnId);
            if (column) {
                column.name = name;
                column.color = color;
                this.showNotification('Section updated successfully');
            }
        } else {
            // Create new column
            const newColumn = {
                id: 'col_' + Date.now(),
                name: name,
                color: color,
                order: this.columns.length + 1
            };
            this.columns.push(newColumn);
            this.showNotification('Section created successfully');
        }

        this.saveColumnsToStorage();
        this.renderColumns();
        this.closeColumnModal();
    }

    deleteColumn() {
        if (!this.currentEditColumnId) return;

        const column = this.columns.find(c => c.id === this.currentEditColumnId);
        if (!column) return;

        const cardsInColumn = this.cards.filter(c => c.status === this.currentEditColumnId);
        
        if (cardsInColumn.length > 0) {
            const confirmMsg = `This section contains ${cardsInColumn.length} card(s). Deleting it will also delete all cards in it. Are you sure?`;
            if (!confirm(confirmMsg)) {
                return;
            }
            // Remove cards in this column
            this.cards = this.cards.filter(c => c.status !== this.currentEditColumnId);
            this.saveToStorage();
        }

        this.columns = this.columns.filter(c => c.id !== this.currentEditColumnId);
        this.saveColumnsToStorage();
        this.renderColumns();
        this.renderCards();
        this.updateStats();
        this.closeColumnModal();
        this.showNotification('Section deleted successfully');
    }

    renderColumns() {
        const kanbanBoard = document.getElementById('kanbanBoard');
        const addColumnSection = kanbanBoard.querySelector('.add-column-section');
        
        // Remove existing columns
        const existingColumns = kanbanBoard.querySelectorAll('.board-column');
        existingColumns.forEach(col => col.remove());

        // Sort columns by order
        const sortedColumns = [...this.columns].sort((a, b) => a.order - b.order);

        // Create columns
        sortedColumns.forEach(column => {
            const columnElement = this.createColumnElement(column);
            kanbanBoard.insertBefore(columnElement, addColumnSection);
        });
    }

    createColumnElement(column) {
        const columnDiv = document.createElement('div');
        columnDiv.className = `board-column ${column.color !== 'default' ? `color-${column.color}` : ''}`;
        columnDiv.setAttribute('data-column-id', column.id);

        columnDiv.innerHTML = `
            <div class="column-header">
                <h3>${column.name}</h3>
                <div class="column-header-actions">
                    <button class="column-edit-btn" title="Edit Section">✎</button>
                    <button class="column-menu-btn">⋮</button>
                </div>
            </div>
            <div class="column-content" id="column_${column.id}">
                <button class="add-card-column-btn" data-status="${column.id}">+ ADD A CARD</button>
            </div>
        `;

        // Add event listeners
        const editBtn = columnDiv.querySelector('.column-edit-btn');
        const menuBtn = columnDiv.querySelector('.column-menu-btn');
        const addCardBtn = columnDiv.querySelector('.add-card-column-btn');

        editBtn.addEventListener('click', () => {
            this.openColumnModal(column);
        });

        menuBtn.addEventListener('click', (e) => {
            this.showColumnContextMenu(e, column);
        });

        addCardBtn.addEventListener('click', () => {
            this.openCardModal(null, column.id);
        });

        return columnDiv;
    }

    showColumnContextMenu(event, column) {
        // Remove existing context menu
        const existingMenu = document.querySelector('.column-context-menu');
        if (existingMenu) {
            existingMenu.remove();
        }

        const menu = document.createElement('div');
        menu.className = 'column-context-menu';
        menu.style.cssText = `
            position: fixed;
            top: ${event.clientY}px;
            left: ${event.clientX}px;
        `;

        const cardsCount = this.cards.filter(c => c.status === column.id).length;

        menu.innerHTML = `
            <div class="column-context-menu-item edit-section">
                <span>✎</span> Edit Section
            </div>
            <div class="column-context-menu-item add-card">
                <span>+</span> Add Card
            </div>
            <div class="column-context-menu-item danger delete-section">
                <span>🗑</span> Delete Section ${cardsCount > 0 ? `(${cardsCount} cards)` : ''}
            </div>
        `;

        // Add event listeners
        menu.querySelector('.edit-section').addEventListener('click', () => {
            this.openColumnModal(column);
            menu.remove();
        });

        menu.querySelector('.add-card').addEventListener('click', () => {
            this.openCardModal(null, column.id);
            menu.remove();
        });

        menu.querySelector('.delete-section').addEventListener('click', () => {
            this.currentEditColumnId = column.id;
            this.deleteColumn();
            menu.remove();
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

    // Card Management (updated to work with dynamic columns)
    openCardModal(card = null, defaultStatus = null) {
        const modal = document.getElementById('cardModal');
        const titleElement = document.getElementById('modalTitle');
        const deleteBtn = document.getElementById('deleteCard');

        // If no default status provided, use first column
        if (!defaultStatus && this.columns.length > 0) {
            defaultStatus = this.columns[0].id;
        }

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
            this.defaultStatus = defaultStatus;
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
                status: this.defaultStatus || (this.columns.length > 0 ? this.columns[0].id : 'todo'),
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

    moveCard(cardId, newStatus) {
        const card = this.cards.find(c => c.id === cardId);
        const targetColumn = this.columns.find(c => c.id === newStatus);
        
        if (card && card.status !== newStatus && targetColumn) {
            card.status = newStatus;
            this.saveToStorage();
            this.renderCards();
            this.updateStats();
            this.showNotification(`Card moved to ${targetColumn.name}`);
        }
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

        // Show all columns except current one
        this.columns
            .filter(col => col.id !== card.status)
            .forEach(column => {
                const item = document.createElement('div');
                item.style.cssText = `
                    padding: 8px 16px;
                    color: #e1e1e1;
                    cursor: pointer;
                    font-size: 14px;
                `;
                item.textContent = `Move to ${column.name}`;
                
                item.addEventListener('mouseover', () => {
                    item.style.backgroundColor = '#4d4d4d';
                });
                
                item.addEventListener('mouseout', () => {
                    item.style.backgroundColor = 'transparent';
                });

                item.addEventListener('click', () => {
                    this.moveCard(card.id, column.id);
                    menu.remove();
                });

                menu.appendChild(item);
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

    renderCards() {
        // Clear all columns first
        this.columns.forEach(column => {
            const columnContent = document.getElementById(`column_${column.id}`);
            if (columnContent) {
                const cards = columnContent.querySelectorAll('.study-card');
                cards.forEach(card => card.remove());
            }
        });

        // Group cards by status
        const cardsByStatus = {};
        this.columns.forEach(col => {
            cardsByStatus[col.id] = this.cards.filter(card => card.status === col.id);
        });

        // Sort and render cards
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

            const columnContent = document.getElementById(`column_${status}`);
            if (columnContent) {
                const addButton = columnContent.querySelector('.add-card-column-btn');
                
                cardsByStatus[status].forEach(card => {
                    const cardElement = this.createCardElement(card);
                    columnContent.insertBefore(cardElement, addButton);
                });
            }
        });
    }

    createCardElement(card) {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'study-card';
        cardDiv.setAttribute('data-id', card.id);

        const isOverdue = card.dueDate && new Date(card.dueDate) < new Date();
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

    updateStats() {
        const stats = {
            total: this.cards.length,
            overdue: this.cards.filter(c => 
                c.dueDate && 
                new Date(c.dueDate) < new Date()
            ).length
        };

        // Add dynamic column stats
        this.columns.forEach(column => {
            stats[column.id] = this.cards.filter(c => c.status === column.id).length;
        });

        // Update stats modal
        const totalElement = document.getElementById('totalCards');
        const overdueElement = document.getElementById('overdueCards');

        if (totalElement) totalElement.textContent = stats.total;
        if (overdueElement) overdueElement.textContent = stats.overdue;

        // Update dynamic column stats
        const todoElement = document.getElementById('todoCards');
        const inProgressElement = document.getElementById('inProgressCards');
        const completedElement = document.getElementById('completedCards');

        if (todoElement) todoElement.textContent = stats['todo'] || 0;
        if (inProgressElement) inProgressElement.textContent = stats['in-progress'] || 0;
        if (completedElement) completedElement.textContent = stats['completed'] || 0;
    }

    closeCardModal() {
        document.getElementById('cardModal').style.display = 'none';
        this.currentEditId = null;
        this.defaultStatus = null;
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

    openStatsModal() {
        this.updateStats();
        document.getElementById('statsModal').style.display = 'block';
    }

    closeStatsModal() {
        document.getElementById('statsModal').style.display = 'none';
    }

    isTomorrow(dateString) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const cardDate = new Date(dateString);
        
        return tomorrow.toDateString() === cardDate.toDateString();
    }

    saveToStorage() {
        localStorage.setItem('studyCards', JSON.stringify(this.cards));
    }

    saveColumnsToStorage() {
        localStorage.setItem('studyColumns', JSON.stringify(this.columns));
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
        const dataStr = JSON.stringify({
            cards: this.cards,
            columns: this.columns
        }, null, 2);
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
    
    console.log('Smart Study Planner (Dynamic Kanban) loaded successfully!');
    console.log('- Click "+ Add Section" to create custom columns');
    console.log('- Right-click on column menu (⋮) to edit/delete sections');
    console.log('- Right-click on cards to move between sections');
    console.log('- Press Ctrl+E to export your data');
    
    // Export shortcut
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'e') {
            e.preventDefault();
            studyPlanner.exportData();
        }
    });
});
