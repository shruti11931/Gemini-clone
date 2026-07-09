const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY
console.log("KEY LOADED:", OPENROUTER_API_KEY ? "yes, length " + OPENROUTER_API_KEY.length : "❌ undefined")


export const sendPrompt = async (prompt, history = [], image = null, pdfText = null) => {
    const messages = []

    for (const item of history) {
        messages.push({ role: item.role, content: item.content })
    }

    if (image) {
        messages.push({
            role: "user",
            content: [
                { type: "image_url", image_url: { url: `data:image/jpeg;base64,${image}` } },
                { type: "text", text: prompt || "What is in this image?" }
            ]
        })
    } else if (pdfText) {
        const combinedPrompt = `The user has uploaded a PDF document. Use its content below to answer their question.\n\n--- PDF CONTENT START ---\n${pdfText}\n--- PDF CONTENT END ---\n\nUser's question: ${prompt || "Summarize this document."}`
        messages.push({ role: "user", content: combinedPrompt })
    } else {
        messages.push({ role: "user", content: prompt })
    }

    const visionModels = [
        "google/gemma-4-31b-it:free",
        "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
        "nvidia/nemotron-nano-12b-v2-vl:free",
    ]
    const textModels = [
        "meta-llama/llama-3.3-70b-instruct:free",
        "nvidia/nemotron-3-super-120b-a12b:free",
        "openai/gpt-oss-120b:free",
        "nousresearch/hermes-3-llama-3.1-405b:free",
    ]

    const modelsToTry = image ? visionModels : textModels

    for (const model of modelsToTry) {
        try {
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json",
                    "HTTP-Referer": "http://localhost:5173",
                },
                body: JSON.stringify({ model, messages })
            })

            const data = await response.json()
            console.log(`✅ [${model}]:`, data)

            if (data.error) {
                console.warn(`⚠️ ${model} failed:`, JSON.stringify(data.error))  // full error object
                continue
            }

            return data.choices[0].message.content

        } catch (err) {
            console.warn(`⚠️ ${model} threw: ${err.message}`)
            continue
        }
    }

    throw new Error("All models failed. Check console for details.")
}