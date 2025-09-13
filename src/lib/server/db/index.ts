import { drizzle as ldrizzle } from 'drizzle-orm/libsql';
import { drizzle as odrizzle } from 'drizzle-orm/d1';
import { createClient } from '@libsql/client';
import * as schema from './schema';
import { env } from '$env/dynamic/private';

/**
 * Wrapper function to get the db instance. Returns
 * the local db on local, and the Cloudflare D1 db on production
 */
export const get_db = () => {
	console.log('ENV:', env.NODE_ENV);
	if (env.NODE_ENV === 'production' && env.D1) {
		return odrizzle(env.D1);
	}
	if (!env.DATABASE_URL) throw new Error('DATABASE_URL is not set');
	const client = createClient({ url: env.DATABASE_URL });
	return ldrizzle(client, { schema });
};
