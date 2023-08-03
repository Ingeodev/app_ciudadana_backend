# CALI MOBILITY BACKEND

This backend has been generated from scratch to support the Cali Mobility Application

**Table of Contents**

- [CALI MOBILITY BACKEND](#cali-mobility-backend)
  - [1. Tools](#1-tools)
  - [2. Architecture](#2-architecture)
    - [2.1. Response Format](#21-response-format)
      - [Successful HTTP Request](#successful-http-request)
      - [Failed HTTP Request](#failed-http-request)
  - [3. Run local](#3-run-local)
  - [4. Microservices](#4-microservices)
    - [4.1. Users Microservice](#41-users-microservice)
      - [How to run](#how-to-run)
    - [4.2. Notifications Microservice](#42-notifications-microservice)
      - [4.2.1 Advertising](#421-advertising)
        - [_POST_ save new advertisement](#post-save-new-advertisement)
        - [_GET_ list advertisements](#get-list-advertisements)
        - [_POST_ update advertisement](#post-update-advertisement)
        - [_POST_ change advertisement status](#post-change-advertisement-status)
        - [_POST_ delete advertisement](#post-delete-advertisement)
      - [4.2.2. Publicity](#423-publicity)
        - [_GET_ Uncategorized advertisements (Publicity)](#get-uncategorized-advertisements-publicity)
        - [_GET_ Categorized advertisements (Banners)](#get-categorized-advertisements-banners)
      - [4.2.3. Attention Lines](#423-attention-lines)
      - [4.2.4. Service Lines](#424-service-lines)
      - [4.2.5. Alert](#425-alert)
    - [4.3. Third-Party Microservice](#43-third-party-microservice)
  - [5. Contributors](#5-contributors)
  - [6. License](#6-license)


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

#### App Runner
    https://vbxb7pp27j.us-east-1.awsapprunner.com

#### How to run in local
    # On the console
    cd src\microservices\users
    node index.js

### 4.2. Notifications Microservice

This microservice handles the [**Advertising**](#advertising), [**Publicity**](#publicity), [**Attention Lines**](#attention-lines), [**Service Lines**](#service-lines), and [**Alert**](#alert) end-points.

#### 4.2.1. Advertising 

The Advertising end-points allow the web user to manage the advertisements shown to mobile users.

##### _POST_ save new advertisement
\(\<Your_Host\>/web/v1/notifications/advertising/\) allows web users to save a new advertisement into the database. It receives the following parameters:

| **Name**     	|   **Type**   	| **Required** 	| **Description**                                                  	|
|--------------	|:------------:	|:------------:	|------------------------------------------------------------------	|
| _imageUri_   	| String (URI) 	|      Yes     	| URL to the image that will be displayed in the advertisement.    	|
| _siteUri_    	| String (URI) 	|      Yes     	| URL to the web site of the vendor.                               	|
| _categoryId_ 	|    Integer   	|      No      	| ID that references the Category of the advertisement (optional). 	|

It returns **201 _created_** and the created object on success.

**Examples**

1. New advertisement without category

    Request body:
      >```JSON
      >{
      >  "imageUri": "gs://documentainotery.appspot.com/NicePng_nioh-png_1825374.png",
      >  "siteUri": "http://test.site.url"
      >}
      >```

    Response:
      > _Status code: **201 Created**_
      > ```JSON
      > {
      >   "data": {
      >       "active": true,
      >       "id": 36,
      >       "imageUri": "gs://documentainotery.appspot.com/NicePng_nioh-png_1825374.png",
      >       "siteUri": "http://test.site.url",
      >       "categoryId": null,
      >       "updatedAt": "2023-07-28T20:41:14.745Z",
      >       "createdAt": "2023-07-28T20:41:14.745Z"
      >    }
      > }
      > ```

2. New advertisement with category

    Request body:
      >```JSON
      >{
      >  "imageUri": "gs://documentainotery.appspot.com/NicePng_nioh-png_1825374.png",
      >  "siteUri": "http://test.site.url",
      >  "categoryId": 2
      >}
      >```

    Response:
      > _Status code: **201 Created**_
      > ```JSON
      > {
      >   "data": {
      >       "active": true,
      >       "id": 35,
      >       "imageUri": "gs://documentainotery.appspot.com/NicePng_nioh-png_1825374.png",
      >       "siteUri": "http://test.site.url",
      >       "categoryId": 2,
      >       "updatedAt": "2023-07-28T20:39:40.947Z",
      >       "createdAt": "2023-07-28T20:39:40.947Z"
      >    }
      > }
      > ```

##### _GET_ list advertisements
\(\<Your_Host\>/web/v1/notifications/advertising/\) allows web users to list a set of the advertisements from the database. It receives the following query parameters:


| **Name**     	|   **Type**   	| **Required** 	| **Description**                                                  	|
|--------------	|:------------:	|:------------:	|------------------------------------------------------------------	|
| _page[number]_    	| Integer (positive) 	|      Yes     	| Page number for pagination.                               	|
| _page[size]_ 	|    Integer (positive)   	|      Yes      	| Page size for pagination. 	|

It returns **200 _OK_** and the list of objects on success.

**Example Response**
> _Status Code: **200 OK**_
> ```JSON
> {
>    "meta": {
>        "page": 1,
>        "pageSize": 5,
>        "totalRecords": 16,
>        "totalPages": 4
>    },
>    "data": [
>        {
>            "id": 39,
>            "imageUri": "gs://documentainotery.appspot.com/dance%20dance%20danseur.jpg",
>            "siteUri": "https://test.site.url/second",
>            "categoryId": 2,
>            "active": true,
>            "createdAt": "2023-07-28T22:27:19.426Z",
>            "updatedAt": "2023-07-28T22:27:19.426Z",
>            "categoryName": "sample"
>        },
>        {
>            "id": 38,
>            "imageUri": "gs://documentainotery.appspot.com/NicePng_nioh-png_1825374.png",
>            "siteUri": "http://test.site.url",
>            "categoryId": null,
>            "active": true,
>            "createdAt": "2023-07-28T22:27:17.369Z",
>            "updatedAt": "2023-07-28T22:27:17.369Z",
>            "categoryName": null
>        },
>        {
>            "id": 37,
>            "imageUri": "gs://documentainotery.appspot.com/NicePng_nioh-png_1825374.png",
>            "siteUri": "http://test.site.url",
>            "categoryId": null,
>            "active": true,
>            "createdAt": "2023-07-28T22:22:04.139Z",
>            "updatedAt": "2023-07-28T22:22:04.139Z",
>            "categoryName": null
>        },
>        {
>            "id": 36,
>            "imageUri": "gs://documentainotery.appspot.com/NicePng_nioh-png_1825374.png",
>            "siteUri": "http://test.site.url",
>            "categoryId": null,
>            "active": true,
>            "createdAt": "2023-07-28T20:41:14.745Z",
>            "updatedAt": "2023-07-28T20:41:14.745Z",
>            "categoryName": null
>        },
>        {
>            "id": 35,
>            "imageUri": "gs://documentainotery.appspot.com/NicePng_nioh-png_1825374.png",
>            "siteUri": "http://test.site.url",
>            "categoryId": 2,
>            "active": true,
>            "createdAt": "2023-07-28T20:39:40.947Z",
>            "updatedAt": "2023-07-28T20:39:40.947Z",
>            "categoryName": "sample"
>        }
>    ]
>}
> ```

##### _POST_ update advertisement
\(\<Your_Host\>/web/v1/notifications/advertising/edit\) allows web users to edit an existing advertisement in the database. It receives the following parameters:

| **Name**     	|   **Type**   	| **Required** 	| **Description**                                                  	|
|--------------	|:------------:	|:------------:	|------------------------------------------------------------------	|
| _id_   	| Integer 	|      Yes     	| ID of the advertisement to edit.    	|
| _imageUri_   	| String (URI) 	|      No     	| URL to the image that will be displayed in the advertisement.    	|
| _siteUri_    	| String (URI) 	|      No     	| URL to the web site of the vendor.                               	|
| _categoryId_ 	|    Integer   	|      No      	| ID that references the Category of the advertisement (optional). 	|
| _active_ 	|    Boolean   	|      No      	| Whether the Advertisement is active or not (but not deleted). 	|

At least one of the optional (_imageUri_, _siteUri_, _categoryId_, _active_) parameters must be passed.

It returns **200 _OK_** and the updated object on success.

**Example**

Request body:
  >```JSON
  >{
  >    "id": 38,
  >    "active": false,
  >    "imageUri": "gs://documentainotery.appspot.com/NicePng_nioh-png_1825374.png",
  >    "siteUri": "http://test.second.site.url"
  >}
  >```

Response:
  > _Status code: **200 OK**_
  > ```JSON
  > {
  >    "data": {
  >        "id": 38,
  >        "imageUri": "gs://documentainotery.appspot.com/NicePng_nioh-png_1825374.png",
  >        "siteUri": "http://test.second.site.url",
  >        "categoryId": null,
  >        "active": false,
  >        "createdAt": "2023-07-28T22:27:17.369Z",
  >        "updatedAt": "2023-08-01T21:59:16.102Z"
  >    }
  > }
  > ```

##### _POST_ change advertisement status
\(\<Your_Host\>/web/v1/notifications/advertising/status\) allows web users to directly change the status of an existing advertisement in the database. It receives the following parameters:

| **Name**     	|   **Type**   	| **Required** 	| **Description**                                                  	|
|--------------	|:------------:	|:------------:	|------------------------------------------------------------------	|
| _id_   	| Integer 	|      Yes     	| ID of the advertisement to edit.    	|
| _active_ 	|    Boolean   	|      Yes      	| Whether the Advertisement is active or not (but not deleted). 	|

It returns **200 _OK_** and the updated object on success.

**Example**

Request body:
  >```JSON
  >{
  >    "id": 38,
  >    "active": true
  >}
  >```

Response:
  > _Status code: **200 OK**_
  > ```JSON
  > {
  >    "data": {
  >        "id": 38,
  >        "imageUri": "gs://documentainotery.appspot.com/NicePng_nioh-png_1825374.png",
  >        "siteUri": "http://test.second.site.url",
  >        "categoryId": null,
  >        "active": true,
  >        "createdAt": "2023-07-28T22:27:17.369Z",
  >        "updatedAt": "2023-08-01T22:27:42.839Z"
  >    }
  > }
  > ```

##### _POST_ delete advertisement
\(\<Your_Host\>/web/v1/notifications/advertising/delete\) allows web users to delete an existing advertisement from the database. This service uses a soft-delete approach. It receives the following parameter:

| **Name**     	|   **Type**   	| **Required** 	| **Description**                                                  	|
|--------------	|:------------:	|:------------:	|------------------------------------------------------------------	|
| _id_   	| Integer 	|      Yes     	| ID of the advertisement to edit.    	|

It returns **200 _OK_** and the updated object on success.

**Example**

Request body:
  >```JSON
  >{
  >    "id": 38,
  >}
  >```

Response:
  > _Status code: **200 OK**_
  > ```JSON
  > {
  >    "data": {
  >        "id": 38
  >    }
  > }
  > ```

#### 4.2.2 Publicity 

The Publicity end-points allow the mobile user to consume the advertisements managed by web users in [advertising](#advertising).

##### _GET_ Uncategorized advertisements (Publicity)


##### _GET_ Categorized advertisements (Banners)

\(\<Your_Host\>/mobile/v1/notifications/publicity/banners/\) allows mobile users to retrieve all the active banners (i.e. categorized advertisements). It receives no parameters. It returns a list of objects with whe image locator `image`, the provider URL `url`, and the category `category`.

**Example Response**

> _Status Code: **200 OK**_
> ```JSON
> [
>     {
>         "image": "https://test.image.url/second",
>         "url": "https://test.site.url/second",
>         "category": "sample"
>     },
>     {
>         "image": "gs://documentainotery.appspot.com/dance%20dance%20danseur.jpg",
>         "url": "https://test.site.url/second",
>         "category": "sample"
>     },
>     {
>         "image": "gs://documentainotery.appspot.com/dance%20dance%20danseur.jpg",
>         "url": "https://test.site.url/second",
>         "category": "sample"
>     }
> ]
> ```


#### 4.2.3. Attention Lines 

#### 4.2.4. Service Lines 

#### 4.2.5. Alert 


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
