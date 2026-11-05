import {useEffect,useRef,useState} from 'react';
import {ArrowUpRight,KeyRound,MailCheck} from 'lucide-react';
import {mailAccessNotice,type MailAccessNotice} from './mail-notice';

export function useMailAnnouncement(dashboard:any,blocked:boolean){
 const notice=mailAccessNotice(dashboard),[open,setOpen]=useState(false),seen=useRef(new Set<string>());
 useEffect(()=>{if(!notice||blocked){setOpen(false);return;}let acknowledged=seen.current.has(notice.key);try{acknowledged=acknowledged||sessionStorage.getItem(notice.key)==='seen';}catch{}setOpen(!acknowledged);},[notice?.key,blocked]);
 function dismiss(){if(notice){seen.current.add(notice.key);try{sessionStorage.setItem(notice.key,'seen');}catch{}}setOpen(false);}
 return {notice,open,dismiss};
}
export function StudentMailBanner({notice,onOpen}:{notice:MailAccessNotice;onOpen:()=>void}){
 return <section className="mail-availability-banner" aria-label="Acceso al correo institucional disponible"><span className="mail-ready-icon"><MailCheck size={26}/></span><div><span className="eyebrow">TU CORREO INSTITUCIONAL</span><h3>Tu contraseña del correo ya está disponible.</h3><p>{notice.email} · Acceso listo para consultar.</p></div><a className="btn primary" href="../correos.html" target="_blank" rel="noopener noreferrer" onClick={onOpen}>Consultar contraseña <ArrowUpRight size={17}/></a></section>;
}
export function StudentMailPrompt({notice,onDismiss}:{notice:MailAccessNotice;onDismiss:()=>void}){
 return <div className="mail-ready-prompt"><span className="mail-ready-art"><KeyRound size={36}/></span><span className="eyebrow">YA PUEDES CONSULTAR TU ACCESO</span><h3>¡La contraseña de tu correo ya está disponible!</h3><p>Administración registró el acceso inicial de tu correo institucional.</p><div className="mail-ready-address"><MailCheck size={20}/><strong>{notice.email}</strong></div><p>Ten a la mano tu CURP y matrícula para consultar la contraseña en la página de entrega.</p><a className="btn primary full" href="../correos.html" target="_blank" rel="noopener noreferrer" onClick={onDismiss}>Consultar mi contraseña <ArrowUpRight size={17}/></a><button className="btn secondary full" onClick={onDismiss}>Más tarde</button><small>La contraseña para entrar al campus se conserva.</small></div>;
}
