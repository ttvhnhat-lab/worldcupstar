document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const playersCarousel = document.getElementById('players-carousel');
    const teamsGrid = document.getElementById('teams-grid');
    const playerModal = document.getElementById('player-modal');
    const modalClose = document.getElementById('modal-close');
    const modalBody = document.getElementById('modal-body');
    const prevBtn = document.getElementById('carousel-prev');
    const nextBtn = document.getElementById('carousel-next');

    let playersData = [];
    let teamsData = [];

    // Fetch Data
    fetch('data.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            playersData = data.top_players;
            teamsData = data.teams;
            renderPlayers(data.top_players);
            renderTeamsByGroup(data.teams);
        })
        .catch(error => {
            console.error('Error loading data:', error);
            playersCarousel.innerHTML = `<p style="color: #ef4444; padding: 2rem; text-align: center; width: 100%;">Lỗi tải dữ liệu. Hãy chạy trang này qua Local Server (như Live Server của VS Code) thay vì mở trực tiếp file HTML.</p>`;
        });

    // Render Players
    function renderPlayers(players) {
        playersCarousel.innerHTML = '';
        players.forEach(player => {
            const card = document.createElement('div');
            card.className = 'player-card';
            card.setAttribute('data-id', player.id);
            
            const imagePath = encodeURI(player.image);

            card.innerHTML = `
                <img src="${imagePath}" alt="${player.name}" class="player-img" onerror="this.src='https://via.placeholder.com/300x440?text=No+Image'">
                <div class="player-info">
                    <h3 class="player-name">${player.name}</h3>
                    <p class="player-country">${player.country}</p>
                </div>
            `;
            
            card.addEventListener('click', () => {
                openPlayerModal(player.id);
            });

            playersCarousel.appendChild(card);
        });
    }

    // Render Teams Grouped by Group (Bảng A - L)
    function renderTeamsByGroup(teams) {
        teamsGrid.innerHTML = '';
        
        // Group teams by their group name
        const groups = {};
        teams.forEach(team => {
            const groupName = team.group || 'Khác';
            if (!groups[groupName]) {
                groups[groupName] = [];
            }
            groups[groupName].push(team);
        });

        // Get sorted group keys (Bảng A, Bảng B, etc.)
        const sortedGroupKeys = Object.keys(groups).sort((a, b) => {
            return a.localeCompare(b, 'vi', { numeric: true });
        });

        // Generate DOM for each group
        sortedGroupKeys.forEach(groupName => {
            const groupSection = document.createElement('div');
            groupSection.className = 'group-container';
            
            const groupTitle = document.createElement('h3');
            groupTitle.className = 'group-title';
            groupTitle.innerText = groupName;
            groupSection.appendChild(groupTitle);

            const groupTeamsGrid = document.createElement('div');
            groupTeamsGrid.className = 'group-teams-grid';

            groups[groupName].forEach(team => {
                const card = document.createElement('div');
                card.className = 'team-card';
                card.setAttribute('data-name', team.name);
                
                card.innerHTML = `
                    <img src="https://flagcdn.com/w80/${team.code}.png" alt="${team.name} Flag" class="team-flag">
                    <h4 class="team-name">${team.name}</h4>
                `;

                card.addEventListener('click', () => {
                    openTeamModal(team.name);
                });

                groupTeamsGrid.appendChild(card);
            });

            groupSection.appendChild(groupTeamsGrid);
            teamsGrid.appendChild(groupSection);
        });
    }

    // Carousel Navigation
    if (prevBtn && nextBtn && playersCarousel) {
        prevBtn.addEventListener('click', () => {
            playersCarousel.scrollBy({
                left: -342,
                behavior: 'smooth'
            });
        });

        nextBtn.addEventListener('click', () => {
            playersCarousel.scrollBy({
                left: 342,
                behavior: 'smooth'
            });
        });
    }

    // Open Modal Details for Player
    function openPlayerModal(id) {
        const player = playersData.find(p => p.id === id);
        if (!player) return;

        const imagePath = encodeURI(player.image);
        const captainStatus = player.is_captain ? ' <span class="captain-badge">ĐỘI TRƯỞNG</span>' : '';

        // Generate Fun Facts HTML
        let funFactsHtml = '';
        if (player.fun_facts && player.fun_facts.length > 0) {
            funFactsHtml = `
                <h4 class="modal-section-title">Thông tin thú vị</h4>
                <ul class="fun-facts-list">
                    ${player.fun_facts.map(fact => `<li>${fact}</li>`).join('')}
                </ul>
            `;
        }

        modalBody.innerHTML = `
            <div class="modal-grid">
                <div class="modal-left">
                    <img src="${imagePath}" alt="${player.name}" onerror="this.src='https://via.placeholder.com/300x440?text=No+Image'">
                    <div class="modal-left-overlay"></div>
                </div>
                <div class="modal-right">
                    <h3 class="modal-player-name">${player.name}${captainStatus}</h3>
                    <p class="modal-player-meta">${player.country}</p>
                    
                    <h4 class="modal-section-title">Hồ sơ cá nhân</h4>
                    <table class="info-table">
                        <tr>
                            <td class="label">Họ và tên</td>
                            <td class="val">${player.full_name || player.name}</td>
                        </tr>
                        ${player.nickname ? `<tr><td class="label">Biệt danh</td><td class="val">${player.nickname}</td></tr>` : ''}
                        <tr>
                            <td class="label">Ngày sinh</td>
                            <td class="val">${player.dob} (Tuổi: ${player.age})</td>
                        </tr>
                        <tr>
                            <td class="label">Chiều cao</td>
                            <td class="val">${player.height}</td>
                        </tr>
                        <tr>
                            <td class="label">Vị trí</td>
                            <td class="val">${player.position}</td>
                        </tr>
                        <tr>
                            <td class="label">Câu lạc bộ</td>
                            <td class="val">${player.club}</td>
                        </tr>
                        <tr>
                            <td class="label">ĐTQG</td>
                            <td class="val">${player.caps} (${player.goals})</td>
                        </tr>
                    </table>

                    <h4 class="modal-section-title">Thành tích nổi bật</h4>
                    <p class="modal-text-block">${player.achievements}</p>

                    <h4 class="modal-section-title">Điểm mạnh chuyên môn</h4>
                    <p class="modal-text-block">${player.strengths}</p>

                    ${funFactsHtml}
                </div>
            </div>
        `;

        playerModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    // Open Modal Details for Team (Squad List)
    function openTeamModal(name) {
        const team = teamsData.find(t => t.name === name);
        if (!team) return;

        // Render positions helper function
        const renderPositionList = (title, list) => {
            if (!list || list.length === 0) return '';
            return `
                <div class="squad-position-block">
                    <h5 class="squad-position-title">${title}</h5>
                    <ul class="squad-list">
                        ${list.map(p => `<li>${p}</li>`).join('')}
                    </ul>
                </div>
            `;
        };

        const goalkeepersHtml = renderPositionList('Thủ môn', team.squad.goalkeepers);
        const defendersHtml = renderPositionList('Hậu vệ', team.squad.defenders);
        const midfieldersHtml = renderPositionList('Tiền vệ', team.squad.midfielders);
        const forwardsHtml = renderPositionList('Tiền đạo', team.squad.forwards);

        modalBody.innerHTML = `
            <div class="team-modal-container">
                <div class="team-modal-header">
                    <img src="https://flagcdn.com/w160/${team.code}.png" alt="${team.name} Flag" class="team-modal-flag">
                    <div class="team-modal-title-box">
                        <h3 class="team-modal-name">${team.name}</h3>
                        <span class="team-modal-group-badge">${team.group}</span>
                    </div>
                </div>
                
                <h4 class="modal-section-title">Danh sách chính thức</h4>
                
                <div class="team-squad-layout">
                    ${goalkeepersHtml}
                    ${defendersHtml}
                    ${midfieldersHtml}
                    ${forwardsHtml}
                </div>
            </div>
        `;

        playerModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    // Close Modal
    function closeModal() {
        playerModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    modalClose.addEventListener('click', closeModal);
    
    playerModal.addEventListener('click', (e) => {
        if (e.target === playerModal) {
            closeModal();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
});
