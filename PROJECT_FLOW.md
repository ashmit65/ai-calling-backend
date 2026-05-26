# Project Flow Document

This document explains the overall architecture and data flow of the `ai-calling-backend` application. It is designed to be a living document that should be updated as the project grows.

## Technology Stack
- **Framework**: NestJS
- **Database**: PostgreSQL
- **ORM**: Prisma

## Database Schema
The database is managed via Prisma (`prisma/schema.prisma`). It currently contains the following models:

1. **Business**
   - `id` (String, UUID)
   - `name` (String)
   - `createdAt` (DateTime)

2. **Call**
   - `id` (String, UUID)
   - `phone` (String)
   - `transcript` (String, optional)
   - `intent` (String, optional)
   - `createdAt` (DateTime)

## API Endpoints (`src/calls`)

The `Calls` module handles incoming call data. 

### 1. `GET /calls`
- **Controller**: `CallsController.findAll()`
- **Service**: `CallsService.findAll()`
- **Action**: Queries the database using `prisma.call.findMany()` and returns a list of all calls.

### 2. `POST /calls`
- **Controller**: `CallsController.create(body)`
- **Service**: `CallsService.create(body)`
- **Action**: Receives a JSON payload (containing `phone`, `intent`, and `transcript`), and saves a new `Call` record to the database using `prisma.call.create()`.

## Testing the API

### PowerShell / Windows
If you are testing the API locally on Windows PowerShell, you can use the native `Invoke-RestMethod`:

```powershell
Invoke-RestMethod -Uri http://localhost:3000/calls -Method Post -Headers @{"Content-Type"="application/json"} -Body '{"phone":"999","intent":"booking"}'
```

Alternatively, if you want to use the traditional `curl` command, you must specify `curl.exe`:

```powershell
curl.exe -X POST http://localhost:3000/calls -H "Content-Type: application/json" -d '{\"phone\":\"999\",\"intent\":\"booking\"}'
```

*(Note: In PowerShell, `curl` without `.exe` is an alias for `Invoke-WebRequest` which has a different syntax).*
