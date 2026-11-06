export const studentMatricula=(student:any):string=>String(student?.matricula||student?.accountFolio||student?.folio||'');
