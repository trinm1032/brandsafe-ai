const express = require("express");
const router = express.Router();
const api = 'http://167.179.82.39:47334/api/sql/query';

router.post('/', (req, res) => {
    const url = req.body.url;
    const query = {
        "query": "SELECT result.keywords, result.category, result.ner, result.sentiment, reason.answer AS sentiment_reason, result.interect, result.sentiment_explain, result.interect_explain\nFROM (\n  SELECT data.keywords, data.category, data.ner, sentiment.sentiment, classifier.sentiment AS interect, sentiment.sentiment_explain, classifier.sentiment_explain AS interect_explain, data.text_content, data.summary\n  FROM (\n    SELECT json_extract(output.answer, '$.summary') AS summary, json_extract(output.answer, '$.ner') AS ner, json_extract(output.answer, '$.keywords') AS keywords, json_extract(output.answer, '$.category') AS category, input.text_content\n    FROM (SELECT text_content FROM my_web.crawler WHERE url = '" + url + "' LIMIT 1) AS input\n    JOIN question_answering_model AS output\n  ) AS data\n  JOIN sentiment_classifier AS classifier\n  JOIN sentiment_classifier_base AS sentiment\n) AS result\nJOIN reason_model AS reason", "context": { "db": "mindsdb", "show_secrets": false }
    };
    const interect = {
        "unsafe": [
            "Armies and military units",
            "Battles, exercises, and conflicts",
            "Military aircraft",
            "Military decorations and memorials",
            "Military people",
            "Warships and naval units",
            "Weapons, equipment, and buildings",
        ],
        "warning": [
            "Agriculture, food, and drink",
            "Albums",
            "Architecture",
            "Art",
            "Classical compositions",
            "Computing and engineering",
            "Earth science",
            "Film",
            "Geography",
            "Language and literature",
            "Mathematics and mathematicians",
            "Media and drama",
            "Other music articles",
            "Philosophy",
            "Physics and astronomy",
            "Places",
            "Royalty, nobility, and heraldry",
            "Songs",
            "Television",
            "Baseball",
            "Basketball",
            "Culture, sociology, and psychology",
            "Economics and business",
            "Education",
            "Football",
            "Hockey",
            "Magazines and print journalism",
            "Motorsport",
            "Multi-sport event",
            "Other sports",
            "Recreation",
            "Video games",
            "Biology and medicine",
            "Chemistry and materials science",
            "Religion",
            "World history",
            "Pro wrestling",
            "Transport",
            "Politics and government",
            "Law",
        ],
    }
    fetch(api, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(query)
    })
        .then(response => response.json())
        .then(data => {
            const interects = Object.entries(data.data[0][7]).filter(interect => interect[1] > 0.1).map(interect => interect[0].trim());
            const json = {
                "keywords": JSON.parse(data.data[0][0]),
                "category": JSON.parse(data.data[0][1]),
                "ner": JSON.parse(data.data[0][2]),
                "sentiment": data.data[0][3],
                "sentiment_reason": JSON.parse(data.data[0][4]).answer,
                "sentiment_explain": data.data[0][6],
                "interect": interects,
                "brandsafe": interects.some(data => interect.unsafe.includes(data)) ? false : interects.some(data => interect.warning.includes(data)) ? data.data[0][6].NEG > 0.24 ? false : true : null,
                "reason": interects.some(data => interect.unsafe.includes(data)) ? "Interect unsafe" : interects.some(data => interect.warning.includes(data)) ? data.data[0][6].NEG > 0.24 ? "High sentiment negative probability" : "Sentiment positive" : "Unknown"
            }
            console.log(json);
            res.json(json);
        })
        .catch((error) => {
            console.error('Error:', error);
            res.json({ "error": error });
        });
});

module.exports = router;