import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import ts from 'typescript';
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'evolva-payments-'));
try{
  fs.writeFileSync(path.join(dir,'settings.mjs'),ts.transpileModule(fs.readFileSync('src/payment-settings.ts','utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText);
  const {PAYMENT_ACCOUNT_ID,paymentDashboard}=await import(pathToFileURL(path.join(dir,'settings.mjs')));
  const prefix='64600000000000000',sum=[...prefix].reduce((s,n,i)=>s+(Number(n)*[3,7,1][i%3])%10,0),clabe=prefix+((10-sum%10)%10);
  const settings={id:PAYMENT_ACCOUNT_ID,body:`Cuenta: Cuenta de prueba\nBanco receptor: STP\nBeneficiario: PERSONA DE PRUEBA\nCLABE: ${clabe}`};
  const notice={id:'aviso-1',title:'Actividad disponible',read:false},original={student:{folio:'EVOLVA-000001'},notices:[notice,settings],payments:[{id:'pago-1',status:'En revisión'}]};
  const parsed=paymentDashboard(original);
  assert.equal(parsed.paymentAccount.clabe,clabe);
  assert.equal(typeof parsed.paymentAccount.clabe,'string');
  assert.equal(parsed.paymentAccount.beneficiary,'PERSONA DE PRUEBA');
  assert.deepEqual(parsed.notices,[notice]);
  assert.equal(original.notices.length,2,'Do not mutate the API response');
  assert.deepEqual(parsed.payments,original.payments);
  assert.equal(paymentDashboard({notices:[]}).paymentAccount,null);
  assert.equal(paymentDashboard({notices:[settings,settings]}).paymentAccount,null,'Reject ambiguous accounts');
  assert.equal(paymentDashboard({notices:[{...settings,body:settings.body+'\nCLABE: '+clabe}]}).paymentAccount,null,'Reject repeated fields');
  assert.equal(paymentDashboard({notices:[{...settings,body:settings.body.replace(/.$/,String((Number(clabe.at(-1))+1)%10))}]}).paymentAccount,null,'Reject bad check digits');
  assert.equal(paymentDashboard({notices:[{...settings,body:settings.body.replace('Banco receptor: STP','Banco receptor: ')}]}).paymentAccount,null,'Reject incomplete instructions');
  for(const filename of ['src/TransferAccount.tsx','src/payment-settings.ts','public/config.js','../pagos.html']){
    const source=fs.readFileSync(filename,'utf8');
    assert.ok(!/\b\d{18}\b/.test(source),filename+' must not contain a real account number');
  }
  console.log('Payments passed: private settings, exact string CLABE, check digit, missing/ambiguous settings, notice separation and unchanged payment history.');
}finally{fs.rmSync(dir,{recursive:true,force:true});}
