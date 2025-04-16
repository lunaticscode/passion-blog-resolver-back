const axios = require("axios");

const {
  GOOGLE_CLIENT_ID,
  GOOGLE_REDIRECT_URI,
  GOOGLE_CLIENT_SECRET,
  ALLOWED_EMAILS,
} = require("../consts/oauth");
const { CLIENT_URL } = require("../consts/app");
const { getSignedToken } = require("../utils/token");
const { TOKEN_KEY } = require("../consts/jwt");
const oauthController = require("express").Router();
oauthController.get("/google", async (req, res) => {
  const baseEntryUrl = "https://accounts.google.com/o/oauth2/v2/auth";
  if (
    [GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI].some(
      (v) => !v
    )
  ) {
    return res.status(400).json({
      isError: true,
      message: "(!) Invalid GOOGLE_OAUTH_VARIABLE value",
    });
  }
  const resultUrl = `${baseEntryUrl}?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${GOOGLE_REDIRECT_URI}&response_type=code&scope=email profile`;
  res.redirect(resultUrl);
});

oauthController.get("/google-callback", async (req, res) => {
  const { code } = req.query;

  const baseEntryTokenUrl = "https://oauth2.googleapis.com/token";
  try {
    const tokenRequest = await axios.post(baseEntryTokenUrl, {
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: GOOGLE_REDIRECT_URI,
      grant_type: "authorization_code",
    });
    if (!tokenRequest.data) {
      return res
        .status(400)
        .redirect(`${CLIENT_URL}/signin-error?type=INVALID_CODE`);
    }

    const { access_token } = tokenRequest.data;

    const baseEntryProfileUrl = "https://www.googleapis.com/oauth2/v2/userinfo";
    const profileRequest = await axios.get(baseEntryProfileUrl, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    if (!profileRequest.data) {
      return res
        .status(400)
        .redirect(`${CLIENT_URL}/signin-error?type=INVALID_TOKEN`);
    }

    const allowedEmails = atob(ALLOWED_EMAILS) || "";
    if (!allowedEmails) {
      return res
        .status(500)
        .redirect(
          `${CLIENT_URL}/signin-error?type=SERVER_ERROR&message=invalid allowed email environment variable.`
        );
    }

    const { email, picture, name } = profileRequest.data;

    if (!allowedEmails.split(",").includes(email)) {
      res.clearCookie(TOKEN_KEY, { path: "/", httpOnly: true });
      return res
        .status(401)
        .redirect(
          `${CLIENT_URL}/signin-error?type=INVALID_USER&message=this email not allowed.`
        );
    }
    const signedToken = getSignedToken({ email, picture, name });
    res.cookie(TOKEN_KEY, signedToken, { path: "/", httpOnly: true });
    return res.redirect(`${CLIENT_URL}/signin-success`);
  } catch (err) {
    return res
      .status(500)
      .redirect(
        `${CLIENT_URL}/signin-error?type=SERVER_ERROR&message=${
          err instanceof Error ? err.message.toString() : "Unknown"
        }`
      );
  }
});

module.exports = oauthController;
