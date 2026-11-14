/* Display only the exact publication returned by the enrollment service. */
window.EvolvaAdmissionAgreement=Object.freeze({render(publication){
 'use strict';const data=publication?.data,body=document.getElementById('admissionAgreementBody');
 if(!data?.documents?.terms||!data.documents.privacy||!body)throw Error('No se recibió el reglamento completo. Actualiza antes de firmar.');
 const node=(tag,text)=>{const n=document.createElement(tag);n.textContent=text;return n;};
 body.replaceChildren();
 const responsible=document.getElementById('admissionAgreementResponsible');responsible.replaceChildren(node('strong',data.responsible.name),node('span',data.responsible.address),node('span',data.responsible.email));
 document.getElementById('admissionAgreementTitle').textContent=data.documents.terms.title;
 document.getElementById('admissionAgreementVersion').textContent='Versión que aceptarás: '+data.version;
 for(const key of ['terms','privacy']){
  const details=document.createElement('details');details.open=key==='terms';details.className='agreement-document';details.append(node('summary',key==='terms'?'Leer reglamento completo':'Leer aviso de privacidad completo'));
  for(const section of data.documents[key].sections){const article=document.createElement('section');article.append(node('h4',section.title));for(const p of section.paragraphs)article.append(node('p',p));details.append(article);}body.append(details);
 }
 const consent=data.documents.educationalConsent,ready=['2026-11-13-v31','2026-11-13-v33'].includes(data.version)&&consent?.id==='USO_EDUCATIVO_V31'&&typeof consent.text==='string'&&consent.text.length>80;
 const field=document.getElementById('admissionEducationalConsent');field.checked=false;field.required=ready;field.disabled=!ready;
 document.getElementById('admissionEducationalConsentRow').hidden=!ready;
 document.getElementById('admissionEducationalConsentText').textContent=ready?consent.text:'';
 document.getElementById('admissionAgreementStatus').textContent=ready?'Reglamento y consentimiento educativo · confirma tu aceptación al final.':'Se muestra la publicación vigente. El nuevo consentimiento estará disponible cuando administración active su actualización.';
 return ready;
}});
