// Smart Study Planner - Card Management
class CardManager {
    constructor(app) {
        this.app = app;
    }

    // Card modal methods
    openModal(card = null, columnId = null) {
        const modal = document.getElementById('cardModal');
        const titleElement = document.getElementById('cardModalTitle');
        const deleteBtn = document.getElementById('deleteCard');
        const columnSelect = document.getElementById('cardColumn');

        // Populate column options
        columnSelect.innerHTML = '';
        this.app.columns.forEach(column => {
            const option = document.createElement('option');
            option.value = column.id;
            option.textContent = column.name;
            columnSelect.appendChild(option);
        });

        if (card) {
            // Edit existing card
            this.app.currentEditId = card.id;
            titleElement.textContent = 'Edit Study Goal';
            deleteBtn.style.display = 'block';
            
            document.getElementById('cardTitle').value = card.title;
            document.getElementById('cardDescription').value = card.description;
            document.getElementById('cardDueDate').value = card.dueDate || '';
            document.getElementById('cardPriority').value = card.priority || 'medium';
            columnSelect.value = card.column;
        } else {
            // Create new card
            this.app.currentEditId = null;
            titleElement.textContent = 'Add New Study Goal';
            deleteBtn.style.display = 'none';
            
            document.getElementById('cardTitle').value = '';
            document.getElementById('cardDescription').value = '';
            document.getElementById('cardDueDate').value = '';
            document.getElementById('cardPriority').value = 'medium';
            columnSelect.value = columnId || this.app.columns[0]?.id;
        }

        modal.style.display = 'block';
        document.getElementById('cardTitle').focus();
    }

    closeModal() {
        document.getElementById('cardModal').style.display = 'none';
        this.app.currentEditId = null;
    }

    save() {
        const title = document.getElementById('cardTitle').value.trim();
        const description = document.getElementById('cardDescription').value.trim();
        const dueDate = document.getElementById('cardDueDate').value;
        const priority = document.getElementById('cardPriority').value;
        const column = document.getElementById('cardColumn').value;

        if (!title) {
            alert('Please enter a title');
            return;
        }

        const cardData = {
            title,
            description,
            dueDate,
            priority,
            column,
            createdAt: new Date().toISOString()
        };

        if (this.app.currentEditId) {
            // Update existing card
            const cardIndex = this.app.cards.findIndex(card => card.id === this.app.currentEditId);
            if (cardIndex !== -1) {
                this.app.cards[cardIndex] = { ...this.app.cards[cardIndex], ...cardData };
            }
        } else {
            // Create new card
            cardData.id = StudyPlannerUtils.generateId();
            this.app.cards.push(cardData);
        }

        StudyPlannerUtils.saveToStorage(StudyPlannerConfig.getStorageKeys().CARDS, this.app.cards);
        this.closeModal();
        this.app.renderCards();
        this.app.updateStats();
    }

    delete() {
        if (this.app.currentEditId && confirm('Are you sure you want to delete this card?')) {
            this.app.cards = this.app.cards.filter(card => card.id !== this.app.currentEditId);
            StudyPlannerUtils.saveToStorage(StudyPlannerConfig.getStorageKeys().CARDS, this.app.cards);
            this.closeModal();
            this.app.renderCards();
            this.app.updateStats();
        }
    }

    render() {
        // Clear all column contents first
        this.app.columns.forEach(column => {
            const columnContent = document.querySelector(`[data-column="${column.id}"]`);
            if (columnContent) {
                columnContent.innerHTML = '';
            }
        });

        // Group cards by column
        const cardsByColumn = {};
        this.app.cards.forEach(card => {
            if (!cardsByColumn[card.column]) {
                cardsByColumn[card.column] = [];
            }
            cardsByColumn[card.column].push(card);
        });

        // Render cards in their respective columns
        Object.keys(cardsByColumn).forEach(columnId => {
            const columnContent = document.querySelector(`[data-column="${columnId}"]`);
            if (columnContent) {
                const columnCards = cardsByColumn[columnId];
                columnCards.forEach(card => {
                    const cardElement = this.createCardElement(card);
                    columnContent.appendChild(cardElement);
                });
            }
        });
    }

    createCardElement(card) {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'card';
        cardDiv.dataset.cardId = card.id;
        cardDiv.draggable = true;

        const isOverdue = card.dueDate && new Date(card.dueDate) < new Date();
        const isTomorrow = card.dueDate && StudyPlannerUtils.isTomorrow(card.dueDate);

        let dueDateHtml = '';
        if (card.dueDate) {
            const formattedDate = StudyPlannerUtils.formatDate(card.dueDate);
            let dueDateClass = '';
            let dueDateText = formattedDate;

            if (isOverdue) {
                dueDateClass = 'overdue';
                dueDateText = `${formattedDate} (overdue)`;
            } else if (isTomorrow) {
                dueDateClass = 'tomorrow';
                dueDateText = `${formattedDate} (due tomorrow)`;
            }

            dueDateHtml = `<span class="card-due-date ${dueDateClass}">Due: ${dueDateText}</span>`;
        }

        const priorityClass = card.priority ? `priority-${card.priority}` : 'priority-medium';

        cardDiv.innerHTML = `
            <div class="card-priority ${priorityClass}"></div>
            <h4 class="card-title">${card.title}</h4>
            <p class="card-description">${card.description}</p>
            ${dueDateHtml}
            <div class="card-meta">
                <span class="card-priority-text">${(card.priority || 'medium').charAt(0).toUpperCase() + (card.priority || 'medium').slice(1)} Priority</span>
            </div>
        `;

        // Add drag and drop event listeners
        this.addDragEventListeners(cardDiv, card.id);

        // Add right-click context menu
        cardDiv.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.showContextMenu(e, card);
        });

        cardDiv.addEventListener('dblclick', () => {
            this.openModal(card);
        });

        return cardDiv;
    }

    addDragEventListeners(cardElement, cardId) {
        cardElement.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', cardId);
            cardElement.classList.add('dragging');
            this.app.dragDropManager.startDrag(cardId);
        });

        cardElement.addEventListener('dragend', () => {
            cardElement.classList.remove('dragging');
            this.app.dragDropManager.endDrag();
        });
    }

    showContextMenu(e, card) {
        // Remove existing context menu
        StudyPlannerUtils.removeExistingContextMenu();

        const contextMenu = document.createElement('div');
        contextMenu.className = 'context-menu';
        contextMenu.style.left = e.pageX + 'px';
        contextMenu.style.top = e.pageY + 'px';

        const moveToOptions = this.app.columns
            .filter(col => col.id !== card.column)
            .map(col => `<div class="context-menu-item" data-action="move" data-column="${col.id}">
                <i class="fas fa-arrow-right"></i> Move to ${col.name}
            </div>`)
            .join('');

        contextMenu.innerHTML = `
            <div class="context-menu-item" data-action="edit">
                <i class="fas fa-edit"></i> Edit Card
            </div>
            <div class="context-menu-item" data-action="delete">
                <i class="fas fa-trash"></i> Delete Card
            </div>
            <div class="context-menu-divider"></div>
            ${moveToOptions}
        `;

        document.body.appendChild(contextMenu);

        // Add event listeners
        contextMenu.addEventListener('click', (e) => {
            const item = e.target.closest('.context-menu-item');
            if (!item) return;

            const action = item.dataset.action;
            if (action === 'edit') {
                this.openModal(card);
            } else if (action === 'delete') {
                this.app.currentEditId = card.id;
                this.delete();
            } else if (action === 'move') {
                const targetColumn = item.dataset.column;
                this.app.dragDropManager.moveCard(card.id, targetColumn);
            }
            contextMenu.remove();
        });

        // Remove menu when clicking elsewhere
        setTimeout(() => {
            document.addEventListener('click', () => {
                contextMenu.remove();
            }, { once: true });
        }, 100);
    }
}
