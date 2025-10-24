import { login, loginWithGoogle, loginWithApple, signOutFromGoogle } from './KeycloakService';
import api, { setGlobalAuthStateHandler } from './ApiProxy';
import { register } from './AuthService';

export { login, loginWithGoogle, loginWithApple, signOutFromGoogle, api, register, setGlobalAuthStateHandler };
