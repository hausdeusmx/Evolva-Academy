import {institutionalCampusEmail} from './credential-contact';

export type MailAccessNotice={folio:string;email:string;revision:string;key:string};
export function mailAccessNotice(dashboard:any):MailAccessNotice|null{
 const folio=String(dashboard?.student?.folio||'').trim().toUpperCase(),mail=dashboard?.mailAccess,email=institutionalCampusEmail(folio);
 if(!email||mail?.available!==true||mail.status!=='PENDIENTE'||mail.folio!==folio||String(mail.email||'').trim().toLowerCase()!==email)return null;
 const revision=String(mail.revision||'');if(!/^[A-Za-z0-9._:-]{1,128}$/.test(revision))return null;
 return {folio,email,revision,key:'evolva-campus:mail-notice:'+folio+':'+revision};
}
