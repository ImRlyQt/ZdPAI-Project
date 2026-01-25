# DeckHeaven Frontend (React + Vite + SCSS)

Frontend przeniesiony z PHP do React (Vite) z JWT auth.

## Wymagania
- Node.js 18+
- npm

## Instalacja i uruchomienie (Windows PowerShell)
```powershell
cd frontend
npm install
npm run dev
```
Aplikacja będzie działać pod: http://localhost:5173/

## Konfiguracja API URL
- Utwórz plik `.env` w folderze `frontend`:
```
VITE_API_URL=http://localhost:8000
```
- Frontend używa `import.meta.env.VITE_API_URL` do zapytań.

## Funkcje
- Logowanie/Rejestracja z JWT
- Profil: wyszukiwanie profili, zarządzanie kartami (dodaj/usuń, ilości)
- Widok publicznego profilu
- Usunięcie konta (z potwierdzeniem)
- Obsługa roli admin (może operować na innych kontach/kartach)

## Struktura
- src/App.jsx — routing (React Router)
- src/context/AuthContext.jsx — globalny stan auth (token, user)
- src/api.js — helpery GET/POST do backendu z Bearer tokenem
- src/pages/ — Login.jsx, Register.jsx, Profile.jsx
- src/styles/ — globals.scss, auth.scss, profile.scss, _variables.scss

## Opis folderów i plików (dla prowadzącego)
Poniżej krótki opis odpowiedzialności poszczególnych elementów frontendu.

- `index.html`
	- Szablon startowy Vite, zawiera element `#root` i globalne zasoby.
- `src/main.jsx`
	- Punkt wejścia React (renderowanie aplikacji do `#root`).
- `src/App.jsx`
	- Konfiguracja tras (React Router) i ochrona tras wymagających logowania.
- `src/context/AuthContext.jsx`
	- Globalny stan autoryzacji: token JWT i dane użytkownika.
	- Odpowiada za logowanie/wylogowanie i persystencję w `localStorage`.
- `src/api.js`
	- Warstwa komunikacji z backendem (fetch, nagłówki JWT).
	- Wspólny punkt obsługi `VITE_API_URL`.
- `src/pages/`
	- `Login.jsx` — formularz logowania i walidacja.
	- `Register.jsx` — formularz rejestracji i walidacja.
	- `Profile.jsx` — panel profilu, wyszukiwanie profili/kart, kolekcja kart.
- `src/styles/`
	- `globals.scss` — style globalne i reset.
	- `auth.scss` — układ i wygląd ekranów logowania/rejestracji.
	- `profile.scss` — układ profilu, sidebar, grid kart.
	- `_variables.scss` — wspólne kolory/zmienne SCSS.
	- `_fonts.scss` — deklaracje `@font-face` dla lokalnych fontów.
- `public/`
	- Zasoby statyczne, dostępne bezpośrednio z `/`.
	- `assets/cards/` — grafiki kart (opcjonalnie do skopiowania z `source`).
	- `fonts/` — fonty używane przez aplikację (Bodoni Moda, Jacquard 24).

## Assets
- (opcjonalnie) skopiuj karty ze source/public/assets/cards do frontend/public/assets/cards.

## Rozwiązywanie problemów
- Jeśli masz CORS błąd, upewnij się że backend działa na http://localhost:8000 i ma włączony CORS (jest skonfigurowane w backend/main.py).
- Jeśli token nie jest dodawany, sprawdź localStorage oraz AuthContext.
