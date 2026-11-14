// Bounded operational codes only: no names, CURP, URLs, messages, files or credentials.
type Incident={action:string;status:number;at:string};
const incidents:Incident[]=[];let reporter:((item:Incident)=>Promise<any>)|null=null;
const allowed=/^(?:lessons|calendar|tasks|credential|certificate|issue_report|documents|lesson_file|task_file|submission_file|proof|pdf_download|admin_[a-z_]+|v(?:19|20|21|23|25|26|30|35)_[a-z_]+)$/;
export function setIncidentReporter(fn:typeof reporter){reporter=fn;}
export function clearDiagnostics(){incidents.splice(0);reporter=null;}
export function diagnosticSnapshot(){return incidents.map(i=>({...i}));}
export function recordIncident(action:string,status=0){if(!allowed.test(action)||/password|login|incident/.test(action))return;const now=Date.now();if(incidents.some(i=>i.action===action&&now-Date.parse(i.at)<30000))return;const item={action,status:[0,400,401,403,404,409,413,429,500,502,503,504].includes(status)?status:500,at:new Date().toISOString()};incidents.push(item);if(incidents.length>100)incidents.shift();if(reporter)reporter(item).catch(()=>{});}
