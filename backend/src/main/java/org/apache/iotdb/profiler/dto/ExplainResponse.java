package org.apache.iotdb.profiler.dto;

public record ExplainResponse(
        boolean success,
        String planJson,
        String error,
        String mode
) {
    public static ExplainResponse ok(String planJson, String mode) {
        return new ExplainResponse(true, planJson, null, mode);
    }

    public static ExplainResponse fail(String error) {
        return new ExplainResponse(false, null, error, null);
    }
}
