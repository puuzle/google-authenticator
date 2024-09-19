import { qrCode } from './src/qr-code/qr-code.ts';
import { TOTP } from './src/totp.ts';

declare module 'bun' {
    interface Env {
        HOST: string;
        PORT: string;
        TOTP_NAME: string;
        TOTP_LENGTH: string;
    }
}

const totp = new TOTP({
    name: Bun.env.TOTP_NAME,
    length: TOTP.castLength(Bun.env.TOTP_LENGTH)
});

const textDecoder = new TextDecoder();

Bun.serve({
    hostname: Bun.env.HOST,
    port: Number(Bun.env.PORT),
    async fetch(req) {
        if (req.method === 'GET') {
            if (req.url === this.url.href) {
                return new Response(Bun.file('./index.html'));
            }
        }
        if (req.method === 'POST') {
            if (req.url === this.url.href + 'generate') {
                const secretKey = totp.generateSecretKey();
                const result = qrCode.generate(secretKey.url);
                return new Response(JSON.stringify({
                    qrCodeSVG: qrCode.toSVG(result.frame, result.width, 5),
                    secretKey: secretKey.base32
                }));
            }
            if (req.url === this.url.href + 'verify') {
                const body = await req.json();
                if (!body || typeof body !== 'object') {
                    return new Response('Bad Request Body', { status: 400 });
                }
                const secretKey = Reflect.get(body, 'secretKey');
                const code = Reflect.get(body, 'code');
                if (typeof secretKey !== 'string' || typeof code !== 'string') {
                    return new Response('Bad Request Body', { status: 400 });
                }
                return new Response(JSON.stringify({
                    matches: await totp.matches(code, secretKey, 'base32')
                }));
            }
        }
        return new Response('Not Found', { status: 404 });
    }
});

console.log(`Listening to ${Bun.env.HOST} on port ${Bun.env.PORT}`);