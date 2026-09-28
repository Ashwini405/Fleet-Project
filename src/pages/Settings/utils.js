export function parseUserAgent(ua = "") {
  if (!ua) return { browser: "Unknown", os: "Unknown", mobile: false };

  let browser = "Unknown";
  if (/Edg\//.test(ua)) browser = "Edge";
  else if (/OPR\//.test(ua)) browser = "Opera";
  else if (/Chrome\//.test(ua)) browser = "Chrome";
  else if (/Firefox\//.test(ua)) browser = "Firefox";
  else if (/Safari\//.test(ua)) browser = "Safari";
  else if (/PostmanRuntime/.test(ua)) browser = "Postman";

  let os = "Unknown";
  if (/Windows/.test(ua)) os = "Windows";
  else if (/Android/.test(ua)) os = "Android";
  else if (/iPhone|iPad/.test(ua)) os = "iOS";
  else if (/Mac OS X/.test(ua)) os = "macOS";
  else if (/Linux/.test(ua)) os = "Linux";

  return { browser, os, mobile: /Mobile|Android|iPhone/.test(ua) };
}

export function formatIp(ip) {
  if (!ip) return "—";
  if (ip === "::1") return "127.0.0.1";
  return ip.replace(/^::ffff:/, "");
}

export function formatDateTime(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}
