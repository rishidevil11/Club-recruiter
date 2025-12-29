// public/script.js

// Global state to collect application data
const APPLICATION_STATE = {
    track: null,
    quizScore: 0,
    challengeResponse: null,
};

// public/script.js

const QUIZ_DATA = {
    "Photographer": {
        prompt: "To achieve a 'shallow depth of field' (blurred background), which setting should you adjust?",
        challenge: [
            { text: 'A. Increase the Shutter Speed', isCorrect: false },
            { text: 'B. Lower the Aperture (f-stop number)', isCorrect: true },
            { text: 'C. Increase the ISO', isCorrect: false },
            { text: 'D. Turn off the Flash', isCorrect: false },
        ]
    },
    "Video Editor": {
        prompt: "Which of these frame rates is the industry standard for a 'Cinematic' look?",
        challenge: [
            { text: 'A. 60 fps', isCorrect: false },
            { text: 'B. 30 fps', isCorrect: false },
            { text: 'C. 24 fps', isCorrect: true },
            { text: 'D. 120 fps', isCorrect: false },
        ]
    },
    "Graphic Designer": {
        prompt: "Which file format is 'Vector-based' (can be scaled infinitely without losing quality)?",
        challenge: [
            { text: 'A. .JPG', isCorrect: false },
            { text: 'B. .PNG', isCorrect: false },
            { text: 'C. .SVG', isCorrect: true },
            { text: 'D. .BMP', isCorrect: false },
        ]
    }
};

// Update handleFormSubmission to include new fields
async function handleFormSubmission(e) {
    e.preventDefault();
    const submitButton = document.getElementById('submit-button');
    submitButton.disabled = true;

    const appData = {
        name: document.getElementById('app-name').value,
        dept: document.getElementById('app-dept').value,
        year: document.getElementById('app-year').value,
        regNo: document.getElementById('app-regno').value,
        email: document.getElementById('app-email').value,
        essayResponse: document.getElementById('app-essay').value,
        track: APPLICATION_STATE.track,
        quizScore: APPLICATION_STATE.quizScore,
        challengeResponse: APPLICATION_STATE.challengeResponse,
    };

    // ... (keep the existing fetch logic)
}

// --- Initialization and Node 1 Logic ---

document.addEventListener('DOMContentLoaded', () => {
    const trackSelect = document.getElementById('track-select');
    const lockInButton = document.querySelector('#node-1 button');
    const applicationForm = document.getElementById('application-form');

    trackSelect.addEventListener('change', (e) => {
        APPLICATION_STATE.track = e.target.value;
        lockInButton.disabled = !APPLICATION_STATE.track;
    });

    lockInButton.addEventListener('click', () => {
        if (APPLICATION_STATE.track) {
            unlockNode(1);
            loadChallenge(APPLICATION_STATE.track);
        }
    });
    
    applicationForm.addEventListener('submit', handleFormSubmission);
});

function unlockNode(current) {
    // Logic to visually lock the current node and unlock the next
    const currentNode = document.getElementById(`node-${current}`);
    const nextNode = document.getElementById(`node-${current + 1}`);

    currentNode.classList.remove('active');
    currentNode.querySelector('.node-status').innerText = '✅ Completed';
    currentNode.querySelector('.node-status').classList.remove('locked');
    currentNode.querySelector('.node-status').classList.add('unlocked');
    
    if (nextNode) {
        nextNode.classList.remove('disabled');
        nextNode.classList.add('active');
    }
}

// --- Node 2: Core Skill Challenge Logic ---

function loadChallenge(track) {
    const data = QUIZ_DATA[track];
    const challengeArea = document.getElementById('challenge-area');
    const challengeButton = document.getElementById('challenge-button');
    
    document.querySelector('.challenge-prompt').textContent = data.prompt;
    challengeArea.innerHTML = ''; 
    challengeButton.disabled = true; // Disable until an option is selected

    // Display the code snippet if available
    if (data.codeSnippet) {
        challengeArea.innerHTML += `<pre><code>${data.codeSnippet}</code></pre>`;
    }

    // Create the multiple-choice radio buttons
    data.challenge.forEach((item, index) => {
        const id = `q${track.toLowerCase()}${index}`;
        
        const input = document.createElement('input');
        input.type = 'radio';
        input.name = 'challenge-answer';
        input.id = id;
        input.value = item.isCorrect;
        input.classList.add('quiz-radio');

        const label = document.createElement('label');
        label.setAttribute('for', id);
        label.innerHTML = `${item.text}<br>`; // Use innerHTML to allow line breaks

        challengeArea.appendChild(input);
        challengeArea.appendChild(label);
    });

    // Event listener for radio buttons to enable the completion button
    document.querySelectorAll('.quiz-radio').forEach(radio => {
        radio.addEventListener('change', () => {
            challengeButton.disabled = false;
        });
    });

    // Set the button action
    challengeButton.onclick = validateChallenge;
}

function validateChallenge() {
    const selected = document.querySelector('input[name="challenge-answer"]:checked');
    if (!selected) return;

    // Determine correctness and score
    const isCorrect = selected.value === 'true';
    APPLICATION_STATE.quizScore = isCorrect ? 10 : 0;
    
    // Store the selected response text
    const labelText = document.querySelector(`label[for="${selected.id}"]`).textContent.trim();
    APPLICATION_STATE.challengeResponse = labelText;

    // Provide feedback
    alert(isCorrect ? 'Correct! Skill Node Unlocked.' : 'Incorrect. Proceeding to the final application.');
    
    // Unlock Node 3
    unlockNode(2);
    document.getElementById('submit-button').disabled = false;
}


// --- Node 3: Final Submission Logic ---

async function handleFormSubmission(e) {
    e.preventDefault();

    const submitButton = document.getElementById('submit-button');
    const statusMessage = document.getElementById('status-message');
    
    submitButton.disabled = true;
    submitButton.textContent = 'TRANSMITTING DATA...';
    
    const appData = {
        name: document.getElementById('app-name').value,
        email: document.getElementById('app-email').value,
        essayResponse: document.getElementById('app-essay').value,
        
        // Data pulled from global state
        track: APPLICATION_STATE.track,
        quizScore: APPLICATION_STATE.quizScore,
        challengeResponse: APPLICATION_STATE.challengeResponse,
    };
    
    statusMessage.style.color = 'white'; // Reset color

    try {
        // Fetch to the server API
        const response = await fetch('/api/apply', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(appData)
        });

        const result = await response.json();

        if (response.ok) { // Status 200-299 (including 201)
            statusMessage.style.color = 'var(--accent-yellow)'; // Use your theme's yellow for success
            statusMessage.innerHTML = `<strong>SUCCESS [201]!</strong> ${result.message} Application ID: ${result.applicationId}`;
            
            document.getElementById('application-form').reset();
            
            // OPTIONAL: Visually disable the entire node on success
            const node3 = document.getElementById('node-3');
            node3.classList.remove('active');
            node3.classList.add('disabled');
            node3.querySelector('h2').textContent = '3. Final Application Complete!';
            
            // Remove the form content to prevent re-submission
            document.getElementById('application-form').style.display = 'none';

        }else { // Handle 400, 409, 500 errors from the server
            statusMessage.style.color = 'var(--error)';
            statusMessage.innerHTML = `<strong>ERROR [${response.status}]:</strong> ${result.message}`;
        }
    } catch (error) {
        // Handle genuine network errors (server is down, connection lost)
        statusMessage.style.color = 'var(--error)';
        statusMessage.innerHTML = `<strong>NETWORK ERROR:</strong> Could not reach the recruitment server. Please check your connection.`;
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Submit Final Application';
    }
}