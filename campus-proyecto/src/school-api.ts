import {adminAPI} from './admin-api';
import {isTeacherExperience,teacherRequest} from './teacher-api';
export const staffAPI=(action:string,body:any={})=>isTeacherExperience?teacherRequest(action,body):adminAPI(action,body);
export const localInput=(s:string)=>s?s.slice(0,16):'';
export const schoolDate=(s:string)=>s?new Intl.DateTimeFormat('es-MX',{timeZone:'America/Ciudad_Juarez',dateStyle:'medium',timeStyle:'short'}).format(new Date(s)):'Por confirmar';
