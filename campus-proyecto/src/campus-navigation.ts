// A fresh, bookmarkable entry for the document templates; the account stays the same.
export function initialCampusSection(href:string,sections:readonly string[]){
 const url=new URL(href),requested=url.searchParams.get('seccion');
 if(requested&&sections.includes(requested))return requested;
 if(url.pathname.endsWith('/documentos.html'))return 'constancias';
 if(url.pathname.endsWith('/reinscripcion.html'))return 'reinscripcion';
 return 'inicio';
}
