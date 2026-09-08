# Marketplace

- [x] Schermata per la visione della visita.
      Manca un piccolo container sopra con i metadati della visita
- [~] Schermata di acquisto della visita.
  Manca l'integrazione con le API e con il marketplace
- [ ] Implementare dropdown dei tour e degli item nel marketplace.
  - [ ] Fork (backend)

## Quicknav

- [ ] editor btn
      Auto new tour from scratch?

## Editor
- [x] Bottoni per gestione dell'ordine 
    - [X] Load items (@click set selectedId )
- [X] New item (@click append new item in items + ref in list)
- [X] Save tour (@click saveTour call)
  - [X] Explanations
- [X] Refs
    - [X] Add
    - [X] Remove
- [ ] Eliminazione item
    - [X] ui (dropdown -> del -> overlay confirmation)
    - [ ] backend (remove from references? or client-side?)
    - [X] UNLINK
- [~] Upload immagini 
    - [X] fix backend (potrebbe non essere sufficiente quello attuale)
    - [~] Implmentazione ui (3dots)
        - [X] nuova
        - [~] selezionare vecchia (to be refined)
- [ ] reload on history change (update user quicknav)
- [ ] Error handling 
  - [ ] see saveItem (wrapper)
  - [ ] on img upload
  - [ ] on tour save

- [~] responsivness

### Bugs
- [ ] auto set default level

# Navigator
- [ ] Integrazione API TTS per convertire le descrizioni degli item in audio.
- [ ] Integrazione comandi vocali mappati da API LLM.
- [x] navigator - branch -> GUIDED or FREE

## Guided

- [ ] Schermata navigator per studenti con test a crocette.
- [ ] Sistema di sincronizzazione della visita.
  - [ ] Utente insegnante server.
  - [ ] Utente studente client.
- [ ] Integrazione sistema di sincronizzazione.

# Routing
- [~] No-login solo per market e access

# Deploy
- [ ] settare file a 755 e? 644

# Backend
- [ ] Session system (synchro)
  - [ ] message passing
  - [ ] collect and elaborate results
  - [ ] session lifecycle 
    - [ ] cleanup of completed
        - [ ] close session msg
    - [ ] cleanup abandonend
  - [X] generate temporary user 
  - [ ] OPT sse recovery/reconnect
- [ ] delete miniature on file delete
- [ ] User priviledge escalation
