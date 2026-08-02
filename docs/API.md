Le API sono delle chiamate di tipo CRUD che modificano lo stato del server, creando, leggendo, aggiornando o rimuovendo dati.

Gli endpoint delle API sono i seguenti:
- `/items`
  - `GET /items`
    Ritorna una lista di metadati di item. Questo include:
    - `id`
    - `name`
    - `tags`
  - `GET /items/{id}`
  - `POST /items/`
  - `PATCH /items/{id}`
- `/museums`
  - `GET /museums`
    Ritorna una lista di metadati di tutti i musei. Questo include:
      - `id`
      - `name`
      - `thumbnail` (riferimento)
      - `description`
  - `GET /museums/{id}`
    Ritorna un oggetto di tipo `museum`.
- `/tours`
  - `GET /tours`
  Ritorna una lista di metadati di tutti i tour. Questo include:  
    - `id`
    - `name`
    - `author` (riferimento)
    - `thumbnail` (riferimento)
  - `POST /tours/`
  - `PATCH /tours/{id}`
- `/users` (da definire)
- `/assets`
  - `GET /assets/{id}`
  - `POST /assets/`
