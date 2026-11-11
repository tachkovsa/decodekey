(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);

  /* ---------- tabs ---------- */
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
      document.querySelectorAll(".panel").forEach((p) => p.classList.remove("active"));
      tab.classList.add("active");
      $("panel-" + tab.dataset.tool).classList.add("active");
    });
  });

  /* ---------- helpers ---------- */
  const bytesToB64 = (bytes) => {
    let bin = "";
    bytes.forEach((b) => (bin += String.fromCharCode(b)));
    return btoa(bin);
  };

  const b64ToBytes = (b64) => {
    const bin = atob(b64);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  };

  const utf8Encode = (s) => new TextEncoder().encode(s);
  const utf8Decode = (b) => new TextDecoder("utf-8", { fatal: false }).decode(b);

  const b64UrlDecode = (s) => {
    let t = s.replace(/-/g, "+").replace(/_/g, "/");
    while (t.length % 4) t += "=";
    return utf8Decode(b64ToBytes(t));
  };

  const setError = (id, message) => {
    $(id).textContent = message || "";
  };

  const copyFrom = async (elId) => {
    const el = $(elId);
    const text = el.value !== undefined ? el.value : el.textContent;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
  };

  /* ---------- JWT ---------- */
  $("jwt-decode").addEventListener("click", () => {
    setError("jwt-error", "");
    $("jwt-header").textContent = "—";
    $("jwt-payload").textContent = "—";

    const token = $("jwt-in").value.trim();
    if (!token) {
      setError("jwt-error", "Paste a token first.");
      return;
    }
    const parts = token.split(".");
    if (parts.length < 2) {
      setError("jwt-error", "A JWT has at least two parts separated by dots.");
      return;
    }
    try {
      const header = JSON.parse(b64UrlDecode(parts[0]));
      const payload = JSON.parse(b64UrlDecode(parts[1]));
      $("jwt-header").textContent = JSON.stringify(header, null, 2);
      $("jwt-payload").textContent = JSON.stringify(payload, null, 2);
    } catch (e) {
      setError("jwt-error", "Cannot decode: " + e.message);
    }
  });
  $("jwt-clear").addEventListener("click", () => {
    $("jwt-in").value = "";
    $("jwt-header").textContent = "—";
    $("jwt-payload").textContent = "—";
    setError("jwt-error", "");
  });
  $("jwt-copy").addEventListener("click", () =>
    navigator.clipboard.writeText(
      "HEADER\n" + $("jwt-header").textContent + "\n\nPAYLOAD\n" + $("jwt-payload").textContent
    )
  );

  /* ---------- Base64 ---------- */
  $("b64-encode").addEventListener("click", () => {
    setError("b64-error", "");
    try {
      $("b64-out").value = bytesToB64(utf8Encode($("b64-in").value));
    } catch (e) {
      setError("b64-error", e.message);
    }
  });
  $("b64-decode").addEventListener("click", () => {
    setError("b64-error", "");
    try {
      $("b64-out").value = utf8Decode(b64ToBytes($("b64-in").value.trim()));
    } catch {
      setError("b64-error", "Not valid Base64.");
    }
  });
  $("b64-copy").addEventListener("click", () => copyFrom("b64-out"));

  /* ---------- URL ---------- */
  $("url-encode").addEventListener("click", () => {
    setError("url-error", "");
    $("url-out").value = encodeURIComponent($("url-in").value);
  });
  $("url-decode").addEventListener("click", () => {
    setError("url-error", "");
    try {
      $("url-out").value = decodeURIComponent($("url-in").value);
    } catch {
      setError("url-error", "Malformed percent-encoding.");
    }
  });
  $("url-copy").addEventListener("click", () => copyFrom("url-out"));

  /* ---------- Hex ---------- */
  $("hex-encode").addEventListener("click", () => {
    setError("hex-error", "");
    const hex = Array.from(utf8Encode($("hex-in").value))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join(" ");
    $("hex-out").value = hex;
  });
  $("hex-decode").addEventListener("click", () => {
    setError("hex-error", "");
    const clean = $("hex-in").value.replace(/0x/gi, "").replace(/[^0-9a-f]/gi, "");
    if (clean.length % 2) {
      setError("hex-error", "Hex string has an odd number of digits.");
      return;
    }
    const bytes = new Uint8Array(clean.length / 2);
    for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(clean.substr(i * 2, 2), 16);
    $("hex-out").value = utf8Decode(bytes);
  });
  $("hex-copy").addEventListener("click", () => copyFrom("hex-out"));

  /* ---------- HTML entities ---------- */
  const escapeHtml = (s) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  const unescapeHtml = (s) => {
    const ta = document.createElement("textarea");
    ta.innerHTML = s;
    return ta.value;
  };
  $("html-encode").addEventListener("click", () => {
    $("html-out").value = escapeHtml($("html-in").value);
  });
  $("html-decode").addEventListener("click", () => {
    $("html-out").value = unescapeHtml($("html-in").value);
  });
  $("html-copy").addEventListener("click", () => copyFrom("html-out"));

  /* ---------- JSON ---------- */
  $("json-format").addEventListener("click", () => {
    setError("json-error", "");
    try {
      $("json-out").value = JSON.stringify(JSON.parse($("json-in").value), null, 2);
    } catch (e) {
      setError("json-error", e.message);
    }
  });
  $("json-minify").addEventListener("click", () => {
    setError("json-error", "");
    try {
      $("json-out").value = JSON.stringify(JSON.parse($("json-in").value));
    } catch (e) {
      setError("json-error", e.message);
    }
  });
  $("json-copy").addEventListener("click", () => copyFrom("json-out"));
})();
