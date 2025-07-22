// Journal Application JavaScript - FIXED VERSION
// Private Journal for Couples - Full Functionality

class JournalApp {
    constructor() {
        this.entries = [];
        this.currentEntry = null;
        this.isDrawing = false;
        this.drawingHistory = [];
        this.historyIndex = -1;
        this.drawingContext = null;
        this.lastX = 0;
        this.lastY = 0;
        
        this.init();
    }

    // FIXED: submitEntry method
    submitEntry() {
        const title = document.getElementById('entry-title').value.trim();
        const date = document.getElementById('entry-date').value;
        const content = document.getElementById('entry-text').innerText.trim(); // Changed innerHTML to value
        const author = document.getElementById('entry-author').value;
        const entryType = document.getElementById('entry-type').value; // Fixed selector

        if (!title || !date || !content) {
            alert("Please fill out all required fields.");
            return;
        }

        const newEntry = {
            id: Date.now().toString(),
            title,
            date,
            content,
            author,
            type: entryType,
            text: content, // Add text property for compatibility
            created: new Date().toISOString(),
            modified: new Date().toISOString(),
            formatting: {
                fontSize: document.getElementById('font-size').value,
                textColor: document.getElementById('text-color').value
            }
        };

        this.entries.push(newEntry);
        this.saveEntries();

        // FIXED: Use renderEntries instead of renderEntry
        this.renderEntries();
        this.clearForm();
        
        // Show success message
        this.showMessage('Entry saved successfully!', 'success');
    }

    init() {
        this.setupCanvas();
        this.setupEventListeners();
        this.setupFormattingToolbar();
        this.loadEntries();
        this.updateEntryTypeVisibility();
        this.initializeDateField();
    }

    // Canvas Setup and Drawing Functions
    setupCanvas() {
        const canvas = document.getElementById('drawing-canvas');
        if (!canvas) return;
        
        this.drawingContext = canvas.getContext('2d');
        this.drawingContext.lineCap = 'round';
        this.drawingContext.lineJoin = 'round';
        
        // Save initial blank state
        this.saveDrawingState();
        
        // Touch events for mobile support
        canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e));
        
        // Mouse events
        canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        canvas.addEventListener('mousemove', (e) => this.draw(e));
        canvas.addEventListener('mouseup', () => this.stopDrawing());
        canvas.addEventListener('mouseout', () => this.stopDrawing());
    }

    handleTouchStart(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = e.target.getBoundingClientRect();
        const mouseEvent = new MouseEvent('mousedown', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        e.target.dispatchEvent(mouseEvent);
    }

    handleTouchMove(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousemove', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        e.target.dispatchEvent(mouseEvent);
    }

    handleTouchEnd(e) {
        e.preventDefault();
        const mouseEvent = new MouseEvent('mouseup', {});
        e.target.dispatchEvent(mouseEvent);
    }

    startDrawing(e) {
        this.isDrawing = true;
        const rect = e.target.getBoundingClientRect();
        this.lastX = e.clientX - rect.left;
        this.lastY = e.clientY - rect.top;
    }

    draw(e) {
        if (!this.isDrawing) return;
        
        const rect = e.target.getBoundingClientRect();
        const currentX = e.clientX - rect.left;
        const currentY = e.clientY - rect.top;
        
        this.drawingContext.globalCompositeOperation = document.getElementById('eraser-btn').classList.contains('active') ? 'destination-out' : 'source-over';
        this.drawingContext.lineWidth = document.getElementById('brush-size').value;
        this.drawingContext.strokeStyle = document.getElementById('brush-color').value;
        
        this.drawingContext.beginPath();
        this.drawingContext.moveTo(this.lastX, this.lastY);
        this.drawingContext.lineTo(currentX, currentY);
        this.drawingContext.stroke();
        
        this.lastX = currentX;
        this.lastY = currentY;
    }

    stopDrawing() {
        if (this.isDrawing) {
            this.isDrawing = false;
            this.saveDrawingState();
        }
    }

    saveDrawingState() {
        this.historyIndex++;
        if (this.historyIndex < this.drawingHistory.length) {
            this.drawingHistory.length = this.historyIndex;
        }
        this.drawingHistory.push(this.drawingContext.getImageData(0, 0, 800, 400));
    }

    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.drawingContext.putImageData(this.drawingHistory[this.historyIndex], 0, 0);
        }
    }

    redo() {
        if (this.historyIndex < this.drawingHistory.length - 1) {
            this.historyIndex++;
            this.drawingContext.putImageData(this.drawingHistory[this.historyIndex], 0, 0);
        }
    }

    clearCanvas() {
        this.drawingContext.clearRect(0, 0, 800, 400);
        this.saveDrawingState();
    }

    // FIXED: Event Listeners Setup
    setupEventListeners() {
        // Entry type change
        const entryTypeSelect = document.getElementById('entry-type');
        if (entryTypeSelect) {
            entryTypeSelect.addEventListener('change', () => {
                this.updateEntryTypeVisibility();
            });
        }

        // Brush size display
        const brushSize = document.getElementById('brush-size');
        if (brushSize) {
            brushSize.addEventListener('input', (e) => {
                const brushSizeValue = document.getElementById('brush-size-value');
                if (brushSizeValue) {
                    brushSizeValue.textContent = e.target.value;
                }
            });
        }

        // Eraser toggle
        const eraserBtn = document.getElementById('eraser-btn');
        if (eraserBtn) {
            eraserBtn.addEventListener('click', () => {
                eraserBtn.classList.toggle('active');
            });
        }

        // Canvas controls
        const clearCanvas = document.getElementById('clear-canvas');
        if (clearCanvas) {
            clearCanvas.addEventListener('click', () => this.clearCanvas());
        }

        const undoBtn = document.getElementById('undo-btn');
        if (undoBtn) {
            undoBtn.addEventListener('click', () => this.undo());
        }

        const redoBtn = document.getElementById('redo-btn');
        if (redoBtn) {
            redoBtn.addEventListener('click', () => this.redo());
        }

        // FIXED: Save entry button event listener
        const saveEntryBtn = document.getElementById('save-entry-btn');
        if (saveEntryBtn) {
            saveEntryBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.submitEntry();
            });
        }

        // Draft saving
        const saveDraftBtn = document.getElementById('save-draft-btn');
        if (saveDraftBtn) {
            saveDraftBtn.addEventListener('click', () => this.saveDraft());
        }

        // Form reset
        const clearFormBtn = document.getElementById('clear-form-btn');
        if (clearFormBtn) {
            clearFormBtn.addEventListener('click', () => this.clearForm());
        }

        // Sync button
        const syncBtn = document.getElementById('sync-btn');
        if (syncBtn) {
            syncBtn.addEventListener('click', () => this.syncEntries());
        }

        // Filters
        const applyFilters = document.getElementById('apply-filters');
        if (applyFilters) {
            applyFilters.addEventListener('click', () => this.applyFilters());
        }

        // Preview controls
        const closePreviewBtn = document.getElementById('close-preview-btn');
        if (closePreviewBtn) {
            closePreviewBtn.addEventListener('click', () => this.closePreview());
        }

        const editEntryBtn = document.getElementById('edit-entry-btn');
        if (editEntryBtn) {
            editEntryBtn.addEventListener('click', () => this.editCurrentEntry());
        }

        const deleteEntryBtn = document.getElementById('delete-entry-btn');
        if (deleteEntryBtn) {
            deleteEntryBtn.addEventListener('click', () => this.deleteCurrentEntry());
        }
    }

    // Text Formatting Setup
    setupFormattingToolbar() {
        const toolbar = document.querySelector('.text-formatting-toolbar');
        const textarea = document.getElementById('entry-text');
        
        if (toolbar && textarea) {
            toolbar.addEventListener('click', (e) => {
                if (e.target.hasAttribute('data-format')) {
                    this.applyTextFormatting(e.target.getAttribute('data-format'), textarea);
                }
            });
        }

        // Font size and color changes
        const fontSize = document.getElementById('font-size');
        if (fontSize && textarea) {
            fontSize.addEventListener('change', (e) => {
                textarea.style.fontSize = this.getFontSize(e.target.value);
            });
        }

        const textColor = document.getElementById('text-color');
        if (textColor && textarea) {
            textColor.addEventListener('change', (e) => {
                textarea.style.color = e.target.value;
            });
        }
    }

applyTextFormatting(format, editableDiv) {
    editableDiv.focus();

    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const selectedText = range.toString();

    if (selectedText.length === 0) return;

    let wrapper;
    switch (format) {
        case 'bold':
            wrapper = document.createElement('strong');
            break;
        case 'italic':
            wrapper = document.createElement('em');
            break;
        case 'underline':
            wrapper = document.createElement('u');
            break;
        default:
            return;
    }

    wrapper.textContent = selectedText;
    range.deleteContents();
    range.insertNode(wrapper);

    // Move cursor after inserted formatting
    range.setStartAfter(wrapper);
    range.setEndAfter(wrapper);
    selection.removeAllRanges();
    selection.addRange(range);
}


    getFontSize(size) {
        switch (size) {
            case 'small': return '12px';
            case 'large': return '18px';
            default: return '14px';
        }
    }

    // Entry Management
    updateEntryTypeVisibility() {
        const entryType = document.getElementById('entry-type');
        const textArea = document.getElementById('text-input-area');
        const drawingArea = document.getElementById('drawing-input-area');
        
        if (!entryType || !textArea || !drawingArea) return;
        
        switch (entryType.value) {
            case 'text':
                textArea.style.display = 'block';
                drawingArea.style.display = 'none';
                break;
            case 'drawing':
                textArea.style.display = 'none';
                drawingArea.style.display = 'block';
                break;
            case 'mixed':
                textArea.style.display = 'block';
                drawingArea.style.display = 'block';
                break;
        }
    }

    initializeDateField() {
        const today = new Date().toISOString().split('T')[0];
        const dateField = document.getElementById('entry-date');
        if (dateField) {
            dateField.value = today;
        }
    }

    // FIXED: saveEntries method
    saveEntries() {
        try {
            localStorage.setItem('journal_entries', JSON.stringify(this.entries));
        } catch (error) {
            console.error('Failed to save entries:', error);
        }
    }

    // Entry Display and Management
    loadEntries() {
        try {
            const storedEntries = JSON.parse(localStorage.getItem('journal_entries') || '[]');
            this.entries = storedEntries.sort((a, b) => new Date(b.created || b.date) - new Date(a.created || a.date));
            this.renderEntries();
        } catch (error) {
            console.error('Failed to load entries:', error);
            this.entries = [];
        }
    }

    // FIXED: renderEntries method
    renderEntries() {
        const container = document.getElementById('entries-container');
        if (!container) {
            console.error('entries-container not found');
            return;
        }

        // Clear existing entries
        container.innerHTML = '';

        if (this.entries.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #666;">No entries found. Create your first entry above!</p>';
            return;
        }

        this.entries.forEach(entry => {
            if (entry.isDraft) return; // Skip drafts in main view
            
            // Create entry element
            const entryElement = this.createEntryElement(entry);
            container.appendChild(entryElement);
        });
    }

    // NEW: Create entry element method
    createEntryElement(entry) {
        const entryDiv = document.createElement('article');
        entryDiv.className = 'journal-entry';
        entryDiv.setAttribute('data-entry-id', entry.id);
        entryDiv.setAttribute('data-author', entry.author || 'user1');
        entryDiv.setAttribute('data-type', entry.type || 'text');
        entryDiv.setAttribute('data-date', entry.date);

        entryDiv.innerHTML = `
            <div class="entry-card">
                <div class="entry-header">
                    <h3 class="entry-card-title">${entry.title}</h3>
                    <div class="entry-meta">
                        <span class="entry-card-date">${this.formatDate(entry.date)}</span>
                        <span class="entry-card-author">${this.getAuthorName(entry.author || 'user1')}</span>
                        <span class="entry-card-type">${(entry.type || 'text').charAt(0).toUpperCase() + (entry.type || 'text').slice(1)}</span>
                    </div>
                </div>
                
                <div class="entry-preview">
                    <div class="text-preview" style="display: ${entry.text || entry.content ? 'block' : 'none'};">
                        ${(entry.text || entry.content || '').substring(0, 100)}${(entry.text || entry.content || '').length > 100 ? '...' : ''}
                    </div>
                    <div class="drawing-preview" style="display: ${entry.drawing ? 'block' : 'none'};">
                        ${entry.drawing ? `<img src="${entry.drawing}" alt="Drawing preview" style="max-width: 100px; max-height: 60px;">` : ''}
                    </div>
                </div>
                
                <div class="entry-actions">
                    <button class="view-entry-btn btn btn-primary">View</button>
                    <button class="edit-entry-btn btn btn-secondary">Edit</button>
                    <button class="delete-entry-btn btn btn-danger">Delete</button>
                </div>
            </div>
        `;

        // Add event listeners
        const viewBtn = entryDiv.querySelector('.view-entry-btn');
        const editBtn = entryDiv.querySelector('.edit-entry-btn');
        const deleteBtn = entryDiv.querySelector('.delete-entry-btn');

        if (viewBtn) viewBtn.addEventListener('click', () => this.viewEntry(entry.id));
        if (editBtn) editBtn.addEventListener('click', () => this.editEntry(entry.id));
        if (deleteBtn) deleteBtn.addEventListener('click', () => this.deleteEntry(entry.id));

        return entryDiv;
    }

    viewEntry(entryId) {
        const entry = this.entries.find(e => e.id === entryId);
        if (!entry) return;
        
        this.currentEntry = entry;
        this.showEntryPreview(entry);
    }

    showEntryPreview(entry) {
        const preview = document.getElementById('entry-preview');
        if (!preview) return;
        
        const titleEl = document.getElementById('preview-title');
        const dateEl = document.getElementById('preview-date');
        const authorEl = document.getElementById('preview-author');
        const typeEl = document.getElementById('preview-type');
        const contentEl = document.getElementById('preview-content');

        if (titleEl) titleEl.textContent = entry.title;
        if (dateEl) dateEl.textContent = this.formatDate(entry.date);
        if (authorEl) authorEl.textContent = this.getAuthorName(entry.author || 'user1');
        if (typeEl) typeEl.textContent = (entry.type || 'text').charAt(0).toUpperCase() + (entry.type || 'text').slice(1);
        
        if (contentEl) {
            contentEl.innerHTML = '';
            
            if (entry.text || entry.content) {
                const textDiv = document.createElement('div');
                textDiv.className = 'preview-text';
                textDiv.style.fontSize = this.getFontSize(entry.formatting?.fontSize || 'medium');
                textDiv.style.color = entry.formatting?.textColor || '#000000';
                textDiv.innerHTML = this.formatText(entry.text || entry.content || '');
                contentEl.appendChild(textDiv);
            }
            
            if (entry.drawing) {
                const drawingDiv = document.createElement('div');
                drawingDiv.className = 'preview-drawing';
                drawingDiv.innerHTML = `<img src="${entry.drawing}" alt="Drawing" style="max-width: 100%;">`;
                contentEl.appendChild(drawingDiv);
            }
        }
        
        preview.style.display = 'block';
        preview.scrollIntoView({ behavior: 'smooth' });
    }

    closePreview() {
        const preview = document.getElementById('entry-preview');
        if (preview) {
            preview.style.display = 'none';
        }
        this.currentEntry = null;
    }

    editEntry(entryId) {
        const entry = this.entries.find(e => e.id === entryId);
        if (!entry) return;
        
        this.currentEntry = entry;
        this.loadEntryForEditing(entry);
    }

    loadEntryForEditing(entry) {
        const titleField = document.getElementById('entry-title');
        const dateField = document.getElementById('entry-date');
        const authorField = document.getElementById('entry-author');
        const typeField = document.getElementById('entry-type');
        const textField = document.getElementById('entry-text');
        const fontSizeField = document.getElementById('font-size');
        const textColorField = document.getElementById('text-color');

        if (titleField) titleField.value = entry.title;
        if (dateField) dateField.value = entry.date;
        if (authorField) authorField.value = entry.author || 'user1';
        if (typeField) typeField.value = entry.type || 'text';
        if (textField) textField.value = entry.text || entry.content || '';
        if (fontSizeField) fontSizeField.value = entry.formatting?.fontSize || 'medium';
        if (textColorField) textColorField.value = entry.formatting?.textColor || '#000000';
        
        // Apply formatting to textarea
        if (textField) {
            textField.style.fontSize = this.getFontSize(entry.formatting?.fontSize || 'medium');
            textField.style.color = entry.formatting?.textColor || '#000000';
        }
        
        if (entry.drawing && this.drawingContext) {
            const canvas = document.getElementById('drawing-canvas');
            const img = new Image();
            img.onload = () => {
                this.drawingContext.clearRect(0, 0, canvas.width, canvas.height);
                this.drawingContext.drawImage(img, 0, 0);
                this.saveDrawingState();
            };
            img.src = entry.drawing;
        }
        
        this.updateEntryTypeVisibility();
        
        // Scroll to form
        const form = document.getElementById('entry-form');
        if (form) {
            form.scrollIntoView({ behavior: 'smooth' });
        }
    }

    async deleteEntry(entryId) {
        if (!confirm('Are you sure you want to delete this entry?')) return;
        
        try {
            // Remove from entries array
            this.entries = this.entries.filter(e => e.id !== entryId);
            
            // Save updated entries
            this.saveEntries();
            
            // Re-render entries
            this.renderEntries();
            this.closePreview();
            
            this.showMessage('Entry deleted successfully!', 'success');
        } catch (error) {
            this.showMessage('Failed to delete entry: ' + error.message, 'error');
        }
    }

    editCurrentEntry() {
        if (this.currentEntry) {
            this.editEntry(this.currentEntry.id);
            this.closePreview();
        }
    }

    deleteCurrentEntry() {
        if (this.currentEntry) {
            this.deleteEntry(this.currentEntry.id);
        }
    }

    // Utility functions
    clearForm() {
        const form = document.getElementById('entry-form');
        if (form) form.reset();
        
        if (this.drawingContext) {
            this.clearCanvas();
        }
        
        this.currentEntry = null;
        this.initializeDateField();
        
        // Reset textarea styling
        const textarea = document.getElementById('entry-text');
        if (textarea) {
            textarea.style.fontSize = '14px';
            textarea.style.color = '#000000';
        }
        
        this.updateEntryTypeVisibility();
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    formatDateTime(dateTimeString) {
        const date = new Date(dateTimeString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    getAuthorName(authorValue) {
        return authorValue === 'user1' ? 'Me' : 'My Partner';
    }

    formatText(text) {
        // Convert markdown-style formatting to HTML
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/_(.*?)_/g, '<u>$1</u>')
            .replace(/\n/g, '<br>');
    }

    showMessage(message, type = 'info') {
        // Create a simple notification
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 5px;
            color: white;
            font-weight: bold;
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
        `;
        
        switch (type) {
            case 'success':
                notification.style.backgroundColor = '#4CAF50';
                break;
            case 'error':
                notification.style.backgroundColor = '#f44336';
                break;
            default:
                notification.style.backgroundColor = '#2196F3';
        }
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Additional utility methods for compatibility
    async saveDraft() {
        // Draft saving functionality
        const entryData = {
            id: this.currentEntry?.id || Date.now().toString(),
            title: document.getElementById('entry-title')?.value || '',
            date: document.getElementById('entry-date')?.value || '',
            text: document.getElementById('entry-text')?.value || '',
            author: document.getElementById('entry-author')?.value || 'user1',
            type: document.getElementById('entry-type')?.value || 'text',
            isDraft: true,
            created: new Date().toISOString()
        };

        try {
            const drafts = JSON.parse(localStorage.getItem('journal_drafts') || '[]');
            const existingIndex = drafts.findIndex(draft => draft.id === entryData.id);
            
            if (existingIndex >= 0) {
                drafts[existingIndex] = entryData;
            } else {
                drafts.push(entryData);
            }
            
            localStorage.setItem('journal_drafts', JSON.stringify(drafts));
            this.showMessage('Draft saved successfully!', 'success');
        } catch (error) {
            this.showMessage('Failed to save draft: ' + error.message, 'error');
        }
    }

    async syncEntries() {
        this.showMessage('Sync functionality not implemented yet', 'info');
    }

    applyFilters() {
        const authorFilter = document.getElementById('filter-author')?.value || 'all';
        const typeFilter = document.getElementById('filter-type')?.value || 'all';
        const monthFilter = document.getElementById('filter-month')?.value || '';
        
        const filteredEntries = this.entries.filter(entry => {
            if (entry.isDraft) return false;
            
            if (authorFilter !== 'all' && entry.author !== authorFilter) return false;
            if (typeFilter !== 'all' && entry.type !== typeFilter) return false;
            if (monthFilter && !entry.date.startsWith(monthFilter)) return false;
            
            return true;
        });
        
        this.renderFilteredEntries(filteredEntries);
    }

    renderFilteredEntries(filteredEntries) {
        const container = document.getElementById('entries-container');
        if (!container) return;

        container.innerHTML = '';

        if (filteredEntries.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #666;">No entries match the selected filters.</p>';
            return;
        }

        filteredEntries.forEach(entry => {
            const entryElement = this.createEntryElement(entry);
            container.appendChild(entryElement);
        });
    }
}

// Initialize the journal app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new JournalApp();
});

// Add CSS animation for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .journal-entry {
        border: 1px solid #ddd;
        border-radius: 8px;
        margin-bottom: 16px;
        padding: 16px;
        background: white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .entry-header {
        margin-bottom: 12px;
    }
    
    .entry-card-title {
        margin: 0 0 8px 0;
        color: #333;
        font-size: 1.2em;
    }
    
    .entry-meta {
        display: flex;
        gap: 12px;
        font-size: 0.9em;
        color: #666;
    }
    
    .entry-preview {
        margin: 12px 0;
        padding: 8px 0;
        border-top: 1px solid #eee;
        border-bottom: 1px solid #eee;
    }
    
    .text-preview {
        color: #555;
        line-height: 1.5;
    }
    
    .entry-actions {
        display: flex;
        gap: 8px;
        margin-top: 12px;
    }
    
    .btn {
        padding: 6px 12px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.9em;
    }
    
    .btn-primary {
        background: #007bff;
        color: white;
    }
    
    .btn-secondary {
        background: #6c757d;
        color: white;
    }
    
    .btn-danger {
        background: #dc3545;
        color: white;
    }
    
    .btn:hover {
        opacity: 0.9;
    }
`;
document.head.appendChild(style);