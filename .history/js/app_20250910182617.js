// Smart Study Planner - Main Application
class StudyPlannerKanban {
    constructor() {
        // Initialize data
        const storageKeys = StudyPlannerConfig.getStorageKeys();
        this.cards = StudyPlannerUtils.getFromStorage(storageKeys.CARDS, []);
        this.columns = StudyPlannerUtils.getFromStorage(storageKeys.COLUMNS, StudyPlannerConfig.getDefaultColumns());
        
        // Initialize state
        this.currentEditId = null;
        this.currentEditColumnId = null;
        
        // Initialize managers
        this.columnManager = new ColumnManager(this);
        this.cardManager = new CardManager(this);
        this.dragDropManager = new DragDropManager(this);
        this.pdfExportManager = new PDFExportManager(this);
        this.statsManager = new StatsManager(this);
        
        this.init();
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
            this.cardManager.openModal();
        });

        document.getElementById('exportPdfBtn').addEventListener('click', () => {
            this.pdfExportManager.export();
        });

        document.getElementById('clearAllBtn').addEventListener('click', () => {
            this.clearAllData();
        });

        // Add column button
        document.getElementById('addColumnBtn').addEventListener('click', () => {
            this.columnManager.openModal();
        });

        // Column modal events
        document.getElementById('closeColumnModal').addEventListener('click', () => {
            this.columnManager.closeModal();
        });

        document.getElementById('saveColumn').addEventListener('click', () => {
            this.columnManager.save();
        });

        document.getElementById('cancelColumn').addEventListener('click', () => {
            this.columnManager.closeModal();
        });

        document.getElementById('deleteColumn').addEventListener('click', () => {
            this.columnManager.delete();
        });

        // Card modal events
        document.getElementById('closeModal').addEventListener('click', () => {
            this.cardManager.closeModal();
        });

        document.getElementById('closeStatsModal').addEventListener('click', () => {
            this.statsManager.closeModal();
        });

        document.getElementById('saveCard').addEventListener('click', () => {
            this.cardManager.save();
        });

        document.getElementById('cancelCard').addEventListener('click', () => {
            this.cardManager.closeModal();
        });

        document.getElementById('deleteCard').addEventListener('click', () => {
            this.cardManager.delete();
        });

        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            const cardModal = document.getElementById('cardModal');
            const statsModal = document.getElementById('statsModal');
            const columnModal = document.getElementById('columnModal');
            
            if (e.target === cardModal) {
                this.cardManager.closeModal();
            }
            if (e.target === statsModal) {
                this.statsManager.closeModal();
            }
            if (e.target === columnModal) {
                this.columnManager.closeModal();
            }
        });
    }

    // Render methods
    renderColumns() {
        this.columnManager.render();
    }

    renderCards() {
        this.cardManager.render();
    }

    updateStats() {
        this.statsManager.update();
    }

    // Utility methods
    clearAllData() {
        if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
            const storageKeys = StudyPlannerConfig.getStorageKeys();
            this.cards = [];
            this.columns = StudyPlannerConfig.getDefaultColumns();
            
            StudyPlannerUtils.saveToStorage(storageKeys.CARDS, this.cards);
            StudyPlannerUtils.saveToStorage(storageKeys.COLUMNS, this.columns);
            
            this.renderColumns();
            this.renderCards();
            this.updateStats();
        }
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new StudyPlannerKanban();
});
