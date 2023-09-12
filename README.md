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
        - [_POST_ edit advertisement category](#post-edit-advertisement-category)
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
      - [4.2.7. Reports](#427-reports)
        - [_GET_ Closest Reports (mobile)](#get-closest-reports-mobile)
        - [_POST_ Register Report (mobile)](#post-register-report-mobile)
        - [_GET_ User Reports (web)](#get-user-reports-web)
      - [4.2.8. Dependencies](#428-dependencies)
        - [_GET_ list dependencies (MOBILE)](#get-list-dependencies-mobile)
        - [_POST_ upload dependencies excel](#post-upload-dependencies-excel)
        - [_GET_ list dependencies](#get-list-dependencies)
        - [_GET_ download dependencies Excel file](#get-download-dependencies-excel-file)
        - [_GET_ download dependencies template file](#get-download-dependencies-template-file)
      - [4.2.9. Security Attention Points](#429-security-attention-points)
        - [_GET_ list security attention points (MOBILE)](#get-list-security-attention-points-mobile)
        - [_POST_ create Security Attention Point](#post-create-security-attention-point)
        - [_POST_ update Security Attention Point](#post-update-security-attention-point)
        - [_POST_ delete Security Attention Point](#post-delete-security-attention-point)
        - [_GET_ list Security Attention Points](#get-list-security-attention-points)
        - [_GET_ single Security Attention Point](#get-single-security-attention-point)
    - [4.3. Third-Party Microservice](#43-third-party-microservice)
    - [4.4. File Management Microservice](#44-file-management-microservice)
      - [App Runner](#app-runner-2)
      - [How to run in local](#how-to-run-in-local-1)
      - [List of endpoints](#list-of-endpoints-2)
        - [Download](#download)
        - [Upload](#upload)
        - [_POST_ Upload Image](#post-upload-image)
        - [_POST_ Upload PDF](#post-upload-pdf)
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
    docker build --platform linux/amd64 -t app_mobility_third_parties_ms -f src/microservices/thirdParties/Dockerfile .
    docker build --platform linux/amd64 -t app_mobility_file_management_ms -f src/microservices/fileManagement/Dockerfile .
    
    # then 
    docker run -d -p 3000:3000 app_mobility_users_ms
    docker run -d -p 3001:3000 app_mobility_notifications_ms 
    docker run -d -p 3002:3000 app_mobility_third_parties_ms 
    docker run -d -p 3003:3000 app_mobility_file_management_ms 
    
    # for deployment tag your versions, this is an example
    docker tag app_mobility_<microservice>_ms:latest <your_aws_account_id>.dkr.ecr.us-east-1.amazonaws.com/app_mobility_<microservice>_ms:latest
    docker push <your_aws_account_id>.dkr.ecr.us-east-1.amazonaws.com/app_mobility_<microservice>_ms:latest

```
Migration to cloud run
```

    # from your root directory execute
    docker build -t app_mobility_admin_ms -f src/microservices/admin/Dockerfile .
    
    # then -v will mount a friendly name volume  
    # bind mounts start with /local_path:/docker_path
    docker run -d -p 3000:3000 -v $(pwd)/src/uploads:/src/uploads app_mobility_admin_ms    
    # for deployment tag your versions, this is an example
    docker tag app_mobility_admin_ms:latest us-east1-docker.pkg.dev/cali-mobility/cali-mobility-admin/admin:latest 
    # 
    
    # because we are using CI/CD with google, it is mandatory to use 
    gcloud builds submit --config cloudbuild.yaml
 
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
\(\<Your_Host\>/api/web/v1/notifications/advertising/\) allows web users to save a new advertisement into the database. It receives the following parameters:

| **Name**     |   **Type**   | **Required** | **Description**                                                  |
| ------------ | :----------: | :----------: | ---------------------------------------------------------------- |
| _imageUri_   | String (URI) |     Yes      | URL to the image that will be displayed in the advertisement.    |
| _siteUri_    | String (URI) |     Yes      | URL to the web site of the vendor.                               |
| _categoryId_ |   Integer    |      No      | ID that references the Category of the advertisement (optional). |

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
\(\<Your_Host\>/api/web/v1/notifications/advertising/\) allows web users to list a set of the advertisements from the database. It receives the following query parameters:


| **Name**       |      **Type**      | **Required** | **Description**             |
| -------------- | :----------------: | :----------: | --------------------------- |
| _page[number]_ | Integer (positive) |     Yes      | Page number for pagination. |
| _page[size]_   | Integer (positive) |     Yes      | Page size for pagination.   |

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
\(\<Your_Host\>/api/web/v1/notifications/advertising/edit\) allows web users to edit an existing advertisement in the database. It receives the following parameters:

| **Name**     |   **Type**   | **Required** | **Description**                                                  |
| ------------ | :----------: | :----------: | ---------------------------------------------------------------- |
| _id_         |   Integer    |     Yes      | ID of the advertisement to edit.                                 |
| _imageUri_   | String (URI) |      No      | URL to the image that will be displayed in the advertisement.    |
| _siteUri_    | String (URI) |      No      | URL to the web site of the vendor.                               |
| _categoryId_ |   Integer    |      No      | ID that references the Category of the advertisement (optional). |
| _active_     |   Boolean    |      No      | Whether the Advertisement is active or not (but not deleted).    |

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
\(\<Your_Host\>/api/web/v1/notifications/advertising/status\) allows web users to directly change the status of an existing advertisement in the database. It receives the following parameters:

| **Name** | **Type** | **Required** | **Description**                                               |
| -------- | :------: | :----------: | ------------------------------------------------------------- |
| _id_     | Integer  |     Yes      | ID of the advertisement to edit.                              |
| _active_ | Boolean  |     Yes      | Whether the Advertisement is active or not (but not deleted). |

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
\(\<Your_Host\>/api/web/v1/notifications/advertising/delete\) allows web users to delete an existing advertisement from the database. This service uses a soft-delete approach. It receives the following parameter:

| **Name** | **Type** | **Required** | **Description**                    |
| -------- | :------: | :----------: | ---------------------------------- |
| _id_     | Integer  |     Yes      | ID of the advertisement to delete. |

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
\(\<Your_Host\>/api/web/v1/notifications/advertisementCategory/\) allows web users to save a new advertisement category into the database. It receives the following parameters:

| **Name** |      **Type**      | **Required** | **Description**        |
| -------- | :----------------: | :----------: | ---------------------- |
| _name_   |       String       |     Yes      | Category name.         |
| _color_  | String (Hex Color) |     Yes      | Color of the category. |

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
\(\<Your_Host\>/api/web/v1/notifications/advertisementCategory/\) allows web users to list a set of the advertisement categories from the database. It receives the following query parameters:


| **Name**       |      **Type**      | **Required** | **Description**             |
| -------------- | :----------------: | :----------: | --------------------------- |
| _page[number]_ | Integer (positive) |      No      | Page number for pagination. |
| _page[size]_   | Integer (positive) |      No      | Page size for pagination.   |

If one of the query parameters (`page[number]` or `page[size]`) is present, the other becomes mandatory.

It returns **200 _OK_** and the list of objects on success.

**Example Response**
> _Status Code: **200 OK**_
> ```JSON
> {
>     "meta": {
>         "page": 1,
>         "pageSize": 20,
>         "totalRecords": 1,
>         "totalPages": 1
>     },
>     "data": [
>         {
>             "id": 2,
>             "name": "sample",
>             "color": "#2d96ad",
>             "createdAt": "2023-07-26T17:06:30.812Z",
>             "updatedAt": "2023-08-16T23:02:30.252Z"
>         }
>     ]
> }
> ```

##### _POST_ edit advertisement category
\(\<Your_Host\>/api/web/v1/notifications/advertisementCategory/edit\) allows web users to edit an existing advertisement category in the database. It receives the following parameters:

| **Name** |      **Type**      | **Required** | **Description**                           |
| -------- | :----------------: | :----------: | ----------------------------------------- |
| _id_     |      Integer       |     Yes      | ID of the advertisement category to edit. |
| _name_   |       String       |      No      | Category name.                            |
| _color_  | String (Hex Color) |      No      | Color of the category.                    |

At least one of the optional (_name_, _color_) parameters must be passed.

It returns **200 _OK_** and the updated object on success.

**Example**

Request body:
  >```JSON
  >{
  >  "id": 2,
  >  "name": "editedCategory",
  >  "color": "#00FF00"
  >}
  >```

Response:
  > _Status code: **200 OK**_
  > ```JSON
  > {
  >   "data": {
  >       "id": 2,
  >       "name": "editedCategory",
  >       "color": "#00FF00",
  >       "createdAt": "2023-07-26T17:06:30.812Z",
  >       "updatedAt": "2023-08-25T14:11:48.550Z"
  >    }
  > }
  > ```

##### _POST_ delete advertisement category
\(\<Your_Host\>/api/web/v1/notifications/advertising/delete\) allows web users to delete an existing advertisement category from the database. This service fails if the category is used. This service uses a soft-delete approach. It receives the following parameter:

| **Name** | **Type** | **Required** | **Description**                             |
| -------- | :------: | :----------: | ------------------------------------------- |
| _id_     | Integer  |     Yes      | ID of the advertisement category to delete. |

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

\(\<Your_Host\>/api/mobile/v1/notifications/publicity/banners/\) allows mobile users to retrieve all the active banners (i.e. categorized advertisements). It receives no parameters. It returns a list of objects with whe image locator `image`, the provider URL `url`, and the category `category`.

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
| Endpoint         | Method | Location in Controller | Description             |
| :--------------- | :----- | :--------------------- | :---------------------- |
| /attention_lines | GET    | getListAll             | Get all attention lines |

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
\(\<Your_Host\>/api/web/v1/notifications/\)


##### _POST_ Register Device Token (mobile)
\(\<Your_Host\>/api/web/v1/notifications/register\) allows mobile users to subscribe their device (i.e. phone) to the PUSH alert service. It receives the following parameter:

| **Name**      | **Type** | **Required** | **Description**                                                     |
| ------------- | :------: | :----------: | ------------------------------------------------------------------- |
| _deviceToken_ |  String  |     Yes      | Token produced by Firebase to identify the device (i.e. smartphone) |

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
\(\<Your_Host\>/api/web/v1/notifications/alert\) send alerts to mobile users through different services (PUSH notifications, SMSs, and Alert List). It receives the following parameters:

| **Name**    |   **Type**   | **Required** | **Description**                                                                             |
| ----------- | :----------: | :----------: | ------------------------------------------------------------------------------------------- |
| _title_     |    String    |     Yes      | Title of the notification.                                                                  |
| _message_   |    String    |     Yes      | Message body of the notification.                                                           |
| _siteUri_   | String (URI) |     Yes      | URL to website linked to the notification.                                                  |
| _imageUri_  | String (URI) |     Yes      | URL to an image to show in the notification.                                                |
| _push_      |   Boolean    |     Yes      | Whether the alert service should use PUSH notifications.                                    |
| _sms_       |   Boolean    |     Yes      | Whether the alert service should use SMSs.                                                  |
| _alertList_ |   Boolean    |     Yes      | Whether the alert service should use Alert List notifications.                              |
| _expiresAt_ |     Date     |      No      | Expiration date for the alert. May be in Unix time (milliseconds) or in Date String format. |

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

#### 4.2.7. Reports

The Reports endpoints allow mobile users to report accidents to both other mobile users and web users using their location.

**_List of endpoints_**
**Mobile App**
	Path: http:localhost:3000/api/mobile/v1/notifications/
	Controller: src\microservices\notifications\v1\controllers\mobileReports.js
	Route: src\microservices\notifications\v1\routes\mobile.js

| Endpoint          | Method | Location in Controller | Description         |
| :---------------- | :----- | :--------------------- | :------------------ |
| /security/reports | GET    | getListAllClosest      | Get closest reports |
| /security/reports | POST   | postRegister           | Create report       |

##### _GET_ Closest Reports (mobile)
\(\<Your_Host\>/api/mobile/v1/notifications/security/reports\) allows mobile users to list a set of the closest report from the database. It receives the following query parameters:

| **Name** | **Type** | **Required** | **Description**                        |
| -------- | :------: | :----------: | -------------------------------------- |
| _lat_    |  Float   |     Yes      | Latitude where incident was reported.  |
| _lon_    |  Float   |     Yes      | Longitude where incident was reported. |

It returns **200 _OK_** and the list of objects on success.

**Example Response**
> _Status Code: **200 OK**_
> ```JSON
> {
>     "meta": null,
>     "data": [
>         {
>           "id": 25,
>           "title": "test title",
>           "description": "test description",
>           "securityCategoryId": 3,
>           "userId": 7,
>           "imageUri": "http://sample.image.uri/1234",
>           "lat": 3.347622,
>           "lon": -72.654755,
>           "updatedAt": "2023-08-25T01:18:45.027Z",
>           "createdAt": "2023-08-25T01:18:45.027Z",
>           "securityCategoryName": "Calzado"
>         }
>     ]
> }
> ```

##### _POST_ Register Report (mobile)
\(\<Your_Host\>/api/mobile/v1/notifications/security/reports\) allows mobile users to create a report. It receives the following parameter:

| **Name**             |   **Type**   | **Required** | **Description**                        |
| -------------------- | :----------: | :----------: | -------------------------------------- |
| _title_              |    String    |     Yes      | Report title.                          |
| _description_        |    String    |      No      | Report description.                    |
| _securityCategoryId_ |   Integer    |     Yes      | Security category identifier.          |
| _imageUri_           | String (URI) |     Yes      | URL to an image to show in the report. |
| _lat_                |    Float     |     Yes      | Latitude where incident was reported.  |
| _lon_                |    Float     |     Yes      | Longitude where incident was reported. |

It returns **201 _created_** and the created object on success.

**Example**

Request body:
  >```JSON
  >{
  >  "title": "test title",
  >  "description": "test description",
  >  "securityCategoryId": 3,
  >  "imageUri": "http://sample.image.uri/1234",
  >  "lat": 3.347622,
  >  "lon": -72.654755
  >}
  >```

Response:
  > _Status code: **201 Created**_
  > ```JSON
  > {
  >   "data": {
  >       "id": 25,
  >       "title": "test title",
  >       "description": "test description",
  >       "securityCategoryId": 3,
  >       "userId": 7,
  >       "imageUri": "http://sample.image.uri/1234",
  >       "lat": 3.347622,
  >       "lon": -72.654755,
  >       "updatedAt": "2023-08-25T01:18:45.027Z",
  >       "createdAt": "2023-08-25T01:18:45.027Z",
  >       "deletedAt": null
  >    }
  > }
  > ```

  **Web App**
  Path: http:localhost:3000/api/web/v1/notifications/
  Controller: src\microservices\notifications\v1\controllers\webReports.js
  Route: src\microservices\notifications\v1\routes\web.js

| Endpoint          | Method | Location in Controller | Description                    |
| :---------------- | :----- | :--------------------- | :----------------------------- |
| /security/reports | GET    | getListAllByUser       | Get reports by user identifier |

##### _GET_ User Reports (web)
\(\<Your_Host\>/api/web/v1/notifications/security/reports\) allows web users to list its own reports from the database. It receives the following query parameters:

| **Name**       |      **Type**      | **Required** | **Description**             |
| -------------- | :----------------: | :----------: | --------------------------- |
| _page[number]_ | Integer (positive) |      No      | Page number for pagination. |
| _page[size]_   | Integer (positive) |      No      | Page size for pagination.   |

If one of the query parameters (`page[number]` or `page[size]`) is present, the other becomes mandatory.

It returns **200 _OK_** and the list of objects on success.

**Example Response**
> _Status Code: **200 OK**_
> ```JSON
> {
>     "meta": null,
>     "data": [
>         {
>           "id": 25,
>           "title": "test title",
>           "description": "test description",
>           "securityCategoryId": 3,
>           "userId": 7,
>           "imageUri": "http://sample.image.uri/1234",
>           "lat": 3.347622,
>           "lon": -72.654755,
>           "updatedAt": "2023-08-25T01:18:45.027Z",
>           "createdAt": "2023-08-25T01:18:45.027Z",
>           "securityCategoryName": "Calzado"
>         }
>     ]
> }
> ```

#### 4.2.8. Dependencies 

The Dependencies end-points allow web users to manage the dependencies shown to mobile users when they create a new PQRS.

**Mobile App**
Path: http:localhost:3000/api/mobile/v1/notifications/attention_lines/dependencies
Controller: src\microservices\notifications\v1\controllers\mobileDependencies.js
Route: src\microservices\notifications\v1\routes\mobile.js
| Endpoint | Method | Location in Controller | Description                                 |
| :------- | :----- | :--------------------- | :------------------------------------------ |
| /        | GET    | getDependencies        | Get all the dependencies to submit a pqrsdf |

##### _GET_ list dependencies (MOBILE)
\(\<Your_Host\>/api/mobile/v1/notifications/dependencies/\) Allows mobile users to list all the dependencies for PQRSs. This requests accepts pagination, although it is optional. The unpaginated request returns up to 500 dependencies. It receives the following query parameters:

| **Name**       |      **Type**      | **Required** | **Description**             |
| -------------- | :----------------: | :----------: | --------------------------- |
| _page[number]_ | Integer (positive) |      No      | Page number for pagination. |
| _page[size]_   | Integer (positive) |      No      | Page size for pagination.   |

It returns **200 _OK_** and the list of objects on success.

**Example Response**
> _Status Code: **200 OK**_
> ```JSON
> [
>     {
>         "id": 9,
>         "name": "DEPARTAMENTO ADMINISTRATIVO DE CONTRATACION PUBLICA"
>     },
>     {
>         "id": 4,
>         "name": "DEPARTAMENTO ADMINISTRATIVO DE CONTROL DISCIPLINARIO INTERNO"
>     },
>     {
>         "id": 3,
>         "name": "DEPARTAMENTO ADMINISTRATIVO DE CONTROL INTERNO"
>     },
>     {
>         "id": 10,
>         "name": "DEPARTAMENTO ADMINISTRATIVO DE DESARROLLO E INNOVACION INSTITUCIONAL"
>     },
>     {
>         "id": 7,
>         "name": "DEPARTAMENTO ADMINISTRATIVO DE GESTION DE MEDIO AMBIENTE"
>     }
> ]
> ```

**Web App**
Path: http:localhost:3000/api/web/v1/notifications/dependencies
Controller: src\microservices\notifications\v1\controllers\webDependencies.js
Route: src\microservices\notifications\v1\routes\web.js

| Endpoint  | Method | Location in Controller      | Description                                   |
| :-------- | :----- | :-------------------------- | :-------------------------------------------- |
| /excel    | POST   | postUploadXlsxDependencies  | Upload excel file with dependencies           |
| /         | GET    | getAllDependencies          | Get paginated dependencies list               |
| /excel    | GET    | getDownloadXlsxDependencies | Download all dependencies in excel            |
| /template | GET    | getDownloadXlsxTemplate     | Download template excel file for dependencies |

##### _POST_ upload dependencies excel
\(\<Your_Host\>/api/web/v1/notifications/dependencies/excel/\) allows web users to upload an excel (xls or xlsx) file in the specified format (id - name) with the dependencies that should appear in the PQRSs services. It receives the following **form** parameter:

| **Name** | **Type** | **Required** | **Description**                                              |
| :------- | :------- | :----------- | :----------------------------------------------------------- |
| _file_   | file     | Yes          | Excel (xls or xlsx) file that contains ALL the dependencies. |

It returns **201 _created_** and the created dependencies on success.

**Example Response**

> _Status code: **201 Created**_
> ```JSON
> {
>     "meta": {
>         "page": 1,
>         "pageSize": 2,
>         "totalRecords": 2,
>         "totalPages": 1
>     },
>     "data": [
>         {
>             "id": 0,
>             "name": "Primer ejemplo de Dependencia de prueba",
>             "createdAt": "2023-08-29T19:26:21.098Z",
>             "updatedAt": "2023-08-30T21:35:19.477Z"
>         },
>         {
>             "id": 1,
>             "name": "Segunda dependencia de prueba",
>             "createdAt": "2023-08-01T02:50:00.000Z",
>             "updatedAt": "2023-08-30T21:35:19.477Z"
>         }
>     ]
> }
> ```

##### _GET_ list dependencies
\(\<Your_Host\>/api/web/v1/notifications/dependencies/\) allows web users to list the existing dependencies in the database. It receives the following query parameters:

| **Name**       |      **Type**      | **Required** | **Description**             |
| -------------- | :----------------: | :----------: | --------------------------- |
| _page[number]_ | Integer (positive) |     Yes      | Page number for pagination. |
| _page[size]_   | Integer (positive) |     Yes      | Page size for pagination.   |

It returns **200 _OK_** and the list of objects on success.

**Example Response**
> _Status Code: **200 OK**_
> ```JSON
> {
>     "meta": {
>         "page": 1,
>         "pageSize": 30,
>         "totalRecords": 3,
>         "totalPages": 1
>     },
>     "data": [
>         {
>             "id": 0,
>             "name": "Primero",
>             "createdAt": "2023-08-29T19:26:21.098Z",
>             "updatedAt": "2023-08-30T22:11:44.235Z"
>         },
>         {
>             "id": 2,
>             "name": "Tercero",
>             "createdAt": "2023-08-01T02:55:00.000Z",
>             "updatedAt": "2023-08-30T22:11:44.235Z"
>         },
>         {
>             "id": 1,
>             "name": "Segundo",
>             "createdAt": "2023-08-01T02:50:00.000Z",
>             "updatedAt": "2023-08-30T22:11:44.235Z"
>         }
>     ]
> }
> ```

##### _GET_ download dependencies Excel file
\(\<Your_Host\>/api/web/v1/notifications/dependencies/excel/\) allows web users to download an XLSX file with all the existing dependencies in the database. It receives no query parameters.

It returns **200 _OK_** and the dependencies XLSX file on success.

##### _GET_ download dependencies template file
\(\<Your_Host\>/api/web/v1/notifications/dependencies/template/\) allows web users to download an XLSX file as a template of how the dependencies XLSX or XLS files should look like. It receives no query parameters.

It returns **200 _OK_** and the template XLSX file on success.

#### 4.2.9. Security Attention Points 

The Security Attention Points end-points allow web users to manage the Security Attention Points shown to mobile users when they need assistance.

**Mobile App**
Path: http:localhost:3000/api/mobile/v1/notifications/security/attention_points
Controller: src\microservices\notifications\v1\controllers\mobileSecurityAttentionPoint.js
Route: src\microservices\notifications\v1\routes\mobile.js
| Endpoint | Method | Location in Controller     | Description                                                                               |
| :------- | :----- | :------------------------- | :---------------------------------------------------------------------------------------- |
| /        | GET    | getSecurityAttentionPoints | Get all the security attention points that may be sorted by name or by shortest distance. |

##### _GET_ list security attention points (MOBILE)
\(\<Your_Host\>/api/mobile/v1/notifications/security/attention_points\) Allows mobile users to list all the Security Attention Points for assistance. This requests accepts location (``lon`` and ``lat``), although it is optional. The located request returns all the security attention points sorted by the shortest distance; the unlocated requests sorts the points by name. It accepts the following query parameters:

| **Name** | **Type** | **Required** | **Description**            |
| -------- | :------: | :----------: | -------------------------- |
| _lon_    |  Double  |      No      | Longitude of the location. |
| _lat_    |  Double  |      No      | Latitude of the location.  |

It returns **200 _OK_** and the list of objects on success.

**Example Response**
> _Status Code: **200 OK**_
> ```JSON
> [
>     {
>         "id": 2,
>         "name": "Edited Sample Point",
>         "color": "#AAFFBB",
>         "iconMap": "https://file-management-cmiesjcqoq-uc.a.run.app/api/v1/file_management/download/test/cd696e0f-eb0a-4c05-b58b-11bc0d1457f2.png",
>         "description": "Example security attention Point",
>         "address": "Cl. 10 #35-2 a 35-60, Olimpico, Cali, Valle del Cauca",
>         "phone": "3001234567",
>         "image": "https://file-management-cmiesjcqoq-uc.a.run.app/api/v1/file_management/download/test/cd696e0f-eb0a-4c05-b58b-11bc0d1457f2.png",
>         "lat": -76.5341,
>         "lon": 3.423993
>     },
>     {
>         "id": 4,
>         "name": "Sample Point",
>         "color": "#AAFFBB",
>         "iconMap": "https://file-management-cmiesjcqoq-uc.a.run.app/api/v1/file_management/download/test/cd696e0f-eb0a-4c05-b58b-11bc0d1457f2.png",
>         "description": "Example security attention Point",
>         "address": "Cl. 10 #35-2 a 35-60, Olimpico, Cali, Valle del Cauca",
>         "phone": "3001234567",
>         "image": "https://file-management-cmiesjcqoq-uc.a.run.app/api/v1/file_management/download/test/cd696e0f-eb0a-4c05-b58b-11bc0d1457f2.png",
>         "lat": -76.5341,
>         "lon": 3.423993
>     },
>     {
>         "id": 3,
>         "name": "Punto de seguridad 1",
>         "color": "#de2138",
>         "iconMap": "http://localhost:3001/api/v1/file_management/download/transport/0ae92c36-7111-4b89-8594-11afb96117f1.png",
>         "description": "Es un campo nuevo por ser probado",
>         "address": "Parque E, Medellín, Antioquia 050010, Colombia",
>         "phone": "3105927851",
>         "image": "http://localhost:3001/api/v1/file_management/download/transport/0ae92c36-7111-4b89-8594-11afb96117f1.png",
>         "lat": -75.568484,
>         "lon": 6.263376
>     }
> ]
> ```

**Web App**
Path: http:localhost:3000/api/web/v1/notifications/security/attentionPoint
Controller: src\microservices\notifications\v1\controllers\webSecurityAttentionPoint.js
Route: src\microservices\notifications\v1\routes\web.js

| Endpoint | Method | Location in Controller           | Description                              |
| :------- | :----- | :------------------------------- | :--------------------------------------- |
| /        | POST   | postCreateSecurityAttentionPoint | Create new Security Attention Point      |
| /edit    | POST   | postEditSecurityAttentionPoint   | Update existing Security Attention Point |
| /delete  | POST   | postDeleteSecurityAttentionPoint | Delete existing Security Attention Point |
| /        | GET    | getAllSecurityAttentionPoints    | List all Security Attention Points       |
| /:id     | GET    | getOneSecurityAttentionPoint     | Get only one Security Attention Point    |

##### _POST_ create Security Attention Point
\(\<Your_Host\>/api/web/v1/notifications/security/attentionPoint\) allows web users to create a new Security Attention Point. It receives the following body parameters:

| **Name**      | **Type**       | **Required** | **Description**                               |
| :------------ | :------------- | :----------- | :-------------------------------------------- |
| _name_        | String         | Yes          | Name of the Security Attention Point.         |
| _description_ | String         | Yes          | Description of the Security Attention Point.  |
| _phone_       | Numeric        | Yes          | Phone number of the Security Attention Point. |
| _color_       | String (Color) | Yes          | Color to show the Security Attention Point.   |
| _address_     | String         | Yes          | Address of the Security Attention Point.      |
| _imageUri_    | String (URI)   | Yes          | Icon of the Security Attention Point.         |
| _lat_         | Double         | Yes          | Latitude of the Security Attention Point.     |
| _lon_         | Double         | Yes          | Longitude of the Security Attention Point.    |

It returns **201 _created_** and the created Security Attention Point on success.

**Example**

Request body:
  >```JSON
  > {
  >   "name": "Sample Point",
  >   "description": "Example security attention Point",
  >   "phone": "3001234567",
  >   "color": "#AAFFBB",
  >   "address": "Cl. 10 #35-2 a 35-60, Olimpico, Cali, Valle del Cauca",
  >   "imageUri": "https://file-management-cmiesjcqoq-uc.a.run.app/api/v1/file_management/download/test/cd696e0f-eb0a-4c05-b58b-11bc0d1457f2.png",
  >   "lat": -76.534100,
  >   "lon": 3.423993
  > }
  >```

Response:
  > _Status code: **201 Created**_
  > ```JSON
  > {
  >     "data": {
  >         "id": 5,
  >         "name": "Sample Point",
  >         "description": "Example security attention Point",
  >         "phone": "3001234567",
  >         "color": "#AAFFBB",
  >         "address": "Cl. 10 #35-2 a 35-60, Olimpico, Cali, Valle del Cauca",
  >         "imageUri": "https://file-management-cmiesjcqoq-uc.a.run.app/api/v1/file_management/download/test/cd696e0f-eb0a-4c05-b58b-11bc0d1457f2.png",
  >         "updatedAt": "2023-09-12T14:53:18.212Z",
  >         "createdAt": "2023-09-12T14:53:18.212Z",
  >         "lat": -76.5341,
  >         "lon": 3.423993
  >     }
  > }
  > ```

##### _POST_ update Security Attention Point
\(\<Your_Host\>/api/web/v1/notifications/security/attentionPoint/edit\) allows web users to update an existing Security Attention Point. It receives the following body parameters:

| **Name**      | **Type**       | **Required** | **Description**                               |
| :------------ | :------------- | :----------- | :-------------------------------------------- |
| _id_          | Integer        | Yes          | ID of the Security Attention Point.           |
| _name_        | String         | No           | Name of the Security Attention Point.         |
| _description_ | String         | No           | Description of the Security Attention Point.  |
| _phone_       | Numeric        | No           | Phone number of the Security Attention Point. |
| _color_       | String (Color) | No           | Color to show the Security Attention Point.   |
| _address_     | String         | No           | Address of the Security Attention Point.      |
| _imageUri_    | String (URI)   | No           | Icon of the Security Attention Point.         |
| _lat_         | Double         | No           | Latitude of the Security Attention Point.     |
| _lon_         | Double         | No           | Longitude of the Security Attention Point.    |

At least one of the optional (_name_, _description_, _phone_, _color_, _address_, _imageUri_, _lat_, _lon_) parameters must be passed. If any of _lat_ or _lon_ are passed, both must be passed.

It returns **200 _OK_** and the updated Security Attention Point on success.

**Example**

Request body:
  >```JSON
  > {
  >     "id": 1,
  >     "address": "Cl. 10 #35-2, Olimpico, Cali, Valle del Cauca",
  >     "lat": -76.534399,
  >     "lon": 3.423700
  > }
  >```

Response:
  > _Status code: **200 OK**_
  > ```JSON
  > {
  >     "data": {
  >         "id": 1,
  >         "name": "Sample Point",
  >         "description": "Example security attention Point",
  >         "phone": "3001234567",
  >         "color": "#AAFFBB",
  >         "address": "Cl. 10 #35-2, Olimpico, Cali, Valle del Cauca",
  >         "imageUri": "https://file-management-cmiesjcqoq-uc.a.run.app/api/v1/file_management/download/test/cd696e0f-eb0a-4c05-b58b-11bc0d1457f2.png",
  >         "createdAt": "2023-09-08T22:14:27.949Z",
  >         "updatedAt": "2023-09-08T23:01:18.337Z",
  >         "lat": -76.534399,
  >         "lon": 3.4237
  >     }
  > }
  > ```

##### _POST_ delete Security Attention Point


##### _GET_ list Security Attention Points
\(\<Your_Host\>/api/web/v1/notifications/security/attentionPoint\) allows web users to list the existing Security Attention Points in the database. It receives the following query parameters:

| **Name**       |      **Type**      | **Required** | **Description**             |
| -------------- | :----------------: | :----------: | --------------------------- |
| _page[number]_ | Integer (positive) |     Yes      | Page number for pagination. |
| _page[size]_   | Integer (positive) |     Yes      | Page size for pagination.   |

It returns **200 _OK_** and the list of objects on success.

**Example Response**
> _Status Code: **200 OK**_
> ```JSON
> {
>     "meta": {
>         "page": 1,
>         "pageSize": 10,
>         "totalRecords": 3,
>         "totalPages": 1
>     },
>     "data": [
>         {
>             "id": 3,
>             "name": "Punto de seguridad 1",
>             "description": "Es un campo nuevo por ser probado",
>             "phone": "3105927851",
>             "color": "#de2138",
>             "address": "Parque E, Medellín, Antioquia 050010, Colombia",
>             "imageUri": "http://localhost:3001/api/v1/file_management/download/transport/0ae92c36-7111-4b89-8594-11afb96117f1.png",
>             "createdAt": "2023-09-11T18:59:29.398Z",
>             "updatedAt": "2023-09-11T18:59:29.398Z",
>             "lat": -75.568484,
>             "lon": 6.263376
>         },
>         {
>             "id": 2,
>             "name": "Edited Sample Point",
>             "description": "Example security attention Point",
>             "phone": "3001234567",
>             "color": "#AAFFBB",
>             "address": "Cl. 10 #35-2 a 35-60, Olimpico, Cali, Valle del Cauca",
>             "imageUri": "https://file-management-cmiesjcqoq-uc.a.run.app/api/v1/file_management/download/test/cd696e0f-eb0a-4c05-b58b-11bc0d1457f2.png",
>             "createdAt": "2023-09-08T22:40:29.659Z",
>             "updatedAt": "2023-09-08T22:40:29.659Z",
>             "lat": -76.5341,
>             "lon": 3.423993
>         },
>         {
>             "id": 1,
>             "name": "Sample Point",
>             "description": "Example security attention Point",
>             "phone": "3001234567",
>             "color": "#AAFFBB",
>             "address": "Cl. 10 #35-2, Olimpico, Cali, Valle del Cauca",
>             "imageUri": "https://file-management-cmiesjcqoq-uc.a.run.app/api/v1/file_management/download/test/cd696e0f-eb0a-4c05-b58b-11bc0d1457f2.png",
>             "createdAt": "2023-09-08T22:14:27.949Z",
>             "updatedAt": "2023-09-08T23:01:18.337Z",
>             "lat": -76.534399,
>             "lon": 3.4237
>         }
>     ]
> }
> ```

##### _GET_ single Security Attention Point
\(\<Your_Host\>/api/web/v1/notifications/security/attentionPoint/:id\) allows web users to obtain one existing Security Attention Point from the database. It receives the following URL parameter:

| **Name** |      **Type**      | **Required** | **Description**                              |
| -------- | :----------------: | :----------: | -------------------------------------------- |
| _id_     | Integer (positive) |     Yes      | Id of the required Security Attention Point. |

It returns **200 _OK_** and the requested object on success.

**Example Response**
> _Status Code: **200 OK**_
> ```JSON
> {
>     "data": {
>         "id": 1,
>         "name": "Sample Point",
>         "description": "Example security attention Point",
>         "phone": "3001234567",
>         "color": "#AAFFBB",
>         "address": "Cl. 10 #35-2, Olimpico, Cali, Valle del Cauca",
>         "imageUri": "https://file-management-cmiesjcqoq-uc.a.run.app/api/v1/file_management/download/test/cd696e0f-eb0a-4c05-b58b-11bc0d1457f2.png",
>         "createdAt": "2023-09-08T22:14:27.949Z",
>         "updatedAt": "2023-09-08T23:01:18.337Z",
>         "lat": -76.534399,
>         "lon": 3.4237
>     }
> }
> ```

------------

------------
### 4.3. Third-Party Microservice
This microservice handles third-party APIs.


------------
### 4.4. File Management Microservice
This microservice handles the files upload and download for the web application.

#### App Runner
    -- Pending --

#### How to run in local
    # On the console
    cd src\microservices\fileManagement
    node index.js

#### List of endpoints
##### Download
	Path: http://localhost:3000/api/v1/file_management/
	Controller: src\microservices\fileManagement\v1\controllers\download.js
	Route: src\microservices\fileManagement\v1\routes\download.js
| Endpoint  | Method | Location in Controller | Description                 |
| :-------- | :----- | :--------------------- | :-------------------------- |
| /download | GET    | downloadFile           | Download the specified file |

The download endpoint allows anyone to download saved resources. This endpoint is not protected.

##### Upload
	Path: http://localhost:3000/api/web/v1/file_management/upload
	Controller: src\microservices\fileManagement\v1\controllers\upload.js
	Route: src\microservices\fileManagement\v1\routes\upload.js
| Endpoint | Method | Location in Controller | Description                             |
| :------- | :----- | :--------------------- | :-------------------------------------- |
| /image   | POST   | postSingleFile         | Upload an image file (JPG, PNG or JPEG) |
| /pdf     | POST   | postSingleFile         | Upload a PDF document                   |

The upload endpoints allow web users to save images and PDF documents into the file server. 

##### _POST_ Upload Image
\(\<Your_Host\>/api/web/v1/file_management/upload/image\) saves images in the file server. It receives the following parameters:

| **Name** | **Type** | **Required** | **Description**                                                                |
| -------- | :------: | :----------: | ------------------------------------------------------------------------------ |
| _image_  |   File   |     Yes      | Image File.                                                                    |
| _folder_ |  String  |     Yes      | Name of the folder that should host the file. Path-like names are not allowed. |

It returns **201 _Created_** and the download url of the uploaded image.

**Example**

Request body (form-data):
  >``` js
  > image: <image file>,
  > folder: "test"
  >```

Response:
  > _Status code: **201 Created**_
  > ```JSON
  > {
  >   "data": {
  >       "downloadUri": "http://localhost:3000/api/v1/file_management/download/testPDF/323fab55-3b63-4f27-b40d-486cc92d9df7.png"
  >    }
  > }
  > ```

##### _POST_ Upload PDF
\(\<Your_Host\>/api/web/v1/file_management/upload/pdf\) saves images in the file server. It receives the following parameters:

| **Name** | **Type** | **Required** | **Description**                                                                |
| -------- | :------: | :----------: | ------------------------------------------------------------------------------ |
| _file_   |   File   |     Yes      | PDF File.                                                                      |
| _folder_ |  String  |     Yes      | Name of the folder that should host the file. Path-like names are not allowed. |

It returns **201 _Created_** and the download url of the uploaded document.

**Example**

Request body (form-data):
  >``` js
  > file: <pdf file>,
  > folder: "test"
  >```

Response:
  > _Status code: **201 Created**_
  > ```JSON
  > {
  >   "data": {
  >       "downloadUri": "http://localhost:3000/api/v1/file_management/download/testPDF/323fab55-3b63-4f27-b40d-486cc92d9df9.pdf"
  >    }
  > }
  > ```

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
