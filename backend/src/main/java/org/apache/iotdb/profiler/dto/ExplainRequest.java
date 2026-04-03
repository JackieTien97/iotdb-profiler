package org.apache.iotdb.profiler.dto;

public record ExplainRequest(
        String host,
        int port,
        String username,
        String password,
        String database,
        String sql,
        String mode // EXPLAIN, EXPLAIN_ANALYZE, EXPLAIN_ANALYZE_VERBOSE
) {
    public ExplainRequest {
        if (host == null || host.isBlank()) host = "127.0.0.1";
        if (port <= 0) port = 6667;
        if (username == null || username.isBlank()) username = "root";
        if (password == null || password.isBlank()) password = "root";
        if (mode == null || mode.isBlank()) mode = "EXPLAIN";
    }
}
