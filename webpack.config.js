'use strict';
const webpack = require('webpack');

function stringifyValues(object = {}) {
    return Object.entries(object).reduce((acc, curr) => ({ ...acc, [`${curr[0]}`]: JSON.stringify(curr[1]) }), {});
}
function getEnvConfig() {
    let envConfig = require('dotenv')?.config()?.parsed || {};
    envConfig = { ...stringifyValues(process.env), ...stringifyValues(envConfig) };
    return envConfig;
}

let customEnvConfig = getEnvConfig();

/**
 * Custom webpack configuration
 */
module.exports = {
    plugins: [
        new webpack.IgnorePlugin({
            resourceRegExp: /^\.\/locale$/,
            contextRegExp: /moment$/,
        }),
        new webpack.DefinePlugin({ 'process.env': customEnvConfig }),
    ],
};
