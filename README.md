# HTTP Pub Sub Server

Http pub sub server allows pushing of message to subscribers via HTTP. HTTP Pub Sub server is persistent and sends notifications in real time. When a message is sent to the pub sub server via a topic, the sub sub server will publish the message to all the subscribers that have subscribed to that topic with thier designated webhooks (url). Pub sub server will **retry for a maximum of 7 times** when the subscribers do not return response code between **200** and **299**

![Http Pub SubServer](https://pangaea-interviews.now.sh/_next/static/images/pubsub-diagram-15a833df7c2a0fd11cade0630fe8e8ba.png)



## Model Diagram

![enter image description here](https://asobooks-prod.s3.eu-west-2.amazonaws.com/pusub-server-model.png)




### How it works
To see how the pubsub server works instantly,  Docker-compose,  might be a good fit .

Simple run

> docker-compose up

This will instantly run a postgres DB, the pubsub server as well as three other subscribers listed below with thier respective binding ports.

    http://localhost:4000 ===> http://meridian:3000
    http://localhost:5000 ===> http://luminskin:4000
    http://localhost:6000 ===> http://menskin:5000

Send messages to the pub sub server on

    $ curl -X POST -H "Content-Type: application/json" -d '{"message": "hello"}' http://localhost:3000/publish/topic1

Subscribe to a topic using

    $ curl -X POST -d '{ "url": "http://meridian:3000/event"}' http://localhost:3000/subscribe/topic1

Since you are using docker compose be careful about the domain and ports when listing subscribers.

## Installation

### Build
After Pulling the code follow the steps below.

> npm ci

> npm run build

Before Starting up project make sure to set all enviroment Variables in config folder else you can also create your own `.env` file with the following environment.

    PORT= 2000  
    NODE_ENV= production  
    DB_TYPE= postgres  
    DB_HOST= postgres  
    DB_PORT= 5432  
    DB_USERNAME= pangaea  
    DB_PASSWORD= pangaea
    DB_NAME= pub_sub_db 
    DROP_SCHEMA= 'false'  
    SHOW_LOG= 'false'
    TYPEORM_SYNC= 'true'

NB: Make sure to set up all databases and use right credentials.

Start Server Pubsub server using

> npm run start:prod

## Using Docker
Docker  might be a good alternative to get around with the pub server server.

To build docker image run

>docker build . -t pubsub

Run docker instance with

> docker run -p 3000:3000 \
> -e  PORT= 2000  \
> -e NODE_ENV= production \
> -e DB_TYPE=postgres \
-e  DB_HOST= postgres  \
-e  DB_PORT= 5432  \
-e  DB_USERNAME= pangaea  \
-e DB_PASSWORD= pangaea \
-e  DB_NAME= pub_sub_db \
-e  DROP_SCHEMA= 'false'  \
-e SHOW_LOG= 'false' \
-e TYPEORM_SYNC= 'true' \
pubsub
