const PERMISSIONS_STORAGE_KEY = 'permissions';

/**
 * Returns the current user's permissions array from localStorage.
 * @returns {string[]} Array of permission names (e.g. ["Create RFQ", "Purchase"])
 */
export const getPermissions = () => {
  try {
    const stored = localStorage.getItem(PERMISSIONS_STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

/**
 * Checks if the user has a single permission.
 * @param {string} permission - Permission name to check (e.g. "Create RFQ")
 * @returns {boolean}
 */
export const hasPermission = (permission) => {
  if (!permission) return false;
  const permissions = getPermissions();
  return permissions.includes(permission);
};

/**
 * Checks if the user has at least one of the given permissions.
 * @param {string[]} permissionsToCheck - Array of permission names
 * @returns {boolean}
 */
export const hasAnyPermission = (permissionsToCheck) => {
  if (!Array.isArray(permissionsToCheck) || permissionsToCheck.length === 0) return false;
  const userPermissions = getPermissions();
  return permissionsToCheck.some((p) => userPermissions.includes(p));
};

/**
 * Checks if the user has all of the given permissions.
 * @param {string[]} permissionsToCheck - Array of permission names
 * @returns {boolean}
 */
export const hasAllPermissions = (permissionsToCheck) => {
  if (!Array.isArray(permissionsToCheck) || permissionsToCheck.length === 0) return false;
  const userPermissions = getPermissions();
  return permissionsToCheck.every((p) => userPermissions.includes(p));
};
