# Art around
Un'applicazione web full-stack e responsive per gestire le visite ai musei, sviluppata come progetto del corso Tecnologie Web A.A. 2025/2026 dell'Università di Bologna.

# UI e UX
Il progetto segue i principi del goal-oriented design, adattando la visita dell'utente in quattro dimensioni diverse:
- Interessi individuali (specifici dell'utente, i.e. l'esposizione di maggiore interesse).
- Competenze pregresse (la formazione, livello di educazione o attitudini del visitatore).
- Contesto della visita (per interesse personale, professionale o formativo).
- Età dell'utente.

La UI verrà progettata in un software di design basato su componenti chiamato [Penpot](https://penpot.app).

# Architettura
L'applicazione si divide in due moduli essenziali: Navigator e Marketplace.
  
Navigator è pensato per essere utilizzato da cellulare durante la visita al museo. Viene utilizzato con degli auricolari e permette di analizzare nel dettaglio un oggetto della mostra, con la possibilità di chiedere spiegazioni sullo stile, sul periodo o su ogni informazione *registrata* sull'oggetto e l'artista. Navigator si adatta all'utente secondo i principi di cui sopra, utilizzando sintetizzatori vocali e modelli di intelligenza artificiale per adattare i chiarimenti sull'oggetto all'utente. Il museo è rappresentato da un file di configurazione e un insieme di visite disponibili. Navigator gestisce anche il [sistema di navigazione](#il-sistema-di-navigazione).

Marketplace è il modulo utilizzato per la creazione delle visite visualizzate da Navigator, nonché per la pubblicazione, catalogazione e vendita delle visite ai musei. Marketplace è pensato per essere utilizzato al computer in modo totalmente generico rispetto al museo o la visita specifica. L'utente seleziona un museo tra quelli disponibili e vede tutte le visite disponibili, con la possibilità di di vederle e modificarle se gratuite, o comprarle se private.

## Visite: l'oggetto item
La visita è una raccolta di dati del museo e della visita (locazione, costo del biglietto, posizionamento delle opere, etc.) e una sequenza ordinata di *item*.
Gli item sono dei dati compositi, eterogenei e strutturati, che identificano una tappa della visita e forniscono tutto quello che si sa sull'oggetto della visita. Gli item sono visualizzati a schermo e letti via sintesi vocale.

Hanno dei campi obbligatori quali:
- Un intero positivo per la lunghezza in secondi della spiegazione.
- Un membro di un enumerazione per il linguaggio utilizzato.
- Una stringa o un item per l'autore dell'opera.
- Una stringa per la licenza d'uso.

Hanno dei campi facoltativi:
- Un'immagine dell'oggetto.
- Data di creazione dell'opera.

## Il sistema di navigazione 

# Tecnologie utilizzate
Navigator e Marketplace sono applicazioni client-side costruite con JavaScript, collegate a processi server-side locali in Node.JS. Utilizzano come database NoSQL MongoDB.
Navigator utilizza il framework Vue.Js mentre Marketplace non utilizza alcun framework e si basa su vanilla JavaScript.