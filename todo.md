# Marketplace
- [x] Schermata per la visione della visita.
      Manca un piccolo container sopra con i metadati della visita
- [~] Schermata di acquisto della visita.
  Manca l'integrazione con le API e con il marketplace
- [x] Eliminazione tour
  - [x] Backend cascade delete (items + user refs)
  - [x] Frontend API wrapper (deleteTour)
  - [x] Editor delete handler con confirmation
  - [x] Marketplace delete handler con confirmation
  - [x] Authorization check (solo autore può eliminare)
  - [x] UI: bottone "Elimina" visibile solo per autore
- [ ] Implementare dropdown dei tour e degli item nel marketplace.
  - [X] Fork (backend)
  - [ ] modifica ( fork se non authored )
  - [ ] condividit (visita guidata)
  - [X] elimina solo se autore

## Quicknav
- [ ] editor btn (start)
      New tour
      bad request need debugging

## Editor
- [x] Bottoni per gestione dell'ordine 
    - [X] Load items (@click set selectedId )
- [X] New item (@click append new item in items + ref in list)
- [X] Save tour (@click saveTour call)
  - [X] Explanations
- [X] Refs
    - [X] Add
    - [X] Remove
- [X] Eliminazione item
    - [X] ui (dropdown -> del -> overlay confirmation)
    - [x] backend (remove from references? or client-side?)
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
- [ ] auto set default level explanation

# Navigator
- [?] Integrazione API TTS per convertire le descrizioni degli item in audio.
- [?] Integrazione comandi vocali mappati da API LLM.
- [x] navigator - branch -> GUIDED or FREE

## Guided
- [x] Schermata navigator per studenti con test a crocette.
  - [x] UI quiz completa con domande, opzioni multiscelta, punteggio
  - [x] Master results dashboard per visualizzare punteggi partecipanti
  - [x] Quiz feedback screen per rivedere risposte corrette/sbagliate
  - [x] Timer countdown con auto-avanzamento (se configurato)
  - [x] Normalizzazione campi domande (prompt -> questionText)
  - [x] Colori dinamici timer (rosso <5s, giallo <10s)
  - [x] Navigation review risposte (prev/next domande)
- [x] Sistema di sincronizzazione della visita.
  - [x] Utente insegnante server.
  - [x] Utente studente client.
- [ ] area guide -> come si fa partire?

# Routing
- [~] No-login solo per market e access

# Deploy
- [ ] settare file a 755 e? 644

# Backend
- [x] Item deletion with bidirectional ref cleanup
  - [x] Remove deleted item from all other items' refs arrays
- [x] Cascade delete tour
  - [x] Delete all items in tour (hard delete)
  - [x] Clean up item cross-references
  - [x] Remove tour from user.authoredTours
  - [x] Remove tour from user.purchasedTours
- [ ] Session system (synchro)
  - [x] message passing
  - [ ] collect and elaborate results
  - [ ] session lifecycle 
    - [ ] cleanup of completed
        - [ ] close session msg
    - [ ] cleanup abandonend
  - [X] generate temporary user 
  - [ ] OPT sse recovery/reconnect
- [ ] delete miniature on file delete
- [ ] User priviledge escalation
