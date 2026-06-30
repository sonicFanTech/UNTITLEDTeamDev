const header = document.querySelector('[data-header]');
const nav = document.querySelector('[data-nav]');
const menuToggle = document.querySelector('[data-menu-toggle]');
const musicToggle = document.querySelector('[data-music-toggle]');
const audio = document.querySelector('[data-bg-audio]');
const memberList = document.querySelector('[data-member-list]');
const memberCount = document.querySelector('[data-member-count]');
const roleCount = document.querySelector('[data-role-count]');

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

async function loadMembers() {
  if (!memberList) return;

  const source = memberList.dataset.memberSource || 'members.list';

  try {
    const response = await fetch(source, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Could not load ${source}`);

    const text = await response.text();
    const data = JSON.parse(text);
    renderMembers(normalizeMembers(data));
  } catch (error) {
    memberList.innerHTML = `
      <article class="member-card glass-panel member-error">
        <h3>Member list could not load</h3>
        <p>Check that <code>${escapeHTML(source)}</code> exists and is valid JSON. If you opened the site by double-clicking the HTML file, try running it through a local server or GitHub Pages.</p>
      </article>
    `;
    if (memberCount) memberCount.textContent = '--';
    if (roleCount) roleCount.textContent = '--';
    console.warn(error);
  }
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
