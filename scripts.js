// Prevent default behavior on drag & drop events
const dropZone = document.querySelector('.drop-zone');
const qrFile = document.getElementById('qr-file');

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
  dropZone.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
  e.preventDefault();
  e.stopPropagation();
}

// Add or remove styles when dragging over the drop zone
['dragenter', 'dragover'].forEach(eventName => {
  dropZone.addEventListener(eventName, highlight, false);
});

['dragleave', 'drop'].forEach(eventName => {
  dropZone.addEventListener(eventName, unhighlight, false);
});

function highlight() {
  dropZone.classList.add('dragover');
}

function unhighlight() {
  dropZone.classList.remove('dragover');
}

// Handle files dropped in the drop zone
dropZone.addEventListener('drop', handleDrop, false);

function handleDrop(e) {
  const dt = e.dataTransfer;
  const file = dt.files[0];
  qrFile.files = dt.files;
  handleFile(file);
}

// Handle file input when browsing files
qrFile.addEventListener('change', function () {
  handleFile(this.files[0]);
});

function handleFile(file) {
  if (file && file.type.startsWith('image/')) {
    processQRCode(file);
  } else {
    alert('⚠️ Please upload a valid image file.');
  }
}

// Generate QR Code
document.getElementById('generate-btn').addEventListener('click', function () {
  const qrInput = document.getElementById('qr-input').value.trim();
  const qrSize = document.getElementById('qr-size').value;

  if (qrInput) {
    const qrCodeDiv = document.getElementById('qr-code-preview');
    qrCodeDiv.innerHTML = '';

    const qrCode = new QRCode(qrCodeDiv, {
      text: qrInput,
      width: parseInt(qrSize),
      height: parseInt(qrSize),
    });

    setTimeout(() => {
      const qrCanvas = qrCodeDiv.querySelector('canvas');
      const downloadBtn = document.getElementById('download-btn');
      downloadBtn.classList.remove('hidden');
      downloadBtn.onclick = () => {
        const link = document.createElement('a');
        link.download = 'qrcode.png';
        link.href = qrCanvas.toDataURL();
        link.click();
      };
    }, 500);
  } else {
    alert('⚠️ Please enter text or a URL to generate a QR code.');
  }
});

// Process QR Code image to extract text
function processQRCode(file) {
  const reader = new FileReader();
  reader.onload = function () {
    const img = new Image();
    img.src = reader.result;

    img.onload = function () {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;
      context.drawImage(img, 0, 0, canvas.width, canvas.height);

      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, canvas.width, canvas.height);

      if (code) {
        document.getElementById('qr-result').textContent = code.data;
      } else {
        document.getElementById('qr-result').textContent = '⚠️ No QR code detected. Please try again.';
      }
    };
  };
  reader.readAsDataURL(file);
}

// Tab switching functionality
function openTab(evt, tabName) {
  const tabContents = document.querySelectorAll('.tab-content');
  const tabLinks = document.querySelectorAll('.tab-link');
  const previewSection = document.getElementById('preview-section');
  const resultSection = document.getElementById('result-section');

  // Hide all tab contents and reset buttons
  tabContents.forEach(content => content.classList.add('hidden'));
  tabLinks.forEach(link => link.classList.remove('active', 'bg-indigo-600', 'bg-pink-600'));

  // Show the selected tab
  document.getElementById(tabName).classList.remove('hidden');
  evt.currentTarget.classList.add('active');

  // Switch between preview and result sections
  if (tabName === 'scanner') {
    previewSection.classList.add('hidden');
    resultSection.classList.remove('hidden');
  } else {
    previewSection.classList.remove('hidden');
    resultSection.classList.add('hidden');
  }
}

// Reset QR Code Generator
document.getElementById('reset-btn').addEventListener('click', function () {
  document.getElementById('qr-input').value = ''; // Clear input field
  document.getElementById('qr-size').value = '256'; // Reset size to default
  const qrCodeDiv = document.getElementById('qr-code-preview');
  qrCodeDiv.innerHTML = ''; // Clear QR code preview
  document.getElementById('download-btn').classList.add('hidden'); // Hide download button
});

// Reset Scanner
document.getElementById('scanner-reset-btn').addEventListener('click', function () {
  qrFile.value = ''; // Clear the file input
  document.getElementById('qr-result').textContent = ''; // Clear the result
});

// Initialize default tab
document.querySelector('.tab-link').classList.add('active', 'bg-indigo-600');
