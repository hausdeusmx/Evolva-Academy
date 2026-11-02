// The active account comes from the authenticated dashboard, never public config.
// AVISOS is the existing private, campus-wide data channel supported by API v6.
export const PAYMENT_ACCOUNT_ID='EVOLVA-PAGOS-CUENTA';
export type PaymentAccount={account:string;bank:string;beneficiary:string;clabe:string};
function validClabe(value:string){
  if(!/^\d{18}$/.test(value))return false;
  const sum=[...value.slice(0,17)].reduce((total,digit,i)=>total+(Number(digit)*[3,7,1][i%3])%10,0);
  return String((10-sum%10)%10)===value[17];
}
export function paymentDashboard(d:any){
  const notices=Array.isArray(d.notices)?d.notices:[];
  const rows=notices.filter((n:any)=>n.id===PAYMENT_ACCOUNT_ID);
  let paymentAccount:PaymentAccount|null=null;
  // Ambiguous or incomplete settings must not produce transfer instructions.
  if(rows.length===1){
    const fields=new Map<string,string>();
    let duplicate=false;
    for(const line of String(rows[0].body||'').split(/\r?\n/)){
      const colon=line.indexOf(':');if(colon<0)continue;
      const key=line.slice(0,colon).trim().toLowerCase(),value=line.slice(colon+1).trim();
      if(fields.has(key))duplicate=true;
      fields.set(key,value);
    }
    const account=fields.get('cuenta')||'',bank=fields.get('banco receptor')||'',beneficiary=fields.get('beneficiario')||'',clabe=(fields.get('clabe')||'').replace(/\s/g,'');
    if(!duplicate&&account&&bank&&beneficiary&&validClabe(clabe))paymentAccount={account,bank,beneficiary,clabe};
  }
  return {...d,paymentAccount,notices:notices.filter((n:any)=>n.id!==PAYMENT_ACCOUNT_ID)};
}
