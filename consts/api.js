const getPostPositionPrompt = (withStructure) => {
  const basePrompt =
    "아래 글에서 단어와 붙어있는 조사가 맞지않는 부분이 있어. 단어와 조사 사용이 자연스럽도록 수정해서 출력해줘. 대신 별도의 가이드 문구 없이 결과값만 출력해주면 돼.";
  if (withStructure) {
    return `${basePrompt} 추가적으로 현재 내용 기준으로 문장 형식이나 구조가 다른 창의적인 구조로 마치 다른 사람이 쓴 글처럼 다시 글을 만들어 줘. 대신 조건은 기존 핵심 키워드 및 의미는 변하지 않게 해줘. 그리고 모바일에서도 해당 글을 읽을 수 있기 때문에 가독성 높은 구조로 각 문장의 길이가 너무 크지 않게 줄여줘.`;
  }
  return basePrompt;
};

const openAiApiUrl = "https://api.openai.com/v1/chat/completions";
/**
 *
 * @param {"keyword" | "sentence" | "article" | "keyword2" } type
 * @returns
 */
const getMainPrompt = (type) => {
  const mapTypeToPrompt = {
    // keyword: `먼저 아래 글에서 단어 기준으로 문자열을 뽑아줘. 단 중복없이 뽑아주고, 해당 단어들은 A라고 가정하자. 그리고 각 A단어와 같은 의미를 가지지만 다른 문자값(한국어)을 가지는 것들을 각 20개, A1 ~ A20(여기서 A1 ~ A20는 A와 의미는 같지만 다른 단어들을 의미해. 만약 20개까지 추천이 불가능하다면, 최대 갯수는 알아서 조정해줘) 라고 가정하자. 그리고 해당 값들을 javascript의 객체(object)인 {A: [A1, A2, A3, A4, ....., A20], B: [B1, B2, B3, B4, B5, ...., B20], ....., Z: [Z1, ...., Z20]} 형식으로 표현해줘. 최소 한 문장에 두개 이상의 단어는 뽑아주면 좋겠어. 대신 별다른 가이드 문구나 마크다운 문법없이 데이터 형태로만 넘겨줘. `,
    keyword: `먼저 아래 글에서 모든 단어를 추출해줘. 단 중복없이 뽑아주고, 기업명은 제외해줘. 그리고 뽑은 단어들은 A라고 가정하자. 그리고 각 A단어와 같은 의미를 가지지만 다른 문자값(한국어)을 가지는 것들을 각 N개, A[1] ~ A[N](여기서 A[1] ~ A[N]는 A와 의미는 같지만 다른 단어들을 의미해. 최소 20개까지 추천해줘.) 라고 가정하자. 그리고 해당 값들을 javascript의 객체(object)인 {A[1]: [ A[2], A[3], A[4], A[5], ....., A[N] ], B[1]: [ B[2], B[3], B[4], B[5], B[6], ...., B[N] ], ....., Z[1]: [ Z[2], ...., Z[N] ]} 형식으로 표현해줘. 그리고 대체할 수 있는 단어는 최소 10개 이상 뽑아주면 좋겠어. 그리고 해당 단어를 뽑는 기준은 해당 단어로 교체했을 때 기존 문장과의 의미와는 달라질 수 있게끔 해줘. 대신 별다른 가이드 문구나 마크다운 문법없이 데이터 형태로만 넘겨줘. `,
    sentence2: `먼저 아래 글에서 문장 기준으로 문자열을 뽑아줘. 문장 기준으로 뽑은 문자열들을 A, B, C, D ~ Z라고 가정하자. 그리고 각각의 문장들과 같은 의미를 가지지만 다른 문자값(한국어)을 가지는 것들을 각각 최대 10개씩 뽑아주고, 뽑은 10개의 문장들을 A에 대해서는 A1 ~ A10, B에 대해서는 B1 ~ B10 이라고 가정했을 때, 데이터를 javascript의 객체(object) {A: [A1, A2, A3, A4, A5, A6, A7, A8, A9, A10], B: [B1, B2, B3, B4, B5, ..., B10], ...., Z: [Z1, Z2, Z3, ...., Z10]}와 같은 형태로 뽑아줘. 대신 A1 ~ A10을 생성할떄는 최소한 문장 내부의 2개 이상의 단어들도 의미는 같지만 문자열은 다르게 같이 바꿔주면 좋겠어. 대신 별다른 가이드 문구나 마크다운 문법없이 데이터만 출력해줘. 예를 들면 "계엄은 국가 최고 지도자가 물리력을 적극적으로 동원하는 조치로, 군사정권 시기의 대한민국처럼 권력자의 의도에 따라 남용될 소지가 있는 제도다. 대한민국의 경우, 계엄 해제 권한은 대통령과 국회에만 주어져 있다." 라는 글이 있다면, {"계엄은 국가 최고 지도자가 물리력을 적극적으로 동원하는 조치로, 군사정권 시기의 대한민국처럼 권력자의 의도에 따라 남용될 소지가 있는 제도다.": ["계엄은 국가 최고 지도자가 물리력을 적극적으로 동원하는 조치로, 군사정권 시기의 대한민국처럼 권력자의 의도에 따라 남용될 소지가 있는 제도다.", "계엄은 국가의 최고 지도자가 물리적 힘을 사용하여 취하는 조치로, 군사 정권의 대한민국처럼 권력자의 의도에 따라 오용될 여지가 있는 제도다."], "대한민국의 경우, 계엄 해제 권한은 대통령과 국회에만 주어져 있다.": ["대한민국의 경우, 계엄 해제 권한은 대통령과 국회에만 주어져 있다.", ""대한민국에서는 계엄 해제 권한이 오직 대통령과 국회에만 부여된다.""]} 이렇게 출력해주면 되는거야. 주의할 점은 {A: [], B: []} 이렇게 출력되면 안되고 아니라, 객체의 Key인 A와 B가 문장단위로 끊었던 원본 텍스트 문자열이여야 해.`,
    sentence: `아래 문장과 동일한 의미를 같지만, 문자열만 다른 문장을 최대 10개 뽑아주고, 해당 문장들을 Javascript 배열 형태로 뽑아줘. 대신 해당 문자열들은 각각 제일 바깥은 "로 감싸주고, 내부에 또다른 "들은 “ 혹은 ‘로 교체해줘(Javascript의 JSON.parse 에러를 피하기 위해서야). 그러기위해서는 적절하게 "(double quotes), '(single quotes)들을 바꿔줘. 조건은 각 문장에서 최소 2개 이상의 단어들을 의미는 같지만 문자열은 다르게 같이 바꿔주면 좋겠어. 출력되는 형태는 별다른 가이드 문구나 마크다운 문법없이 데이터만 출력해줘.`,
    keyword2: `아래 문장에서 단어들을 뽑아서 각 단어들을 대체할 수 있는 다른 단어(뜻은 비슷하고 문자열만 다른 단어)들을 10개씩 뽑아주면 돼. 출력형태는 예를 들어서 문장에서 "이틀"과 "총"을 타겟으로 잡았을 때 {"이틀": [ "2일", "양일", "두날", "이일", "쌍일", "이틀간", "48시간", "연이틀", "연속 이틀", "이틀짜리" ], "총": [ "전체", "합계", "전부", "합산", "총합", "모두", "총량", "총계", "전체", "총액" ]} 이런식의 Javascript의 Object 구조로 출력해주면 돼. 방금 말한 "이틀"과 "총"은 예시 데이터니깐 포함시키면 안돼. 반드시 아래 문장을 기준으로 Object 데이터를 뽑아줘야 해. 그리고 별다른 가이드 문구나 마크다운 문법없이 데이터만 출력해줘(너가 출력해준 데이터를 JSON.parse를 적용했을 때 error가 발생하면 안돼.). `,
  };
  return mapTypeToPrompt[type];
};

const getPrompt = (type, article) => {
  return getMainPrompt(type) + "\n\n" + article;
};

const getPromptForProcessingArticle = (article, withStructure = false) => {
  return `${getPostPositionPrompt(withStructure)}` + "\n\n" + article;
};

const getBody = (model, content) => {
  return {
    model,
    messages: [{ role: "user", content }],
    temperature: 0.7,
  };
};

const MODELS = {
  ["3.5"]: "gpt-3.5-turbo",
  ["4.0"]: "gpt-4o",
};

module.exports = {
  openAiApiUrl,
  getPrompt,
  getPromptForProcessingArticle,
  getBody,
  MODELS,
};
