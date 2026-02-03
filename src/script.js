document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generateBtn');
    const userNameInput = document.getElementById('userName');
    const resultArea = document.getElementById('resultArea');
    const poemText = document.getElementById('poemText');
    const retryBtn = document.getElementById('retryBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const poemContainer = document.getElementById('poemContainer');
    const whiteoutOverlay = document.getElementById('whiteoutOverlay');

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

        // 文末（。！？）の後に改行がない場合、適度に改行を入れる「いい感じ」の調整
        poem = poem.replace(/([。！？])(?![\n\s」])/g, "$1\n");

        return poem;
    };

    const typeWriterWithDecode = (text, element) => {
        const charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?/!\"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~';
        const targetText = text;
        const length = targetText.length;

        // 初期状態：暗号化された文字で埋める
        let currentDisplay = Array.from({ length }, (_, i) =>
            targetText[i] === '\n' ? '\n' : charSet[Math.floor(Math.random() * charSet.length)]
        );

        element.textContent = currentDisplay.join('');
        element.classList.add('decoding');

        let revealedCount = 0;
        const revealInterval = 40; // 確定の間隔 (ms)

        const animate = () => {
            if (revealedCount >= length) {
                element.classList.remove('decoding');
                element.textContent = targetText; // 最終的に原文に合わせる
                return;
            }

            // まだ確定していない部分をランダムに変える
            for (let i = revealedCount; i < length; i++) {
                if (targetText[i] !== '\n' && Math.random() > 0.8) {
                    currentDisplay[i] = charSet[Math.floor(Math.random() * charSet.length)];
                }
            }

            // 1文字確定させる
            currentDisplay[revealedCount] = targetText[revealedCount];
            revealedCount++;

            element.textContent = currentDisplay.join('');

            // 次の文字へ
            setTimeout(animate, revealInterval);
        };

        animate();
    };

    const triggerWhiteout = () => {
        whiteoutOverlay.classList.remove('active');
        void whiteoutOverlay.offsetWidth; // reflow
        whiteoutOverlay.classList.add('active');

        // スクリーンシェイク
        const container = document.querySelector('.container');
        container.classList.remove('shake');
        void container.offsetWidth; // reflow
        container.classList.add('shake');
    };

    const showResult = () => {
        triggerWhiteout();
        logFlavorText();
        const poem = generatePoem();

        // 演出：一旦リセット
        poemText.textContent = '';
        resultArea.classList.remove('hidden');

        // 少し待ってからデコーディング演出開始
        setTimeout(() => {
            typeWriterWithDecode(poem, poemText);
        }, 500);
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
