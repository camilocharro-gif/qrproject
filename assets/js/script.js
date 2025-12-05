// Configuración de campos por tipo de QR
const fieldConfig = {
    url: [
        { name: 'url', label: 'URL o Sitio Web', placeholder: 'https://ejemplo.com', type: 'url' }
    ],
    text: [
        { name: 'text', label: 'Texto', placeholder: 'Ingresa tu texto aquí', type: 'text' }
    ],
    phone: [
        { name: 'phone', label: 'Número de Teléfono', placeholder: '+56912345678', type: 'tel' }
    ],
    email: [
        { name: 'email', label: 'Correo Electrónico', placeholder: 'usuario@ejemplo.com', type: 'email' },
        { name: 'subject', label: 'Asunto (opcional)', placeholder: 'Asunto del correo', type: 'text' },
        { name: 'body', label: 'Mensaje (opcional)', placeholder: 'Cuerpo del mensaje', type: 'text' }
    ],
    whatsapp: [
        { name: 'whatsapp', label: 'Número de WhatsApp', placeholder: '+56912345678', type: 'tel' },
        { name: 'message', label: 'Mensaje (opcional)', placeholder: 'Mensaje predefinido', type: 'text' }
    ],
    vcard: [
        { name: 'name', label: 'Nombre Completo', placeholder: 'Juan Pérez', type: 'text' },
        { name: 'phone', label: 'Teléfono', placeholder: '+56912345678', type: 'tel' },
        { name: 'email', label: 'Correo Electrónico', placeholder: 'juan@ejemplo.com', type: 'email' },
        { name: 'organization', label: 'Empresa (opcional)', placeholder: 'Mi Empresa', type: 'text' },
        { name: 'url', label: 'Sitio Web (opcional)', placeholder: 'https://ejemplo.com', type: 'url' }
    ],
    wifi: [
        { name: 'ssid', label: 'Nombre de Red (SSID)', placeholder: 'Mi WiFi', type: 'text' },
        { name: 'password', label: 'Contraseña', placeholder: 'contraseña', type: 'password' },
        { name: 'security', label: 'Tipo de Seguridad', type: 'select', options: ['WPA', 'WEP', 'nopass'] }
    ],
    location: [
        { name: 'latitude', label: 'Latitud', placeholder: '-33.8688', type: 'number' },
        { name: 'longitude', label: 'Longitud', placeholder: '-151.2093', type: 'number' },
        { name: 'label', label: 'Etiqueta (opcional)', placeholder: 'Mi ubicación', type: 'text' }
    ]
};

let currentQRCode = null;

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    const typeSelect = document.getElementById('qr-type');
    const generateBtn = document.getElementById('generate-btn');
    const downloadBtn = document.getElementById('download-btn');

    typeSelect.addEventListener('change', renderInputFields);
    generateBtn.addEventListener('click', generateQR);
    downloadBtn.addEventListener('click', downloadQR);

    // Renderizar campos iniciales
    renderInputFields();
});

// Renderizar campos de entrada dinámicos
function renderInputFields() {
    const typeSelect = document.getElementById('qr-type');
    const inputFields = document.getElementById('input-fields');
    const selectedType = typeSelect.value;
    const fields = fieldConfig[selectedType];

    inputFields.innerHTML = '';

    fields.forEach(field => {
        const group = document.createElement('div');
        group.className = 'form-group';

        const label = document.createElement('label');
        label.className = 'label';
        label.setAttribute('for', field.name);
        label.textContent = field.label;

        let input;

        if (field.type === 'select') {
            input = document.createElement('select');
            input.className = 'input select';
            field.options.forEach(option => {
                const opt = document.createElement('option');
                opt.value = option;
                opt.textContent = option;
                input.appendChild(opt);
            });
        } else {
            input = document.createElement('input');
            input.className = 'input';
            input.type = field.type;
            input.placeholder = field.placeholder;
        }

        input.id = field.name;
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                generateQR();
            }
        });

        group.appendChild(label);
        group.appendChild(input);
        inputFields.appendChild(group);
    });
}

// Generar contenido según tipo
function generateQRContent() {
    const typeSelect = document.getElementById('qr-type');
    const selectedType = typeSelect.value;

    switch (selectedType) {
        case 'url':
            return document.getElementById('url').value || 'https://';

        case 'text':
            return document.getElementById('text').value || '';

        case 'phone':
            return 'tel:' + (document.getElementById('phone').value || '');

        case 'email': {
            const email = document.getElementById('email').value || '';
            const subject = document.getElementById('subject').value || '';
            const body = document.getElementById('body').value || '';
            return `mailto:${email}${subject ? '?subject=' + encodeURIComponent(subject) : ''}${body && subject ? '&body=' : subject ? '' : '?body='}${body ? encodeURIComponent(body) : ''}`;
        }

        case 'whatsapp': {
            const phone = document.getElementById('whatsapp').value || '';
            const message = document.getElementById('message').value || '';
            return `https://wa.me/${phone.replace(/\D/g, '')}${message ? '?text=' + encodeURIComponent(message) : ''}`;
        }

        case 'vcard': {
            const name = document.getElementById('name').value || '';
            const phone = document.getElementById('phone').value || '';
            const email = document.getElementById('email').value || '';
            const org = document.getElementById('organization').value || '';
            const url = document.getElementById('url').value || '';

            return `BEGIN:VCARD
VERSION:3.0
FN:${name}
${phone ? `TEL:${phone}` : ''}
${email ? `EMAIL:${email}` : ''}
${org ? `ORG:${org}` : ''}
${url ? `URL:${url}` : ''}
END:VCARD`;
        }

        case 'wifi': {
            const ssid = document.getElementById('ssid').value || '';
            const password = document.getElementById('password').value || '';
            const security = document.getElementById('security').value || 'WPA';

            return `WIFI:T:${security};S:${ssid};P:${password};;`;
        }

        case 'location': {
            const lat = document.getElementById('latitude').value || '';
            const lon = document.getElementById('longitude').value || '';
            const label = document.getElementById('label').value || '';

            return `geo:${lat},${lon}${label ? '?q=' + encodeURIComponent(label) : ''}`;
        }

        default:
            return '';
    }
}

// Validar campos
function validateInput() {
    const typeSelect = document.getElementById('qr-type');
    const selectedType = typeSelect.value;

    switch (selectedType) {
        case 'url': {
            const url = document.getElementById('url').value;
            return url && url.length > 0;
        }
        case 'text': {
            const text = document.getElementById('text').value;
            return text && text.length > 0;
        }
        case 'phone': {
            const phone = document.getElementById('phone').value;
            return phone && phone.length > 0;
        }
        case 'email': {
            const email = document.getElementById('email').value;
            return email && email.includes('@');
        }
        case 'whatsapp': {
            const phone = document.getElementById('whatsapp').value;
            return phone && phone.length > 0;
        }
        case 'vcard': {
            const name = document.getElementById('name').value;
            return name && name.length > 0;
        }
        case 'wifi': {
            const ssid = document.getElementById('ssid').value;
            return ssid && ssid.length > 0;
        }
        case 'location': {
            const lat = document.getElementById('latitude').value;
            const lon = document.getElementById('longitude').value;
            return lat && lon && !isNaN(lat) && !isNaN(lon);
        }
        default:
            return false;
    }
}

// Generar código QR
function generateQR() {
    if (!validateInput()) {
        alert('Por favor completa los campos requeridos correctamente');
        return;
    }

    const qrResult = document.getElementById('qr-result');
    const downloadBtn = document.getElementById('download-btn');

    // Limpiar QR anterior
    qrResult.innerHTML = '';
    qrResult.classList.remove('has-content');

    const content = generateQRContent();

    try {
        currentQRCode = new QRCode(qrResult, {
            text: content,
            width: 300,
            height: 300,
            colorDark: '#00d9ff',
            colorLight: '#0f0f0f',
            correctLevel: QRCode.CorrectLevel.H
        });

        qrResult.classList.add('has-content');
        downloadBtn.style.display = 'block';

        setTimeout(() => {
            qrResult.style.minHeight = 'auto';
        }, 100);
    } catch (error) {
        alert('Error al generar el código QR: ' + error.message);
    }
}

// Descargar código QR
function downloadQR() {
    const canvas = document.querySelector('#qr-result canvas');

    if (!canvas) {
        alert('Por favor genera un código QR primero');
        return;
    }

    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `QR_Code_${new Date().getTime()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
