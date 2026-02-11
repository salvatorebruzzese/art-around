# Art around
Un'applicazione web full-stack e responsive per gestire le visite ai musei, sviluppata come progetto del corso Tecnologie Web A.A. 2025/2026 dell'Università di Bologna.

# UI e UX
Il progetto segue i principi del goal-oriented design, adattando la visita dell'utente in quattro dimensioni diverse:
- Interessi individuali (specifici dell'utente, i.e. l'esposizione di maggiore interesse).
- Competenze pregresse (la formazione, livello di educazione o attitudini del visitatore).
- Contesto della visita (per interesse personale, professionale o formativo).
- Età dell'utente.

La UI verrà progettata in un'applicazione di web design basata su componenti chiamata [Penpot](https://penpot.app).

# Architettura
L'applicazione si divide in due moduli essenziali: Marketplace e Navigator.

Marketplace è il modulo utilizzato per la creazione, pubblicazione, catalogazione e vendita delle visite. Marketplace è pensato per essere utilizzato al computer in modo totalmente generico rispetto al museo o la visita specifica. L'utente seleziona un museo tra quelli disponibili e vede tutte le visite disponibili, con la possibilità di sceglierle, modificarle o comprarle.

Navigator è pensato per essere utilizzato da cellulare e auricolari durante la visita al museo. Permette di analizzare nel dettaglio un oggetto della mostra, con la possibilità di chiedere spiegazioni audio sui campi dell'item. Navigator si adatta all'utente secondo i [principi sopracitati](#ui-e-ux), utilizzando sintetizzatori vocali e modelli di intelligenza artificiale per adattare all'utente i chiarimenti sull'oggetto.

Sia Marketplace che Navigator sono responsive e quindi devono adattarsi alla risoluzione del monitor dell'utente.

## Il Marketplace
Il Marketplace è diviso tra un catalogo e un editor.
Il museo viene scelto con un pannello di scelta multipla all'accesso.
Viene caricato sempre il catalogo inizialmente, e in alto si ha una barra dove cambiare tra editor e marketplace.
Il catalogo mostra o le visite pubblicate relative al museo, o l'insieme di contenuti ([item](#visite-loggetto-item)) presenti in tutte le visite del museo.
L'editor mostra tutte le visite create.

Ogni visita può essere modificata nell'editor se si è i creatori della visita o creando una copia da modificare, oppure se ne può creare una da zero.

I metadati delle visite mantengono anche lo stato di pubblicazione (pubblico, privato con chiave d'accesso, privato), la licenza di utilizzo della visita e informazioni sulle vendite.

## Il Navigator
Il museo è rappresentato da un file di configurazione e un insieme di visite disponibili. Navigator gestisce anche il [sistema di navigazione](#il-sistema-di-navigazione).

Al navigator si può accedere come guida o come visitatore. La guida dispone di un sistema di sincronizzazione e di una chiave di accesso da dare ai visitatori. Nel caso di una visita formativa, si può somministrare un quiz a risposta multipla ai visitatori. 

## Visite: l'oggetto item
La visita è una raccolta di dati del museo e della mostra (locazione, costo del biglietto, posizione dei servizi del museo, etc.) e una sequenza ordinata di *item*.
Gli item sono dei dati strutturati, che identificano una tappa della visita e forniscono tutto quello che si sa sull'oggetto della tappa. Sono visualizzati a schermo e letti via sintesi vocale.

Hanno dei campi obbligatori quali:
- Una stringa alfanumerica come identificativo.
- Un intero positivo per la lunghezza in secondi della spiegazione.
- Un membro di un enumerazione per il livello del linguaggio utilizzato (semplice, normale, avanzato) e una stringa di spiegazione dell'opera.
- Una stringa o un item per l'autore dell'opera.
- Una stringa per la licenza d'uso.

Hanno dei campi facoltativi:
- Un'immagine dell'oggetto.
- La data di creazione dell'opera.
- Lo stile dell'opera.

## Il sistema di navigazione 
Il sistema di navigazione gestisce due aspetti correlati: l'avanzamento della visita e la geolocalizzazione dell'utente rispetto alle opere. Il sistema non è visibile dall'utente, ma lo si può utilizzare attraverso il [sistema di interazione](#il-sistema-di-interazione-con-lutente).

Le varie funzioni includono:
- [ ] Gestione della sequenza di item (andare avanti e indietro nella visita).
- [ ] Posizionamento degli item nella planimetria del museo.
- [ ] Lista completa della posizione di tutti i servizi del museo (accoglienza, servizi igienici) ed eventuali problemi di accessibilità (scale sprovviste di rampe, descrizioni di oggetti senza braille, etc.).

## Il sistema di interazione con l'utente
L'interazione con l'utente avviene via tasti o via comandi vocali.
I comandi vocali fanno parte di un *vocabolario libero* che viene mappato da un LLM ai comandi predefiniti.

Il sistema ha due modalità:
- *libre* per gli utenti singoli, senza guida. In questa modalità sono disponibili tutte le funzionalità di navigator.
- *guided* per gli utenti in gruppo o con una guida. È disponibile solo l'interazione attraverso sintesi vocale. 

Le varie funzioni includono:
- [ ] Presentazione visiva dell'item.
- [ ] Lettura attraverso sintesi vocale dei campi associati all'item.
- [ ] Interazione vocale tramite vocabolario libero per chiedere più informazioni sull'oggetto o informazioni sui servizi del museo.
- [ ] La visualizzazione opzionale di una planimetria del museo con le relative posizioni degli item.
- [ ] Una funzione nella planimetria che permetta di teletrasportarsi da un'opera all'altra. In questo caso la visita riprende dall'opera selezionata.

# Tecnologie utilizzate
Navigator e Marketplace sono applicazioni client-side costruite con JavaScript, collegate a processi server-side locali in Node.JS. Utilizzano come database NoSQL MongoDB.
Navigator utilizza il framework Vue.Js mentre Marketplace non utilizza alcun framework e si basa su vanilla JavaScript.