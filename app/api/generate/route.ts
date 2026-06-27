import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { BomExtractionSchema } from "@/lib/schemas/bomSchema";

// Initialize Gen AI SDK
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const prompt = formData.get("prompt") as string;
    const image = formData.get("image") as File;

    if (!prompt && !image) {
      return NextResponse.json({ error: "Missing prompt or image" }, { status: 400 });
    }

    // 1. Prepare inputs for Gemini
    const contents = [];
    if (image) {
      const buffer = Buffer.from(await image.arrayBuffer());
      contents.push({
        inlineData: {
          data: buffer.toString("base64"),
          mimeType: image.type,
        },
      });
    }
    if (prompt) {
      contents.push({ text: prompt });
    }

    // 2. Call Gemini for Nodal Computation & Extraction
    const response = await ai.models.generateContent({
      model: "gemini-1.5-pro",
      contents: contents,
      config: {
        systemInstruction: `You are an expert Electronics Engineer and System Architect. Your task is to analyze the provided electronic schematic image alongside the user's natural language description.

CRITICAL INSTRUCTIONS:
1. Nodal & Parametric Computation: Analyze the circuit layout and operating voltages. Calculate the required electrical ratings (Voltage, Current, Power dissipation P = V * I) for every discrete component.
2. Smart Component Selection: Select industrial, purchasable components that safely meet or exceed these ratings. If a standard component (e.g., BC547) cannot handle the calculated power dissipation, automatically upgrade it to a robust alternative (e.g., TIP120 or IRFZ44N) and note the reasoning in the specs.
3. Accuracy: Ensure exact part numbers are provided.
4. Alerts: If you detect a missing flyback diode for an inductive load or a voltage logic mismatch (e.g., 5V logic trying to trigger a 3.3V IC without a level shifter), add a compatibility alert.`,
        responseMimeType: "application/json",
        responseSchema: BomExtractionSchema,
      },
    });

    // Parse the structured JSON response
    const extraction = JSON.parse(response.text() || "{}");
    const extractedItems = extraction.items || [];
    
    // 3. Pricing Engine Logic (Placeholder for Step 3)
    const itemsWithPricing = await Promise.all(
      extractedItems.map(async (item: any, index: number) => {
        // [PLACEHOLDER] - To be replaced by actual web search scraping
        
        // Mocking the result of the web search for structure demonstration
        const storeOptions = [
          {
            id: `store-${index}-1`,
            name: `${item.partNumber} Module`,
            storeName: "Makerlab Electronics",
            price: 150.00,
            link: "https://www.makerlab-electronics.com/search?q=" + encodeURIComponent(item.partNumber),
            inStock: true,
            isCheapest: true,
          },
          {
            id: `store-${index}-2`,
            name: item.partNumber,
            storeName: "e-Gizmo",
            price: 165.00,
            link: "https://www.e-gizmo.net/?s=" + encodeURIComponent(item.partNumber),
            inStock: true,
            isCheapest: false,
          }
        ];

        return {
          id: `c-gen-${Date.now()}-${index}`,
          ...item,
          storeOptions,
          // Hydrate the default frontend expectations based on cheapest option
          unitPrice: storeOptions[0].price,
          stock: storeOptions[0].inStock ? "in-stock" : "out",
        };
      })
    );

    // 4. Return the unified multi-store payload
    return NextResponse.json({
      items: itemsWithPricing,
      alerts: extraction.alerts || [],
    });

  } catch (error) {
    console.error("BOM Generation Error:", error);
    return NextResponse.json({ error: "Failed to generate BOM" }, { status: 500 });
  }
}
