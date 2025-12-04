# FiscalFlow 📊

FiscalFlow è un'applicazione mobile per la gestione delle finanze personali, costruita con React Native ed Expo. Aiuta gli utenti a monitorare le proprie spese, definire budget mensili e raggiungere i propri obiettivi di risparmio attraverso un'interfaccia semplice e intuitiva.

## ✨ Caratteristiche Principali

-   **Dashboard Riepilogativa**: Una visione d'insieme del saldo disponibile, del budget mensile e delle transazioni più recenti.
-   **Pianificazione Budget Dettagliata**: Una sezione dedicata per definire entrate, spese fisse (mensili e annuali) e budget per le spese variabili, con calcoli automatici della rimanenza e del potenziale di risparmio.
-   **Tracciamento delle Spese**: Un semplice form per aggiungere nuove spese in tempo reale.
-   **Statistiche Visive**: Un grafico a barre mostra l'andamento delle spese mensili, accompagnato da un elenco dettagliato di tutte le transazioni.
-   **Autenticazione Sicura**: Flusso di login e registrazione completo, con supporto per l'accesso automatico e biometrico (impronta digitale/riconoscimento facciale).
-   **Esperienza Personalizzabile**:
    -   **Tema**: Scegli tra modalità chiara, scura o basata sulle impostazioni di sistema.
    -   **Accessibilità**: Regola la dimensione del testo per una migliore leggibilità.

## 🚀 Tecnologie Utilizzate

-   **React Native** con **Expo**
-   **TypeScript**
-   **React Navigation** per la navigazione
-   **React Context API** per la gestione dello stato (Autenticazione, Impostazioni, Budget)
-   **React Native Chart Kit** per la visualizzazione dei dati
-   **Expo Secure Store** & **Async Storage** per la persistenza sicura dei dati

## 🏁 Per Iniziare

1.  **Installa le dipendenze**

    ```bash
    npm install
    ```

2.  **Avvia l'applicazione**

    ```bash
    npx expo start
    ```

    Dall'output del terminale, potrai aprire l'app su un emulatore/simulatore o sul tuo dispositivo fisico tramite l'app Expo Go.

## 📂 Struttura del Progetto

-   `src/api`: Contiene la logica per le chiamate di rete al backend.
-   `src/components`: Componenti UI riutilizzabili (es. `Header`, `Card`).
-   `src/constants`: File di configurazione per colori, font, ecc.
-   `src/context`: Provider di stato globale per l'autenticazione, le impostazioni e il budget.
-   `src/navigation`: Configurazione della navigazione (stack e tab navigator).
-   `src/screens`: Componenti che rappresentano le schermate dell'applicazione.
-   `src/utils`: Funzioni di utilità (es. formattazione valuta).
