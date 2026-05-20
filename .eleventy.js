module.exports = function (eleventyConfig) {

  eleventyConfig.setServerPassthroughCopyBehavior("copy");

  eleventyConfig.addPassthroughCopy({ "src/assets/css/tailwind.css": "assets/css/tailwind.css" });
  eleventyConfig.addPassthroughCopy("src/assets/js");

  eleventyConfig.addPassthroughCopy({
    "node_modules/alpinejs/dist/cdn.min.js": "assets/vendor/alpine.min.js"
  });
  eleventyConfig.addPassthroughCopy({
    "node_modules/gsap/dist/gsap.min.js": "assets/vendor/gsap.min.js"
  });
  eleventyConfig.addPassthroughCopy({
    "node_modules/gsap/dist/ScrollTrigger.min.js": "assets/vendor/ScrollTrigger.min.js"
  });
  eleventyConfig.addPassthroughCopy({
    "node_modules/gsap/dist/SplitText.min.js": "assets/vendor/SplitText.min.js"
  });
  eleventyConfig.addPassthroughCopy({
    "node_modules/lenis/dist/lenis.min.js": "assets/vendor/lenis.min.js"
  });
  eleventyConfig.addPassthroughCopy({
    "node_modules/three/build/three.module.js": "assets/vendor/three.module.js"
  });
  eleventyConfig.addPassthroughCopy({
    "node_modules/three/build/three.core.js": "assets/vendor/three.core.js"
  });

  eleventyConfig.addWatchTarget("src/assets/css/tailwind.css");

  // Blog: human-readable date (e.g. "May 20, 2026")
  eleventyConfig.addFilter("readableDate", (value) => {
    const d = value ? new Date(value) : new Date();
    return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  });

  // Blog: ISO date for <time datetime="...">
  eleventyConfig.addFilter("isoDate", (value) => {
    const d = value ? new Date(value) : new Date();
    return d.toISOString().split("T")[0];
  });

  // Blog: chronological post collection (newest first), excluding drafts
  eleventyConfig.addCollection("posts", (collectionApi) => {
    return collectionApi.getFilteredByGlob("src/blog/*.md")
      .filter((post) => !post.data.draft)
      .reverse();
  });

  eleventyConfig.addGlobalData("env", process.env.ELEVENTY_ENV || "production");

  eleventyConfig.setServerOptions({
    port: 8080,
    host: "0.0.0.0",
    showAllHosts: true,
    liveReload: true
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data"
    },
    templateFormats: ["njk", "html", "md"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk"
  };
};
