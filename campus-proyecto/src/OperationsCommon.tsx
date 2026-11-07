import {useState} from 'react';
import {adminAPI} from './admin-api';
import {portalAPI} from './portal-api';
import {SuiteFeedback} from './SuiteCommon';
import './operations.css';
export function useOperations(admin=true){const[busy,setBusy]=useState(false),[error,setError]=useState(''),[message,setMessage]=useState('');async function call(action:string,body:any={},success=''){setBusy(true);setError('');setMessage('');try{const r=await (admin?adminAPI:portalAPI)(action,body);if(success)setMessage(success);return r;}catch(e:any){setError(e.message||'No se pudo completar la solicitud.');return null;}finally{setBusy(false);}}return {busy,error,message,call,feedback:<SuiteFeedback error={error} message={message}/>};}
export function OperationsIntro({label,title,children}:{label:string;title:string;children?:any}){return <div className="op-intro"><span className="eyebrow">{label}</span><h2>{title}</h2>{children&&<p>{children}</p>}</div>;}
export function OperationsPages({offset,total,busy,onPage}:{offset:number;total:number;busy:boolean;onPage:(n:number)=>void}){return total>40?<div className="op-pages"><button className="btn secondary" disabled={busy||offset===0} onClick={()=>onPage(Math.max(0,offset-40))}>Anterior</button><span>{offset+1}–{Math.min(offset+40,total)} de {total}</span><button className="btn secondary" disabled={busy||offset+40>=total} onClick={()=>onPage(offset+40)}>Siguiente</button></div>:null;}
export function csvCell(value:any){const s=String(value??'');return '"'+(/^[\s]*[=+@-]/.test(s)?"'"+s:s).replace(/"/g,'""')+'"';}
