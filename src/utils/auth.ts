// utils/auth.ts

const TokenKey = 'access_token';
const TokenPrefix = 'Bearer ';

/**
 * 是否已登录（token 存在）
 */
const isLogin = (): boolean => {
  return !!localStorage.getItem(TokenKey);
};

/**
 * 获取 access_token
 */
const getToken = (): string | null => {
  return localStorage.getItem(TokenKey);
};

/**
 * 设置 access_token
 */
const setToken = (token: string): void => {
  localStorage.setItem(TokenKey, token);
};

/**
 * 清除 access_token
 */
const clearToken = (): void => {
  localStorage.removeItem(TokenKey);
};

/**
 * 解析 token 获取 payload
 */
const getPayloadFromToken = (): Record<string, any> | null => {
  const token = getToken();
  if (!token) return null;

  try {
    const payload = token.split('.')[1]; // JWT 的中间部分
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
};

/**
 * 从 token 中获取用户名
 */
const getUsernameFromToken = (): string => {
  const payload = getPayloadFromToken();
  return payload?.username || '用户';
};

const DOCTOR_ROLES = new Set([
  'FAMILY_DOCTOR',
  'ATTENDING_DOCTOR',
  'CROSS_HOSPITAL_DOCTOR',
  'EMERGENCY_DOCTOR',
]);

/**
 * 获取原始角色代码（不做分类）
 */
const getRoleCodeFromToken = (): string => {
  const payload = getPayloadFromToken();
  return payload?.role_code || '';
};

/**
 * 获取标准化后的角色分类（将多个医生角色统一归为 doctor）
 */
const getGeneralRoleFromToken = (): string => {
  const rawRole = getRoleCodeFromToken();

  if (DOCTOR_ROLES.has(rawRole)) {
    return 'DOCTOR';
  }

  return rawRole|| '';
};

/**
 * 从 token 中获取用户的组
 */
const getGroupNameFromToken = (): string => {
  const payload = getPayloadFromToken();
  return payload?.group_name || '用户';
};


export {
  TokenKey,
  TokenPrefix,
  isLogin,
  getToken,
  setToken,
  clearToken,
  getPayloadFromToken,
  getUsernameFromToken,
  getRoleCodeFromToken,
  getGeneralRoleFromToken,
  getGroupNameFromToken,
};
