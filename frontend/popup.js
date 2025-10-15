const backendURL = "http://127.0.0.1:5000"; // Update if deployed
// JavaScript logic remains the same
        document.addEventListener('DOMContentLoaded', function() {
            // ⚠️ IMPORTANT: REPLACE this with the base URL of your deployed FastAPI service
            const BACKEND_BASE_URL = "http://127.0.0.1:5000"; 

            // Helper function for making API calls with error handling
            async function callBackend(endpoint, inputId, outputId) {
                const inputText = document.getElementById(inputId).value.trim();
                const outputTextarea = document.getElementById(outputId);
                
                if (!inputText) {
                    outputTextarea.value = "⚠️ Please enter text.";
                    outputTextarea.style.color = '#FFA000'; // Amber warning
                    return;
                }

                const action = endpoint.includes('correct') ? "Gemini for correction" : "sentiment analysis";
                outputTextarea.value = `⏳ Sending text for ${action}...`;
                outputTextarea.style.color = '#e0e6f1'; // Light text color for status

                // Minimal exponential backoff implementation for robustness
                const MAX_RETRIES = 3;
                let lastError = null;

                for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
                    try {
                        const response = await fetch(`${BACKEND_BASE_URL}/${endpoint}`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ text: inputText })
                        });

                        // Check for HTTP error status (e.g., 404, 500)
                        if (!response.ok) {
                            const errorText = await response.text();
                            throw new Error(`HTTP Error ${response.status}: ${errorText}`);
                        }

                        const data = await response.json();

                        // Check for custom backend error field
                        if (data.error) {
                            throw new Error(`Backend Error: ${data.error}`);
                        }

                        if (endpoint === 'correct') {
                            outputTextarea.value = data.corrected_text || "Correction service returned no text.";
                        } else if (endpoint === 'sentiment') {
                            outputTextarea.value = data.sentiment_result || "Analysis service returned no result.";
                        }
                        outputTextarea.style.color = '#a0a8b3'; // Output text color
                        return; // Success
                    } catch (error) {
                        lastError = error;
                        if (attempt < MAX_RETRIES - 1) {
                            const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
                            await new Promise(resolve => setTimeout(resolve, delay));
                        }
                    }
                }

                // If all retries fail
                console.error("Final Fetch Error:", lastError);
                outputTextarea.value = `🚨 Failed after ${MAX_RETRIES} attempts. Error: ${lastError.message}`;
                outputTextarea.style.color = 'red';
            }

            // Listener for the Grammar Correction Button
            document.getElementById('correctButton').addEventListener('click', () => {
                callBackend('correct', 'grammarInput', 'grammarOutput');
            });

            // Listener for the Sentiment Analysis Button
            document.getElementById('analyzeButton').addEventListener('click', () => {
                callBackend('sentiment', 'sentimentInput', 'sentimentOutput');
            });
        });