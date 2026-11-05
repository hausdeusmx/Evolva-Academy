export function coursePlanCopy(plan:any){
 const unknown={label:'Plan de pagos',amount:null as number|null,detail:'Tu modalidad y calendario aparecerán aquí cuando estén configurados'};
 const money=(n:number)=>new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN'}).format(n);
 if(!plan)return unknown;
 if(plan.configured===true){
  const mode=plan.mode==='monthly'?'Cuota mensual':plan.mode==='total'?'Pago total':'Cuota semanal';
  return {label:mode,amount:Number(plan.installmentAmount)||null,detail:plan.mode==='total'?'Un solo pago · '+money(plan.total):String(plan.count)+' cuotas · '+String(plan.weeks)+' semanas · Total del curso: '+money(plan.total)};
 }
 const months=Number(plan.months||0),monthly=Number(plan.monthly||0);
 if(months>0&&monthly>0)return {label:'Cuota mensual',amount:monthly,detail:String(months)+' mensualidades · Total '+money(months*monthly)};
 const weeks=Number(plan.weeks||0),weekly=Number(plan.weekly||0),total=Number(plan.total||0);
 if(weeks>0&&weekly>0&&total===weeks*weekly)return {label:'Cuota semanal',amount:weekly,detail:String(weeks)+' semanas · Total '+money(total)};
 return unknown;
}


function calendarDate(value:unknown){
 const match=String(value||'').match(/^(\d{4})-(\d{2})-(\d{2})/);if(!match)return null;
 const year=Number(match[1]),month=Number(match[2])-1,day=Number(match[3]),date=new Date(Date.UTC(year,month,day));
 return date.getUTCFullYear()===year&&date.getUTCMonth()===month&&date.getUTCDate()===day?date:null;
}
function dueDate(start:Date|null,index:number,mode:string){if(!start)return null;const date=new Date(start);if(mode==='weekly')date.setUTCDate(date.getUTCDate()+index*7);if(mode==='monthly'){const month=start.getUTCMonth()+index,year=start.getUTCFullYear()+Math.floor(month/12),targetMonth=((month%12)+12)%12,last=new Date(Date.UTC(year,targetMonth+1,0)).getUTCDate();date.setUTCFullYear(year,targetMonth,Math.min(start.getUTCDate(),last));}return date.toISOString().slice(0,10);}
export function paymentCalendar(dashboard:any){
 const original=dashboard.plan;if(!original)return dashboard;
 if(Array.isArray(original.installments)&&original.installments.length)return {...dashboard,plan:{...original,calendarAvailable:true,calendarSource:'assigned'}};
 if(original.configured===true)return {...dashboard,plan:{...original,calendarAvailable:false}};
 const weeks=Number(original.weeks),weekly=Number(original.weekly),months=Number(original.months),monthly=Number(original.monthly),total=Number(original.total);
 let mode='',count=0,amount=0;
 if(Number.isInteger(weeks)&&weeks>0&&weeks<=104&&weekly>0&&Number.isFinite(weekly)&&Math.abs(total-weeks*weekly)<.01){mode='weekly';count=weeks;amount=weekly;}
 else if(Number.isInteger(months)&&months>0&&months<=36&&monthly>0&&Number.isFinite(monthly)){mode='monthly';count=months;amount=monthly;}
 if(!count)return {...dashboard,plan:{...original,calendarAvailable:false}};
 const start=calendarDate(dashboard.student?.registered),payments=dashboard.payments||[];
 const installments=Array.from({length:count},(_,index)=>{const period=`Cuota ${index+1} de ${count}`,matched=payments.filter((p:any)=>String(p.period||'').trim().toLowerCase()===period.toLowerCase()),paid=matched.filter((p:any)=>/^(confirmado|pagado|aprobado|validado)$/i.test(String(p.status||'').trim())).reduce((sum:number,p:any)=>sum+(Number.isFinite(Number(p.amount))&&Number(p.amount)>0?Number(p.amount):0),0),review=matched.some((p:any)=>/^(en revisi[oó]n|pendiente|en proceso)$/i.test(String(p.status||'').trim()));return {number:index+1,period,dueDate:dueDate(start,index,mode),amount:Math.round(amount*100)/100,remaining:Math.round(Math.max(0,amount-paid)*100)/100,status:paid>=amount-.005?'Pagado':review?'En revisión':paid>0?'Abono registrado':'Programado'};});
 // A catalog-based calendar is informative. It never confirms payments or writes billing terms.
 return {...dashboard,plan:{...original,mode,count,installmentAmount:amount,calendarAvailable:true,calendarSource:'reference',calendarStart:dueDate(start,0,mode),calendarHasDates:!!start,installments}};
}
