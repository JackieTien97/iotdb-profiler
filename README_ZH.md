# IoTDB 查询计划可视化工具

一个基于 Web 的 Apache IoTDB 表模型查询执行计划可视化工具。连接到任意 IoTDB 实例，执行 SQL 查询，交互式探索分布式执行计划树。也可以直接粘贴或上传 `EXPLAIN` 命令的 JSON 输出进行可视化，无需数据库连接。

灵感来自 [PEV2](https://github.com/dalibo/pev2)（PostgreSQL Explain Visualizer），但专为 IoTDB 的分布式架构设计，支持多分片计划可视化。

> **注意**：本工具需要 IoTDB 支持 `EXPLAIN (FORMAT JSON)` 语法。该功能由 [apache/iotdb#17430](https://github.com/apache/iotdb/pull/17430) 引入，请确保您使用的 IoTDB 版本已合入该 PR。

## 界面截图

### 深色模式 — EXPLAIN ANALYZE 分片可视化
![深色模式 - 执行分析](docs/images/dark-analyze.png)

### 深色模式 — 连线粗细与跨节点 / 节点内通信
![深色模式 - 连线特性](docs/images/dark-edge-features.png)

### 深色模式 — JSON 导入模式
![深色模式 - JSON 导入](docs/images/dark-json-import.png)

### 深色模式 — 节点详情面板
![深色模式 - 详情面板](docs/images/dark-detail.png)

### 浅色模式 — EXPLAIN ANALYZE
![浅色模式 - 执行分析](docs/images/light-analyze.png)

### 浅色模式 — 节点详情面板
![浅色模式 - 详情面板](docs/images/light-detail.png)

## 功能特性

- **三种分析模式**：`EXPLAIN`、`EXPLAIN ANALYZE` 和 `EXPLAIN ANALYZE VERBOSE`
- **JSON 导入**：直接粘贴 JSON 文本或上传 `.json` 文件，无需连接 IoTDB 实例即可可视化执行计划
- **分布式计划可视化**：自动将多个查询分片实例拼接为统一的执行计划树
- **分片区域框**：虚线边框标注每个查询分片的边界，显示 DataRegion 和 IP 信息
- **连线粗细反映数据量**：连线宽度按输出行数对数缩放，数据流瓶颈一目了然
- **跨节点 vs 节点内通信**：交换链路可视区分 — **RPC**（跨节点，橙色虚线，带动画）vs **Local**（节点内内存队列，绿色点线）— 一眼看出哪些分片边界涉及网络序列化/反序列化开销
- **交互式树形图**：支持平移、缩放、小地图导航，点击节点查看详情（基于 React Flow）
- **性能指标**：CPU 时间、输出行数、内存使用量，并以颜色编码热力图展示（绿色 → 琥珀色 → 红色）
- **计划统计横幅**：堆叠条形图展示各规划阶段的耗时分布
- **深色 / 浅色主题**：一键切换，自动保存偏好
- **国际化**：支持中英文界面切换

## 技术栈

| 层级 | 技术 |
|------|-----|
| 后端 | Spring Boot 3.4、Java 21、Maven |
| 数据库连接 | Apache IoTDB JDBC 2.0.x |
| 前端 | React 19、TypeScript、Vite |
| 可视化 | React Flow 12、Dagre |
| 样式 | Tailwind CSS 4 |
| 编辑器 | Monaco Editor |

## 前置条件

- Java 21+
- Node.js 18+
- Maven 3.8+
- Apache IoTDB 2.0.x 已启动并可访问
- IoTDB JDBC 驱动已安装到本地 Maven 仓库

### 安装 IoTDB JDBC 驱动

如果使用从源码编译的 IoTDB：

```bash
cd /path/to/iotdb
mvn install -pl iotdb-client/jdbc -am -DskipTests
```

如果使用已发布版本，请修改 `backend/pom.xml` 中的 `<iotdb.version>` 为对应版本号（如 `2.0.7`）。

## 快速开始

### 1. 启动后端

```bash
cd backend
mvn spring-boot:run
```

后端运行在 `http://localhost:8080`。

### 2. 启动前端

```bash
cd frontend
npm install
npm run dev
```

前端运行在 `http://localhost:5173`，API 请求会自动代理到后端。

### 3. 使用应用

#### 查询模式（连接 IoTDB）

1. 打开 `http://localhost:5173`
2. 在左侧边栏选择 **查询** 模式
3. 输入 IoTDB 连接信息（默认：`127.0.0.1:6667`，`root/root`）
4. 输入数据库名和 SQL 查询语句
5. 选择分析模式，点击 **执行**
6. 探索执行计划树 —— 点击节点查看详细信息

#### JSON 导入模式（无需数据库）

1. 打开 `http://localhost:5173`
2. 在左侧边栏选择 **JSON 导入** 模式
3. 将 `EXPLAIN (FORMAT JSON)` 或 `EXPLAIN ANALYZE (FORMAT JSON)` 的输出粘贴到编辑器中，或点击 **上传 .json 文件** 从文件加载
4. 点击 **可视化** —— 工具会自动检测 JSON 类型（EXPLAIN 或 EXPLAIN ANALYZE）
5. 像往常一样探索执行计划树

## 生产环境部署

### 构建

```bash
# 构建前端
cd frontend
npm install
npm run build

# 复制前端构建产物到后端静态资源目录
cp -r dist/* ../backend/src/main/resources/static/

# 构建后端 JAR 包
cd ../backend
mvn package -DskipTests
```

### 运行

```bash
java -jar backend/target/iotdb-profiler-1.0.0-SNAPSHOT.jar
```

应用运行在 `http://localhost:8080`。

### 配置

可通过命令行参数修改后端端口：

```bash
java -jar iotdb-profiler-1.0.0-SNAPSHOT.jar --server.port=9090
```

## 项目结构

```
iotdb-profiler/
├── backend/                          # Spring Boot 后端
│   ├── pom.xml
│   └── src/main/java/.../profiler/
│       ├── ProfilerApplication.java  # 启动入口
│       ├── config/WebConfig.java     # CORS 配置
│       ├── controller/QueryController.java
│       ├── dto/                      # 请求/响应数据类
│       └── service/IoTDBQueryService.java  # JDBC 逻辑
├── frontend/                         # React 前端
│   ├── package.json
│   ├── vite.config.ts                # Vite 配置 + API 代理
│   └── src/
│       ├── App.tsx                   # 主布局
│       ├── ThemeContext.tsx           # 深色/浅色主题
│       ├── api/queryApi.ts           # 后端 API 客户端
│       ├── components/               # UI 组件
│       │   ├── ConnectionForm.tsx    # 连接配置表单
│       │   ├── QueryEditor.tsx       # SQL 编辑器
│       │   ├── JsonImportPanel.tsx   # JSON 导入面板
│       │   ├── PlanStatsBanner.tsx   # 计划统计横幅
│       │   ├── PlanTree.tsx          # 计划树画布
│       │   ├── DetailPanel.tsx       # 节点详情面板
│       │   └── nodes/
│       │       ├── OperatorNode.tsx   # 算子节点卡片
│       │       └── FragmentGroup.tsx  # 分片区域框
│       ├── utils/
│       │   ├── treeBuilder.ts        # 分片拼接算法
│       │   ├── layoutEngine.ts       # Dagre 布局 + 重叠消除
│       │   └── colorScale.ts         # 颜色映射工具
│       ├── types/                    # TypeScript 类型定义
│       └── i18n/                     # 国际化（en.json、zh.json）
├── CLAUDE.md
├── README.md
└── README_ZH.md
```

## API 接口

### POST /api/test-connection

测试与 IoTDB 实例的连接。

**请求体：**
```json
{ "host": "127.0.0.1", "port": 6667, "username": "root", "password": "root" }
```

### POST /api/explain

执行 EXPLAIN 查询并返回 JSON 格式的执行计划。

**请求体：**
```json
{
  "host": "127.0.0.1", "port": 6667,
  "username": "root", "password": "root",
  "database": "mydb",
  "sql": "SELECT * FROM mytable",
  "mode": "EXPLAIN_ANALYZE"
}
```

**mode** 可选值：`EXPLAIN`、`EXPLAIN_ANALYZE`、`EXPLAIN_ANALYZE_VERBOSE`

## 开源协议

Apache License 2.0
