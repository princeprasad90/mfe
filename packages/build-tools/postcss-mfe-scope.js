/**
 * PostCSS plugin to automatically scope MFE styles
 * 
 * Transforms:
 *   .container { color: red; }
 * Into:
 *   [data-mfe="cbms"] .container { color: red; }
 * 
 * This prevents style conflicts between MFEs without any manual work.
 */

module.exports = (opts = {}) => {
  const { scope, attribute = 'data-mfe' } = opts;

  if (!scope) {
    throw new Error('postcss-mfe-scope requires a "scope" option');
  }

  const scopeSelector = `[${attribute}="${scope}"]`;

  // Selectors to skip scoping
  const skipSelectors = [':root', 'html', 'body', ':host', '*'];
  
  // At-rules where we shouldn't modify selectors
  const skipAtRules = ['keyframes', 'font-face', 'import', 'charset', 'namespace'];

  return {
    postcssPlugin: 'postcss-mfe-scope',

    Rule(rule) {
      // Skip if inside @keyframes, @font-face, etc.
      if (rule.parent?.type === 'atrule') {
        const atRuleName = rule.parent.name?.toLowerCase();
        if (skipAtRules.includes(atRuleName)) {
          return;
        }
      }

      // Skip if already scoped
      if (rule.selector.includes(scopeSelector)) {
        return;
      }

      // Transform each selector
      rule.selectors = rule.selectors.map(selector => {
        const trimmed = selector.trim();

        // Skip global selectors
        if (skipSelectors.some(skip => trimmed === skip || trimmed.startsWith(skip + ' '))) {
          return selector;
        }

        // Skip selectors that start with :root or html
        if (/^(:root|html|body)\b/.test(trimmed)) {
          return selector;
        }

        // Scope the selector
        return `${scopeSelector} ${trimmed}`;
      });
    },

    // Also handle @media, @supports, etc. (nested rules)
    AtRule(atRule) {
      // Process rules inside @media, @supports
      if (['media', 'supports', 'layer'].includes(atRule.name?.toLowerCase())) {
        atRule.walkRules(rule => {
          if (rule.selector.includes(scopeSelector)) {
            return;
          }

          rule.selectors = rule.selectors.map(selector => {
            const trimmed = selector.trim();
            if (skipSelectors.some(skip => trimmed === skip)) {
              return selector;
            }
            return `${scopeSelector} ${trimmed}`;
          });
        });
      }
    }
  };
};

module.exports.postcss = true;
