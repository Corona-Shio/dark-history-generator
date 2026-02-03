/**
 * MagicCircle - Procedural Magic Circle Generator
 * ランダムで幾何学的な魔法陣を生成し、Canvasに描画します。
 */
class MagicCircle {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.width = 0;
        this.height = 0;
        this.centerX = 0;
        this.centerY = 0;
        this.layers = [];
        this.animationId = null;
        this.startTime = 0;
        this.isRunning = false;

        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        const container = this.canvas.parentElement;
        this.width = container.clientWidth;
        this.height = container.clientHeight || 600;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;
    }

    /**
     * 新しい魔法陣の構成をランダムに生成
     */
    generate() {
        this.layers = [];
        const maxRadius = Math.min(this.width, this.height) * 0.4;
        const numLayers = 5 + Math.floor(Math.random() * 5);

        // 基本の色（紫、青、赤、金などからランダム）
        const hues = [280, 200, 0, 45, 330];
        const baseHue = hues[Math.floor(Math.random() * hues.length)];

        for (let i = 0; i < numLayers; i++) {
            const radius = (maxRadius / numLayers) * (i + 1);
            const type = Math.random();

            this.layers.push({
                radius: radius,
                type: type > 0.7 ? 'polygon' : (type > 0.4 ? 'circle' : 'symbols'),
                sides: 3 + Math.floor(Math.random() * 6),
                rotationSpeed: (Math.random() - 0.5) * 0.02,
                initialRotation: Math.random() * Math.PI * 2,
                lineWidth: 1 + Math.random() * 2,
                dash: Math.random() > 0.7 ? [5, 10] : [],
                hue: (baseHue + (Math.random() - 0.5) * 30) % 360
            });
        }
    }

    draw(timestamp) {
        if (!this.startTime) this.startTime = timestamp;
        const elapsed = timestamp - this.startTime;

        this.ctx.clearRect(0, 0, this.width, this.height);

        this.layers.forEach(layer => {
            this.ctx.save();
            this.ctx.translate(this.centerX, this.centerY);
            this.ctx.rotate(layer.initialRotation + elapsed * layer.rotationSpeed * 0.1);

            this.ctx.strokeStyle = `hsla(${layer.hue}, 80%, 60%, 0.8)`;
            this.ctx.shadowBlur = 30; // 強めのグロー
            this.ctx.shadowColor = `hsla(${layer.hue}, 80%, 60%, 0.9)`;
            this.ctx.lineWidth = layer.lineWidth;
            this.ctx.setLineDash(layer.dash);

            if (layer.type === 'circle') {
                this.ctx.beginPath();
                this.ctx.arc(0, 0, layer.radius, 0, Math.PI * 2);
                this.ctx.stroke();
            } else if (layer.type === 'polygon') {
                this.drawPolygon(layer.radius, layer.sides);
            } else if (layer.type === 'symbols') {
                this.drawSymbols(layer.radius, layer.sides * 2, layer.hue, elapsed);
            }

            this.ctx.restore();
        });

        if (this.isRunning) {
            this.animationId = requestAnimationFrame((t) => this.draw(t));
        }
    }

    drawPolygon(radius, sides) {
        this.ctx.beginPath();
        for (let i = 0; i < sides; i++) {
            const angle = (i / sides) * Math.PI * 2;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            if (i === 0) this.ctx.moveTo(x, y);
            else this.ctx.lineTo(x, y);
        }
        this.ctx.closePath();
        this.ctx.stroke();

        // 内側にもう一つ線を引く演出
        if (sides % 2 === 0) {
            this.ctx.beginPath();
            for (let i = 0; i < sides; i++) {
                const angle = (i / sides) * Math.PI * 2;
                const nextAngle = ((i + sides / 2) / sides) * Math.PI * 2;
                this.ctx.moveTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
                this.ctx.lineTo(Math.cos(nextAngle) * radius, Math.sin(nextAngle) * radius);
            }
            this.ctx.stroke();
        }
    }

    drawSymbols(radius, count, hue, elapsed) {
        const chars = "ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚻᚼᚽᚾᚿᛁᛂᛃᛄᛅᛆᛇᛈᛉᛊᛋᛌᛍᛎᛏᛐᛑᛒᛓᛔᛕᛖᛗᛘᛙᛚᛛᛜᛝᛞᛟᛠᛡᛢᛣᛤᛥᛦᛧᛨᛩᛪ";
        this.ctx.font = `${radius * 0.12}px serif`;
        this.ctx.fillStyle = `hsla(${hue}, 80%, 70%, 0.9)`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;

            this.ctx.save();
            this.ctx.translate(x, y);
            this.ctx.rotate(angle + Math.PI / 2);

            // 経過時間に基づいて文字をランダムに変更
            const seed = Math.floor(elapsed / 100) + i;
            const char = chars[seed % chars.length];

            this.ctx.fillText(char, 0, 0);
            this.ctx.restore();
        }
    }

    start() {
        this.generate();
        this.isRunning = true;
        this.startTime = 0;
        this.animationId = requestAnimationFrame((t) => this.draw(t));
    }

    stop() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
}
