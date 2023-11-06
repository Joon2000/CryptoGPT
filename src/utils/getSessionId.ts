export const getSessionId = async () => {
  const response = await fetch("/api/sessionId", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  const newSessionId = await response.json();
  return newSessionId.sessionId;
};
