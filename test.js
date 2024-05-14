const queryStr = "test下"
fetch(
  "https://api.rag.eve.platform.motiong.com/rag/v1/ask_query",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: queryStr,
    }),
  }
).then((res) => res.json()).then((data) => console.log(data));