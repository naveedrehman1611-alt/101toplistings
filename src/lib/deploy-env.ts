/**
 * Which kind of deployment this process belongs to, on any host.
 *
 * - `DEPLOY_ENV` is set by hand where the platform gives no signal of its own
 *   (a VPS: `DEPLOY_ENV=production`), and wins everywhere.
 * - Vercel sets `VERCEL_ENV` (production / preview / development).
 * - Netlify sets `CONTEXT` (production / deploy-preview / branch-deploy / dev)
 *   alongside `NETLIFY=true`. It is guaranteed during the build; at runtime set
 *   `DEPLOY_ENV` in the Production context to be sure.
 *
 * Undefined means local or unknown: callers treat that as "not production".
 */
export type DeployEnv = 'production' | 'preview';

export function deployEnv(): DeployEnv | undefined {
  const pick = (v: string | undefined) =>
    v ? (v === 'production' ? 'production' : 'preview') : undefined;
  return (
    pick(process.env.DEPLOY_ENV) ??
    pick(process.env.VERCEL_ENV) ??
    (process.env.NETLIFY === 'true' ? pick(process.env.CONTEXT) : undefined)
  );
}

export const isProductionDeploy = () => deployEnv() === 'production';
