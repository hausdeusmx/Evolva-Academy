export function createCarouselController({count,intervalMs=35000,setTimer=setTimeout,clearTimer=clearTimeout,render,onState=()=>{}}){
 if(!Number.isInteger(count)||count<1)throw Error('El carrusel necesita imágenes.');
 let current=0,timer=null,stopped=false,paused=false,hovered=false,focused=false,hidden=false;
 function cancel(){if(timer!==null){clearTimer(timer);timer=null;}}
 function schedule(){cancel();const playing=!stopped&&!paused&&!hovered&&!focused&&!hidden&&count>1;onState({paused:!playing,manualPaused:paused,index:current});if(playing)timer=setTimer(()=>{timer=null;show(current+1,false);},intervalMs);}
 function show(index,manual=true){if(stopped)return;current=((index%count)+count)%count;render(current,{manual});schedule();}
 const api={show,next:()=>show(current+1),previous:()=>show(current-1),pause(){paused=true;schedule();},play(){paused=false;focused=false;schedule();},hover(value){hovered=value;schedule();},focus(){focused=true;schedule();},visibility(value){hidden=value;schedule();},destroy(){stopped=true;cancel();},get index(){return current;}};
 render(current,{manual:false});schedule();return api;
}

export function mountHomeCarousel(root,documentRef=document,windowRef=window){
 const slides=[...root.querySelectorAll('[data-carousel-slide]')],dots=[...root.querySelectorAll('[data-carousel-dot]')],controls=root.querySelector('[data-carousel-controls]'),counter=root.querySelector('[data-carousel-status]'),toggle=root.querySelector('[data-carousel-toggle]');
 if(!slides.length||!controls||!toggle||!counter)return;
 const motion=windowRef.matchMedia('(prefers-reduced-motion: reduce)');let suspended=false;
 const carousel=createCarouselController({count:slides.length,intervalMs:35000,render(index,{manual}){slides.forEach((slide,i)=>{slide.hidden=i!==index;slide.inert=i!==index;});dots.forEach((dot,i)=>dot.setAttribute('aria-pressed',String(i===index)));counter.setAttribute('aria-live',manual?'polite':'off');counter.textContent=`${index+1} / ${slides.length}`;root.dataset.activeSlide=String(index);},onState({paused,manualPaused}){suspended=manualPaused;toggle.textContent=manualPaused?'Reanudar':'Pausar';toggle.setAttribute('aria-label',manualPaused?'Reanudar cambio automático de imágenes':'Pausar cambio automático de imágenes');root.dataset.rotation=paused?'paused':'playing';}});
 controls.hidden=false;if(motion.matches)carousel.pause();if(documentRef.hidden)carousel.visibility(true);
 root.querySelector('[data-carousel-previous]')?.addEventListener('click',()=>{carousel.pause();carousel.previous();});root.querySelector('[data-carousel-next]')?.addEventListener('click',()=>{carousel.pause();carousel.next();});dots.forEach((dot,i)=>dot.addEventListener('click',()=>{carousel.pause();carousel.show(i);}));
 toggle.addEventListener('click',()=>suspended?carousel.play():carousel.pause());
 root.addEventListener('pointerenter',event=>{if(event.pointerType==='mouse')carousel.hover(true);});root.addEventListener('pointerleave',event=>{if(event.pointerType==='mouse')carousel.hover(false);});root.addEventListener('focusin',event=>event.target===toggle?carousel.focus():carousel.pause());
 root.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight'].includes(event.key)||['INPUT','SELECT','TEXTAREA'].includes(event.target.tagName))return;event.preventDefault();carousel.pause();event.key==='ArrowRight'?carousel.next():carousel.previous();});
 const visibility=()=>carousel.visibility(documentRef.hidden),reduced=event=>{if(event.matches)carousel.pause();};documentRef.addEventListener('visibilitychange',visibility);motion.addEventListener('change',reduced);
 windowRef.addEventListener('pagehide',()=>{carousel.destroy();documentRef.removeEventListener('visibilitychange',visibility);motion.removeEventListener('change',reduced);},{once:true});return carousel;
}
if(typeof document!=='undefined')document.querySelectorAll('[data-home-carousel]').forEach(root=>mountHomeCarousel(root));
