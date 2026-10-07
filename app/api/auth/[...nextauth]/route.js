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
  callbacks: {
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };