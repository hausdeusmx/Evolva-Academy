import assert from 'node:assert/strict';
import {config} from './web/config.mjs';
// Read-only live checks. No account creation, valid login or real email.
const request = async(path,body) => {
  const response=await fetch(config.url+path,{method:'POST',headers:{apikey:config.publishableKey,'Content-Type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(15000)});
  const data=await response.json();return {status:response.status,data};
};
const anonymous=await request('/rest/v1/rpc/evolva_trial_dashboard',{p_enrollment_id:null});
assert([401,403].includes(anonymous.status));assert(!anonymous.data.student);
console.log('PASS: anonymous HTTP dashboard access is denied');
const invalid=await request('/auth/v1/token?grant_type=password',{email:'000001@evolvacademy.mx',password:'intentionally-invalid-pilot-test-password'});
assert([400,401,422].includes(invalid.status));assert(!invalid.data.access_token);
console.log('PASS: invalid HTTP credentials do not create a session');
