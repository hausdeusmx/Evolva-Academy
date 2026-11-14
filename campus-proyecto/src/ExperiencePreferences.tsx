import {useEffect,useState} from 'react';
import {Moon,Sun,Type} from 'lucide-react';
import './experience-v35.css';
type Pref={theme:'light'|'dark'|'system';size:'normal'|'large'};
const key='evolva-appearance-v35';
function initial():Pref{try{const p=JSON.parse(localStorage.getItem(key)||'{}');return {theme:['light','dark','system'].includes(p.theme)?p.theme:'system',size:p.size==='large'?'large':'normal'};}catch{return {theme:'system',size:'normal'};}}
export function ExperiencePreferences(){const[p,setP]=useState(initial),[open,setOpen]=useState(false);
 useEffect(()=>{const media=matchMedia('(prefers-color-scheme: dark)'),apply=()=>{document.documentElement.dataset.evolvaTheme=p.theme==='system'?(media.matches?'dark':'light'):p.theme;document.documentElement.dataset.evolvaText=p.size;};apply();try{localStorage.setItem(key,JSON.stringify(p));}catch{}media.addEventListener('change',apply);return()=>media.removeEventListener('change',apply);},[p]);
 return <div className="v35-appearance"><button type="button" className="btn secondary" aria-expanded={open} onClick={()=>setOpen(!open)}><Type size={16}/> Apariencia</button>{open&&<div className="v35-preferences"><label><Moon size={16}/> Tema<select value={p.theme} onChange={e=>setP({...p,theme:e.target.value as Pref['theme']})}><option value="system">Según mi dispositivo</option><option value="light">Claro</option><option value="dark">Oscuro</option></select></label><label><Sun size={16}/> Tamaño del texto<select value={p.size} onChange={e=>setP({...p,size:e.target.value as Pref['size']})}><option value="normal">Normal</option><option value="large">Grande</option></select></label></div>}</div>;
}
