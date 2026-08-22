// ===== Shared Cart + Lightbox + Card rendering for arts by zahra =====

function getCart(){
  try { return JSON.parse(localStorage.getItem('azCart') || '[]'); } catch(e){ return []; }
}
function setCart(cart){
  localStorage.setItem('azCart', JSON.stringify(cart));
  updateCartBadge();
}
function addToCart(item){
  const cart = getCart();
  if(cart.some(i=>i.code === item.code)) return false;
  cart.push(item);
  setCart(cart);
  return true;
}
function removeFromCart(code){
  setCart(getCart().filter(i=>i.code!==code));
  renderCartDrawer();
}
function updateCartBadge(){
  const badge = document.getElementById('cartBadge');
  if(!badge) return;
  const count = getCart().length;
  badge.textContent = count;
  badge.style.display = count>0 ? 'flex' : 'none';
}
function openCartDrawer(){
  renderCartDrawer();
  const drawer = document.getElementById('cartDrawer');
  const overlay = document.getElementById('cartOverlay');
  if(drawer) drawer.classList.add('open');
  if(overlay) overlay.classList.add('show');
}
function closeCartDrawer(){
  const drawer = document.getElementById('cartDrawer');
  const overlay = document.getElementById('cartOverlay');
  if(drawer) drawer.classList.remove('open');
  if(overlay) overlay.classList.remove('show');
}
function renderCartDrawer(){
  const list = document.getElementById('cartItemsList');
  if(!list) return;
  const cart = getCart();
  if(!cart.length){
    list.innerHTML = '<div class="cart-empty">Your cart is empty. Add a piece from the portfolio!</div>';
    return;
  }
  list.innerHTML = cart.map(item=>`
    <div class="cart-item">
      <div class="cart-item-info">
        <strong>${item.title}</strong>
        <span>Code: ${item.code}${item.price ? ' · Rs. '+item.price : ''}</span>
      </div>
      <button class="cart-remove" data-code="${item.code}" aria-label="Remove">&times;</button>
    </div>`).join('');
  list.querySelectorAll('.cart-remove').forEach(btn=>{
    btn.addEventListener('click', ()=> removeFromCart(btn.dataset.code));
  });
}
function proceedToOrder(){
  closeCartDrawer();
  const onOrderPage = !!document.getElementById('orderForm');
  if(onOrderPage){
    fillOrderFormFromCart();
    const orderSection = document.getElementById('order');
    if(orderSection) orderSection.scrollIntoView({behavior:'smooth'});
  } else {
    window.location.href = 'index.html#order';
  }
}
function fillOrderFormFromCart(){
  const box = document.getElementById('selectedItemsBox');
  const hidden = document.getElementById('selectedItemsHidden');
  if(!box) return;
  const cart = getCart();
  if(!cart.length){
    box.innerHTML = '<p class="empty-cart-note">No items selected yet — browse the portfolio and add a piece, or describe your custom design below.</p>';
    if(hidden) hidden.value = '';
    return;
  }
  box.innerHTML = cart.map(item=>`<div class="selected-item">${item.title} — Code: ${item.code}${item.price ? ', Rs. '+item.price : ''}</div>`).join('');
  if(hidden) hidden.value = cart.map(i=>`${i.title} [${i.code}]`).join(', ');
}

// Lightbox
function openLightbox(src, alt){
  const lb = document.getElementById('lightbox');
  const img = document.getElementById('lightboxImg');
  if(!lb || !img || !src) return;
  img.src = src;
  img.alt = alt || '';
  lb.classList.add('show');
}
function closeLightbox(){
  const lb = document.getElementById('lightbox');
  if(lb) lb.classList.remove('show');
}

// Card template shared by homepage (featured) and full portfolio page
function cardTemplate(item){
  const priceHtml = item.price ? `<div class="price">Rs. ${item.price}</div>` : '';
  const safeTitle = (item.title || 'Untitled Piece').replace(/"/g,'&quot;');
  const photoHtml = item.imageUrl
    ? `<div class="card-photo" data-src="${item.imageUrl}" data-alt="${safeTitle}"><img src="${item.imageUrl}" alt="${safeTitle}" loading="lazy"></div>`
    : `<div class="card-photo"><span class="mono">ز</span><small>Photo coming soon</small></div>`;
  return `
    <div class="card">
      ${photoHtml}
      <div class="card-body">
        <h3>${safeTitle}</h3>
        ${priceHtml}
        <p>${item.description || ''}</p>
        <span class="code-tag">Code: ${item.code || '—'}</span>
        <button class="add-cart-btn" data-code="${item.code || ''}" data-title="${safeTitle}" data-price="${item.price || ''}">Add to Cart</button>
      </div>
    </div>`;
}

function bindCardEvents(container){
  if(!container) return;
  container.querySelectorAll('.card-photo[data-src]').forEach(el=>{
    el.addEventListener('click', ()=> openLightbox(el.dataset.src, el.dataset.alt));
  });
  container.querySelectorAll('.add-cart-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      if(!btn.dataset.code){ return; }
      const added = addToCart({code: btn.dataset.code, title: btn.dataset.title, price: btn.dataset.price});
      btn.textContent = added ? 'Added ✓' : 'Already in Cart';
      setTimeout(()=>{ btn.textContent = 'Add to Cart'; }, 1500);
    });
  });
}

document.addEventListener('DOMContentLoaded', ()=>{
  updateCartBadge();
  if(document.getElementById('selectedItemsBox')) fillOrderFormFromCart();

  const cartBtn = document.getElementById('cartBtn');
  if(cartBtn) cartBtn.addEventListener('click', openCartDrawer);
  const cartClose = document.getElementById('cartClose');
  if(cartClose) cartClose.addEventListener('click', closeCartDrawer);
  const cartOverlay = document.getElementById('cartOverlay');
  if(cartOverlay) cartOverlay.addEventListener('click', closeCartDrawer);
  const cartProceedBtn = document.getElementById('cartProceedBtn');
  if(cartProceedBtn) cartProceedBtn.addEventListener('click', proceedToOrder);

  const lightboxClose = document.getElementById('lightboxClose');
  if(lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  const lightbox = document.getElementById('lightbox');
  if(lightbox) lightbox.addEventListener('click', (e)=>{ if(e.target === lightbox) closeLightbox(); });
});
