PORT = 9859
HEXO = ./node_modules/.bin/hexo

server: init
	$(HEXO) server -p $(PORT)

preview: init
	$(HEXO) server -p $(PORT) --draft
	
deploy: init
	@echo "Start deploy ..." && \
	$(HEXO) deploy

init:
	@echo "Initializing ..." && \
	$(HEXO) clean --silent && \
	$(HEXO) generate --Configuration --silent
