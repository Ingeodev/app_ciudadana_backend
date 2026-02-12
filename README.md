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
      - [4.1.1 Cloud Run in GCP](#411-cloud-run-in-gcp)
      - [4.1.2 How to run in local](#412-how-to-run-in-local)
      - [4.1.3 List of endpoints](#413-list-of-endpoints)
        - [4.1.3.1 Users](#4131-users)
          - [Mobile](#mobile)
          - [Web](#web)
        - [4.1.3.2 Document Types](#4132-document-types)
          - [Mobile](#mobile-1)
          - [Web](#web-1)
        - [4.1.3.3  Web Base Endpoints](#4133--web-base-endpoints)
    - [4.2. Notifications Microservice](#42-notifications-microservice)
      - [4.2.1. Advertising](#421-advertising)
        - [Mobile Endpoints](#mobile-endpoints)
          - [_GET_ Uncategorized advertisements (Publicity)](#get-uncategorized-advertisements-publicity)
          - [_GET_ Categorized advertisements (Banners)](#get-categorized-advertisements-banners)
        - [Web Endpoints](#web-endpoints)
          - [_POST_ save new advertisement](#post-save-new-advertisement)
          - [_GET_ list advertisements](#get-list-advertisements)
          - [_POST_ update advertisement](#post-update-advertisement)
          - [_POST_ change advertisement status](#post-change-advertisement-status)
          - [_POST_ delete advertisement](#post-delete-advertisement)
      - [4.2.2. Mobile Services (Advertisement Categories)](#422-mobile-services-advertisement-categories)
        - [Mobile App](#mobile-app)
        - [Web App](#web-app)
      - [4.2.3. Own Attention Lines](#423-own-attention-lines)
        - [Mobile App](#mobile-app-1)
        - [Web App](#web-app-1)
      - [4.2.4. Alerts](#424-alerts)
        - [Mobile App](#mobile-app-2)
          - [_GET_ Active Alerts (MOBILE)](#get-active-alerts-mobile)
          - [_POST_ Register Device Token (MOBILE)](#post-register-device-token-mobile)
        - [Web App](#web-app-2)
          - [_GET_ All Alerts](#get-all-alerts)
          - [_POST_ Send Alert](#post-send-alert)
      - [4.2.5. Reports](#425-reports)
        - [Mobile App](#mobile-app-3)
          - [_GET_ Closest Reports (MOBILE)](#get-closest-reports-mobile)
          - [_POST_ Register Report (MOBILE)](#post-register-report-mobile)
        - [Web App](#web-app-3)
          - [_GET_ User Reports (web)](#get-user-reports-web)
      - [4.2.6. Dependencies](#426-dependencies)
        - [Mobile App](#mobile-app-4)
          - [_GET_ list dependencies (MOBILE)](#get-list-dependencies-mobile)
        - [Web App](#web-app-4)
          - [_POST_ upload dependencies excel](#post-upload-dependencies-excel)
          - [_GET_ list dependencies](#get-list-dependencies)
          - [_GET_ download dependencies Excel file](#get-download-dependencies-excel-file)
          - [_GET_ download dependencies template file](#get-download-dependencies-template-file)
      - [4.2.7. Security Attention Points](#427-security-attention-points)
        - [Mobile App](#mobile-app-5)
          - [_GET_ list security attention points (MOBILE)](#get-list-security-attention-points-mobile)
        - [Web App](#web-app-5)
          - [_POST_ create Security Attention Point](#post-create-security-attention-point)
          - [_POST_ update Security Attention Point](#post-update-security-attention-point)
          - [_POST_ delete Security Attention Point](#post-delete-security-attention-point)
          - [_GET_ list Security Attention Points](#get-list-security-attention-points)
          - [_GET_ single Security Attention Point](#get-single-security-attention-point)
      - [4.2.8. Gender Equity Attention Points](#428-gender-equity-attention-points)
        - [Mobile App](#mobile-app-6)
        - [Web App](#web-app-6)
      - [4.2.9. Gender Equity Attention Lines](#429-gender-equity-attention-lines)
        - [Mobile App](#mobile-app-7)
        - [Web App](#web-app-7)
      - [4.2.10. Gender Equity Categories](#4210-gender-equity-categories)
        - [Mobile App](#mobile-app-8)
        - [Web App](#web-app-8)
      - [4.2.11. Report Configuration](#4211-report-configuration)
        - [Web App](#web-app-9)
      - [4.2.12. Security Attention Lines](#4212-security-attention-lines)
        - [Mobile App](#mobile-app-9)
        - [Web App](#web-app-10)
      - [4.2.13. Security Categories](#4213-security-categories)
        - [Mobile App](#mobile-app-10)
        - [Web App](#web-app-11)
      - [4.2.14. Social Network](#4214-social-network)
        - [Mobile App](#mobile-app-11)
        - [Web App](#web-app-12)
      - [4.2.15. Base endpoints](#4215-base-endpoints)
        - [Web App](#web-app-13)
    - [4.3. Third-Party Microservice](#43-third-party-microservice)
      - [4.3.1. Cities](#431-cities)
        - [Mobile App](#mobile-app-12)
        - [Web App](#web-app-14)
      - [4.3.2. Third-Party Categories](#432-third-party-categories)
        - [Mobile App](#mobile-app-13)
        - [Web App](#web-app-15)
      - [4.3.3. Third-Party Companies](#433-third-party-companies)
        - [Mobile App](#mobile-app-14)
        - [Web App](#web-app-16)
      - [4.3.4. ThirdParty Company Services](#434-thirdparty-company-services)
        - [Web App](#web-app-17)
      - [4.3.5. Tourism Categories](#435-tourism-categories)
        - [Mobile App](#mobile-app-15)
          - [_GET_ list tourism categories (MOBILE)](#get-list-tourism-categories-mobile)
        - [Web App](#web-app-18)
          - [_POST_ create Tourism Category](#post-create-tourism-category)
          - [_POST_ update Tourism Category](#post-update-tourism-category)
          - [_POST_ delete Tourism Category](#post-delete-tourism-category)
          - [_GET_ list Tourism Categories](#get-list-tourism-categories)
      - [4.3.6. Tourism Companies](#436-tourism-companies)
        - [Mobile App](#mobile-app-16)
        - [Web App](#web-app-19)
      - [4.3.7. Tourism Services](#437-tourism-services)
        - [Web App](#web-app-20)
      - [4.3.8. Transport Companies](#438-transport-companies)
        - [Web App](#web-app-21)
      - [4.3.9. Transport Routes](#439-transport-routes)
        - [Mobile App](#mobile-app-17)
        - [Web App - Transport Route](#web-app---transport-route)
        - [Web App - Transport Route Timetables - Date field](#web-app---transport-route-timetables---date-field)
        - [Web App - Transport Route Timetables - Hour n Tariff fields](#web-app---transport-route-timetables---hour-n-tariff-fields)
      - [4.3.10. Base endpoint](#4310-base-endpoint)
        - [Web App](#web-app-22)
      - [4.3.11. Taxis](#4311-taxis)
        - [Mobile App](#mobile-app-18)
      - [4.3.12. API: Tourism Services](#4312-api-tourism-services)
        - [Web App](#web-app-23)
      - [4.3.13. API: Tourism Services](#4313-api-tourism-services)
        - [Web App](#web-app-24)
    - [4.4. File Management Microservice](#44-file-management-microservice)
      - [How to run in local](#how-to-run-in-local)
      - [List of endpoints](#list-of-endpoints)
        - [Download](#download)
        - [Upload](#upload)
          - [_POST_ Upload Image](#post-upload-image)
          - [_POST_ Upload PDF](#post-upload-pdf)
    - [4.5. Traffic (Mobility) Microservice](#45-traffic-mobility-microservice)
      - [4.5.1. Bikes TermsConditions](#451-bikes-termsconditions)
        - [Mobile App](#mobile-app-19)
        - [Web App](#web-app-25)
      - [4.5.2. Configuration of Traffic Notifications](#452-configuration-of-traffic-notifications)
        - [Web App](#web-app-26)
      - [4.5.3. Road States](#453-road-states)
        - [Mobile App](#mobile-app-20)
        - [Web App](#web-app-27)
    - [4.6. Admins Microservice](#46-admins-microservice)
      - [4.6.1. Admin without security](#461-admin-without-security)
        - [Web App](#web-app-28)
      - [4.6.2. Admin](#462-admin)
        - [Web App](#web-app-29)
      - [4.6.3. Admin Notifications](#463-admin-notifications)
        - [Web App](#web-app-30)
      - [4.6.3. Role](#463-role)
        - [Web App](#web-app-31)
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

### 4.1. Users Microservice
This microservice handles the [**Users**](#4131-users) and [**Document Types**](#4132-document-types) end-points. And an [**endpoint**](#4133-web-base-endpoints) to validate that a given latitude and longitude belongs to the area of the City of Cali, Valle del Cauca.

#### 4.1.1 Cloud Run in GCP
    https://users-cmiesjcqoq-ue.a.run.app

#### 4.1.2 How to run in local
    # On the console
    cd src\microservices\users
    node index.js

#### 4.1.3 List of endpoints
##### 4.1.3.1 Users
###### Mobile
	Path: http:localhost:3000/api/mobile/v1/users
	Controller: src\microservices\users\v1\controllers\mobile\users.js
	Route: src\microservices\users\v1\routes\mobile.js
| Endpoint             | Method | Location in Controller | Description                                               |
| :------------------- | :----- | :--------------------- | :-------------------------------------------------------- |
| /account/info        | POST   | postAccountInfo        | Create the user base information - loginPhase="baseLogin" |
| /account/full_login  | POST   | postAccountFullLogin   | Update missing user data - when loginPhase="baseLogin"    |
| /account/info        | GET    | getAccountInfo         | Get user data and login phase                             |
| /account/login/phase | GET    | getAccountLoginPhase   | Get the user loginPhase state                             |
| /account/edit        | POST   | postAccountUpdateUser  | Update user data - when loginPhase="fullLogin"            |

###### Web
	Path: http:localhost:3000/api/web/v1/users
	Controller: src\microservices\users\v1\controllers\web\users.js
	Route: src\microservices\users\v1\routes\web.js
| Endpoint             | Method | Location in Controller  | Description                                               |
| :------------------- | :----- | :---------------------- | :-------------------------------------------------------- |
| /                    | GET    | getUsersListAll         | Get all users (web + app)                                 |
| /status              | POST   | postUsersStatus         | Update  status user.disabled=true                         |
| /full_login          | POST   | postUsersFullLogin      | Update users.loginPhase to fullLogin                      |
| /base_login          | POST   | postUsersBaseLogin      | Update the users.loginPhase="inVerification" to "baseLogin"|
| /account/info        | POST   | postAccountInfo         | Create the user base information - loginPhase="baseLogin" |
| /account/full_login  | POST   | postAccountFullLogin    | Update missing user data - when loginPhase="baseLogin"    |
| /account/info        | GET    | getAccountInfo          | Get user data and login phase                             |
| /account/login/phase | GET    | getAccountLoginPhase    | Get the user loginPhase state                             |
| /account/edit        | POST   | postAccountUpdateUser   | Update user data - when loginPhase="fullLogin"            |

##### 4.1.3.2 Document Types
###### Mobile
	Path: http:localhost:3000/api/mobile/v1/users
	Controller: src\microservices\users\v1\controllers\mobile\documentTypes.js
	Route: src\microservices\users\v1\routes\mobile.js
| Endpoint             | Method | Location in Controller | Description                                               |
| :------------------- | :----- | :--------------------- | :-------------------------------------------------------- |
| /document_types        | GET   | getAll        | Get all document types |

###### Web
	Path: http:localhost:3000/api/web/v1/users
	Controller: src\microservices\users\v1\controllers\web\documentTypes.js
	Route: src\microservices\users\v1\routes\web.js
| Endpoint             | Method | Location in Controller | Description                                               |
| :------------------- | :----- | :--------------------- | :-------------------------------------------------------- |
| /document_types        | POST   | postRegister        | Create a document type |
| /document_types/edit        | POST   | postEdit        | Update document type |
| /document_types        | GET   | getAll        | Get all document types |
| /document_types/:id        | GET   | getOneById        | Get document type by id |


##### 4.1.3.3  Web Base Endpoints
	Path: http:localhost:3000/api/web/v1/users
	Controller: src\microservices\users\v1\controllers\web\base.js
	Route: src\microservices\users\v1\routes\web.js
| Endpoint             | Method | Location in Controller | Description                                               |
| :------------------- | :----- | :--------------------- | :-------------------------------------------------------- |
| /validate_lat_lon        | POST   | postValidateLatLon        | Validate lat and lon must belong to the area of the municipality of Cali, Valle del Cauca, Colombia |

------------

### 4.2. Notifications Microservice

This microservice handles the [**Advertising**](#advertising), [**Publicity**](#publicity), [**Attention Lines**](#attention-lines), [**Service Lines**](#service-lines), and [**Alert**](#alert) end-points.

    https://notifications-cmiesjcqoq-ue.a.run.app

------------

#### 4.2.1. Advertising

##### Mobile Endpoints

The Publicity end-points allow the mobile user to consume the advertisements managed by web users in [advertising](#advertising).

Path: http:localhost:3000/api/mobile/v1/notifications/publicity
Controller: src\microservices\notifications\v1\controllers\mobilePublicity.js
Route: src\microservices\notifications\v1\routes\mobile.js

| Endpoint  | Method | Location in Controller | Description          |
| :-------- | :----- | :--------------------- | :------------------- |
| /         | GET    | getUncategorized          | Retrieve the advertisements that have no category attached.    |
| /register | GET    | getCategorized           | Retrieve the advertisements with a category attached. |


###### _GET_ Uncategorized advertisements (Publicity)


###### _GET_ Categorized advertisements (Banners)

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

##### Web Endpoints

The Advertising end-points allow the web user to manage the advertisements shown to mobile users.

Path: http:localhost:3000/api/web/v1/notifications/informationmb
Controller: src\microservices\notifications\v1\controllers\webAdvertisement.js
Route: src\microservices\notifications\v1\routes\web.js

| Endpoint  | Method | Location in Controller | Description          |
| :-------- | :----- | :--------------------- | :------------------- |
| /         | GET    | getAllAdvertisements          | Get all registered advertisements.    |
| / | POST    | postAdvertisement           | Create an advertisement. |
| /edit | POST    | postAdvertisementEdit           | Edit an advertisement |
| /status | POST    | postAdvertisementStatus           | Change the status of an advertisement |
| /delete | POST    | postAdvertisementDelete           | Remove (Soft-Delete) an advertisement. |


###### _POST_ save new advertisement
\(\<Your_Host\>/api/web/v1/notifications/informationmb/\) allows web users to save a new advertisement into the database. It receives the following parameters:

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

###### _GET_ list advertisements
\(\<Your_Host\>/api/web/v1/notifications/informationmb/\) allows web users to list a set of the advertisements from the database. It receives the following query parameters:


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

###### _POST_ update advertisement
\(\<Your_Host\>/api/web/v1/notifications/informationmb/edit\) allows web users to edit an existing advertisement in the database. It receives the following parameters:

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

###### _POST_ change advertisement status
\(\<Your_Host\>/api/web/v1/notifications/informationmb/status\) allows web users to directly change the status of an existing advertisement in the database. It receives the following parameters:

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

###### _POST_ delete advertisement
\(\<Your_Host\>/api/web/v1/notifications/informationmb/delete\) allows web users to delete an existing advertisement from the database. This service uses a soft-delete approach. It receives the following parameter:

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

#### 4.2.2. Mobile Services (Advertisement Categories)

The Advertisement Categories end-points allow the web user to manage the advertisement categories that can classify the [**advertisements**](#421-advertising).

##### Mobile App
Path: http:localhost:3000/api/mobile/v1/notifications/services
Controller: src\microservices\notifications\v1\controllers\mobileMobileService.js
Route: src\microservices\notifications\v1\routes\mobile.js
| Endpoint | Method | Location in Controller     | Description                                                                               |
| :------- | :----- | :------------------------- | :---------------------------------------------------------------------------------------- |
| /        | GET    | getMobileServices | Get all registered mobile services. |

##### Web App
Path: http:localhost:3000/api/web/v1/notifications/mobile_services
Controller: src\microservices\notifications\v1\controllers\webMobileService.js
Route: src\microservices\notifications\v1\routes\web.js

| Endpoint | Method | Location in Controller           | Description                              |
| :------- | :----- | :------------------------------- | :--------------------------------------- |
| /        | GET   | listMobileServices | List all registered Mobile Services      |
| /access  | GET   | listMobileServiceTypes   | List all types of access used in the mobile application |
| /        | POST   | registerMobileService | Create a new Mobile Service record |
| /edit    | POST    | updateMobileService    | Edit a Mobile Service record |
| /status  | POST    | changeStatusMobileService    | Change the status (activated or deactivated) of a Mobile Service. |
| /delete  | POST    | deleteMobileService    | Delete (Soft-Delete) a registered Mobile Service |

------------


#### 4.2.3. Own Attention Lines

##### Mobile App
	Path: http:localhost:3000/api/mobile/v1/notifications/attention_lines
	Controller: src\microservices\notifications\v1\controllers\mobileAttentionLines.js
	Route: src\microservices\notifications\v1\routes\mobile.js
| Endpoint         | Method | Location in Controller | Description             |
| :--------------- | :----- | :--------------------- | :---------------------- |
| / | GET    | getAttentionLine             | Get all attention lines |

##### Web App
	Path: http:localhost:3000/api/web/v1/notifications/attention_lines
	Controller: src\microservices\notifications\v1\controllers\webAttentionLines.js
	Route: src\microservices\notifications\v1\routes\web.js

| Endpoint                | Method | Location in Controller | Description                              |
| :---------------------- | :----- | :--------------------- | :--------------------------------------- |
| /       | POST   | postRegister           | Create the attention line                 |
| /    | GET    | getOne       | Get the attention line              |

------------


#### 4.2.4. Alerts

The Alerts endpoints allow web users to send alerts to mobile users through different services (PUSH notifications, SMSs, and Alert List), and list the previously-delivered alerts.

##### Mobile App
	Path: http:localhost:3000/api/mobile/v1/notifications/notifications/
	Controller: src\microservices\notifications\v1\controllers\mobileAlert.js
	Route: src\microservices\notifications\v1\routes\mobile.js

| Endpoint  | Method | Location in Controller | Description          |
| :-------- | :----- | :--------------------- | :------------------- |
| /         | GET    | getListActive          | Get active alerts    |
| /register | POST   | registerPush           | Send alerts to users |


 ###### _GET_ Active Alerts (MOBILE)
\(\<Your_Host\>/api/mobile/v1/notifications/notifications/\) allow mobile users to list the valid notifications. This service accepts both paginated and unpaginated requests. The unpaginated request returns up to 500 Notifications ordered from the most recent to the oldest. It receives the following optional parameters:

| **Name**       |      **Type**      | **Required** | **Description**             |
| -------------- | :----------------: | :----------: | --------------------------- |
| _page[number]_ | Integer (positive) |      No      | Page number for pagination. |
| _page[size]_   | Integer (positive) |      No      | Page size for pagination.   |

Note that if any of the optional parameters (_page[number]_ or _page[size]_) is passed, both must be passed.

It returns **200 _OK_** and the list of objects on success.

**Example Response**
> _Status Code: **200 OK**_
> ```JSON
> [
>     {
>         "id": 53,
>         "date": "2023-09-13T14:40:24.215Z",
>         "title": "test 3",
>         "message": "test body",
>         "url": "http://sample.uri/of/site",
>         "image": "http://sample.image.uri/1234"
>     },
>     {
>         "id": 52,
>         "date": "2023-09-13T14:40:16.302Z",
>         "title": "test 2",
>         "message": "test body",
>         "url": "http://sample.uri/of/site",
>         "image": "http://sample.image.uri/1234"
>     },
>     {
>         "id": 51,
>         "date": "2023-09-13T14:40:10.744Z",
>         "title": "test",
>         "message": "test body",
>         "url": "http://sample.uri/of/site",
>         "image": "http://sample.image.uri/1234"
>     }
> ]
> ```


###### _POST_ Register Device Token (MOBILE)
\(\<Your_Host\>/api/mobile/v1/notifications/notifications/register\) allows mobile users to subscribe their device (i.e. phone) to the PUSH alert service. It receives the following parameter:

| **Name**      | **Type** | **Required** | **Description**                                                     |
| ------------- | :------: | :----------: | ------------------------------------------------------------------- |
| _deviceToken_ |  String  |     Yes      | Token produced by Firebase to identify the device (i.e. smartphone) |

It returns **200 _OK_** and the device token on success.

**Example**

Request body:
  >```JSON
  >{
  >    "deviceToken": "fe7FvKerRu2a6I29sjeWm_:APA91bFyTkoAsfID7YYUUznxKhE2vDNP4eWy_9Pm9V4EjDBmdqnqZKAQRicrM4yF3euJdvauvun9VLTM6B_oKR1Prmsjhcw1sJxxgfREsbMhgzWXTau_PO7TU6OyL-7XDZl_Piqz-6cX"
  >}
  >```

Response:
  > _Status code: **200 OK**_
  > ```JSON
  > {
  >    "data": {
  >        "deviceToken": "fe7FvKerRu2a6I29sjeWm_:APA91bFyTkoAsfID7YYUUznxKhE2vDNP4eWy_9Pm9V4EjDBmdqnqZKAQRicrM4yF3euJdvauvun9VLTM6B_oKR1Prmsjhcw1sJxxgfREsbMhgzWXTau_PO7TU6OyL-7XDZl_Piqz-6cX"
  >    }
  > }
  > ```

##### Web App
	Path: http:localhost:3000/api/web/v1/notifications/alert
	Controller: src\microservices\notifications\v1\controllers\webAlert.js
	Route: src\microservices\notifications\v1\routes\web.js

| Endpoint | Method | Location in Controller | Description          |
| :------- | :----- | :--------------------- | :------------------- |
| /alert   | GET    | getlistAll             | Get all alerts       |
| /alert   | POST   | sendAlerts             | Send alerts to users |

###### _GET_ All Alerts
\(\<Your_Host\>/api/web/v1/notifications/alert\) allow web users to list all the valid and expired alerts. It receives the following query parameters:

| **Name**       |      **Type**      | **Required** | **Description**             |
| -------------- | :----------------: | :----------: | --------------------------- |
| _page[number]_ | Integer (positive) |     Yes      | Page number for pagination. |
| _page[size]_   | Integer (positive) |     Yes      | Page size for pagination.   |

It returns **200 _OK_** and the list of objects in data on success.

**Example Response**
> _Status Code: **200 OK**_
> ```JSON
> {
>     "meta": {
>         "page": 1,
>         "pageSize": 5,
>         "totalRecords": 31,
>         "totalPages": 7
>     },
>     "data": [
>         {
>             "id": 85,
>             "sentBy": 2,
>             "title": "Prueba: Ignorar",
>             "message": "Esta es una prueba automática, por favor ignórela.",
>             "siteUri": "https://www.cali.gov.co/",
>             "imageUri": "https://www.cali.gov.co/info/principal/media/bloque210342.png",
>             "isSMS": false,
>             "isPUSH": true,
>             "expiresAt": "2023-09-14T22:25:19.000Z",
>             "createdAt": "2023-09-14T22:24:21.086Z"
>         },
>         {
>             "id": 84,
>             "sentBy": 2,
>             "title": "Prueba: Ignorar",
>             "message": "Esta es una prueba automática, por favor ignórela.",
>             "siteUri": "https://www.cali.gov.co/",
>             "imageUri": "https://www.cali.gov.co/info/principal/media/bloque210342.png",
>             "isSMS": false,
>             "isPUSH": true,
>             "expiresAt": "2023-09-14T22:23:33.000Z",
>             "createdAt": "2023-09-14T22:22:34.719Z"
>         },
>         {
>             "id": 83,
>             "sentBy": 2,
>             "title": "Prueba: Ignorar",
>             "message": "Esta es una prueba automática, por favor ignórela.",
>             "siteUri": "https://www.cali.gov.co/",
>             "imageUri": "https://www.cali.gov.co/info/principal/media/bloque210342.png",
>             "isSMS": false,
>             "isPUSH": true,
>             "expiresAt": "2023-09-14T21:53:28.000Z",
>             "createdAt": "2023-09-14T21:52:30.084Z"
>         },
>         {
>             "id": 82,
>             "sentBy": 2,
>             "title": "Prueba: Ignorar",
>             "message": "Esta es una prueba automática, por favor ignórela.",
>             "siteUri": "https://www.cali.gov.co/",
>             "imageUri": "https://www.cali.gov.co/info/principal/media/bloque210342.png",
>             "isSMS": false,
>             "isPUSH": true,
>             "expiresAt": "2023-09-14T21:38:09.000Z",
>             "createdAt": "2023-09-14T21:37:11.631Z"
>         },
>         {
>             "id": 81,
>             "sentBy": 2,
>             "title": "Prueba: Ignorar",
>             "message": "Esta es una prueba automática, por favor ignórela.",
>             "siteUri": "https://www.cali.gov.co/",
>             "imageUri": "https://www.cali.gov.co/info/principal/media/bloque210342.png",
>             "isSMS": false,
>             "isPUSH": true,
>             "expiresAt": "2023-09-14T21:33:48.000Z",
>             "createdAt": "2023-09-14T21:32:51.826Z"
>         }
>     ]
> }
> ```

###### _POST_ Send Alert
\(\<Your_Host\>/api/web/v1/notifications/alert\) send alerts to mobile users through different services (PUSH notifications, SMSs, and Alert List). It receives the following parameters:

| **Name**    |   **Type**   | **Required** | **Description**                                                                             |
| ----------- | :----------: | :----------: | ------------------------------------------------------------------------------------------- |
| _title_     |    String    |     Yes      | Title of the notification.                                                                  |
| _message_   |    String    |     Yes      | Message body of the notification.                                                           |
| _siteUri_   | String (URI) |     Yes      | URL to website linked to the notification.                                                  |
| _imageUri_  | String (URI) |     Yes      | URL to an image to show in the notification.                                                |
| _push_      |   Boolean    |     Yes      | Whether the alert service should use PUSH notifications.                                    |
| _sms_       |   Boolean    |     Yes      | Whether the alert service should use SMSs.                                                  |
| _expiresAt_ |     Date     |      No      | Expiration date for the alert. May be in Unix time (milliseconds) or in Date String format. |

At least one of `push` or `sms` must be `true`.

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
      >  "sms": false
      >}
      >```

    Response:
      > _Status code: **202 Accepted**_
      > ```JSON
      > {
      >   "meta": {
      >       "message": "The alerts are being sent by the external services.",
      >       "acceptedAlerts": {
      >           "count": 2,
      >           "push": true,
      >           "sms": false,
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
      >       "expiresAt": "2023-08-12T15:54:51.000Z",
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
      >  "expiresAt": "2023-08-15T23:16:41.000Z"
      >}
      >```

    Response:
      > _Status code: **202 Acepted**_
      > ```JSON
      > {
      >   "meta": {
      >       "message": "The alerts are being sent by the external services.",
      >       "acceptedAlerts": {
      >           "count": 2,
      >           "push": true,
      >           "sms": false,
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
      >       "expiresAt": "2023-08-15T23:16:41.000Z",
      >       "createdAt": "2023-08-11T15:56:46.311Z"
      >   }
      > }
      > ```

------------

#### 4.2.5. Reports

The Reports endpoints allow mobile users to report accidents to both other mobile users and web users using their location.

##### Mobile App
	Path: http:localhost:3000/api/mobile/v1/notifications/
	Controller: src\microservices\notifications\v1\controllers\mobileReports.js
	Route: src\microservices\notifications\v1\routes\mobile.js

| Endpoint          | Method | Location in Controller | Description         |
| :---------------- | :----- | :--------------------- | :------------------ |
| /security/reports | GET    | getListAllClosest      | Get closest reports |
| /security/reports | POST   | postRegister           | Create report       |

###### _GET_ Closest Reports (MOBILE)
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

###### _POST_ Register Report (MOBILE)
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

##### Web App
  Path: http:localhost:3000/api/web/v1/notifications/security/reports
  Controller: src\microservices\notifications\v1\controllers\webReports.js
  Route: src\microservices\notifications\v1\routes\web.js

| Endpoint          | Method | Location in Controller | Description                    |
| :---------------- | :----- | :--------------------- | :----------------------------- |
| /approve          | POST    | postApprove       | Approve a report |
| /disapprove       | POST    | postDisapprove       | Disapprove a report |
| /expires          | POST    | postExpires       | Modify the expiration date of an approved report |
| /                 | GET    | getListAll       | Get all reports |
| /:id              | GET    | getReport       | Get report by id |

###### _GET_ User Reports (web)
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

#### 4.2.6. Dependencies 

The Dependencies end-points allow web users to manage the dependencies shown to mobile users when they create a new PQRS.

##### Mobile App
Path: http:localhost:3000/api/mobile/v1/notifications/attention_lines/dependencies
Controller: src\microservices\notifications\v1\controllers\mobileDependencies.js
Route: src\microservices\notifications\v1\routes\mobile.js
| Endpoint | Method | Location in Controller | Description                                 |
| :------- | :----- | :--------------------- | :------------------------------------------ |
| /        | GET    | getDependencies        | Get all the dependencies to submit a pqrsdf |

###### _GET_ list dependencies (MOBILE)
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

##### Web App
Path: http:localhost:3000/api/web/v1/notifications/dependencies
Controller: src\microservices\notifications\v1\controllers\webDependencies.js
Route: src\microservices\notifications\v1\routes\web.js

| Endpoint  | Method | Location in Controller      | Description                                   |
| :-------- | :----- | :-------------------------- | :-------------------------------------------- |
| /         | GET    | getAllDependencies          | Get paginated dependencies list               |
| /template | GET    | getDownloadXlsxTemplate     | Download template excel file for dependencies |
| /excel    | POST   | postUploadXlsxDependencies  | Upload excel file with dependencies           |
| /excel    | GET    | getDownloadXlsxDependencies | Download all dependencies in excel            |

###### _POST_ upload dependencies excel
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

###### _GET_ list dependencies
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

###### _GET_ download dependencies Excel file
\(\<Your_Host\>/api/web/v1/notifications/dependencies/excel/\) allows web users to download an XLSX file with all the existing dependencies in the database. It receives no query parameters.

It returns **200 _OK_** and the dependencies XLSX file on success.

###### _GET_ download dependencies template file
\(\<Your_Host\>/api/web/v1/notifications/dependencies/template/\) allows web users to download an XLSX file as a template of how the dependencies XLSX or XLS files should look like. It receives no query parameters.

It returns **200 _OK_** and the template XLSX file on success.

#### 4.2.7. Security Attention Points 

The Security Attention Points end-points allow web users to manage the Security Attention Points shown to mobile users when they need assistance.

##### Mobile App
Path: http:localhost:3000/api/mobile/v1/notifications/security/attention_points
Controller: src\microservices\notifications\v1\controllers\mobileSecurityAttentionPoint.js
Route: src\microservices\notifications\v1\routes\mobile.js
| Endpoint | Method | Location in Controller     | Description                                                                               |
| :------- | :----- | :------------------------- | :---------------------------------------------------------------------------------------- |
| /        | GET    | getSecurityAttentionPoints | Get all the security attention points that may be sorted by name or by shortest distance. |

###### _GET_ list security attention points (MOBILE)
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
>         "color": "AAFFBB",
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
>         "color": "AAFFBB",
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
>         "color": "de2138",
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

##### Web App
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

###### _POST_ create Security Attention Point
\(\<Your_Host\>/api/web/v1/notifications/security/attentionPoint\) allows web users to create a new Security Attention Point. It receives the following body parameters:

| **Name**      | **Type**        | **Required** | **Description**                               |
| :------------ | :-------------- | :----------- | :-------------------------------------------- |
| _name_        | String          | Yes          | Name of the Security Attention Point.         |
| _description_ | String          | Yes          | Description of the Security Attention Point.  |
| _phone_       | String (Number) | Yes          | Phone number of the Security Attention Point. |
| _color_       | String (Color)  | Yes          | Color to show the Security Attention Point.   |
| _address_     | String          | Yes          | Address of the Security Attention Point.      |
| _imageUri_    | String (URI)    | Yes          | Icon of the Security Attention Point.         |
| _lat_         | Double          | Yes          | Latitude of the Security Attention Point.     |
| _lon_         | Double          | Yes          | Longitude of the Security Attention Point.    |

Note that the position (_lat_ and _lon_) must be inside the city of Cali, Valle del Cauca, Colombia.

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

###### _POST_ update Security Attention Point
\(\<Your_Host\>/api/web/v1/notifications/security/attentionPoint/edit\) allows web users to update an existing Security Attention Point. It receives the following body parameters:

| **Name**      | **Type**        | **Required** | **Description**                               |
| :------------ | :-------------- | :----------- | :-------------------------------------------- |
| _id_          | Integer         | Yes          | ID of the Security Attention Point.           |
| _name_        | String          | No           | Name of the Security Attention Point.         |
| _description_ | String          | No           | Description of the Security Attention Point.  |
| _phone_       | String (Number) | No           | Phone number of the Security Attention Point. |
| _color_       | String (Color)  | No           | Color to show the Security Attention Point.   |
| _address_     | String          | No           | Address of the Security Attention Point.      |
| _imageUri_    | String (URI)    | No           | Icon of the Security Attention Point.         |
| _lat_         | Double          | No           | Latitude of the Security Attention Point.     |
| _lon_         | Double          | No           | Longitude of the Security Attention Point.    |

At least one of the optional (_name_, _description_, _phone_, _color_, _address_, _imageUri_, _lat_, _lon_) parameters must be passed. If any of _lat_ or _lon_ are passed, both must be passed. 

Note that the position (_lat_ and _lon_) must be inside the city of Cali, Valle del Cauca, Colombia.

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

###### _POST_ delete Security Attention Point
\(\<Your_Host\>/api/web/v1/notifications/security/attentionPoint/delete\) allows web users to delete an existing Security Attention Point. It receives the following body parameter:

| **Name** | **Type** | **Required** | **Description**                     |
| :------- | :------- | :----------- | :---------------------------------- |
| _id_     | Integer  | Yes          | ID of the Security Attention Point. |

It returns **200 _OK_** and the ID of the deleted Security Attention Point on success.

**Example**

Request body:
  >```JSON
  > {
  >     "id": 1
  > }
  >```

Response:
  > _Status code: **200 OK**_
  > ```JSON
  > {
  >     "data": {
  >         "id": 1
  >     }
  > }
  > ```

###### _GET_ list Security Attention Points
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

###### _GET_ single Security Attention Point
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

#### 4.2.8. Gender Equity Attention Points 

##### Mobile App
Path: http:localhost:3000/api/mobile/v1/notifications/gender/attention_points
Controller: src\microservices\notifications\v1\controllers\mobileGender.js
Route: src\microservices\notifications\v1\routes\mobile.js
| Endpoint | Method | Location in Controller     | Description                                                                               |
| :------- | :----- | :------------------------- | :---------------------------------------------------------------------------------------- |
| /        | GET    | getAttentionPoints | Get all gender attention points |

##### Web App
Path: http:localhost:3000/api/web/v1/notifications/gender_point
Controller: src\microservices\notifications\v1\controllers\webGenderAttentionPoint.js
Route: src\microservices\notifications\v1\routes\web.js

| Endpoint | Method | Location in Controller           | Description                              |
| :------- | :----- | :------------------------------- | :--------------------------------------- |
| /        | POST   | postRegister | Create an attention point of gender equity      |
| /edit    | POST   | postEdit   | Update an attention point of gender equity |
| /delete  | POST   | postDelete | Destroy (Soft delete) an attention point of gender equity |
| /        | GET    | getListAll    | Get all attention points of gender equity       |


------------



#### 4.2.9. Gender Equity Attention Lines 

##### Mobile App
Path: http:localhost:3000/api/mobile/v1/notifications/gender
Controller: src\microservices\notifications\v1\controllers\mobileGender.js
Route: src\microservices\notifications\v1\routes\mobile.js
| Endpoint | Method | Location in Controller     | Description                                                                               |
| :------- | :----- | :------------------------- | :---------------------------------------------------------------------------------------- |
| /        | GET    | getCategoriesnAttentionLines | Get all gender attention lines and gender categories. |

##### Web App
Path: http:localhost:3000/api/web/v1/notifications/gender_line
Controller: src\microservices\notifications\v1\controllers\webGenderAttentionLines.js
Route: src\microservices\notifications\v1\routes\web.js

| Endpoint | Method | Location in Controller           | Description                              |
| :------- | :----- | :------------------------------- | :--------------------------------------- |
| /        | POST   | postRegister | Create an attention line of gender equity      |
| /edit    | POST   | postEdit   | Update an attention line of gender equity |
| /delete  | POST   | postDelete | Destroy (Soft delete) an attention line of gender equity |
| /        | GET    | getListAll    | Get all attention lines of gender equity       |


------------




#### 4.2.10. Gender Equity Categories

Categories for gender equity attention lines.

##### Mobile App
Path: http:localhost:3000/api/mobile/v1/notifications/gender
Controller: src\microservices\notifications\v1\controllers\mobileGender.js
Route: src\microservices\notifications\v1\routes\mobile.js
| Endpoint | Method | Location in Controller     | Description                                                                               |
| :------- | :----- | :------------------------- | :---------------------------------------------------------------------------------------- |
| /        | GET    | getCategoriesnAttentionLines | Get all gender attention lines and gender categories. |


##### Web App
Path: http:localhost:3000/api/web/v1/notifications/gender_category
Controller: src\microservices\notifications\v1\controllers\webGenderCategories.js
Route: src\microservices\notifications\v1\routes\web.js

| Endpoint | Method | Location in Controller           | Description                              |
| :------- | :----- | :------------------------------- | :--------------------------------------- |
| /        | POST   | postRegister | Create a gender attention lines category      |
| /edit    | POST   | postEdit   | Update gender attention lines category |
| /delete  | POST   | postDelete | Destroy a gender attention lines category (soft delete) |
| /        | GET    | getListAll    | Get all gender attention lines categories |


------------


#### 4.2.11. Report Configuration

Set up automatic approval of reports (Only web endpoints).

##### Web App
Path: http:localhost:3000/api/web/v1/notifications/security/report_configuration
Controller: src\microservices\notifications\v1\controllers\webReportConfigurations.js
Route: src\microservices\notifications\v1\routes\web.js

| Endpoint | Method | Location in Controller           | Description                              |
| :------- | :----- | :------------------------------- | :--------------------------------------- |
| /        | GET   | getReportConfig | Get current report configuration      |
| /        | POST   | postRegister | Create report configuration |


------------

#### 4.2.12. Security Attention Lines

##### Mobile App
Path: http:localhost:3000/api/mobile/v1/notifications/security
Controller: src\microservices\notifications\v1\controllers\mobileSecurity.js
Route: src\microservices\notifications\v1\routes\mobile.js
| Endpoint | Method | Location in Controller     | Description                                                                               |
| :------- | :----- | :------------------------- | :---------------------------------------------------------------------------------------- |
| /        | GET    | getListAll | Get all attention lines and categories of security/emergency |

##### Web App
Path: http:localhost:3000/api/web/v1/notifications/security
Controller: src\microservices\notifications\v1\controllers\webMobileService.js
Route: src\microservices\notifications\v1\routes\web.js

| Endpoint | Method | Location in Controller           | Description                              |
| :------- | :----- | :------------------------------- | :--------------------------------------- |
| /        | POST   | postRegister | Create an attention line of security/emergency |
| /edit    | POST    | postEdit    | Update an attention line of security/emergency |
| /delete  | POST    | postDelete    | Destroy (Soft delete) an attention line of security/emergency |
| /        | GET   | getListAll | Get all attention lines of security/emergency      |
| /:id     | GET   | getSecurity | Get an attention line of security/emergency by id      |


------------


#### 4.2.13. Security Categories

##### Mobile App
Path: http:localhost:3000/api/mobile/v1/notifications/security
Controller: src\microservices\notifications\v1\controllers\mobileSecurity.js
Route: src\microservices\notifications\v1\routes\mobile.js
| Endpoint | Method | Location in Controller     | Description                                                                               |
| :------- | :----- | :------------------------- | :---------------------------------------------------------------------------------------- |
| /        | GET    | getListAll | Get all attention lines and categories of security/emergency |

##### Web App
Path: http:localhost:3000/api/web/v1/notifications/security_category
Controller: src\microservices\notifications\v1\controllers\webSecurityCategories.js
Route: src\microservices\notifications\v1\routes\web.js

| Endpoint | Method | Location in Controller           | Description                              |
| :------- | :----- | :------------------------------- | :--------------------------------------- |
| /        | POST   | postRegister | Create a security category |
| /edit    | POST    | postEdit    | Update security category |
| /delete  | POST    | postDelete    | Destroy a security category (soft delete) |
| /        | GET   | getAll | Get all security categories      |
| /:id     | GET   | getOneById | Get security category by id      |


------------


#### 4.2.14. Social Network

##### Mobile App
Path: http:localhost:3000/api/mobile/v1/notifications/social_networks
Controller: src\microservices\notifications\v1\controllers\mobileSocialNetwork.js
Route: src\microservices\notifications\v1\routes\mobile.js
| Endpoint | Method | Location in Controller     | Description                                                                               |
| :------- | :----- | :------------------------- | :---------------------------------------------------------------------------------------- |
| /        | GET    | getSocialNetworks | Get all registered accounts (in social networks) |

##### Web App
Path: http:localhost:3000/api/web/v1/notifications/social_networks
Controller: src\microservices\notifications\v1\controllers\webSocialNetwork.js
Route: src\microservices\notifications\v1\routes\web.js

| Endpoint | Method | Location in Controller           | Description                              |
| :------- | :----- | :------------------------------- | :--------------------------------------- |
| /        | POST   | registerSocialNetwork | Add a social network account |
| /edit    | POST    | updateSocialNetwork    | Update a social network account |
| /status  | POST    | changeStatusSocialNetwork    | Changes the status (active or deactivated) of a social network account |
| /delete  | POST    | deleteSocialNetwork    | Destroy a social network account (soft delete) |
| /        | GET   | listSocialNetworks | List all registered (social network) accounts      |
| /types   | GET   | listSocialNetworkTypes | List all registered social networks     |


------------


#### 4.2.15. Base endpoints

##### Web App
Path: http:localhost:3000/api/web/v1/notifications/validate_lat_lon
Controller: src\microservices\notifications\v1\controllers\webBase.js
Route: src\microservices\notifications\v1\routes\web.js

| Endpoint | Method | Location in Controller           | Description                              |
| :------- | :----- | :------------------------------- | :--------------------------------------- |
| /        | POST   | postValidateLatLon | Validate lat and lon must belong to the area of the municipality of Cali, Valle del Cauca, Colombia |


------------

### 4.3. Third-Party Microservice
This microservice handles third-party APIs.

    https://third-parties-cmiesjcqoq-ue.a.run.app

------------

#### 4.3.1. Cities

##### Mobile App
Path: http:localhost:3000/api/mobile/v1/third_parties/intercity_transport/cities
Controller: src\microservices\thirdParties\v1\controllers\mobile\cities.js
Route: src\microservices\thirdParties\v1\routes\mobile.js
| Endpoint | Method | Location in Controller     | Description                                                                               |
| :------- | :----- | :------------------------- | :---------------------------------------------------------------------------------------- |
| /        | GET    | getAll | Get all Cities |

##### Web App
Path: http:localhost:3000/api/web/v1/third_parties/city
Controller: src\microservices\thirdParties\v1\controllers\web\cities.js
Route: src\microservices\thirdParties\v1\routes\webCities.js

| Endpoint | Method | Location in Controller           | Description                              |
| :------- | :----- | :------------------------------- | :--------------------------------------- |
| /        | POST   | postRegister | Create a city |
| /edit    | POST   | postEdit    | Update a city |
| /delete  | POST   | postDelete    | Destroy a city (soft delete) |
| /excel   | POST   | postUploadXlsx    | Upload an excel file that will create/update transport routes in the database. This use "Codigos_municipios_DANE.xlsx". With: code of municipality, name of department, name of municipality |
| /        | GET    | getAll | Get all Cities    |
| /autocomplete    | GET    | getAutocomplete | Get list - autocomplete     |


------------


#### 4.3.2. Third-Party Categories

##### Mobile App
Path: http:localhost:3000/api/mobile/v1/third_parties/third_parties/categories
Controller: src\microservices\thirdParties\v1\controllers\mobile\categories.js
Route: src\microservices\thirdParties\v1\routes\mobile.js
| Endpoint | Method | Location in Controller     | Description                                                                               |
| :------- | :----- | :------------------------- | :---------------------------------------------------------------------------------------- |
| /        | GET    | getAll | Get all ThirdPartyCategories |

##### Web App
Path: http:localhost:3000/api/web/v1/third_parties/categories
Controller: src\microservices\thirdParties\v1\controllers\web\categories.js
Route: src\microservices\thirdParties\v1\routes\webCategories.js

| Endpoint | Method | Location in Controller           | Description                              |
| :------- | :----- | :------------------------------- | :--------------------------------------- |
| /        | POST   | postRegister | Create a thirdParty category |
| /edit    | POST   | postEdit    | Update a thirdParty category |
| /delete  | POST   | postDelete    | Destroy a ThirdParty category (soft delete) |
| /        | GET    | getAll | Get all ThirdParty categories    |
| /:id     | GET    | getOneById | Get ThirdParty category by id     |


------------


#### 4.3.3. Third-Party Companies

##### Mobile App
Path: http:localhost:3000/api/mobile/v1/third_parties/third_parties
Controller: src\microservices\thirdParties\v1\controllers\mobile\companies.js
Route: src\microservices\thirdParties\v1\routes\mobile.js
| Endpoint | Method | Location in Controller     | Description                                                                               |
| :------- | :----- | :------------------------- | :---------------------------------------------------------------------------------------- |
| /        | GET    | getAll | Get all companies with your services |

##### Web App
Path: http:localhost:3000/api/web/v1/third_parties/company
Controller: src\microservices\thirdParties\v1\controllers\web\companies.js
Route: src\microservices\thirdParties\v1\routes\webCompanies.js

| Endpoint | Method | Location in Controller           | Description                              |
| :------- | :----- | :------------------------------- | :--------------------------------------- |
| /        | POST   | postRegister | Create a company |
| /edit    | POST   | postEdit    | Update a company |
| /delete  | POST   | postDelete    | Destroy a company (soft delete) |
| /        | GET    | getAll | Get all companies    |
| /:id     | GET    | getProfile | Get the data of company and your services - to profile     |


------------


#### 4.3.4. ThirdParty Company Services

##### Web App
Path: http:localhost:3000/api/web/v1/third_parties/company_service
Controller: src\microservices\thirdParties\v1\controllers\web\companyServices.js
Route: src\microservices\thirdParties\v1\routes\webCompanyServices.js

| Endpoint | Method | Location in Controller           | Description                              |
| :------- | :----- | :------------------------------- | :--------------------------------------- |
| /        | POST   | postServices | Creates and updates company services |
| /edit    | POST   | postEdit    | Update a service company |
| /delete  | POST   | postDelete    | Destroy a service company (soft delete) |
| /:id   | GET   | getServices    | Get all services of one company |


------------



#### 4.3.5. Tourism Categories 

The Tourism Categories end-points allow web users to manage the Tourism Categories shown to mobile users when they consume touristic content.

##### Mobile App
Path: http://localhost:3000/api/mobile/v1/third_parties/tourism/categories
Controller: src\microservices\thirdParties\v1\controllers\mobile\tourismCategories.js
Route: src\microservices\thirdParties\v1\routes\mobile.js
| Endpoint | Method | Location in Controller | Description                                           |
| :------- | :----- | :--------------------- | :---------------------------------------------------- |
| /        | GET    | getAll                 | List all the tourism categories in the mobile format. |

###### _GET_ list tourism categories (MOBILE)
\(\<Your_Host\>/api/mobile/v1/third_parties/tourism/categories\) Allows mobile users to list all the tourism categories. This requests accepts pagination (``page[number]`` and ``page[size]``), although it is optional. The default unpaginated request returns up to 500 Tourism Categories. It accepts the following query parameters:

| **Name**       | **Type** | **Required** | **Description**      |
| -------------- | :------: | :----------: | -------------------- |
| _page[number]_ | Integer  |      No      | Page number (min 1). |
| _page[size]_   | Integer  |      No      | Page size (min 1).   |

It returns **200 _OK_** and the list of objects on success.

**Example Response**
> _Status Code: **200 OK**_
> ```JSON
> [
>     {
>         "id": 2,
>         "name": "test ü0",
>         "color": "456789",
>         "icon": "https://upload.wikimedia.org/wikipedia/commons/2/25/Microsoft_icon.svg",
>         "iconMap": "https://upload.wikimedia.org/wikipedia/commons/2/25/Microsoft_icon.svg"
>     },
>     {
>         "id": 1,
>         "name": "test ü0",
>         "color": "456789",
>         "icon": "https://upload.wikimedia.org/wikipedia/commons/2/25/Microsoft_icon.svg",
>         "iconMap": "https://upload.wikimedia.org/wikipedia/commons/2/25/Microsoft_icon.svg"
>     }
> ]
> ```

##### Web App
Path: http://localhost:3000/api/web/v1/third_parties/tourism_categories/
Controller: src\microservices\thirdParties\v1\controllers\web\tourismCategories.js
Route: src\microservices\thirdParties\v1\routes\webTourismCategories.js

| Endpoint | Method | Location in Controller | Description                       |
| :------- | :----- | :--------------------- | :-------------------------------- |
| /        | POST   | postCreate             | Create new Tourism Category.      |
| /edit    | POST   | postUpdate             | Update existing Tourism Category. |
| /delete  | POST   | postDelete             | Delete existing Tourism Category. |
| /        | GET    | getAll                 | List all Tourism Categories.      |

###### _POST_ create Tourism Category
\(\<Your_Host\>/api/web/v1/third_parties/tourism_categories/\) allows web users to create a new Tourism Category. It receives the following body parameters:

| **Name**  | **Type**       | **Required** | **Description**                           |
| :-------- | :------------- | :----------- | :---------------------------------------- |
| _name_    | String         | Yes          | Name of the Tourism Category.             |
| _color_   | String (Color) | Yes          | Color to show the Tourism Category.       |
| _icon_    | String (URI)   | Yes          | Icon of the Tourism Category.             |
| _iconMap_ | String (URI)   | Yes          | Icon for the map of the Tourism Category. |

It returns **201 _created_** and the created Tourism Category on success.

**Example**

Request body:
  >```JSON
  > {
  >     "name": "test ü0",
  >     "color": "#456789",
  >     "icon": "https://upload.wikimedia.org/wikipedia/commons/2/25/Microsoft_icon.svg",
  >     "iconMap": "https://upload.wikimedia.org/wikipedia/commons/2/25/Microsoft_icon.svg"
  > }
  >```

Response:
  > _Status code: **201 Created**_
  > ```JSON
  > {
  >     "data": {
  >         "id": 3,
  >         "name": "test ü0",
  >         "color": "#456789",
  >         "icon": "https://upload.wikimedia.org/wikipedia/commons/2/25/Microsoft_icon.svg",
  >         "iconMap": "https://upload.wikimedia.org/wikipedia/commons/2/25/Microsoft_icon.svg",
  >         "createdBy": 2,
  >         "updatedAt": "2023-09-27T15:28:31.346Z",
  >         "createdAt": "2023-09-27T15:28:31.346Z"
  >     }
  > }
  > ```

###### _POST_ update Tourism Category
\(\<Your_Host\>/api/web/v1/third_parties/tourism_categories/edit\) allows web users to update an existing Tourism Category. It receives the following body parameters:

| **Name**  | **Type**       | **Required** | **Description**                           |
| :-------- | :------------- | :----------- | :---------------------------------------- |
| _id_      | Integer        | Yes          | ID of the Tourism Category.               |
| _name_    | String         | No           | Name of the Tourism Category.             |
| _color_   | String (Color) | No           | Color to show the Tourism Category.       |
| _icon_    | String (URI)   | No           | Icon of the Tourism Category.             |
| _iconMap_ | String (URI)   | No           | Icon for the map of the Tourism Category. |

At least one of the optional (_name_, _color_, _icon_, _iconMap_) parameters must be passed.

It returns **200 _OK_** and the updated Tourism Category on success.

**Example**

Request body:
  >```JSON
  > {
  >     "id": 1,
  >     "name": "second Name"
  > }
  >```

Response:
  > _Status code: **200 OK**_
  > ```JSON
  > {
  >     "data": {
  >         "id": 1,
  >         "createdBy": 2,
  >         "name": "second Name",
  >         "color": "#AFAF00",
  >         "icon": "https://upload.wikimedia.org/wikipedia/commons/8/83/Steam_icon_logo.svg",
  >         "iconMap": "https://upload.wikimedia.org/wikipedia/commons/8/83/Steam_icon_logo.svg",
  >         "createdAt": "2023-09-27T13:59:00.983Z",
  >         "updatedAt": "2023-09-27T15:29:43.727Z"
  >     }
  > }
  > ```

###### _POST_ delete Tourism Category
\(\<Your_Host\>/api/web/v1/third_parties/tourism_categories/delete\) allows web users to delete an existing Tourism Category. It receives the following body parameter:

| **Name** | **Type** | **Required** | **Description**             |
| :------- | :------- | :----------- | :-------------------------- |
| _id_     | Integer  | Yes          | ID of the Tourism Category. |

It returns **200 _OK_** and the ID of the deleted Tourism Category on success.

**Example**

Request body:
  >```JSON
  > {
  >     "id": 3
  > }
  >```

Response:
  > _Status code: **200 OK**_
  > ```JSON
  > {
  >     "data": {
  >         "id": 3
  >     }
  > }
  > ```

###### _GET_ list Tourism Categories
\(\<Your_Host\>/api/web/v1/third_parties/tourism_categories/\) allows web users to list the existing Tourism Categories in the database. It receives the following query parameters:

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
>         "pageSize": 5,
>         "totalRecords": 2,
>         "totalPages": 1
>     },
>     "data": [
>         {
>             "id": 2,
>             "createdBy": 2,
>             "name": "test ü0",
>             "color": "#456789",
>             "icon": "https://upload.wikimedia.org/wikipedia/commons/2/25/Microsoft_icon.svg",
>             "iconMap": "https://upload.wikimedia.org/wikipedia/commons/2/25/Microsoft_icon.svg",
>             "createdAt": "2023-09-27T14:00:08.355Z",
>             "updatedAt": "2023-09-27T14:00:08.355Z"
>         },
>         {
>             "id": 1,
>             "createdBy": 2,
>             "name": "test ü0",
>             "color": "#456789",
>             "icon": "https://upload.wikimedia.org/wikipedia/commons/2/25/Microsoft_icon.svg",
>             "iconMap": "https://upload.wikimedia.org/wikipedia/commons/2/25/Microsoft_icon.svg",
>             "createdAt": "2023-09-27T13:59:00.983Z",
>             "updatedAt": "2023-09-27T13:59:00.983Z"
>         }
>     ]
> }
> ```


------------



#### 4.3.6. Tourism Companies

##### Mobile App
Path: http:localhost:3000/api/mobile/v1/third_parties/tourism
Controller: src\microservices\thirdParties\v1\controllers\mobile\tourismCompanies.js
Route: src\microservices\thirdParties\v1\routes\mobile.js
| Endpoint | Method | Location in Controller     | Description                                                                               |
| :------- | :----- | :------------------------- | :---------------------------------------------------------------------------------------- |
| /        | GET    | getCompaniesnServices | Get all tourism companies with your services |

##### Web App
Path: http:localhost:3000/api/web/v1/third_parties/tourism_company
Controller: src\microservices\thirdParties\v1\controllers\web\tourismCompanies.js
Route: src\microservices\thirdParties\v1\routes\webTourismCompanies.js

| Endpoint | Method | Location in Controller           | Description                              |
| :------- | :----- | :------------------------------- | :--------------------------------------- |
| /        | POST   | postRegister | Create a tourism company |
| /edit    | POST   | postEdit    | Update a tourism company |
| /delete  | POST   | postDelete    | Destroy a tourism company (soft delete) |
| /api_key   | POST   | postCreateApiKey    | Create an Api Key |
| /api_key/:companyId   | GET   | getApiKey    | Get the apiKey (First 5 characters) |
| /        | GET    | getAll | Get all tourism companies    |
| /:id        | GET    | getProfile | Get the data of tourism company - profile    |


------------

#### 4.3.7. Tourism Services

##### Web App
Path: http:localhost:3000/api/web/v1/third_parties/tourism_service
Controller: src\microservices\thirdParties\v1\controllers\web\tourismServices.js
Route: src\microservices\thirdParties\v1\routes\webTourismServices.js

| Endpoint | Method | Location in Controller           | Description                              |
| :------- | :----- | :------------------------------- | :--------------------------------------- |
| /        | POST   | postServices | Creates and updates company services |
| /edit    | POST   | postEdit    | Update a service company |
| /delete  | POST   | postDelete    | Destroy a service company (soft delete) |
| /:id     | GET    | getServices | Get all services of one tourism company    |



------------


#### 4.3.8. Transport Companies

##### Web App
Path: http:localhost:3000/api/web/v1/third_parties/transport_company
Controller: src\microservices\thirdParties\v1\controllers\web\transportCompanies.js
Route: src\microservices\thirdParties\v1\routes\webTransportCompanies.js

| Endpoint | Method | Location in Controller           | Description                              |
| :------- | :----- | :------------------------------- | :--------------------------------------- |
| /        | POST   | postRegister | Create a transport company |
| /edit    | POST   | postEdit    | Update a transport company |
| /delete  | POST   | postDelete    | Destroy a transport company (soft delete) |
| /api_key   | POST   | postCreateApiKey    | Create an Api Key |
| /api_key/:companyId   | GET   | getApiKey    | Get the apiKey (First 5 characters) |
| /        | GET    | getAll | Get all transport companies    |
| /:id        | GET    | getProfile | Get the data of transport company - profile    |


------------


#### 4.3.9. Transport Routes

##### Mobile App
Path: http:localhost:3000/api/mobile/v1/third_parties/intercity_transport
Controller: src\microservices\thirdParties\v1\controllers\mobile\cities.js
Route: src\microservices\thirdParties\v1\routes\mobile.js
| Endpoint | Method | Location in Controller     | Description                                                                               |
| :------- | :----- | :------------------------- | :---------------------------------------------------------------------------------------- |
| /        | GET    | getTransportRoutes | Get the available routes for a given city and date |

##### Web App - Transport Route
Path: http:localhost:3000/api/web/v1/third_parties/transport_company/route
Controller: src\microservices\thirdParties\v1\controllers\web\webTransportRoutes.js
Route: src\microservices\thirdParties\v1\routes\webCities.js

| Endpoint | Method | Location in Controller           | Description                              |
| :------- | :----- | :------------------------------- | :--------------------------------------- |
| /        | POST   | postRegister | Create a transport route |
| /edit    | POST   | postEdit    | Update a transport route  |
| /delete  | POST   | postDelete    | Destroy a transport route (soft delete) |
| /excel   | POST   | postUploadXlsx    | Upload an excel file that will create/update transport routes in the database. This use "template.xlsx". With: originCode, destinationCode, duration, date, hour, tariff |
| /template      | GET    | getDownloadXlsxTemplate |Download the template to create new transport routes.    |
| /itinerary    | GET    | getItinerary | Get all route timetables of an route     |
| /companies    | GET    | getCompaniesNRoutes | Get all transport companies with your routes     |
| /:companyId    | GET    | getAll | Get all transport routes by company Id     |

##### Web App - Transport Route Timetables - Date field
Path: http:localhost:3000/api/web/v1/third_parties/transport_company/route/date
Controller: src\microservices\thirdParties\v1\controllers\web\routeTimetables.js
Route: src\microservices\thirdParties\v1\routes\webRouteTimetableDate.js

| Endpoint | Method | Location in Controller           | Description                              |
| :------- | :----- | :------------------------------- | :--------------------------------------- |
| /        | POST   | postRegister | Create a route timetable |
| /hours   | POST   | postRegisterWithHour | Create a route timetable with your hours |
| /edit    | POST   | postEdit    | Update a route timetable  |
| /delete  | POST   | postDelete    | Destroy a Route timetable (soft delete) |
| /    | GET    | getAll | Get all Route timetables    |


##### Web App - Transport Route Timetables - Hour n Tariff fields
Path: http:localhost:3000/api/web/v1/third_parties/transport_company/route/hour
Controller: src\microservices\thirdParties\v1\controllers\web\routeTimetablesHourTariff.js
Route: src\microservices\thirdParties\v1\routes\webRouteTimetableHour.js

| Endpoint | Method | Location in Controller           | Description                              |
| :------- | :----- | :------------------------------- | :--------------------------------------- |
| /        | POST   | postRegister | Create a hour n tariff for a route timetable |
| /edit    | POST   | postEdit    | Update a hour n tariff for a route timetable  |
| /delete  | POST   | postDelete    | Destroy a hour n tariff for a route timetable (soft delete) |
| /    | GET    | getAll | Get all - hour n tariff for a route timetable    |



------------


#### 4.3.10. Base endpoint

##### Web App
Path: http:localhost:3000/api/web/v1/third_parties/validate_lat_lon
Controller: src\microservices\thirdParties\v1\controllers\web\cities.js
Route: src\microservices\thirdParties\v1\routes\webBase.js

| Endpoint | Method | Location in Controller           | Description                              |
| :------- | :----- | :------------------------------- | :--------------------------------------- |
| /        | POST   | postValidateLatLon | Validate lat and lon must belong to the area of the municipality of Cali, Valle del Cauca, Colombia |

------------


#### 4.3.11. Taxis

##### Mobile App
Path: http:localhost:3000/api/mobile/v1/third_parties/taxis
Controller: src\microservices\thirdParties\v1\controllers\mobile\taxis.js
Route: src\microservices\thirdParties\v1\routes\mobile.js
| Endpoint | Method | Location in Controller     | Description                                                                               |
| :------- | :----- | :------------------------- | :---------------------------------------------------------------------------------------- |
| /        | GET    | getQuery | Get the required vehicle data from the taxi API in the mobile format. |
| /complaint        | POST    | postComplaint | Create a complaint against a driver or a vehicle in the taxi API and the database. |


------------

#### 4.3.12. API: Tourism Services 

##### Web App
Path: http:localhost:3000/api/web/v1/third_parties/tourism_company_api
Controller: src\microservices\thirdParties\v1\controllers\web\tourismServicesAPI.js
Route: src\microservices\thirdParties\v1\routes\webTourismServicesAPI.js

| Endpoint | Method | Location in Controller           | Description                              |
| :------- | :----- | :------------------------------- | :--------------------------------------- |
| /services        | GET   | getServices | Get all services of one tourism company  |
| /services        | POST   | postService | Create tourism service  |
| /services/edit        | POST   | postEdit | Update a tourism service  |
| /services/delete        | POST   | postDelete | Destroy a tourism service (soft delete)  |
| /services_bulk        | POST   | postBulkService | Creates tourism services  |
| /services_bulk/delete        | POST   | postBulkServiceDelete | Destroy many tourism service (soft delete)  |

------------

#### 4.3.13. API: Tourism Services 

##### Web App
Path: http:localhost:3000/api/web/v1/third_parties/transport_company_api
Controller: src\microservices\thirdParties\v1\controllers\web\transportRoutesAPI.js
Route: src\microservices\thirdParties\v1\routes\webTransportRoutesAPI.js

| Endpoint | Method | Location in Controller           | Description                              |
| :------- | :----- | :------------------------------- | :--------------------------------------- |
| /route        | POST   | postRouteRegister | Create a transport route |
| /route/edit    | POST   | postRouteEdit    | Update a transport route  |
| /route/delete  | POST   | postRouteDelete    | Destroy a transport route (soft delete) |
| /route/itinerary    | GET    | getRouteItinerary | Get all route timetables of an route     |
| /route/    | GET    | getRouteAll | Get all transport routes of the company     |
| /route/date        | POST   | postDateRegister | Create a route timetable |
| /route/date/hours   | POST   | postDateRegisterWithHour | Create a route timetable with your hours |
| /route/date/edit    | POST   | postDateEdit    | Update a route timetable  |
| /route/date/delete  | POST   | postDateDelete    | Destroy a Route timetable (soft delete) |
| /route/date    | GET    | getDateAll | Get all Route timetables    |
| /route/hour        | POST   | postHourRegister | Create a hour n tariff for a route timetable |
| /route/hour/edit    | POST   | postHourEdit    | Update a hour n tariff for a route timetable  |
| /route/hour/delete  | POST   | postHourDelete    | Destroy a hour n tariff for a route timetable (soft delete) |
| /route/hour    | GET    | getHourAll | Get all - hour n tariff for a route timetable    |


------------




### 4.4. File Management Microservice
This microservice handles the files upload and download for the web application.

    https://file-management-cmiesjcqoq-ue.a.run.app

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

###### _POST_ Upload Image
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

###### _POST_ Upload PDF
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

### 4.5. Traffic (Mobility) Microservice
This microservice handles traffic APIs.

    https://traffic-cmiesjcqoq-ue.a.run.ap

------------

#### 4.5.1. Bikes TermsConditions

##### Mobile App
Path: http:localhost:3000/api/mobile/v1/traffic/bikes/terms
Controller: src\microservices\traffic\v1\controllers\mobile\bicyclesTermsConditions.js
Route: src\microservices\traffic\v1\routes\mobile.js
| Endpoint | Method | Location in Controller     | Description                                                                               |
| :------- | :----- | :------------------------- | :---------------------------------------------------------------------------------------- |
| /        | GET    | getTerms | Get the data of the terms and conditions |
| /agree        | POST    | postAcceptTerms | The mobile user accepts the terms and conditions |
| /agree        | GET    | getAcceptTerms | Get if the mobile user has accepted the terms and conditions |

##### Web App
Path: http:localhost:3000/api/web/v1/traffic/bikes/terms_conditions
Controller: src\microservices\traffic\v1\controllers\web\bicyclesTermsConditions.js
Route: src\microservices\traffic\v1\routes\webBicyclesTermsConditions.js

| Endpoint | Method | Location in Controller           | Description                              |
| :------- | :----- | :------------------------------- | :--------------------------------------- |
| /        | POST   | postRegister | Create a the terms and conditions |
| /        | GET   | getTermsConditions    | Get the data of the terms and conditions |


------------

#### 4.5.2. Configuration of Traffic Notifications

##### Web App
Path: http:localhost:3000/api/web/v1/traffic/traffic_notification
Controller: src\microservices\traffic\v1\controllers\web\trafficNotifications.js
Route: src\microservices\traffic\v1\routes\webTrafficNotification.js

| Endpoint | Method | Location in Controller           | Description                              |
| :------- | :----- | :------------------------------- | :--------------------------------------- |
| /        | POST   | postRegister | Create the configuration of traffic notifications |
| /        | GET   | getOne    | Get the configuration of traffic notifications |


------------

#### 4.5.3. Road States

##### Mobile App
Path: http:localhost:3000/api/mobile/v1/traffic/mobility
Controller: src\microservices\traffic\v1\controllers\mobile\roadStates.js
Route: src\microservices\traffic\v1\routes\mobile.js
| Endpoint | Method | Location in Controller     | Description                                                                               |
| :------- | :----- | :------------------------- | :---------------------------------------------------------------------------------------- |
| /        | GET    | getRoadStates | Get all routes states |

##### Web App
Path: http:localhost:3000/api/web/v1/traffic/road_state
Controller: src\microservices\traffic\v1\controllers\web\roadStates.js
Route: src\microservices\traffic\v1\routes\webRoadStates.js

| Endpoint | Method | Location in Controller           | Description                              |
| :------- | :----- | :------------------------------- | :--------------------------------------- |
| /        | POST   | postRegister | Create a road state |
| /edit        | POST   | postEdit | Update a road state |
| /delete        | POST   | postDelete | Destroy a road state (soft delete) |
| /        | GET   | getAll    | Get all road states |
| /:id        | GET   | getOne    | Get the data of road state |


------------



### 4.6. Admins Microservice
This microservice handles Admin APIs.

    https://admin-cmiesjcqoq-ue.a.run.app

------------

#### 4.6.1. Admin without security

##### Web App
Path: http:localhost:3000/api/web/v1/admin/admin
Controller: src\microservices\admin\v1\controllers\web\webAdminFree.js
Route: src\microservices\admin\v1\routes\webAdminFree.js

| Endpoint | Method | Location in Controller           | Description                              |
| :------- | :----- | :------------------------------- | :--------------------------------------- |
| /        | POST   | postEmailVerification | Verify a user's email address |


------------


#### 4.6.2. Admin

##### Web App
Path: http:localhost:3000/api/web/v1/admin/admin
Controller: src\microservices\admin\v1\controllers\web\webAdmin.js
Route: src\microservices\admin\v1\routes\webAdmin.js

| Endpoint | Method | Location in Controller           | Description                              |
| :------- | :----- | :------------------------------- | :--------------------------------------- |
| /        | POST   | postRegister | Create a admin |
| /edit        | POST   | postEdit | Update admin |
| /edit/mobile_user        | POST   | postEditMobileUser | Update a mobile user |
| /delete        | POST   | postDelete | Delete an web or mobile user |
| /add_role        | POST   | postAddRole | Add role an admin |
| /set_passwd        | POST   | postSetPasswd | Enter a new passwd |
| /:id        | GET   | getOneById | Get admin by id |


------------

#### 4.6.3. Admin Notifications

##### Web App
Path: http:localhost:3000/api/web/v1/admin/admin
Controller: src\microservices\admin\v1\controllers\web\webAdminNotifications.js
Route: src\microservices\admin\v1\routes\webAdmin.js

| Endpoint | Method | Location in Controller           | Description                              |
| :------- | :----- | :------------------------------- | :--------------------------------------- |
| /notifications        | GET   | getAllNotifications | Get all admin notifications |


------------

#### 4.6.3. Role

##### Web App
Path: http:localhost:3000/api/web/v1/admin/role
Controller: src\microservices\admin\v1\controllers\web\webRole.js
Route: src\microservices\admin\v1\routes\webRole.js

| Endpoint | Method | Location in Controller           | Description                              |
| :------- | :----- | :------------------------------- | :--------------------------------------- |
| /        | POST   | postRegister | Create a role |
| /edit        | POST   | postEdit | Update a role |
| /delete        | POST   | postDelete | Destroy a Role (soft delete) |
| /user        | POST   | postAssignRoleToUser | Assign a role to a user |
| /user        | GET   | getUsersByRoleId | Get the users that have a certain role |
| /        | GET   | getAll | Get all Roles |
| /:id        | GET   | getRole | Get the data of a role |


------------




## 5. Contributors

- [estebance](https://github.com/estebance)
- [daniel](https://github.com/danielcollazostbbc)
- [andres](https://github.com/AndresGarzonJ-TBBC)
- [Julián](https://github.com/bitjep)

------------

## 6. License

TBD
