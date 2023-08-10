const POLICY_TEMPLATE = {
  resource: '*',
  policies: ['']
}

const ROLE_PERMISSIONS = {
  create: "role:create",
  edit: "role:edit",
  show: "role:show",
  delete: "role:delete"
}

module.exports = {
  ROLE_PERMISSIONS,
  POLICY_TEMPLATE
}