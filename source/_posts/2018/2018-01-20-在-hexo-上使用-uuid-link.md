---
uuid: 7848d740
title: 在 Hexo 上使用 uuid link
tags:
  - Hexo
  - Hexo-plugins
categories:
  - Hexo 胡攪瞎搞
date: 2018-01-20 12:29:14
updated: 2018-02-12 14:14:00
---

對於一個喜歡不斷修改文章內容甚至標題的人來說，每次修改都會讓 hexo 產生的文章 url 變化，不利於 SEO 和文章的分享。再來也是因為這是一個中文的 blog ，難免會使用中文當標題，產生的連結就會很長 ( 瀏覽器會幫你轉成中文，但實際上很長 )，所以必須想個**避免出現中文**和**固定 url** 的方法！
<!--more-->

# [正文]

咱想到增加一個固定不變的文章屬性當作 permalink 的結構，例如 uuid 或其他需要種子的 md5 , base64，然後把 permalink 格式改為 `posts/:uuid/` ！


搜尋了一下馬上就找到 [hexo-uuid](https://chekun.me/post/hexo-uuid) 這個 plugin ( 這個 plugin 的作者自己卻沒使用 Orz )

進到 hexo blog 的根目錄然後安裝

```shell
npm install hexo-uuid --save
```

按照說明，他是使用 hexo 新增文章的指令來生成 uuid

```shell
hexo new xxx // xxx 是文章的標題
```

然後再 `source/_post/xxx.md` 會看到上面的 yml 出現 uuid 的屬性。

```yml
---
uuid: 7848d740-fd9a-11e7-ba72-ab02344a9ad8
title: xxx
... other
---
```
> `... other` 的地方會依據你 `scaffolds/post.md` 的定義建構。

完成安裝和建構 uuid 的屬性後接下來就是要設定 hexo 的 `_config.yml`，修改 permalink 的設定

```yml
# permalink: :year/:month/:day/:title/
permalink: posts/:uuid/
```

這樣就完成了 hexo-uuid 設置瞜，之後文章的 url 就會變成文章中 `yml` 設定的 `uuid` 了！

---

不過這樣變成每次生成文章都要輸入 `hexo new` 的指令，對一個習慣直接開 .md 檔寫文章的人來說感覺就是多了一道程序，希望能在未添加 `uuid` 屬性的文章自動增加再生成靜態檔案！

既然他是 open source，就直接來修改 code 吧！先把 repo foke 出來修改，因為要在 render 之前先檢查文章中有沒有 uuid 的屬性，所以在 `index.js` 中和 hexo 註冊 before_post_render 的事件，並傳入需要執行的 function。

```js index.js before
'use strict';

const HexoUuid = require('./lib/hexo-uuid');

hexo.on('new', HexoUuid);
```

```js index.js after
'use strict';

const HexoUuid = require('./lib/hexo-uuid');

hexo.on('new', HexoUuid.newPost);
hexo.extend.filter.register('before_post_render', HexoUuid.before_renderPost);
```

然後再 `hexo_uuid.js` 新增 HexoUuid.before_renderPost 的本體！

```js hexo-uuid.js before
'use strict';

const uuid = require('uuid');
const fs = require('fs');

module.exports = (post) => {
  ...
};
```

```js hexo-uuid.js after
'use strict';

const uuid = require('uuid');
const fs = require('fs');

module.exports.newPost = (post) => {
  ...
};

module.exports.before_renderPost = (post) => {
  if (post.layout == 'post' && (!post.uuid || post.uuid == '')) {
    let lines = post.raw.split('\n');
    let index = lines.findIndex(item => item === 'uuid:');
    post.uuid = uuid.v1();
    if (index > -1) {
      lines[index] += (' ' + post.uuid);
    } else {
      lines.splice(1, 0, 'uuid: ' + post.uuid);
    }
    post.raw = lines.join('\n');
    fs.writeFile(post.full_source, post.raw);
  }
};
```

這樣就完成了！之後文章中沒有 uuid 屬性的話，就會直接在文章中增加 uuid 屬性，就不用特地打 hexo new xxx 才能開始寫文章了。

---

##### Q1: [Permalink](https://hexo.io/zh-tw/docs/permalinks.html) 格式不好嗎，看到鏈結就能馬上知道文章標題和時間呢？

咱認為這樣的設置比較適合一但**發佈/公開文章就不會再修改的網站**，對咱來說就非常不適合了，咱發布文章後偶而會在回去看以前的文章，一旦腦袋閃過更好的內文描述方式就會去修改(對標題也一樣)。但修改標題後 url 也會發生變化，等同於**以前的分享都會失效**。也許會有人問其他格式的 permalink 呢？咱想只要是 hexo 預設的都不太適合，都不能保證不會改變。

##### Q2: 使用 [hexo-abbrlink](https://post.zz173.com/detail/hexo-abbrlink.html) 這個插件不行嗎？
老實說咱有心動一下，但是基於之前在 wordpress 的文章是使用 uuid 當 post_id，為了移轉的方便性，就不使用這個 plugin 了，雖然方便性比咱要使用的 hexo-uuid 方便，但既然是 open source 的，那就修改過就好！

---

## UPDATE INFO

#### 2018/01/23

發給 uuid 原作者的 PR ( pull request ) 被接受了，所以原本的 uuid 插件現在也有這份 code 搂
#### 2018/02/12

發現在 hexo server 的狀態下修改文章，文章如果是空白的會讓它不斷地增加 uuid，於是修正了判斷式

```js hexo-uuid.js defore
module.exports.before_renderPost = (post) => {
  if (post.layout == 'post' && (!post.uuid || post.uuid == '')) {
    ...
  }
```
```js hexo-uuid.js after
module.exports.before_renderPost = (post) => {
  if (
    post.layout == 'post' &&
    post.title != '' &&
    (!post.uuid || post.uuid == '')
  ) {
    ...
  }
```

#### 2018/11/23

為了統一我 blog 上所有 hexo 插件的名字，把 hexo-uuid 改名成 hexo-plugin-uuid。

#### 2019/01/25

用到後面覺得自己在文章新增 uuid 的屬性比較快，於是就把 hexo-plugin-uuid 從我的 project 中移除了，如果想使用的話，原作者的 hexo-uuid 還可以使用噢
