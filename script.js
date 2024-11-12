// Function to read the base64 string from a text file
const readBase64FromFile = (filePath) => {
    return fetch(filePath)
        .then(response => response.text())
        .then(data => data.trim());
};

// URL of the desired link
const linkUrl = "https://deegeeartz.github.io/TWL_menu/"; // Replace with your desired URL

// Function to generate QR code with a logo
const generateQRCodeWithLogo = (url, logoBase64) => {
    const canvas = document.getElementById('qrCanvas');
    if (!canvas) {
        console.error('Canvas element not found');
        return;
    }

    const scaleFactor = 4; // Increase this factor for higher resolution
    const qrSize = 200 * scaleFactor;

    // Create a temporary canvas for high-resolution QR code
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = qrSize;
    tempCanvas.height = qrSize;

    QRCode.toCanvas(tempCanvas, url, { width: qrSize }, (error) => {
        if (error) {
            console.error('Error generating QR code:', error);
            return;
        }

        const ctx = tempCanvas.getContext('2d');
        const logo = new Image();

        logo.onload = () => {
            // Set logo size (adjust the size to your preference)
            const logoSize = 40 * scaleFactor; // Adjust the size as needed
            const xPos = (tempCanvas.width - logoSize) / 2;
            const yPos = (tempCanvas.height - logoSize) / 2;

            // Draw the background color rectangle
            ctx.fillStyle = 'white';
            ctx.fillRect(xPos, yPos, logoSize, logoSize);

            // Draw the logo at the center
            ctx.drawImage(logo, xPos, yPos, logoSize, logoSize);

            // Scale down the high-resolution canvas to the desired size
            const finalCanvas = document.createElement('canvas');
            finalCanvas.width = 200;
            finalCanvas.height = 200;
            const finalCtx = finalCanvas.getContext('2d');
            finalCtx.drawImage(tempCanvas, 0, 0, finalCanvas.width, finalCanvas.height);

            // Draw the final canvas onto the original canvas
            const originalCtx = canvas.getContext('2d');
            originalCtx.drawImage(finalCanvas, 0, 0, canvas.width, canvas.height);
        };

        logo.onerror = () => {
            console.error('Failed to load logo image');
        };

        logo.src = logoBase64;
    });
};

// Function to create a new canvas and draw the QR code and logo on it
const createNewCanvas = () => {
    const originalCanvas = document.getElementById('qrCanvas');
    const newCanvas = document.createElement('canvas');
    newCanvas.width = originalCanvas.width;
    newCanvas.height = originalCanvas.height;
    const ctx = newCanvas.getContext('2d');
    ctx.drawImage(originalCanvas, 0, 0);
    return newCanvas;
};

// Ensure the QR code is drawn first, then add the logo
window.onload = () => {
    readBase64FromFile('logo-base64.txt').then(logoBase64 => {
        generateQRCodeWithLogo(linkUrl, logoBase64); // Use the base64-encoded logo
    });
};

// Download QR code as an image
const downloadQRCode = () => {
    const newCanvas = createNewCanvas();
    const link = document.createElement('a');
    link.href = newCanvas.toDataURL('image/png');
    link.download = 'qr-code.png';
    link.click();
};

// Print QR code
const printQRCode = () => {
    const newCanvas = createNewCanvas();
    const dataUrl = newCanvas.toDataURL('image/png');
    const windowContent = `
        <!DOCTYPE html>
        <html>
        <head><title>Print QR Code</title></head>
        <body style="display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0;">
            <img id="qrImage" src="${dataUrl}">
        </body>
        </html>`;
    const printWin = window.open('', '', 'width=600,height=600');
    printWin.document.open();
    printWin.document.write(windowContent);
    printWin.document.close();

    // Wait for the image to load before printing
    printWin.document.getElementById('qrImage').onload = () => {
        printWin.focus();
        printWin.print();
        printWin.close();
    };
};

// Add event listeners to buttons
document.getElementById('downloadBtn').addEventListener('click', downloadQRCode);
document.getElementById('printBtn').addEventListener('click', printQRCode);
