/* ==========================================================================
   AVVIO
   Ultimo file del gioco: applica le opzioni e disegna le barre della compagnia
   quando tutti i file sono caricati.
   Diviso da js/game.js: stesso ambito globale (usa stato, LIBRERIA, showScreen...).
   Caricato dopo js/game.js; le funzioni si chiamano tra file solo dopo il caricamento
   (l'avvio vero e proprio è in js/avvio.js, caricato per ultimo).
   ========================================================================== */

        applyOptions();
        updatePartyStatusBars();
