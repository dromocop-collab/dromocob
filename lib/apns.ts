import { connect } from "node:http2";
import { createPrivateKey, sign } from "node:crypto";

type APNSEnvironment = "sandbox" | "production";

type APNSMessage = {
  token: string;
  topic: string;
  environment: APNSEnvironment;
  title: string;
  body: string;
  deepLink?: string;
};

let cachedJWT: { value: string; createdAt: number } | null = null;

function base64url(value: string | Buffer) {
  return Buffer.from(value).toString("base64url");
}

function providerToken() {
  const teamId = process.env.APNS_TEAM_ID;
  const keyId = process.env.APNS_KEY_ID;
  const privateKey = process.env.APNS_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!teamId || !keyId || !privateKey) throw new Error("APNS_NOT_CONFIGURED");

  const now = Math.floor(Date.now() / 1000);
  if (cachedJWT && now - cachedJWT.createdAt < 45 * 60) return cachedJWT.value;
  const header = base64url(JSON.stringify({ alg: "ES256", kid: keyId }));
  const claims = base64url(JSON.stringify({ iss: teamId, iat: now }));
  const unsigned = `${header}.${claims}`;
  const signature = sign("sha256", Buffer.from(unsigned), {
    key: createPrivateKey(privateKey),
    dsaEncoding: "ieee-p1363",
  });
  cachedJWT = { value: `${unsigned}.${base64url(signature)}`, createdAt: now };
  return cachedJWT.value;
}

export async function sendAPNS(message: APNSMessage) {
  const authorization = providerToken();
  const origin = message.environment === "sandbox"
    ? "https://api.sandbox.push.apple.com"
    : "https://api.push.apple.com";
  const client = connect(origin);
  const payload = JSON.stringify({
    aps: {
      alert: { title: message.title, body: message.body },
      sound: "default",
      badge: 1,
      "mutable-content": 1,
    },
    app_id: message.topic,
    ...(message.deepLink ? { deep_link: message.deepLink } : {}),
  });

  return await new Promise<{ ok: boolean; status: number; reason?: string }>((resolve, reject) => {
    client.once("error", reject);
    const request = client.request({
      ":method": "POST",
      ":path": `/3/device/${message.token}`,
      authorization: `bearer ${authorization}`,
      "apns-topic": message.topic,
      "apns-push-type": "alert",
      "apns-priority": "10",
      "content-type": "application/json",
    });
    let status = 0;
    let response = "";
    request.setEncoding("utf8");
    request.on("response", headers => { status = Number(headers[":status"] || 0); });
    request.on("data", chunk => { response += chunk; });
    request.on("end", () => {
      client.close();
      let reason: string | undefined;
      try { reason = (JSON.parse(response) as { reason?: string }).reason; } catch {}
      resolve({ ok: status === 200, status, reason });
    });
    request.on("error", error => { client.close(); reject(error); });
    request.end(payload);
  });
}
