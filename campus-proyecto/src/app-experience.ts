// The Android wrapper sends this agent marker, including the original APK.
export const isAppExperience = /EvolvaCampus\//.test(navigator.userAgent)
  || (typeof window.matchMedia==='function' && window.matchMedia('(display-mode: standalone)').matches)
  || window.location.pathname?.endsWith('/app.html') === true;
if (isAppExperience && typeof document!=='undefined') document.documentElement.classList.add('evolva-device-app');
