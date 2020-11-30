import yaml from "yaml.macro";

/* 
    Edit this comment or add a comment to force babel to recompile
    
    reference:
    https://github.com/kentcdodds/babel-plugin-macros#babel-cache-problem
*/

const config = {
  matomo: yaml("./methods.yaml"),
};

export default config;
