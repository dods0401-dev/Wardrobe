# Prompt per riprendere il lavoro

Copia il testo qui sotto come primo messaggio di una nuova sessione Claude Code su `dods0401-dev/Wardrobe`, ramo `claude/hopeful-gauss-xze77g`, ambiente "Wardrobe". In alternativa incollalo nelle istruzioni di un Progetto claude.ai.

---

```
Stai continuando PROJECT WARDROBE, un prototipo web di guardaroba digitale e personal stylist.

Prima di tutto:
1. Leggi CLAUDE.md, docs/handover/HANDOVER.md e README.md.
2. Esegui npm install, npm run lint e npm test.
3. Riassumimi in 5 righe lo stato del progetto e le cose aperte (HANDOVER §5).

Regole:
- Rispetta l'architettura e le decisioni del handover: motore deterministico, solo capi reali, nessuna funzione AI finta presentata come vera, stile morbido/moderno/lucido.
- Lavora sul ramo claude/hopeful-gauss-xze77g. Fai commit chiari e push. Apri una PR solo se te lo chiedo.
- Prima di consegnare esegui lint, test e la suite end-to-end (node e2e/acceptance.cjs con il server avviato).
- Non salvare mai chiavi API nel repository.
- Rispondimi in italiano.

Il mio prossimo obiettivo è: <scrivi qui cosa vuoi fare>
```
