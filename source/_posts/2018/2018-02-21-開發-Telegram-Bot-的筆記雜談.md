---
uuid: 51e7c290-16cd-11e8-8e9a-91e63720b28f
title: 開發 Telegram Bot 的筆記雜談
tags:
  - Telegram
  - Chat bot
  - Webhooks
categories:
  - 興趣使然的隨筆雜談
date: 2018-02-21 14:06:13
updated: 2018-02-21 14:06:13
---

利用 Github 的 issues 當 blog 的留言板 ( 詳細內容可以到 ` 關於 ` 的頁面看 )，但是 Github 預設是有人留言評論就會寄一封信，如果討論熱烈可能就會一直收到信，容易淹沒重要的信。反過來關閉的話收不到通知也是很麻煩，剛好最近開始用 telegram，就想說寫寫看 bot 做通知
<!--more-->

# [正文]

不管用什麼語言，只要會處理 https request 就可以寫，甚至是用 bash(cURL) 都能夠寫，實作和邏輯上都相差不大，基本上就只是處理 https request 而已。建立 bot 還比較麻煩一點 ( 不過就只是麻煩一點點而已 )。另外 API 隨時都有可能更新，文章會盡量更新，但建議還是多學會看官方的 [Document](https://core.telegram.org/bots/api)


## 0x00 => 和 BotFather 要一個 Telegram bot

要建立 bot 當然就要和 bot 申請，關於 bot 的一切都要透過 [@BotFather](https://telegram.me/botfather) 去設定，在 Telegram 在使用者搜尋找 @BotFather，和他對話就可以申請

對話輸入 `/newbot` ，BotFather 就會請您 **依序** 輸入
1. bot 顯示的名稱 ( 沒什麼限制，不要不雅名稱就好 )
2. bot 的 username ( 必須為 bot 結尾 ，長度需介於 5-32 字元 )

完成後會得到一串 Token ( 像是 `123456789:AAwool_B04-i`，長度可能每個 bot 都不一樣 )，Token 就等於是 bot 的密碼，請保存在安全的地方，如果不小心外洩可以請 BotFather Revoke 新的 Token 來讓舊的失效。到這裡已經可以在 Telegram 中找到自己的 bot，也可以發訊息給它，但還沒做任何設定所以不會回你。

## 0x01 => 使用 TG API 要注意的事情！

所有 TG Bot API 請求都是 `https://api.telegram.org/bot<Token>/<Method>` 的格式。另外 TG Bot API 支援使用 HTTPS GET 及 POST，
Method 參數可由以下四種方式挑喜歡的用 ( 對於這四種這裡有較詳細的解說 => [understand-http-about-content-type](http://homeway.me/2015/07/19/understand-http-about-content-type/)，有興趣的可以看看 )
* URL query string
  最通用的格式，像這樣 `https://api.telegram.org/bot<Token>/<Method>?key1=value1&key2=value2`
* application/json
  個人最推薦，送出的資料比較好看，也很方便
* application/x-www-form-urlencoded
  長得跟 HTML `<form>` 的資料一樣
* multipart/form-data
  上傳檔案只能用這種，類似 application/x-www-form-urlencoded

會回傳會 JSON 格式的內容，包含一個 ok 欄位
* 如果 ok 等於 True 代表請求成功，然後包含 result 欄位，裡面是執行結果的描述
* 反之 ok 等於 False 代表請求失敗，會有給人類看的錯誤描述和不一定會出現的 error\_code 及 retry\_after

先確認你的 bot 能不能使用 API，可以先使用 postman 或 [apitester.com](https://apitester.com/) 去測試，試成功後再開始寫 code

{% note warning %}
#### 使用 TG Bot API 需要注意
* 注意網址中 Token 前面還有一個 bot，看到社群很多人發問都是忘記這個單字導致失敗。
* 所有 Method 都是不區分大小寫的，例如 getMe 可以打成 Getme 或 getme。
* 所有的 query 都必須使用 UTF-8 格式，不然會報錯。
{% endnote %}

## 0x02 => 取得使用者的訊息

目前 TG BOT 有兩種取得訊息的方法，分別為 `setWebhook` 和 `getUpdates`

### [setWebhook](https://core.telegram.org/bots/api#setwebhook) - Webhooks
* 有人傳送訊息給 Bot (或加入群組、點擊按鍵等) 時， TG 將會發出一個 POST 請求到伺服器上
* 伺服器要擁有 TLS(HTTPs) 憑證，可以自己產生簽證並提供給 Telegram 伺服器。
* Port 要開在 443, 8443, 80, 8080 其中一個，就算是 80 port 也要有 TLS 憑證。
* 更多資料可參考 [官方完整教學](https://core.telegram.org/bots/webhooks) ( 英文 )

### [getUpdates](https://core.telegram.org/bots/api#getupdates) - polling
* 就是每隔一段時間，伺服器自己主動去問 TG 有沒有新的訊息。
* 如使用的程式語言支援，也可以使用 [Long polling](https://blog.gtwang.org/web-development/websocket-protocol/) 取得訊息。

{% note info %}
### 應該要使用哪個？
1. 要求即時性(即時回訊息)，可以使用 Webhook。用 GetUpdates 的話，會需要做 polling 的動作，效能上可能會比較差一點。反之不太要求即時性，能接受一段時間再取得訊息的話 GetUpdates 就很夠用了。
2. Webhook 是別人的伺服器向你的伺服器主動溝通，Debug 會比 GetUpdates 要來的困難許多，咱會選擇在開發除錯時用先用 GetUpdates，production 時才用 Webhook。
3. 有時候伺服器不是免費的，通常是依據算的多久來計算金額，或是 serverless 類型的服務，大多都有計算時間不能超過 300 秒的限制。這時候就可以使用  Webhook 來減少 polling 的計算時間。
{% endnote %}

### 接收所有訊息？
Telegram Bot 預設 Privacy Mode 是開啟的，開啟時只會收到：

* 由 / 開頭的命令訊息
* 對 bot Reply 的訊息
* Bot 是管理員的 channel
* 系統訊息 (e.g., 新成員)

關閉 Privacy Mode 才能收得到全部訊息，要關閉的話去找 @BotFather
1. 輸入 /setprivacy 命令
2. 選擇要關閉的 Bot 名稱
3. 點擊 Disable

然而不管最後設定成什麼樣子，都會收到一個 [Update](https://core.telegram.org/bots/api#getting-updates) 的 JSON-serialized 物件，裡面會有使用者發送的 message 的詳細資料，包含發送者的 user\_id, first\_name 等等。之後就是商業邏輯的部分，可以處理訊息，回覆使用者的訊息、存進資料庫或是不管它

## 0x03 => 終於要傳送訊息了？！

要傳送訊息，可以藉由 [sendMessage](https://core.telegram.org/bots/api#sendmessage) 這個 Method，它有一些參數

* chat_id ( 必要選項 )
  * Private 為正數 ( 例如 12345 )
  * Channel) 為負數 ( 例如 -12345 ) ，也可以用 @頻道名 ( 例如 @woolchannel )
  * Group 為負數 ( 例如 -12345 )
* text ( 必要選項 )
  * 要傳送訊的息內容，換行盡量用 `\r\n`
* 其他 Optional 的參數就自行看 Document 搂，Document 寫得很詳細

首先要先取得 chat_id，可以先在有 Bot 的 chat room 中發送一條訊息( 如果 Privacy Mode 開啟的話要輸入由 / 開頭的命令訊息 )，在使用 `https://api.telegram.org/bot<Token>/getUpdates` 取得 chat_id。例如咱對自己的 Bot 發送 `/start` 的命令訊息，在使用 /getUpdates Method 的話，會收到如下的 json 物件
```json
{
   "ok":true,
   "result":[
      {
         "update_id":541194795,
         "message":{
            "message_id":79,
            "from":{
               "id":12345678,
               "is_bot":false,
                ...
            },
            "chat":{
               "id":12345678,
                ...
            },
            "date":1519192142,
            "text":"/start",
            "entities":[
               {
                  "offset":0,
                  "length":6,
                  "type":"bot_command"
               }
            ]
         }
      }
   ]
}
```
就可以知道 chat_id 為 12345678，這時候就能使用 /sendMessage Method 發訊息給 id 為 12345678 的 chat room 了。例如用 query string `https://api.telegram.org/bot<Token>/sendMessage?chat_id=123456789&text=Hello`，或是使用 POST application/json 的方式，這裡可以先用 postman 或 [apitester.com](https://apitester.com/) 去測試
* HTTP METHOD 選 POST
* url 填 `https://api.telegram.org/bot<Token>/sendMessage`
* Post Data 填入 json 形式的參數
  ```json
  {
    "chat_id":"374888743",
    "text":"Hello"
  }
  ```
* Request Header 加上 Content-Type:application/json

傳送請求後照理說就可以收到 Bot 寄到 chat room 的 Hello 訊息了！

---

以上就是 Telegram Bot 的基本功，還有很多其他的進階功能和設定，例如有按鈕可以按，傳送照片/檔案。目前咱作為 Github issue 的通知 Bot 使用，實作過程未來有空再好好介紹。
