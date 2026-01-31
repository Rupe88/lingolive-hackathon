/** @type {import('lingo.dev').Config} */
module.exports = {
    sourceLocale: "en",
    locales: ["es", "fr", "de", "ja", "ne"],
    catalogs: [
        {
            path: "<rootDir>/locales/{locale}.json",
            include: ["app/**/*", "components/**/*"]
        }
    ],
    format: "rich"
};
