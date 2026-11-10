const form = document.getElementById('visitorForm');
const overlay = document.getElementById('welcomeOverlay');
const errorBox = document.getElementById('formError');
const toast = document.getElementById('toast');
const fields = {
  company: document.getElementById('company'),
  name: document.getElementById('visitorName'),
  year: document.getElementById('birthYear'),
  gender: document.getElementById('gender')
};
const motionToggle = document.getElementById('motionToggle');
const currentYear = new Date().getFullYear();
fields.year.max = String(currentYear);
document.body.classList.add('check-in-open');

function honorificFor(year, gender) {
  if (year > 2005) return 'em';
  if (year === 2005) return 'bạn';
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
  const yearText = fields.year.value.trim();
  const gender = fields.gender.value;
  const year = Number(yearText);

  if (!company || !name || !yearText || !gender) {
    errorBox.textContent = 'Bạn hãy điền đầy đủ thông tin để bắt đầu nhé.';
    return null;
  }
  if (!Number.isInteger(year) || year < Number(fields.year.min) || year > currentYear) {
    errorBox.textContent = `Năm sinh cần nằm trong khoảng 1900–${currentYear}.`;
    fields.year.focus();
    return null;
  }

  errorBox.textContent = '';
  return { company, name, year, gender };
}

function personalize(visitor) {
  const title = honorificFor(visitor.year, visitor.gender);
  const greeting = `Xin chào ${title} ${visitor.name} từ ${visitor.company}.`;
  document.getElementById('visitorGreeting').textContent = greeting;
  document.getElementById('visitorBannerMessage').textContent = `${greeting} Cùng bắt đầu hành trình khám phá Portfolio nhé!`;
  overlay.classList.add('is-hidden');
  document.body.classList.remove('check-in-open');
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

document.getElementById('journeyButton').addEventListener('click', () => {
  document.getElementById('journey').scrollIntoView({ behavior: 'smooth', block: 'start' });
});
document.getElementById('scrollButton').addEventListener('click', () => {
  document.querySelector('.portfolio-tabs').scrollIntoView({ behavior: 'smooth', block: 'start' });
});

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

const sectionLinks = [...document.querySelectorAll('.portfolio-tabs a[data-section]')];
const sections = sectionLinks
  .map((link) => document.getElementById(link.dataset.section))
  .filter(Boolean);

function setActiveSection(id) {
  sectionLinks.forEach((link) => {
    if (link.dataset.section === id) {
      link.setAttribute('aria-current', 'location');
    } else {
      link.removeAttribute('aria-current');
    }
  });
}

function updateActiveSection() {
  if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) {
    setActiveSection(sections[sections.length - 1].id);
    return;
  }

  const marker = 115;
  const activeSection = sections.reduce((closest, section) => {
    const bounds = section.getBoundingClientRect();
    const distance = bounds.top <= marker && bounds.bottom >= marker
      ? 0
      : Math.min(Math.abs(bounds.top - marker), Math.abs(bounds.bottom - marker));
    return distance < closest.distance ? { section, distance } : closest;
  }, { section: sections[0], distance: Infinity });
  if (activeSection.section) setActiveSection(activeSection.section.id);
}

sectionLinks.forEach((link) => {
  link.addEventListener('click', () => setActiveSection(link.dataset.section));
});

const progressBar = document.getElementById('scrollProgress');
function updateScrollProgress() {
  const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollableHeight > 0
    ? Math.min((window.scrollY / scrollableHeight) * 100, 100)
    : 0;
  const complete = scrollableHeight > 0 && window.scrollY >= scrollableHeight - 1;
  progressBar.style.width = `${complete ? 100 : Math.max(progress, 0)}%`;
  updateActiveSection();
}
window.addEventListener('scroll', updateScrollProgress, { passive: true });
window.addEventListener('resize', updateScrollProgress);
updateScrollProgress();

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

fields.company.focus({ preventScroll: true });
