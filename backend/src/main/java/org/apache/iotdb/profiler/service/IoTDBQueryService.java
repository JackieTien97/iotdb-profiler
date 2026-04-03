package org.apache.iotdb.profiler.service;

import org.apache.iotdb.profiler.dto.ExplainRequest;
import org.springframework.stereotype.Service;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

@Service
public class IoTDBQueryService {

    static {
        try {
            Class.forName("org.apache.iotdb.jdbc.IoTDBDriver");
        } catch (ClassNotFoundException e) {
            throw new RuntimeException("IoTDB JDBC driver not found", e);
        }
    }

    public void testConnection(String host, int port, String username, String password) throws SQLException {
        String url = buildUrl(host, port);
        try (Connection conn = DriverManager.getConnection(url, username, password);
             Statement stmt = conn.createStatement()) {
            stmt.execute("SHOW DATABASES");
        }
    }

    public String executeExplain(ExplainRequest request) throws SQLException {
        String url = buildUrl(request.host(), request.port());
        try (Connection conn = DriverManager.getConnection(url, request.username(), request.password());
             Statement stmt = conn.createStatement()) {

            if (request.database() != null && !request.database().isBlank()) {
                stmt.execute("USE " + request.database());
            }

            String explainSql = buildExplainSql(request.sql(), request.mode());
            ResultSet rs = stmt.executeQuery(explainSql);

            StringBuilder json = new StringBuilder();
            while (rs.next()) {
                json.append(rs.getString(1));
            }
            return json.toString();
        }
    }

    private String buildUrl(String host, int port) {
        return String.format("jdbc:iotdb://%s:%d/?sql_dialect=table", host, port);
    }

    private String buildExplainSql(String sql, String mode) {
        return switch (mode) {
            case "EXPLAIN_ANALYZE" -> "EXPLAIN ANALYZE (FORMAT JSON) " + sql;
            case "EXPLAIN_ANALYZE_VERBOSE" -> "EXPLAIN ANALYZE VERBOSE (FORMAT JSON) " + sql;
            default -> "EXPLAIN (FORMAT JSON) " + sql;
        };
    }
}
