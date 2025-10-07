export function sanitizeHindi(input: string): string {
  if (!input) return input;
  let out = input
    // Remove Unicode replacement characters
    .replace(/\uFFFD/gu, "")
    // Normalize common Hindi words that get broken after removal
    .replace(/विकस/g, "विकास")
    .replace(/बिजनस/g, "बिज़नेस")
    .replace(/फॉलोअर्?स?/g, "फॉलोअर्स")
    .replace(/मुफ्त्?/g, "मुफ्त")
    .replace(/कंटेंट/g, "कंटेंट") // idempotent
    .replace(/प्रोफइल/g, "प्रोफाइल")
    .replace(/एथलेटिकस/g, "एथलेटिक्स")
    .replace(/एनालिटिकस/g, "एनालिटिक्स");
  return out;
}

export function sanitizeDeep<T>(value: T): T {
  if (typeof value === "string") {
    return sanitizeHindi(value) as unknown as T;
  }
  if (Array.isArray(value)) {
    return value.map((v) => sanitizeDeep(v)) as unknown as T;
  }
  if (value && typeof value === "object") {
    const result: any = Array.isArray(value) ? [] : {};
    for (const [k, v] of Object.entries(value as any)) {
      result[k] = sanitizeDeep(v as any);
    }
    return result as T;
  }
  return value;
}
