document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generateBtn');
    const userNameInput = document.getElementById('userName');
    const resultArea = document.getElementById('resultArea');
    const poemText = document.getElementById('poemText');
    const retryBtn = document.getElementById('retryBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const poemContainer = document.getElementById('poemContainer');

    // 効果音的な演出（コンソールログ）
    const logFlavorText = () => {
        const texts = [
            "共鳴を開始...",
            "深淵を覗き込んでいます...",
            "黒歴史アーカイブに接続中...",
            "封印が解かれました。"
        ];
        texts.forEach((text, i) => {
            setTimeout(() => console.log(text), i * 300);
        });
    };

    const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

    const generatePoem = () => {
        const name = userNameInput.value.trim() || "名無しの権兵衛";

        // poeticDataはdata.jsから読み込まれている前提
        if (typeof poeticData === 'undefined') {
            poemText.textContent = "エラー：聖典(data.js)が見つかりません。";
            return;
        }

        const { nouns, adjectives, verbs, titles, templates } = poeticData;

        let template = getRandomItem(templates);

        // プレースホルダーを置換
        // 異なる単語を選ぶために、すでに選ばれたものを除外したりする簡易ロジック
        const getRandomNoun = () => getRandomItem(nouns);
        const getRandomAdj = () => getRandomItem(adjectives);

        let poem = template
            .replace(/{name}/g, name)
            .replace(/{title}/g, getRandomItem(titles))
            .replace(/{verb}/g, getRandomItem(verbs))
            .replace(/{diff_verb}/g, getRandomItem(verbs));

        // 名詞の重複を避けるための少し賢い置換
        // (厳密な重複排除はしていないが、ランダム性が高いので良しとする)
        poem = poem.replace(/{adj}/g, () => getRandomAdj());
        poem = poem.replace(/{noun}/g, () => getRandomNoun());
        poem = poem.replace(/{diff_noun}/g, () => getRandomNoun());
        poem = poem.replace(/{diff_noun_2}/g, () => getRandomNoun());

        return poem;
    };

    const showResult = () => {
        logFlavorText();
        const poem = generatePoem();

        // 演出：一旦リセット
        poemText.style.opacity = '0';
        resultArea.classList.remove('hidden');

        // 少し待ってから表示
        setTimeout(() => {
            poemText.textContent = poem;
            poemText.style.opacity = '1';
            poemText.classList.add('fade-in');
        }, 300);
    };

    generateBtn.addEventListener('click', showResult);
    retryBtn.addEventListener('click', showResult);

    downloadBtn.addEventListener('click', () => {
        html2canvas(poemContainer, {
            backgroundColor: null, // 背景透過 or style指定
            scale: 2 // 高画質
        }).then(canvas => {
            const link = document.createElement('a');
            link.download = `dark_history_${Date.now()}.png`;
            link.href = canvas.toDataURL();
            link.click();
        });
    });
});
