# Wersja Eksprementalna 1 - Prototyp wersji Pierwszej.
## Dodano
- Tryb jednoosobowy
- **W trybie jest dostępne sterowaniem takich rzeczy jak:**
> - Sterowanie panelem bocznym _(pokaz/ukryj)_
> - Koła ratunkowe 3 _(50:50, Publiczność i Pytanie do Prowadzącego, aktualnie funkcja **nie dostępna**)_
> - Panel Główny _(czyli pytania i odpowiedzi)_
> - Dodano pokazanie pytania oraz odpowiedzi od A -> D
> - Dodano system odpowiedzi gracza jak klikniesz odpowiedz to zanim zaakceptujesz to musisz poczekać 2 sekundy to zostało zrobione w celu przypadkowego kliknięciu zatwierdzonego pytania czyli system najpierw wybierasz i potem zatwierdzasz pytanie wybrane
> - Jest pokazane poniżej jakie pytanie wybrane, za ile możesz kliknąć ponownie, wynik
> - Jak przeszłeś przez pytanie czyli zaakceptowałeś to może być prawdą albo fałsz jeżeli prawda to odblokuje przycisk następne pytanie a jeżeli fałsz to pokazuje ekran końca gry z możliwością zakończenia gry
> - Oraz jest możliwość rozdzielenia pasku bocznego od ekranu głównego
- System bazy pytań
> **W bazie pytań jest możliwość dodania, usunięcia lub zedytowania pytania i jest możliwość zmiany lub ustawienia:**
> - treść pytania
> - odpowiedzi
> - który odpowiedz jest poprawny
> - poziom pytania oraz dostępność pytania
- Oraz Ustawienia
> **W ustawieniach istnieją takie zakładki:**
> - Ogólne
> - Ekran
> - Dźwięk (zablokowane)
> - Drzewko nagród
> - Wygląd (częściowo zablokowane)
> - Zapisy danych (zablokowane)
> Jest możliwość ustawienia w:
> - Ogólne można ustawienia nazwy turnielu, liczba pytań, losowe pytania, losowa kolejnosć odpowiedzi, automatyczne przejście do następnego pytania oraz potwierdzanie odpowiedzi
> - Ekranie można ustawienia pełnego ekranu, informacji technicznej, numer monitora, szerokość oraz wysokość ekranu
> - Dźwięku aktualnie nic nie można zmienić
> - Drzewko nagród można tylko zmienić wartość poziomu oraz włączyć/wyłączyć próg gwarantowany
> - Wyglądzie tylko motyw oraz kolor główny
> - a w Zapisach danych aktualnie są zablokowane

**ZABLOKOWANE SĄ KOŁA RATUNKOWE**

## Wymagania:
1. Wejdz na strone https://nodejs.org/en/download
2. Następnie pobierz i zainstaluj na komputerze
3. Nastepnie jak nie uda się uruchomić program to zrób komende npm install i następne npm run w celu uruchomienu programu

## Komendy Podstawowe:
- npm run w celu uruchomieniu programu

#############################################################################################################################################################

# Wersja Eksprementalna 2 - Prototyp wersji Drugiej.
## Dodano:
**Skróty Klawiszowe**
- Dodanie skróty klawiatury do menu gry w celu nie używania panelu sterowania i w celu przyspieszenia działania
- Dodano liste skrótów klawiszów pod klawiszem Ctrl+S
- Dodano zakładkie skróty klawiszów w ustawieniach (jest ponad 50 skrótów)
- Dodano menu wyboru pytania po kliknieciu P+E/R w celu szybszego dojścia do pytania wybranego

**Skróty Klawiszowe - Powiązane Rzeczy**
- Dodano brakujących elementów w celu otworzenia panelu sterowania w game.js

**Konfiguracja programowania**
- Dodanie do konfiguracji możliwość edycji menu gry zględem możliwość technicznej programu.
- Dodano do gry ~~możliwość ustawienia~~ zdjęcie na tło menu gry oraz dostosowanie kolorów.
- Dodano obsługe monitora oraz rozdzielczość na rzecz ustawień ekranu + pozostawiono stare ustawienia monitoru jak klikniesz w opcji "Ustawienie ręczne" w zakładce monitor.

**Konfiguracja programowania - Powiązane rzeczy**
- Douzupełniono brakujących informacji związane z ustawieniami

**Animacje i wyglądowe rzeczy**
- Dodano animacje do gry dla paska bocznego (nie sterowania tylko gdzie są nagrody oraz koła ratunkowe)
- Dodano animacje pytania oraz odpowiedzi oprócz tekstu

**Zakładki nowe**
- Dodano nowe wsporo zakładek na menu głównym czyli:
> - Regulamin Aplikacji
> - Polityka Aplikacji
> - Formularz Zgłoszeniowy - Zewnetrznie
> - Github Projekt - Zewnetrznie
> - Autorzy - Zrobione
> - Wersja Programu - Zrobione
- Dodano ładowanie ekranu na początek uruchiomienia programu

**Zabezpieczenie i dodatkowe blokady**
- Dodano zabezpieczenie przed uruchomieniem gry jak nie ma pytań lub nie pytania 1 poziomu

## Zmienione:
**Skróty Klawiszowe**
- Zmieniono klawisze podstawowe wybranych rzeczy:
> Odśwież - Ctrl + R -> F5
> Wymuś Odśwież - Ctrl + Shift + R -> Ctrl + F5
> DevTools - Ctrl + Shift + I -> F12

**Techniczne rzeczy**
- Przebudowa oraz rozbudowa plików game.js oraz design.js i też settings.js 
- Przeniesiono/Przebudowano działanie aplikacji i będzie to realizowane w kierunku minimalizowania ilości linijek w głównych plikach
- Przygotowanie struktury backend w celu rozbudowy systemu zabezpieczeń dla aplikacji nie zaleźnie od niczego

**Wyglądowe oraz językowo**
- Przesunięto miejsce nagrody z dołu na środek ekranu
- Przebudowano pasek rzędzi na rzecz polskości oraz aby dało się szybciej dojść do róźnych podstron
- Przeniesiono stylizacje offcanvas (panel sterowania) w celu uniwersalności i do uzycia w innych miejsach oprócz panel sterowania

**Wyglądowo-Techniczne - powiązane rzeczy**
- Zmieniono umieszczenie wybranych plików działących i stylizacyjne dla wyglądu i działania programu graficznego

## Inne Informacje

**ZABLOKOWANE SĄ KOŁA RATUNKOWE**

#############################################################################################################################################################

# Wersja Eksprementalna 3 - Prototyp wersji Drugiej.
## Dodano:
**System plików programu**
- Dodano możliwość wybrania gdzie ma być zapisywane dane według użytkownika albo według programu uznania dla programu to będzie domyślnie folder Dokumenty
- Zostało zapewnione przy ponowej uruchomienie programu zlokalizowanie po pierwszym uruchomieniu wskazanie miejsca zapisu danych
- Dodanie opcji usunięcia z systemu informacje oraz danych o lokalizacji folderu i informacjach o programie po wyłączeniu programu w przypadku że to jest nie własny sprzęt np. sprzęt szkolny, stanowisko pracy czy laptop wynajęty i zostanie pokażany ekran czy ma program usunoć folder z AppData czy w przypadku Linuksa .config
- Dodano ekranu wyjścia gry można zdecydować czy zamknoć aplikacje czy usunoć i zamknoć aplikacje
- **[DOTYCZY TYLKO WINDOWSA]** Dodano mechanizm usuwania lokalnych plików utworzonych przez program. System może wykonać do 15 prób usunięcia danych. Jeżeli operacja się nie powiedzie, zostanie wygenerowany raport błędu. Obecnie podczas działania mechanizmu może być widoczne okno terminala. W przyszłości mechanizm zostanie dopracowany tak, aby podczas prawidłowego działania pracował całkowicie w tle.
-# AI Doprecował tą informacje dotyczący o Windowsa

**Paleta kolorów**
- Dodano palete kolorów i będzie nie mal zawsze działać przy edycjach związane z kolorami
- Dodano grupowanie kolorów
- Dodano obsługie custom kolorów
- Po wybraniu kolor to i wyjście z menu wyboru koloru (domyślnego nie zrobiony przez program to) przypisuje do tego inputa kolorów wybranego **"Nie zapisuje się automatycznie trzeba manualnie albo skrótem do zapiszu ustawień (U+U)"**

## Przebudowane
- Zostało przebudowane pliki który potrzebowały rzeczyście zmiany w celu dodania system plików
- Udało się zmiejsz wage programu o połowe mniej i teraz tak wygląda
> Na Linuksa 692 MB ale teraz jest 124 MB
> Na Windowsie 473 MB ale teraz jest 382 MB

## Usunięto:
- Usunięto zawartość zakładki zapisy danych

## Inne Informacje

**ZABLOKOWANE SĄ KOŁA RATUNKOWE**