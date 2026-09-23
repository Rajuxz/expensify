// Runnable self-check: `npx tsx lib/admin/permissions.check.ts`
import assert from "node:assert/strict"
import { canChangeRole, canEditCredentials, type Target } from "./permissions"

const superAdmin = { id: "sa", role: "SUPER_ADMIN" as const }
const admin = { id: "a", role: "ADMIN" as const }

const user: Target = { id: "u", role: "USER", envManaged: false }
const otherAdmin: Target = { id: "a2", role: "ADMIN", envManaged: false }
const uiSuper: Target = { id: "s2", role: "SUPER_ADMIN", envManaged: false }
const envSuper: Target = { id: "s3", role: "SUPER_ADMIN", envManaged: true }
const self: Target = { id: "sa", role: "SUPER_ADMIN", envManaged: false }

// roles: super admin can change anyone except self and env super admins
assert.equal(canChangeRole(superAdmin, user), true)
assert.equal(canChangeRole(superAdmin, otherAdmin), true)
assert.equal(canChangeRole(superAdmin, uiSuper), true)
assert.equal(canChangeRole(superAdmin, envSuper), false)
assert.equal(canChangeRole(superAdmin, self), false)
// admins are view-only
assert.equal(canChangeRole(admin, user), false)

// credentials: only USER / ADMIN targets, super admin actor only
assert.equal(canEditCredentials(superAdmin, user), true)
assert.equal(canEditCredentials(superAdmin, otherAdmin), true)
assert.equal(canEditCredentials(superAdmin, uiSuper), false)
assert.equal(canEditCredentials(superAdmin, envSuper), false)
assert.equal(canEditCredentials(superAdmin, self), false)
assert.equal(canEditCredentials(admin, user), false)

console.log("permissions.check: all passed")
