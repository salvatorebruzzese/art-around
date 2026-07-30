# MongoDB
Per creare il container mongo: 
```sh
docker run --name mongodb -d -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=user -e MONGO_INITDB_ROOT_PASSWORD=pass -v mongodata:/data/db mongo
```

E settare il file .env nella root del progetto:
```sh
#!/usr/bin/env bash
MONGO_USR=user
MONGO_PWD=pass
MONGO_SITE=localhost:27017
SESSION_SECRET=secret
```

