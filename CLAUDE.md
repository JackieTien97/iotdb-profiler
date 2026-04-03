# CLAUDE.md

## Project Overview

IoTDB Profiler — a web-based query execution plan visualizer for Apache IoTDB (table model). Users connect to an IoTDB instance via the browser, submit SQL queries, and visualize the distributed execution plan as an interactive tree diagram.

## Architecture

- **Backend**: `backend/` — Spring Boot 3.4, Java 21, Maven. Thin REST proxy that connects to IoTDB via JDBC (`iotdb-jdbc`) and returns JSON execution plans.
- **Frontend**: `frontend/` — React 19, TypeScript, Vite, Tailwind CSS 4, React Flow, Dagre. Renders the plan tree with interactive pan/zoom, fragment grouping, and node detail inspection.

## Key Technical Details

### Backend

- JDBC connections are **per-request** (no pool) because users may target different IoTDB instances.
- Connection URL format: `jdbc:iotdb://{host}:{port}/?sql_dialect=table`
- The IoTDB JDBC driver does **not** auto-register; it is loaded explicitly via `Class.forName("org.apache.iotdb.jdbc.IoTDBDriver")`.
- The JDBC driver version is `2.0.7-SNAPSHOT`, built from the IoTDB source tree at `/Users/jackietien/iotdb/`. It must be installed to the local Maven repo first: `cd /Users/jackietien/iotdb && mvn install -pl iotdb-client/jdbc -am -DskipTests`.
- The local Maven repo is at `/Volumes/timecho-yuan/maven/repository/` (non-default location configured in Maven settings.xml).

### Frontend

- **Tree stitching algorithm** (`frontend/src/utils/treeBuilder.ts`): The core challenge. IoTDB returns distributed execution plans as multiple `FragmentInstance` objects. The algorithm links them into a single unified tree by matching `ExchangeNode.planNodeId` with `IdentitySinkNode.specifiedInfo.DownStreamPlanNodeId`. The coordinator fragment (typically `dataRegion = "virtual_data_region"`) is the root.
- **Fragment group boxes** (`frontend/src/utils/layoutEngine.ts`): After dagre layout, bounding boxes are computed per fragment. Overlap resolution shrinks boxes on overlapping edges. `nodesep` and `ranksep` are increased in analyze mode to accommodate fragment padding.
- **Theme**: Dark/light toggle via `ThemeContext` + `data-theme` attribute on `<html>`. Default is dark.
- **i18n**: English/Chinese via `react-i18next`. Translation files in `frontend/src/i18n/`.
- **Monaco editor** theme switches between `light` and `vs-dark` based on the active theme.

### API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/test-connection` | Validate IoTDB connectivity |
| POST | `/api/explain` | Execute EXPLAIN/EXPLAIN ANALYZE and return JSON plan |
| POST | `/api/execute` | Execute arbitrary SQL (for setup/DDL) |

### EXPLAIN Modes

- `EXPLAIN (FORMAT JSON) <sql>` — logical plan tree, single JSON object
- `EXPLAIN ANALYZE (FORMAT JSON) <sql>` — distributed plan with fragment instances, timing metrics
- `EXPLAIN ANALYZE VERBOSE (FORMAT JSON) <sql>` — same structure, more queryStatistics fields

## Development Workflow

```bash
# Terminal 1: Backend
cd backend && mvn spring-boot:run

# Terminal 2: Frontend (dev server with API proxy to :8080)
cd frontend && npm run dev
```

Frontend runs on `http://localhost:5173`, backend on `http://localhost:8080`. Vite proxies `/api/*` to the backend.

## Build Commands

- Backend: `cd backend && mvn package -DskipTests` produces an executable JAR
- Frontend: `cd frontend && npm run build` outputs to `frontend/dist/`
- TypeScript check: `cd frontend && npx tsc --noEmit`

## File Conventions

- Backend Java sources under `org.apache.iotdb.profiler` package
- Frontend components in `frontend/src/components/`, custom React Flow nodes in `components/nodes/`
- CSS variables for theming defined in `frontend/src/index.css`
- All colors, fonts, shadows must use CSS variables (never hardcoded) for theme compatibility
