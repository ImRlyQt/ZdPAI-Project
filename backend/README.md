# DeckHeaven Backend (FastAPI + SQLite)

Backend aplikacji przeniesiony z PHP na FastAPI z JWT, SQLAlchemy i SQLite.

## Wymagania
- Python 3.11+ (zalecane)
- `pip`
- (opcjonalnie) wirtualne środowisko `venv`

## Instalacja (Windows PowerShell)
```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

## Uruchomienie serwera
```powershell
uvicorn main:app --reload
```
- API będzie dostępne pod: `http://localhost:8000`
- CORS jest włączony dla `http://localhost:5173` (Vite dev server)

## Baza danych
- SQLite plik: `backend/app.db`
- Tabele tworzą się automatycznie przy starcie (`startup` w `main.py`).

## Uwierzytelnianie (JWT)
- Po zalogowaniu otrzymujesz `access_token`.
- Do wszystkich chronionych endpointów dodawaj nagłówek:
  - `Authorization: Bearer <token>`
- Specjalne logowanie admina zgodnie z PHP: email `admin@gmail.com`, hasło `123` tworzy/promuje konto admina.

## Endpointy
- Auth
  - `POST /auth/register` — rejestracja: `{ nick, email, dob, password }`
  - `POST /auth/login` — logowanie: `{ email, password }` → zwraca `access_token` i dane użytkownika
- Profile
  - `GET /profiles/search?q=...` — wyszukiwarka profili po `nick`
- Karty
  - `GET /cards` — lista kart użytkownika (dla admina można podać `user_id` w query)
  - `GET /cards/search?q=...` — wyszukiwanie kart (proxy do API MTG)
  - `POST /cards/add` — dodanie karty: `{ id, name, image?, setName?, multiverseid?, user_id? }`
  - `POST /cards/remove` — usunięcie/dekrement: `{ card_id, user_id? }`
- Konto
  - `POST /account/delete` — usunięcie konta; admin może podać `{ user_id }`

## Struktura
- `main.py` — aplikacja FastAPI, CORS, rejestracja routerów
- `database.py` — konfiguracja SQLite/SQLAlchemy, `SessionLocal`
- `models.py` — modele: `User`, `UserCard` (unikat `(user_id, card_id)`)
- `schemas.py` — Pydantic request/response
- `auth.py` — bcrypt i JWT
- `routers/` — moduły: `auth.py`, `profiles.py`, `cards.py`, `account.py`, `deps.py`
- `requirements.txt` — zależności

## Opis folderów i plików (dla prowadzącego)
Poniżej krótki opis odpowiedzialności poszczególnych elementów backendu.

- `main.py`
  - Punkt startowy aplikacji FastAPI.
  - Konfiguruje CORS i rejestruje wszystkie routery.
  - Na starcie tworzy tabele w SQLite.
- `database.py`
  - Inicjalizacja silnika SQLite i sesji SQLAlchemy (`SessionLocal`).
- `models.py`
  - Definicje ORM: `User` (dane konta), `UserCard` (kolekcja kart z ilością).
  - Unikat `user_id + card_id` zapobiega duplikatom tej samej karty.
- `schemas.py`
  - Modele Pydantic opisujące kontrakty żądań i odpowiedzi API.
- `auth.py`
  - Hashowanie haseł i obsługa JWT (generowanie, weryfikacja).
- `routers/`
  - `auth.py` — rejestracja i logowanie użytkowników (JWT).
  - `profiles.py` — wyszukiwanie profili i odczyt profilu po `id`.
  - `cards.py` — wyszukiwanie kart (MTG API), dodawanie/usuwanie kart.
  - `account.py` — usuwanie konta (własnego lub przez admina).
  - `deps.py` — zależności FastAPI (np. autoryzacja i aktualny użytkownik).
- `requirements.txt`
  - Lista zależności backendu do odtworzenia środowiska.

## Konfiguracja
- Sekret JWT jest zdefiniowany w `backend/auth.py` (`JWT_SECRET`). Zmień go na własny w środowisku produkcyjnym.

## Diagnostyka błędów
Jeśli instalacja/uruchomienie zakończy się błędem:
- Upewnij się, że aktywowałeś wirtualne środowisko (`.venv`).
- Sprawdź wersję Pythona: `python --version`.
- Usuń/lub odśwież plik `app.db` jeśli masz konflikty migracji (nie powinno być wymagane).
