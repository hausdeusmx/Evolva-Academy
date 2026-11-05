import {useEffect,useState} from 'react';
type Capabilities={profileReady?:boolean;contactReady?:boolean;ready:boolean;demo:boolean;loading:boolean;error:string};
let cached:Promise<Capabilities>|null=null,checked=0;
export async function academicCapabilities(force=false):Promise<Capabilities>{
 const config=window.EVOLVA_CONFIG||{};
 if(!config.API_URL&&config.DEMO_MODE===true)return {profileReady:true,contactReady:true,ready:true,demo:true,loading:false,error:''};
 if(cached&&!force&&Date.now()-checked<10000)return cached;
 checked=Date.now();cached=(async()=>{try{const response=await fetch(String(config.API_URL||''),{method:'POST',credentials:'omit',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action:'health'}),signal:AbortSignal.timeout(25000)}),d=await response.json();return {profileReady:!!d.ok&&d.version>=13&&d.features?.includes('student_profile'),contactReady:!!d.ok&&d.version>=12&&d.features?.includes('student_contact'),ready:!!d.ok&&d.version>=5&&['documents','credential','tasks'].every(x=>d.features?.includes(x)),demo:false,loading:false,error:''};}catch{return {ready:false,demo:false,loading:false,error:'No pudimos comprobar la disponibilidad. Vuelve a intentarlo.'};}})();return cached;
}
export function useAcademics(){
 const[state,setState]=useState<Capabilities>({ready:false,demo:false,loading:true,error:''});
 useEffect(()=>{let active=true;const update=()=>academicCapabilities(true).then(d=>{if(active)setState(d);});update();const timer=setInterval(update,30000);return()=>{active=false;clearInterval(timer);};},[]);
 return {...state,refresh:async()=>setState(await academicCapabilities(true))};
}
