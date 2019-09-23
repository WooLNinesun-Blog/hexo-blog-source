/* global hexo */

'use strict';

var seriesList = require('./serieslist');

hexo.extend.tag.register('serieslist', function (args) {
  if (seriesList) {
    return seriesList(hexo || this, args);
  }
  return '';
}, { ends: false, async: false });
