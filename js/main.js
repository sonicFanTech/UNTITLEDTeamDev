const header = document.querySelector('[data-header]');
const nav = document.querySelector('[data-nav]');
const menuToggle = document.querySelector('[data-menu-toggle]');
const musicToggle = document.querySelector('[data-music-toggle]');
const audio = document.querySelector('[data-bg-audio]');
const memberList = document.querySelector('[data-member-list]');
const memberCount = document.querySelector('[data-member-count]');
const roleCount = document.querySelector('[data-role-count]');
const gameList = document.querySelector('[data-game-list]');
const gameCountFields = document.querySelectorAll('[data-game-count]');
const creatorCountFields = document.querySelectorAll('[data-creator-count]');
const creatorFilter = document.querySelector('[data-creator-filter]');

// Backup data only used when members.list cannot be reached.
// Keep editing members.list first; this just stops the public page from showing an error.
const FALLBACK_MEMBER_DATA = {
  "members": [
    {
      "name": "Alex",
      "roles": [
        "Owner",
        "Developer",
        "Animator"
      ]
    },
    {
      "name": "Cristian Tillar",
      "roles": [
        "Discord Server Co-Owner",
        "Developer",
        "Animator",
        "Voice Actor",
        "Artist",
        "Music Composer"
      ]
    },
    {
      "name": "DJ Musical Rares 22",
      "roles": [
        "Developer",
        "Animator",
        "Voice Actor",
        "Artist"
      ]
    },
    {
      "name": "Hunx",
      "roles": [
        "Voice Actor",
        "Artist"
      ]
    },
    {
      "name": "ReversalPlayer",
      "roles": [
        "Developer"
      ]
    },
    {
      "name": "WitheredBonnieINC",
      "roles": [
        "Voice Actor",
        "Artist"
      ]
    },
    {
      "name": "Cyvix Z. Voxless",
      "roles": [
        "Developer"
      ]
    },
    {
      "name": "AbeMakesGames",
      "roles": [
        "Developer"
      ]
    },
    {
      "name": "Dashvan",
      "roles": [
        "Developer"
      ]
    },
    {
      "name": "Enjoyer Smith",
      "roles": [
        "Artist"
      ]
    },
    {
      "name": "German Tank Gotta Sweep",
      "roles": [
        "Developer"
      ]
    },
    {
      "name": "portal2half",
      "roles": [
        "Developer"
      ]
    },
    {
      "name": "JulianHRROR",
      "roles": [
        "Developer"
      ]
    },
    {
      "name": "TimmingCulture",
      "roles": [],
      "note": "Role TBD"
    },
    {
      "name": "AdelaMartinica",
      "roles": [
        "Voice Actor",
        "Artist"
      ]
    },
    {
      "name": "Ethan Young",
      "roles": [
        "Voice Actor"
      ]
    },
    {
      "name": "GK",
      "roles": [
        "Voice Actor"
      ]
    },
    {
      "name": "Surov0990",
      "roles": [
        "Voice Actor"
      ]
    },
    {
      "name": "BOOSH",
      "roles": [
        "Animator"
      ]
    },
    {
      "name": "Kippers",
      "roles": [
        "Developer",
        "Voice Actor",
        "Artist"
      ]
    },
    {
      "name": "le charmander withe gune",
      "roles": [
        "Voice Actor"
      ]
    },
    {
      "name": "Lee :D",
      "roles": [
        "Voice Actor"
      ]
    },
    {
      "name": "ORION",
      "roles": [
        "Voice Actor"
      ]
    },
    {
      "name": "Rexab Rabbit",
      "roles": [
        "Voice Actor"
      ]
    },
    {
      "name": "TerrybleCode",
      "roles": [
        "Developer"
      ]
    },
    {
      "name": "Yeckim",
      "roles": [
        "Developer",
        "Animator"
      ]
    },
    {
      "name": "Mike",
      "roles": [
        "Artist"
      ]
    },
    {
      "name": "Acorn",
      "roles": [
        "Artist"
      ]
    }
  ]
};

function updateHeader() {
  if (!header) return;
  header.classList.toggle('is-scrolled', window.scrollY > 24);
}

updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

if (menuToggle && nav) {
  menuToggle.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    menuToggle.textContent = open ? 'Close' : 'Menu';
  });

  nav.addEventListener('click', event => {
    if (event.target.matches('a')) {
      nav.classList.remove('is-open');
      menuToggle.textContent = 'Menu';
    }
  });
}

function escapeHTML(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function normalizeMembers(data) {
  const members = Array.isArray(data) ? data : (data && Array.isArray(data.members) ? data.members : []);

  return members.map(member => {
    if (typeof member.roles === 'string') {
      return { ...member, roles: [member.roles] };
    }
    return member;
  });
}

function renderMembers(members) {
  if (!memberList) return;

  if (!members.length) {
    memberList.innerHTML = `
      <article class="member-card glass-panel member-empty">
        <h3>No members listed yet</h3>
        <p>Edit <code>members.list</code> to add the team.</p>
      </article>
    `;
    if (memberCount) memberCount.textContent = '0';
    if (roleCount) roleCount.textContent = '0';
    return;
  }

  const roles = new Set();

  memberList.innerHTML = members.map(member => {
    const name = escapeHTML(member.name || 'Unnamed Member');
    const roleList = Array.isArray(member.roles) ? member.roles.filter(Boolean) : [];
    roleList.forEach(role => roles.add(String(role).trim()));

    const roleMarkup = roleList.length
      ? roleList.map(role => `<span>${escapeHTML(role)}</span>`).join('')
      : `<span>${escapeHTML(member.note || 'Role TBD')}</span>`;

    return `
      <article class="member-card glass-panel">
        <h3>${name}</h3>
        <p class="member-roles">${roleMarkup}</p>
      </article>
    `;
  }).join('');

  if (memberCount) memberCount.textContent = String(members.length);
  if (roleCount) roleCount.textContent = String(roles.size);
}

async function readMemberFile(source) {
  const response = await fetch(source, { cache: 'no-store' });
  if (!response.ok) throw new Error(`${source} returned ${response.status}`);

  const text = await response.text();
  return JSON.parse(text);
}

async function loadMembers() {
  if (!memberList) return;

  const primarySource = memberList.dataset.memberSource || 'members.list';
  const backupSources = [
    primarySource,
    './members.list',
    'members.list',
    './data/members.list',
    'data/members.list',
    './members.json',
    'members.json'
  ];

  const sources = [...new Set(backupSources)];

  for (const source of sources) {
    try {
      const data = await readMemberFile(source);
      renderMembers(normalizeMembers(data));
      return;
    } catch (error) {
      console.warn(`Member source failed: ${source}`, error);
    }
  }

  // Last-resort fallback so the live page still shows the team instead of an error box.
  renderMembers(normalizeMembers(FALLBACK_MEMBER_DATA));
}

loadMembers();


// Backup data only used when games.list cannot be reached.
// Keep editing games.list first; this just stops the public page from looking empty.
const FALLBACK_GAME_DATA = {
  "note": "This is JSON saved as .list on purpose. Edit this file to add, remove, reorder, or update games on the website.",
  "games": [
    {
      "title": "doodle bob goes insane",
      "creator": "bartish behaviour",
      "url": "https://gamejolt.com/games/mehoy-menoy/1059054",
      "description": "A GameJolt project listed for the team. The public page does not have a real project pitch yet, so this card keeps the link live until the creator sends a banner and description.",
      "banner": "",
      "status": "Details Needed",
      "tags": [
        "GameJolt",
        "Placeholder",
        "Needs Info"
      ],
      "needsBanner": true
    },
    {
      "title": "Five Nights at Musical Rares 22 - 1 (FNaMR22-1)",
      "creator": "The Mr. DJ22",
      "url": "https://gamejolt.com/games/FNaMR22-1/971498",
      "description": "Try to survive five nights inside Musical's Pizza Party World. The job looks simple until the characters start acting alive.",
      "banner": "assets/images/GameBanners/FNaMR22-1.webp",
      "status": "Available",
      "tags": [
        "FNaF Fan Game",
        "Survival",
        "Horror"
      ],
      "needsBanner": false
    },
    {
      "title": "Billy's Theatre Show ACT-1",
      "creator": "The Mr. DJ22",
      "url": "https://gamejolt.com/games/BTSACT-1OO/1031704",
      "description": "Andrés loses Rodger's Pizza Playhouse, then takes a job at the theatre that stole his character. The past follows him there, and the story connects to the FFD Saga.",
      "banner": "assets/images/GameBanners/BTS_ACT1.webp",
      "status": "Available",
      "tags": [
        "Story",
        "Horror",
        "FFD Saga"
      ],
      "needsBanner": false
    },
    {
      "title": "Five Nights at Musical Rares - 1 \"The Musical Investigation\" [Recomposed]",
      "creator": "The Mr. DJ22",
      "url": "https://gamejolt.com/games/FNaMR1tmirecomposed/1014268",
      "description": "A remake of the original FNaMR experience, with updated graphics, reworked lore, returning characters, mechanics, and story pieces.",
      "banner": "assets/images/GameBanners/FNaMR-1.webp",
      "status": "Available",
      "tags": [
        "Remake",
        "Horror",
        "FNaMR"
      ],
      "needsBanner": false
    },
    {
      "title": "Fishery's Family Diner (Classic)",
      "creator": "CSB",
      "url": "https://gamejolt.com/games/FFD1Classic/960353",
      "description": "You need money, so you take a night guard job at an animatronic restaurant with a rough history.",
      "banner": "",
      "status": "Listed",
      "tags": [
        "FNaF Fan Game",
        "Classic",
        "Horror"
      ],
      "needsBanner": true
    },
    {
      "title": "Fishery's Family Diner 2",
      "creator": "CSB",
      "url": "https://gamejolt.com/games/ffd2/961598",
      "description": "The same worker returns for a new summer job at the renovated Fishery's Family Diner.",
      "banner": "",
      "status": "Listed",
      "tags": [
        "FNaF Fan Game",
        "Sequel",
        "Horror"
      ],
      "needsBanner": true
    },
    {
      "title": "Fishery's Family Diner 3",
      "creator": "CSB",
      "url": "https://gamejolt.com/games/FFD3/977501",
      "description": "In 1996, Daniel Stephans is hired to guard a horror attraction built around the mysteries of the older diner.",
      "banner": "",
      "status": "Listed",
      "tags": [
        "Horror Attraction",
        "FNaF Fan Game",
        "Mystery"
      ],
      "needsBanner": true
    },
    {
      "title": "Fishery's Family Diner 4",
      "creator": "CSB",
      "url": "https://gamejolt.com/games/FFD4/1007523",
      "description": "Jena gets hired at a new horror attraction based on the unsolved crimes and mysteries of Fishery's Family Diner.",
      "banner": "",
      "status": "Listed",
      "tags": [
        "Horror Attraction",
        "Mystery",
        "FNaF Fan Game"
      ],
      "needsBanner": true
    },
    {
      "title": "Fishery's Family Diner 5",
      "creator": "CSB",
      "url": "https://gamejolt.com/games/ffd5welcometothemechanichell/1015509",
      "description": "An investigator follows what remains of the Fishery's Family Diner case into the mechanic hell.",
      "banner": "",
      "status": "Listed",
      "tags": [
        "Investigation",
        "Mechanic Hell",
        "Horror"
      ],
      "needsBanner": true
    },
    {
      "title": "Fishery's Family Diner Overhaul",
      "creator": "CSB",
      "url": "https://gamejolt.com/games/ffdoverhaul/1018072",
      "description": "An overhaul slot for the Fishery's Family Diner series. Add the official creator pitch and banner here when they are ready.",
      "banner": "",
      "status": "Details Needed",
      "tags": [
        "Overhaul",
        "FNaF Fan Game",
        "Needs Info"
      ],
      "needsBanner": true
    },
    {
      "title": "Wyre",
      "creator": "reese's pieces",
      "url": "https://gamejolt.com/games/wyre/1057498",
      "description": "A GameJolt project from reese's pieces. The card is ready for the official short pitch and banner once the creator sends them in.",
      "banner": "",
      "status": "Details Needed",
      "tags": [
        "GameJolt",
        "Needs Info"
      ],
      "needsBanner": true
    },
    {
      "title": "Project: Unstuffed",
      "creator": "yobuddyalex",
      "url": "https://gamejolt.com/games/projectunstuffed/960829",
      "description": "A fast-moving FNaF-style fan project from yobuddyalex. The GameJolt page includes a flashing-lights warning, so players should check the page before playing.",
      "banner": "",
      "status": "Listed",
      "tags": [
        "FNaF Fan Game",
        "GameJolt",
        "Flashing Lights"
      ],
      "needsBanner": true
    },
    {
      "title": "Nights at Felix's Remastered",
      "creator": "yobuddyalex",
      "url": "https://gamejolt.com/games/naf-r/1078611",
      "description": "A remastered Nights at Felix's project from yobuddyalex. More details can be filled in when the creator sends the final pitch and banner.",
      "banner": "",
      "status": "Listed",
      "tags": [
        "Remaster",
        "FNaF Fan Game",
        "Details Needed"
      ],
      "needsBanner": true
    },
    {
      "title": "FNaF: Re-clicked",
      "creator": "sonic Fan Games",
      "url": "https://gamejolt.com/games/FNaF-Re-clicked-SERIES/936494",
      "description": "A reimagined take on the classic FNaF games, built around smarter AI, new mechanics, and the same old pressure of making it through the night.",
      "banner": "assets/images/GameBanners/Cyvix_SFG/reclicked.webp",
      "status": "SFG Archive",
      "tags": [
        "SFG",
        "FNaF Fan Game",
        "Reimagined"
      ],
      "needsBanner": false
    },
    {
      "title": "Five Nights at Freddy's: The Movie Edition",
      "creator": "sonic Fan Games",
      "url": "https://gamejolt.com/games/FNaF_The-Movie-Edition/912978",
      "description": "A cinematic FNaF fan-game entry inspired by the movie universe.",
      "banner": "assets/images/GameBanners/Cyvix_SFG/FNaF_TMGE_LOGO.png",
      "status": "SFG",
      "tags": [
        "SFG",
        "FNaF",
        "Movie Edition"
      ],
      "needsBanner": false
    },
    {
      "title": "BLOXORZ - Remake",
      "creator": "sonic Fan Games",
      "url": "https://gamejolt.com/games/BLOXORZ/964697",
      "description": "A faithful fan remake of the classic Flash puzzle game, with the 33 original levels plus extra custom levels.",
      "banner": "assets/images/GameBanners/Cyvix_SFG/BLOXORZ_LOGO.png",
      "status": "SFG",
      "tags": [
        "Puzzle",
        "Remake",
        "Flash Game"
      ],
      "needsBanner": false
    },
    {
      "title": "Portal 1 & 2: The Clickteam Version",
      "creator": "sonic Fan Games",
      "url": "https://gamejolt.com/games/Portal_2D/987767",
      "description": "Portal 1 and Portal 2 rebuilt in 2D with Clickteam Fusion, including custom levels and extra fan-made content.",
      "banner": "assets/images/GameBanners/Cyvix_SFG/PORTAL2D_LOGO.png",
      "status": "SFG",
      "tags": [
        "Portal",
        "2D",
        "Clickteam"
      ],
      "needsBanner": false
    },
    {
      "title": "One Night at Freddy's",
      "creator": "sonic Fan Games",
      "url": "https://gamejolt.com/games/OneNightATFreddys/991207",
      "description": "FNaF 1 compressed into one randomized night, with AI and night behavior changing every run.",
      "banner": "assets/images/GameBanners/Cyvix_SFG/Logo_ONaF.png",
      "status": "SFG",
      "tags": [
        "FNaF",
        "Randomized",
        "One Night"
      ],
      "needsBanner": false
    },
    {
      "title": "DELTARUNE CTF Re-Make",
      "creator": "sonic Fan Games",
      "url": "https://gamejolt.com/games/DELTARUNE-CTFRM/1010580",
      "description": "A fan-made remake of DELTARUNE Chapter 1 in Clickteam Fusion, with extra custom touches added on top.",
      "banner": "assets/images/GameBanners/Cyvix_SFG/DELTA_STEAM_RE-MAKE_LOGO.png",
      "status": "SFG",
      "tags": [
        "DELTARUNE",
        "Remake",
        "Clickteam"
      ],
      "needsBanner": false
    },
    {
      "title": "Five Nights at Musical Rares 22 - 2 \"A Factory That Falls\"",
      "creator": "The Mr. DJ22",
      "url": "https://gamejolt.com/games/FNaMR22-2/971546",
      "description": "A follow-up FNaMR22 fan game centered around the factory setting. Added from the extra GameJolt link in the team list.",
      "banner": "",
      "status": "Extra Link",
      "tags": [
        "FNaMR",
        "Sequel",
        "Factory"
      ],
      "needsBanner": true
    },
    {
      "title": "8001",
      "creator": "Unknown Creator",
      "url": "https://gamejolt.com/games/8001/1074886",
      "description": "A requested GameJolt listing from the updated team list. The project page does not have enough public info yet, so this stays as a simple link until the creator sends details.",
      "banner": "",
      "status": "Extra Link",
      "tags": [
        "GameJolt",
        "Requested",
        "Details Needed"
      ],
      "needsBanner": true
    }
  ]
};

let allGames = [];
let activeCreator = 'all';

function normalizeGames(data) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.games)) return data.games;
  return [];
}

function setTextForAll(nodes, value) {
  nodes.forEach(node => {
    node.textContent = String(value);
  });
}

function gameInitials(title) {
  const words = String(title || 'UT')
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

  if (!words.length) return 'UT';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return words.slice(0, 3).map(word => word[0]).join('').toUpperCase();
}

function gameTagsMarkup(game) {
  const tags = Array.isArray(game.tags) ? game.tags.filter(Boolean) : [];
  if (!tags.length) return '';
  return `<div class="project-tags">${tags.map(tag => `<span>${escapeHTML(tag)}</span>`).join('')}</div>`;
}

function gameBannerMarkup(game) {
  const title = escapeHTML(game.title || 'Untitled Game');
  const banner = String(game.banner || '').trim();

  if (!banner) {
    return `
      <div class="game-banner no-image">
        <div class="game-banner-placeholder">${escapeHTML(gameInitials(game.title))}</div>
        <span>Banner needed</span>
      </div>
    `;
  }

  return `
    <div class="game-banner">
      <img src="${escapeHTML(banner)}" alt="${title} banner" loading="lazy">
    </div>
  `;
}

function renderCreatorFilters(games) {
  if (!creatorFilter) return;

  const creators = [...new Set(games.map(game => game.creator || 'Unknown Creator'))]
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));

  creatorFilter.innerHTML = [
    `<button type="button" data-creator="all" class="${activeCreator === 'all' ? 'active' : ''}">All creators</button>`,
    ...creators.map(creator => `
      <button type="button" data-creator="${escapeHTML(creator)}" class="${activeCreator === creator ? 'active' : ''}">${escapeHTML(creator)}</button>
    `)
  ].join('');

  creatorFilter.querySelectorAll('button[data-creator]').forEach(button => {
    button.addEventListener('click', () => {
      activeCreator = button.dataset.creator || 'all';
      renderGames(allGames);
      renderCreatorFilters(allGames);
    });
  });
}

function renderGames(games) {
  const creatorSet = new Set(games.map(game => game.creator || 'Unknown Creator').filter(Boolean));

  setTextForAll(gameCountFields, games.length);
  setTextForAll(creatorCountFields, creatorSet.size);

  if (!gameList) return;

  const visibleGames = activeCreator === 'all'
    ? games
    : games.filter(game => (game.creator || 'Unknown Creator') === activeCreator);

  if (!visibleGames.length) {
    gameList.innerHTML = `
      <article class="game-library-card glass-panel game-empty">
        <div class="game-banner-placeholder">UT</div>
        <div class="game-card-body">
          <h3>No games found</h3>
          <p>Try another creator filter or add games in <code>games.list</code>.</p>
        </div>
      </article>
    `;
    return;
  }

  gameList.innerHTML = visibleGames.map(game => {
    const title = escapeHTML(game.title || 'Untitled Game');
    const creator = escapeHTML(game.creator || 'Unknown Creator');
    const status = escapeHTML(game.status || 'Listed');
    const description = escapeHTML(game.description || 'More details will be added soon.');
    const url = escapeHTML(game.url || '#');
    const needsBanner = game.needsBanner ? '<span class="needs-banner">Needs banner</span>' : '';

    return `
      <article class="game-library-card glass-panel">
        ${gameBannerMarkup(game)}
        <div class="game-card-body">
          <div class="game-meta-line">
            <span>${status}</span>
            ${needsBanner}
          </div>
          <h3>${title}</h3>
          <p class="game-creator">Creator: <strong>${creator}</strong></p>
          <p>${description}</p>
          ${gameTagsMarkup(game)}
          <div class="game-card-actions">
            <a class="button small gamejolt" href="${url}" target="_blank" rel="noopener noreferrer">Open GameJolt</a>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

async function readGameFile(source) {
  const response = await fetch(source, { cache: 'no-store' });
  if (!response.ok) throw new Error(`${source} returned ${response.status}`);

  const text = await response.text();
  return JSON.parse(text);
}

async function loadGames() {
  if (!gameList && !gameCountFields.length && !creatorCountFields.length) return;

  const primarySource = gameList?.dataset.gameSource || 'games.list';
  const backupSources = [
    primarySource,
    './games.list',
    'games.list',
    './data/games.list',
    'data/games.list',
    './games.json',
    'games.json',
    './data/games.json',
    'data/games.json'
  ];

  const sources = [...new Set(backupSources)];

  for (const source of sources) {
    try {
      const data = await readGameFile(source);
      allGames = normalizeGames(data);
      renderGames(allGames);
      renderCreatorFilters(allGames);
      return;
    } catch (error) {
      console.warn(`Game source failed: ${source}`, error);
    }
  }

  allGames = normalizeGames(FALLBACK_GAME_DATA);
  renderGames(allGames);
  renderCreatorFilters(allGames);
}

loadGames();


if (musicToggle && audio) {
  const savedMusic = localStorage.getItem('utMusic') === 'on';

  function setMusicState(isPlaying) {
    musicToggle.classList.toggle('is-playing', isPlaying);
    musicToggle.textContent = isPlaying ? 'Music: On' : 'Music: Off';
    localStorage.setItem('utMusic', isPlaying ? 'on' : 'off');
  }

  setMusicState(false);

  if (savedMusic) {
    audio.volume = 0.38;
  }

  musicToggle.addEventListener('click', async () => {
    try {
      audio.volume = 0.38;
      if (audio.paused) {
        await audio.play();
        setMusicState(true);
      } else {
        audio.pause();
        setMusicState(false);
      }
    } catch (error) {
      setMusicState(false);
    }
  });
}
