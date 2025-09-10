// Smart Study Planner - Drag and Drop Manager
class DragDropManager {
    constructor(app) {
        this.app = app;
        this.draggedCard = null;
        this.isDragging = false;
    }

    startDrag(cardId) {
        this.draggedCard = cardId;
        this.isDragging = true;
    }

    endDrag() {
        this.draggedCard = null;
        this.isDragging = false;

        // Remove any remaining drag-over classes
        document.querySelectorAll('.column-content').forEach(content => {
            content.classList.remove('drag-over');
        });
    }

    moveCard(cardId, targetColumnId) {
        const card = this.app.cards.find(c => c.id === cardId);
        if (card && card.column !== targetColumnId) {
            card.column = targetColumnId;
            StudyPlannerUtils.saveToStorage(StudyPlannerConfig.getStorageKeys().CARDS, this.app.cards);
            this.app.renderCards();
        }
    }
}
