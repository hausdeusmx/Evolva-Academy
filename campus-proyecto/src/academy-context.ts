import {isAppExperience} from './app-experience';
const key='evolva-course:'+String(window.EVOLVA_CONFIG?.API_URL||'demo');
const storage=()=>isAppExperience?localStorage:sessionStorage;
export const activeEnrollment=()=>storage().getItem(key)||'';
export function selectEnrollment(folio:string){if(folio&&!/^EVOLVA-\d{6}$/.test(folio))throw Error('Matrícula de curso no válida.');if(folio)storage().setItem(key,folio);else storage().removeItem(key);}
