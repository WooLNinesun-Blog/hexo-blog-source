'use strict';

var https = require('https');
var path = require('path');

function get_code(url, callback) {
  var data = '';
  https.get(url, res => {
    res.setEncoding('utf8');
    res.on('data', line => { data += line; });
    res.on('end', () => { callback(data); });
  });
}

function str2obj(s) {
  s = s.trim();
  if (s === 'true') {
    return true;
  } else if (s === 'false') {
    return false;
  }
  return s;
}

function get_result(code, filename, url, options, code_tag) {
  code = code.split(/\r\n|\r|\n/).slice(options.start - 1, options.stop).join('\n');

  let arg = [];
  if (options.caption) {
    arg = [filename, `lang:${options.extension}`, url, options.urltxt];
  } else {
    arg = [`lang:${options.extension}`];
  }
  if (options.mark != '') { arg.push(`mark:${options.mark}`); }
  arg.push(`first_line:${options.start}`);

  return code_tag(arg, code);
}

function get_options(config, filename, args) {
  // default value
  let options = {
    extension: path.extname(filename).slice(1),
    start: -1,
    stop: -1,
    mark: '',
    caption: true,
    urltxt: 'source'
  };

  // hexo config value
  if (config) {
    if ('caption' in config) { options.caption = config.caption; }
    if ('urltxt' in config) { options.urltxt = config.urltxt; }
  }

  // tag arguments value
  args.forEach(value => {
    let value_split = value.split(':');
    if (!value_split[1]) {
      if (options.start === -1) {
        options.start = value;
      } else if (options.stop === -1) {
        options.stop = value;
      }
    } else {
      options[value_split[0]] = str2obj(value_split[1]);
    }
  });

  if (options.caption !== true) { options.caption = false; }

  if (options.start === -1) { options.start = 1; }
  if (options.stop === -1) { options.stop = undefined; }

  return options;
}

module.exports = function(hexo, args) {
  let code_tag = hexo.extend.tag.env.extensions.code.fn;
  let gistid = args.shift(); // args[0];
  let filename = args.shift(); // args[1];
  let options = get_options(hexo.config.gist_code, filename, args);

  let raw_url = `https://gist.githubusercontent.com/${gistid}/raw/${filename}`;
  return new Promise((resolve, reject) => {
    get_code(raw_url, code => {
      resolve(get_result(code, filename, raw_url, options, code_tag));
    });
  });
};
