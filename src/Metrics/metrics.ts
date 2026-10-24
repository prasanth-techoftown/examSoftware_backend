import client, { Histogram } from 'prom-client'

/**
 * Collect default Node.js metrics
 * CPU, memory, event loop lag, GC, etc.
 */
client.collectDefaultMetrics({
    prefix: 'vilora_',
})

/**
 * HTTP request latency histogram
 */
export const httpRequestDuration: Histogram<string> = new client.Histogram({
    name: 'http_request_duration_seconds',
    help: 'HTTP request latency in seconds',
    labelNames: ['method', 'route', 'status'],
    buckets: [0.05, 0.1, 0.2, 0.3, 0.5, 1, 2, 5],
})

/**
 *
 * Export prom-client instance
 */
export { client }
