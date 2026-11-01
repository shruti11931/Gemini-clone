const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY

// Free models change often on OpenRouter. "openrouter/free" auto-picks a working free model.
// Override with VITE_TEXT_MODELS / VITE_VISION_MODELS (comma-separated) in .env if needed.
const parseList = (v, fallback) =>
    v ? v.split(',').map(s => s.trim()).filter(Boolean) : fallback

const TEXT_MODELS = parseList(import.meta.env.VITE_TEXT_MODELS, [
    "openrouter/free",
    "meta-llama/llama-3.3-70b-instruct:free",
    "openai/gpt-oss-120b:free",
    "nvidia/nemotron-3-super-120b-a12b:free",
])
const VISION_MODELS = parseList(import.meta.env.VITE_VISION_MODELS, [
    "openrouter/free",
    "google/gemma-4-31b-it:free",
    "nvidia/nemotron-nano-12b-v2-vl:free",
])

export const sendPrompt = async (prompt, history = [], image = null, pdfText = null, signal = undefined) => {
    if (!OPENROUTER_API_KEY) {
        throw new Error("Missing API key. Create a .env file with VITE_OPENROUTER_API_KEY=your_key, then restart `npm run dev`.")
    }

    const messages = history.map(({ role, content }) => ({ role, content }))

    if (image) {
        messages.push({
            role: "user",
            content: [
                { type: "image_url", image_url: { url: `data:image/jpeg;base64,${image}` } },
                { type: "text", text: prompt || "What is in this image?" }
            ]
        })
    } else if (pdfText) {
        messages.push({
            role: "user",
            content: `The user has uploaded a PDF document. Use its content below to answer their question.\n\n--- PDF CONTENT START ---\n${pdfText}\n--- PDF CONTENT END ---\n\nUser's question: ${prompt || "Summarize this document."}`
        })
    } else {
        messages.push({ role: "user", content: prompt })
    }

    const modelsToTry = image ? VISION_MODELS : TEXT_MODELS
    let lastError = "unknown error"

    for (const model of modelsToTry) {
        try {
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                signal,
                headers: {
                    "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json",
                    "HTTP-Referer": window.location.origin,
                    "X-Title": "Gemini Clone",
                },
                body: JSON.stringify({ model, messages })
            })

            const data = await response.json().catch(() => ({}))

            if (response.status === 401) {
                throw new Error("Invalid or missing OpenRouter API key (401). Check your .env file.")
            }

            const content = data?.choices?.[0]?.message?.content
            if (data.error || !response.ok || !content) {
                lastError = data?.error?.message || `HTTP ${response.status}`
                console.warn(`${model} failed:`, lastError)
                continue
            }

            return content
        } catch (err) {
            if (err.name === "AbortError") throw err
            if (err.message.includes("API key")) throw err
            lastError = err.message
            console.warn(`${model} threw:`, err.message)
        }
    }

    throw new Error(`All models failed. Last error: ${lastError}`)
}
