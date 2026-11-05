export function coursePlanCopy(plan:any){
 const unknown={label:'Plan de pagos',amount:null as number|null,detail:'Tu modalidad y calendario aparecerán aquí cuando estén configurados'};
 if(!plan||plan.configured!==true)return unknown;
 const money=(n:number)=>new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN'}).format(n);
 const mode=plan.mode==='monthly'?'Pago mensual':plan.mode==='total'?'Pago total':'Pago semanal';
 return {label:mode,amount:Number(plan.installmentAmount)||null,detail:plan.mode==='total'?'Un solo pago · '+money(plan.total):String(plan.count)+' cuotas · '+String(plan.weeks)+' semanas · Total del curso: '+money(plan.total)};
}
