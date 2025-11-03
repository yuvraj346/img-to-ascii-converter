const imageInput = document.getElementById('imageInput');
const imageCanvas = document.getElementById('imageCanvas');
const asciiOutput = document.getElementById('asciiOutput');
const copyBtn = document.getElementById('copyBtn');
const downloadBtn = document.getElementById('downloadBtn');
const outputSizeSelector = document.getElementById('outputSize');
const ctx = imageCanvas.getContext('2d');

const asciiCharacters = " .:-=+*#%@";
let currentImage = null; // Store the current image

imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) {
        asciiOutput.textContent = '';
        copyBtn.style.display = 'none';
        downloadBtn.style.display = 'none';
        currentImage = null;
        return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
            currentImage = img; // Store the image
            generateAsciiArt(currentImage);
            copyBtn.style.display = 'inline-block';
            downloadBtn.style.display = 'inline-block';
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
});

outputSizeSelector.addEventListener('change', () => {
    if (currentImage) {
        generateAsciiArt(currentImage);
    }
});

copyBtn.addEventListener('click', async () => {
    const asciiArtContent = asciiOutput.textContent;
    if (asciiArtContent) {
        try {
            await navigator.clipboard.writeText(asciiArtContent);
            alert('ASCII Art copied to clipboard!');
        } catch (err) {
            console.error('Failed to copy ASCII art: ', err);
            alert('Failed to copy ASCII Art. Please try again.');
        }
    }
});

downloadBtn.addEventListener('click', () => {
    const asciiArtContent = asciiOutput.textContent;
    if (asciiArtContent) {
        const blob = new Blob([asciiArtContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'ascii-art.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
});

function generateAsciiArt(img) {
    const aspectRatio = img.width / img.height;
    let maxWidth, maxHeight;

    switch (outputSizeSelector.value) {
        case 'small':
            maxWidth = 50;
            maxHeight = 40;
            break;
        case 'large':
            maxWidth = 150;
            maxHeight = 120;
            break;
        case 'medium':
        default:
            maxWidth = 100;
            maxHeight = 80;
            break;
    }

    let newWidth = maxWidth;
    let newHeight = Math.floor(newWidth / aspectRatio);

    if (newHeight > maxHeight) {
        newHeight = maxHeight;
        newWidth = Math.floor(newHeight * aspectRatio);
    }

    imageCanvas.width = newWidth;
    imageCanvas.height = newHeight;

    ctx.drawImage(img, 0, 0, newWidth, newHeight);

    const imageData = ctx.getImageData(0, 0, newWidth, newHeight);
    const data = imageData.data;

    let asciiArt = '';
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        const brightness = (r + g + b) / 3;

        const charIndex = Math.floor((brightness / 255) * (asciiCharacters.length - 1));
        asciiArt += asciiCharacters[charIndex];

        if ((i / 4 + 1) % newWidth === 0) {
            asciiArt += '\n';
        }
    }
    asciiOutput.textContent = asciiArt;
}
