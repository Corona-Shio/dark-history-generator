document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generateBtn');
    const userNameInput = document.getElementById('userName');
    const resultArea = document.getElementById('resultArea');
    const poemText = document.getElementById('poemText');
    const retryBtn = document.getElementById('retryBtn');
    const poemContainer = document.getElementById('poemContainer');
    const whiteoutOverlay = document.getElementById('whiteoutOverlay');
    const magicCircleContainer = document.getElementById('magicCircleContainer');

    // 魔法陣の初期化
    const magicCircle = new MagicCircle('magicCircleCanvas');

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
        // 各単語をphraseクラスを持つspanで囲む
        const wrap = (str) => `<span class="phrase">${str}</span>`;

        const getRandomNoun = () => getRandomItem(nouns);
        const getRandomAdj = () => getRandomItem(adjectives);

        let poem = template
            .replace(/{name}/g, wrap(name))
            .replace(/{title}/g, () => wrap(getRandomItem(titles)))
            .replace(/{verb}/g, () => wrap(getRandomItem(verbs)))
            .replace(/{diff_verb}/g, () => wrap(getRandomItem(verbs)));

        poem = poem.replace(/{adj}/g, () => wrap(getRandomAdj()));
        poem = poem.replace(/{noun}/g, () => wrap(getRandomNoun()));
        poem = poem.replace(/{diff_noun}/g, () => wrap(getRandomNoun()));
        poem = poem.replace(/{diff_noun_2}/g, () => wrap(getRandomNoun()));

        // 文末（。！？）の後に改行がない場合、適度に改行を入れる
        poem = poem.replace(/([。！？])(?![\n\s」])/g, "$1\n");

        return poem;
    };

    const typeWriterWithDecode = (text, element) => {
        const charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?/!\"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~';

        // HTMLタグをパースして配列にする (テキスト、タグ、改行などを分ける)
        const parts = [];
        let currentIdx = 0;
        const tagRegex = /(<[^>]*>|\n)/g;
        let match;

        while ((match = tagRegex.exec(text)) !== null) {
            if (match.index > currentIdx) {
                parts.push({ type: 'text', content: text.slice(currentIdx, match.index) });
            }
            parts.push({ type: match[1] === '\n' ? 'newline' : 'tag', content: match[1] });
            currentIdx = tagRegex.lastIndex;
        }
        if (currentIdx < text.length) {
            parts.push({ type: 'text', content: text.slice(currentIdx) });
        }

        element.innerHTML = '';
        element.classList.add('decoding');

        let partIndex = 0;
        let charIndex = 0;
        const revealInterval = 25; // 少し速める

        const animate = () => {
            if (partIndex >= parts.length) {
                element.classList.remove('decoding');
                element.innerHTML = text; // 最終的に原文を確実にセット
                return;
            }

            const currentPart = parts[partIndex];

            if (currentPart.type === 'tag') {
                // タグは一瞬で追加（非表示だがDOM構造を維持）
                partIndex++;
                animate();
                return;
            }

            if (currentPart.type === 'newline') {
                partIndex++;
                animate();
                return;
            }

            // テキストの場合、1文字ずつ確定させていく
            // 現在の全表示用HTMLを作成
            let currentHTML = "";
            for (let i = 0; i < parts.length; i++) {
                if (i < partIndex) {
                    currentHTML += parts[i].content;
                } else if (i === partIndex) {
                    currentHTML += currentPart.content.slice(0, charIndex);
                    // デコード中の演出文字
                    if (charIndex < currentPart.content.length) {
                        const glitchLength = Math.min(2, currentPart.content.length - charIndex);
                        for (let j = 0; j < glitchLength; j++) {
                            currentHTML += charSet[Math.floor(Math.random() * charSet.length)];
                        }
                    }
                }
            }

            element.innerHTML = currentHTML;

            charIndex++;
            if (charIndex > currentPart.content.length) {
                charIndex = 0;
                partIndex++;
            }

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

    // 魔法陣停止用のタイマー管理
    let magicCircleStopTimeout = null;

    const showResult = () => {
        // 以前の停止予約があればキャンセル
        if (magicCircleStopTimeout) {
            clearTimeout(magicCircleStopTimeout);
            magicCircleStopTimeout = null;
        }

        triggerWhiteout();
        logFlavorText();
        const poem = generatePoem();

        // 魔法陣の起動
        magicCircleContainer.classList.add('active');
        magicCircle.start();

        // 演出：一旦リセット
        poemText.textContent = '';
        resultArea.classList.remove('hidden');

        // デコーディング演出のタイミング調整
        setTimeout(() => {
            // 魔法陣が消え始めると同時にポエムの出力を開始
            magicCircleContainer.classList.remove('active');
            typeWriterWithDecode(poem, poemText);

            // CSSのフェードアウト（1.2s）が完全に終わるまで描画を続ける
            magicCircleStopTimeout = setTimeout(() => {
                magicCircle.stop();
                magicCircleStopTimeout = null;
            }, 1250); // 1.2s + α
        }, 600);
    };

    generateBtn.addEventListener('click', showResult);
    retryBtn.addEventListener('click', showResult);

});
