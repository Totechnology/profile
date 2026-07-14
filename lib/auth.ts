export {
  ADMIN_SESSION_COOKIE as SESSION_COOKIE,
  createAdminSession,
  destroyAdminSession,
  requireAdmin,
  verifyAdminPassword,
  verifyAdminSession as isAdminAuthenticated,
  verifyAdminSession
} from "@/lib/auth/admin-session";
