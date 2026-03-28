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

down:
	docker compose -f docker-compose.$(ENV).yaml down

logs:
	docker compose -f docker-compose.$(ENV).yaml logs

flogs:
	docker compose -f docker-compose.$(ENV).yaml logs -f

up:
	if [ "$(ENV)" = "prod" ]; then\
		cd client && npm run build;\
	fi
	docker compose -f docker-compose.$(ENV).yaml up -d

re: down up

ps:
	docker compose -f docker-compose.$(ENV).yaml ps

restart:
	docker compose -f docker-compose.$(ENV).yaml restart $(ARGS)

############### run ##################

server: $(PIP_LATEST)
	$(INTERPRETER) $(MAIN)

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
