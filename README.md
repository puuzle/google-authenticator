# Google Authenticator
Developed by **Sam Farris**

This project aims to create a library that implements functionality for Google Authenticator and other TOTP based authenticator apps. The library will provide core features for generating secret keys, creating QR codes, and verifying time-based one-time passwords (TOTP). A basic web interface will demonstrate the library's capabilites.
## Library Features
### Secret Key Generation
- Function to generate a cryptographically secure random secret key.
- Utility to encode the secret key in base32 format.
### QR Code Creation
- Function to create a URL containing the secret key and other necessary parameters.
- Utility to generate a QR code SVG from this URL.
### TOTP Functionality
- Implementation of TOTP algorithm to generate codes based on current time and secret key.
- Function to verify user-input codes against the generated TOTP.
## Demo Interface
### index.html
- Simple HTML structure to demonstrate library functions.
- Buttons to trigger library actions.
- Display areas for generated keys, QR codes, and verification results.
### Routing Handler
- Basic Bun server to handle routes demonstrating library functions.
- Endpoints for generating keys, creating QR codes, and verifying TOTP codes.
## Library Usage
*This is not available in npm*
### Generating Secret Key
```ts
import { qrCode } from './dir/to/qr-code.ts';
import { TOTP } from './dir/to/totp.ts';

const totp = new TOTP({
    name: encodeURIComponent('My TOTP'),
    //length of ascii secret key
    length: 32
});

const secretKey = totp.generateSecretKey();
const result = qrCode.generate(secretKey.url);
const scale = 5;
const svg = qrCode.toSVG(result.frame, result.width, scale);
```
### Verifying TOTP
```ts
//retrieve code from input (6 digit string)
//retrieve secretKey from input or database (string or Uint8Array)

//format of secretKey
const encoding: 'ascii' | 'base32' = 'ascii';
const matches = await totp.matches(code, secretKey, encoding);
```
## Demo Interface Setup Steps
1. Download Bun by running the provided command on their [home](https://bun.sh) page.
2. Download or clone this repository.
3. Inside the `google-authenticator` folder run the command `bun .` to start the server at `localhost:8080`.