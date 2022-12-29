import admin from 'firebase-admin';
import { serviceAccount, serviceAccountDev } from './constants';

admin.initializeApp({ credential: admin.credential.cert(process.env.APP_ENV === 'production' ? serviceAccount : serviceAccountDev) });

export const adminAuth = admin;
