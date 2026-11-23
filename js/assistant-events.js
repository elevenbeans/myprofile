// Pure NDJSON stream parser for the AI assistant's event protocol.
//
// The NAS `/api/profile-chat` endpoint (when the client negotiates
// `Accept: application/x-ndjson`) emits one JSON object per line:
//
//   { "type": "tool_call",   "id": "...", "name": "...", "args": {...} }
//   { "type": "tool_result", "id": "...", "ok": true, "summary": "...", "ms": 3 }
//   { "type": "text",        "value": "..." }
//   { "type": "error",       "message": "..." }
//   { "type": "done" }
//
// This module has no DOM or network dependencies so it can be tested with
// plain Node. Malformed lines are ignored: one bad line must not kill the
// rest of an in-flight answer.

export function createEventStreamParser() {
  let buffer = '';

  return {
    /**
     * Feed a decoded chunk. Returns every event completed by this chunk.
     * A trailing partial line stays buffered until the next chunk or flush().
     */
    push(chunk) {
      if (typeof chunk !== 'string' || chunk.length === 0) return [];
      buffer += chunk;

      const events = [];
      let newline = buffer.indexOf('\n');
      while (newline !== -1) {
        const line = buffer.slice(0, newline).trim();
        buffer = buffer.slice(newline + 1);
        if (line) {
          try {
            events.push(JSON.parse(line));
          } catch (err) {
            // Ignore a malformed line and keep parsing the next one.
          }
        }
        newline = buffer.indexOf('\n');
      }
      return events;
    },

    /** Parse a final line that arrived without a trailing newline. */
    flush() {
      const line = buffer.trim();
      buffer = '';
      if (!line) return [];
      try {
        return [JSON.parse(line)];
      } catch (err) {
        return [];
      }
    },
  };
}
