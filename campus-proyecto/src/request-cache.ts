// Private responses live only in memory, scoped by the caller's account/course key.
export function createReadCache(ttl=15000,max=60){
 const values=new Map<string,{value:any;expires:number}>(),pending=new Map<string,Promise<any>>();let generation=0;
 return {clear(){generation++;values.clear();pending.clear();},async get(key:string,load:()=>Promise<any>,fresh=false){
  const current=generation,hit=values.get(key);if(!fresh&&hit&&hit.expires>Date.now())return structuredClone(hit.value);
  const running=pending.get(key);if(running)return structuredClone(await running);
  const work=load().then(value=>{if(current===generation){if(values.size>=max)values.delete(values.keys().next().value!);values.set(key,{value:structuredClone(value),expires:Date.now()+ttl});}return value;}).finally(()=>{if(pending.get(key)===work)pending.delete(key);});
  pending.set(key,work);return structuredClone(await work);
 }};
}
