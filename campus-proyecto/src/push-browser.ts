import {portalAPI} from './portal-api';
export const nativeCampus=()=>/EvolvaCampus\//i.test(navigator.userAgent);
export const browserPushSupported=()=>!nativeCampus()&&window.isSecureContext&&'serviceWorker'in navigator&&'PushManager'in window&&'Notification'in window;
export const needsHomeScreen=()=>/iPhone|iPad|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1)?!window.matchMedia('(display-mode: standalone)').matches&&!(navigator as any).standalone:false;
export function pushPublicKey(value:string){return Uint8Array.from(atob(value.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));}
export async function stopBrowserPush(){
 if(!browserPushSupported())return;
 const registration=await navigator.serviceWorker.getRegistration(new URL('./push-sw.js',location.href));
 if(!registration||new URL(registration.scope).pathname!==new URL('./',location.href).pathname)return;
 const subscription=await registration.pushManager.getSubscription();if(!subscription)return;
 try{await portalAPI('push_unregister',{endpoint:subscription.endpoint});}finally{await subscription.unsubscribe();}
}
