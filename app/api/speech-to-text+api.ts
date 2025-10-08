import { GoogleGenerativeAI } from '@google/generative-ai';

interface ExpoFormData extends FormData {
  get(name: string): FormDataEntryValue | null;
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData() as unknown as ExpoFormData;
    const transcript = formData.get('transcript') as string;
    const accountsStr = formData.get('accounts') as string;
    const transactionType = formData.get('type') as string || 'expense';

    if (!transcript) {
      return Response.json(
        { error: 'No transcript provided' },
        { status: 400 }
      );
    }

    // Parse accounts if provided
    let accounts = [];
    if (accountsStr) {
      try {
        accounts = JSON.parse(accountsStr);
      } catch (e) {
        console.warn('Failed to parse accounts:', e);
      }
    }

    // Initialize Gemini AI
    const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    // Create comprehensive prompt for transaction parsing
    const accountsList = accounts.length > 0
      ? `Available accounts: ${accounts.map((a: any) => `${a.name} (${a.type})`).join(', ')}`
      : '';

    const now = new Date();
    const today = now.toISOString().split('T')[0]; // Current date in YYYY-MM-DD format
    const currentTime = now.toTimeString().split(' ')[0].substring(0, 5); // HH:MM format

    const prompt = `You are an AI assistant helping to parse voice input for a ${transactionType} transaction.

User said: "${transcript}"

Current date: ${today}
Current time: ${currentTime}

${accountsList}

IMPORTANT SYSTEM CONTEXT:
- Our app uses a universal party system for transactions
- For EXPENSES: from_party = account name, to_party = merchant/business name
- For INCOME: from_party = income source/payer, to_party = account name
- Date field stores full timestamp including time (YYYY-MM-DDTHH:MM:SS format)
- If user mentions a specific time, extract it; otherwise use current time (${currentTime})

Extract the following information and return it as a JSON object:
{
  "amount": "the numeric amount without currency symbol",
  "description": "a clear description of what the transaction was for",
  "merchant": "the business or person name if mentioned",
  "category": "appropriate category (e.g., Food, Transport, Shopping, Entertainment, Bills, Healthcare, etc.)",
  "account": "the account name if mentioned, otherwise empty string",
  "date": "YYYY-MM-DD format (use ${today} unless user mentions specific date)",
  "time": "HH:MM in 24-hour format (extract if mentioned, else use ${currentTime})",
  "confidence": "your confidence level (0.0-1.0) in the parsed data"
}

Rules:
- Extract the amount as a plain number (e.g., "50" not "$50")
- If no merchant is explicitly mentioned, leave it empty
- Choose the most appropriate category based on the description
- If an account is mentioned and matches one from the available accounts, use that account name
- For income transactions, use categories like "Salary", "Freelance", "Gift", "Investment", etc.
- Be intelligent about context (e.g., "lunch at Chipotle" → merchant: "Chipotle", category: "Food")
- ALWAYS use today's date (${today}) unless user specifically mentions a different date
- Extract time if mentioned (e.g., "at 2pm", "this morning"), otherwise use current time (${currentTime})

Return ONLY the JSON object, no additional text.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Extract JSON from response
    let parsedDetails;
    try {
      // Try to parse the response as JSON
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedDetails = JSON.parse(jsonMatch[0]);
      } else {
        parsedDetails = JSON.parse(text);
      }
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', parseError);
      return Response.json(
        { error: 'Failed to parse AI response' },
        { status: 500 }
      );
    }

    // Combine date and time into ISO timestamp
    const dateStr = parsedDetails.date || today;
    const timeStr = parsedDetails.time || currentTime;
    const fullDateTime = `${dateStr}T${timeStr}:00`; // Add seconds for full ISO format

    return Response.json({
      originalTranscript: transcript,
      parsedDetails: {
        amount: parsedDetails.amount || '',
        description: parsedDetails.description || '',
        merchant: parsedDetails.merchant || '',
        category: parsedDetails.category || '',
        account: parsedDetails.account || '',
        date: fullDateTime, // Full ISO timestamp with date and time
      },
      confidence: parsedDetails.confidence || 0.85,
      transcript: transcript, // Return the transcript for compatibility
    });

  } catch (error) {
    console.error('❌ Speech-to-text error:', error);
    return Response.json(
      {
        error: 'Failed to process speech input',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
