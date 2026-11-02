export function coursePlanCopy(plan:any){
 const unknown={label:'Plan de pagos',amount:null as number|null,detail:'Consulta tu plan con administración'};
 if(!plan||plan.available===false)return unknown;
 if(Number.isInteger(plan.weeks)&&plan.weeks>0&&Number.isFinite(plan.weekly)&&plan.weekly>0&&Number.isFinite(plan.total)&&Math.abs(plan.weeks*plan.weekly-plan.total)<0.01)return {label:'Cuota semanal',amount:plan.weekly,detail:`${plan.weeks} semanas · Total del curso: ${new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN'}).format(plan.total)}`};
 if(Number.isFinite(plan.monthly)&&plan.monthly>0&&Number.isFinite(plan.months)&&plan.months>0&&Number.isFinite(plan.weekly)&&plan.weekly>0)return {label:'Mensualidad de referencia',amount:plan.monthly,detail:`${plan.months} meses · ${new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN'}).format(plan.weekly)} por semana`};
 return unknown;
}
