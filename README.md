# Art around
Un'applicazione web full-stack e responsive per gestire le visite ai musei, sviluppata come progetto del corso Tecnologie Web A.A. 2025/2026 dell'Università di Bologna.

# UI e UX
Il progetto segue i principi del goal-oriented design, adattando la visita dell'utente in quattro dimensioni diverse:
- Interessi individuali (specifici dell'utente, e.g. l'esposizione di maggiore interesse).
- Competenze pregresse (la formazione, livello di educazione o attitudini del visitatore).
- Contesto della visita (per interesse personale, professionale o formativo).
- Età dell'utente.

La UI verrà progettata in un'applicazione di web design basata su componenti chiamata [Penpot](https://penpot.app).

L'applicazione utilizzerà WAI-ARIA per rispettare lo standard WCAG 2.2.

# Architettura
L'applicazione si divide in due moduli essenziali: Marketplace e Navigator.

Marketplace è il modulo utilizzato per la creazione, pubblicazione, catalogazione e vendita delle visite. Marketplace è pensato per essere utilizzato al computer in modo totalmente generico rispetto al museo o la visita specifica. L'utente seleziona un museo tra quelli disponibili e vede tutte le visite con la possibilità di sceglierle, modificarle o comprarle.

Navigator è pensato per essere utilizzato da cellulare e auricolari durante la visita al museo. Permette di analizzare nel dettaglio un oggetto della mostra, con la possibilità di chiedere chiarimenti. Navigator si adatta all'utente secondo i [principi sopracitati](#ui-e-ux), utilizzando sintetizzatori vocali e modelli di intelligenza artificiale per adattare all'utente i chiarimenti sull'oggetto.

Sia Marketplace che Navigator sono responsive e quindi devono adattarsi alla risoluzione del monitor dell'utente.

## Il Marketplace
Il Marketplace è diviso tra un catalogo e un editor.
Il museo viene scelto con un pannello di scelta multipla all'accesso.
Viene caricato sempre il catalogo inizialmente, e in alto si ha una barra dove cambiare tra editor e marketplace.
Il catalogo mostra o le visite pubblicate relative al museo, o l'insieme di contenuti ([item](#visite-loggetto-item)) presenti in tutte le visite del museo.
L'editor mostra tutte le visite create.

Ogni visita può essere modificata nell'editor se si è i creatori della visita o creando una copia da modificare, oppure se ne può creare una da zero.

I metadati delle visite mantengono anche lo stato di pubblicazione (pubblico, privato), la licenza di utilizzo della visita e informazioni sulle vendite.

## Il Navigator
Il museo è rappresentato da un file di configurazione e un insieme di visite disponibili.

Al navigator si può accedere come guida o come visitatore. La guida dispone di un sistema di sincronizzazione e di una chiave di accesso da dare ai visitatori. Nel caso di una visita formativa, si può somministrare un quiz a risposta multipla ai visitatori.

Il visitatore all'accesso trova una finestra di benvenuto: "Ciao, sono Navigator, puoi rispondere a queste domande per aiutarci a capirti meglio?"

Per andare avanti l'utente deve rispondere a quattro domande:
- "Qual è la tua età?"
- "Sei qui per interesse personale, professionale o formativo?"
- "Sei uno studente?"
- "C'è qualcosa che vorresti approfondire con questa visita?"

Le risposte alle domande profilano l'utente a grandi linee, permettendo di personalizzare i contenuti grazie agli LLM.

Navigator gestisce anche il [sistema di navigazione](#il-sistema-di-navigazione).

## Visite: l'oggetto item
La visita è una raccolta di dati del museo e della mostra (locazione, costo del biglietto, posizione dei servizi del museo ed eventuale test a risposta multipla) e una sequenza ordinata di *item*.
Gli item sono dei dati strutturati, che identificano una tappa della visita e forniscono tutto quello che si sa sull'oggetto della tappa. Sono visualizzati a schermo e letti via sintesi vocale.

L'item inizia come un'interfaccia base con questi campi:
- Un nome.
- Un UUID come identificativo (generato automaticamente).
- Un membro di un'enumerazione per la tipologia di item (opera, autore, stile, tecnica, altro)
- Lista di oggetti `spiegazione`¹.
- Una stringa per l'autore dell'item.
- Una stringa per la licenza d'uso dell'item.

Le interfacce vengono poi implementate per ogni tipologia di item:
- `autore` aggiunge la data di nascita, di morte e la biografia.
- `tecnica` aggiunge gli esponenti principali, gli strumenti essenziali della tecnica e una spiegazione.
- `stile` aggiunge uno o più riferimenti `autore` come esponenti principali, un periodo storico e una spiegazione dello stile.
- `opera` aggiunge riferimenti a uno o più item `autore`, un rif. a un item `stile` e un rif. a un item `tecnica`, un periodo di creazione ed eventualmente un'immagine.

---
¹ record composto da un membro di un'enumerazione per indicare la presenza di un livello di linguaggio specifico (semplice, normale, avanzato), una stringa per spiegazione dell'opera e un naturale per la durata della spiegazione in secondi.

## Il sistema di navigazione 
Il sistema di navigazione gestisce due aspetti correlati: l'avanzamento della visita e la geolocalizzazione dell'utente rispetto alle opere. Il sistema non è visibile dall'utente, ma lo si può utilizzare attraverso il [sistema di interazione](#il-sistema-di-interazione-con-lutente).

Le varie funzioni includono:
- [ ] Gestione della sequenza di item (andare avanti e indietro nella visita).
- [ ] Posizionamento degli item nella planimetria del museo.
- [ ] Lista completa della posizione di tutti i servizi del museo (accoglienza, servizi igienici)
- [ ] Descrizione completa dell'accessibilità del museo (scale sprovviste di rampe, descrizioni di oggetti senza braille, etc.).

## Il sistema di interazione con l'utente
L'interazione con l'utente avviene via tasti o via comandi vocali.
I comandi vocali fanno parte di un *vocabolario aperto* che viene mappato da un LLM ai [comandi predefiniti](#i-comandi-predefiniti).

Il sistema ha tre modalità:
- *libre* per gli utenti singoli, senza guida. In questa modalità sono disponibili tutte le funzionalità di navigator.
- *guided* per gli utenti in gruppo o con una guida. È disponibile solo l'interazione attraverso sintesi vocale.
- *master* per le guide. Permette di fornire una chiave d'accesso per la visita selezionata. Si può vedere una lista degli utenti collegati alla visita e le loro interzioni vocali con l'app. Si può fornire il test a risposta multipla associato alla visita.

Le varie funzioni includono:
- [ ] Presentazione visiva dell'item.
- [ ] Lettura attraverso sintesi vocale dei campi associati all'item.
- [ ] Interazione vocale tramite vocabolario libero per chiedere più informazioni sull'oggetto o informazioni sui servizi del museo.
- [ ] La visualizzazione opzionale di una planimetria del museo con le relative posizioni degli item.
- [ ] Una funzione nella planimetria che permetta di teletrasportarsi da un'opera all'altra. In questo caso la visita riprende dall'opera selezionata.

## I comandi predefiniti
I comandi predefiniti sono tutte le domande disponibili per l'item. Il numero di domande è fisso ed è correlato a un singolo campo dell'item.

La lista dei comandi, così come sono visti internamente dal sistema di interazione con l'utente, è la seguente:
- `avanti` va all'opera successiva nella visita.
- `indietro` va all'opera precedente nella visita.
- `autore` dà le informazioni nel campo autore per le opere di tipo opera.
- `stile` dà le informazioni nel campo stile per le opere di tipo opera.
- `complica` passa al livello successivo disponibile del linguaggio.
- `semplifica` passa al livello precedente disponibile del linguaggio.
- `uscita` fornisce un'indicazione assoluta sulla posizione dell'uscita della mostra.
- `bagno` fornisce un'indicazione assoluta sulla posizione dei servizi igienici della struttura.
- 

# Tecnologie utilizzate
Navigator e Marketplace sono applicazioni client-side costruite con JavaScript, collegate a processi server-side locali in Node.JS. Utilizzano come database NoSQL MongoDB.
Navigator utilizza il framework Vue.Js mentre Marketplace potrebbe usare Alpine o basarsi su vanilla JavaScript.