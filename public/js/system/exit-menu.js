(()=>{
  let modal=null;
  let previousBodyOverflow="";
  let lastFocusedElement=null;
  let removeExitRequestListener=null;

  /* =========================
     CREATE MODAL
  ========================= */

  function createModal(){
    const existingModal=
      document.getElementById(
        "exitProgramModal"
      );

    if(existingModal){
      modal=existingModal;

      initializeModalEvents();

      return modal;
    }

    modal=
      document.createElement(
        "div"
      );

    modal.id=
      "exitProgramModal";

    modal.className=
      "modal-backdrop";

    modal.hidden=true;

    modal.innerHTML=`
      <div
        class="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="exitProgramModalTitle"
        aria-describedby="exitProgramModalDescription"
      >
        <div class="modal-header">
          <div class="modal-header-main">
            <span class="eyebrow">
              MILIONERZY
            </span>

            <h2 id="exitProgramModalTitle">
              Zamknąć program?
            </h2>

            <p
              id="exitProgramModalDescription"
              class="page-description"
            >
              Wybierz sposób zakończenia pracy programu.
            </p>
          </div>

          <button
            class="button button-icon"
            type="button"
            data-exit-close
            aria-label="Zamknij"
          >
            ×
          </button>
        </div>

        <div class="form">
          <button
            class="button button-primary"
            type="button"
            data-exit-normal
          >
            Zamknij program
          </button>

          <button
            class="button button-secondary"
            type="button"
            data-exit-cleanup
          >
            Zamknij i usuń dane lokalne
          </button>

          <div class="exit-cleanup-info">
            <strong>
              Twoja konfiguracja i baza pytań nie zostaną usunięte.
            </strong>

            <p>
              Usunięte zostaną wyłącznie lokalne dane aplikacji
              zapisane na tym urządzeniu, w tym zapamiętana
              lokalizacja folderu danych.
            </p>

            <p>
              Jeśli dane znajdują się w folderze
              Dokumenty/HTGMilionerzy, program może wykryć je
              ponownie przy następnym uruchomieniu.
            </p>

            <p>
              Na obcym lub współdzielonym urządzeniu zalecane jest
              przeniesienie folderu danych do innej lokalizacji,
              np. na własny nośnik, albo usunięcie go z Dokumentów
              po zakończeniu pracy.
            </p>
          </div>

          <span class="form-help">
            Usuwanie lokalnych danych programu jest obecnie planowane.
          </span>

          <div class="modal-actions">
            <button
              class="button button-secondary"
              type="button"
              data-exit-close
            >
              Anuluj
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(
      modal
    );

    initializeModalEvents();

    console.log(
      "[ExitMenu] Utworzono modal"
    );

    return modal;
  }

  /* =========================
     OPEN
  ========================= */

  function open(){
    if(!modal){
      createModal();
    }

    if(!modal){
      console.error(
        "[ExitMenu] Nie można utworzyć modala"
      );

      return false;
    }

    if(!modal.hidden){
      console.log(
        "[ExitMenu] Modal jest już otwarty"
      );

      return true;
    }

    console.log(
      "[ExitMenu] Otwieranie menu wyjścia"
    );

    lastFocusedElement=
      document.activeElement;

    previousBodyOverflow=
      document.body.style.overflow;

    document.body.style.overflow=
      "hidden";

    modal.hidden=false;

    const primaryButton=
      modal.querySelector(
        "[data-exit-normal]"
      );

    requestAnimationFrame(
      ()=>{
        primaryButton?.focus();
      }
    );

    return true;
  }

  /* =========================
     CLOSE
  ========================= */

  function close(){
    if(
      !modal||
      modal.hidden
    ){
      return false;
    }

    console.log(
      "[ExitMenu] Zamykanie menu wyjścia"
    );

    modal.hidden=true;

    document.body.style.overflow=
      previousBodyOverflow;

    if(
      lastFocusedElement&&
      typeof lastFocusedElement.focus===
        "function"
    ){
      lastFocusedElement.focus();
    }

    lastFocusedElement=null;

    return true;
  }

  /* =========================
     NORMAL QUIT
  ========================= */

  async function quitNormally(){
    console.log(
      "[ExitMenu] Potwierdzono normalne zamknięcie"
    );

    const api=
      window.millionaireAPI;

    if(
      !api?.app?.quit
    ){
      console.error(
        "[ExitMenu] Brak millionaireAPI.app.quit"
      );

      return false;
    }

    const button=
      modal?.querySelector(
        "[data-exit-normal]"
      );

    if(button){
      button.disabled=true;
    }

    try{
      const result=
        await api.app.quit();

      console.log(
        "[ExitMenu] Wynik app.quit:",
        result
      );

      /*
       * Jeżeli z jakiegoś powodu proces
       * główny nie zakończy aplikacji,
       * przywracamy przycisk.
       */

      if(button){
        button.disabled=false;
      }

      return result;
    }catch(error){
      console.error(
        "[ExitMenu] Błąd zamykania programu:",
        error
      );

      if(button){
        button.disabled=false;
      }

      return false;
    }
  }

  /* =========================
     CLEANUP QUIT
  ========================= */

  async function quitWithCleanup(){
    console.log(
      "[ExitMenu] Wybrano czyszczenie lokalnych danych"
    );

    const api=
      window.millionaireAPI;

    if(
      !api?.app?.cleanupAndQuit
    ){
      console.error(
        "[ExitMenu] Brak millionaireAPI.app.cleanupAndQuit"
      );

      return false;
    }

    const button=
      modal?.querySelector(
        "[data-exit-cleanup]"
      );

    if(button){
      button.disabled=true;
      button.textContent=
        "Usuwanie danych...";
    }

    try{
      const result=
        await api.app.cleanupAndQuit();

      if(
        result?.success===false
      ){
        console.error(
          "[ExitMenu] Czyszczenie nie powiodło się:",
          result.error
        );

        if(button){
          button.disabled=false;
          button.textContent=
            "Zamknij i usuń dane lokalne";
        }

        return false;
      }

      return true;
    }catch(error){
      console.error(
        "[ExitMenu] Błąd czyszczenia:",
        error
      );

      if(button){
        button.disabled=false;
        button.textContent=
          "Zamknij i usuń dane lokalne";
      }

      return false;
    }
  }

  /* =========================
     MODAL EVENTS
  ========================= */

  function initializeModalEvents(){
    if(!modal){
      return;
    }

    if(
      modal.dataset.exitInitialized===
      "true"
    ){
      return;
    }

    modal.dataset.exitInitialized=
      "true";

    modal
      .querySelectorAll(
        "[data-exit-close]"
      )
      .forEach(button=>{
        button.addEventListener(
          "click",
          ()=>{
            close();
          }
        );
      });

    modal
      .querySelector(
        "[data-exit-normal]"
      )
      ?.addEventListener(
        "click",
        ()=>{
          quitNormally();
        }
      );

    modal
      .querySelector(
        "[data-exit-cleanup]"
      )
      ?.addEventListener(
        "click",
        ()=>{
          quitWithCleanup();
        }
      );

    modal.addEventListener(
      "click",
      event=>{
        if(
          event.target!==
          modal
        ){
          return;
        }

        close();
      }
    );

    console.log(
      "[ExitMenu] Zarejestrowano zdarzenia modala"
    );
  }

  /* =========================
     PAGE EXIT BUTTONS
  ========================= */

  function initializeExitButtons(){
    document.addEventListener(
      "click",
      event=>{
        const target=
          event.target;

        if(
          !(target instanceof Element)
        ){
          return;
        }

        const button=
          target.closest(
            "[data-exit-program]"
          );

        if(!button){
          return;
        }

        event.preventDefault();

        console.log(
          "[ExitMenu] Kliknięto przycisk wyjścia:",
          button
        );

        open();
      }
    );

    console.log(
      "[ExitMenu] Obsługa data-exit-program aktywna"
    );
  }

  /* =========================
     ELECTRON EXIT REQUEST
  ========================= */

  function initializeApplicationExit(){
    const api=
      window.millionaireAPI;

    if(
      !api?.app?.onExitRequested
    ){
      console.warn(
        "[ExitMenu] Brak millionaireAPI.app.onExitRequested"
      );

      return;
    }

    removeExitRequestListener=
      api.app.onExitRequested(
        ()=>{
          console.log(
            "[ExitMenu] Odebrano app:exit-requested"
          );

          open();
        }
      );

    console.log(
      "[ExitMenu] Nasłuchiwanie app:exit-requested aktywne"
    );
  }

  /* =========================
     KEYBOARD
  ========================= */

  function initializeKeyboard(){
    document.addEventListener(
      "keydown",
      event=>{
        if(
          !modal||
          modal.hidden
        ){
          return;
        }

        if(event.key==="Escape"){
          event.preventDefault();

          close();

          return;
        }

        /*
         * Proste zatrzymanie Tab
         * wewnątrz otwartego modala.
         */

        if(event.key!=="Tab"){
          return;
        }

        const focusable=
          Array.from(
            modal.querySelectorAll(
              `
                button:not([disabled]),
                [href],
                input:not([disabled]),
                select:not([disabled]),
                textarea:not([disabled]),
                [tabindex]:not([tabindex="-1"])
              `
            )
          ).filter(
            element=>
              !element.hidden
          );

        if(!focusable.length){
          return;
        }

        const first=
          focusable[0];

        const last=
          focusable[
            focusable.length-1
          ];

        if(
          event.shiftKey&&
          document.activeElement===
          first
        ){
          event.preventDefault();

          last.focus();

          return;
        }

        if(
          !event.shiftKey&&
          document.activeElement===
          last
        ){
          event.preventDefault();

          first.focus();
        }
      }
    );

    console.log(
      "[ExitMenu] Obsługa klawiatury aktywna"
    );
  }

  /* =========================
     DESTROY
  ========================= */

  function destroy(){
    console.log(
      "[ExitMenu] Usuwanie systemu menu wyjścia"
    );

    if(
      typeof removeExitRequestListener===
      "function"
    ){
      removeExitRequestListener();

      removeExitRequestListener=null;
    }

    if(modal){
      modal.remove();

      modal=null;
    }

    document.body.style.overflow=
      previousBodyOverflow;
  }

  /* =========================
     PUBLIC API
  ========================= */

  window.MillionaireExitMenu={
    open,

    close,

    quit(){
      return quitNormally();
    },

    destroy
  };

  /* =========================
     INIT
  ========================= */

  function initialize(){
    console.log(
      "[ExitMenu] Inicjalizacja"
    );

    createModal();

    initializeExitButtons();

    initializeKeyboard();

    initializeApplicationExit();

    console.log(
      "[ExitMenu] System menu wyjścia gotowy"
    );
  }

  initialize();
})();