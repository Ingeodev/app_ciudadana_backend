## CALI MOBILITY BACKEND

This backend has been generated from scratch to support the Cali Mobility Application

### Tools

1. [Firebase](https://firebase.google.com/)
2. [Docker](https://www.docker.com/)
3. [Express](https://expressjs.com/)

### Run local

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

```

### Contributors

---

- [estebance](https://github.com/estebance)
- [daniel]()
- [andres]()

### License

TBD
