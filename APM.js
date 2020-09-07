const { promiseWraper, asyncRequest } = require("./lib/request");

const cache = {
  accessToken: null,
  user: {}
};

async function auth(
  email = process.env.APM_EMAIL,
  password = process.env.APM_PASS
) {
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
  if (!cache.accessToken) {
    const res = await asyncRequest({ data, options });
    cache.accessToken = res ? res.accessToken : null;
  }

  return cache.accessToken;
}

async function getUser() {
  const options = {
    path: "/user",
    token: cache.accessToken
  };

  if (!cache.user.id) {
    const user = await asyncRequest({ options });
    cache.user = user;
  }

  return cache.user;
}

async function getUserMeta(id) {
  const options = {
    path: `/user/${id || cache.user.id}/metadata`,
    token: cache.accessToken
  };

  if (!cache.userMeta) {
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
