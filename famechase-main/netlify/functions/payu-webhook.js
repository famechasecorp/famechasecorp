const handler = async (event) => {
    // Handle CORS
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
    };

    // Handle OPTIONS preflight
    if (event.httpMethod === "OPTIONS") {
        return { statusCode: 200, headers };
    }

    // Log the incoming payload
    console.log("Received payload:", JSON.stringify(event.body));

    // Store in Supabase if env vars are set
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/purchases`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            },
            body: JSON.stringify(event.body),
        });
        if (!response.ok) {
            // Fallback to orders if purchases fail
            await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                },
                body: JSON.stringify(event.body),
            });
        }
    }

    return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: "OK" }),
    };
};

export { handler };