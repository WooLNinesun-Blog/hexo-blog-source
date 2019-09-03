PORT = 9859
HEXO = nodecmd hexo

server: init
	$(HEXO) server -p $(PORT) --config source/_data/config.yml

preview: init
	$(HEXO) server -p $(PORT) --config source/_data/config.yml --draft
	
deploy: init
	@echo "Start deploy ..." && \
	$(HEXO) deploy --config source/_data/config.yml

init:
	@echo "Initializing ..." && \
	$(HEXO) clean && \
	$(HEXO) generate --config source/_data/config.yml

uuidgen:
	@uuidgen | tr -d '\n' | xclip -selection clipboard
