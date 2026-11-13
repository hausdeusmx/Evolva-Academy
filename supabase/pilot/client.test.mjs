import test from 'node:test';
import assert from 'node:assert/strict';
import {createTrialClient} from './web/client.mjs';

const config={url:'https://testproject.supabase.co',publishableKey:'sb_publishable_test',now:()=>1000};
const a={ok:true,trial:true,student:{matricula:'EVOLVA-000001',name:'Alumno ficticio A'},average:8.5};
const b={ok:true,trial:true,student:{matricula:'EVOLVA-000002',name:'Alumno ficticio B'},average:6.5};
const token=(id,expires_at=10000)=>({access_token:'access-'+id,refresh_token:'refresh-'+id,expires_at});
const deferred=()=>{let resolve;const promise=new Promise(r=>resolve=r);return{promise,resolve};};
const memory=()=>{const data=new Map();return {data,getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)};};
const reply=(data,status=200)=>new Response(JSON.stringify(data),{status});
const flush=()=>new Promise(resolve=>setImmediate(resolve));

test('login validates the dashboard before retaining the session; passwords and private dashboard are never stored',async()=>{
  const storage=memory();const calls=[];
  const client=createTrialClient({...config,storage,now:()=>1000,fetchImpl:async(url,options)=>{
    calls.push({url,options});return reply(url.includes('/auth/')?token('a'):a);
  }});
  assert.deepEqual(await client.login(' 000001@evolvacademy.mx ','demo-password'),a);
  assert.equal(client.hasSession(),true);assert.equal(calls.length,2);
  assert.equal(calls[1].options.headers.Authorization,'Bearer access-a');
  const stored=[...storage.data.values()].join();
  assert(!stored.includes('demo-password'));assert(!stored.includes('Alumno ficticio'));assert(!stored.includes('8.5'));
});

test('an authenticated user without a linked student cannot keep a usable pilot session',async()=>{
  const storage=memory();let revoked=false;
  const client=createTrialClient({...config,storage,fetchImpl:async(url)=>{
    if(url.includes('grant_type=password'))return reply(token('outsider'));
    if(url.includes('logout')){revoked=true;return reply({});}
    return reply({code:'42501'},403);
  }});
  await assert.rejects(client.login('000001@evolvacademy.mx','password'),e=>e.status===403);
  assert.equal(client.hasSession(),false);assert.equal(storage.data.size,0);assert.equal(revoked,true);
});

test('invalid credentials do not preserve an old dashboard or account session',async()=>{
  const storage=memory();let reject=false;
  const client=createTrialClient({...config,storage,fetchImpl:async(url)=>{
    if(url.includes('logout'))return reply({});
    if(url.includes('grant_type=password'))return reject?reply({error:'invalid_credentials'},400):reply(token('a'));
    return reply(a);
  }});
  await client.login('000001@evolvacademy.mx','valid');reject=true;
  await assert.rejects(client.login('000002@evolvacademy.mx','wrong'),e=>e.status===400);
  assert.equal(client.hasSession(),false);assert.equal(storage.data.size,0);
});

test('concurrent dashboard reads share only the in-flight request and a later read is fresh',async()=>{
  const gate=deferred();let count=0,hold=false;
  const client=createTrialClient({...config,storage:memory(),fetchImpl:async(url)=>{
    if(url.includes('/auth/'))return reply(token('a'));
    count++;if(hold)await gate.promise;return reply({...a,average:count});
  }});
  await client.login('000001@evolvacademy.mx','valid');hold=true;
  const first=client.dashboard(),second=client.dashboard();await flush();assert.equal(count,2);
  gate.resolve();assert.deepEqual(await first,await second);hold=false;
  const fresh=await client.dashboard();assert.equal(count,3);assert.equal(fresh.average,3);
});

test('logout while reading discards late private responses and clears the persisted session',async()=>{
  const gate=deferred();let hold=false;
  const storage=memory();const client=createTrialClient({...config,storage,fetchImpl:async(url)=>{
    if(url.includes('logout'))return reply({});
    if(url.includes('/auth/'))return reply(token('a'));
    if(hold)await gate.promise;return reply(a);
  }});
  await client.login('000001@evolvacademy.mx','valid');hold=true;
  const read=client.dashboard();await flush();await client.logout();gate.resolve();
  await assert.rejects(read,e=>e.status===409);assert.equal(client.hasSession(),false);assert.equal(storage.data.size,0);
});

test('an overlapping login cannot replace a newer account or resurrect a logged-out session',async()=>{
  const gate=deferred();let count=0;
  const client=createTrialClient({...config,storage:memory(),fetchImpl:async(url,options)=>{
    if(url.includes('logout'))return reply({});
    if(url.includes('/auth/')) {if(++count===1){await gate.promise;return reply(token('a'));}return reply(token('b'));}
    return reply(options.headers.Authorization==='Bearer access-b'?b:a);
  }});
  const older=client.login('000001@evolvacademy.mx','a');await flush();
  await client.login('000002@evolvacademy.mx','b');gate.resolve();
  await assert.rejects(older,e=>e.status===409);assert.deepEqual(await client.dashboard(),b);
});

test('refresh is coalesced, rotates the stored token and rejects an invalid refresh',async()=>{
  const storage=memory();let now=0,refreshes=0,expired=false;
  const client=createTrialClient({...config,storage,now:()=>now,fetchImpl:async(url)=>{
    if(url.includes('grant_type=password'))return reply(token('old',60));
    if(url.includes('grant_type=refresh_token')){refreshes++;return expired?reply({},400):reply(token('new',120));}
    return reply(a);
  }});
  await client.login('000001@evolvacademy.mx','valid');now=40000;
  await Promise.all([client.dashboard(),client.dashboard()]);assert.equal(refreshes,1);
  assert([...storage.data.values()][0].includes('refresh-new'));
  now=110000;expired=true;await assert.rejects(client.dashboard(),e=>e.status===400);
  assert.equal(client.hasSession(),false);assert.equal(storage.data.size,0);
});

test('storage unavailable uses memory; a failed server logout still clears local access',async()=>{
  const storage={getItem(){throw Error('blocked');},setItem(){throw Error('blocked');},removeItem(){throw Error('blocked');}};
  const client=createTrialClient({...config,storage,fetchImpl:async(url)=>{
    if(url.includes('logout'))throw Error('offline');
    return reply(url.includes('/auth/')?token('a'):a);
  }});
  await client.login('000001@evolvacademy.mx','valid');assert(client.hasSession());
  await assert.rejects(client.logout(),e=>e.status===503);assert.equal(client.hasSession(),false);
});
