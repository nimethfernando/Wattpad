import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const providers = [
  GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID || "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    authorization: {
      params: {
        prompt: "select_account",
        access_type: "offline",
        response_type: "code"
      }
    }
  }),
];

const handler = NextAuth({
  providers,
  secret: process.env.NEXTAUTH_SECRET || "ditya-group-jwt-secret-key-at-least-32-chars-random-production",
  trustHost: true,
  pages: {
    signIn: '/login',
    error: '/login',
  },
  cookies: {
    pkceCodeVerifier: {
      name: 'next-auth.pkce.code_verifier',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 900,
      },
    },
    state: {
      name: 'next-auth.state',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 900,
      },
    },
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      const canonicalBase = (process.env.NODE_ENV === 'production' && !baseUrl.includes('localhost'))
        ? 'https://www.avoralibrary.com'
        : baseUrl;

      if (url.startsWith("/")) return `${canonicalBase}${url}`;
      try {
        const parsedUrl = new URL(url);
        if (
          parsedUrl.origin === baseUrl ||
          parsedUrl.origin === 'https://www.avoralibrary.com' ||
          parsedUrl.hostname.includes('avoralibrary.com') ||
          parsedUrl.hostname.includes('vercel.app')
        ) {
          if (process.env.NODE_ENV === 'production' && !parsedUrl.hostname.includes('localhost')) {
            return `https://www.avoralibrary.com${parsedUrl.pathname}${parsedUrl.search}`;
          }
          return url;
        }
      } catch (e) {}
      return canonicalBase;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };