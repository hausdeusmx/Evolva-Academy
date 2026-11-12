import {useEffect,useState} from 'react';
import {Bell,BellOff,LoaderCircle,RefreshCw} from 'lucide-react';
import {portalAPI} from './portal-api';
import {browserPushSupported,nativeCampus,needsHomeScreen,pushPublicKey,stopBrowserPush} from './push-browser';
import './push.css';
export default function PushPreferences(){
 const[state,setState]=useState<{loading:boolean;ready:boolean;registered:boolean;key:string;registration?:ServiceWorkerRegistration}>({loading:true,ready:false,registered:false,key:''});
 const[busy,setBusy]=useState(false),[error,setError]=useState(''),[message,setMessage]=useState(''),[revision,setRevision]=useState(0);
 const supported=browserPushSupported(),homeScreen=needsHomeScreen(),demo=!window.EVOLVA_CONFIG?.API_URL&&window.EVOLVA_CONFIG?.DEMO_MODE;
 useEffect(()=>{let active=true;async function init(){
  if(!supported||homeScreen||demo){setState({loading:false,ready:false,registered:false,key:''});return;}
  setError('');setState(s=>({...s,loading:true}));try{
   const health=await portalAPI('health');if(!health.features?.includes('web_push')){if(active)setState({loading:false,ready:false,registered:false,key:''});return;}
   const registration=await navigator.serviceWorker.register(new URL('./push-sw.js',document.baseURI||location.href),{scope:new URL('./',document.baseURI||location.href).pathname});await navigator.serviceWorker.ready;
   let subscription=await registration.pushManager.getSubscription();const status=await portalAPI('push_status',{endpoint:subscription?.endpoint});
   if(subscription&&!status.registered){await subscription.unsubscribe();subscription=null;}
   if(active)setState({loading:false,ready:true,registered:!!subscription&&status.registered,key:status.publicKey,registration});
  }catch(e:any){if(active){setError(e.message);setState(s=>({...s,loading:false,ready:false}));}}
 }init();return()=>{active=false;};},[revision,supported,homeScreen,demo]);
 async function enable(){
  if(!state.registration||!state.key||busy)return;setBusy(true);setError('');setMessage('');
  // Keep the subscription request directly inside the user gesture for Safari.
  const pending=state.registration.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:pushPublicKey(state.key)});let subscription:PushSubscription|undefined;
  try{subscription=await pending;await portalAPI('push_register',{endpoint:subscription.endpoint});setState(s=>({...s,registered:true}));setMessage('Notificaciones activadas para tu cuenta en este navegador.');}
  catch(e:any){if(subscription)await subscription.unsubscribe().catch(()=>{});setError(Notification.permission==='denied'?'El navegador bloqueó las notificaciones. Puedes permitirlas desde los ajustes de este sitio.':e.message||'No se pudieron activar las notificaciones.');}finally{setBusy(false);}
 }
 async function disable(){setBusy(true);setError('');setMessage('');try{await stopBrowserPush();setMessage('Notificaciones desactivadas en este navegador.');}catch(e:any){setError(e.message);}finally{setState(s=>({...s,registered:false}));setBusy(false);}}
 if(nativeCampus())return null;
 return <section className="panel wp-preferences"><div className="wp-heading"><span className="small-icon"><Bell size={22}/></span><div><h3>Notificaciones del navegador</h3><p>Recibe una alerta cuando administración publique un aviso para ti. El detalle se consulta dentro de tu cuenta.</p></div><span className={'badge '+(state.registered?'green':'neutral')}>{state.registered?'Activadas':'Opcionales'}</span></div>
 {homeScreen?<p className="wp-help">En iPhone o iPad, abre el campus en Safari, elige Compartir → Agregar a inicio y activa las notificaciones desde ese acceso web.</p>:!supported?<p className="wp-help">Este navegador no admite notificaciones web. Puedes consultar todos los avisos aquí en el campus.</p>:demo?<p className="wp-help">Las notificaciones se activan con una cuenta real. Este entorno usa datos ficticios.</p>:state.loading?<p className="wp-status"><LoaderCircle className="spin" size={16}/> Comprobando disponibilidad…</p>:state.ready?<div className="wp-controls"><button className={'btn '+(state.registered?'neutral':'primary')} disabled={busy} onClick={state.registered?disable:enable}>{busy?<LoaderCircle className="spin" size={16}/>:state.registered?<BellOff size={16}/>:<Bell size={16}/>} {state.registered?'Desactivar en este navegador':'Activar notificaciones'}</button><small>Puedes desactivarlas aquí. Al cerrar sesión también se desactiva la suscripción de este navegador.</small></div>:<div className="wp-controls"><p className="wp-help">La administración está preparando las notificaciones web.</p><button className="textbtn" disabled={busy} onClick={()=>setRevision(x=>x+1)}><RefreshCw size={15}/> Comprobar de nuevo</button></div>}
 {error&&<p className="error" role="alert">{error}</p>}{message&&<p className="wp-success" role="status">{message}</p>}</section>;
}
