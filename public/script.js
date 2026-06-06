const INSTAGRAM_URL = 'https://www.instagram.com/nataliiafitt/';
const WHATSAPP_URL = 'https://wa.me/4915129614047';
const EMAIL_TO = 'nataliiafitt@gmail.com';

function setSeatCounter() {
  const counter = document.querySelector('.seat-counter');
  if (!counter) return;
  const remaining = Number(counter.dataset.remaining) || 10;
  const total = Number(counter.dataset.total) || 10;
  counter.querySelector('.seat-count').textContent = remaining;
  counter.querySelector('.seat-total').textContent = total;
}

function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    els.forEach(el => el.classList.add('visible'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  els.forEach(el => io.observe(el));
}

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (event) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        event.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        const actionSheet = document.getElementById('actionSheet');
        if (actionSheet) actionSheet.classList.add('hidden');
      }
    });
  });
}

function initActionSheet() {
  const sheet = document.getElementById('actionSheet');
  if (!sheet) return;
  const openButtons = document.querySelectorAll('.open-action-sheet');
  const closeButton = sheet.querySelector('.sheet-close');
  const formButton = sheet.querySelector('.form-scroll');

  openButtons.forEach(btn => btn.addEventListener('click', () => sheet.classList.remove('hidden')));
  closeButton.addEventListener('click', () => sheet.classList.add('hidden'));
  sheet.addEventListener('click', (event) => {
    if (event.target === sheet) sheet.classList.add('hidden');
  });
  formButton.addEventListener('click', () => {
    const contact = document.getElementById('contact');
    if (contact) {
      sheet.classList.add('hidden');
      contact.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
}

function showToast(text) {
  const toast = document.getElementById('toastMessage');
  if (!toast) return;
  toast.textContent = text;
  toast.classList.remove('hidden');
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => toast.classList.add('hidden'), 4500);
}

async function handleContactForm() {
  const form = document.getElementById('contactForm');
  const msg = document.getElementById('formMsg');
  if (!form) return;
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    msg.textContent = '';

const data = Object.fromEntries(new FormData(form).entries());

const text = encodeURIComponent(
`Здравствуйте, Наталия!

Хочу забронировать место на фитнес-ретрит в Салоу.

Имя: ${data.name || ''}
Телефон: ${data.phone || ''}
Email: ${data.email || ''}
Instagram: ${data.instagram || ''}
Страна: ${data.country || ''}

О себе:
${data.message || ''}

Я ознакомилась с договором и условиями участия.`
);
const whatsappUrl = `whatsapp://send?phone=4915129614047&text=${text}`;
msg.style.color = '#2e6c4f';
msg.textContent = 'Открываю WhatsApp...';

window.open(whatsappUrl, '_blank');
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setSeatCounter();
  initReveal();
  initSmoothScroll();
  initActionSheet();
  handleContactForm();
});

// Contract modal preview handlers
document.addEventListener('click', (e) => {
  const target = e.target.closest && e.target.closest('.open-contract');
  if (target) {
    e.preventDefault();
    const src = target.dataset.src;
    const modal = document.getElementById('contractModal');
    const frame = document.getElementById('contractFrame');
    frame.src = src;
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
  }
  if (e.target.closest && e.target.closest('.modal-close')) {
    const modal = document.getElementById('contractModal');
    const frame = document.getElementById('contractFrame');
    frame.src = '';
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
  }
  if (e.target.classList && e.target.classList.contains('modal-backdrop')) {
    const modal = document.getElementById('contractModal');
    const frame = document.getElementById('contractFrame');
    frame.src = '';
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
  }
});
