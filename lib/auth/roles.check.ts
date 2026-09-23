// Runnable self-check for role rules: `npx tsx lib/auth/roles.check.ts`
import assert from "node:assert/strict"
import {
    hasRole,
    getSuperAdminEmails,
    isEnvSuperAdmin,
    resolveSuperAdminRole,
} from "./roles"

const emails = getSuperAdminEmails(" Owner@Example.com, ,cto@x.io ")
assert.deepEqual([...emails], ["owner@example.com", "cto@x.io"])

// rank comparison
assert.equal(hasRole("SUPER_ADMIN", "ADMIN"), true)
assert.equal(hasRole("ADMIN", "ADMIN"), true)
assert.equal(hasRole("USER", "ADMIN"), false)
assert.equal(hasRole("ADMIN", "SUPER_ADMIN"), false)

// env membership (case-insensitive, null-safe)
assert.equal(isEnvSuperAdmin("CTO@x.io", emails), true)
assert.equal(isEnvSuperAdmin("someone@x.io", emails), false)
assert.equal(isEnvSuperAdmin(null, emails), false)

// listed email -> promoted, from any role
assert.equal(
    resolveSuperAdminRole("USER", "OWNER@example.com", emails),
    "SUPER_ADMIN"
)
assert.equal(resolveSuperAdminRole("ADMIN", "cto@x.io", emails), "SUPER_ADMIN")
// already super admin -> no write
assert.equal(resolveSuperAdminRole("SUPER_ADMIN", "cto@x.io", emails), null)
// UI-granted super admin (not in env) is NOT demoted
assert.equal(resolveSuperAdminRole("SUPER_ADMIN", "granted@x.io", emails), null)
assert.equal(resolveSuperAdminRole("SUPER_ADMIN", null, emails), null)
// not listed -> left alone
assert.equal(resolveSuperAdminRole("ADMIN", "someone@x.io", emails), null)
assert.equal(resolveSuperAdminRole("USER", null, emails), null)

console.log("roles.check: all passed")
