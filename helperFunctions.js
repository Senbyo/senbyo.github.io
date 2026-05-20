// --- AUTOMATIC SYNTAX HIGHLIGHTING ---
document.addEventListener("DOMContentLoaded", () => {
    // --- AUTOMATIC SYNTAX HIGHLIGHTING ---
    // Finds all code blocks inside citation boxes and applies the CSS colors
    document.querySelectorAll('.citation-box code').forEach(codeBlock => {
        codeBlock.innerHTML = highlightBibTeX(codeBlock.innerText);
    });
});

// --- UI INTERACTIONS ---

// 1. Tab Switching Logic
function showPage(pageId) {
    document.querySelectorAll('.nav-link').forEach(btn => {
        btn.classList.remove('active');
        if(btn.innerText.toLowerCase() === pageId) btn.classList.add('active');
    });

    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
    
    window.scrollTo(0,0);
}

// 2. Toggle Citation Drawer
function toggleCitation(btn) {
    const box = btn.closest('.pub-card').querySelector('.citation-box');
    
    // Optional: Close all other open citation boxes first for a cleaner UI
    document.querySelectorAll('.citation-box').forEach(b => {
        if (b !== box) b.style.display = 'none';
    });
    
    box.style.display = (box.style.display === 'block') ? 'none' : 'block';
}

// 3. Copy to Clipboard
function copyCitation(btn) {
    // Find the code block within the same citation box
    const codeBlock = btn.parentElement.querySelector('code');
    
    // .innerText ignores all the HTML spans we added for highlighting
    const textToCopy = codeBlock.innerText;
    
    navigator.clipboard.writeText(textToCopy).then(() => {
        // Visual feedback
        const originalIcon = btn.innerHTML;
        btn.classList.add('copied');
        btn.innerHTML = '<i class="fas fa-check"></i>'; 
        
        setTimeout(() => {
            btn.classList.remove('copied');
            btn.innerHTML = originalIcon; 
        }, 2000);
    });
}

// --- UTILITY FUNCTIONS ---

// Parses raw BibTeX and wraps it in your style.css color spans
function highlightBibTeX(bibtexString) {
    let escaped = bibtexString.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    
    return escaped
        // Highlight @article, @inproceedings etc. (Blue)
        .replace(/(@\w+)/g, '<span class="bib-type">$1</span>')
        // Highlight the citation key (White)
        .replace(/(@\w+\s*{\s*)([^,]+)/g, '$1<span class="bib-key">$2</span>')
        // Highlight string values "{...}" (Orange) - MADE GREEDY to handle nested LaTeX braces
        .replace(/(= \s*){(.*)}/g, '$1{<span class="bib-val">$2</span>}')
        // Highlight string values "..." (Orange) - MADE GREEDY
        .replace(/(= \s*)"(.*)"/g, '$1"<span class="bib-val">$2</span>"')
        // Highlight numbers and bare words like years/months (Teal)
        .replace(/(= \s*)([0-9]+|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)(\s*[,}])?/gi, '$1<span class="bib-num">$2</span>$3');
}