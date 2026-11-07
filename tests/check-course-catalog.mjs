import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const courses=JSON.parse(fs.readFileSync('assets/course-catalog.json','utf8'));
const source=fs.readFileSync('assets/course-catalog.js','utf8');
assert.equal(courses.length,7);
assert.deepEqual(courses.slice(0,2).map(c=>[c.weekly,c.monthly,c.months]),[[100,400,6],[150,500,8]]);
for(const c of courses.filter(c=>!c.legacy)){
 assert.equal(c.total,c.weeks*c.weekly);assert.equal(c.monthly,null);
 assert.equal(c.registrationFee,0);assert.equal(c.certificateFee,0);
 assert.equal(c.activitiesPerWeek,2);
 const inputs=Object.fromEntries(courses.map(x=>[x.inputId,{disabled:!x.legacy,checked:false}]));
 const note={};const context={URLSearchParams,location:{search:'?diplomado='+encodeURIComponent(c.name)},document:{getElementById:id=>id==='courseCatalogStatus'?note:inputs[id],querySelector:()=>Object.values(inputs).find(x=>x.checked)}};
 context.window=context;vm.runInNewContext(source,context);
 assert.equal(JSON.stringify(context.EvolvaCourses.list),JSON.stringify(courses));
 assert.equal(inputs[c.inputId].disabled,true);assert.equal(inputs[c.inputId].checked,false);
 assert.equal(context.EvolvaCourses.available(c.name),false);
 assert.equal(context.EvolvaCourses.available(courses[0].name),true);
 context.EvolvaCourses.setEnrollmentReady(true);
 assert.equal(inputs[c.inputId].disabled,false);assert.equal(inputs[c.inputId].checked,true);
 assert.equal(note.hidden,true);
 context.EvolvaCourses.setEnrollmentReady(false);
 assert.equal(inputs[c.inputId].disabled,true);assert.equal(context.EvolvaCourses.available(c.name),false);
 assert.equal(context.EvolvaCourses.available('Curso inventado'),false);
 context.EvolvaCourses.replacePublished([{id:'prueba21',name:'Curso publicado V21',legacy:false,inputId:'live',months:3,monthly:150}]);assert.equal(context.EvolvaCourses.list.length,1);assert.equal(context.EvolvaCourses.available('Curso publicado V21'),true);assert.equal(context.EvolvaCourses.available(c.name),false);

}
for(const file of ['index.html','cursos.html','diplomados.html','inscripcion.html','pagos.html']){
 const html=fs.readFileSync(file,'utf8');
 for(const c of courses)assert.ok(html.includes(c.name),`${file}: ${c.name}`);
}
console.log('Catalog checks passed: seven consistent courses, approved fees, activation-dependent deep links and unchanged legacy plans. No live requests.');
