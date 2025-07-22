const entryForm = document.getElementById("entryForm");
const entryTitle = document.getElementById("entryTitle");
const entryContent = document.getElementById("entryContent");
const entryAuthor = document.getElementById("entryAuthor");
const entryDate = document.getElementById("entryDate");
const entryImage = document.getElementById("entryImage");
const imagePreview = document.getElementById("imagePreview");
const resetBtn = document.getElementById("resetBtn");

let entries = JSON.parse(localStorage.getItem('journalEntries') || '[]');
const editingIndex = localStorage.getItem('editingEntryIndex');

// Load entry if editing (launched after "edit" on journal.html)
if (editingIndex !== null && typeof entries[editingIndex] !== "undefined") {
    const e = entries[editingIndex];
    document.getElementById('formTitle').textContent = 'Edit Memory';
    entryTitle.value = e.title;
    entryContent.value = e.content;
    entryAuthor.value = e.author;
    entryDate.value = (e.date ? e.date.slice(0, 10) : '');
    if (e.image) {
        imagePreview.src = e.image;
        imagePreview.style.display = 'block';
    }
} else {
    // If not editing, new memory
    entryDate.value = (new Date()).toISOString().slice(0, 10); // today default
}

entryImage.addEventListener('change', function(e){
    const file = e.target.files[0];
    if(file) {
        const reader = new FileReader();
        reader.onload = function(ev){
            imagePreview.src = ev.target.result;
            imagePreview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
});

entryForm.addEventListener("submit", function(e){
    e.preventDefault();

    const title = entryTitle.value.trim();
    const content = entryContent.value.trim();
    const author = entryAuthor.value;
    const date = entryDate.value;
    let image = "";
    if(imagePreview.src) image = imagePreview.src;

    const entryObj = { title, content, author, date, image };

    if(editingIndex !== null && typeof entries[editingIndex] !== "undefined") {
        entries[editingIndex] = entryObj;
        localStorage.removeItem('editingEntryIndex');
    } else {
        entries.unshift(entryObj);
    }
    localStorage.setItem('journalEntries', JSON.stringify(entries));
    // SUCCESS: Redirect to journal
    window.location.href = "journal.html";
});

resetBtn.addEventListener("click", () => {
    entryForm.reset();
    imagePreview.style.display = 'none';
    imagePreview.src = "";
    if(document.getElementById('formTitle')) document.getElementById('formTitle').textContent = "New Memory";
    localStorage.removeItem('editingEntryIndex');
});
