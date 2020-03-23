"use strict";
const axios = require("axios");

/**
 * Read the documentation (https://strapi.io/documentation/3.0.0-beta.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  import: async ctx => {
    const { data } = await axios.get(
      "https://www.alldadstalk.com/wp-json/wp/v2/posts?per_page=4"
    );
    const posts = await Promise.all(
      data.map(
        post =>
          new Promise(async (resolve, reject) => {
            const {
              title: { rendered: titleRendered },
              slug,
              content: { rendered: contentRendered },
              date,
              featured_image
            } = post;
            try {
              const downloaded = await strapi.config.functions.download(
                featured_image
              );
              const [{ id: fileId }] = await strapi.config.functions.upload(
                downloaded
              );

              const postData = {
                title: titleRendered,
                content: contentRendered,
                slug,
                image: [fileId],
                createdAt: date
              };
              const created = await strapi.services.post.create(postData);
              resolve(created);
            } catch (err) {
              reject(created);
            }
          })
      )
    );

    ctx.send(posts);
  }
};
