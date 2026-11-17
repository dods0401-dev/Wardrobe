# Handover — PROJECT WARDROBE

Stato al **17 novembre 2026** (aggiornato dopo l'unione della PR #1 in `main`). Questo documento serve per riprendere il lavoro in una nuova sessione o in un nuovo progetto senza perdere nulla.

---

## 1. Dove si trova tutto

| Cosa | Dove |
|---|---|
| Codice | GitHub `dods0401-dev/Wardrobe`. Il prototipo completo è su **`main`** (PR #1). Ramo di lavoro: **`claude/hopeful-gauss-xze77g`** |
| Controlli automatici (CI) | `.github/workflows/ci.yml`: lint, test, build e 47 controlli end-to-end a ogni push e pull request |
| Istruzioni automatiche per Claude | `CLAUDE.md` nella radice del repository |
| Documentazione tecnica | `README.md`: setup, architettura, motore, funzioni simulate, limiti, crediti foto |
| Schermate iPad | `docs/screenshots/ipad/` |
| Versione da provare (pagina privata) | https://claude.ai/artifact/K8urR6k35NZXLPDdhurmRp |
| Ambiente cloud | **"Wardrobe"** (personale): rete con `unsplash.com`, `images.unsplash.com` e `api.unsplash.com` |

Tutto il lavoro è salvato su GitHub. La sessione attuale si può chiudere senza perdere nulla.

---

## 2. Come spostare il lavoro in un progetto

### A. Nuova sessione Claude Code sullo stesso repository (consigliato)
1. Su claude.ai/code apri una **nuova sessione**.
2. Seleziona il repository `dods0401-dev/Wardrobe` e il ramo `main` (Claude passa poi al ramo di lavoro `claude/hopeful-gauss-xze77g`).
3. Scegli l'ambiente **"Wardrobe"**: ha già l'accesso a Unsplash.
4. Incolla il prompt di `docs/handover/PROMPT-RIPRESA.md`.

Claude legge da solo `CLAUDE.md` e, dal prompt, questo file.

### B. Portare il lavoro su `main`
- La PR #1 è già stata unita: `main` contiene il prototipo completo.
- Per i lavori successivi chiedi a Claude "apri una pull request verso main". La CI controlla la PR; poi la approvi e la unisci tu su GitHub.

### C. Progetto su claude.ai (chat con conoscenza condivisa)
1. Su claude.ai crea un **Progetto** "Project Wardrobe".
2. Nelle *Istruzioni del progetto* incolla il contenuto di `PROMPT-RIPRESA.md`.
3. Nella *Conoscenza* carica `README.md`, `CLAUDE.md` e questo `HANDOVER.md`. In alternativa collega il repository GitHub, se il connettore è disponibile.

Le chat del Progetto servono per pianificare e discutere. Per modificare il codice usa le sessioni Claude Code (punto A).

### D. Lavorare in locale sul tuo computer
```bash
git clone https://github.com/dods0401-dev/Wardrobe.git
cd Wardrobe
npm install
npm run dev        # poi apri http://localhost:3000
```
Serve Node.js 20 o superiore.

### E. Link online stabile (per iPad e per farlo provare ad altri)
1. Vai su vercel.com e accedi con GitHub.
2. Scegli *Add New → Project* e importa `dods0401-dev/Wardrobe`.
3. Seleziona il ramo `main` e premi *Deploy*.

A differenza della pagina claude.ai, qui si vedono anche le foto Unsplash.

---

## 3. Cosa è stato fatto (storia)

| Fase | Contenuto |
|---|---|
| Scaffold | Next.js + TypeScript + Tailwind + Zustand; modello di dominio; 47 capi demo; motore di raccomandazione con test |
| Servizi e stato | Salvataggio nel browser, gestione degli errori, riconoscimento DEMO, personalizzazione, statistiche |
| Fasi 1–2 | Design system, navigazione, illustrazioni dei capi, Home |
| Fase 3 | Guardaroba: ricerca, filtri, aggiunta/modifica/eliminazione, caricamento singolo e multiplo |
| Fasi 4–5 | Stylist, risultati, sostituzione di un capo, rigenerazione, dettaglio outfit, due modalità di visualizzazione |
| Fasi 6–7 | Lookbook (calendario), profilo di stile, Style DNA, statistiche |
| Fase 8 | 47 controlli end-to-end, pagina `/design`, README |
| Restyling 1 | Stile tenue: crema chiaro, salvia, pillole, niente nero pesante |
| Restyling 2 | Stile lucido e moderno: gradienti, vetro smerigliato, ombre su più livelli |
| Foto | 32 capi con foto Unsplash, crediti, collage a moodboard; segnalazioni di download all'API completate (32/32) |
| HTML unico | `npm run build:html`, pubblicato come pagina claude.ai |
| PR #1 | Tutto il lavoro unito in `main` |
| Documenti e CI | Documenti riallineati a `main`; CI GitHub con lint, test, build ed end-to-end |

---

## 4. Decisioni prese (da rispettare)

- **Niente funzioni AI finte presentate come vere.** Riconoscimento, look "On model" e lettura del brief sono etichettati DEMO.
- **Motore deterministico e solo con capi reali** del guardaroba. I pesi sono in `src/services/recommendation/config.ts`: colore 25%, stile 25%, preferenze 20%, occasione 15%, stagione 10%, rotazione 5%.
- **Stile:** morbido, moderno e lucido, scelto dall'utente dopo due riferimenti (un'app guardaroba chiara e una prova virtuale). Questo sostituisce la direzione "streetwear/editoriale" del brief iniziale.
- **Rosso** solo per errori ed eliminazioni.
- **Foto Unsplash:** solo foto di prodotto pulite, caricate dai server Unsplash (non salvate nel repository) e con il credito al fotografo. Dove la foto mostrava un colore diverso, nome e colore del capo sono stati adattati.
- **Prova virtuale:** il secondo riferimento la mostrava, ma il brief vieta di simularla. Se ne riprende solo lo stile.

---

## 5. Cose aperte / prossimi passi

1. **Portare su `main` l'aggiornamento di documenti e CI** con una pull request dal ramo di lavoro.
2. **Foto per i 15 capi rimasti.** Su Unsplash ci sono quasi solo foto ambientate per cappotto, piumino, blazer, cargo, joggers, pantaloni grigi, pantaloncini chino e nylon, canotta, maglia a righe, longsleeve, overshirt in velluto, cappellino e berretto. Si possono provare altre parole chiave, oppure caricare foto proprie.
3. **Chiave Unsplash.** Non è nel repository. È stata incollata in chat: rigenerala su unsplash.com/oauth/applications prima di andare in produzione. Per i prossimi lavori aggiungila come segreto di rete dell'ambiente "Wardrobe":
   - host `api.unsplash.com`
   - header `Authorization`
   - valore `Client-ID <chiave>`
4. **Link online stabile** (Vercel, vedi 2E).
5. **Roadmap prodotto**, dettagliata nel README §7: backend e account, riconoscimento reale con un modello di visione, motore v2 con pesi appresi, generazione reale del look, onboarding, PWA.

---

## 6. Controlli prima di ogni consegna
```bash
npm run lint && npm test
npm run dev &        # oppure npm run build && npm start
node e2e/acceptance.cjs http://localhost:3000 e2e/screenshots
npm run build:html   # se va aggiornata la pagina claude.ai
```
Risultato atteso: 13 test unitari e 47 controlli end-to-end superati. Gli stessi controlli girano nella CI di GitHub (scheda *Actions*).
