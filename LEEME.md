# BIM Doc Platform — Sprint 1 + Sprint 2

Plataforma web para gestión de documentos BIM según ISO 19650.

## Stack

| Capa | Tecnología |
|------|-----------|
| Backend | Node.js + Express + Prisma ORM |
| Frontend | Next.js 14 (App Router) + Tailwind CSS |
| Base de datos | PostgreSQL |
| Auth | NextAuth.js (JWT) con roles |
| Generación Word | docx (programático) |
| Generación PDF | Puppeteer (HTML → PDF) |

## Estructura

```
bim-doc-platform/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── storage/
│   │   └── generated/         ← archivos .docx y .pdf generados
│   └── src/
│       ├── index.ts
│       ├── middleware/auth.ts
│       ├── routes/
│       │   ├── documents.ts   ← endpoints OIR + generación + descarga
│       │   └── projects.ts
│       └── services/
│           ├── oirMapper.ts        ← mapea 27 question_id → vars de plantilla
│           ├── oirWordBuilder.ts   ← genera .docx (7 secciones ISO 19650)
│           ├── oirHtmlBuilder.ts   ← genera HTML para PDF
│           └── documentGenerator.ts ← orquesta Word + PDF + DB
└── frontend/
    └── src/
        ├── app/
        │   ├── dashboard/
        │   ├── auth/signin/
        │   └── documents/oir/[id]/
        ├── components/
        │   ├── oir/
        │   │   ├── OIRForm.tsx
        │   │   ├── FormField.tsx
        │   │   ├── GenerateDocumentButton.tsx  ← botón generar + descargar
        │   │   └── blocks/ (Block1–Block5)
        │   └── ui/ (ProgressBar, StatusBadge)
        ├── lib/auth.ts
        └── types/oir.ts
```

## Inicio rápido

### 1. Requisitos previos
- Node.js 18+
- PostgreSQL corriendo localmente

### 2. Base de datos

PostgreSQL 18 instalado en `C:\Program Files\PostgreSQL\18\`.
La base de datos `bim_doc_platform` ya fue creada con:

```bash
PGPASSWORD=admin "C:/Program Files/PostgreSQL/18/bin/createdb.exe" -U postgres -h localhost bim_doc_platform
```

Credenciales configuradas:
- **Host:** localhost:5432
- **Usuario:** postgres
- **Contraseña:** admin
- **Base de datos:** bim_doc_platform

### 3. Backend

Los archivos `.env` y `node_modules` ya están configurados.
La migración y el seed ya fueron ejecutados.

Para arrancar:

```bash
cd backend
npm run dev            # inicia en http://localhost:4000
```

Si necesitas reiniciar desde cero:

```bash
npm run db:migrate     # aplica migraciones
npm run db:seed        # recrea usuarios y proyecto demo
```

### 4. Frontend

Los archivos `.env.local` y `node_modules` ya están configurados.

Para arrancar:

```bash
cd frontend
npm run dev            # inicia en http://localhost:3000
```

### 5. Usuarios demo

| Email | Contraseña | Rol |
|-------|-----------|-----|
| adjudicador@demo.com | demo1234 | adjudicador |
| principal@demo.com | demo1234 | adj_principal |
| adj@demo.com | demo1234 | adj |

## API Endpoints

### Sprint 1 — Formulario OIR

```
POST   /api/documents/oir              → crear OIR con respuestas iniciales
GET    /api/documents/oir/:id          → recuperar OIR completo
PATCH  /api/documents/oir/:id          → autosave respuestas por bloque
PATCH  /api/documents/oir/:id/status   → cambiar estado (borrador/en_revision/aprobado)
GET    /api/documents/projects/:id/oir → listar OIRs de un proyecto
GET    /api/projects                   → listar proyectos de la organización
POST   /api/projects                   → crear proyecto
```

### Sprint 2 — Generación de documentos

```
POST   /api/documents/oir/:id/generate          → genera Word + PDF y guarda en /storage
GET    /api/documents/oir/:id/download/docx     → descarga el archivo .docx
GET    /api/documents/oir/:id/download/pdf      → descarga el archivo .pdf
```

> El botón "Generar documento" aparece en el Bloque 5 del formulario
> cuando el documento está en estado **Aprobado** con al menos 20 respuestas.

## Formulario OIR — 27 preguntas en 5 bloques

| Bloque | Preguntas | Condicionales |
|--------|-----------|---------------|
| 1. Identificación | OIR-1.1 a OIR-1.6 | — |
| 2. Objetivos estratégicos | OIR-2.1 a OIR-2.6 | 2.4 si 2.3=Sí · 2.6 si 2.5=Sí |
| 3. Requisitos del activo | OIR-3.1 a OIR-3.7 | 3.4 si 3.3=Sí · 3.7 si 3.6=Sí |
| 4. Estándares y formatos | OIR-4.1 a OIR-4.6 | 4.4 si 4.3=Sí · 4.6 si 4.5=Sí |
| 5. Gobernanza | OIR-5.1 a OIR-5.6 | 5.3 si 5.2=Sí · 5.6 si 5.5=Sí |

## Documento Word generado — Estructura

| Sección | Contenido |
|---------|-----------|
| Portada | Org, proyecto, versión, fecha, estado, responsable |
| 1. Objeto y campo de aplicación | Texto ISO 19650-1 §5.2 + sector + estándares |
| 2. Identificación de la organización | Tabla con datos de OIR Bloque 1 |
| 3. Objetivos estratégicos | Usos BIM, objetivo, plan activos, obligaciones |
| 4. Requisitos de información del activo | Registro, O&M, riesgos, impactos, fin de vida |
| 5. Estándares y formatos | Formatos, clasificación, CDE, LOD/LOI |
| 6. Gobernanza de la información | Frecuencia, restricciones, retención |
| 7. Observaciones adicionales | Condicional — solo si OIR-5.5 = Sí |
| Control de documento | Tabla de versiones |

- Header con nombre de organización en todas las páginas
- Footer con org · versión · fecha · ISO 19650-1 en todas las páginas

## Tests

```bash
cd backend
npm test           # 14 tests unitarios del mapper + Word + HTML
npm run test:watch # modo watch durante desarrollo
```

Los tests cubren: mapeo de los 27 question_id, multi-select pipe/JSON, campos
condicionales, respuestas vacías → "No aplica", generación de Buffer .docx
válido, HTML sin marcadores sin resolver.

## Roles y permisos

```
adjudicador   → crea proyectos, aprueba documentos, descarga archivos
adj_principal → gestiona documentos de su proyecto
adj           → rellena formularios, visualiza
```

## Convenciones

- TypeScript estricto en backend y frontend
- Prisma como único ORM; no usar queries SQL directas
- Los archivos generados van siempre a `backend/storage/generated/`
- Los tests unitarios cubren: mapper, Word builder, HTML builder (no mocks de DB)
- Autosave se dispara por bloque, no por campo individual

## Sprint 3 (pendiente)
- Módulo AIR (Asset Information Requirements)
- Notificaciones por email al cambiar estado
- Historial de versiones del documento
