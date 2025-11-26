// Simple validation helpers for product/service fields
function isValidTitle(title) {
  if (!title || typeof title !== 'string') return false;
  const t = title.trim();
  if (t.length < 3 || t.length > 140) return false;
  const letters = (t.match(/[A-Za-z]/g) || []).length;
  if (letters < 3) return false;
  const words = t.split(/\s+/).filter(Boolean);
  const meaningfulWords = words.filter(w => /[A-Za-z]{2,}/.test(w));
  if (meaningfulWords.length === 0) return false;
  // proportion of alphabetic chars
  if (letters / t.length < 0.3) return false;
  return true;
}

function isValidDescription(desc) {
  if (!desc || typeof desc !== 'string') return false;
  const d = desc.trim();
  if (d.length < 20 || d.length > 5000) return false;
  const letters = (d.match(/[A-Za-z]/g) || []).length;
  if (letters < 10) return false;
  const words = d.split(/\s+/).filter(Boolean);
  if (words.length < 5) return false;
  // avoid long runs of single letters or repeated punctuation
  if (/^(?:\W|\w{1}\s?)+$/.test(d)) return false;
  return true;
}

function isValidImageUrl(url) {
  if (!url || typeof url !== 'string') return false;
  const u = url.trim();
  // allow local upload paths (/uploads/...) or full URLs ending with image extensions
  const extRegex = /\.(png|jpg|jpeg|gif|webp)$/i;
  try {
    if (u.startsWith('/uploads/') && extRegex.test(u)) return true;
    const parsed = new URL(u, 'http://example.com'); // allow relative
    if ((parsed.protocol === 'http:' || parsed.protocol === 'https:' || parsed.protocol === 'http:') && extRegex.test(parsed.pathname)) return true;
  } catch (e) {
    // not a full URL — fall back
  }
  // also accept data URLs for images
  if (u.startsWith('data:image/')) return true;
  return false;
}

module.exports = {
  isValidTitle,
  isValidDescription,
  isValidImageUrl,
};
