import {useState} from 'react';
import {Landmark,Copy,Check,ShieldCheck} from 'lucide-react';
import type {PaymentAccount} from './payment-settings';
import './transfer.css';

export default function TransferAccount({account,folio}:{account:PaymentAccount|null;folio:string}){
  const [copied,setCopied]=useState(''),[error,setError]=useState('');
  async function copy(label:string,value:string){
    setError('');setCopied('');
    try{await navigator.clipboard.writeText(value);setCopied(label);}
    catch{setError('No se pudo copiar. Selecciona el dato y cópialo manualmente.');}
  }
  if(!account)return <section className="panel transfer-account"><div className="transfer-heading"><span className="small-icon"><Landmark size={24}/></span><div><h3>Pago por transferencia</h3><p>Solicita los datos bancarios vigentes a administración.</p></div></div></section>;
  const fields=[{label:'Cuenta',value:account.account},{label:'Banco receptor',value:account.bank},{label:'Beneficiario',value:account.beneficiary,copy:true},{label:'CLABE interbancaria',value:account.clabe,copy:true,mono:true}];
  return <section className="panel transfer-account" aria-labelledby="transfer-title">
    <div className="transfer-heading"><span className="small-icon"><Landmark size={24}/></span><div><span className="eyebrow">TRANSFERENCIA EN MXN</span><h3 id="transfer-title">Datos para realizar tu pago</h3><p>Usa estos datos en tu aplicación bancaria.</p></div></div>
    <dl className="transfer-fields">{fields.map(f=><div key={f.label} className={f.mono?'transfer-clabe':''}><dt>{f.label}</dt><dd><span className={f.mono?'transfer-number':''}>{f.value}</span>{f.copy&&<button className="btn secondary" onClick={()=>copy(f.label,f.value)} aria-label={'Copiar '+f.label.toLowerCase()}>{copied===f.label?<Check size={16}/>:<Copy size={16}/>}<span>{copied===f.label?'Copiado':'Copiar'}</span></button>}</dd></div>)}</dl>
    <div className="transfer-concept"><div><b>Concepto sugerido: tu matrícula</b><span>{folio}</span></div><button className="btn secondary" onClick={()=>copy('Matrícula',folio)} aria-label="Copiar matrícula como concepto">{copied==='Folio'?<Check size={16}/>:<Copy size={16}/>} {copied==='Folio'?'Copiado':'Copiar matrícula'}</button></div>
    <div className="transfer-feedback" role="status" aria-live="polite">{error|| (copied?copied+' copiado.':'')}</div>
    <p className="transfer-next"><ShieldCheck size={17}/><span>Después de transferir, selecciona <b>Registrar comprobante</b> y adjunta tu recibo. El pago quedará en revisión hasta que administración lo confirme.</span></p>
  </section>;
}
