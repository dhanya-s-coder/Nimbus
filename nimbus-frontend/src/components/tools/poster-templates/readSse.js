export async function readSse(response, onEvent) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const chunks = buffer.split("\n\n");
        buffer = chunks.pop() || "";

        for (const chunk of chunks) {
            if (!chunk.trim()) continue;
            let event = "message";
            const dataLines = [];

            for (const line of chunk.split("\n")) {
                if (line.startsWith("event:")) event = line.slice(6).trim();
                if (line.startsWith("data:")) dataLines.push(line.slice(5).trim());
            }

            if (!dataLines.length) continue;
            onEvent(event, JSON.parse(dataLines.join("")));
        }
    }
}
