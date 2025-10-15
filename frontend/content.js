// Find all textareas on the page
function addGrammarButtons() {
  document.querySelectorAll('textarea:not([data-grammar-enhanced])').forEach(textarea => {
    // Prevent adding more than one button
    textarea.setAttribute('data-grammar-enhanced', 'true');
    // Create button
    const btn = document.createElement('button');
    btn.innerText = "✔️ Grammar";
    btn.style.marginLeft = '8px';
    btn.style.marginTop = '4px';
    btn.style.padding = '3px 10px';
    btn.style.borderRadius = '4px';
    btn.style.border = 'none';
    btn.style.background = '#007bff';
    btn.style.color = 'white';
    btn.style.cursor = 'pointer';

    // Insert the button after the textarea
    textarea.parentNode.insertBefore(btn, textarea.nextSibling);

    btn.onclick = async function(e) {
      e.preventDefault();
      btn.innerText = "Checking...";
      const text = textarea.value;
      // Use your local backend URL or deployed API
      const backendURL = "http://127.0.0.1:5000";
      try {
        const resp = await fetch(`${backendURL}/correct`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text })
        });
        const data = await resp.json();
        if (data.corrected) {
          textarea.value = data.corrected;
        } else {
          alert("Grammar Error: " + (data.error || "Unknown error"));
        }
      } catch(err) {
        alert("Network error: " + err.message);
      }
      btn.innerText = "✔️ Grammar";
    };
  });
}

// Run on initial load
addGrammarButtons();
// Run on page changes (for dynamic SPAs)
const observer = new MutationObserver(addGrammarButtons);
observer.observe(document.body, { childList: true, subtree: true });
