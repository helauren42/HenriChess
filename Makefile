include .env

REQUIREMENTS=server/requirements.txt
VENV=server/venv
PIP=server/venv/bin/pip
PIP_LATEST=server/.pip_latest
MAIN=server/src/main.py
INTERPRETER=server/venv/bin/python3

STATIC_FILES=client/build

############### env and builds ###############

$(VENV):
	python3 -m venv $(VENV)

$(PIP_LATEST): $(VENV) $(REQUIREMENTS)
	$(PIP) install -r $(REQUIREMENTS)
	touch $(PIP_LATEST)

$(STATIC_FILES):
	cd client && npm run build

############### docker ###############

up:
	mkdir -p ./server/logger
	touch ./server/logger/logs.log
	docker compose build
	docker compose up

down:
	docker compose down

re: down up

############### run ##################

server: $(PIP_LATEST)
	$(INTERPRETER) $(MAIN)

dev: up
	docker compose up

############### cleaning ###############

rmpy:
	sudo rm -rf $(VENV)
	sudo rm -rf $(PIP_LATEST)

resetDb: down
	sudo rm -rf .data
	make up

clean: down
	docker system prune -af

vclean:
	docker compose down -v

fclean: down rmpy
	docker system prune -af --volumes

.PHONY: down up re server local clean fclean
