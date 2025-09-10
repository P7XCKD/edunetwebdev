// Smart Study Planner - Utility Functions
class StudyPlannerUtils {
    // Format date to dd/mm/yy
    static formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = String(date.getFullYear()).slice(-2);
        return `${day}/${month}/${year}`;
    }

    // Check if date is tomorrow
    static isTomorrow(dateString) {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        const checkDate = new Date(dateString);
        
        return checkDate.toDateString() === tomorrow.toDateString();
    }

    // Generate unique ID
    static generateId() {
        return '_' + Math.random().toString(36).substr(2, 9);
    }

    // Storage helpers
    static saveToStorage(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    static getFromStorage(key, defaultValue = null) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    }

    // Remove existing context menu
    static removeExistingContextMenu() {
        const existingMenu = document.querySelector('.context-menu');
        if (existingMenu) {
            existingMenu.remove();
        }
    }

    // Get column color
    static getColumnColor(colorName) {
        const colors = StudyPlannerConfig.getColumnColors();
        return colors[colorName] || colors['default'];
    }
}
