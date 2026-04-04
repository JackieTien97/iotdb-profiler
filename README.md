# IoTDB Query Plan Visualizer

A web-based tool for visualizing Apache IoTDB table-model query execution plans. Connect to any IoTDB instance, run SQL queries, and interactively explore the distributed execution plan tree. You can also directly paste or upload JSON output from `EXPLAIN` commands — no database connection required.

Inspired by [PEV2](https://github.com/dalibo/pev2) (PostgreSQL Explain Visualizer), but designed for IoTDB's distributed architecture with multi-fragment plan visualization.

> **Note**: This tool requires IoTDB with `EXPLAIN (FORMAT JSON)` support. This feature is introduced in [apache/iotdb#17430](https://github.com/apache/iotdb/pull/17430). Please ensure this PR has been merged into the IoTDB version you are using.

## Screenshots

### Dark Mode — EXPLAIN ANALYZE with Fragment Grouping
![Dark mode - Explain Analyze](docs/images/dark-analyze.png)

### Dark Mode — Edge Thickness & Cross-node vs Intra-node Communication
![Dark mode - Edge Features](docs/images/dark-edge-features.png)

### Dark Mode — JSON Import Mode
![Dark mode - JSON Import](docs/images/dark-json-import.png)

### Dark Mode — Node Detail Panel
![Dark mode - Detail Panel](docs/images/dark-detail.png)

### Light Mode — EXPLAIN ANALYZE
![Light mode - Explain Analyze](docs/images/light-analyze.png)

### Light Mode — Node Detail Panel
![Light mode - Detail Panel](docs/images/light-detail.png)

## Features

- **Three explain modes**: `EXPLAIN`, `EXPLAIN ANALYZE`, and `EXPLAIN ANALYZE VERBOSE`
- **JSON Import**: Paste JSON text or upload `.json` files directly — visualize execution plans without a live IoTDB connection
- **Distributed plan visualization**: Automatically stitches multiple fragment instances into a unified tree
- **Fragment grouping**: Dashed bounding boxes with labels distinguish each query fragment (DataRegion, IP)
- **Edge thickness by data volume**: Edge line width scales logarithmically with the number of output rows, making data flow bottlenecks immediately visible
- **Cross-node vs intra-node communication**: Exchange links are visually distinguished — **RPC** (cross-node, dashed orange, animated) vs **Local** (intra-node memory queue, dotted green) — so you can instantly see which fragment boundaries involve expensive network serialization
- **Interactive tree**: Pan, zoom, minimap, click-to-inspect powered by React Flow
- **Performance metrics**: CPU time, output rows, memory with color-coded heat mapping (green → amber → red)
- **Plan statistics banner**: Stacked bar chart showing planning phase breakdown
- **Dark / Light theme**: Toggle with automatic persistence
- **i18n**: English and Chinese interface

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Spring Boot 3.4, Java 21, Maven |
| JDBC | Apache IoTDB JDBC 2.0.x |
| Frontend | React 19, TypeScript, Vite |
| Visualization | React Flow 12, Dagre |
| Styling | Tailwind CSS 4 |
| Editor | Monaco Editor |

## Prerequisites

- Java 21+
- Node.js 18+
- Maven 3.8+
- Apache IoTDB 2.0.x running and accessible
- IoTDB JDBC driver installed in local Maven repository

### Install IoTDB JDBC Driver

If using an IoTDB built from source:

```bash
cd /path/to/iotdb
mvn install -pl iotdb-client/jdbc -am -DskipTests
```

If using a released version, update `<iotdb.version>` in `backend/pom.xml` to match (e.g., `2.0.7`).

## Quick Start

### 1. Start the Backend

```bash
cd backend
mvn spring-boot:run
```

The backend starts on `http://localhost:8080`.

### 2. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend starts on `http://localhost:5173` with API proxy to the backend.

### 3. Use the App

#### Query Mode (connect to IoTDB)

1. Open `http://localhost:5173`
2. Select **Query** mode in the left sidebar
3. Enter IoTDB connection info (default: `127.0.0.1:6667`, `root/root`)
4. Enter the database name and SQL query
5. Select explain mode and click **Run**
6. Explore the execution plan tree — click nodes to see details

#### JSON Import Mode (no database needed)

1. Open `http://localhost:5173`
2. Select **JSON Import** mode in the left sidebar
3. Paste `EXPLAIN (FORMAT JSON)` or `EXPLAIN ANALYZE (FORMAT JSON)` output into the editor, or click **Upload .json File** to load from a file
4. Click **Visualize** — the tool auto-detects the JSON type (EXPLAIN vs EXPLAIN ANALYZE)
5. Explore the execution plan tree as usual

## Production Deployment

### Build

```bash
# Build frontend
cd frontend
npm install
npm run build

# Copy frontend dist to backend static resources
cp -r dist/* ../backend/src/main/resources/static/

# Build backend JAR
cd ../backend
mvn package -DskipTests
```

### Run

```bash
java -jar backend/target/iotdb-profiler-1.0.0-SNAPSHOT.jar
```

The application is available at `http://localhost:8080`.

### Configuration

The backend port can be changed via:

```bash
java -jar iotdb-profiler-1.0.0-SNAPSHOT.jar --server.port=9090
```

## Project Structure

```
iotdb-profiler/
├── backend/                          # Spring Boot backend
│   ├── pom.xml
│   └── src/main/java/.../profiler/
│       ├── ProfilerApplication.java  # Entry point
│       ├── config/WebConfig.java     # CORS configuration
│       ├── controller/QueryController.java
│       ├── dto/                      # Request/Response records
│       └── service/IoTDBQueryService.java  # JDBC logic
├── frontend/                         # React frontend
│   ├── package.json
│   ├── vite.config.ts                # Vite + API proxy
│   └── src/
│       ├── App.tsx                   # Main layout
│       ├── ThemeContext.tsx           # Dark/Light theme
│       ├── api/queryApi.ts           # Backend API client
│       ├── components/               # UI components
│       │   ├── ConnectionForm.tsx
│       │   ├── QueryEditor.tsx
│       │   ├── JsonImportPanel.tsx
│       │   ├── PlanStatsBanner.tsx
│       │   ├── PlanTree.tsx
│       │   ├── DetailPanel.tsx
│       │   └── nodes/
│       │       ├── OperatorNode.tsx   # Tree node card
│       │       └── FragmentGroup.tsx  # Fragment bounding box
│       ├── utils/
│       │   ├── treeBuilder.ts        # Fragment stitching algorithm
│       │   ├── layoutEngine.ts       # Dagre layout + overlap resolution
│       │   └── colorScale.ts         # Color mapping utilities
│       ├── types/                    # TypeScript type definitions
│       └── i18n/                     # en.json, zh.json
├── CLAUDE.md
└── README.md
```

## API Reference

### POST /api/test-connection

Test connectivity to an IoTDB instance.

**Request body:**
```json
{ "host": "127.0.0.1", "port": 6667, "username": "root", "password": "root" }
```

### POST /api/explain

Execute an EXPLAIN query and return the JSON plan.

**Request body:**
```json
{
  "host": "127.0.0.1", "port": 6667,
  "username": "root", "password": "root",
  "database": "mydb",
  "sql": "SELECT * FROM mytable",
  "mode": "EXPLAIN_ANALYZE"
}
```

**mode** values: `EXPLAIN`, `EXPLAIN_ANALYZE`, `EXPLAIN_ANALYZE_VERBOSE`

## License

Apache License 2.0
