package org.apache.iotdb.profiler.controller;

import org.apache.iotdb.profiler.service.IoTDBQueryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;
import java.util.Map;

import org.apache.iotdb.profiler.dto.ExplainRequest;
import org.apache.iotdb.profiler.dto.ExplainResponse;

import java.sql.SQLException;

@RestController
@RequestMapping("/api")
public class QueryController {

    private final IoTDBQueryService queryService;

    public QueryController(IoTDBQueryService queryService) {
        this.queryService = queryService;
    }

    @PostMapping("/test-connection")
    public ResponseEntity<Map<String, Object>> testConnection(@RequestBody ExplainRequest request) {
        try {
            queryService.testConnection(request.host(), request.port(), request.username(), request.password());
            return ResponseEntity.ok(Map.of("success", true, "message", "Connection successful"));
        } catch (SQLException e) {
            return ResponseEntity.ok(Map.of("success", false, "message", extractMessage(e)));
        }
    }

    @PostMapping("/explain")
    public ResponseEntity<ExplainResponse> explain(@RequestBody ExplainRequest request) {
        try {
            String planJson = queryService.executeExplain(request);
            return ResponseEntity.ok(ExplainResponse.ok(planJson, request.mode()));
        } catch (SQLException e) {
            return ResponseEntity.ok(ExplainResponse.fail(extractMessage(e)));
        } catch (Exception e) {
            return ResponseEntity.ok(ExplainResponse.fail("Unexpected error: " + e.getMessage()));
        }
    }

    @PostMapping("/execute")
    public ResponseEntity<Map<String, Object>> executeSql(@RequestBody ExplainRequest request) {
        try {
            String url = String.format("jdbc:iotdb://%s:%d/?sql_dialect=table", request.host(), request.port());
            try (Connection conn = DriverManager.getConnection(url, request.username(), request.password());
                 Statement stmt = conn.createStatement()) {
                if (request.database() != null && !request.database().isBlank()) {
                    stmt.execute("USE " + request.database());
                }
                stmt.execute(request.sql());
                return ResponseEntity.ok(Map.of("success", true, "message", "SQL executed successfully"));
            }
        } catch (SQLException e) {
            return ResponseEntity.ok(Map.of("success", false, "message", extractMessage(e)));
        }
    }

    private String extractMessage(SQLException e) {
        String msg = e.getMessage();
        if (msg != null && msg.contains(":")) {
            int idx = msg.lastIndexOf(": ");
            if (idx > 0 && idx < msg.length() - 2) {
                return msg.substring(idx + 2);
            }
        }
        return msg != null ? msg : "Unknown SQL error";
    }
}
