// resources
const ALL_RESOURCES_CONST = '*';
const OWN_RESOURCES_CONST = 'uid';

// helps building a policy
const POLICY_TEMPLATE = {
  resource: '*',
  actions: ['']
}

// This one goes to custom claims
const ROLE_TEMPLATE = {
  role_id: '',
  policies: []
};

const ROLE_ACTIONS = {
  create: "role:create",
  edit: "role:edit",
  show: "role:show",
  delete: "role:delete"
}


module.exports = {
  ALL_RESOURCES_CONST,
  OWN_RESOURCES_CONST,
  ROLE_ACTIONS,
  POLICY_TEMPLATE,
  ROLE_TEMPLATE
}