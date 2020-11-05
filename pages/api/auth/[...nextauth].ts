import NextAuth, { InitOptions } from 'next-auth'
import { NextApiRequest, NextApiResponse } from 'next'

const options: InitOptions = {
  providers: [{
    id: 'google-extended',
    name: 'Google',
    type: 'oauth',
    version: '2.0',
    scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/drive',
    params: {
      grant_type: 'authorization_code',
      include_granted_scopes: 'true'
    },
    accessTokenUrl: 'https://accounts.google.com/o/oauth2/token',
    requestTokenUrl: 'https://accounts.google.com/o/oauth2/auth',
    authorizationUrl: 'https://accounts.google.com/o/oauth2/auth?response_type=code',
    profileUrl: 'https://www.googleapis.com/oauth2/v1/userinfo?alt=json',
    profile: (profile) => {
      return {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        image: profile.picture
      }
    },
    clientId: process.env.NEXTAUTH_GOOGLE_ID,
    clientSecret: process.env.NEXTAUTH_GOOGLE_SECRET
  }
  // 'include_granted_scopes=true&' +
  //       'response_type=code&' +
  //       'prompt=consent&' +
  //       'access_type=offline'
  ],

  pages: {
    error: '/auth/error' // Error code passed in query string as ?error=
  },

  session: {
    // Use JSON Web Tokens for session instead of database sessions.
    jwt: true,
    // Seconds - How long until an idle session expires and is no longer valid.
    maxAge: 24 * 60 * 60, // 24 hours
  },

  jwt: {
    secret: process.env.NEXTAUTH_JWT_SECRET,
    encryption: true,
  },

  callbacks: {
    signIn: async (user, account, profile) => {
      console.log('signIn', user, account, profile)
      return Promise.resolve(true);
    },
    jwt: async (token, user, account, profile) => {
       // when user comes back after SignIn, we make sure to save the accessToken from
      // the logged user, otherwise it would be discarded. We need to make API calls to Google API
      // on behalf of the logged user, so here we persist the token, since its gonna be needed.
      if (user && account && account.provider === 'google-extended') {
        token.username = profile.login; // save the Google username
        token.accessToken = account.accessToken; // get the Google accessToken from the user who signed in
      }
      return Promise.resolve(token);
    }
  }
}

export default (req: NextApiRequest, res: NextApiResponse) => NextAuth(req, res, options)