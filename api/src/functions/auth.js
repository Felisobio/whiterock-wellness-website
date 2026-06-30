const { app } = require('@azure/functions');

app.http('auth', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'auth',
  handler: async (request, context) => {
    const clientId = process.env.GITHUB_CLIENT_ID;
    const redirectUri = `${request.url.split('/api/auth')[0]}/api/callback`;
    const state = Math.random().toString(36).substring(2, 15);

    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=repo,user&state=${state}`;

    return {
      status: 302,
      headers: {
        Location: githubAuthUrl
      }
    };
  }
});
