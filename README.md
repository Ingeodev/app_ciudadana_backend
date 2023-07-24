# CALI MOBILITY BACKEND

This backend has been generated from scratch to support the Cali Mobility Application

**Table of Contents**

- [CALI MOBILITY BACKEND](#cali-mobility-backend)
  - [Tools](#tools)
  - [Run local](#run-local)
  - [Microservices](#microservices)
    - [Users Microservice](#users-microservice)
      - [How to run](#how-to-run)
    - [Notifications Microservice](#notifications-microservice)
      - [Advertising](#advertising)
      - [Attention Lines](#attention-lines)
      - [Service Lines](#service-lines)
      - [Alert](#alert)
    - [Third-Party Microservice](#third-party-microservice)
  - [Contributors](#contributors)
  - [License](#license)


## Tools

1. [Firebase](https://firebase.google.com/)
2. [Docker](https://www.docker.com/)
3. [Express](https://expressjs.com/)

## Run local

To run locally this project use

Build the image
```
	docker build -t cali-mobility-app .
	docker build --platform linux/amd64 -t cali-mobility-app .
	
```

Run the generated image in your environment 
```
    # from your root directory execute
    docker build --platform linux/amd64 -t app_mobility_users_ms -f src/microservices/users/Dockerfile .
    docker build --platform linux/amd64 -t app_mobility_notifications_ms -f src/microservices/notifications/Dockerfile .
    
    # then 
    docker run -d -p 3000:3000 app_mobility_users_ms
    docker run -d -p 8080:3000 app_mobility_notifications_ms 
    
    # for deployment tag your versions, this is an example
    docker tag app_mobility_notifications_ms:latest <your_aws_account_id>.dkr.ecr.us-east-1.amazonaws.com/app_mobility_notifications_ms:latest
    docker push <your_aws_account_id>.dkr.ecr.us-east-1.amazonaws.com/app_mobility_notifications_ms:latest

```

## Microservices

### Users Microservice

#### How to run 
    # On the console
    cd src\microservices\users
    node index.js

### Notifications Microservice

This microservice handles the [**Advertising**](#advertising), [**Attention Lines**](#attention-lines), [**Service Lines**](#service-lines), and [**Alert**](#alert) end-points.

#### Advertising 

The Advertising end-points allow the web user to manage the advertisements shown to mobile users.

**_POST_ save new advertisement** \(\<Your_Host\>/v1/notifications/advertising/\) allows to save a new advertisement into the database. It receives the following parameters:

| **Name**     	|   **Type**   	| **Required** 	| **Description**                                                  	|
|--------------	|:------------:	|:------------:	|------------------------------------------------------------------	|
| _imageUri_   	| String (URI) 	|      Yes     	| URL to the image that will be displayed in the advertisement.    	|
| _siteUri_    	| String (URI) 	|      Yes     	| URL to the web site of the vendor.                               	|
| _categoryId_ 	|    Integer   	|      No      	| ID that references the Category of the advertisement (optional). 	|

It returns **201 _created_** and the created object on success.

#### Attention Lines 

#### Service Lines 

#### Alert 


### Third-Party Microservice

This microservice handles third-party APIs.

## Contributors

---

- [estebance](https://github.com/estebance)
- [daniel]()
- [andres]()
- [Julián](https://github.com/bitjep)

## License

TBD
