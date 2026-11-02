import {useCallback,useEffect,useRef,useState} from 'react';
import {BookOpen,RefreshCw} from 'lucide-react';
import {portalAPI} from './portal-api';
export function useLearning(feature:string){
 const[state,setState]=useState({ready:false,loading:true,error:''}),running=useRef(false);
 const refresh=useCallback(async()=>{if(running.current)return;running.current=true;try{const d=await portalAPI('health');setState({ready:!!d.features?.includes(feature),loading:false,error:''});}catch(e:any){setState({ready:false,loading:false,error:e.message});}finally{running.current=false;}},[feature]);
 useEffect(()=>{refresh();const update=()=>{if(document.visibilityState!=='hidden')refresh();},timer=setInterval(update,30000);window.addEventListener('focus',update);return()=>{clearInterval(timer);window.removeEventListener('focus',update);};},[refresh]);
 return {...state,refresh};
}
export function LearningPending({state,admin=false}:{state:ReturnType<typeof useLearning>;admin?:boolean}){return <section className="panel learn-empty"><BookOpen size={34}/><h2>{state.loading?'Preparando este espacio…':admin?'Actualización lista para activar':'Este espacio está en preparación.'}</h2><p>{state.error||(admin?'Activa la actualización de la conexión del campus para publicar clases y eventos.':'La administración está preparando las clases y el calendario de tu curso.')}</p><button className="btn secondary" onClick={state.refresh}><RefreshCw size={16}/> Revisar disponibilidad</button></section>;}
