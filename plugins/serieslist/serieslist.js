'use strict';

module.exports = function (hexo, args) {
  const targetSeries = args.shift() || '';

  // Quick fix, I don't know exactly why.
  // It works just fine without this line on Node 8.x, but on Node 10.x,
  // the `hexo.locals.posts` we got here becomes incomplete. So we have to
  // assign the values again manually. Such a weird problem, damn it.
  hexo._bindLocals();
  const posts = hexo.locals.get('posts').find({ ['series']: targetSeries });

  const listItems = posts.map(
    ({ title, uuid }) => `<li><a href="/posts/${uuid}">${title}</a></li>`
  );
  return `<ul>${listItems.join('')}</ul>`;
};
