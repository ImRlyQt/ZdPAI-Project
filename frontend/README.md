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

## Assets
- (opcjonalnie) skopiuj karty ze source/public/assets/cards do frontend/public/assets/cards.

## Rozwiązywanie problemów
- Jeśli masz CORS błąd, upewnij się że backend działa na http://localhost:8000 i ma włączony CORS (jest skonfigurowane w backend/main.py).
- Jeśli token nie jest dodawany, sprawdź localStorage oraz AuthContext.
