export const deleteSessionId = async (sessionId: string) => {
  const response = await fetch("/api/deleteSessionId", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId: sessionId }),
  });
  const message = await response.json();
  console.log(message.message);
};
