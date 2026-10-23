// Asks Cloudinary for a resized, compressed copy of an image (WebP/AVIF when the
// browser supports it). A 100 KB doctor photo becomes about 10 KB.
// Images that aren't on Cloudinary (e.g. the default avatar) are returned unchanged.
export const optimizeImage = (url, width) => {
  if (typeof url !== 'string' || !url.includes('res.cloudinary.com') || !url.includes('/upload/')) return url
  return url.replace('/upload/', `/upload/f_auto,q_auto,c_limit,w_${width}/`)
}
