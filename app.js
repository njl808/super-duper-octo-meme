// Cardiff Airport TV VEO3 Generator - Fully Fixed Application
class VEO3Generator {
    constructor() {
        this.state = {
            selectedCharacters: [],
            selectedScene: null,
            dialogueSequence: [],
            cameraSequence: [],
            currentTab: 'dashboard',
            viewingCharacter: null,
            characterFilter: '',
            categoryFilter: '',
            // New state for dialogue options and modified data
            characterDialogueOptions: {}, // Stores loaded dialogue options per character
            modifiedCharacters: {}, // Stores character data modified by user
            modifiedScenes: {}, // Stores scene data modified by user
            // New configurable prompt elements
            promptDuration: 'Exactly 8 seconds',
            promptStyle: 'Professional broadcast documentary style',
            promptOutputFormat: 'High-quality video with synchronized Welsh-accented audio'
        };

        // Initialize characters and scenes as null; they will be loaded asynchronously
        this.characters = null;
        this.scenes = null;

        this.init();
    }

    async init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', async () => {
                await this.loadData(); // Load data before setting up application
                this.setupApplication();
            });
        } else {
            await this.loadData(); // Load data before setting up application
            this.setupApplication();
        }
    }

    async loadData() {
        console.log('Loading character and scene data from JSON files...');
        try {
            const [charactersResponse, scenesResponse] = await Promise.all([
                fetch('characters.json'),
                fetch('scenes.json')
            ]);

            if (!charactersResponse.ok) {
                throw new Error(`HTTP error! status: ${charactersResponse.status} for characters.json`);
            }
            if (!scenesResponse.ok) {
                throw new Error(`HTTP error! status: ${scenesResponse.status} for scenes.json`);
            }

            this.characters = await charactersResponse.json();
            this.scenes = await scenesResponse.json();

            console.log('Character data loaded:', Object.keys(this.characters).length, 'characters');
            console.log('Scene data loaded:', Object.keys(this.scenes).length, 'scenes');

        } catch (error) {
            console.error('Failed to load application data:', error);
            this.showMessage('Error', 'Failed to load character or scene data. Please ensure "characters.json" and "scenes.json" are available.', 'error');
            // Optionally, disable parts of the UI or show a persistent error message
        }
    }

    setupApplication() {
        console.log('Setting up Cardiff Airport TV VEO3 Generator...');

        // Initialize all components
        this.setupEventListeners();
        this.populateCharacterGallery();
        this.populateSceneGrid();
        this.addInitialCameraShot();
        this.updateDashboardStats();
        this.updateWorkflowStatus();
        this.populateCategoryFilter(); // <--- NEW: Call this here

        // Dynamically update character count in header and tab badge
        const totalCharactersCount = this.characters ? Object.keys(this.characters).length : 0;
        const characterCountSpan = document.querySelector('.character-count');
        if (characterCountSpan) {
            characterCountSpan.textContent = `${totalCharactersCount} Characters Available`;
        }
        const characterTabBadge = document.querySelector('.nav-tab[data-tab="characters"] .tab-badge');
        if (characterTabBadge) {
            characterTabBadge.textContent = totalCharactersCount;
        }

        console.log('Application setup complete - characters and scenes loaded');
    }

    setupEventListeners() {
        console.log('Setting up all event listeners...');

        // Navigation
        this.setupTabNavigation();
        this.setupWorkflowNavigation();

        // Features
        this.setupCharacterManagement();
        this.setupSceneManagement();
        this.setupDialogueManagement();
        this.setupCameraManagement();
        this.setupGenerator();
        this.setupGeneratorControls(); // New: Setup event listeners for generator controls

        // New: Project Load
        const loadProjectInput = document.getElementById('loadProjectInput');
        if (loadProjectInput) {
            loadProjectInput.addEventListener('change', (e) => this.handleProjectLoad(e));
        }
        this.setupButton('loadProjectBtn', () => loadProjectInput.click());

        // New: Modal close buttons
        document.querySelectorAll('.modal .close-button').forEach(button => {
            // Use window.veo3Generator.closeModal directly for global access
            button.onclick = (e) => this.closeModal(e.currentTarget.closest('.modal').id);
        });

        // Setup generic message modal buttons
        this.setupButton('messageModalConfirmBtn', () => this.closeModal('messageModal'));
        this.setupButton('messageModalCancelBtn', () => this.closeModal('messageModal'));


        console.log('All event listeners setup complete');
    }

    setupTabNavigation() {
        const navTabs = document.querySelectorAll('.nav-tab');
        console.log('Setting up nav tabs:', navTabs.length);

        navTabs.forEach(tab => {
            const tabName = tab.getAttribute('data-tab');
            // Remove existing listeners to prevent duplicates
            tab.removeEventListener('click', this._navTabClickHandler); // Remove if previously added
            this._navTabClickHandler = (e) => { // Store handler to remove later
                e.preventDefault();
                e.stopPropagation();
                console.log('Nav tab clicked:', tabName);
                this.switchTab(tabName);
            };
            tab.addEventListener('click', this._navTabClickHandler);
        });
    }

    setupWorkflowNavigation() {
        const workflowCards = document.querySelectorAll('.workflow-card');
        console.log('Setting up workflow cards:', workflowCards.length);

        workflowCards.forEach(card => {
            const step = card.getAttribute('data-step');
            card.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Workflow card clicked:', step);
                this.switchTab(step);
            });
        });
    }

    setupCharacterManagement() {
        // Filters
        const categoryFilter = document.getElementById('categoryFilter');
        const characterSearch = document.getElementById('characterSearch');

        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.state.categoryFilter = e.target.value;
                this.filterCharacters();
            });
        }

        if (characterSearch) {
            characterSearch.addEventListener('input', (e) => {
                this.state.characterFilter = e.target.value.toLowerCase();
                this.filterCharacters();
            });
        }

        // Buttons
        this.setupButton('selectAllBtn', () => this.selectAllCharacters());
        this.setupButton('clearSelectionBtn', () => this.clearCharacterSelection());
    }

    setupSceneManagement() {
        this.setupButton('compatibilityCheck', () => this.checkCharacterSceneCompatibility());
    }

    setupDialogueManagement() {
        this.setupButton('multiCharacterBtn', () => this.startMultiCharacterDialogue());
        this.setupButton('addDialogueBtn', () => this.addDialogueLine());
    }

    setupCameraManagement() {
        this.setupButton('addShot', () => this.addCameraShot());

        // Template buttons setup - no setTimeout needed if DOM is ready
        const templateButtons = document.querySelectorAll('.template-card button');
        templateButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const templateCard = e.currentTarget.closest('.template-card');
                const template = templateCard.getAttribute('data-template');
                this.loadCameraTemplate(template);
            });
        });
    }

    setupGenerator() {
        this.setupButton('generatePrompt', () => this.generateVEO3Prompt());
        this.setupButton('copyPrompt', () => this.copyPromptToClipboard());
        this.setupButton('downloadPrompt', () => this.downloadPrompt());
        this.setupButton('exportBtn', () => this.exportProject());
    }

    // New method to set up controls for generator prompt elements
    setupGeneratorControls() {
        const promptDurationInput = document.getElementById('promptDuration');
        const promptStyleInput = document.getElementById('promptStyle');
        const promptOutputFormatInput = document.getElementById('promptOutputFormat');

        if (promptDurationInput) {
            promptDurationInput.value = this.state.promptDuration;
            promptDurationInput.addEventListener('input', (e) => {
                this.state.promptDuration = e.target.value;
                this.updateGeneratorSummary();
            });
        }
        if (promptStyleInput) {
            promptStyleInput.value = this.state.promptStyle;
            promptStyleInput.addEventListener('input', (e) => {
                this.state.promptStyle = e.target.value;
                this.updateGeneratorSummary();
            });
        }
        if (promptOutputFormatInput) {
            promptOutputFormatInput.value = this.state.promptOutputFormat;
            promptOutputFormatInput.addEventListener('input', (e) => {
                this.state.promptOutputFormat = e.target.value;
                this.updateGeneratorSummary();
            });
        }
    }

    setupButton(id, handler) {
        const button = document.getElementById(id);
        if (button) {
            // Ensure only one event listener is attached
            const existingHandler = button._eventHandler; // Store handler reference
            if (existingHandler) {
                button.removeEventListener('click', existingHandler);
            }
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log(`Button clicked: ${id}`);
                handler();
            });
            button._eventHandler = handler; // Store new handler reference
            console.log(`Button setup: ${id} ✓`);
        } else {
            console.warn(`Button not found: ${id}`);
        }
    }

    switchTab(tabName) {
        console.log('=== SWITCHING TO TAB:', tabName, '===');

        // Update nav tabs
        const navTabs = document.querySelectorAll('.nav-tab');
        navTabs.forEach(tab => {
            tab.classList.remove('active');
        });

        const activeNavTab = document.querySelector(`[data-tab="${tabName}"]`);
        if (activeNavTab) {
            activeNavTab.classList.add('active');
            console.log('✓ Nav tab activated:', tabName);
        }

        // Update tab content
        const tabContents = document.querySelectorAll('.tab-content');
        console.log('Found tab contents:', tabContents.length);

        tabContents.forEach(content => {
            content.classList.remove('active');
            content.style.display = 'none';
            console.log('Hidden tab:', content.id);
        });

        const activeContent = document.getElementById(tabName);
        if (activeContent) {
            activeContent.classList.add('active');
            activeContent.style.display = 'block';
            console.log('✓ Tab content activated:', tabName);
        } else {
            console.error('✗ Tab content not found:', tabName);
        }

        this.state.currentTab = tabName;

        // Initialize tab-specific functionality
        this.initializeTab(tabName);

        console.log('=== TAB SWITCH COMPLETE ===');
    }

    initializeTab(tabName) {
        console.log('Initializing tab:', tabName);

        // Hide edit buttons when switching tabs
        document.getElementById('editCharacterBtn')?.classList.add('hidden');
        document.getElementById('editSceneBtn')?.classList.add('hidden');

        switch(tabName) {
            case 'characters':
                this.setupCharacterDetailTabs();
                this.updateCharacterSelectionUI();
                if (this.state.viewingCharacter) {
                    this.updateCharacterDetailsPanel(this.state.viewingCharacter);
                    document.getElementById('editCharacterBtn')?.classList.remove('hidden');
                }
                this.populateCategoryFilter(); // <--- NEW: Ensure filter is updated when characters tab is active
                break;

            case 'dialogue':
                this.populateCharacterVoices();
                this.populateSpeakerSelect();
                this.updateDialogueSequence();
                // Clear dialogue options list when entering tab
                document.getElementById('dialogueOptionsList').innerHTML = '<p class="text-secondary">Select a speaker to see pre-defined dialogue options.</p>';
                break;

            case 'generator':
                this.updateGeneratorSummary();
                this.setupGeneratorControls(); // Ensure controls are initialized/updated when generator tab is opened
                break;
            case 'scenes':
                if (this.state.selectedScene) {
                    document.getElementById('editSceneBtn')?.classList.remove('hidden');
                }
                break;
        }
    }

    // Helper to get current character data (original or modified)
    getCharacterData(name) {
        // Ensure characters data is loaded before accessing
        if (!this.characters) {
            console.error('Characters data not loaded yet!');
            return null;
        }
        return this.state.modifiedCharacters[name] || this.characters[name];
    }

    // Helper to get current scene data (original or modified)
    getSceneData(name) {
        // Ensure scenes data is loaded before accessing
        if (!this.scenes) {
            console.error('Scenes data not loaded yet!');
            return null;
        }
        return this.state.modifiedScenes[name] || this.scenes[name];
    }

    populateCharacterGallery() {
        const gallery = document.getElementById('characterGallery');
        if (!gallery) {
            console.error('Character gallery not found!');
            return;
        }
        if (!this.characters) {
            console.warn('Characters data not available for gallery population.');
            gallery.innerHTML = '<p class="text-secondary">Loading characters...</p>';
            return;
        }

        const characterEntries = Object.keys(this.characters); // Iterate over original keys
        console.log('Populating gallery with', characterEntries.length, 'characters');

        gallery.innerHTML = characterEntries.map(name => {
            const character = this.getCharacterData(name); // Get current (modified or original) data
            return `
                <div class="character-card" data-character="${name}" data-category="${character.category}">
                    <div class="character-image">
                        <img src="${character.profile_image_url}" alt="${name}" onerror="this.onerror=null;this.src='https://placehold.co/100x100/cccccc/ffffff?text=${name.charAt(0)}'">
                    </div>
                    <div class="character-info">
                        <h3>${name}</h3>
                        <p class="character-brief">${this.getCharacterBrief(character)}</p>
                        <span class="character-category">${character.category}</span>
                    </div>
                </div>
            `;
        }).join('');

        // Setup character card interactions
        this.setupCharacterCards();

        console.log('✓ Character gallery populated');
    }

    setupCharacterCards() {
        const characterCards = document.querySelectorAll('.character-card');
        console.log('Setting up', characterCards.length, 'character cards');

        characterCards.forEach(card => {
            const characterName = card.getAttribute('data-character');

            // Remove existing listeners to prevent duplicates
            card.removeEventListener('click', card._clickHandler);
            card.removeEventListener('dblclick', card._dblclickHandler);

            // Single click - view details
            card._clickHandler = (e) => {
                e.preventDefault();
                console.log('Character clicked for details:', characterName);
                this.viewCharacterDetails(characterName);
            };
            card.addEventListener('click', card._clickHandler);

            // Double click - toggle selection
            card._dblclickHandler = (e) => {
                e.preventDefault();
                console.log('Character double-clicked for selection:', characterName);
                this.toggleCharacterSelection(characterName);
            };
            card.addEventListener('dblclick', card._dblclickHandler);
        });

        console.log('✓ Character cards setup complete');
    }

    getCharacterBrief(character) {
        const description = character.description;
        if (description.length > 80) {
            return description.substring(0, 80) + '...';
        }
        return description;
    }

    viewCharacterDetails(characterName) {
        console.log('Viewing character details:', characterName);
        this.state.viewingCharacter = characterName;
        this.updateCharacterDetailsPanel(characterName);
        this.updateCharacterViewingUI();

        // Show the edit button for the character
        const editCharacterBtn = document.getElementById('editCharacterBtn');
        if (editCharacterBtn) {
            editCharacterBtn.classList.remove('hidden');
            editCharacterBtn.onclick = () => this.openCharacterEditModal(characterName);
        }
    }

    toggleCharacterSelection(characterName) {
        console.log('Toggling character selection:', characterName);

        const index = this.state.selectedCharacters.indexOf(characterName);

        if (index > -1) {
            this.state.selectedCharacters.splice(index, 1);
            console.log('✓ Character deselected:', characterName);
        } else {
            this.state.selectedCharacters.push(characterName);
            console.log('✓ Character selected:', characterName);
        }

        console.log('Selected characters:', this.state.selectedCharacters);

        // Update all UIs
        this.updateCharacterSelectionUI();
        this.updateDashboardStats();
        this.updateWorkflowStatus();
        this.updateGeneratorSummary();
        this.populateCharacterVoices();
        this.populateSpeakerSelect();
    }

    updateCharacterSelectionUI() {
        console.log('Updating character selection UI');

        // Update character cards
        const characterCards = document.querySelectorAll('.character-card');
        characterCards.forEach(card => {
            const characterName = card.getAttribute('data-character');
            if (this.state.selectedCharacters.includes(characterName)) {
                card.classList.add('selected');
            } else {
                card.classList.remove('selected');
            }
        });

        // Update selected summary
        this.updateSelectedCharactersSummary();

        console.log('✓ Character selection UI updated');
    }

    updateCharacterViewingUI() {
        const characterCards = document.querySelectorAll('.character-card');
        characterCards.forEach(card => {
            const characterName = card.getAttribute('data-character');
            if (characterName === this.state.viewingCharacter) {
                card.classList.add('viewing');
            } else {
                card.classList.remove('viewing');
            }
        });
    }

    updateSelectedCharactersSummary() {
        const countElement = document.getElementById('selectionCount');
        const summaryElement = document.getElementById('selectedCharacters');

        console.log('Updating selected characters summary:', this.state.selectedCharacters.length);

        if (countElement) {
            countElement.textContent = `(${this.state.selectedCharacters.length})`;
        }

        if (summaryElement) {
            if (this.state.selectedCharacters.length === 0) {
                summaryElement.innerHTML = '<p class="text-secondary">No characters selected</p>';
            } else {
                summaryElement.innerHTML = this.state.selectedCharacters.map(name => `
                    <div class="selected-character-tag">
                        ${name}
                        <button class="remove-character" data-character="${name}">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `).join('');

                // Add remove listeners
                const removeButtons = summaryElement.querySelectorAll('.remove-character');
                removeButtons.forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.preventDefault();
                        const characterName = e.currentTarget.getAttribute('data-character');
                        this.toggleCharacterSelection(characterName);
                    });
                });
            }
        }
    }

    updateCharacterDetailsPanel(characterName) {
        const character = this.getCharacterData(characterName); // Use getCharacterData
        if (!character) return;

        const panels = {
            'description-panel': `<p>${character.description}</p>`,
            'voice-panel': `<p><strong>Voice Profile:</strong></p><p>${character.voice}</p>`,
            'scenes-panel': this.getCharacterScenesHTML(character),
            'dialogue-panel': this.getCharacterDialogueHTML(character)
        };

        Object.entries(panels).forEach(([panelId, html]) => {
            const panel = document.getElementById(panelId);
            if (panel) {
                panel.innerHTML = html;
            }
        });

        // Ensure first tab is active
        this.switchCharacterDetail('description');
    }

    setupCharacterDetailTabs() {
        const characterTabs = document.querySelectorAll('.character-tab');

        // Instead, ensure event listeners are only added once or removed before re-adding.
        characterTabs.forEach(tab => {
            // Remove previous handler if it exists
            tab.removeEventListener('click', tab._detailClickHandler);

            // Add new handler and store reference
            tab._detailClickHandler = (e) => {
                e.preventDefault();
                const detail = tab.getAttribute('data-detail');
                this.switchCharacterDetail(detail);
            };
            tab.addEventListener('click', tab._detailClickHandler);
        });
    }

    switchCharacterDetail(detail) {
        const characterTabs = document.querySelectorAll('.character-tab');
        characterTabs.forEach(tab => tab.classList.remove('active'));

        const activeTab = document.querySelector(`[data-detail="${detail}"]`);
        if (activeTab) {
            activeTab.classList.add('active');
        }

        const detailPanels = document.querySelectorAll('.detail-panel');
        detailPanels.forEach(panel => panel.classList.remove('active'));

        const activePanel = document.getElementById(`${detail}-panel`);
        if (activePanel) {
            activePanel.classList.add('active');
        }
    }

    getCharacterScenesHTML(character) {
        // Use the character object passed, which is already the current (modified or original) data
        if (!character.scenes || character.scenes.length === 0) {
            return '<p class="text-secondary">No specific scenes assigned</p>';
        }

        return `
            <h5>Associated Scenes</h5>
            <div class="scene-list">
                ${character.scenes.map(scene => `
                    <div class="scene-tag">${scene}</div>
                `).join('')}
            </div>
        `;
    }

    getCharacterDialogueHTML(character) {
        // Use the character object passed, which is already the current (modified or original) data
        if (!character.dialogue || character.dialogue.length === 0) {
            return '<p class="text-secondary">No sample dialogue available</p>';
        }

        return `
            <h5>Sample Dialogue</h5>
            ${character.dialogue.map(line => `
                <div class="dialogue-sample">"${line}"</div>
            `).join('')}
        `;
    }

    filterCharacters() {
        const characterCards = document.querySelectorAll('.character-card');

        characterCards.forEach(card => {
            const characterName = card.getAttribute('data-character');
            const character = this.getCharacterData(characterName); // Get current data for filtering
            const category = character.category;

            const matchesSearch = !this.state.characterFilter ||
                characterName.toLowerCase().includes(this.state.characterFilter);
            const matchesCategory = !this.state.categoryFilter ||
                category === this.state.categoryFilter;

            if (matchesSearch && matchesCategory) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
    }

    selectAllCharacters() {
        const visibleCards = document.querySelectorAll('.character-card[style*="flex"], .character-card:not([style])');
        const characterNames = Array.from(visibleCards).map(card =>
            card.getAttribute('data-character')
        );

        this.state.selectedCharacters = [...new Set([...this.state.selectedCharacters, ...characterNames])];
        this.updateCharacterSelectionUI();
        this.updateDashboardStats();
        this.updateWorkflowStatus();
        this.populateCharacterVoices();
        this.populateSpeakerSelect();
    }

    clearCharacterSelection() {
        this.state.selectedCharacters = [];
        this.updateCharacterSelectionUI();
        this.updateDashboardStats();
        this.updateWorkflowStatus();
        this.populateCharacterVoices();
        this.populateSpeakerSelect();
    }

    populateSceneGrid() {
        const sceneGrid = document.getElementById('sceneGrid');
        if (!sceneGrid) return;
        if (!this.scenes) {
            console.warn('Scenes data not available for grid population.');
            sceneGrid.innerHTML = '<p class="text-secondary">Loading scenes...</p>';
            return;
        }

        const sceneEntries = Object.keys(this.scenes); // Iterate over original keys

        sceneGrid.innerHTML = sceneEntries.map(name => {
            const scene = this.getSceneData(name); // Get current (modified or original) data
            return `
                <div class="scene-card" data-scene="${name}">
                    <div class="scene-preview">
                        <i class="fas fa-${scene.icon}"></i>
                    </div>
                    <div class="scene-info">
                        <h3>${name}</h3>
                        <p>${scene.subtitle}</p>
                        ${scene.atmosphere ? `<div class="scene-atmosphere">${scene.atmosphere}</div>` : ''}
                    </div>
                </div>
            `;
        }).join('');

        // Setup scene card interactions
        const sceneCards = document.querySelectorAll('.scene-card');
        sceneCards.forEach(card => {
            const sceneName = card.getAttribute('data-scene');
            // Remove previous handler if it exists
            card.removeEventListener('click', card._sceneClickHandler);
            // Add new handler and store reference
            card._sceneClickHandler = (e) => {
                e.preventDefault();
                this.selectScene(sceneName);
            };
            card.addEventListener('click', card._sceneClickHandler);
        });
    }

    selectScene(sceneName) {
        console.log('Selecting scene:', sceneName);
        this.state.selectedScene = sceneName;

        // Update UI
        const sceneCards = document.querySelectorAll('.scene-card');
        sceneCards.forEach(card => {
            if (card.getAttribute('data-scene') === sceneName) {
                card.classList.add('selected');
            } else {
                card.classList.remove('selected');
            }
        });

        this.updateSceneDetails(sceneName);
        this.updateWorkflowStatus();
        this.updateGeneratorSummary();

        // Show the edit button for the scene
        const editSceneBtn = document.getElementById('editSceneBtn');
        if (editSceneBtn) {
            editSceneBtn.classList.remove('hidden');
            editSceneBtn.onclick = () => this.openSceneEditModal(sceneName);
        }
    }

    updateSceneDetails(sceneName) {
        const scene = this.getSceneData(sceneName); // Use getSceneData
        if (!scene) return;

        const descriptionContent = document.querySelector('.scene-description-content');
        if (descriptionContent) {
            descriptionContent.innerHTML = `<p>${scene.description}</p>`;
        }

        this.checkCharacterSceneCompatibility();
    }

    checkCharacterSceneCompatibility() {
        const compatibilityList = document.querySelector('.compatibility-list');
        if (!compatibilityList || !this.state.selectedScene || this.state.selectedCharacters.length === 0) {
            if (compatibilityList) {
                compatibilityList.innerHTML = '<p class="text-secondary">Select characters and a scene to check compatibility</p>';
            }
            return;
        }

        const selectedSceneName = this.state.selectedScene;
        let compatibilityHtml = '';

        this.state.selectedCharacters.forEach(charName => {
            const character = this.getCharacterData(charName);
            const isCompatible = character.scenes && character.scenes.includes(selectedSceneName);
            const iconClass = isCompatible ? 'fas fa-check-circle' : 'fas fa-times-circle';
            const iconColor = isCompatible ? 'var(--color-success)' : 'var(--color-error)';
            const statusText = isCompatible ? 'Compatible' : 'Not Compatible';
            const statusBg = isCompatible ? 'var(--color-bg-3)' : 'var(--color-bg-4)';
            const statusColor = isCompatible ? 'var(--color-success)' : 'var(--color-error)';

            compatibilityHtml += `
                <div class="compatibility-item" style="background: ${statusBg}; color: ${statusColor};">
                    <i class="${iconClass}" style="color: ${iconColor};"></i>
                    <span>${charName} - ${statusText} with ${selectedSceneName}</span>
                </div>
            `;
        });
        compatibilityList.innerHTML = compatibilityHtml;
    }

    populateCharacterVoices() {
        const voiceList = document.getElementById('characterVoiceList');
        if (!voiceList) return;

        if (this.state.selectedCharacters.length === 0) {
            voiceList.innerHTML = '<p class="text-secondary">Select characters to see their voice profiles</p>';
            return;
        }

        voiceList.innerHTML = this.state.selectedCharacters.map(name => {
            const character = this.getCharacterData(name); // Use getCharacterData
            return `
                <div class="voice-item">
                    <h5>${name}</h5>
                    <div class="voice-description">${character.voice}</div>
                </div>
            `;
        }).join('');
    }

    populateSpeakerSelect() {
        const speakerSelect = document.getElementById('speakerSelect');
        if (!speakerSelect) return;

        speakerSelect.innerHTML = '<option value="">Select speaker</option>';

        if (this.state.selectedCharacters.length > 0) {
            speakerSelect.innerHTML += this.state.selectedCharacters.map(name =>
                `<option value="${name}">${name}</option>`
            ).join('');
        }

        // Add event listener to load dialogue options when speaker is selected
        // Remove previous handler if it exists
        speakerSelect.removeEventListener('change', speakerSelect._changeHandler);
        speakerSelect._changeHandler = (e) => {
            const selectedChar = e.target.value;
            if (selectedChar) {
                this.loadCharacterDialogueOptions(selectedChar);
            } else {
                document.getElementById('dialogueOptionsList').innerHTML = '<p class="text-secondary">Select a speaker to see pre-defined dialogue options.</p>';
            }
        };
        speakerSelect.addEventListener('change', speakerSelect._changeHandler);
    }

    async loadCharacterDialogueOptions(characterName) {
        const character = this.getCharacterData(characterName);
        if (!character) return;

        // If dialogue options for this character are already loaded, use them
        if (this.state.characterDialogueOptions[characterName] && this.state.characterDialogueOptions[characterName].length > 0) {
            this.updateDialogueOptionsUI(characterName);
            return;
        }

        // --- START: Simulated/Actual Dialogue File Loading ---
        // IMPORTANT: For actual .txt file loading, you need a local web server
        // and the 'dialogues' folder with .txt files (e.g., dialogues/nanwen.txt)
        // If you don't have a server, this will fall back to using the character's
        // 'dialogue' array defined in app.js.

        const dialogueFileName = characterName.toLowerCase().replace(/\s/g, ''); // e.g., "nanwen"
        const dialogueFilePath = `dialogues/${dialogueFileName}.txt`;

        try {
            const response = await fetch(dialogueFilePath);
            if (response.ok) {
                const text = await response.text();
                const lines = text.split('\n')
                                  .map(line => line.trim())
                                  .filter(line => line.length > 0);
                this.state.characterDialogueOptions[characterName] = lines;
                console.log(`Loaded dialogue from ${dialogueFilePath}`);
            } else {
                // Fallback to character's internal dialogue array if file not found/accessible
                console.warn(`Dialogue file not found or accessible for ${characterName} at ${dialogueFilePath}. Using internal dialogue array.`);
                this.state.characterDialogueOptions[characterName] = [...(character.dialogue || [])]; // Use a copy
            }
        } catch (error) {
            // Fallback if fetch fails (e.g., CORS error for local files without a server)
            console.error(`Error fetching dialogue file for ${characterName}:`, error);
            this.state.characterDialogueOptions[characterName] = [...(character.dialogue || [])]; // Use a copy
        }
        // --- END: Simulated/Actual Dialogue File Loading ---

        this.updateDialogueOptionsUI(characterName);
    }

    updateDialogueOptionsUI(characterName) {
        const dialogueOptionsList = document.getElementById('dialogueOptionsList');
        if (!dialogueOptionsList) return;

        const options = this.state.characterDialogueOptions[characterName] || [];

        if (options.length === 0) {
            dialogueOptionsList.innerHTML = `<p class="text-secondary">No pre-defined dialogue options for ${characterName}.</p>`;
            return;
        }

        dialogueOptionsList.innerHTML = options.map((line, index) => `
            <div class="dialogue-option-item">
                <span>"${line}"</span>
                <button class="btn btn--outline btn--sm add-option-to-sequence" data-character="${characterName}" data-line="${line}" data-index="${index}">
                    <i class="fas fa-plus"></i> Add
                </button>
            </div>
        `).join('');

        // Add event listeners for "Add" buttons
        dialogueOptionsList.querySelectorAll('.add-option-to-sequence').forEach(button => {
            button.onclick = (e) => {
                const char = e.currentTarget.dataset.character;
                const line = e.currentTarget.dataset.line;
                const index = parseInt(e.currentTarget.dataset.index);

                this.state.dialogueSequence.push({ speaker: char, text: line });
                this.updateDialogueSequence();
                this.updateWorkflowStatus();
                this.updateGeneratorSummary();

                // "Delete what is used" - remove from options list
                this.state.characterDialogueOptions[char].splice(index, 1);
                this.updateDialogueOptionsUI(char); // Re-render the options list
            };
        });
    }

    startMultiCharacterDialogue() {
        if (this.state.selectedCharacters.length < 2) {
            this.showMessage('Error', 'Please select at least 2 characters for a multi-character scene.', 'error');
            return;
        }

        this.populateCharacterVoices();
        this.populateSpeakerSelect();

        this.state.dialogueSequence = [
            {
                speaker: this.state.selectedCharacters[0],
                text: 'Welcome to Cardiff Airport!'
            },
            {
                speaker: this.state.selectedCharacters[1],
                text: 'Thank you, lovely to be here!'
            }
        ];

        this.updateDialogueSequence();
    }

    async addDialogueLine() {
        const speakerSelect = document.getElementById('speakerSelect');
        const speaker = speakerSelect ? speakerSelect.value : '';

        if (!speaker) {
            this.showMessage('Error', 'Please select a speaker first.', 'error');
            return;
        }

        const text = await this.showPrompt('Enter Dialogue', `Enter dialogue for ${speaker}:`);
        if (text && text.trim()) {
            this.state.dialogueSequence.push({
                speaker: speaker,
                text: text.trim()
            });

            this.updateDialogueSequence();
            this.updateWorkflowStatus();
            this.updateGeneratorSummary();
        }
    }

    updateDialogueSequence() {
        const sequenceContainer = document.getElementById('dialogueSequence');
        if (!sequenceContainer) return;

        if (this.state.dialogueSequence.length === 0) {
            sequenceContainer.innerHTML = '<p class="text-secondary">Start building your dialogue sequence</p>';
            return;
        }

        sequenceContainer.innerHTML = this.state.dialogueSequence.map((line, index) => `
            <div class="dialogue-line-item">
                <div class="speaker-name">${line.speaker}:</div>
                <div class="dialogue-text">${line.text}</div>
                <div class="dialogue-actions">
                    <button class="btn btn--outline btn--sm" onclick="window.veo3Generator.editDialogueLine(${index})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn--outline btn--sm" onclick="window.veo3Generator.removeDialogueLine(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    async editDialogueLine(index) {
        const line = this.state.dialogueSequence[index];
        if (!line) return;

        const newText = await this.showPrompt('Edit Dialogue', `Edit dialogue for ${line.speaker}:`, line.text);
        if (newText && newText.trim()) {
            this.state.dialogueSequence[index].text = newText.trim();
            this.updateDialogueSequence();
        }
    }

    removeDialogueLine(index) {
        this.state.dialogueSequence.splice(index, 1);
        this.updateDialogueSequence();
        this.updateGeneratorSummary();
    }

    addInitialCameraShot() {
        // No setTimeout needed here if this is called after DOMContentLoaded and shotList exists
        if (this.state.cameraSequence.length === 0) {
            this.addCameraShot();
        }
    }

    addCameraShot() {
        const shotList = document.getElementById('shotList');
        if (!shotList) return;

        const shotItem = document.createElement('div');
        shotItem.className = 'shot-item';
        shotItem.innerHTML = `
            <div class="shot-controls">
                <select class="form-control" name="shotType">
                    <option value="">Select shot type</option>
                    <option value="wide">Wide Shot</option>
                    <option value="medium">Medium Shot</option>
                    <option value="close-up">Close-up</option>
                    <option value="two-shot">Two Shot</option>
                    <option value="group-shot">Group Shot</option>
                </select>
                <select class="form-control" name="cameraMovement">
                    <option value="">Select movement</option>
                    <option value="static">Static</option>
                    <option value="pan">Pan</option>
                    <option value="tilt">Tilt</option>
                    <option value="zoom">Zoom</option>
                </select>
                <input type="text" class="form-control" name="shotDescription" placeholder="Shot description...">
                <button class="btn btn--outline btn--sm remove-shot">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        shotList.appendChild(shotItem);

        // Event listeners are now attached in updateCameraSequence to handle dynamic elements
    }

    loadCameraTemplate(templateName) {
        console.log('Loading camera template:', templateName);

        const templates = {
            ensemble: [
                { type: 'wide', movement: 'static', description: 'Establishing shot' },
                { type: 'medium', movement: 'pan', description: 'Character introductions' },
                { type: 'close-up', movement: 'static', description: 'Key character focus' }
            ],
            dialogue: [
                { type: 'medium', movement: 'static', description: 'Speaker close-up' },
                { type: 'close-up', movement: 'static', description: 'Reaction shot' }
            ],
            interview: [
                { type: 'medium', movement: 'zoom', description: 'Interview setup' },
                { type: 'close-up', movement: 'static', description: 'Subject focus' }
            ]
        };

        const template = templates[templateName];
        if (!template) return;

        // Clear existing shots
        const shotList = document.getElementById('shotList');
        if (shotList) {
            shotList.innerHTML = '';
        }

        this.state.cameraSequence = []; // Clear state sequence

        // Add template shots
        template.forEach(shot => {
            this.addCameraShot(); // This adds the DOM element, but doesn't attach listeners yet
            const shotItems = document.querySelectorAll('.shot-item');
            const lastShot = shotItems[shotItems.length - 1];

            if (lastShot) {
                const typeSelect = lastShot.querySelector('[name="shotType"]');
                const movementSelect = lastShot.querySelector('[name="cameraMovement"]');
                const descriptionInput = lastShot.querySelector('[name="shotDescription"]'); // FIXED TYPO HERE

                if (typeSelect) typeSelect.value = shot.type;
                if (movementSelect) movementSelect.value = shot.movement;
                if (descriptionInput) descriptionInput.value = shot.description;
            }
        });

        // Call updateCameraSequence once after all shots are added to populate state and attach listeners
        this.updateCameraSequence();
    }

    updateCameraSequence() {
        const shotList = document.getElementById('shotList');
        if (!shotList) return;

        const shotItems = shotList.querySelectorAll('.shot-item');
        this.state.cameraSequence = [];

        shotItems.forEach((item, index) => {
            const typeSelect = item.querySelector('[name="shotType"]');
            const movementSelect = item.querySelector('[name="cameraMovement"]'); // Fixed typo here
            const descriptionInput = item.querySelector('[name="shotDescription"]');
            const removeBtn = item.querySelector('.remove-shot');

            const type = typeSelect ? typeSelect.value : '';
            const movement = movementSelect ? movementSelect.value : '';
            const description = descriptionInput ? descriptionInput.value : ''; // Ensure to get value

            // Push to state only if valid type and movement are selected
            if (type && movement) {
                this.state.cameraSequence.push({ type, movement, description });
            }

            // Ensure listeners are attached/re-attached for each element
            // This pattern ensures that even newly added elements get their listeners
            const attachListener = (element, eventType, handler) => {
                if (element) {
                    // Remove old listener if it exists to prevent duplicates
                    const oldHandler = element._eventHandlers && element._eventHandlers[eventType];
                    if (oldHandler) {
                        element.removeEventListener(eventType, oldHandler);
                    }
                    element.addEventListener(eventType, handler);
                    // Store the handler reference on the element itself
                    element._eventHandlers = element._eventHandlers || {};
                    element._eventHandlers[eventType] = handler;
                }
            };

            attachListener(typeSelect, 'change', () => this.updateCameraSequence());
            attachListener(movementSelect, 'change', () => this.updateCameraSequence());
            attachListener(descriptionInput, 'input', () => this.updateCameraSequence());
            attachListener(removeBtn, 'click', (e) => {
                e.preventDefault();
                item.remove(); // Remove the DOM element
                this.updateCameraSequence(); // Then update the state and UI
            });
        });

        this.updateWorkflowStatus();
        this.updateGeneratorSummary();
    }

    updateDashboardStats() {
        const updates = [
            ['selectedCharacters', this.state.selectedCharacters.length],
            ['dialogueLines', this.state.dialogueSequence.length],
            ['totalScenes', this.scenes ? Object.keys(this.scenes).length : 0] // Dynamically update total scenes from loaded data
        ];

        updates.forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });
        // Update total characters available in dashboard
        const totalCharactersElement = document.getElementById('totalCharacters');
        if (totalCharactersElement) {
            totalCharactersElement.textContent = this.characters ? Object.keys(this.characters).length : 0;
        }
    }

    updateWorkflowStatus() {
        const statusUpdates = [
            ['character-status', this.state.selectedCharacters.length > 0],
            ['scene-status', this.state.selectedScene],
            ['dialogue-status', this.state.dialogueSequence.length > 0],
            ['camera-status', this.state.cameraSequence.length > 0],
            ['generator-status', this.isPromptGenerated()]
        ];

        statusUpdates.forEach(([id, condition]) => {
            const element = document.getElementById(id);
            if (element) {
                if (condition) {
                    element.innerHTML = '<i class="fas fa-check-circle"></i> Completed';
                    element.className = 'workflow-status completed';
                } else {
                    element.innerHTML = '<i class="fas fa-circle"></i> Not Started';
                    element.className = 'workflow-status';
                }
            }
        });
    }

    updateGeneratorSummary() {
        const updates = [
            ['summaryCharacters', this.getSummaryCharacters()],
            ['summaryScene', this.state.selectedScene || 'None selected'],
            ['summaryDialogue', this.getSummaryDialogue()],
            ['summaryCamera', this.getSummaryCamera()],
            ['summaryDuration', this.state.promptDuration], // New: Summary for duration
            ['summaryStyle', this.state.promptStyle], // New: Summary for style
            ['summaryOutput', this.state.promptOutputFormat] // New: Summary for output format
        ];

        updates.forEach(([id, text]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = text;
                if (text.includes('None') || text.includes('No ') || text === '') { // Also check for empty string
                    element.parentElement.classList.remove('has-content');
                } else {
                    element.parentElement.classList.add('has-content');
                }
            }
        });
    }

    getSummaryCharacters() {
        if (this.state.selectedCharacters.length === 0) return 'None selected';
        if (this.state.selectedCharacters.length === 1) return this.state.selectedCharacters[0];
        if (this.state.selectedCharacters.length <= 3) return this.state.selectedCharacters.join(', ');
        return `${this.state.selectedCharacters.length} characters selected`;
    }

    getSummaryDialogue() {
        if (this.state.dialogueSequence.length === 0) return 'No dialogue composed';
        return `${this.state.dialogueSequence.length} dialogue lines`;
    }

    getSummaryCamera() {
        if (this.state.cameraSequence.length === 0) return 'No shots configured';
        return `${this.state.cameraSequence.length} camera shots`;
    }

    generateVEO3Prompt() {
        console.log('=== GENERATING VEO3 PROMPT ===');
        const { selectedCharacters, selectedScene, dialogueSequence, cameraSequence } = this.state;

        if (selectedCharacters.length === 0 || !selectedScene) {
            this.showMessage('Error', 'Please select at least one character and a scene to generate a prompt.', 'error');
            return;
        }

        const scene = this.getSceneData(selectedScene); // Use getSceneData
        const includeWelsh = document.getElementById('includeWelshAccent')?.checked ?? true;
        const includeBroadcast = document.getElementById('includeBroadcastQuality')?.checked ?? true;
        const includeEnsemble = document.getElementById('includeEnsembleSupport')?.checked ?? true;

        // Changed the prompt title as requested and fixed string literal issue
        let prompt = "Cardiff Airport TV - [@airporttv logo - top right]\n\n";

        // Characters section
        if (selectedCharacters.length === 1) {
            const character = this.getCharacterData(selectedCharacters[0]); // Use getCharacterData
            prompt += `SUBJECT: ${character.description}\n\n`;
        } else {
            prompt += `ENSEMBLE CAST:\n`;
            selectedCharacters.forEach(name => {
                const character = this.getCharacterData(name); // Use getCharacterData
                prompt += `${name}: ${character.description}\n`;
            });
            prompt += `\n`;
        }

        // Scene context
        prompt += `CONTEXT: ${scene.description}\n\n`;

        // Dialogue section
        if (dialogueSequence.length > 0) {
            prompt += `DIALOGUE SEQUENCE:\n`;
            dialogueSequence.forEach(line => {
                prompt += `${line.speaker}: "${line.text}"\n`;
            });
            prompt += `\n`;
        }

        // Camera work
        if (cameraSequence.length > 0) {
            prompt += `CAMERA SEQUENCE:\n`;
            cameraSequence.forEach((shot, index) => {
                prompt += `Shot ${index + 1}: ${shot.type} ${shot.movement}`;
                if (shot.description) prompt += ` - ${shot.description}`;
                prompt += `\n`;
            });
        } else {
            prompt += `CAMERA: Medium shot with natural movement, professional cinematography\n`;
        }

        // Use state variables for configurable prompt elements
        prompt += `\nDURATION: ${this.state.promptDuration}\n`;
        prompt += `STYLE: ${this.state.promptStyle}\n`;
        prompt += `OUTPUT: ${this.state.promptOutputFormat}\n`;

        if (includeWelsh && selectedCharacters.length > 0) {
            // Removed "WELSH VOICE CHARACTERISTICS:" heading as requested
            // This is the line that was modified to output "Charactername voice : voice profile"
            selectedCharacters.forEach(name => {
                const character = this.getCharacterData(name); // Get current character data
                prompt += `${name} voice : ${character.voice}\n`; // Ensures "voice :" is present
            });
        } else if (includeWelsh) {
             console.warn('Include Welsh accent specifications is checked, but no characters are selected.');
        } else {
            console.log('Include Welsh accent specifications is unchecked, skipping voice characteristics.');
        }


        if (includeEnsemble && selectedCharacters.length > 1) {
            prompt += `\nENSEMBLE DIRECTION: Balance all characters naturally, ensure clear audio separation between speakers, maintain Cardiff Airport atmosphere throughout\n`;
        }

        if (includeBroadcast) {
            prompt += `\nBROADCAST QUALITY: Professional TV production standards, suitable for Cardiff Airport TV broadcast, crisp audio, stable footage\n`;
        }

        const promptOutput = document.getElementById('promptOutput');
        if (promptOutput) {
            promptOutput.textContent = prompt;
            console.log('✓ Prompt output updated');
        }

        const promptActions = document.getElementById('promptActions');
        if (promptActions) {
            promptActions.classList.remove('hidden');
            console.log('✓ Prompt actions shown');
        }

        this.updateWorkflowStatus();
        console.log('=== VEO3 PROMPT GENERATION COMPLETE ===');
    }

    copyPromptToClipboard() {
        const promptOutput = document.getElementById('promptOutput');
        if (!promptOutput) return;

        const prompt = promptOutput.textContent;

        if (navigator.clipboard) {
            navigator.clipboard.writeText(prompt).then(() => {
                this.showMessage('Success', 'VEO3 prompt copied to clipboard!', 'success');
            }).catch(() => {
                this.fallbackCopyToClipboard(prompt);
            });
        } else {
            this.fallbackCopyToClipboard(prompt);
        }
    }

    fallbackCopyToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            document.execCommand('copy');
            this.showMessage('Success', 'VEO3 prompt copied to clipboard!', 'success');
        } catch (err) {
            this.showMessage('Error', 'Failed to copy prompt. Please select and copy manually.', 'error');
        }

        document.body.removeChild(textArea);
    }

    downloadPrompt() {
        const promptOutput = document.getElementById('promptOutput');
        if (!promptOutput) return;

        const prompt = promptOutput.textContent;
        const projectData = {
            prompt: prompt,
            selectedCharacters: this.state.selectedCharacters,
            selectedScene: this.state.selectedScene,
            dialogueSequence: this.state.dialogueSequence,
            cameraSequence: this.state.cameraSequence,
            modifiedCharacters: this.state.modifiedCharacters, // Include modified characters
            modifiedScenes: this.state.modifiedScenes, // Include modified scenes
            // Include new configurable prompt elements in export
            promptDuration: this.state.promptDuration,
            promptStyle: this.state.promptStyle,
            promptOutputFormat: this.state.promptOutputFormat,
            generated: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cardiff-airport-veo3-project-${Date.now()}.json`;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showMessage('Success', 'Project file downloaded!', 'info');
    }

    exportProject() {
        this.switchTab('generator');
        // Small delay to ensure tab switch completes before generating/downloading
        setTimeout(() => {
            if (!this.isPromptGenerated()) {
                this.generateVEO3Prompt();
            }
            setTimeout(() => this.downloadPrompt(), 500);
        }, 200);
    }

    isPromptGenerated() {
        const promptOutput = document.getElementById('promptOutput');
        if (!promptOutput) return false;

        const text = promptOutput.textContent.trim();
        // Updated check to match the new prompt title
        return text !== '' && text.includes('Cardiff Airport TV - [@airporttv logo - top right]');
    }

    // --- New: Project Load Functionality ---
    handleProjectLoad(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const projectData = JSON.parse(e.target.result);
                this.loadProject(projectData);
                this.showMessage('Success', 'Project loaded successfully!', 'success');
            } catch (error) {
                console.error('Error loading project:', error);
                this.showMessage('Error', 'Failed to load project. Invalid file format or data.', 'error');
            }
        };
        reader.readAsText(file);
    }

    loadProject(projectData) {
        // Reset current state
        this.state.selectedCharacters = projectData.selectedCharacters || [];
        this.state.selectedScene = projectData.selectedScene || null;
        this.state.dialogueSequence = projectData.dialogueSequence || [];
        this.state.cameraSequence = projectData.cameraSequence || [];
        this.state.modifiedCharacters = projectData.modifiedCharacters || {};
        this.state.modifiedScenes = projectData.modifiedScenes || {};
        // Load new configurable prompt elements
        this.state.promptDuration = projectData.promptDuration || 'Exactly 8 seconds';
        this.state.promptStyle = projectData.promptStyle || 'Professional broadcast documentary style';
        this.state.promptOutputFormat = projectData.promptOutputFormat || 'High-quality video with synchronized Welsh-accented audio';

        // Re-initialize characters and scenes with loaded data, then re-render
        this.characters = projectData.characters || this.characters; // Use loaded characters if present, else keep current
        this.scenes = projectData.scenes || this.scenes; // Use loaded scenes if present, else keep current


        // Re-render all UI components based on loaded state
        this.populateCharacterGallery(); // Re-render characters (will use modified data)
        this.populateSceneGrid(); // Re-render scenes (will use modified data)
        this.updateCharacterSelectionUI();
        if (this.state.selectedScene) {
            this.selectScene(this.state.selectedScene); // Re-select scene to update details and show edit button
        }
        this.updateDialogueSequence();
        this.updateCameraSequence(); // Re-render camera shots
        this.updateDashboardStats();
        this.updateWorkflowStatus();
        this.updateGeneratorSummary();
        this.setupGeneratorControls(); // Re-initialize generator controls with loaded data
        this.populateCategoryFilter(); // <--- NEW: Ensure filter is updated after loading a project

        // Switch to dashboard or generator tab
        this.switchTab('dashboard');
    }

    // --- New: Character and Scene Editing Modals ---
    openCharacterEditModal(characterName) {
        const character = this.getCharacterData(characterName);
        if (!character) return;

        const modal = document.getElementById('characterEditModal');
        const form = document.getElementById('characterEditForm');
        if (!modal || !form) return;

        document.getElementById('editCharacterName').value = characterName;
        document.getElementById('editCharacterDescription').value = character.description;
        document.getElementById('editCharacterVoice').value = character.voice;
        document.getElementById('editCharacterCategory').value = character.category;
        document.getElementById('editCharacterScenes').value = (character.scenes || []).join(', ');
        document.getElementById('editCharacterDialogue').value = (character.dialogue || []).join('\n');

        modal.classList.add('active'); // Show modal

        // Save button handler
        const saveBtn = document.getElementById('saveCharacterEditBtn');
        // Remove previous click handler to prevent multiple saves
        saveBtn.onclick = null;
        saveBtn.onclick = () => {
            const newDescription = document.getElementById('editCharacterDescription').value;
            const newVoice = document.getElementById('editCharacterVoice').value;
            const newCategory = document.getElementById('editCharacterCategory').value;
            const newScenes = document.getElementById('editCharacterScenes').value.split(',').map(s => s.trim()).filter(s => s.length > 0);
            const newDialogue = document.getElementById('editCharacterDialogue').value.split('\n').map(d => d.trim()).filter(d => d.length > 0);

            const updatedCharacter = {
                ...character, // Keep existing properties
                description: newDescription,
                voice: newVoice,
                category: newCategory,
                scenes: newScenes,
                dialogue: newDialogue
            };

            this.state.modifiedCharacters[characterName] = updatedCharacter;
            this.updateCharacterDetailsPanel(characterName); // Update details panel
            this.populateCharacterGallery(); // Re-render gallery to reflect changes
            this.updateSelectedCharactersSummary(); // Update if selected
            this.populateCharacterVoices(); // Update voice list if selected
            this.populateSpeakerSelect(); // Update speaker select if selected
            this.populateCategoryFilter(); // <--- NEW: Update filter options if a new category was added
            this.closeModal('characterEditModal');
        };
    }

    openSceneEditModal(sceneName) {
        const scene = this.getSceneData(sceneName);
        if (!scene) return;

        const modal = document.getElementById('sceneEditModal');
        const form = document.getElementById('sceneEditForm');
        if (!modal || !form) return;

        document.getElementById('editSceneName').value = sceneName;
        document.getElementById('editSceneDescription').value = scene.description;
        document.getElementById('editSceneSubtitle').value = scene.subtitle;
        document.getElementById('editSceneAtmosphere').value = scene.atmosphere;

        modal.classList.add('active'); // Show modal

        // Save button handler
        const saveBtn = document.getElementById('saveSceneEditBtn');
        // Remove previous click handler to prevent multiple saves
        saveBtn.onclick = null;
        saveBtn.onclick = () => {
            const newDescription = document.getElementById('editSceneDescription').value;
            const newSubtitle = document.getElementById('editSceneSubtitle').value;
            const newAtmosphere = document.getElementById('editSceneAtmosphere').value;

            const updatedScene = {
                ...scene, // Keep existing properties
                description: newDescription,
                subtitle: newSubtitle,
                atmosphere: newAtmosphere
            };

            this.state.modifiedScenes[sceneName] = updatedScene;
            this.updateSceneDetails(sceneName); // Update details panel
            this.populateSceneGrid(); // Re-render grid to reflect changes
            this.updateGeneratorSummary(); // Update if selected
            this.closeModal('sceneEditModal');
        };
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            // If it's the message modal, resolve any pending prompt
            if (modalId === 'messageModal' && this._promptResolve) {
                this._promptResolve = null;
                this._promptReject = null;
            }
        }
    }

    /**
     * Shows a generic message modal.
     * @param {string} title - The title of the modal.
     * @param {string} message - The message content.
     * @param {'info'|'success'|'error'|'warning'} [type='info'] - Type of message for styling.
     */
    showMessage(title, message, type = 'info') {
        const modal = document.getElementById('messageModal');
        const modalTitle = document.getElementById('messageModalTitle');
        const modalBody = document.getElementById('messageModalBody');
        const modalInput = document.getElementById('messageModalInput');
        const confirmBtn = document.getElementById('messageModalConfirmBtn');
        const cancelBtn = document.getElementById('messageModalCancelBtn');

        if (!modal || !modalTitle || !modalBody || !modalInput || !confirmBtn || !cancelBtn) {
            console.error('Message modal elements not found.');
            // Fallback to alert if modal elements are missing
            alert(`${title}: ${message}`);
            return;
        }

        modalTitle.textContent = title;
        modalBody.textContent = message;
        modalInput.style.display = 'none'; // Hide input for simple messages
        cancelBtn.style.display = 'none'; // Hide cancel button for simple messages

        // Remove previous listeners for confirm button
        confirmBtn.onclick = null;
        confirmBtn.onclick = () => this.closeModal('messageModal');

        // Apply type-specific styling (optional, based on your CSS)
        // You might need to add classes to modal-content or modal-header for this
        modalTitle.className = ''; // Reset classes
        modalTitle.classList.add(`status--${type}`); // Example: add a class for styling

        modal.classList.add('active');
    }

    /**
     * Shows a modal that prompts for user input.
     * @param {string} title - The title of the prompt modal.
     * @param {string} message - The message/question for the user.
     * @param {string} [defaultValue=''] - The default value for the input field.
     * @returns {Promise<string|null>} A promise that resolves with the input value or null if cancelled.
     */
    showPrompt(title, message, defaultValue = '') {
        return new Promise((resolve, reject) => {
            const modal = document.getElementById('messageModal');
            const modalTitle = document.getElementById('messageModalTitle');
            const modalBody = document.getElementById('messageModalBody');
            const modalInput = document.getElementById('messageModalInput');
            const confirmBtn = document.getElementById('messageModalConfirmBtn');
            const cancelBtn = document.getElementById('messageModalCancelBtn');

            if (!modal || !modalTitle || !modalBody || !modalInput || !confirmBtn || !cancelBtn) {
                console.error('Prompt modal elements not found. Falling back to native prompt.');
                resolve(prompt(`${title}: ${message}`, defaultValue));
                return;
            }

            modalTitle.textContent = title;
            modalBody.textContent = message;
            modalInput.value = defaultValue;
            modalInput.style.display = 'block'; // Show input for prompts
            cancelBtn.style.display = 'inline-flex'; // Show cancel button for prompts

            // Store resolve/reject for later use
            this._promptResolve = resolve;
            this._promptReject = reject;

            // Remove previous listeners
            confirmBtn.onclick = null;
            cancelBtn.onclick = null;

            confirmBtn.onclick = () => {
                const inputValue = modalInput.value;
                this.closeModal('messageModal');
                resolve(inputValue);
            };

            cancelBtn.onclick = () => {
                this.closeModal('messageModal');
                resolve(null); // Resolve with null if cancelled
            };

            // Clear previous type styling and add default
            modalTitle.className = '';
            modalTitle.classList.add(`status--info`); // Default info style for prompts

            modal.classList.add('active');
            modalInput.focus();
        });
    }

    /**
     * Populates the category filter dropdown dynamically based on available character categories.
     */
    populateCategoryFilter() {
        const categoryFilterSelect = document.getElementById('categoryFilter');
        if (!categoryFilterSelect || !this.characters) {
            console.warn('Category filter select or character data not available for population.');
            return;
        }

        // Get all categories from original and modified characters
        const allCategories = new Set();
        Object.values(this.characters).forEach(char => allCategories.add(char.category));
        Object.values(this.state.modifiedCharacters).forEach(char => allCategories.add(char.category));


        // Clear existing options, but keep the "All Categories" option
        categoryFilterSelect.innerHTML = '<option value="">All Categories</option>';

        // Add dynamic categories
        Array.from(allCategories).sort().forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category.charAt(0).toUpperCase() + category.slice(1); // Capitalize first letter
            categoryFilterSelect.appendChild(option);
        });

        // Restore previous selection if it still exists
        if (this.state.categoryFilter && allCategories.has(this.state.categoryFilter)) {
            categoryFilterSelect.value = this.state.categoryFilter;
        } else {
            this.state.categoryFilter = ''; // Reset filter if old category is gone
        }

        console.log('✓ Category filter populated dynamically.');
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    console.log('=== INITIALIZING CARDIFF AIRPORT TV VEO3 GENERATOR ===');
    window.veo3Generator = new VEO3Generator();
});

// Global functions for HTML onclick handlers (for backwards compatibility with existing HTML)
window.editDialogueLine = (index) => window.veo3Generator?.editDialogueLine(index);
window.removeDialogueLine = (index) => window.veo3Generator?.removeDialogueLine(index);
window.closeModal = (modalId) => window.veo3Generator?.closeModal(modalId); // Expose closeModal globally
