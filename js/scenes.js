// Initialize all scenes
function initializeScenes() {
    // Scene I1: Intro
    const sceneI1 = new Scene(
        "MAXINE MILES AND THE LOOSE ENDS",
        [
            { text: "Find hard evidence of Hal's corruption.", nextScene: 1 },
            { text: "Tell Ransom and Riley the truth.", nextScene: 2 },
            { text: "Ask Ms. Honeywell about the stolen files in her inn.", nextScene: 3 }
        ], // Choices that appear after audio
        "assets/images/intro.jpg",
        "assets/audio/intro.mp3?v=" + new Date().getTime(),
        true, // Sequential - wait for audio
        "What do I do?", // Text shown after audio
        [
            {
                text: "Okay. Let's try this again.",
                time: 0,
                intermediateLines: [
                    "We found Riley. And it turns out he'd been kidnapped after all-",
                    "Which I was right about the whole time, I knew he didn't run away-",
                ]
            },
            {
                text: "Never mind.",
                time: 10,
                intermediateLines: [
                    "On a Monday night, Mr. Beatty took Riley to his secret cabin in the woods",
                    "and locked him up there."
                ]
            },
            {
                text: "And by Sunday, Mr. Beatty let him go.",
                time: 15,
                intermediateLines: [
                    "He still hasn't really told me about that-",
                    "neither of them have."
                ]
            },
            {
                text: "Why Beatty let Riley go.",
                time: 20,
                intermediateLines: [
                    "I guess he just felt bad.",
                    "Even though he knew it would make Hal furious."
                ]
            },
            {
                text: "Because it wasn't Mr. Beatty's idea at all to kidnap Riley",
                time: 28
            }
        ]
    );

    // Scene I2: Find hard evidence of Hal's corruption
    const sceneI2 = new Scene(
        "Find hard evidence of Hal's corruption.",
        [
            { text: "Break into Hal's office at City Hall.", nextScene: 5 }
        ],
        "assets/images/hal.jpg",
        "assets/audio/hal.mp3?v=" + new Date().getTime(),
        true,
        "What do I do?",
        [
            {
                text: "Alright, you're right,",
                time: 0,
                intermediateLines: [
                    "I just need to buck up and find evidence to prove",
                    "that Hal has been involved with this whole mess from the very start.",
                ]
            },
            {
                text: "Which means…",
                time: 8,
                intermediateLines: [
                    "breaking into his office.",
                    "Gosh, Ross, I really wish you were awake."
                ]
            },
            {
                text: "You're so much better at breaking the rules.",
                time: 13
            }
        ]
    );

    // Scene I3: Tell Ransom and Riley the truth
    const sceneI3 = new Scene(
        "Tell Ransom and Riley the truth.",
        [
            { text: "Track down Ransom and Riley.", nextScene: 6 }
        ],
        "assets/images/archer.jpg",
        "assets/audio/archer.mp3?v=" + new Date().getTime(),
        true,
        "What do I do?",
        [
            {
                text: "Okay, you know what?",
                time: 0,
                intermediateLines: [
                    "I don't think I can live another day with this whole ",
                    "Ransom and Riley thing hanging over my head.",
                ]
            },
            {
                text: "I have to tell them.",
                time: 6
            }
        ]
    );

    // Scene I4: Ask Ms. Honeywell about the stolen files
    const sceneI4 = new Scene(
        "Ask Ms. Honeywell about the stolen files in her inn.",
        [
            { text: "Go to the inn to talk to Honeywell.", nextScene: 7 }
        ],
        "assets/images/honeywell.jpg",
        "assets/audio/honeywell.mp3?v=" + new Date().getTime(),
        true,
        "What do I do?",
        [
            {
                text: "You know what?",
                time: 0,
                intermediateLines: [
                    "I just need to buck up and find evidence to prove",
                    "that Hal has been involved with this whole mess from the very start.",
                ]
            },
            {
                text: "And Ms. Honeywell must know something–",
                time: 6,
                intermediateLines: [
                    "if Riley didn't stash those files,",
                    "then surely Honeywell knows who did.",
                    "Maybe she…"
                ]
            },
            {
                text: "I should talk to her.",
                time: 12
            }
        ]
    );

    // Add all scenes to the game state
    gameState.scenes = [sceneI1, sceneI2, sceneI3, sceneI4];
    
    console.log('Scenes initialized successfully:', gameState.scenes.length);
}

// Make sure the function is available globally
window.initializeScenes = initializeScenes; 