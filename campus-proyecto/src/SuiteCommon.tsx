import {useEffect,useState,type ReactNode} from 'react';
import {RefreshCw,Layers} from 'lucide-react';
import {portalAPI} from './portal-api';
import {adminAPI} from './admin-api';
import './suite.css';
export const suiteDate=(s:string)=>s?new Date(s).toLocaleString('es-MX',{dateStyle:'medium',timeStyle:'short'}):'—';
export const suiteMoney=(n:number)=>new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN'}).format(n);
export function SuiteGate({feature,admin=false,children}:{feature:string;admin?:boolean;children:ReactNode}){
 const[ready,setReady]=useState(false),[loading,setLoading]=useState(true),[error,setError]=useState('');
 async function check(){setLoading(true);try{const r=await (admin?adminAPI:portalAPI)('health');setReady(!!r.features?.includes(feature));setError('');}catch(e:any){setError(e.message);}finally{setLoading(false);}}
 useEffect(()=>{check();const refresh=()=>{if(document.visibilityState!=='hidden')check();};window.addEventListener('focus',refresh);return()=>window.removeEventListener('focus',refresh);},[feature,admin]);
 if(!ready)return <section className="panel su-pending"><Layers size={34}/><h2>{loading?'Consultando disponibilidad…':'Este servicio está listo para activar.'}</h2><p>{error||(admin?'Activa la actualización de la conexión del campus para utilizar los nuevos servicios escolares.':'Administración está preparando este nuevo servicio para tu cuenta.')}</p><button className="btn secondary" disabled={loading} onClick={check}><RefreshCw size={16}/> Revisar disponibilidad</button></section>;
 return <>{children}</>;
}
export function SuiteEmpty({title,children}:{title:string;children?:ReactNode}){return <div className="panel su-empty"><Layers size={34}/><h2>{title}</h2><p>{children}</p></div>;}
export function SuiteFeedback({error,message}:{error?:string;message?:string}){return <>{error&&<p className="error" role="alert">{error}</p>}{message&&<p className="su-success" role="status">{message}</p>}</>;}
