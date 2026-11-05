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
