import yaml from "yaml.macro";

/* 
    Edit this comment or add a comment to force babel to recompile
    
    reference:
    https://github.com/kentcdodds/babel-plugin-macros#babel-cache-problem
*/

/**
 * @namespace
 * @alias config              - Contains all configs in yaml and json format 
 * @property {object} matomo  - Allowed modules and methods for matomo queries
 */
const config = {
  matomo: yaml("./methods.yaml"),
};

export default config;
