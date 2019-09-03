---
uuid: 7a4db81b-eae1-4c20-a7cb-12dbc0cf7e37
title: Create isolated Jupyterlab kernels with pyenv and virtualenv
tags: 
  - python
  - jupyterlab
  - pyenv
  - virtualenv
categories:
  - 興趣使然的隨筆雜談
date: 2019-02-26 20:18:03
updated: 2019-03-17 13:20:00
---
# [前言]

因為這學期課程有很多課都需要用到 python，版本不同且要安裝的也不同，直覺想到的解法就是使用 pyenv + virtualenv 來獨立環境，但是需要用到 jupyter 的話，難道要每個環境都安裝 jupyter 嗎？於是研究了一個晚上，發現可以只用一個 jupyter，然後分別為每個 virtualenv 環境建立 jupyter kernel。

<!--more-->

# [正文]

## 安裝 pyenv and virtualenv

基本上按照 [pyenv](https://github.com/pyenv/pyenv#basic-github-checkout) 和 [pyenv-virtualenv](https://github.com/pyenv/pyenv-virtualenv#installation) 的安裝方式做就可以安裝完成，這裡我採用 Basic GitHub Checkout 的方式安裝，因為我想把 pyenv 裝在 `~/.local/pyenv` 資料夾下面，而不是預設的家目錄下面;

{% codeblock lang:bash line_number:false highlight:true %}
$ mkdir -p ~/.local/pyenv

$ git clone https://github.com/pyenv/pyenv.git ~/.local/pyenv
Cloning into '/home/woolninesun/.local/pyenv/'...
...
{% endcodeblock %}

`git clone` 完後編輯 `.bashrc`，按照官方教學加入 `eval "$(pyenv init -)"`;

{% note info %}
1. `PYENV_ROOT` 是安裝 pyenv 的地方，如果有和咱一樣換地方放 pyenv，記得要改過;
2. 官方的安裝教學是放在 `.bash_profile`，不過我習慣把 init 放 `.bashrc`
{% endnote %}

{% codeblock .bashrc lang:bash line_number:false highlight:true %}
...
# pyenv
export PYENV_ROOT="$HOME/.local/pyenv"
export PATH="$PYENV_ROOT/bin:$PATH"
if command -v pyenv 1>/dev/null 2>&1; then
    eval "$(pyenv init -)"
fi
{% endcodeblock %}


然後重開 shell，`pyenv --version` 和 `pyenv root` 之後有出現該出現東西就是安裝成功了;
{% codeblock lang:bash line_number:false highlight:true %}
$ exec "$SHELL"

$ pyenv --version
pyenv 1.2.9-16-g9baa6efe

$ pyenv root
/home/woolninesun/.local/pyenv
{% endcodeblock %}

接下來安裝 `pyenv-virtualenv`，`git clone` 後編輯 `.bashrc`，在 `eval "$(pyenv init -)"` 後面加入 `eval "$(pyenv virtualenv-init -)"`，完成後一樣重開 shell;

{% codeblock lang:bash line_number:false highlight:true %}
$ git clone https://github.com/pyenv/pyenv-virtualenv.git $(pyenv root)/plugins/pyenv-virtualenv
Cloning into '/home/woolninesun/.local/pyenv/plugins/pyenv-virtualenv'...
...
{% endcodeblock %}
{% codeblock .bashrc lang:bash line_number:false highlight:true %}
...
# pyenv
export PYENV_ROOT="$HOME/.local/pyenv"
export PATH="$PYENV_ROOT/bin:$PATH"
if command -v pyenv 1>/dev/null 2>&1; then
    eval "$(pyenv init -)"
    eval "$(pyenv virtualenv-init -)"
fi
{% endcodeblock %}

{% codeblock lang:bash line_number:false highlight:true %}
$ exec "$SHELL"
{% endcodeblock %}

## 安裝 jupyter lab
咱我把 jupyterlab 安裝在 jupyterlab 的環境下裡面，主要是希望把 jupyter 也當做一個環境不要汙染到系統上的 python，基本上咱系統的 python 是預設的，平常不會去動到也不會用到。

{% codeblock lang:bash line_number:false highlight:true %}
$ pyenv install 3.7.2
Downloading Python-3.7.2.tar.xz...
-> https://www.python.org/ftp/python/3.7.2/Python-3.7.2.tar.xz
Installing Python-3.7.2...
Installed Python-3.7.2 to /home/woolninesun/.local/pyenv/versions/3.7.2

$ pyenv virtualenv 3.7.2 jupyterlab
Looking in links: /tmp/tmpkak2tm9a
Requirement already satisfied: ...

$ pyenv versions
* system (set by /home/woolninesun/.local/pyenv/version)
  3.7.2
  3.7.2/envs/jupyterlab
  jupyterlab
{% endcodeblock %}

{% note warning %}
### ModuleNotFoundError: No module named '_ctypes'
如果出現這個錯誤，是因為 python 3.7.2 的 clean install 需要 `libffi-dev`，安裝一下就好
If using RHEL/Fedora: `yum install libffi-devel`
If using Debian/Ubuntu: `sudo apt-get install libffi-dev`
{% endnote %}

建立好 jupyterlab 的環境後 `activat` 起來安裝 `jupyterlab`，安裝完後產生 jupyter 的設定檔

{% codeblock lang:bash line_number:false highlight:true %}
$ pyenv activate jupyterlab

(jupyterlab) $ pip install jupyterlab
Collecting jupyterlab
...

(jupyterlab) $ jupyter notebook --generate-config
Writing default config to: /home/woolninesun/.jupyter/jupyter_notebook_config.py
{% endcodeblock %}

其中咱設定了不要自動開啟瀏覽器，設定 port 和設定資料夾的目錄;

{% codeblock jupyter_notebook_config.py lang:python line_number:false highlight:true %}
...
c.NotebookApp.open_browser = False
c.NotebookApp.port = 12678
c.NotebookApp.notebook_dir = '/home/woolninesun/Projects'
{% endcodeblock %}

設定完後輸入 `jupyter lab` 開啟，進入網址看看有沒有安裝成功！

{% codeblock lang:bash line_number:false highlight:true %}
(jupyterlab) $ jupyter lab
...
    To access the notebook, open this file in a browser:
        file:///run/user/1001/jupyter/nbserver-16741-open.html
    Or copy and paste one of these URLs:
        http://localhost:12678/?token=1d3840e3b692dfb554e0b7fe5118ba4dbc1f569e726cf0d5
...
{% endcodeblock %}

![](/uploads/7a4db81b-eae1-4c20-a7cb-12dbc0cf7e37/0001.png)

{% codeblock lang:bash line_number:false highlight:true %}
(jupyterlab) $ pyenv deactivate
{% endcodeblock %}

## 設定其他環境

設定一下其他要當 jupyterlab kernel 的環境，由於相當簡單，快速帶過~

{% note warning %}
1. 要注意的是一定要安裝 `ipykernel`，否則沒辦法當 jupyter kernel;
{% endnote %}

{% codeblock lang:bash line_number:false highlight:true %}
$ pyenv virtualenv 3.7.2 ADL
Looking in links: /tmp/tmpkak2tm9a
Requirement already satisfied: ...

$ pyenv activate ADL 

(ADL) $ pip install ipykernel
Collecting ipykernel
...

(ADL) $ pip install numpy
Collecting numpy
...

(ADL) $ pyenv which python
/home/woolninesun/.local/pyenv/versions/ADL/bin/python

(ADL) $ pyenv deactivate
{% endcodeblock %}

## 新增 kernel 到 jupyterlab

{% codeblock lang:bash line_number:false highlight:true %}
$ pyenv activate jupyterlab

(jupyterlab) $ jupyter --path
config:
    ...
data:
    /home/woolninesun/.local/share/jupyter
    /home/woolninesun/.local/pyenv/versions/3.7.2/envs/jupyterlab/share/jupyter
    ...
runtime:
    ...

(jupyterlab) $ cd /home/woolninesun/.local/pyenv/versions/3.7.2/envs/jupyterlab/share/jupyter

(jupyterlab) $ mkdir ADL && touch ADL/kernel.json
{% endcodeblock %}

{% codeblock kernel.json lang:json line_number:false highlight:true %}
{
    "argv": [ "/home/woolninesun/.local/pyenv/versions/ADL/bin/python",
        "-m", "ipykernel",
        "-f", "{connection_file}"],
    "display_name": "ADL",
    "language": "python"
}
{% endcodeblock %}

{% note info %}
1. `/home/woolninesun/.local/pyenv/versions/ADL/bin/python` 是前面建立 ADL 時輸入 `pyenv which python` 得到的;
2. 只要是 `data:` 下面的 path 都可以建立 kernel，咱選擇 jupyterlab 環境裡面的路徑;
3. 如果想設定在 jupyterlab 裡面顯示的 icon，可以將想顯示的 icon 改名成 logo-32x32.png 和 logo-64x64.png 放入同一個資料夾;
4. 想要瞭解更多，可以參考 [jupyter kernel-specs](https://jupyter-client.readthedocs.io/en/latest/kernels.html#kernel-specs)
{% endnote %}

{% codeblock lang:bash line_number:false highlight:true %}
(jupyterlab) $ jupyter kernelspec list
Available kernels:
  adl        /home/woolninesun/.local/pyenv/versions/3.7.2/envs/jupyterlab/share/jupyter/kernels/ADL
  python3    /home/woolninesun/.local/pyenv/versions/3.7.2/envs/jupyterlab/share/jupyter/kernels/python3

(jupyterlab) $ jupyter lab
...
    To access the notebook, open this file in a browser:
        file:///run/user/1001/jupyter/nbserver-22604-open.html
    Or copy and paste one of these URLs:
        http://localhost:12678/?token=047400733cd6ebff70fe9da688d6895c32a3955727bbfa77
...
{% endcodeblock %}

![](/uploads/7a4db81b-eae1-4c20-a7cb-12dbc0cf7e37/0002.png)

## 測試是不是真的不同 kernel

![](/uploads/7a4db81b-eae1-4c20-a7cb-12dbc0cf7e37/0003.png)
![](/uploads/7a4db81b-eae1-4c20-a7cb-12dbc0cf7e37/0004.png)

{% note warning %}
1.要注意到 jupyterlab 裡面的 python3 是 pyenv jupyterlab 的 python 3.7.2，不是系統上的 python;
{% endnote %}


## UPDATE INFO

#### 2019/03/17

在 ubuntu 上用 pyenv 安裝 python 3.7.2 出現 `ModuleNotFoundError: No module named '_ctypes'` 錯誤，解決並更新文章。
