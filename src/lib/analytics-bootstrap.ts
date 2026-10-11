/** Configure GA before flushing events captured during a slow script load. */
export const ANALYTICS_BOOTSTRAP = `
window.dataLayer = window.dataLayer || [];
window.gtag = function(){ window.dataLayer.push(arguments); };
window.gtag('js', new Date());
window.gtag('config', 'G-7DZ1T3P599');
(window.imtihanPendingEvents || []).splice(0).forEach(function(event) {
  window.gtag('event', event.name, event.params);
});
`;
