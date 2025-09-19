// Smart Study Planner - COMPLETELY CLEAN VERSION (NO NOTIFICATIONS)
console.log('✅ Loading script-new.js - COMPLETELY CLEAN VERSION');
console.log('✅ ALL NOTIFICATIONS REMOVED - If you see any, they are NOT from this script!');

class StudyPlannerKanban {
    constructor() {
        this.cards = JSON.parse(localStorage.getItem('studyCards')) || [];
        this.columns = JSON.parse(localStorage.getItem('studyColumns')) || this.getDefaultColumns();
        this.currentEditId = null;
        this.currentEditColumnId = null;
        this.draggedCard = null;
        this.isDragging = false;
        this.taskCounter = parseInt(localStorage.getItem('taskCounter')) || 1;
        this.init();
    }

    getDefaultColumns() {
        // Only return defaults if no columns exist at all
        // Users should be free to completely customize these
        return [
            { id: 'category1', name: 'Category 1', color: 'default', order: 1 },
            { id: 'category2', name: 'Category 2', color: 'blue', order: 2 },
            { id: 'category3', name: 'Category 3', color: 'green', order: 3 }
        ];
    }

    // Generate user-friendly task ID
    generateTaskId() {
        const taskId = `TSK-${String(this.taskCounter).padStart(3, '0')}`;
        this.taskCounter++;
        localStorage.setItem('taskCounter', this.taskCounter.toString());
        return taskId;
    }

    // Format date to dd/mm/yy
    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = String(date.getFullYear()).slice(-2);
        return `${day}/${month}/${year}`;
    }

    init() {
        this.migrateExistingCards();
        this.setupEventListeners();
        this.renderColumns();
        this.renderCards();
        this.updateStats();
    }

    // Migrate existing cards to have task IDs and handle orphaned cards
    migrateExistingCards() {
        let needsSave = false;
        this.cards.forEach(card => {
            if (!card.taskId) {
                card.taskId = this.generateTaskId();
                needsSave = true;
            }
            
            // Only migrate if the current status doesn't exist in available columns
            const statusExists = this.columns.some(col => col.id === card.status);
            if (!statusExists && this.columns.length > 0) {
                // Move orphaned cards to the first available column
                card.status = this.columns[0].id;
                needsSave = true;
                console.log(`Migrated orphaned card "${card.title}" to column "${this.columns[0].name}"`);
            }
        });
        if (needsSave) {
            this.saveToStorage();
        }
    }

    setupEventListeners() {
        // Header buttons
        document.getElementById('addCardBtn').addEventListener('click', () => {
            this.openCardModal();
        });

        document.getElementById('exportPdfBtn').addEventListener('click', () => {
            this.exportToPDF();
        });

        document.getElementById('clearAllBtn').addEventListener('click', () => {
            this.clearAllData();
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
        const modal = document.getElementById('columnModal');
        modal.style.display = 'none';
        
        // Clear the form fields
        document.getElementById('columnName').value = '';
        document.getElementById('columnColor').value = 'default';
        
        // Reset the editing state
        this.currentEditColumnId = null;
        
        console.log('✅ Column modal closed and state reset');
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
                console.log(`✅ Updated column "${column.name}" successfully`);
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
            console.log(`✅ Created new column "${newColumn.name}" successfully`);
        }

        // Save to storage first
        this.saveColumnsToStorage();
        
        // Close modal before re-rendering to avoid conflicts
        this.closeColumnModal();
        
        // Force complete re-render of columns and cards
        this.renderColumns();
        this.renderCards();
        this.updateStats();
        
        console.log('✅ Column saved and interface updated');
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
    }

    renderColumns() {
        const kanbanBoard = document.getElementById('kanbanBoard');
        if (!kanbanBoard) {
            console.error('❌ kanbanBoard element not found');
            return;
        }
        
        const addColumnSection = kanbanBoard.querySelector('.add-column-section');
        if (!addColumnSection) {
            console.error('❌ add-column-section not found');
            return;
        }
        
        // Remove ALL existing columns completely
        const existingColumns = kanbanBoard.querySelectorAll('.board-column');
        existingColumns.forEach(col => {
            col.remove();
        });

        // Validate columns data
        if (!this.columns || !Array.isArray(this.columns)) {
            console.error('❌ Invalid columns data:', this.columns);
            return;
        }

        // Sort columns by order
        const sortedColumns = [...this.columns].sort((a, b) => a.order - b.order);

        // Create fresh columns
        sortedColumns.forEach(column => {
            const columnElement = this.createColumnElement(column);
            if (columnElement) {
                kanbanBoard.insertBefore(columnElement, addColumnSection);
            }
        });
        
        console.log(`✅ Rendered ${sortedColumns.length} columns successfully`);
    }

    createColumnElement(column) {
        if (!column || !column.id || !column.name) {
            console.error('❌ Invalid column data:', column);
            return null;
        }
        
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

        console.log(`✅ Created column element for "${column.name}" (ID: ${column.id})`);
        
        // Add drag and drop event listeners for the column
        const columnContent = columnDiv.querySelector('.column-content');
        
        columnContent.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            columnDiv.classList.add('drag-over');
        });

        columnContent.addEventListener('dragleave', (e) => {
            if (!columnDiv.contains(e.relatedTarget)) {
                columnDiv.classList.remove('drag-over');
            }
        });

        columnContent.addEventListener('drop', (e) => {
            e.preventDefault();
            columnDiv.classList.remove('drag-over');
            
            if (this.draggedCard && this.draggedCard.status !== column.id) {
                this.moveCard(this.draggedCard.id, column.id);
            }
        });

        // Add event listeners for buttons
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
            }
        } else {
            // Create new card
            const newCard = {
                id: Date.now(),
                taskId: this.generateTaskId(),
                status: this.defaultStatus || (this.columns.length > 0 ? this.columns[0].id : 'category1'),
                ...cardData
            };
            this.cards.push(newCard);
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
        }
    }

    toggleCardCompletion(cardId) {
        const card = this.cards.find(c => c.id === cardId);
        if (card) {
            card.isCompleted = !card.isCompleted;
            card.completedDate = card.isCompleted ? new Date().toISOString() : null;
            this.saveToStorage();
            this.renderCards();
            this.updateStats();
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

        // Add mark as done/undone option
        const doneItem = document.createElement('div');
        doneItem.style.cssText = `
            padding: 8px 16px;
            color: #e1e1e1;
            cursor: pointer;
            font-size: 14px;
            border-bottom: 1px solid #555;
        `;
        doneItem.textContent = card.isCompleted ? '❌ Mark as Not Done' : '✅ Mark as Done';
        
        doneItem.addEventListener('mouseover', () => {
            doneItem.style.backgroundColor = '#4d4d4d';
        });
        
        doneItem.addEventListener('mouseout', () => {
            doneItem.style.backgroundColor = 'transparent';
        });

        doneItem.addEventListener('click', () => {
            this.toggleCardCompletion(card.id);
            menu.remove();
        });

        menu.appendChild(doneItem);

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
        cardDiv.className = `study-card ${card.isCompleted ? 'completed' : ''}`;
        cardDiv.setAttribute('data-id', card.id);
        cardDiv.setAttribute('draggable', 'true');

        const isOverdue = card.dueDate && new Date(card.dueDate) < new Date();
        const isTomorrow = card.dueDate && this.isTomorrow(card.dueDate);

        let dueDateHtml = '';
        if (card.dueDate) {
            const formattedDate = this.formatDate(card.dueDate);
            let dueDateClass = '';
            let dueDateText = formattedDate;

            if (card.isCompleted) {
                dueDateClass = 'completed';
                dueDateText = `${formattedDate} (completed)`;
            } else if (isOverdue) {
                dueDateClass = 'overdue';
                dueDateText = `${formattedDate} (overdue)`;
            } else if (isTomorrow) {
                dueDateClass = 'tomorrow';
                dueDateText = `${formattedDate} (tomorrow)`;
            }

            dueDateHtml = `<span class="card-due-date ${dueDateClass}">${dueDateText}</span>`;
        }

        const completionButton = `
            <button class="completion-toggle-btn ${card.isCompleted ? 'completed' : ''}" 
                    data-card-id="${card.id}" 
                    title="${card.isCompleted ? 'Mark as Not Done' : 'Mark as Done'}">
                ${card.isCompleted ? '✅' : '⭕'}
            </button>
        `;

        cardDiv.innerHTML = `
            <div class="card-header">
                <div class="card-title-section">
                    <div class="card-title">${card.title}</div>
                    ${completionButton}
                </div>
                <div class="card-task-id">${card.taskId || 'TSK-000'}</div>
            </div>
            <div class="card-meta">
                ${card.subject ? `<span class="card-subject">${card.subject}</span>` : ''}
                ${dueDateHtml}
                <span class="priority-tag priority-${card.priority}">${card.priority}</span>
            </div>
            ${card.description ? `<div class="card-description">${card.description}</div>` : ''}
        `;

        // Add drag event listeners
        cardDiv.addEventListener('dragstart', (e) => {
            this.draggedCard = card;
            cardDiv.style.opacity = '0.5';
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/html', cardDiv.outerHTML);
        });

        cardDiv.addEventListener('dragend', (e) => {
            cardDiv.style.opacity = '1';
            this.draggedCard = null;
        });

        // Add click handler to edit card
        cardDiv.addEventListener('click', (e) => {
            // Don't trigger click during drag or if clicking the completion button
            if (!this.isDragging && !e.target.classList.contains('completion-toggle-btn')) {
                this.openCardModal(card);
            }
        });

        // Add completion toggle button event listener
        const completionBtn = cardDiv.querySelector('.completion-toggle-btn');
        if (completionBtn) {
            completionBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent card modal from opening
                this.toggleCardCompletion(card.id);
            });
        }

        return cardDiv;
    }

    updateStats() {
        const stats = {
            total: this.cards.length,
            completed: this.cards.filter(c => c.isCompleted).length,
            overdue: this.cards.filter(c => 
                c.dueDate && 
                new Date(c.dueDate) < new Date() && 
                !c.isCompleted
            ).length
        };

        // Add dynamic column stats
        this.columns.forEach(column => {
            stats[column.id] = this.cards.filter(c => c.status === column.id).length;
        });

        // Update stats modal with dynamic content
        const totalElement = document.getElementById('totalCards');
        const completedElement = document.getElementById('completedCards');
        const overdueElement = document.getElementById('overdueCards');

        if (totalElement) totalElement.textContent = stats.total;
        if (completedElement) completedElement.textContent = stats.completed;
        if (overdueElement) overdueElement.textContent = stats.overdue;

        // No more hardcoded column references - everything is dynamic now
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

    // Export to PDF functionality
    exportToPDF() {
        // Create a new window for PDF export
        const printWindow = window.open('', '_blank');
        
        // Get current date for the report
        const currentDate = new Date().toLocaleDateString();
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        // Generate calendar HTML
        const calendarHtml = this.generateCalendarHtml(currentMonth, currentYear);
        
        // Generate HTML content for PDF
        let htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Study Planner Export - ${currentDate}</title>
                <style>
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                        margin: 20px;
                        background-color: #1a1a1a;
                        color: #e1e1e1;
                        line-height: 1.6;
                    }
                    .header {
                        text-align: center;
                        margin-bottom: 30px;
                        border-bottom: 2px solid #007acc;
                        padding-bottom: 20px;
                    }
                    .header h1 {
                        margin: 0;
                        color: #e1e1e1;
                        font-size: 32px;
                    }
                    .export-date {
                        color: #bbb;
                        font-size: 14px;
                        margin-top: 5px;
                    }
                    
                    /* Calendar Styles */
                    .calendar-section {
                        background: #2d2d2d;
                        border: 1px solid #555;
                        border-radius: 8px;
                        padding: 20px;
                        margin-bottom: 30px;
                    }
                    .calendar-title {
                        font-size: 20px;
                        font-weight: bold;
                        margin-bottom: 20px;
                        color: #e1e1e1;
                        text-align: center;
                    }
                    .calendar {
                        width: 100%;
                        border-collapse: collapse;
                        background: #3d3d3d;
                        border-radius: 8px;
                        overflow: hidden;
                    }
                    .calendar th {
                        background: #4d4d4d;
                        color: #e1e1e1;
                        padding: 12px 8px;
                        text-align: center;
                        font-weight: 600;
                        font-size: 14px;
                    }
                    .calendar td {
                        padding: 8px;
                        text-align: center;
                        border: 1px solid #555;
                        vertical-align: top;
                        height: 60px;
                        position: relative;
                        background: #3d3d3d;
                    }
                    .calendar td.other-month {
                        color: #666;
                        background: #2a2a2a;
                    }
                    .calendar td.today {
                        background: #007acc;
                        color: white;
                        font-weight: bold;
                    }
                    .calendar td.has-tasks {
                        background: #4a5d23;
                        border-color: #6b8e2f;
                    }
                    .calendar td.has-overdue {
                        background: #5d2323;
                        border-color: #8e2f2f;
                    }
                    .calendar td.has-completed {
                        background: #2d5d23;
                        border-color: #4f8e2f;
                    }
                    .day-number {
                        font-size: 14px;
                        font-weight: 500;
                    }
                    .task-indicator {
                        position: absolute;
                        bottom: 2px;
                        left: 2px;
                        right: 2px;
                        font-size: 10px;
                        background: rgba(0, 122, 204, 0.8);
                        border-radius: 2px;
                        padding: 1px 2px;
                    }
                    .overdue-indicator {
                        background: rgba(220, 53, 69, 0.8);
                    }
                    .completed-indicator {
                        background: rgba(40, 167, 69, 0.8);
                    }
                    
                    .section {
                        margin-bottom: 30px;
                        page-break-inside: avoid;
                    }
                    .section-title {
                        font-size: 20px;
                        font-weight: bold;
                        margin-bottom: 15px;
                        color: #e1e1e1;
                        border-left: 4px solid #007acc;
                        padding-left: 15px;
                        background: #2d2d2d;
                        padding: 12px 15px;
                        border-radius: 6px;
                    }
                    .card {
                        border: 1px solid #555;
                        border-radius: 8px;
                        padding: 15px;
                        margin-bottom: 15px;
                        background: #3d3d3d;
                    }
                    .card-title {
                        font-size: 16px;
                        font-weight: bold;
                        margin-bottom: 8px;
                        color: #e1e1e1;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }
                    .card-task-id {
                        font-size: 11px;
                        font-weight: 600;
                        color: #007acc;
                        background: rgba(0, 122, 204, 0.2);
                        padding: 2px 6px;
                        border-radius: 4px;
                        text-transform: uppercase;
                    }
                    .card-meta {
                        display: flex;
                        gap: 15px;
                        margin-bottom: 10px;
                        flex-wrap: wrap;
                    }
                    .card-subject {
                        background: #555;
                        color: #e1e1e1;
                        padding: 4px 8px;
                        border-radius: 12px;
                        font-size: 12px;
                    }
                    .card-due-date {
                        color: #bbb;
                        font-size: 14px;
                    }
                    .card-due-date.overdue {
                        color: #ff6b6b;
                        font-weight: bold;
                        background: rgba(255, 107, 107, 0.2);
                        padding: 2px 6px;
                        border-radius: 4px;
                    }
                    .card-due-date.tomorrow {
                        color: #ffa500;
                        font-weight: bold;
                        background: rgba(255, 165, 0, 0.2);
                        padding: 2px 6px;
                        border-radius: 4px;
                    }
                    .priority {
                        padding: 4px 8px;
                        border-radius: 12px;
                        font-size: 10px;
                        font-weight: 600;
                        text-transform: uppercase;
                    }
                    .priority-high {
                        background: #ff4757;
                        color: white;
                    }
                    .priority-medium {
                        background: #ffa726;
                        color: white;
                    }
                    .priority-low {
                        background: #66bb6a;
                        color: white;
                    }
                    .card-description {
                        color: #bbb;
                        font-style: italic;
                        margin-top: 10px;
                        line-height: 1.4;
                        background: #2a2a2a;
                        padding: 8px;
                        border-radius: 4px;
                        border-left: 3px solid #555;
                    }
                    .completion-badge {
                        background: #28a745;
                        color: white;
                        padding: 4px 8px;
                        border-radius: 12px;
                        font-size: 10px;
                        font-weight: 600;
                    }
                    .status-badge {
                        background: #007acc;
                        color: white;
                        padding: 4px 8px;
                        border-radius: 12px;
                        font-size: 10px;
                        font-weight: 600;
                    }
                    .study-card.completed {
                        opacity: 0.8;
                        border-left: 4px solid #28a745;
                    }
                    .study-card.completed .card-title {
                        text-decoration: line-through;
                        opacity: 0.7;
                    }
                    .empty-section {
                        color: #666;
                        font-style: italic;
                        padding: 20px;
                        text-align: center;
                        background: #2a2a2a;
                        border-radius: 6px;
                    }
                    .summary {
                        background: #2d2d2d;
                        border: 1px solid #007acc;
                        border-radius: 8px;
                        padding: 20px;
                        margin-bottom: 30px;
                    }
                    .summary h3 {
                        margin-top: 0;
                        color: #e1e1e1;
                    }
                    .stats-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                        gap: 15px;
                    }
                    .stat-item {
                        text-align: center;
                        padding: 15px;
                        background: #3d3d3d;
                        border-radius: 6px;
                        border: 1px solid #555;
                    }
                    .stat-number {
                        font-size: 24px;
                        font-weight: bold;
                        color: #007acc;
                    }
                    .stat-label {
                        font-size: 14px;
                        color: #bbb;
                    }
                    .legend {
                        margin-top: 15px;
                        padding: 15px;
                        background: #2a2a2a;
                        border-radius: 6px;
                    }
                    .legend h4 {
                        margin-top: 0;
                        color: #e1e1e1;
                        font-size: 16px;
                    }
                    .legend-item {
                        display: inline-flex;
                        align-items: center;
                        margin-right: 20px;
                        margin-bottom: 8px;
                        font-size: 14px;
                    }
                    .legend-color {
                        width: 16px;
                        height: 16px;
                        border-radius: 3px;
                        margin-right: 8px;
                    }
                    @media print {
                        body { 
                            margin: 0; 
                            -webkit-print-color-adjust: exact;
                            print-color-adjust: exact;
                        }
                        .section { page-break-inside: avoid; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Smart Study Planner</h1>
                    <div class="export-date">Exported on ${currentDate}</div>
                </div>
        `;

        // Add calendar section
        htmlContent += `
            <div class="calendar-section">
                <div class="calendar-title">Study Calendar - ${this.getMonthName(currentMonth)} ${currentYear}</div>
                ${calendarHtml}
                <div class="legend">
                    <h4>Calendar Legend</h4>
                    <div class="legend-item">
                        <div class="legend-color" style="background: #007acc;"></div>
                        Today
                    </div>
                    <div class="legend-item">
                        <div class="legend-color" style="background: #4a5d23;"></div>
                        Has Tasks
                    </div>
                    <div class="legend-item">
                        <div class="legend-color" style="background: #2d5d23;"></div>
                        Has Completed Tasks
                    </div>
                    <div class="legend-item">
                        <div class="legend-color" style="background: #5d2323;"></div>
                        Has Overdue Tasks
                    </div>
                </div>
            </div>
        `;

        // Add summary statistics
        const totalCards = this.cards.length;
        const completedCards = this.cards.filter(c => c.isCompleted).length;
        const overdueCards = this.cards.filter(c => 
            c.dueDate && new Date(c.dueDate) < new Date() && !c.isCompleted
        ).length;

        htmlContent += `
            <div class="summary">
                <h3>Summary Statistics</h3>
                <div class="stats-grid">
                    <div class="stat-item">
                        <div class="stat-number">${totalCards}</div>
                        <div class="stat-label">Total Cards</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-number">${this.columns.length}</div>
                        <div class="stat-label">Categories</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-number">${completedCards}</div>
                        <div class="stat-label">Completed</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-number">${overdueCards}</div>
                        <div class="stat-label">Overdue</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-number">${this.cards.filter(c => c.dueDate).length}</div>
                        <div class="stat-label">With Due Dates</div>
                    </div>
                </div>
            </div>
        `;

        // Sort columns by order
        const sortedColumns = [...this.columns].sort((a, b) => a.order - b.order);

        // Add each section with its cards
        sortedColumns.forEach(column => {
            const columnCards = this.cards.filter(c => c.status === column.id);
            const completedInColumn = columnCards.filter(c => c.isCompleted).length;
            
            htmlContent += `<div class="section">`;
            htmlContent += `<div class="section-title">${column.name} (${columnCards.length} cards${completedInColumn > 0 ? `, ${completedInColumn} completed` : ''})</div>`;

            if (columnCards.length === 0) {
                htmlContent += `<div class="empty-section">No cards in this category</div>`;
            } else {
                // Sort cards by completion status, then priority and due date
                columnCards.sort((a, b) => {
                    // Completed cards go to bottom
                    if (a.isCompleted !== b.isCompleted) {
                        return a.isCompleted ? 1 : -1;
                    }
                    
                    const priorityOrder = { high: 3, medium: 2, low: 1 };
                    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
                    if (priorityDiff !== 0) return priorityDiff;

                    if (a.dueDate && b.dueDate) {
                        return new Date(a.dueDate) - new Date(b.dueDate);
                    }
                    if (a.dueDate && !b.dueDate) return -1;
                    if (!a.dueDate && b.dueDate) return 1;
                    return 0;
                });

                columnCards.forEach(card => {
                    const isOverdue = card.dueDate && new Date(card.dueDate) < new Date() && !card.isCompleted;
                    const isTomorrow = card.dueDate && this.isTomorrow(card.dueDate);

                    let dueDateHtml = '';
                    if (card.dueDate) {
                        const formattedDate = this.formatDate(card.dueDate);
                        let dueDateClass = '';
                        let dueDateText = formattedDate;

                        if (card.isCompleted) {
                            dueDateClass = 'completed';
                            dueDateText = `${formattedDate} (completed)`;
                        } else if (isOverdue) {
                            dueDateClass = 'overdue';
                            dueDateText = `${formattedDate} (overdue)`;
                        } else if (isTomorrow) {
                            dueDateClass = 'tomorrow';
                            dueDateText = `${formattedDate} (due tomorrow)`;
                        }

                        dueDateHtml = `<span class="card-due-date ${dueDateClass}">Due: ${dueDateText}</span>`;
                    }

                    const completionBadge = card.isCompleted ? 
                        `<span class="completion-badge">✅ Completed</span>` : 
                        `<span class="status-badge">📋 ${column.name}</span>`;

                    htmlContent += `
                        <div class="card ${card.isCompleted ? 'completed' : ''}">
                            <div class="card-title">
                                ${card.title}
                                <span class="card-task-id">${card.taskId || 'TSK-000'}</span>
                            </div>
                            <div class="card-meta">
                                ${card.subject ? `<span class="card-subject">${card.subject}</span>` : ''}
                                ${dueDateHtml}
                                <span class="priority priority-${card.priority}">${card.priority}</span>
                                ${completionBadge}
                            </div>
                            ${card.description ? `<div class="card-description">"${card.description}"</div>` : ''}
                        </div>
                    `;
                });
            }

            htmlContent += `</div>`;
        });

        htmlContent += `
                </body>
            </html>
        `;

        // Write content to new window
        printWindow.document.write(htmlContent);
        printWindow.document.close();
    }

    // Generate calendar HTML
    generateCalendarHtml(month, year) {
        const today = new Date();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday

        // Get tasks for this month
        const monthTasks = this.cards.filter(card => {
            if (!card.dueDate) return false;
            const taskDate = new Date(card.dueDate);
            return taskDate.getMonth() === month && taskDate.getFullYear() === year;
        });

        // Group tasks by day
        const tasksByDay = {};
        monthTasks.forEach(task => {
            const day = new Date(task.dueDate).getDate();
            if (!tasksByDay[day]) tasksByDay[day] = [];
            tasksByDay[day].push(task);
        });

        let calendarHtml = `
            <table class="calendar">
                <thead>
                    <tr>
                        <th>Sun</th>
                        <th>Mon</th>
                        <th>Tue</th>
                        <th>Wed</th>
                        <th>Thu</th>
                        <th>Fri</th>
                        <th>Sat</th>
                    </tr>
                </thead>
                <tbody>
        `;

        let currentDay = 1;
        let weeks = Math.ceil((daysInMonth + startingDayOfWeek) / 7);

        for (let week = 0; week < weeks; week++) {
            calendarHtml += '<tr>';
            
            for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
                if (week === 0 && dayOfWeek < startingDayOfWeek) {
                    // Previous month's days
                    const prevMonth = month === 0 ? 11 : month - 1;
                    const prevYear = month === 0 ? year - 1 : year;
                    const prevMonthDays = new Date(prevYear, prevMonth + 1, 0).getDate();
                    const dayNumber = prevMonthDays - (startingDayOfWeek - dayOfWeek - 1);
                    calendarHtml += `<td class="other-month"><div class="day-number">${dayNumber}</div></td>`;
                } else if (currentDay > daysInMonth) {
                    // Next month's days
                    const dayNumber = currentDay - daysInMonth;
                    calendarHtml += `<td class="other-month"><div class="day-number">${dayNumber}</div></td>`;
                    currentDay++;
                } else {
                    // Current month's days
                    const isToday = (currentDay === today.getDate() && month === today.getMonth() && year === today.getFullYear());
                    const dayTasks = tasksByDay[currentDay] || [];
                    const hasOverdue = dayTasks.some(task => new Date(task.dueDate) < today && !task.isCompleted);
                    const hasCompleted = dayTasks.some(task => task.isCompleted);
                    
                    let cellClass = '';
                    if (isToday) cellClass = 'today';
                    else if (hasCompleted) cellClass = 'has-completed';
                    else if (hasOverdue) cellClass = 'has-overdue';
                    else if (dayTasks.length > 0) cellClass = 'has-tasks';

                    let indicator = '';
                    if (dayTasks.length > 0) {
                        const completedTasks = dayTasks.filter(task => task.isCompleted).length;
                        const overdueTasks = dayTasks.filter(task => new Date(task.dueDate) < today && !task.isCompleted).length;
                        
                        let indicatorClass = '';
                        let indicatorText = '';
                        
                        if (completedTasks > 0) {
                            indicatorClass = 'completed-indicator';
                            indicatorText = `${completedTasks} done`;
                        } else if (overdueTasks > 0) {
                            indicatorClass = 'overdue-indicator';
                            indicatorText = `${dayTasks.length} task${dayTasks.length > 1 ? 's' : ''}`;
                        } else {
                            indicatorText = `${dayTasks.length} task${dayTasks.length > 1 ? 's' : ''}`;
                        }
                        
                        indicator = `<div class="task-indicator ${indicatorClass}">${indicatorText}</div>`;
                    }

                    calendarHtml += `<td class="${cellClass}"><div class="day-number">${currentDay}</div>${indicator}</td>`;
                    currentDay++;
                }
            }
            
            calendarHtml += '</tr>';
        }

        calendarHtml += `
                </tbody>
            </table>
        `;

        return calendarHtml;
    }

    // Get month name
    getMonthName(monthIndex) {
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        return months[monthIndex];
    }

    // Clear all data functionality
    clearAllData() {
        const totalCards = this.cards.length;
        const totalSections = this.columns.length;
        
        const confirmMessage = `Are you sure you want to clear all data?\n\nThis will permanently delete:\n- ${totalCards} cards\n- ${totalSections} custom categories\n\nThis action cannot be undone.\n\nAfter clearing, you'll start with 3 blank categories that you can rename to anything you want.`;
        
        if (confirm(confirmMessage)) {
            // Reset to default state with generic names
            this.cards = [];
            this.columns = this.getDefaultColumns();
            this.taskCounter = 1;
            
            // Save to storage
            this.saveToStorage();
            this.saveColumnsToStorage();
            localStorage.setItem('taskCounter', '1');
            
            // Re-render everything
            this.renderColumns();
            this.renderCards();
            this.updateStats();
            
            console.log('✅ All data cleared! You can now rename the categories to whatever you want.');
        }
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
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    window.studyPlanner = new StudyPlannerKanban();
    
    console.log('🎯 Smart Study Planner loaded successfully!');
    console.log('📝 COMPLETE CUSTOMIZATION AVAILABLE:');
    console.log('   • Edit any category name by clicking the ✎ button');
    console.log('   • Delete categories you don\'t need');
    console.log('   • Add new categories with "+ Add Section"');
    console.log('   • PDF exports will show YOUR category names');
    console.log('   • Mark cards as done with ⭕/✅ buttons');
    console.log('💡 TIP: Categories are your workflow, completion (✅) tracks what\'s actually done');
    
    // Export shortcut
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'e') {
            e.preventDefault();
            studyPlanner.exportData();
        }
    });
});
