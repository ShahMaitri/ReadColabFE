const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api/v1';

const getApiOrigin = (): string => {
  try {
    return new URL(API_BASE_URL).origin;
  } catch {
    return '';
  }
};

export const resolveCoverImageUrl = (cover?: string | null): string => {
  if (!cover) {
    return '/book-placeholder.svg';
  }

  if (/^https?:\/\//i.test(cover)) {
    return cover;
  }

  const apiOrigin = getApiOrigin();
  if (cover.startsWith('/') && apiOrigin) {
    return `${apiOrigin}${cover}`;
  }

  return cover;
};
