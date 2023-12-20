/**
 * Google Tag Manager
 * 
 * Conditionally loads GTM script into page `<head>` if `gtmContainerId` has
 * been set in `settings.json`.
 */
var settingsJson = await fetch('resources/config/settings.json')
var settings = await settingsJson.json()
var gtmContainerId = settings[0].gtmContainerId ?? null

if (gtmContainerId && document.readyState !== 'loading') {
  var script = document.createElement('script')
  script.innerHTML = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','${gtmContainerId}')`
  document.head.appendChild(script)
}