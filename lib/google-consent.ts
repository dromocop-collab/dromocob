export const CONSENT_STORAGE_KEY = "dromocob_consent_v2";

export type ConsentChoice = {
  analytics: boolean;
  advertising: boolean;
  updatedAt: string;
};

export function consentUpdate(choice: Pick<ConsentChoice, "analytics" | "advertising">) {
  return {
    ad_storage: choice.advertising ? "granted" : "denied",
    analytics_storage: choice.analytics ? "granted" : "denied",
    ad_user_data: choice.advertising ? "granted" : "denied",
    ad_personalization: choice.advertising ? "granted" : "denied",
    functionality_storage: "granted",
    security_storage: "granted",
  } as const;
}

export function getConsentBootstrapScript() {
  return `window.dataLayer=window.dataLayer||[];window.gtag=window.gtag||function(){window.dataLayer.push(arguments);};(function(){var denied={ad_storage:'denied',analytics_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',functionality_storage:'granted',security_storage:'granted',wait_for_update:500};window.gtag('consent','default',denied);try{var saved=JSON.parse(localStorage.getItem('${CONSENT_STORAGE_KEY}')||'null');if(saved&&typeof saved.analytics==='boolean'&&typeof saved.advertising==='boolean'){window.gtag('consent','update',{ad_storage:saved.advertising?'granted':'denied',analytics_storage:saved.analytics?'granted':'denied',ad_user_data:saved.advertising?'granted':'denied',ad_personalization:saved.advertising?'granted':'denied',functionality_storage:'granted',security_storage:'granted'});window.dataLayer.push({event:'dromocob_consent_restored',consent_analytics:saved.analytics,consent_advertising:saved.advertising});}}catch(e){}})();`;
}
