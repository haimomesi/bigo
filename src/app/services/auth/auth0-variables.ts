
import { environment } from '../../../environments/environment';

interface AuthConfig {
    CLIENT_ID: string;
    CLIENT_DOMAIN: string;
    AUDIENCE: string;
    REDIRECT: string;
    SCOPE: string;
  }
  
  export const AUTH_CONFIG: AuthConfig = {
    CLIENT_ID: 'XVWlftm8g129ovnJjdlenZYMnUQMCML7',
    CLIENT_DOMAIN: 'bigocommerce.auth0.com',
    AUDIENCE: 'https://auth.bigocommerce.com/',
    REDIRECT: environment.redirectCallback,
    SCOPE: 'openid profile'
  };