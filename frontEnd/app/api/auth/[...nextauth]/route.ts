import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";


export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: 'jwt' as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async session({ session, token }: { session: any; token: any }) {
      if (token?.sub) session.user.id = token.sub;
      return session;
    },
  },
  // Uncomment if you have a custom login page:
  // pages: {
  //   signIn: '/login',
  // },
};

const handler = NextAuth(authOptions);
export const GET = handler;
export const POST = handler;
