/**
 * Unified structured logger for tracking AI failover and request events.
 */
export const logStructured = ({ event, stage, model, success, durationMs, error = null }) => {
  const logObj = {
    event,
    stage,
    model,
    success,
    durationMs,
    timestamp: new Date().toISOString(),
  };
  if (error) {
    logObj.error = typeof error === 'object' ? error.message || String(error) : error;
  }
  console.log(JSON.stringify(logObj));
};
