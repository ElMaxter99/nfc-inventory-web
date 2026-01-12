export const isValidUrl = (value: string): boolean => {
  if (!value) {
    return false;
  }

  try {
    const url = new URL(value);
    return Boolean(url.protocol && url.hostname);
  } catch {
    return false;
  }
};

export const buildDestinationUrl = (value: string, defaultRedirectUrl: string): string => {
  const trimmed = value?.trim();

  if (trimmed && isValidUrl(trimmed)) {
    return trimmed;
  }

  if (!defaultRedirectUrl) {
    return trimmed ?? '';
  }

  if (!trimmed) {
    return defaultRedirectUrl;
  }

  return `${defaultRedirectUrl}?tag=${encodeURIComponent(trimmed)}`;
};
