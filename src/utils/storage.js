// Generic localStorage helpers — reused across the whole app

export function loadData(key, fallback = []) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error loading', key, err);
    return fallback;
  }
}

export function saveData(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error('Error saving', key, err);
  }
}

export function generateId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}

export function generateInvoiceNo(existingCount) {
  const num = String(existingCount + 1).padStart(4, '0');
  return `INV-${num}`;
}