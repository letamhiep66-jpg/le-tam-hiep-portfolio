const form = document.getElementById('visitorForm');
const overlay = document.getElementById('welcomeOverlay');
const errorBox = document.getElementById('formError');
const toast = document.getElementById('toast');
const fields = {
  company: document.getElementById('company'),
  name: document.getElementById('visitorName'),
  gender: document.getElementById('gender'),
  birthYear: document.getElementById('birthYear')
};
const motionToggle = document.getElementById('motionToggle');
const genderTrigger = document.getElementById('genderTrigger');
const genderMenu = document.getElementById('genderOptions');
const genderValue = document.getElementById('genderValue');
const genderField = document.querySelector('.custom-select');
const genderOptions = [...genderMenu.querySelectorAll('[role="option"]')];
document.body.classList.add('check-in-open');

function closeGenderMenu({ restoreFocus = false } = {}) {
  genderMenu.hidden = true;
  genderField.classList.remove('is-open');
  genderTrigger.setAttribute('aria-expanded', 'false');
  if (restoreFocus) genderTrigger.focus();
}

function openGenderMenu() {
  genderMenu.hidden = false;
  genderField.classList.add('is-open');
  genderTrigger.setAttribute('aria-expanded', 'true');
  const selected = genderOptions.find((option) => option.dataset.value === fields.gender.value);
  (selected || genderOptions[0]).focus();
}

function chooseGender(option) {
  if (!option) return;
  fields.gender.value = option.dataset.value;
  genderValue.textContent = option.textContent.trim();
  genderField.classList.add('has-value');
  genderOptions.forEach((item) => {
    const selected = item === option;
    item.setAttribute('aria-selected', String(selected));
    item.tabIndex = selected ? 0 : -1;
  });
  fields.gender.dispatchEvent(new Event('change', { bubbles: true }));
  closeGenderMenu({ restoreFocus: true });
}

genderTrigger.addEventListener('click', () => {
  if (genderMenu.hidden) openGenderMenu();
  else closeGenderMenu();
});

genderOptions.forEach((option, index) => {
  option.addEventListener('click', () => chooseGender(option));
  option.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeGenderMenu({ restoreFocus: true });
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const delta = event.key === 'ArrowDown' ? 1 : -1;
      genderOptions[(index + delta + genderOptions.length) % genderOptions.length].focus();
    } else if (event.key === 'Home') {
      event.preventDefault();
      genderOptions[0].focus();
    } else if (event.key === 'End') {
      event.preventDefault();
      genderOptions[genderOptions.length - 1].focus();
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      chooseGender(option);
    }
  });
});

genderTrigger.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    if (genderMenu.hidden) openGenderMenu();
    else genderOptions[0].focus();
  } else if (event.key === 'Escape') {
    closeGenderMenu();
  }
});

document.addEventListener('click', (event) => {
  if (!genderField.contains(event.target) && !genderMenu.hidden) closeGenderMenu();
});

function honorificFor(gender, birthYear) {
  // Hiệp sinh năm 2005: người lớn tuổi hơn là anh/chị,
  // cùng năm sinh xưng bạn, người sinh sau năm 2005 xưng em.
  if (birthYear > 2005) return 'em';
  if (birthYear === 2005) return 'bạn';
  if (gender === 'male') return 'anh';
  if (gender === 'female') return 'chị';
  return 'bạn';
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove('show'), 3600);
}

function readVisitor() {
  const company = fields.company.value.trim();
  const name = fields.name.value.trim();
  const yearText = fields.birthYear.value.trim();
  const birthYear = Number(yearText);
  const gender = fields.gender.value;
  const currentYear = new Date().getFullYear();

  if (!company || !name || !yearText || !gender) {
    errorBox.textContent = 'Bạn hãy điền đầy đủ thông tin để bắt đầu nhé.';
    const firstMissing = [
      [fields.company, company],
      [fields.name, name],
      [fields.birthYear, yearText],
      [genderTrigger, gender]
    ].find(([, value]) => !value);
    firstMissing?.[0].focus();
    return null;
  }

  if (!Number.isInteger(birthYear) || birthYear < 1900 || birthYear > currentYear) {
    errorBox.textContent = `Năm sinh cần nằm trong khoảng 1900–${currentYear}.`;
    fields.birthYear.focus();
    return null;
  }

  errorBox.textContent = '';
  return { company, name, gender, birthYear };
}

function personalize(visitor) {
  const title = honorificFor(visitor.gender, visitor.birthYear);
  const greeting = `Xin chào ${title} ${visitor.name} từ ${visitor.company}.`;
  document.getElementById('visitorGreeting').textContent = greeting;
  document.getElementById('visitorBannerMessage').textContent = `${greeting} Cùng bắt đầu hành trình khám phá Portfolio nhé!`;
  overlay.classList.add('is-hidden');
  document.body.classList.remove('check-in-open');
  activateTab('home', { updateHistory: false });
  genderTrigger.blur();
  document.getElementById('journeyButton').focus({ preventScroll: true });
  showToast(`✧ ${greeting} Chào mừng đến với Portfolio!`);
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const visitor = readVisitor();
  if (visitor) personalize(visitor);
});

Object.values(fields).forEach((field) => {
  field.addEventListener('input', () => { errorBox.textContent = ''; });
  field.addEventListener('change', () => { errorBox.textContent = ''; });
});

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Tab' || overlay.classList.contains('is-hidden')) return;

  const focusable = [...overlay.querySelectorAll('input, select, button')].filter((element) => !element.disabled);
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});

document.getElementById('journeyButton').addEventListener('click', () => activateTab('journey'));
document.getElementById('scrollButton').addEventListener('click', () => activateTab('journey'));

motionToggle.addEventListener('click', () => {
  const paused = document.body.classList.toggle('motion-paused');
  motionToggle.setAttribute('aria-pressed', String(!paused));
  motionToggle.querySelector('.sound-state').textContent = paused ? 'OFF' : 'ON';
  showToast(paused ? 'Đã tắt hiệu ứng chuyển động.' : 'Đã bật hiệu ứng chuyển động.');
});

const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
if (motionPreference.matches) {
  document.body.classList.add('motion-paused');
  motionToggle.setAttribute('aria-pressed', 'false');
  motionToggle.querySelector('.sound-state').textContent = 'OFF';
}

const filterButtons = [...document.querySelectorAll('.filter-button')];
const projectCards = [...document.querySelectorAll('.project-card')];
const filterStatus = document.getElementById('filterStatus');

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    let visibleCount = 0;
    projectCards.forEach((card) => {
      card.hidden = filter !== 'all' && card.dataset.category !== filter;
      if (!card.hidden) visibleCount += 1;
    });
    filterButtons.forEach((item) => {
      const selected = item === button;
      item.classList.toggle('is-active', selected);
      item.setAttribute('aria-pressed', String(selected));
    });
    filterStatus.textContent = `Đang hiển thị ${visibleCount} lĩnh vực.`;
  });
});

const TAB_IDS = ['home', 'journey', 'skills', 'projects', 'certificates', 'contact'];
const TAB_ID_SET = new Set(TAB_IDS);
const homePanel = document.getElementById('home');
const portfolioShell = document.querySelector('.portfolio-shell');
const portfolioContent = document.querySelector('.portfolio-content');
const mainTabLinks = [...document.querySelectorAll('.main-nav a[data-tab]')];
const allTabPanels = TAB_IDS
  .filter((id) => id !== 'home')
  .map((id) => document.getElementById(id))
  .filter(Boolean);

function activateTab(id, { updateHistory = true } = {}) {
  if (!TAB_ID_SET.has(id)) return;

  document.body.dataset.activeTab = id;
  const isHome = id === 'home';
  homePanel.hidden = !isHome;
  homePanel.setAttribute('aria-hidden', String(!isHome));
  portfolioShell.hidden = isHome;
  portfolioShell.setAttribute('aria-hidden', String(isHome));

  allTabPanels.forEach((panel) => {
    const active = panel.id === id;
    panel.classList.toggle('is-active', active);
    panel.setAttribute('aria-hidden', String(!active));
  });

  mainTabLinks.forEach((link) => {
    const active = link.dataset.tab === id;
    link.setAttribute('aria-selected', String(active));
    if (active) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });

  if (!isHome && portfolioContent) portfolioContent.scrollTop = 0;
  if (updateHistory) {
    const nextUrl = id === 'home'
      ? window.location.pathname + window.location.search
      : `#${id}`;
    window.history.pushState({ portfolioTab: id }, '', nextUrl);
  }
}

document.addEventListener('click', (event) => {
  const link = event.target.closest('a[href^="#"]');
  if (!link) return;
  const target = (link.dataset.tab || link.getAttribute('href').slice(1)).trim();
  if (!TAB_ID_SET.has(target)) return;
  event.preventDefault();
  activateTab(target);
});

window.addEventListener('popstate', () => {
  const fromHash = window.location.hash.slice(1);
  activateTab(TAB_ID_SET.has(fromHash) ? fromHash : 'home', { updateHistory: false });
});

activateTab('home', { updateHistory: false });

async function sharePortfolio() {
  const shareData = {
    title: 'Lê Tam Hiệp — Interactive Portfolio',
    text: 'Khám phá Portfolio của Lê Tam Hiệp.',
    url: window.location.href.split('#')[0]
  };
  if (navigator.share) {
    try {
      await navigator.share(shareData);
      showToast('Đã mở chia sẻ Portfolio.');
    } catch (error) {
      if (error.name !== 'AbortError') showToast('Không thể mở bảng chia sẻ trên thiết bị này.');
    }
    return;
  }

  if (!navigator.clipboard) {
    showToast('Trình duyệt chưa cấp quyền sao chép liên kết Portfolio.');
    return;
  }
  try {
    await navigator.clipboard.writeText(shareData.url);
    showToast('Đã sao chép liên kết Portfolio.');
  } catch {
    showToast('Không thể sao chép liên kết. Hãy sao chép URL trên thanh địa chỉ.');
  }
}

document.getElementById('sharePortfolio').addEventListener('click', sharePortfolio);

document.getElementById('downloadVCard').addEventListener('click', () => {
  const contact = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    'FN:Lê Tam Hiệp',
    'N:Hiệp;Lê;Tam;;',
    'TITLE:Marketing Enthusiast | Growth Mindset',
    'ADR;TYPE=WORK:;;;Hà Nội;;;Việt Nam',
    'NOTE:Interactive Portfolio',
    'END:VCARD'
  ].join('\r\n');
  const file = new Blob([contact], { type: 'text/vcard;charset=utf-8' });
  const url = URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'le-tam-hiep.vcf';
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  showToast('Đã tải thông tin liên hệ.');
});

