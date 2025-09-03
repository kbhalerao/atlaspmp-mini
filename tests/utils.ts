// Utility for making requests to the unified /db endpoint
export async function unifiedApiRequest(payload: any) {
	const res = await fetch('http://localhost:5173/db', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload)
	});
	const jsonRes = await res.json();
	if (jsonRes.status === 'error') {
		// Print error for debugging
		// eslint-disable-next-line no-console
		console.error('API Error:', jsonRes.error?.message, '\nPayload:', payload);
	}
	return jsonRes;
}
