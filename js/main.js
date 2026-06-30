const header = document.querySelector('[data-header]');
const nav = document.querySelector('[data-nav]');
const menuToggle = document.querySelector('[data-menu-toggle]');
const musicToggle = document.querySelector('[data-music-toggle]');
const audio = document.querySelector('[data-bg-audio]');
const memberList = document.querySelector('[data-member-list]');
const memberCount = document.querySelector('[data-member-count]');
const roleCount = document.querySelector('[data-role-count]');

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
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.members)) return data.members;
  return [];
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
