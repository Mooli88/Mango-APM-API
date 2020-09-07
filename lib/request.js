const http = require("http");

const TIMEOUT = 5000;

function getHttpOpts(opts = {}) {
  const { token, ...options } = opts;

  if (token) {
    options.headers = {
      ...options.headers,
      Authorization: `Bearer ${token}`
    };
  }
  const path = `/api${opts.path}`;
  return {
    method: "GET",
    ...options,
    path,
    family: 4,
    host: "35.189.123.34",
    headers: {
      accept: "application/json",
      ...options.headers
    },
    timeout: TIMEOUT
  };
}

function asyncRequest({ data, options }) {
  const opts = options ? getHttpOpts(options) : getHttpOpts();

  return new Promise((resolve, reject) => {
    const req = http.request(opts, (res) => {
      res.setEncoding("utf8");

      res.on("data", (chunk) => {
        try {
          const parsedData = JSON.parse(chunk);
          // console.log("parsedData", parsedData);
          return resolve(parsedData);
        } catch (e) {
          console.error(e.message);
        }
      });
    });

    req.on("error", (e) => {
      reject(e);
    });
    req.on("timeout", () => {
      console.log("TIEOUT");
      req.abort();
      reject("Timeout");
    });

    data && req.write(JSON.stringify(data));
    req.end();
  }).catch((err) => {
    console.error("request error | ", err);
    // process.exit(1);
  });
}

function promiseWraper(cb, timeout = TIMEOUT) {
  let timeoutId;

  return new Promise((res, rej) => {
    timeoutId = setTimeout(() => {
      rej("timeout!");
    }, timeout);

    cb(res, rej);
  })
    .finally(() => {
      clearTimeout(timeoutId);
    })
    .catch((err) => {
      console.error("promiseWraper error | ", err);
      // process.exit(1);
    });
}

module.exports = {
  asyncRequest,
  promiseWraper
};
