/**
 * Utility functions for handling image URLs and image uploading/conversion.
 */

/**
 * Synchronously normalizes user-pasted image text or links from ImgBB / HTML / BBCode / etc.
 * Extracts the direct image URL if embedded in HTML tags or BBCode.
 */
export function normalizeImageUrl(input: string): string {
  if (!input) return '';
  const trimmed = input.trim();

  // If already a base64 data URL or blob, return as is
  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return trimmed;
  }

  // 1. Check if user pasted an HTML tag like <img src="https://i.ibb.co/..." /> or src="..."
  const srcMatch = trimmed.match(/src=["'](https?:\/\/[^"']+)["']/i);
  if (srcMatch && srcMatch[1]) {
    return srcMatch[1];
  }

  // 2. Check if user pasted BBCode like [img]https://i.ibb.co/...[/img]
  const bbcodeMatch = trimmed.match(/\[img\](https?:\/\/[^\[]+)\[\/img\]/i);
  if (bbcodeMatch && bbcodeMatch[1]) {
    return bbcodeMatch[1];
  }

  // 3. Check if there is any direct i.ibb.co link anywhere in the pasted text
  const directImgMatch = trimmed.match(/(https?:\/\/i\.ibb\.co\/[^\s"'<>]+)/i);
  if (directImgMatch && directImgMatch[1]) {
    return directImgMatch[1];
  }

  // 4. Any direct image ending in jpg, png, webp, gif, jpeg
  const anyDirectImg = trimmed.match(
    /(https?:\/\/[^\s"'<>]+\.(?:jpg|jpeg|png|webp|gif|svg)(?:\?[^\s"'<>]*)?)/i
  );
  if (anyDirectImg && anyDirectImg[1]) {
    return anyDirectImg[1];
  }

  return trimmed;
}

/**
 * Asynchronously resolves ANY pasted URL (including https://ibb.co/xxxxx page links)
 * by asking the backend endpoint /api/resolve-image to fetch the real og:image direct URL!
 */
export async function resolveDirectImageUrl(input: string): Promise<string> {
  const syncNormalized = normalizeImageUrl(input);
  if (!syncNormalized) return '';

  // If already a direct image URL or base64 data URL, no server call needed
  if (
    syncNormalized.startsWith('data:') ||
    syncNormalized.startsWith('blob:') ||
    syncNormalized.includes('i.ibb.co/') ||
    syncNormalized.match(/\.(jpeg|jpg|png|webp|gif|svg)(\?.*)?$/i)
  ) {
    return syncNormalized;
  }

  // If it's a page link like https://ibb.co/Kz0VkSRB or imgur or others, resolve via API
  try {
    const res = await fetch('/api/resolve-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: syncNormalized }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.directUrl) {
        return data.directUrl;
      }
    }
  } catch (e) {
    console.warn('Failed to resolve image via backend API:', e);
  }

  return syncNormalized;
}

/**
 * Converts a selected image File into a compressed Base64 data URL
 * so that it can be stored directly into Firestore without needing an external image host.
 * Max dimension: 800px, quality: 0.8 JPEG (~30KB-80KB, perfect for Firestore 1MB doc limit).
 */
export function compressImageFile(file: File, maxDim = 800, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => {
        reject(new Error('فشل قراءة ملف الصورة'));
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('فشل رفع الملف'));
    reader.readAsDataURL(file);
  });
}
