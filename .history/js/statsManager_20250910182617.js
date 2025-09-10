// Smart Study Planner - Statistics Manager
class StatsManager {
    constructor(app) {
        this.app = app;
    }

    openModal() {
        const modal = document.getElementById('statsModal');
        modal.style.display = 'block';
        this.updateStatsContent();
    }

    closeModal() {
        document.getElementById('statsModal').style.display = 'none';
    }

    updateStatsContent() {
        const stats = this.calculateStats();
        
        document.getElementById('totalCards').textContent = stats.total;
        document.getElementById('todoCards').textContent = stats.todo;
        document.getElementById('inProgressCards').textContent = stats.inProgress;
        document.getElementById('completedCards').textContent = stats.completed;
        document.getElementById('overdueCards').textContent = stats.overdue;
        
        // Update progress bar
        const progressBar = document.querySelector('.progress-fill');
        if (progressBar) {
            progressBar.style.width = stats.completionPercentage + '%';
        }
        
        document.getElementById('completionPercentage').textContent = stats.completionPercentage + '%';
    }

    calculateStats() {
        const total = this.app.cards.length;
        const todoColumn = this.app.columns.find(col => col.id === 'todo') || { id: 'todo' };
        const inProgressColumn = this.app.columns.find(col => col.id === 'in-progress') || { id: 'in-progress' };
        const completedColumn = this.app.columns.find(col => col.id === 'completed') || { id: 'completed' };
        
        const todo = this.app.cards.filter(card => card.column === todoColumn.id).length;
        const inProgress = this.app.cards.filter(card => card.column === inProgressColumn.id).length;
        const completed = this.app.cards.filter(card => card.column === completedColumn.id).length;
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const overdue = this.app.cards.filter(card => {
            return card.dueDate && new Date(card.dueDate) < today && card.column !== completedColumn.id;
        }).length;
        
        const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

        return {
            total,
            todo,
            inProgress,
            completed,
            overdue,
            completionPercentage
        };
    }

    update() {
        // Update header stats if needed
        const stats = this.calculateStats();
        
        // You can add any header stat updates here
        // For example, showing completion percentage in the header
    }
}
