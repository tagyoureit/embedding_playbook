import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";

import { Session } from "models";
import { settings } from "settings";

export const authOptions = {
  session: {
    strategy: "jwt",
    maxAge: 2 * 60 * 60, // 2 hours
  },
  providers: [
    CredentialsProvider({
      type: 'credentials',
      id: 'demo-user',
      name: 'Demo User',
      credentials: {
        ID: { label: "ID", type: "text", placeholder: "a, b, c, d or e" },
        tableauUrl: { label: "Tableau URL", type: "text" },
        userName: { label: "User Name", type: "text" },
        email: { label: "email", type: "text" },
        siteName: { label: "Site Name", type: "text" },
        caClientId: { label: "Client ID", type: "text" },
        caSecretId: { label: "Secret ID", type: "text" },
        caSecretValue: { label: "Secret Value", type: "text" },
        isReady: { label: "Is Ready", type: "boolean" }
      },
      async authorize(credentials, req) {
        console.log(`...nextAuth passed credentials: ${JSON.stringify(credentials)}`);

        let user = null;

        if (credentials.isReady) {
          // When isReady is passed, use the provided details
          const rest_session = await initializeSession(credentials, 'rest');

          if (rest_session.authorized) {
            user = {
              name: credentials.userName,
              email: credentials.userName,
              tableau: {
                ...rest_session,
                tableauUrl: credentials.tableauUrl,
                username: credentials.userName,
                site: credentials.siteName,
                // caClientId: credentials.caClientId,
                // caSecretId: credentials.caSecretId,
                // caSecretValue: credentials.caSecretValue,
                isReady: credentials.isReady,

              }
            };
            console.log(`user...`)
            console.log(JSON.stringify(user));
          }
        } else {
          // When isReady is not passed, use stored user data and environment variables
          for (const [key, value] of Object.entries(settings.demo_users)) {
            if (key.toUpperCase() === credentials.ID.toUpperCase()) {
              user = value;
            }
          }

          if (user) {
            const embed_session = await initializeSession(user, 'embed', 'orig');
            const rest_session = await initializeSession(user, 'rest', 'orig');

            if (embed_session.authorized && rest_session.authorized) {
              // frontend requires user_id & embed_token
              const {
                username, user_id, embed_token, site_id, site, created, expires,
              } = embed_session;
              // backend requires rest_id & rest_key
              const { user_id: rest_id, rest_key } = rest_session;
              // add members to a new tableau object in user
              user.tableau = {
                username, user_id, embed_token, rest_id, rest_key, site_id, site, created, expires, 
              };

            }
          }
        }

        return user || false;
      }
    }),
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.tableau = user.tableau;
        token.tableauUrl = user.tableau.tableauUrl;
        // token.userName = user.userName;
        // token.siteName = user.siteName;
        // token.caClientId = user.caClientId;
        // token.caSecretId = user.caSecretId;
        // token.caSecretValue = user.caSecretValue;
        // token.isReady = user.isReady;
      }
      return token;
    },
    async session({ session, token }) {
      session.tableau = token.tableau;
      session.tableau.tableauUrl = token.tableauUrl;
      if (!session.tableau.rest_id) session.tableau.rest_id = session.tableau.user_id; // TODO - this ties in to rest_id being missing in api/metrics/methods.js
      // session.userName = token.userName;
      session.tableau.siteName = token.siteName; // duplicated as site
      // session.caClientId = token.caClientId;
      // session.caSecretId = token.caSecretId;
      // session.caSecretValue = token.caSecretValue;
      // session.isReady = token.isReady;
      session.myVarrrr = 'def';
      return session;
    }
  },
  debug: process.env.NODE_ENV === 'development'
};

async function initializeSession(user, type = 'rest', method = 'new') {
  const clientId = user.isReady === 'true' ? user.caClientId : process.env.TABLEAU_JWT_CLIENT_ID;
  const secret = user.isReady === 'true' ? user.caSecretValue : type === 'rest' ? process.env.TABLEAU_REST_JWT_SECRET : process.env.TABLEAU_EMBED_JWT_SECRET;
  const secretId = user.isReady === 'true' ? user.caSecretId : type === 'rest' ? process.env.TABLEAU_REST_JWT_SECRET_ID : process.env.TABLEAU_EMBED_JWT_SECRET_ID;
  const scopes = type === 'rest' ? [
    "tableau:datasources:read",
    "tableau:workbooks:read",
    "tableau:projects:read",
    "tableau:insight_definitions_metrics:read",
    "tableau:insight_metrics:read",
    "tableau:insights:read",
    "tableau:metric_subscriptions:read",
  ] : [
    "tableau:views:embed",
    "tableau:views:embed_authoring",
    "tableau:insights:embed",
  ];

  const options = {
    jwt_secret: secret,
    jwt_secret_id: secretId,
    jwt_client_id: clientId
  };

  const session = new Session(user);
  if (method === 'orig'){
    await session.jwt(user.email || user.userName, options, scopes);
  }
  else {
    type === 'rest' ?
    await session.restjwt(options, scopes)
    :
    await session.embedjwt(options, scopes);
  }
  return session;
}

export default NextAuth(authOptions);
