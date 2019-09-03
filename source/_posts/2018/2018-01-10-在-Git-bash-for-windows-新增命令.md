---
uuid: 3e7c0160-fd98-11e7-a70a-5f44a232a828
title: 在 Git-bash for windows 新增命令
date: 2018-01-10 00:00:00
updated: 2018-01-12 00:00:00
tags:
  - Git-bash
categories:
  - 興趣使然的隨筆雜談
---

現在已經很習慣在 win10 的環境下用 ConEmu 開 Git-bash 輸入命令。不過 Git-bash 只收入基本的常用命令，有些命令是找不到的，例如 `make`、`wget` 等，於是就研究了一下怎麼在 Git-bash 上增加命令。順便附上我已經額外新增的命令列表。

<!--more-->

# [正文]

首先，命令都是由一個個可執行的檔案組成的，Git-bash 也不例外。在 Git-bash 上執行命令時，會去 `C:\Program Files\Git\usr\bin\` 資料夾裡面找相同名稱的執行檔，然後執行並將命令參數餵給它。觀察資料夾裡的檔案可以發現很多執行檔的名稱和命令名稱一樣。

所以增加命令的方法大致上就是找到可以在 win10 上執行的命令程式，然後放進 `C:\Program Files\Git\usr\bin\` 資料夾裡。

---

以下是我已經在 Git-bash for windows 上額外增加的命令
( 簡化 `\bin\` == `C:\Program Files\Git\usr\bin\` )

## wget: 
1. 下載頁面: [https://eternallybored.org/misc/wget](https://eternallybored.org/misc/wget/)
2. 下載 GUN wget binary for windows
  * 可以選擇有附 Document 的壓縮檔( .zip ) 或單一的可執行檔( .exe )
3. 解壓縮後將 exe 檔改名成 wget.exe ，在移到 `\bin\` 裡面

## make:
1. 下載頁面: [https://sourceforge.net/projects/ezwinports/files](https://sourceforge.net/projects/ezwinports/files/)
2. 到 ezwinports 的頁面下載 make-4.2-1-without-guile-w32-bin.zip
  * `4.2-1` 是我當時下載的版本，日後下載版本可能會有所變化
3. 解壓縮後將 make.exe 移到 `\bin\` 裡面

## tree:
1. 下載頁面: [http://gnuwin32.sourceforge.net/packages/tree.htm](http://gnuwin32.sourceforge.net/packages/tree.htm)
2. 下載 Download 項目的 Binaries
3. 解壓縮後將 bin/tree.exe 移到 `\bin\` 裡面

## strings:
1. 下載頁面: [https://docs.microsoft.com/en-us/sysinternals/downloads/strings](https://docs.microsoft.com/en-us/sysinternals/downloads/strings)
2. 直接點擊 Download Strings 下載
3. 解壓縮後將 strings64.exe 改名 strings.exe ，然後移到 `\bin\` 裡面
  * 本羊的作業系統是 64 位元，才選 strings64.exe ，如果你的系統是 32 位元就選擇另一個 .exe 檔
