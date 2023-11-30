import axios from "axios"

class Session {
  constructor(username) {
    this.authorized = false;
    this.username = username;
    this.embed = false;
    this.rest = {};
  }

  getRest = async (rest) => {
    for (const [key, value] of Object.entries(rest)) {
      try {
        // console.log(`AUTH ATTEMPT: ${key}`, value);
        const res = await axios.post(`${value.domain}/api/${value.api}/auth/signin`, {
          credentials: {
            personalAccessTokenName: value.pat_name,
            personalAccessTokenSecret: value.pat_secret,
            site: {
              contentUrl: value.site,
            }
          }
        });

        const { site, user, token, estimatedTimeToExpiration } = res.data.credentials;
        const config = { key: token, site: site.id, user: user.id, expires: estimatedTimeToExpiration };
        this.rest[key] = config;
      } catch (err) {
        this.rest[key] = { error: err.response.data };
      }
    }
  }

  getEmbed = async (rest) => {
    this.embed = true;
  }

  authorize = async (rest) => {
    const errors = new Array;
    await this.getRest(rest);
    await this.getEmbed(rest);
    // loops through rest objects to find error entries
    for (const [auth, result] of Object.entries(this.rest)) {
      for (const [key, value] of Object.entries(result)) {
        if (key === 'error') {
          value.method = auth;
          errors.push(value); // adds error to array indicating method
        }
      }
    }
    if (errors.length === 0) { // if no errors are found then authorize the user
      this.authorized = true;
    }
  }
}

export default Session;
