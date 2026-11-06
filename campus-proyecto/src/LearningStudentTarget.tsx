import {useEffect,useState} from 'react';
import {adminAPI} from './admin-api';
import {studentMatricula} from './student-identity';
export default function LearningStudentTarget({value,onChange,disabled=false}:{value:string;onChange:(v:string)=>void;disabled?:boolean}){
 const[query,setQuery]=useState(''),[students,setStudents]=useState<any[]>([]),[error,setError]=useState('');
 useEffect(()=>{let live=true;const timer=setTimeout(()=>{adminAPI('admin_students',{query,offset:0}).then(r=>{if(live){setStudents(r.students);setError('');}}).catch(e=>{if(live)setError(e.message);});},250);return()=>{live=false;clearTimeout(timer);};},[query]);
 return <div><label>Buscar alumno<input disabled={disabled} placeholder="Nombre, matrícula o curso" value={query} onChange={e=>{setQuery(e.target.value);onChange('');}}/></label><label>Alumno y curso<select required disabled={disabled} value={value} onChange={e=>onChange(e.target.value)}><option value="">Selecciona alumno y curso</option>{value&&!students.some(s=>s.folio===value)&&<option value={value}>Alumno seleccionado · confirma el curso</option>}{students.map(s=><option value={s.folio} key={s.folio}>{s.name} · {studentMatricula(s)} · {s.course}</option>)}</select></label>{error&&<small role="alert">{error}</small>}</div>;
}
