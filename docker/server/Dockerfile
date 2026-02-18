FROM debian:bookworm-slim

RUN apt update -y && apt upgrade -y \
	&& apt install make python3-pip python3.11-venv -y

WORKDIR /app/

CMD ["/bin/sh", "-c", "make server"]

