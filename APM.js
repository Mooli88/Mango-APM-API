const { promiseWraper, asyncRequest } = require("./lib/request");

const cache = {
  accessToken: null,
  user: {}
};

async function auth(
  email = process.env.APM_EMAIL,
  password = process.env.APM_PASS
) {
  if (!cache.accessToken) {
    const options = {
      path: "/authenticate",
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      }
    };
    const data = {
      email,
      password
    };

    const res = await asyncRequest({ data, options });
    cache.accessToken = res ? res.accessToken : null;
  }

  return cache.accessToken;
}

async function getUser() {
  if (!cache.user.id) {
    const options = {
      path: "/user",
      token: cache.accessToken
    };
  
    cache.user = await asyncRequest({ options });
  }

  return cache.user;
}

async function getUserMeta(id) {
  if (!cache.userMeta) {
    const options = {
      path: `/user/${id || cache.user.id}/metadata`,
      token: cache.accessToken
    };

    const userMeta = await asyncRequest({ options });
    cache.userMeta = userMeta;
  }

  return cache.userMeta;
}

async function getProjectDetails(id) {
  const options = {
    path: `/project/${id}`,
    token: cache.accessToken
  };

  return asyncRequest({ options });
}

async function getProjects() {
  const options = {
    path: `/user/${cache.user.id}/projects`,
    token: cache.accessToken
  };

  const projects = await asyncRequest({ options });
  const queries = projects.map(({ id }) => getProjectDetails(id));
  return Promise.all(queries);
}

async function getUserAccount() {
  const userAccount = await promiseWraper(async (res, rej) => {
    await auth();
    const user = await getUser();
    const userMeta = await getUserMeta();
    const projects = await getProjects();

    res({
      ...user,
      ...userMeta,
      projects
    });
  }, 5000);

  return userAccount;
}

module.exports = {
  auth,
  getUser,
  getUserMeta,
  getProjects,
  getProjectDetails,
  getUserAccount
};
