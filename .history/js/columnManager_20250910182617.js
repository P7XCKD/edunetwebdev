// Smart Study Planner - Column Management
class ColumnManager {
    constructor(app) {
        this.app = app;
    }

    // Column modal methods
    openModal(column = null) {
        const modal = document.getElementById('columnModal');
        const titleElement = document.getElementById('columnModalTitle');
        const deleteBtn = document.getElementById('deleteColumn');

        if (column) {
            // Edit existing column
            this.app.currentEditColumnId = column.id;
            titleElement.textContent = 'Edit Section';
            deleteBtn.style.display = 'block';
            
            document.getElementById('columnName').value = column.name;
            document.getElementById('columnColor').value = column.color;
        } else {
            // Create new column
            this.app.currentEditColumnId = null;
            titleElement.textContent = 'Add New Section';
            deleteBtn.style.display = 'none';
            
            document.getElementById('columnName').value = '';
            document.getElementById('columnColor').value = 'default';
        }

        modal.style.display = 'block';
        document.getElementById('columnName').focus();
    }

    closeModal() {
        document.getElementById('columnModal').style.display = 'none';
        this.app.currentEditColumnId = null;
    }

    save() {
        const name = document.getElementById('columnName').value.trim();
        const color = document.getElementById('columnColor').value;

        if (!name) {
            alert('Please enter a section name');
            return;
        }

        if (this.app.currentEditColumnId) {
            // Update existing column
            const columnIndex = this.app.columns.findIndex(col => col.id === this.app.currentEditColumnId);
            if (columnIndex !== -1) {
                this.app.columns[columnIndex] = { ...this.app.columns[columnIndex], name, color };
            }
        } else {
            // Create new column
            const newColumn = {
                id: StudyPlannerUtils.generateId(),
                name,
                color,
                order: this.app.columns.length + 1
            };
            this.app.columns.push(newColumn);
        }

        StudyPlannerUtils.saveToStorage(StudyPlannerConfig.getStorageKeys().COLUMNS, this.app.columns);
        this.closeModal();
        this.app.renderColumns();
        this.app.renderCards();
    }

    delete() {
        if (!this.app.currentEditColumnId) return;

        const columnToDelete = this.app.columns.find(col => col.id === this.app.currentEditColumnId);
        if (columnToDelete && confirm(`Are you sure you want to delete "${columnToDelete.name}" section and all its cards?`)) {
            // Remove cards in this column
            this.app.cards = this.app.cards.filter(card => card.column !== this.app.currentEditColumnId);
            StudyPlannerUtils.saveToStorage(StudyPlannerConfig.getStorageKeys().CARDS, this.app.cards);

            // Remove column
            this.app.columns = this.app.columns.filter(col => col.id !== this.app.currentEditColumnId);
            StudyPlannerUtils.saveToStorage(StudyPlannerConfig.getStorageKeys().COLUMNS, this.app.columns);

            this.closeModal();
            this.app.renderColumns();
            this.app.renderCards();
            this.app.updateStats();
        }
    }

    render() {
        const container = document.getElementById('columnsContainer');
        // Remove existing columns
        container.innerHTML = '';

        // Sort columns by order
        const sortedColumns = [...this.app.columns].sort((a, b) => a.order - b.order);

        // Create columns
        sortedColumns.forEach(column => {
            const columnElement = this.createColumnElement(column);
            container.appendChild(columnElement);
        });
    }

    createColumnElement(column) {
        const columnDiv = document.createElement('div');
        columnDiv.className = 'column';
        columnDiv.dataset.columnId = column.id;
        columnDiv.style.borderTop = `3px solid ${StudyPlannerUtils.getColumnColor(column.color)}`;

        const cardsInColumn = this.app.cards.filter(card => card.column === column.id);

        columnDiv.innerHTML = `
            <div class="column-header">
                <h3 class="column-title">${column.name}</h3>
                <span class="card-count">${cardsInColumn.length}</span>
            </div>
            <div class="column-content" data-column="${column.id}">
                <!-- Cards will be rendered here -->
            </div>
        `;

        // Add drag and drop event listeners for the column
        this.addDragDropListeners(columnDiv, column.id);

        // Add event listeners for buttons
        const columnHeader = columnDiv.querySelector('.column-header');
        columnHeader.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.showContextMenu(e, column);
        });

        columnHeader.addEventListener('dblclick', () => {
            this.openModal(column);
        });

        return columnDiv;
    }

    addDragDropListeners(columnDiv, columnId) {
        const columnContent = columnDiv.querySelector('.column-content');

        columnContent.addEventListener('dragover', (e) => {
            e.preventDefault();
            columnContent.classList.add('drag-over');
        });

        columnContent.addEventListener('dragleave', (e) => {
            if (!columnContent.contains(e.relatedTarget)) {
                columnContent.classList.remove('drag-over');
            }
        });

        columnContent.addEventListener('drop', (e) => {
            e.preventDefault();
            columnContent.classList.remove('drag-over');

            const cardId = e.dataTransfer.getData('text/plain');
            if (cardId) {
                this.app.dragDropManager.moveCard(cardId, columnId);
            }
        });
    }

    showContextMenu(e, column) {
        // Remove existing context menu
        StudyPlannerUtils.removeExistingContextMenu();

        const contextMenu = document.createElement('div');
        contextMenu.className = 'context-menu';
        contextMenu.style.left = e.pageX + 'px';
        contextMenu.style.top = e.pageY + 'px';

        contextMenu.innerHTML = `
            <div class="context-menu-item" data-action="edit">
                <i class="fas fa-edit"></i> Edit Section
            </div>
            <div class="context-menu-item" data-action="delete">
                <i class="fas fa-trash"></i> Delete Section
            </div>
        `;

        document.body.appendChild(contextMenu);

        // Add event listeners
        contextMenu.addEventListener('click', (e) => {
            const action = e.target.closest('.context-menu-item')?.dataset.action;
            if (action === 'edit') {
                this.openModal(column);
            } else if (action === 'delete') {
                this.app.currentEditColumnId = column.id;
                this.delete();
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
