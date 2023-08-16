# CALI MOBILITY BACKEND

This backend has been generated from scratch to support the Cali Mobility Application

**Table of Contents**

- [CALI MOBILITY BACKEND](#cali-mobility-backend)
  - [1. Tools](#1-tools)
  - [**Postman**: Documentation Link](#postman-documentation-link)
  - [2. Architecture](#2-architecture)
    - [2.1. Response Format](#21-response-format)
      - [Successful HTTP Request](#successful-http-request)
      - [Failed HTTP Request](#failed-http-request)
  - [3. Run local](#3-run-local)
  - [4. Microservices](#4-microservices)
    - [4.1. Users Microservice](#41-users-microservice)
      - [App Runner](#app-runner)
      - [How to run in local](#how-to-run-in-local)
      - [List of endpoints](#list-of-endpoints)
        - [Mobile App](#mobile-app)
        - [Web App](#web-app)
    - [4.2. Notifications Microservice](#42-notifications-microservice)
      - [App Runner](#app-runner-1)
      - [4.2.1. Advertising](#421-advertising)
        - [_POST_ save new advertisement](#post-save-new-advertisement)
        - [_GET_ list advertisements](#get-list-advertisements)
        - [_POST_ update advertisement](#post-update-advertisement)
        - [_POST_ change advertisement status](#post-change-advertisement-status)
        - [_POST_ delete advertisement](#post-delete-advertisement)
      - [4.2.2. Advertisement Categories](#422-advertisement-categories)
        - [_POST_ save new advertisement category](#post-save-new-advertisement-category)
        - [_GET_ list advertisement categories](#get-list-advertisement-categories)
        - [_POST_ delete advertisement category](#post-delete-advertisement-category)
      - [4.2.3. Publicity](#423-publicity)
        - [_GET_ Uncategorized advertisements (Publicity)](#get-uncategorized-advertisements-publicity)
        - [_GET_ Categorized advertisements (Banners)](#get-categorized-advertisements-banners)
      - [4.2.4. Attention Lines](#424-attention-lines)
      - [List of endpoints](#list-of-endpoints-1)
        - [Mobile App](#mobile-app-1)
        - [Web App](#web-app-1)
      - [4.2.5. Service Lines](#425-service-lines)
      - [4.2.6. Alerts](#426-alerts)
        - [_GET_ Active Alerts (mobile)](#get-active-alerts-mobile)
        - [_POST_ Register Device Token (mobile)](#post-register-device-token-mobile)
        - [_GET_ All Alerts](#get-all-alerts)
        - [_POST_ Send Alert](#post-send-alert)
    - [4.3. Third-Party Microservice](#43-third-party-microservice)
  - [5. Contributors](#5-contributors)
  - [6. License](#6-license)


## 1. Tools

1. [Firebase](https://firebase.google.com/)
2. [Docker](https://www.docker.com/)
3. [Express](https://expressjs.com/)

**Postman**: [Documentation Link](http://postmanTest.com "Documentation Link")
------------
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
------------
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
------------
## 4. Microservices
------------
### 4.1. Users Microservice

#### App Runner
    https://vbxb7pp27j.us-east-1.awsapprunner.com

#### How to run in local
    # On the console
    cd src\microservices\users
    node index.js
#### List of endpoints
##### Mobile App
	Path: http:localhost:3000/api/mobile/v1/users
	Controller: src\microservices\users\v1\controllers\mobileUsers.js
	Route: src\microservices\users\v1\routes\mobile.js
| Endpoint             | Method | Location in Controller | Description                                               |
| :------------------- | :----- | :--------------------- | :-------------------------------------------------------- |
| /account/info        | POST   | postAccountInfo        | Create the user base information - loginPhase="baseLogin" |
| /account/full_login  | POST   | postAccountFullLogin   | Update missing user data - when loginPhase="baseLogin"    |
| /account/info        | GET    | getAccountInfo         | Get user data and login phase                             |
| /account/login/phase | GET    | getAccountLoginPhase   | Get the user loginPhase state                             |
| /account/edit        | POST   | postAccountUpdateUser  | Update user data - when loginPhase="fullLogin"            |

##### Web App
	Path: http:localhost:3000/api/web/v1/users
	Controller: src\microservices\users\v1\controllers\webUsers.js
	Route: src\microservices\users\v1\routes\web.js
| Endpoint             | Method | Location in Controller  | Description                                               |
| :------------------- | :----- | :---------------------- | :-------------------------------------------------------- |
| /                    | GET    | getUsersListAll         | Get all users (web + app)                                 |
| /delete              | POST   | postUsersUpdateDisabled | Update  status user.disabled=true                         |
| /full_login          | POST   | postUsersFullLogin      | Update users.loginPhase to fullLogin                      |
| /account/info        | POST   | postAccountInfo         | Create the user base information - loginPhase="baseLogin" |
| /account/full_login  | POST   | postAccountFullLogin    | Update missing user data - when loginPhase="baseLogin"    |
| /account/info        | GET    | getAccountInfo          | Get user data and login phase                             |
| /account/login/phase | GET    | getAccountLoginPhase    | Get the user loginPhase state                             |
| /account/edit        | POST   | postAccountUpdateUser   | Update user data - when loginPhase="fullLogin"            |


------------
### 4.2. Notifications Microservice

This microservice handles the [**Advertising**](#advertising), [**Publicity**](#publicity), [**Attention Lines**](#attention-lines), [**Service Lines**](#service-lines), and [**Alert**](#alert) end-points.

#### App Runner
     https://k7gmmdc9dj.us-east-1.awsapprunner.com

------------
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
>            "categoryName": "sample",
>            "categoryColor": "#2d96ad"
>        },
>        {
>            "id": 38,
>            "imageUri": "gs://documentainotery.appspot.com/NicePng_nioh-png_1825374.png",
>            "siteUri": "http://test.site.url",
>            "categoryId": null,
>            "active": true,
>            "createdAt": "2023-07-28T22:27:17.369Z",
>            "updatedAt": "2023-07-28T22:27:17.369Z",
>            "categoryName": null,
>            "categoryColor": null
>        },
>        {
>            "id": 37,
>            "imageUri": "gs://documentainotery.appspot.com/NicePng_nioh-png_1825374.png",
>            "siteUri": "http://test.site.url",
>            "categoryId": null,
>            "active": true,
>            "createdAt": "2023-07-28T22:22:04.139Z",
>            "updatedAt": "2023-07-28T22:22:04.139Z",
>            "categoryName": null,
>            "categoryColor": null
>        },
>        {
>            "id": 36,
>            "imageUri": "gs://documentainotery.appspot.com/NicePng_nioh-png_1825374.png",
>            "siteUri": "http://test.site.url",
>            "categoryId": null,
>            "active": true,
>            "createdAt": "2023-07-28T20:41:14.745Z",
>            "updatedAt": "2023-07-28T20:41:14.745Z",
>            "categoryName": null,
>            "categoryColor": null
>        },
>        {
>            "id": 35,
>            "imageUri": "gs://documentainotery.appspot.com/NicePng_nioh-png_1825374.png",
>            "siteUri": "http://test.site.url",
>            "categoryId": 2,
>            "active": true,
>            "createdAt": "2023-07-28T20:39:40.947Z",
>            "updatedAt": "2023-07-28T20:39:40.947Z",
>            "categoryName": "sample",
>            "categoryColor": "#2d96ad"
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
  >    "id": 38
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

------------
#### 4.2.2. Advertisement Categories

The Advertisement Categories end-points allow the web user to manage the advertisement categories that can classify the [**advertisements**](#421-advertising).

##### _POST_ save new advertisement category
\(\<Your_Host\>/web/v1/notifications/advertisementCategory/\) allows web users to save a new advertisement category into the database. It receives the following parameters:

| **Name**     	|   **Type**   	| **Required** 	| **Description**                                                  	|
|--------------	|:------------:	|:------------:	|------------------------------------------------------------------	|
| _name_   	| String 	|      Yes     	| Category name.    	|
| _color_    	| String (Hex Color) 	|      Yes     	| Colorof the category.                               	|

It returns **201 _created_** and the created object on success.

**Example**

Request body:
  >```JSON
  >{
  >  "name": "testCat000",
  >  "color": "#feF37e"
  >}
  >```

Response:
  > _Status code: **201 Created**_
  > ```JSON
  > {
  >   "data": {
  >       "id": 3,
  >       "name": "testCat000",
  >       "color": "#feF37e",
  >       "createdAt": "2023-08-16T15:21:37.943Z"
  >    }
  > }
  > ```

##### _GET_ list advertisement categories
\(\<Your_Host\>/web/v1/notifications/advertisementCategory/\) allows web users to list a set of the advertisement categories from the database. It receives the following query parameters:


| **Name**     	|   **Type**   	| **Required** 	| **Description**                                                  	|
|--------------	|:------------:	|:------------:	|------------------------------------------------------------------	|
| _page[number]_    	| Integer (positive) 	|      Yes     	| Page number for pagination.                               	|
| _page[size]_ 	|    Integer (positive)   	|      Yes      	| Page size for pagination. 	|

It returns **200 _OK_** and the list of objects on success.

**Example Response**
> _Status Code: **200 OK**_
> ```JSON
> 
> ```

##### _POST_ delete advertisement category
\(\<Your_Host\>/web/v1/notifications/advertising/delete\) allows web users to delete an existing advertisement category from the database. This service fails if the category is used. This service uses a soft-delete approach. It receives the following parameter:

| **Name**     	|   **Type**   	| **Required** 	| **Description**                                                  	|
|--------------	|:------------:	|:------------:	|------------------------------------------------------------------	|
| _id_   	| Integer 	|      Yes     	| ID of the advertisement category to edit.    	|

It returns **200 _OK_** and the updated object on success.

**Example**

Request body:
  >```JSON
  >{
  >    "id": 3
  >}
  >```

Response:
  > _Status code: **200 OK**_
  > ```JSON
  > {
  >    "data": {
  >        "id": 3
  >    }
  > }
  > ```

------------
#### 4.2.3. Publicity 

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

------------
#### 4.2.4. Attention Lines 
#### List of endpoints
##### Mobile App
	Path: http:localhost:3000/api/mobile/v1/notifications/attention_lines
	Controller: src\microservices\notifications\v1\controllers\mobileAttentionLines.js
	Route: src\microservices\notifications\v1\routes\mobile.js
| Endpoint                      | Method | Location in Controller | Description                                 |
| :---------------------------- | :----- | :--------------------- | :------------------------------------------ |
| /attention_lines              | GET    | getListAll             | Get all attention lines                     |
| /attention_lines/dependencies | GET    | getDependencies        | Get all the dependencies to submit a pqrsdf |

##### Web App
	Path: http:localhost:3000/api/web/v1/notifications/attention_lines
	Controller: src\microservices\notifications\v1\controllers\webAttentionLines.js
	Route: src\microservices\notifications\v1\routes\web.js

| Endpoint                | Method | Location in Controller | Description                              |
| :---------------------- | :----- | :--------------------- | :--------------------------------------- |
| /attention_lines        | GET    | getListAll             | Get all attention lines                  |
| /attention_lines/       | POST   | postRegister           | Create an attention line                 |
| /attention_lines/edit   | POST   | postUpdate             | Update an attention line                 |
| /attention_lines/status | POST   | postUpdateActive       | Activate or deactivate an attention line |
| /attention_lines/:id    | GET    | getAttentionLine       | Get an attention line by id              |

------------

#### 4.2.5. Service Lines 

------------

#### 4.2.6. Alerts

The Alerts endpoints allow web users to send alerts to mobile users through different services (PUSH notifications, SMSs, and Alert List), and list the previously-delivered alerts.

**_List of endpoints_**
**Mobile App**
	Path: http:localhost:3000/api/web/v1/notifications/
	Controller: src\microservices\notifications\v1\controllers\mobileAlert.js
	Route: src\microservices\notifications\v1\routes\mobile.js

| Endpoint  | Method | Location in Controller | Description          |
| :-------- | :----- | :--------------------- | :------------------- |
| /         | GET    | getListActive          | Get active alerts    |
| /register | POST   | registerPush           | Send alerts to users |

##### _GET_ Active Alerts (mobile)
\(\<Your_Host\>/web/v1/notifications/\)


##### _POST_ Register Device Token (mobile)
\(\<Your_Host\>/web/v1/notifications/register\) allows mobile users to subscribe their device (i.e. phone) to the PUSH alert service. It receives the following parameter:

| **Name**     	|   **Type**   	| **Required** 	| **Description**                                                  	|
|--------------	|:------------:	|:------------:	|------------------------------------------------------------------	|
| _deviceToken_   	| String 	|      Yes     	| Token produced by Firebase to identify the device (i.e. smartphone)   	|

It returns **200 _OK_** and the device token on success.

**Example**

Request body:
  >```JSON
  >{
  >    "deviceToken": "14095475-7695-4fd5-b334-4e521d0c3262"
  >}
  >```

Response:
  > _Status code: **200 OK**_
  > ```JSON
  > {
  >    "data": {
  >        "deviceToken": "14095475-7695-4fd5-b334-4e521d0c3262"
  >    }
  > }
  > ```

**Web App**
	Path: http:localhost:3000/api/web/v1/notifications/alert
	Controller: src\microservices\notifications\v1\controllers\webAlert.js
	Route: src\microservices\notifications\v1\routes\web.js

| Endpoint | Method | Location in Controller | Description          |
| :------- | :----- | :--------------------- | :------------------- |
| /alert   | GET    | getlistAll             | Get all alerts       |
| /alert   | POST   | sendAlerts             | Send alerts to users |

##### _GET_ All Alerts

##### _POST_ Send Alert
\(\<Your_Host\>/web/v1/notifications/alert\) send alerts to mobile users through different services (PUSH notifications, SMSs, and Alert List). It receives the following parameters:

| **Name**     	|   **Type**   	| **Required** 	| **Description**                                                  	|
|--------------	|:------------:	|:------------:	|------------------------------------------------------------------	|
| _title_   	| String 	|      Yes     	| Title of the notification.    	|
| _message_   	| String 	|      Yes     	| Message body of the notification.    	|
| _siteUri_   	| String (URI) 	|      Yes     	| URL to website linked to the notification.    	|
| _imageUri_   	| String (URI) 	|      Yes     	| URL to an image to show in the notification.    	|
| _push_   	| Boolean 	|      Yes     	| Whether the alert service should use PUSH notifications.    	|
| _sms_   	| Boolean 	|      Yes     	| Whether the alert service should use SMSs.    	|
| _alertList_   	| Boolean 	|      Yes     	| Whether the alert service should use Alert List notifications.    	|
| _expiresAt_   	| Date 	|      No     	| Expiration date for the alert. May be in Unix time (milliseconds) or in Date String format.    	|

At least one of `push`, `sms`, or `alertList` must be `true`.

It returns **202 _Accepted_** and the created alert object on success.

**Examples**

1. Send PUSH notification only without specific expiration date

    Request body:
      >```JSON
      >{
      >  "title": "test",
      >  "message": "test body",
      >  "siteUri": "http://sample.uri/of/site",
      >  "imageUri": "http://sample.image.uri/1234",
      >  "push": true,
      >  "sms": false,
      >  "alertList": false
      >}
      >```

    Response:
      > _Status code: **202 Acepted**_
      > ```JSON
      > {
      >   "meta": {
      >       "message": "The alerts are being sent by the external services.",
      >       "successfulAlerts": {
      >           "push": true
      >       }
      >   },
      >   "data": {
      >       "id": 23,
      >       "title": "test",
      >       "message": "test body",
      >       "siteUri": "http://sample.uri/of/site",
      >       "imageUri": "http://sample.image.uri/1234",
      >       "sentBy": 38,
      >       "isPUSH": true,
      >       "isSMS": false,
      >       "isAlertList": false,
      >       "expiresAt": "2023-08-12T15:54:51.000Z",
      >       "updatedAt": "2023-08-11T15:54:51.214Z",
      >       "createdAt": "2023-08-11T15:54:51.214Z"
      >   }
      > }
      > ```

2. Send PUSH notification only with specific expiration date

    Request body:
      >```JSON
      >{
      >  "title": "test",
      >  "message": "test body",
      >  "siteUri": "http://sample.uri/of/site",
      >  "imageUri": "http://sample.image.uri/1234",
      >  "push": true,
      >  "sms": false,
      >  "alertList": false,
      >  "expiresAt": "2023-08-15T23:16:41.000Z"
      >}
      >```

    Response:
      > _Status code: **202 Acepted**_
      > ```JSON
      > {
      >   "meta": {
      >       "message": "The alerts are being sent by the external services.",
      >       "successfulAlerts": {
      >           "push": true
      >       }
      >   },
      >   "data": {
      >       "id": 23,
      >       "title": "test",
      >       "message": "test body",
      >       "siteUri": "http://sample.uri/of/site",
      >       "imageUri": "http://sample.image.uri/1234",
      >       "sentBy": 38,
      >       "isPUSH": true,
      >       "isSMS": false,
      >       "isAlertList": false,
      >       "expiresAt": "2023-08-15T23:16:41.000Z",
      >       "updatedAt": "2023-08-11T15:56:46.311Z",
      >       "createdAt": "2023-08-11T15:56:46.311Z"
      >   }
      > }
      > ```

------------


------------
### 4.3. Third-Party Microservice
This microservice handles third-party APIs.

------------
## 5. Contributors

---

- [estebance](https://github.com/estebance)
- [daniel]()
- [andres]()
- [Julián](https://github.com/bitjep)
------------
## 6. License

TBD
