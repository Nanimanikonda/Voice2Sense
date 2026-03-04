// Voice2Sense - DEBUG VERSION
// Use this to see exact errors in the Logs tab

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const languageNames: Record<string, string> = {
  en: "English", hi: "Hindi", te: "Telugu", ta: "Tamil", kn: "Kannada",
  ml: "Malayalam", mr: "Marathi", bn: "Bengali", gu: "Gujarati",
  pa: "Punjabi", or: "Odia", as: "Assamese",
};

Deno.serve(async (req) => {
  console.log("--- New Request Received ---"); // Log 1

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log("Request Body:", JSON.stringify(body)); // Log 2: Check if text is actually arriving

    const { text, sourceLanguage, targetLanguages } = body;

    if (!text || !targetLanguages || targetLanguages.length === 0) {
      console.error("Error: Missing text or targetLanguages in request body.");
      return new Response(
        JSON.stringify({ error: "Missing text or target languages" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiKey = Deno.env.get("GEMINI_API_KEY"); 
    if (!apiKey) {
      console.error("CRITICAL ERROR: GEMINI_API_KEY is not found in Secrets."); // Log 3
      throw new Error("API Key not configured.");
    }
    console.log("API Key found. Proceeding to Gemini call..."); // Log 4

    const translations: Record<string, string> = {};

    for (const targetLang of targetLanguages) {
      if (targetLang === sourceLanguage) continue;

      const targetLangName = languageNames[targetLang] || targetLang;
      console.log(`Translating to ${targetLangName}...`); // Log 5

      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Translate this text into ${targetLangName} script only: "${text}"`
            }]
          }]
        }),
      });

      if (!response.ok) {
        const errorDetail = await response.json();
        console.error(`GEMINI API REJECTED REQUEST:`, JSON.stringify(errorDetail)); // Log 6: Very important
        continue;
      }

      const data = await response.json();
      const translatedText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      
      if (translatedText) {
        console.log(`Success: Translated to ${targetLangName}`); // Log 7
        translations[targetLang] = translatedText;
      }
    }

    return new Response(
      JSON.stringify({ translations }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("CATCH BLOCK ERROR:", error.message); // Log 8
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});