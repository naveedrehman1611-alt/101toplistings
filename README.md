This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Sign in with Google

The login and register pages offer "Continue with Google" alongside email/password
(`src/lib/oauth-actions.ts` → Supabase OAuth → `src/app/auth/callback/route.ts`). The
`handle_new_user` trigger (migrations 0010 + 0019) creates the `profiles` row with role `user`,
using Google's name as the display name. To turn it on:

1. **Google Cloud Console** → APIs & Services → OAuth consent screen: configure it (External,
   app name, support email; scopes `openid`, `email`, `profile`).
2. **Credentials → Create credentials → OAuth client ID**, type *Web application*:
   - Authorized JavaScript origins: your site, e.g. `https://rankyousite.vercel.app` and
     `http://localhost:3000`
   - Authorized redirect URI: `https://<project-ref>.supabase.co/auth/v1/callback`
     (this is Supabase's callback, not the site's)
3. **Supabase dashboard** → Authentication → Sign In / Providers → **Google**: enable it and paste
   the Client ID and Client Secret.
4. **Supabase** → Authentication → URL Configuration: Site URL is your site, and Redirect URLs
   include `<site>/auth/callback**` (e.g. `https://rankyousite.vercel.app/auth/callback**` and
   `http://localhost:3000/auth/callback**`). `NEXT_PUBLIC_SITE_URL` must match the site origin,
   since it builds the `redirectTo` URL.
5. Apply `supabase/migrations/0019_profile_from_oauth.sql` in the SQL Editor on an existing
   database (it is also in `full_setup.sql`).

If an email already has a password account, Supabase links the Google identity to it
automatically once the Google email is verified.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
