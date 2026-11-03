import {baseGrades,exams,summary,demoStudent} from './domain';
const key='evolva-pages::demo-records';
export function demoRecords():Record<string,any>{try{return JSON.parse(localStorage.getItem(key)||sessionStorage.getItem(key)||'{}');}catch{return {};}}
export function saveDemoRecords(value:Record<string,any>){localStorage.setItem(key,JSON.stringify(value));}
export function demoLearners(){const records=demoRecords();return [demoStudent(false),demoStudent(true)].map(s=>({...s,phone:records[s.folio]?.phone??s.phone}));}
export function demoAcademic(student:any){
 const record=demoRecords()[student.folio]||{attempts:{},payments:[],read:[]};
 const overrides=record.gradeOverrides||{},grades:any[]=baseGrades(student.graduate).map(g=>({...g}));
 for(const grade of grades){const exam=exams.find(e=>e.module===grade.module);if(exam&&record.attempts?.[exam.id]!==undefined){grade.score=record.attempts[exam.id];grade.status='Evaluado';}if(overrides[grade.id])Object.assign(grade,overrides[grade.id]);}
 for(const [id,grade] of Object.entries(overrides)){if(!grades.some(g=>g.id===id))grades.push({id,...grade as any});}
 const assigned=record.assignedExams||[];
 const list=[...exams.map((e,i)=>({id:e.id,title:e.title,module:e.module,duration:e.duration,count:e.questions.length,score:grades.find(g=>g.module===e.module)?.score??null,locked:i===1&&grades[2].score===null})),...assigned.map((e:any)=>({...e,score:grades.find(g=>g.id===e.id)?.score??null,locked:false}))];
 return {record,grades,exams:list,...summary(grades,grades.length)};
}
export function demoRevision(g:any){return JSON.stringify([g.id,g.module,g.title,g.score,g.status]);}
