const ROLES = Object.freeze({
  ADMIN: "admin",
  MENTOR: "mentor",
  INTERN: "intern"
});

const ROLE_VALUES = Object.freeze(Object.values(ROLES));

module.exports = {
  ROLES,
  ROLE_VALUES
};
