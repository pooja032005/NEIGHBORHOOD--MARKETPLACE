// Shared validation helpers for frontend forms (character limits + phone)
export const TITLE_MAX_CHARS = 70;
export const DESCRIPTION_MAX_CHARS = 3000;
export const NAME_MAX_CHARS = 50;
export const EMAIL_MAX_CHARS = 100;
export const MOBILE_MAX_CHARS = 15;
export const ADDRESS_MAX_CHARS = 200;

export function validateTitle(title, maxChars = TITLE_MAX_CHARS) {
  if (!title || title.trim().length === 0) {
    return { valid: false, message: 'Title is required.' };
  }
  const length = title.trim().length;
  if (length > maxChars) {
    return { valid: false, message: `Title must be at most ${maxChars} characters (currently ${length}).` };
  }
  return { valid: true };
}

export function validateDescription(description, maxChars = DESCRIPTION_MAX_CHARS) {
  if (!description || description.trim().length === 0) {
    return { valid: false, message: 'Description is required.' };
  }
  const length = description.trim().length;
  if (length > maxChars) {
    return { valid: false, message: `Description must be at most ${maxChars} characters (currently ${length}).` };
  }
  return { valid: true };
}

// Heuristic checks to prevent gibberish/random letters being submitted
export function isLikelyValidText(value) {
  if (!value || typeof value !== 'string') return false;
  const s = value.trim();
  if (s.length < 3) return false;
  const letters = (s.match(/[A-Za-z]/g) || []).length;
  if (letters < 3) return false;
  const words = s.split(/\s+/).filter(Boolean);
  const meaningful = words.filter(w => /[A-Za-z]{2,}/.test(w));
  if (meaningful.length === 0) return false;
  if (letters / s.length < 0.25) return false;
  return true;
}

// Detect single-word gibberish to block further typing when needed
export function isGibberishWord(word) {
  if (!word || typeof word !== 'string') return false;
  const s = word.trim();
  // allow short words (a, to, it, etc.)
  if (s.length < 3) return false;
  const letters = (s.match(/[A-Za-z]/g) || []).length;
  // if less than 2 letters it's probably gibberish
  if (letters < 2) return true;
  // if alphabetic portion is too small, consider gibberish
  if (letters / s.length < 0.25) return true;
  // require at least one 2+ letter sequence (meaningful word part)
  if (!/[A-Za-z]{2,}/.test(s)) return true;
  return false;
}

export function isValidImageUrl(url) {
  if (!url || typeof url !== 'string') return false;
  const u = url.trim();
  const extRegex = /\.(png|jpg|jpeg|gif|webp)$/i;
  if (u.startsWith('/uploads/') && extRegex.test(u)) return true;
  try {
    const parsed = new URL(u);
    if ((parsed.protocol === 'http:' || parsed.protocol === 'https:') && extRegex.test(parsed.pathname)) return true;
  } catch (e) {
    // not a full URL
  }
  if (u.startsWith('data:image/')) return true;
  return false;
}

export function validatePhone(phone) {
  if (!phone) return { valid: true }; // optional phone allowed
  const digits = phone.replace(/\D/g, '');
  if (digits.length !== 10) {
    return { valid: false, message: 'Phone number must contain exactly 10 digits.' };
  }
  if (!/^\d{10}$/.test(digits)) {
    return { valid: false, message: 'Phone number must contain only digits.' };
  }
  return { valid: true };
}

export function validateName(name, maxChars = NAME_MAX_CHARS) {
  if (!name || name.trim().length === 0) {
    return { valid: false, message: 'Name is required.' };
  }
  const length = name.trim().length;
  if (length > maxChars) {
    return { valid: false, message: `Name must be at most ${maxChars} characters (currently ${length}).` };
  }
  return { valid: true };
}

export function validateEmail(email) {
  if (!email || email.trim().length === 0) {
    return { valid: false, message: 'Email is required.' };
  }
  const length = email.trim().length;
  if (length > EMAIL_MAX_CHARS) {
    return { valid: false, message: `Email must be at most ${EMAIL_MAX_CHARS} characters (currently ${length}).` };
  }
  // Basic email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return { valid: false, message: 'Please enter a valid email address.' };
  }
  return { valid: true };
}

export function validateMobile(mobile, maxChars = MOBILE_MAX_CHARS) {
  if (!mobile || mobile.trim().length === 0) {
    return { valid: true }; // optional mobile
  }
  const length = mobile.trim().length;
  if (length > maxChars) {
    return { valid: false, message: `Mobile must be at most ${maxChars} characters (currently ${length}).` };
  }
  return { valid: true };
}

export function validateAddress(address, maxChars = ADDRESS_MAX_CHARS) {
  if (!address || address.trim().length === 0) {
    return { valid: true }; // optional address
  }
  const length = address.trim().length;
  if (length > maxChars) {
    return { valid: false, message: `Address must be at most ${maxChars} characters (currently ${length}).` };
  }
  return { valid: true };
}

export default { 
  validateTitle, 
  validateDescription, 
  validatePhone,
  validateName,
  validateEmail,
  validateMobile,
  validateAddress,
  TITLE_MAX_CHARS, 
  DESCRIPTION_MAX_CHARS,
  NAME_MAX_CHARS,
  EMAIL_MAX_CHARS,
  MOBILE_MAX_CHARS,
  ADDRESS_MAX_CHARS
};
