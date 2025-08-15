document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const petImage = document.getElementById('pet-image');
    const petNameEl = document.getElementById('pet-name');

    const hungerBar = document.getElementById('hunger-bar');
    const hungerText = document.getElementById('hunger-text');
    const happinessBar = document.getElementById('happiness-bar');
    const happinessText = document.getElementById('happiness-text');
    const energyBar = document.getElementById('energy-bar');
    const energyText = document.getElementById('energy-text');
    const hygieneBar = document.getElementById('hygiene-bar');
    const hygieneText = document.getElementById('hygiene-text');

    const feedBtn = document.getElementById('feed-btn');
    const playBtn = document.getElementById('play-btn');
    const cleanBtn = document.getElementById('clean-btn');
    const sleepBtn = document.getElementById('sleep-btn');
    const healBtn = document.getElementById('heal-btn');

    const messageModal = document.getElementById('message-modal');
    const messageText = document.getElementById('message-text');
    const closeMessageBtn = document.getElementById('close-message-btn');

    // --- Pet State ---
    let pet = {
        name: 'Carniça',
        hunger: 100,
        happiness: 100,
        energy: 100,
        hygiene: 100,
        isSick: false
    };

    const decayRates = {
        hunger: 0.5,
        happiness: 0.3,
        energy: 0.8,
        hygiene: 0.2
    };

    const actionEffects = {
        feed: { hunger: +30, happiness: +10, energy: -5, hygiene: -5 },
        play: { hunger: -10, happiness: +30, energy: -20, hygiene: -10 },
        clean: { hunger: -5, happiness: +10, energy: -5, hygiene: +40 },
        sleep: { hunger: -10, happiness: +10, energy: +50, hygiene: -5 },
        heal: { happiness: +15, energy: -15, hygiene: +5 }
    };

    let gameInterval = null;
    let difficultyMultiplier = 1;
    let timeAtZero = { hunger: 0, happiness: 0, energy: 0, hygiene: 0 };

    // --- Helper Functions ---
    function showMessage(message, isEndGame = false) {
        messageText.textContent = message;
        messageModal.style.display = 'flex';
        if (isEndGame) {
            closeMessageBtn.textContent = 'Recomeçar';
            closeMessageBtn.removeEventListener('click', hideMessage);
            closeMessageBtn.addEventListener('click', restartGame);
        } else {
            closeMessageBtn.textContent = 'Fechar';
            closeMessageBtn.removeEventListener('click', restartGame);
            closeMessageBtn.addEventListener('click', hideMessage);
        }
    }

    function hideMessage() {
        messageModal.style.display = 'none';
    }

    function clamp(value, min, max) {
        return Math.max(min, Math.min(value, max));
    }

    function updateUI() {
        hungerBar.style.width = `${pet.hunger}%`;
        hungerText.textContent = `${Math.round(pet.hunger)}%`;
        hungerBar.style.backgroundColor = getStatusColor(pet.hunger);

        happinessBar.style.width = `${pet.happiness}%`;
        happinessText.textContent = `${Math.round(pet.happiness)}%`;
        happinessBar.style.backgroundColor = getStatusColor(pet.happiness);

        energyBar.style.width = `${pet.energy}%`;
        energyText.textContent = `${Math.round(pet.energy)}%`;
        energyBar.style.backgroundColor = getStatusColor(pet.energy);

        hygieneBar.style.width = `${pet.hygiene}%`;
        hygieneText.textContent = `${Math.round(pet.hygiene)}%`;
        hygieneBar.style.backgroundColor = getStatusColor(pet.hygiene);

        updatePetImage();
        updateButtonState();
    }

    function updatePetImage() {
        if (pet.isSick) {
            petImage.src = "img/doente.jpg";
        } else if (pet.hunger < 30 || pet.happiness < 30 || pet.energy < 30 || pet.hygiene < 30) {
            petImage.src = "img/triste.jpg";
        } else {
            petImage.src = "img/feliz.jpg";
        }
    }

    function getStatusColor(percentage) {
        if (percentage > 70) return '#4caf50';
        if (percentage > 30) return '#ffeb3b';
        return '#f44336';
    }

    function applyActionEffects(effects) {
        for (const stat in effects) {
            if (pet.hasOwnProperty(stat)) {
                pet[stat] = clamp(pet[stat] + effects[stat], 0, 100);
            }
        }
        updateUI();
    }

    function updateButtonState() {
        playBtn.disabled = pet.energy < 20;
        feedBtn.disabled = pet.hunger > 90;
        sleepBtn.disabled = pet.energy > 80;
        cleanBtn.disabled = pet.hygiene > 90;
        if (pet.isSick) {
            healBtn.classList.remove('hidden');
        } else {
            healBtn.classList.add('hidden');
        }
        healBtn.disabled = pet.energy < 15;
    }

    // --- Novas mecânicas ---
    function increaseDifficulty() {
        difficultyMultiplier += 0.05;
    }

    function randomEvent() {
        const chance = Math.random();
        if (chance < 0.1) { // 10% de chance a cada 1 segundo
            const events = [
                { msg: `${pet.name} ficou doente! 🤒`, effect: { energy: -20, happiness: -20 }, sick: true },
                { msg: `${pet.name} fez bagunça e se sujou! 😫`, effect: { hygiene: -30, happiness: -10 } },
                { msg: `${pet.name} ficou entediado! 😴`, effect: { happiness: -25 } }
            ];
            const ev = events[Math.floor(Math.random() * events.length)];
            applyActionEffects(ev.effect);
            if (ev.sick) pet.isSick = true;
            showMessage(ev.msg);
        }
    }

    function checkPetDeath() {
        let isDead = false;
        for (let stat in timeAtZero) {
            if (pet[stat] <= 0) {
                timeAtZero[stat]++;
                if (timeAtZero[stat] >= 5) {
                    isDead = true;
                }
            } else {
                timeAtZero[stat] = 0;
            }
        }
        if (isDead) {
            endGame(`${pet.name} não resistiu... Fim de jogo! 💀`);
        }
    }

    function endGame(message) {
        clearInterval(gameInterval);
        disableAllButtons();
        petImage.src = "img/morto.jpg"; 
        showMessage(message, true);
    }

    function disableAllButtons() {
        feedBtn.disabled = playBtn.disabled = cleanBtn.disabled = sleepBtn.disabled = healBtn.disabled = true;
    }

    function restartGame() {
        pet = {
            name: 'Buddy',
            hunger: 100,
            happiness: 100,
            energy: 100,
            hygiene: 100,
            isSick: false
        };
        difficultyMultiplier = 1;
        timeAtZero = { hunger: 0, happiness: 0, energy: 0, hygiene: 0 };
        hideMessage();
        initializeGame();
    }

    // --- Game loop ---
    function timeProgression() {
        pet.hunger = clamp(pet.hunger - decayRates.hunger * difficultyMultiplier, 0, 100);
        pet.happiness = clamp(pet.happiness - decayRates.happiness * difficultyMultiplier, 0, 100);
        pet.energy = clamp(pet.energy - decayRates.energy * difficultyMultiplier, 0, 100);
        pet.hygiene = clamp(pet.hygiene - decayRates.hygiene * difficultyMultiplier, 0, 100);

        updateUI();
        checkPetStatus();
        checkPetDeath();
        randomEvent();
    }

    function checkPetStatus() {
        if (pet.hunger <= 0) {
            showMessage(`${pet.name} está faminto!`);
            pet.happiness = clamp(pet.happiness - 0.5, 0, 100);
        }
        if (pet.happiness <= 0) {
            showMessage(`${pet.name} está muito triste!`);
            pet.energy = clamp(pet.energy - 0.5, 0, 100);
        }
        if (pet.energy <= 0) {
            showMessage(`${pet.name} está exausto!`);
            pet.happiness = clamp(pet.happiness - 0.5, 0, 100);
        }
        if (pet.hygiene <= 0) {
            showMessage(`${pet.name} está sujo!`);
            pet.happiness = clamp(pet.happiness - 0.5, 0, 100);
        }
    }

    // --- Event handlers ---
    function handleFeed() {
        if (pet.hunger > 90) {
            showMessage(`${pet.name} não está com fome agora.`);
            return;
        }
        applyActionEffects(actionEffects.feed);
        showMessage(`${pet.name} comeu e está mais feliz! 🦴`);
    }

    function handlePlay() {
        if (pet.energy < 20) {
            showMessage(`${pet.name} está muito cansado para brincar.`);
            return;
        }
        applyActionEffects(actionEffects.play);
        showMessage(`${pet.name} se divertiu muito! 🎾`);
    }

    function handleClean() {
        if (pet.hygiene > 90) {
            showMessage(`${pet.name} já está limpo.`);
            return;
        }
        applyActionEffects(actionEffects.clean);
        showMessage(`${pet.name} está limpinho e cheiroso! 🛁`);
    }

    function handleSleep() {
        if (pet.energy > 80) {
            showMessage(`${pet.name} não está com sono agora.`);
            return;
        }
        applyActionEffects(actionEffects.sleep);
        showMessage(`${pet.name} tirou uma boa soneca! 😴`);
    }

    function handleHeal() {
        if (!pet.isSick) {
            showMessage(`${pet.name} não está doente.`);
            return;
        }
        if (pet.energy < 15) {
            showMessage(`${pet.name} não tem energia para ser tratado.`);
            return;
        }
        applyActionEffects(actionEffects.heal);
        pet.isSick = false;
        showMessage(`${pet.name} se sentindo muito melhor! 😊`);
    }

    // --- Initialization ---
    function initializeGame() {
        petNameEl.textContent = pet.name;
        updateUI();
        enableAllButtons();
        gameInterval = setInterval(timeProgression, 1000);
        setInterval(increaseDifficulty, 60000); 
    }

    function enableAllButtons() {
        feedBtn.disabled = playBtn.disabled = cleanBtn.disabled = sleepBtn.disabled = healBtn.disabled = false;
    }

    // --- Listeners ---
    feedBtn.addEventListener('click', handleFeed);
    playBtn.addEventListener('click', handlePlay);
    cleanBtn.addEventListener('click', handleClean);
    sleepBtn.addEventListener('click', handleSleep);
    healBtn.addEventListener('click', handleHeal);

    closeMessageBtn.addEventListener('click', hideMessage);
    messageModal.addEventListener('click', (e) => {
        if (e.target === messageModal) {
            hideMessage();
        }
    });

    initializeGame();
});