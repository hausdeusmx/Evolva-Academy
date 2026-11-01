const toggle=document.getElementById('ea-menu');
const navigation=document.getElementById('ea-nav');
toggle?.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(open));navigation?.classList.toggle('ea-open',open);});
document.addEventListener('keydown',event=>{if(event.key==='Escape'){toggle?.setAttribute('aria-expanded','false');navigation?.classList.remove('ea-open');}});
document.querySelectorAll('[data-year]').forEach(element=>{element.textContent=String(new Date().getFullYear());});
