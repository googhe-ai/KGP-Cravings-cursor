const state = {
  data: null,
  activeCategory: null,
};

const qs = (sel, el = document) => el.querySelector(sel);
const qsa = (sel, el = document) => Array.from(el.querySelectorAll(sel));

async function loadData() {
  const res = await fetch('./data/restaurants.json');
  if (!res.ok) throw new Error('Failed to load data');
  state.data = await res.json();
}

function setYear() {
  qs('#year').textContent = new Date().getFullYear();
}

function bindNav() {
  const mobileBtn = qs('.mobile-menu');
  const nav = qs('.nav-tabs');
  mobileBtn?.addEventListener('click', () => {
    nav?.classList.toggle('show');
  });

  // Active link highlight on scroll
  const sections = ['home', 'category', 'foods', 'restros', 'contact'].map(id => qs('#' + id));
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          qsa('.nav-link').forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id));
        }
      });
    },
    { rootMargin: '-40% 0px -50% 0px', threshold: 0.01 }
  );
  sections.forEach(s => s && observer.observe(s));
}

function createRestroCard(restro) {
  const div = document.createElement('div');
  div.className = 'card';
  const cover = restro.image || 'https://picsum.photos/seed/' + encodeURIComponent(restro.name) + '/600/400';
  div.innerHTML = `
    <div class="media" style="background-image:url('${cover}')"></div>
    <div class="body">
      <div class="title">${restro.name}</div>
      <div class="subtitle">${restro.cuisine.join(', ')} • ⭐ ${restro.rating.toFixed(1)}</div>
      <div class="row">
        <button class="btn" data-action="open-menu">Open Menu</button>
        <button class="btn secondary" data-action="location">Location</button>
      </div>
    </div>
  `;

  div.querySelector('[data-action="open-menu"]').addEventListener('click', () => openMenuModal(restro));
  div.querySelector('[data-action="location"]').addEventListener('click', () => openLocation(restro));
  return div;
}

function createFoodCard(food) {
  const div = document.createElement('div');
  div.className = 'card';
  const cover = food.image || 'https://picsum.photos/seed/' + encodeURIComponent(food.name) + '/600/400';
  div.innerHTML = `
    <div class="media" style="background-image:url('${cover}')"></div>
    <div class="body">
      <div class="title">${food.name}</div>
      <div class="subtitle">${food.restaurantName}</div>
      <div class="row">
        <span class="price">₹${food.priceLocal}</span>
      </div>
      <div class="row">
        <button class="btn" data-action="compare">Compare</button>
        <button class="btn secondary" data-action="location">Location</button>
        <button class="btn ghost" data-action="see-more">See More</button>
      </div>
    </div>
  `;
  div.querySelector('[data-action="compare"]').addEventListener('click', () => openCompareModal(food));
  div.querySelector('[data-action="location"]').addEventListener('click', () => openLocation(food.restaurant));
  div.querySelector('[data-action="see-more"]').addEventListener('click', () => openMenuModal(food.restaurant, food.name));
  return div;
}

function renderHome() {
  const famousRestros = state.data.restaurants.filter(r => r.featured).slice(0, 6);
  const famousFoods = state.data.foods.filter(f => f.featured).slice(0, 6);
  const fr = qs('#famous-restros');
  const ff = qs('#famous-foods');
  fr.innerHTML = '';
  famousRestros.forEach(r => fr.appendChild(createRestroCard(r)));
  ff.innerHTML = '';
  famousFoods.forEach(f => ff.appendChild(createFoodCard(f)));
}

function renderCategories() {
  const set = new Set();
  state.data.restaurants.forEach(r => r.cuisine.forEach(c => set.add(c)));
  state.data.foods.forEach(f => f.category && set.add(f.category));
  const chips = qs('#category-chips');
  chips.innerHTML = '';
  const all = document.createElement('button');
  all.className = 'chip' + (state.activeCategory ? '' : ' active');
  all.textContent = 'All';
  all.addEventListener('click', () => { state.activeCategory = null; renderFoods(); renderRestros(); syncChips(); });
  chips.appendChild(all);
  Array.from(set).sort().forEach(cat => {
    const b = document.createElement('button');
    b.className = 'chip' + (state.activeCategory === cat ? ' active' : '');
    b.textContent = cat;
    b.addEventListener('click', () => { state.activeCategory = cat; renderFoods(); renderRestros(); syncChips(); });
    chips.appendChild(b);
  });

  function syncChips() {
    qsa('.chip', chips).forEach(ch => {
      ch.classList.toggle('active', ch.textContent === (state.activeCategory ?? 'All'));
    });
  }
}

function renderRestros() {
  const grid = qs('#restro-grid');
  const term = qs('#restro-search').value.trim().toLowerCase();
  grid.innerHTML = '';
  let list = state.data.restaurants;
  if (state.activeCategory) {
    list = list.filter(r => r.cuisine.includes(state.activeCategory));
  }
  if (term) {
    list = list.filter(r => r.name.toLowerCase().includes(term));
  }
  list.forEach(r => grid.appendChild(createRestroCard(r)));
}

function renderFoods() {
  const grid = qs('#food-grid');
  const term = qs('#food-search').value.trim().toLowerCase();
  grid.innerHTML = '';
  let list = state.data.foods;
  if (state.activeCategory) {
    list = list.filter(f => f.category === state.activeCategory || f.restaurant.cuisine.includes(state.activeCategory));
  }
  if (term) {
    list = list.filter(f => f.name.toLowerCase().includes(term) || f.restaurantName.toLowerCase().includes(term));
  }
  list.forEach(f => grid.appendChild(createFoodCard(f)));
}

function openLocation(entity) {
  const { name, location } = entity;
  const url = location?.lat && location?.lng
    ? `https://www.google.com/maps?q=${location.lat},${location.lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name + ' restaurant')}`;
  window.open(url, '_blank', 'noopener');
}

function openMenuModal(restro, highlightFoodName) {
  const body = qs('#modal-body');
  const items = restro.menu;
  const listHtml = items
    .map(it => {
      const highlighted = highlightFoodName && it.name.toLowerCase() === highlightFoodName.toLowerCase();
      return `
        <div class="card">
          <div class="body">
            <div class="title">${it.name} ${highlighted ? '⭐' : ''}</div>
            <div class="row">
              <span class="price">₹${it.priceLocal}</span>
              <button class="btn" data-compare="${encodeURIComponent(restro.name)}::${encodeURIComponent(it.name)}">Compare</button>
            </div>
          </div>
        </div>
      `;
    })
    .join('');
  body.innerHTML = `
    <h3>${restro.name} • Menu</h3>
    <div class="grid-2">${listHtml}</div>
  `;
  showModal();
  qsa('[data-compare]').forEach(btn => {
    btn.addEventListener('click', () => {
      const [rName, fName] = decodeURIComponent(btn.getAttribute('data-compare')).split('::');
      const restaurant = state.data.restaurants.find(r => r.name === rName);
      const item = restaurant.menu.find(m => m.name === fName);
      const food = state.data.foods.find(f => f.name === fName && f.restaurantName === rName);
      openCompareModal(food || { ...item, restaurant, restaurantName: restaurant.name });
    });
  });
}

function openCompareModal(food) {
  const compare = food.compare || {};
  const zomato = compare.zomato ? `₹${compare.zomato}` : 'N/A';
  const swiggy = compare.swiggy ? `₹${compare.swiggy}` : 'N/A';
  const deltaZ = compare.zomato ? compare.zomato - food.priceLocal : null;
  const deltaS = compare.swiggy ? compare.swiggy - food.priceLocal : null;

  const pill = (label, value, delta) => `
    <div class="card">
      <div class="body">
        <div class="title">${label}</div>
        <div class="row"><span class="price">${value}</span>
          ${delta === null ? '' : `<span class="chip" title="Difference">${delta > 0 ? '+' : ''}${delta}</span>`}
        </div>
      </div>
    </div>`;

  qs('#modal-body').innerHTML = `
    <h3>Compare • ${food.name}</h3>
    <p class="subtitle">${food.restaurantName}</p>
    <div class="grid-2">
      ${pill('Local Price', `₹${food.priceLocal}`, 0)}
      ${pill('Zomato', zomato, deltaZ)}
      ${pill('Swiggy', swiggy, deltaS)}
    </div>
  `;
  showModal();
}

function showModal() {
  const modal = qs('#modal');
  modal.classList.add('show');
  modal.setAttribute('aria-hidden', 'false');
}
function hideModal() {
  const modal = qs('#modal');
  modal.classList.remove('show');
  modal.setAttribute('aria-hidden', 'true');
}

function bindModal() {
  qsa('[data-close]').forEach(el => el.addEventListener('click', hideModal));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') hideModal(); });
}

function bindSearch() {
  qs('#food-search').addEventListener('input', renderFoods);
  qs('#restro-search').addEventListener('input', renderRestros);
}

function hydrateFoodsFromRestaurants() {
  const foods = [];
  state.data.restaurants.forEach(r => {
    r.menu.forEach(m => {
      foods.push({
        id: `${r.id}_${m.id}`,
        name: m.name,
        priceLocal: m.priceLocal,
        image: m.image,
        category: m.category,
        featured: !!m.featured,
        restaurant: r,
        restaurantName: r.name,
        compare: m.compare,
      });
    });
  });
  state.data.foods = foods;
}

async function init() {
  try {
    setYear();
    bindNav();
    bindModal();
    bindSearch();
    await loadData();
    hydrateFoodsFromRestaurants();
    renderHome();
    renderCategories();
    renderFoods();
    renderRestros();
  } catch (err) {
    console.error(err);
    alert('Failed to initialize app. Check console.');
  }
}

init();