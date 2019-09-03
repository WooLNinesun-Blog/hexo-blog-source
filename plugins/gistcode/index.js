/* global hexo */

'use strict';

var gistcode = require('./gistcode');

hexo.extend.tag.register('gistcode', function(args) {
  if (gistcode) {
    return gistcode(hexo, args);
  }
  return '';
}, { async: true });
