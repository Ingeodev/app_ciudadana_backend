# CALI MOBILITY BACKEND

This backend has been generated from scratch to support the Cali Mobility Application

**Table of Contents**

- [CALI MOBILITY BACKEND](#cali-mobility-backend)
  - [1. Tools](#tools)
  - [2. Architecture](#architecture)
    - [2.1. Response Format](#response-format)
      - [Successful HTTP Request](#successful-http-request)
      - [Failed HTTP Request](#failed-http-request)
  - [3. Run local](#run-local)
  - [4. Microservices](#microservices)
    - [4.1. Users Microservice](#users-microservice)
      - [4.1.1. How to run](#how-to-run)
    - [4.2. Notifications Microservice](#notifications-microservice)
      - [Advertising](#advertising)
      - [Attention Lines](#attention-lines)
      - [Service Lines](#service-lines)
      - [Alert](#alert)
    - [4.3. Third-Party Microservice](#third-party-microservice)
  - [5. Contributors](#contributors)
  - [6. License](#license)


## 1. Tools

1. [Firebase](https://firebase.google.com/)
2. [Docker](https://www.docker.com/)
3. [Express](https://expressjs.com/)

## 2. Architecture

### 2.1. Response Format
#### Successful HTTP Request
For any type of successful HTTP request, our API returns in the response (in JSON format) the same data it receives. This allows to confirm the processed data.
#### Failed HTTP Request
When an error occurs during the processing of any HTTP request, our API responds with a JSON object containing the following fields:
- 'status': The HTTP status code associated with the problem.
- 'code': An error code specific to our application.
- 'detail': A detailed description of the problem that occurred.

```
{
		status: number,
		code: string,
		detail: string
}
```
## 3. Run local

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

## 4. Microservices

### 4.1. Users Microservice

#### How to run 
    # On the console
    cd src\microservices\users
    node index.js

### 4.2. Notifications Microservice

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


### 4.3. Third-Party Microservice

This microservice handles third-party APIs.

## 5. Contributors

---

- [estebance](https://github.com/estebance)
- [daniel]()
- [andres]()
- [Julián](https://github.com/bitjep)

## 6. License

TBD
