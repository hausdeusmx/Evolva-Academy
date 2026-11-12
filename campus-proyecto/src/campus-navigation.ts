// A fresh, bookmarkable entry for the document templates; the account stays the same.
export function initialCampusSection(href:string,sections:readonly string[]){
 const url=new URL(href),requested=url.searchParams.get('seccion');
 if(requested&&sections.includes(requested))return requested;
 if(/\/documentos(?:\.html|\/|\/index\.html)$/.test(url.pathname))return 'constancias';
 if(/\/reinscripcion(?:\.html|\/|\/index\.html)$/.test(url.pathname))return 'reinscripcion';
 return 'inicio';
}
