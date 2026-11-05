export const DEMO_EMAIL='alumna@demo.evolva.test';
export const DEMO_GRADUATE='egresado@demo.evolva.test';
export const DEMO_LOGIN_EMAIL='000001@evolvacademy.mx';
export const DEMO_GRADUATE_LOGIN='000002@evolvacademy.mx';
export const DEMO_PASSWORD='EvolvaPrueba2026!';
export const normalizeFolio=(v:string)=>v.trim().toUpperCase();
export const validFolio=(v:string)=>/^EVOLVA-\d{6}$/.test(normalizeFolio(v));
export const modules=[
 {id:'M1',title:'Tu relación con el dinero',subtitle:'Hábitos, metas y diagnóstico financiero',lessons:4},
 {id:'M2',title:'Presupuesto que sí funciona',subtitle:'Ingresos, gastos y decisiones cotidianas',lessons:4},
 {id:'M3',title:'Ahorro y fondo de emergencia',subtitle:'Construye un respaldo para tus metas',lessons:4},
 {id:'M4',title:'Crédito e inversión',subtitle:'Decisiones informadas para el futuro',lessons:4}
];
export const exams=[
 {id:'ahorro',module:'M3',title:'Ahorro y fondo de emergencia',duration:10,questions:[
  {id:'q1',text:'¿Para qué sirve un fondo de emergencia?',options:['Para gastos imprevistos necesarios','Para compras impulsivas','Para pagar vacaciones'],correct:0},
  {id:'q2',text:'Si recibes $8,000 y ahorras el 10%, ¿cuánto reservas?',options:['$80','$800','$1,800'],correct:1},
  {id:'q3',text:'¿Qué característica conviene a un fondo de emergencia?',options:['Que sea difícil de retirar','Que dependa de una apuesta','Que esté disponible cuando se necesite'],correct:2},
  {id:'q4',text:'¿Cuál es una meta de ahorro concreta?',options:['Ahorrar algo algún día','Guardar $500 al mes durante seis meses','Comprar todo a crédito'],correct:1},
  {id:'q5',text:'¿Qué ayuda a mantener el hábito de ahorro?',options:['Separar una cantidad al recibir el ingreso','Ahorrar solo lo que sobre por casualidad','No revisar los gastos'],correct:0}
 ]},
 {id:'credito',module:'M4',title:'Crédito e inversión',duration:10,questions:[
  {id:'q1',text:'¿Qué es el CAT de un crédito?',options:['Un indicador del costo anual total','El saldo de una cuenta','Una garantía de ganancias'],correct:0},
  {id:'q2',text:'¿Qué implica diversificar?',options:['Poner todo en un solo activo','Distribuir recursos entre distintas opciones','Pedir varios créditos'],correct:1},
  {id:'q3',text:'Una inversión que promete ganancias extraordinarias sin riesgo requiere…',options:['Depositar de inmediato','Compartir contraseñas','Investigar y verificar su legitimidad'],correct:2},
  {id:'q4',text:'¿Qué ocurre al pagar solo el mínimo de una tarjeta?',options:['Siempre se cancela la deuda','Puede prolongar la deuda y aumentar intereses','Se elimina el costo del crédito'],correct:1},
  {id:'q5',text:'Antes de invertir conviene…',options:['Conocer el riesgo, plazo y condiciones','Elegir solo por publicidad','Usar dinero necesario para gastos inmediatos'],correct:0}
 ]}
];
export function gradeExam(id:string,answers:Record<string,number>){const e=exams.find(x=>x.id===id);if(!e)throw Error('Examen no disponible.');if(e.questions.some(q=>!Number.isInteger(answers[q.id])||answers[q.id]<0||answers[q.id]>=q.options.length))throw Error('Responde todas las preguntas.');return Math.round(e.questions.filter(q=>answers[q.id]===q.correct).length/e.questions.length*100)/10;}
export function summary(grades:{score:number|null}[],total:number){const done=grades.filter(x=>x.score!==null&&Number.isFinite(x.score));return {progress:Math.round(done.length/Math.max(total,1)*100),average:done.length?Math.round(done.reduce((s,g)=>s+(g.score??0),0)/done.length*10)/10:null};}
export const demoNotices=[{id:'n1',title:'Tu siguiente paso: empezar a ahorrar',body:'Ya puedes realizar la evaluación de Ahorro y fondo de emergencia. Revisa el material antes de comenzar.',date:'2026-10-30',type:'Académico'},{id:'n2',title:'Comprobantes de pago',body:'Registra tu comprobante desde Pagos. El registro pasa a revisión; no confirma automáticamente un pago.',date:'2026-10-28',type:'Administración'},{id:'n3',title:'Bienvenida a tu campus',body:'Aquí puedes consultar tu avance, evaluaciones y documentos. Este recorrido contiene datos de ejemplo para validar el portal.',date:'2026-10-25',type:'Campus'}];
export function demoStudent(graduate=false){return {name:graduate?'Daniel Rivera':'Sofía Martínez',email:graduate?DEMO_GRADUATE:DEMO_EMAIL,folio:graduate?'EVOLVA-000002':'EVOLVA-000001',course:'Finanzas Personales',group:'FIN-01',phone:'6560000000',status:graduate?'Egresado':'Activo',registered:'2026-08-01',institutional:graduate?DEMO_GRADUATE_LOGIN:DEMO_LOGIN_EMAIL,graduate};}
export function baseGrades(graduate:boolean){return modules.map((m,i)=>({id:m.id,module:m.id,title:m.title,score:i<2?[9,8.5][i]:graduate?[9.5,9][i-2]:null,status:i<2||graduate?'Evaluado':'Pendiente'}));}
