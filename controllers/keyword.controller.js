const axios = require("axios");
const {
  getBody,
  MODELS,
  openAiApiUrl,
  getPrompt,
  getPromptForProcessingArticle,
} = require("../consts/api");
const { GPT_API_KEY } = require("../consts/app");

const keywordController = require("express").Router();

const validPromptTypes = ["keyword", "sentence", "article"];

keywordController.post("/extract", async (req, res) => {
  const { article, type } = req.body;
  if (!validPromptTypes.includes(type))
    return res.status(400).json({
      isError: true,
      message: `(!) Invalid request parameter, type "${type}"`,
    });
  try {
    const requestResult = await axios.post(
      openAiApiUrl,
      getBody(MODELS["4.0"], getPrompt(type, article)),
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GPT_API_KEY}`,
        },
      }
    );
    const [result] = requestResult.data.choices;
    const resultData = result["message"]["content"];

    let formatData = resultData;
    console.log(resultData, typeof resultData);
    if (typeof formatData === "string") {
      formatData = formatData.replace(/```javascript/g, "").replace(/```/g, "");
      formatData = JSON.parse(formatData);
    }
    return res.json({ isError: false, data: formatData });
  } catch (err) {
    console.log(err);
    return res.json({ isError: true, data: null });
  }
});

keywordController.post("/processing-article", async (req, res) => {
  const { article } = req.body;
  try {
    const requestResult = await axios.post(
      openAiApiUrl,
      getBody(MODELS["4.0"], getPromptForProcessingArticle(article)),
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GPT_API_KEY}`,
        },
      }
    );
    const [result] = requestResult.data.choices;
    const resultData = result["message"]["content"];

    let formatData = resultData;
    console.log(formatData);
    return res.json({ isError: false, data: formatData });
  } catch (err) {
    console.log(err);
    return res.json({ isError: true, data: null });
  }
});

module.exports = keywordController;
