FROM pascalmolin/parigp-small:latest as pari
WORKDIR /

FROM ubuntu:20.04
WORKDIR /usr/src/app
RUN apt-get update && DEBIAN_FRONTEND=noninteractive TZ=Etc/UTC apt-get -y install tzdata && apt-get install -y curl && curl -fsSL https://deb.nodesource.com/setup_17.x | bash - && apt-get install -y nodejs texlive && apt-get clean && rm -rf /var/lib/apt/lists/*
COPY ./compile.sh .
RUN chmod +x compile.sh && apt-get update && ./compile.sh
RUN apt-get install -y texlive-fonts-extra
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD [ "node", "app.js" ]