// Game state
let currentScene = 0;
let gameState = {
    scenes: [],
    currentAudio: null
};

// Audio state
const audioState = {
    currentAudio: null,
    isMuted: false,
    volume: 0.5
};

// Scene structure
class Scene {
    constructor(text, choices, image, audio, sequential = false, postAudioText = null, transcript = null) {
        this.text = text;
        this.choices = choices;
        this.image = image;
        this.audio = audio;
        this.sequential = sequential;
        this.postAudioText = postAudioText;
        this.transcript = transcript; // Array of {text, time} objects
    }
}

// Audio controls
function createAudioControls() {
    console.log('Creating audio controls');
    const controls = document.createElement('div');
    controls.className = 'audio-controls';
    controls.innerHTML = `
        <button id="toggleMute">🔊</button>
        <button id="togglePlay">▶️</button>
    `;
    document.body.appendChild(controls);

    const muteButton = document.getElementById('toggleMute');
    const playButton = document.getElementById('togglePlay');

    muteButton.addEventListener('click', () => {
        audioState.isMuted = !audioState.isMuted;
        if (audioState.currentAudio) {
            audioState.currentAudio.muted = audioState.isMuted;
        }
        muteButton.textContent = audioState.isMuted ? '🔇' : '🔊';
    });

    playButton.addEventListener('click', () => {
        if (audioState.currentAudio) {
            if (audioState.currentAudio.paused) {
                audioState.currentAudio.play();
                playButton.textContent = '⏸️';
            } else {
                audioState.currentAudio.pause();
                playButton.textContent = '▶️';
            }
        }
    });
}

// Function to interpolate transcript timings
function interpolateTranscriptTimings(transcriptMarkers) {
    if (!transcriptMarkers || transcriptMarkers.length < 2) {
        return transcriptMarkers; // Return as is if not enough markers
    }
    
    // Sort markers by time
    const sortedMarkers = [...transcriptMarkers].sort((a, b) => a.time - b.time);
    
    // Create a complete transcript with interpolated timings
    const completeTranscript = [];
    
    // Process each pair of markers
    for (let i = 0; i < sortedMarkers.length - 1; i++) {
        const currentMarker = sortedMarkers[i];
        const nextMarker = sortedMarkers[i + 1];
        
        // Add the current marker
        completeTranscript.push({
            text: currentMarker.text,
            time: currentMarker.time
        });
        
        // If there are intermediate lines, interpolate their timings
        if (currentMarker.intermediateLines && currentMarker.intermediateLines.length > 0) {
            const timeDiff = nextMarker.time - currentMarker.time;
            const lineCount = currentMarker.intermediateLines.length;
            
            // Calculate time increment for each intermediate line
            const timeIncrement = timeDiff / (lineCount + 1);
            
            // Add intermediate lines with interpolated timings
            currentMarker.intermediateLines.forEach((line, index) => {
                completeTranscript.push({
                    text: line,
                    time: currentMarker.time + (timeIncrement * (index + 1))
                });
            });
        }
    }
    
    // Add the last marker
    completeTranscript.push({
        text: sortedMarkers[sortedMarkers.length - 1].text,
        time: sortedMarkers[sortedMarkers.length - 1].time
    });
    
    return completeTranscript;
}

// Function to display transcript lines gradually
function displayTranscript(transcript, audioElement) {
    if (!transcript || transcript.length === 0) return;

    const transcriptContainer = document.getElementById('transcript');
    if (!transcriptContainer) return;

    // Clear any existing transcript
    transcriptContainer.innerHTML = '';
    
    // Check if we need to interpolate timings
    let finalTranscript = transcript;
    if (transcript.some(line => line.intermediateLines)) {
        console.log('Interpolating transcript timings');
        finalTranscript = interpolateTranscriptTimings(transcript);
    }

    // Maximum number of lines to show at once
    const MAX_VISIBLE_LINES = 5;
    let visibleLines = [];
    
    // Create elements for each line but keep them invisible
    finalTranscript.forEach((line, index) => {
        const lineElement = document.createElement('div');
        lineElement.className = 'transcript-line';
        lineElement.textContent = line.text;
        transcriptContainer.appendChild(lineElement);

        // Set up timing for this line
        setTimeout(() => {
            // Add this line to visible lines
            visibleLines.push(lineElement);
            lineElement.classList.add('visible');
            
            // If we have more than MAX_VISIBLE_LINES, fade out the oldest one
            if (visibleLines.length > MAX_VISIBLE_LINES) {
                const oldestLine = visibleLines.shift();
                oldestLine.classList.add('fade-out');
                
                // Remove the line after fade-out animation completes
                setTimeout(() => {
                    if (oldestLine.parentNode === transcriptContainer) {
                        transcriptContainer.removeChild(oldestLine);
                    }
                }, 1000); // Match this with CSS transition duration
            }
        }, line.time * 1000); // Convert to milliseconds
    });
}

// Update the scene display
function updateScene(sceneId) {
    console.log('Updating scene:', sceneId);
    const scene = gameState.scenes[sceneId];
    
    if (!scene) {
        console.error('Scene not found:', sceneId);
        return;
    }

    console.log('Scene content:', scene);

    // Update dialogue text
    const dialogueText = document.getElementById('dialogue-text');
    if (!dialogueText) {
        console.error('Dialogue text element not found');
        return;
    }
    dialogueText.textContent = scene.text;
    console.log('Updated dialogue text:', scene.text);

    // Update scene image with loading state
    const sceneImage = document.getElementById('scene-image');
    if (!sceneImage) {
        console.error('Scene image element not found');
        return;
    }
    sceneImage.classList.remove('loaded');
    
    const img = new Image();
    img.onload = () => {
        console.log('Image loaded successfully:', scene.image);
        sceneImage.style.backgroundImage = `url(${scene.image})`;
        sceneImage.classList.add('loaded');
    };
    img.onerror = () => {
        console.log('Image failed to load, using fallback');
        sceneImage.style.backgroundImage = 'url(assets/images/corkboard.jpg)';
        sceneImage.classList.add('loaded');
    };
    img.src = scene.image;

    // Clear existing choices
    const choicesContainer = document.getElementById('choices');
    if (!choicesContainer) {
        console.error('Choices container not found');
        return;
    }
    choicesContainer.innerHTML = '';
    console.log('Cleared existing choices');

    // Special handling for Scene I1 (Intro)
    if (sceneId === 0) {
        console.log('Special handling for Scene I1 (Intro)');
        const playButton = document.createElement('button');
        playButton.className = 'choice-button play-audio-button';
        playButton.textContent = '▶️ Click to Start';
        
        const showChoicesAfterAudio = () => {
            console.log('Showing choices after audio for Scene I1');
            if (scene.postAudioText) {
                dialogueText.textContent = scene.postAudioText;
                console.log('Updated post-audio text:', scene.postAudioText);
            }
            console.log('About to show choices for scene:', scene);
            showChoices(scene);
        };

        playButton.addEventListener('click', () => {
            console.log('Play button clicked for Scene I1');
            playButton.remove();
            playAudio(scene.audio, showChoicesAfterAudio, scene.transcript);
        });
        choicesContainer.appendChild(playButton);
        console.log('Added play button to choices container');
    }
    // For all other scenes, autoplay the audio if it exists
    else if (scene.audio) {
        console.log('Autoplaying audio for scene:', sceneId);
        
        const showChoicesAfterAudio = () => {
            console.log('Showing choices after audio for scene:', sceneId);
            if (scene.postAudioText) {
                dialogueText.textContent = scene.postAudioText;
                console.log('Updated post-audio text:', scene.postAudioText);
            }
            console.log('About to show choices for scene:', scene);
            showChoices(scene);
        };
        
        // Autoplay the audio with transcript
        playAudio(scene.audio, showChoicesAfterAudio, scene.transcript);
    } else {
        // If no audio, show choices immediately
        console.log('No audio for scene, showing choices immediately');
        showChoices(scene);
    }
}

// Show choices for a scene
function showChoices(scene) {
    console.log('Showing choices for scene:', scene);
    const choicesContainer = document.getElementById('choices');
    
    if (!choicesContainer) {
        console.error('Choices container not found in DOM');
        return;
    }
    
    if (!scene.choices || scene.choices.length === 0) {
        console.warn('No choices available for this scene');
        return;
    }
    
    console.log('Creating choice buttons for:', scene.choices.length, 'choices');
    
    scene.choices.forEach(choice => {
        console.log('Creating button for choice:', choice.text);
        const button = document.createElement('button');
        button.className = 'choice-button';
        button.textContent = choice.text;
        button.addEventListener('click', () => {
            console.log('Choice clicked:', choice.text, 'Next scene:', choice.nextScene);
            updateScene(choice.nextScene);
        });
        choicesContainer.appendChild(button);
    });
    
    console.log('All choice buttons added to container');
}

// Modified playAudio function to handle transcripts
function playAudio(audioPath, onComplete = null, transcript = null) {
    console.log('Playing audio:', audioPath, 'with completion callback:', !!onComplete);
    
    // Stop any currently playing audio
    if (audioState.currentAudio) {
        console.log('Stopping current audio');
        audioState.currentAudio.pause();
        audioState.currentAudio = null;
    }

    if (!audioPath) {
        console.log('No audio path provided, calling completion callback immediately');
        if (onComplete) onComplete();
        return;
    }

    const audio = new Audio(audioPath);
    audio.volume = audioState.volume;
    audio.muted = audioState.isMuted;
    
    // Set up event listeners before playing
    audio.addEventListener('play', () => {
        console.log('Audio started playing');
        const playButton = document.getElementById('togglePlay');
        if (playButton) playButton.textContent = '⏸️';
        
        // Start displaying transcript if available
        if (transcript) {
            displayTranscript(transcript, audio);
        }
    });

    audio.addEventListener('pause', () => {
        console.log('Audio paused');
        const playButton = document.getElementById('togglePlay');
        if (playButton) playButton.textContent = '▶️';
    });

    audio.addEventListener('ended', () => {
        console.log('Audio ended naturally, calling completion callback');
        const playButton = document.getElementById('togglePlay');
        if (playButton) playButton.textContent = '▶️';
        if (onComplete) {
            console.log('Executing completion callback');
            try {
                onComplete();
                console.log('Completion callback executed successfully');
            } catch (error) {
                console.error('Error in completion callback:', error);
            }
        } else {
            console.warn('No completion callback provided for audio end');
        }
    });

    audio.addEventListener('error', (error) => {
        console.error('Audio error:', error);
        if (onComplete) {
            console.log('Executing completion callback due to error');
            try {
                onComplete();
                console.log('Completion callback executed successfully after error');
            } catch (error) {
                console.error('Error in completion callback after audio error:', error);
            }
        }
    });

    audioState.currentAudio = audio;
    
    // Start playing
    console.log('Attempting to play audio');
    audio.play().catch(error => {
        console.error('Audio playback failed:', error);
        if (onComplete) {
            console.log('Executing completion callback due to play failure');
            try {
                onComplete();
                console.log('Completion callback executed successfully after play failure');
            } catch (error) {
                console.error('Error in completion callback after play failure:', error);
            }
        }
    });
}

// Initialize the game
function initGame() {
    console.log('Initializing game');
    
    // Initialize scenes first
    if (typeof initializeScenes === 'function') {
        console.log('Initializing scenes');
        initializeScenes();
    } else {
        console.error('initializeScenes function not found');
        return;
    }
    
    // Check if scenes were initialized
    if (!gameState.scenes || gameState.scenes.length === 0) {
        console.error('No scenes were initialized');
        return;
    }
    
    console.log('Scenes initialized:', gameState.scenes.length);
    
    // Create audio controls
    createAudioControls();
    
    // Update to the first scene
    updateScene(0);
}

// Start the game when the page loads
window.addEventListener('load', initGame); 