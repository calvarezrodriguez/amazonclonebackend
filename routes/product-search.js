const router = require("express").Router();
const algoliasearch = require("algoliasearch");
const client = algoliasearch("S4L88H6A11", "f3db9fdf369a7c8680ef27ba72d382ab");
const index = client.initIndex("amazoncl");

router.get("/", (req, res, next) => {
  if (req.query.query) {
    index
      .search(req.query.query, { page: req.query.page })
      .then((data) => {
        res.json({
          success: true,
          message: "Here is your search",
          status: 200,
          content: data,
          search_result: req.query.query,
        });
      });
  }
});

module.exports = router;
