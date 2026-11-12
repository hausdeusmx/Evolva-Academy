// The Android wrapper sends this agent marker, including the original APK.
export const isAppExperience = /EvolvaCampus\//.test(navigator.userAgent)
  || (typeof window.matchMedia==='function' && window.matchMedia('(display-mode: standalone)').matches)
  || /\/app(?:\.html|\/|\/index\.html)$/.test(window.location.pathname||'');
if (isAppExperience && typeof document!=='undefined') document.documentElement.classList.add('evolva-device-app');
