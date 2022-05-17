module.exports = {
    extends: ['@commitlint/config-angular'],
    rules: {
        'header-max-length': [0, 'always', 120],
        'scope-enum': [2, 'always', ['store', 'action', 'deps']]
    }
};
