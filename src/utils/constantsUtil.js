import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SECRET_JWT = 'CoderSecretSign';
const KEY_COOKIE = 'coderCookie';

export {
    __filename, 
    __dirname,
    SECRET_JWT,
    KEY_COOKIE
};