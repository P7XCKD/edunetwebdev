// Smart Study Planner - Configuration and Constants
class StudyPlannerConfig {
    static getDefaultColumns() {
        return [
            { id: 'todo', name: 'To Do', color: 'default', order: 1 },
            { id: 'in-progress', name: 'In Progress', color: 'blue', order: 2 },
            { id: 'completed', name: 'Completed', color: 'green', order: 3 }
        ];
    }

    static getColumnColors() {
        return {
            'default': '#333',
            'red': '#e74c3c',
            'blue': '#3498db',
            'green': '#2ecc71',
            'purple': '#9b59b6',
            'orange': '#f39c12',
            'yellow': '#f1c40f',
            'pink': '#e91e63'
        };
    }

    static getStorageKeys() {
        return {
            CARDS: 'studyCards',
            COLUMNS: 'studyColumns'
        };
    }
}
