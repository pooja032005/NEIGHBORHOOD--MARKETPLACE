// Shared validation helpers for frontend forms (character limits + phone)
export const TITLE_MAX_CHARS = 70; // max characters for title
export const DESCRIPTION_MAX_CHARS = 3000; // max characters for description

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

export default { validateTitle, validateDescription, validatePhone, TITLE_MAX_CHARS, DESCRIPTION_MAX_CHARS };
