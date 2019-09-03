---
uuid: 40753950-fd98-11e7-aad4-655261257056
title: Google Apps Script 建立簡易後端（一）
date: 2017-04-29 00:00:00
updated: 2018-01-11 00:00:00
tags: 
  - Google Apps Script
categories:
  - 興趣使然的隨筆雜談
---

前陣子基於興趣研究了 Google App Script (aka. GAS) 這個 Google 的服務，類似 microsoft 旗下 office 系列的 VBA。研究過程發現 GAS 有接收 http request 的功能，就想到能不能弄出用 Google SpreadSheet 當資料庫，GAS 當後台的網頁呢？
<!--more-->

# [正文]

在這一篇文章中，將會依序學到這些
* 如何建立一個 Google Apps Script Project
* Google Apps Script 取得及回應 HTTP Request 的方法
* 部屬 Google Apps Script Web App 的設定與其差別
* Google Apps Script Project 的簡單範例

{% note warning  %}
在讀這篇文章之前，應該要先具有以下條件在閱讀會比較好：
* 有一個 Google 帳號，且會使用 Google Services，如：Spreadsheets;
* 有一定的英文程度能閱讀 [API Document](https://developers.google.com/apps-script/) 來查詢 google app script 語法 ;
* 對於 HTML5 + CSS3 + JavaScript 的基本認知( 能看得懂，會寫更好 );
* 知道 HTTP GET Request 和 HTTP POST Request 的差別點
{% endnote %}

---

先進入 Google Drive 來創立一個 Google Apps Script Project

![](https://i.imgur.com/4sxK0s5.png)

不過第一次新增是不會有 Google Apps Script 的選項，所以要先選擇最下面的 Connect more apps 來新增想連結帳戶的應用程式。

![](https://i.imgur.com/15OJ8Rc.png)

右上角的收尋框輸入 Google Apps Script 第一個就是了，然後直接按下 CONNECT！

{% note info  %}
可能會出現一個選項，主要是在說使用 Google Drive 時這個 APP 能開啟的檔案都預設成用這個 APP 開啟，勾不勾選都沒關係，不會造成影響。直接按下 OK 就好。
{% endnote %}

![](https://i.imgur.com/cm2RvR4.png)

再去新增裡找看看，就會發現多了 Google Apps Script 拉，大力的點下去就對了！

![](https://i.imgur.com/D6GxuUZ.png)

看到這個畫面，代表已經進入 Google App script 開發的大門內搂~ 最重要的第一步是先為這個專案命名，然後時常保持 Ctrl + S 存檔的習慣。

---

根據 [GAS Web App](https://developers.google.com/apps-script/guides/web) 的說明，GAS 在
* 收到 HTTP GET  Request 後會去執行 doGet(e) ;
* 收到 HTTP POST Request 後會去執行 doPost(e) ;

我們將直接實作 Get Request 的部分，POST Request 的部分和 GET Request 差不多，就自行發揮 ( 在最下面有 Example Code )。

myFunction() 之後用不到，可以直接刪除或替換成 doGet(e)。而 doGet(e) 的 e 是一個儲存 Request 資料的結構。文件很清楚的寫著 e.parameter 存了 Get 傳遞的資料。

如果 GET Request URL = https://script.google.com/.../exec<span style="color: #ff0000;">?name=WooLNinesun&amp;age=1000
</span> 則經由下面的 Example Code 可以輕鬆的取得 GET Request 的傳遞參數

{% gistcode
	WooLNinesun/5450acf8d0526327056bd8e54266d812
	GAS.gs 1 18
	extension=javascript
	mark=5-6
%}

---

很好！我們現在學會了接收傳進來的資料，假設現在我們要將傳進來的資料做一些處理，例如讓自己永遠 18 歲 ( 假資料 4 ni ?! )，然後把資料展示傳回給請求端。


根據 GAS Web App 的說明，我們可以用 [HTML service](https://developers.google.com/apps-script/guides/html) ( 回傳 html 頁面 ) 或 [Content service](https://developers.google.com/apps-script/guides/content) ( 回傳純資料 ) 把資料展示回傳給請求端。以下將直接示範三個例子。

### Returning Plain Text

我們直接使用 Content service 的 [ContentService.createTextOutput();](https://developers.google.com/apps-script/reference/content/)

{% gistcode
	WooLNinesun/5450acf8d0526327056bd8e54266d812
	GAS_Plain_Text_output.gs
	extension=javascript
	mark=11
%}

### Returning JSON
若是想要將資料轉換成常用 json 格式的話，使用 JSON.stringify() 就能夠輕鬆的搞定

{% gistcode
	WooLNinesun/5450acf8d0526327056bd8e54266d812
	GAS_JSON_output.gs
	extension=javascript
	mark=14,16-17
%}

### Returning HTML
如果想要直接回傳一個 html 介面，就要使用 HTML service 拉，不過看到這種 html + css + js 夾雜的 code 會想吐血就是了。

{% gistcode
	WooLNinesun/5450acf8d0526327056bd8e54266d812
	GAS_HTML_output.gs
	extension=javascript
	mark=13
%}

---

就這樣學會了可以接收資料和展示回傳資料的功能，接下來會說明如何測試和部屬 Web App 。測試的部分，我們只要建立一個函數去呼叫 doGet(e) 就可以了，例如

{% gistcode
	WooLNinesun/5450acf8d0526327056bd8e54266d812
	GAS.gs 12 32
	extension=javascript
	mark=29
%}

![](https://i.imgur.com/kdWUZex.png)

然後在 Select function 的地方選擇 debug ，在按下 Debug ( 蟲蟲 ) 或 Run ( 向右三角形 ) 就會開始執行瞜，途中發生錯誤就會停下並告知。

![](https://i.imgur.com/2b3RmGx.png)

當測試結束沒問題時就可以部屬 Web App 拉，Publish -&gt; Deploy as web app ......

![](https://i.imgur.com/VOUAx8l.png)

&nbsp;
* Project version: 選擇要部屬儲存的哪一個版本。( 詳細說明就不多做解釋了 )
* Execute ths app as: 選擇執行 App 的身分為何，選項有
	* Me(...) 是自己，意思是讓任何可以 Access 的人以你的身分執行你寫的 GAS
	* User accessing thw web app 是其他可以 Access 且有登入的的使用者。
* Who has access to the app: 誰可以 access 你寫的 GAS，可以是
	* only myself ( 只有自己 )
	* anyone ( 任何有登入的使用者 )
	* anyone, even anonymous
	( 任何人，含未登入，只有在 Execute ths app as 選擇 Me(...) 的時候會出現。 )

設定好後，按下 Deplay  後應該會得到一串網址長得像下面這樣

https://script.google.com/macros/s/<span style="color: #ff0000;">GASID</span>/exec  ( GASID 每個人都不一樣 )

這就是 Web app 的網址 ，不同部屬設定有不同的應用方式，以下是一些範例

{% tabs GAS setting example %}
<!-- tab HTML output -->
### EX1. GAS_HTML_output.gs (上面的範例)
部屬設定為：
* Execute ths app as: <span style="color: #0000ff;">User accessing thw web app</span>
* Who has access to the app: <span style="color: #0000ff;"><span style="color: #ff9900;">anyone</span> </span>

[https://script.google.com/macros/s/<span style="color: #ff0000;">GASID</span>/exec<span style="color: #ff0000;">?name=WooLNinesun&amp;age=1000</span>](https://script.google.com/macros/s/AKfycbwjpGQA7MoCQ5PS3tGc2mzJ__9dw1d6QT2tngU-9QVCT3Knwe9M/exec?name=WooLNinesun&amp;age=1000")

就會變成只有<span style="color: #0000ff;"><span style="color: #ff9900;">有登入的使用者</span><span style="color: #000000;">用</span>他們自己的身分<span style="color: #000000;">去執行 App，然後得到一個</span></span>網頁~ 未登入的使用者會被要求登入。
<!-- endtab -->

<!-- tab Plain Text output -->
### EX2. GAS_Plain_Text_output.gs (上面的範例)

部屬設定為：
* Execute ths app as: <span style="color: #0000ff;">Me(...)</span>
* Who has access to the app: <span style="color: #ff9900;">anyone </span>

[https://script.google.com/macros/s/<span style="color: #ff0000;">GASID</span>/exec<span style="color: #ff0000;">?name=WooLNinesun&amp;age=1000</span>](https://script.google.com/macros/s/AKfycbzHB8b4LEp7NMtP8CVE9akvTQzs7CqQyNqMwoDP5QdXtNLPJx8/exec?name=WooLNinesun&amp;age=1000)

就會變成只有<span style="color: #ff9900;">有登入的使用者</span>用<span style="color: #0000ff;">我的身分</span>去執行 App 然後得到一串 String。
<!-- endtab -->

<!-- tab GAS JSON output -->
### EX3. GAS_JSON_output.gs (依然上面的範例)

部屬設定為：
* Execute ths app as: <span style="color: #0000ff;">Me(...)</span>
* Who has access to the app: <span style="color: #ff9900;">anyone, even anonymous</span>

[https://script.google.com/macros/s/<span style="color: #ff0000;">GASID</span>/exec<span style="color: #ff0000;">?name=WooLNinesun&amp;age=1000</span>](https://script.google.com/macros/s/AKfycbyAm9Us_5cYL4N_N0YI37IN1LrV5mza6VcVu9hhd9Fc07SjiUg/exec?name=WooLNinesun&amp;age=1000)

就會變成<span style="color: #ff9900;">任何人</span>使用<span style="color: #0000ff;">我的身分</span>去執行 App 然後得到一串 Json String。
<!-- endtab -->

<!-- tab GAS POST Input -->
### EX4. GAS_POST_Input.gs ([Example code](https://gist.githubusercontent.com/WooLNinesun/5450acf8d0526327056bd8e54266d812/raw/GAS_POST_Input.gs))

部屬設定為：
* Execute ths app as: <span style="color: #0000ff;">Me(...)</span>
* Who has access to the app: <span style="color: #ff9900;">anyone, even anonymous</span>

[Run example.4 code in jsbin](http://jsbin.com/haxoti/edit?html,js,console)
因為是 POST Request，沒辦法簡單的用 URL 去實作資料傳遞，所以用 JSBin 去提供執行環境。右上角的 run 按下去就會向 GAS 發出一個 POST Request 搂。
<!-- endtab -->
{% endtabs %}

以上就是簡單的四個範例，可以試試看將開啟的連結拿去無痕式的視窗開啟，看看差異。

# [總結]

本篇主要重點在於用 GAS 建立一個小型的 Web App 後端，其最大的用途不是可以輸出 html 檔，而是利用 GAS 可以結合其他 Google Service 的服務，像是 Spreadsheets ( 試算表 )、Drive ( 雲端硬碟 ) 或 Photo ( 照片 )，進而利用 Ajax 技術來存取各項資料。比如說今天用 ajax 向一個 GAS 發出 name=WooLNinesun 的 GET  Request，GAS 接收到資料後，開啟名為 UserData 的 Spreadsheets  取出對應的 age 資料，然後在回傳。這樣就形成了簡單的資料庫瞜！下一篇會介紹 GAS 如何存取其他 Google Service 的服務 ~
