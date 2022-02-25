import yaml from 'yaml.macro';

/*
    Edit this comment or add a comment to force babel to recompile
    -------
    reference:
    https://github.com/kentcdodds/babel-plugin-macros#babel-cache-problem
*/

/*
  For TESTS:
  If you edit any config file you should clear Jest cache by running npm run clear-test-cache
*/

/**
 * @namespace
 * @alias config              - Contains all configs in yaml and json format
 * @property {object} matomo  - Allowed modules and methods for matomo queries
 */
const config = {
  matomo: yaml('./config.yaml'),
};

export default config;
