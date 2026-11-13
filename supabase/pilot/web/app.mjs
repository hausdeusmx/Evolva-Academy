import {createTrialClient} from './client.mjs';
import {config} from './config.mjs';
const client = createTrialClient(config);
const $ = id => document.getElementById(id);
let current = null, viewVersion = 0;
const money = value => new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN',maximumFractionDigits:2}).format(Number(value));
const date = value => /^\d{4}-\d{2}-\d{2}$/.test(value || '') ? new Intl.DateTimeFormat('es-MX',{day:'numeric',month:'short',year:'numeric'}).format(new Date(value+'T12:00:00')) : 'Sin fecha';
const labels = {scheduled:'Programado',paid:'Pagado',cancelled:'Cancelado',in_review:'En revisión',approved:'Aprobado',rejected:'Rechazado'};
function message(id,text='') { $(id).textContent=text; $(id).hidden=!text; }
function cell(text) { const td=document.createElement('td');td.textContent=String(text);return td; }
function row(values) {const tr=document.createElement('tr');values.forEach(v=>tr.append(cell(v)));return tr;}
function emptyRow(text,count) {const tr=row([text]);tr.firstChild.colSpan=count;return tr;}
function selectSection(name) {
  document.querySelectorAll('[data-panel]').forEach(p=>p.hidden=p.dataset.panel!==name);
  document.querySelectorAll('[data-section]').forEach(b=>{const active=b.dataset.section===name;b.classList.toggle('active',active);if(active)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
  $('section-name').textContent={overview:'Mi resumen',grades:'Calificaciones',payments:'Mis pagos',account:'Mi cuenta'}[name];
}
function hideCampus() {
  current=null; $('campus-view').hidden=true;$('login-view').hidden=false;
  for(const id of ['sidebar-name','sidebar-matricula','greeting','course-tag','progress','average','next-amount','next-date','course-title','overview-matricula','group','access-title','access-description']) $(id).textContent='';
  for(const id of ['grade-rows','payment-rows','submission-list','account-details']) $(id).replaceChildren();
  message('campus-error');message('status-message');
}
function render(data) {
  current=data;const s=data.student;
  $('sidebar-name').textContent=s.name;$('sidebar-matricula').textContent=s.matricula;
  $('greeting').textContent='Hola, '+s.name+'.';$('course-tag').textContent=s.group;
  const progress=Math.max(0,Math.min(100,Number(data.progress)||0));$('progress').textContent=progress+'%';$('progress-bar').style.width=progress+'%';
  $('average').textContent=data.average===null?'Pendiente':Number(data.average).toFixed(1);
  const upcoming=(data.paymentCalendar||[]).filter(p=>p.status==='scheduled').sort((a,b)=>a.dueDate.localeCompare(b.dueDate))[0];
  $('next-amount').textContent=upcoming?money(upcoming.amount):'Sin pendientes';$('next-date').textContent=upcoming?date(upcoming.dueDate):'Calendario al día';
  $('course-title').textContent=s.course;$('overview-matricula').textContent=s.matricula;$('group').textContent=s.group;
  $('access-title').textContent=data.academicAccess?.blocked?'Pago en revisión':'Cuenta de prueba activa';
  $('access-description').textContent=data.academicAccess?.blocked?'Tu comprobante simulado está pendiente de revisión. Este estado se consulta desde la base de datos.':'Tu información está disponible para consultar en este entorno de prueba.';
  $('grade-rows').replaceChildren(...((data.grades||[]).length?data.grades.map(g=>row([g.title,Number(g.score).toFixed(1)+' / 10'])):[emptyRow('Aún no hay calificaciones.',2)]));
  $('payment-rows').replaceChildren(...((data.paymentCalendar||[]).length?data.paymentCalendar.map(p=>row([p.period,date(p.dueDate),money(p.amount),labels[p.status]||p.status])):[emptyRow('No hay cuotas configuradas.',4)]));
  const payments=data.payments||[];
  $('submission-list').replaceChildren(...(payments.length?payments.map(p=>{const article=document.createElement('article');article.className='card submission';const ref=document.createElement('strong');ref.textContent=p.reference;const detail=document.createElement('span');detail.textContent=money(p.amount)+' · '+(labels[p.status]||p.status);article.append(ref,detail);return article;}):[Object.assign(document.createElement('p'),{className:'muted',textContent:'No hay comprobantes registrados.'})]));
  const details=[];
  for(const [title,value] of [['Nombre',s.name],['Matrícula',s.matricula],['Correo institucional',s.institutional],['Correo personal',s.email||'Sin registrar'],['Curso',s.course],['Grupo',s.group]]) {const div=document.createElement('div');const dt=document.createElement('dt');dt.textContent=title;const dd=document.createElement('dd');dd.textContent=value;div.append(dt,dd);details.push(div);}
  $('account-details').replaceChildren(...details);
  $('login-view').hidden=true;$('campus-view').hidden=false;message('login-error');
}
$('show-password').addEventListener('click',()=>{const show=$('password').type==='password';$('password').type=show?'text':'password';$('show-password').textContent=show?'Ocultar':'Mostrar';$('show-password').setAttribute('aria-pressed',String(show));$('show-password').setAttribute('aria-label',show?'Ocultar contraseña':'Mostrar contraseña');});
$('login-form').addEventListener('submit',async event=>{
  event.preventDefault();const version=++viewVersion;const button=$('login-submit');button.disabled=true;button.textContent='Iniciando sesión…';message('login-error');
  const password=$('password').value;$('password').value='';
  try {const data=await client.login($('email').value,password);if(version===viewVersion){selectSection('overview');render(data);}}
  catch(error) {if(version===viewVersion)message('login-error',error.message);}
  finally {if(version===viewVersion){button.disabled=false;button.textContent='Entrar al campus';}}
});
document.querySelectorAll('[data-section]').forEach(b=>b.addEventListener('click',()=>selectSection(b.dataset.section)));
$('refresh').addEventListener('click',async()=>{
  const version=viewVersion;$('refresh').disabled=true;message('campus-error');message('status-message','Actualizando tu información…');
  try {const data=await client.dashboard(current?.enrollmentId||null);if(version===viewVersion){render(data);message('status-message','Información actualizada.');}}
  catch(error){if(version===viewVersion){if(!client.hasSession()){hideCampus();message('login-error',error.message);}else message('campus-error',error.message);}}
  finally {if(version===viewVersion){$('refresh').disabled=false;message('status-message');}}
});
$('logout').addEventListener('click',async()=>{++viewVersion;hideCampus();$('refresh').disabled=false;$('login-submit').disabled=false;$('login-submit').textContent='Entrar al campus';try{await client.logout();}catch(error){message('login-error',error.message);}});
if(client.hasSession()) {
  const version=viewVersion;$('login-submit').disabled=true;$('login-submit').textContent='Recuperando sesión…';
  try {const data=await client.dashboard();if(version===viewVersion)render(data);}
  catch(error){if(version===viewVersion){hideCampus();message('login-error',error.message);}}
  finally {if(version===viewVersion){$('login-submit').disabled=false;$('login-submit').textContent='Entrar al campus';}}
}
