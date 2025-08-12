//JavaScript
    
var options = getOptions();

var family = new FamilyTree(document.getElementById('tree'), {
    mouseScrool: FamilyTree.none,
    scaleInitial: options.scaleInitial,
    mode: 'dark',
    template: 'hugo',
    roots: [3],
    nodeMenu: {
        edit: { text: 'Edit' },
        details: { text: 'Details' },
    },
    nodeTreeMenu: true,
    nodeBinding: {
        field_0: 'name',
        field_1: 'born',
        img_0: 'photo'
    },
    editForm: {
        titleBinding: "name",
        photoBinding: "photo",
        addMoreBtn: 'Add element',
        addMore: 'Add more elements',
        addMoreFieldName: 'Element name',
        generateElementsFromFields: false,
        elements: [
            { type: 'textbox', label: 'Full Name', binding: 'name' },
            { type: 'textbox', label: 'Email Address', binding: 'email' },
            [
                { type: 'textbox', label: 'Phone', binding: 'phone' },
                { type: 'date', label: 'Date Of Birth', binding: 'born' }
            ],
            [
                { type: 'select', options: [{ value: 'bg', text: 'Bulgaria' }, { value: 'ru', text: 'Russia' }, { value: 'gr', text: 'Greece' }], label: 'Country', binding: 'country' },
                { type: 'textbox', label: 'City', binding: 'city' },
            ],
            { type: 'textbox', label: 'Photo Path', binding: 'photo', placeholder: 'e.g., photos/john.jpg' },
        ]
    },
});

// Function untuk mengubah path foto menjadi path lokal
function processPhotoPath(photoPath) {
    if (!photoPath) return '';
    
    // Jika sudah berupa URL lengkap, biarkan apa adanya
    if (photoPath.startsWith('http://') || photoPath.startsWith('https://') || photoPath.startsWith('data:')) {
        return photoPath;
    }
    
    // Jika tidak dimulai dengan './' atau '/', tambahkan './'
    if (!photoPath.startsWith('./') && !photoPath.startsWith('/')) {
        return './' + photoPath;
    }
    
    return photoPath;
}

// Menggunakan fetch() untuk load file JSON =====
async function loadFamilyData() {
    try {
        const response = await fetch('./family-data.json');
        const data = await response.json();
        
        // Proses data untuk mengubah path foto
        const processedData = data.familyMembers.map(member => {
            if (member.photo) {
                member.photo = processPhotoPath(member.photo);
            }
            return member;
        });
        
        family.load(processedData);
    } catch (error) {
        console.error('Error loading family data:', error);
    }
}

// Panggil function
loadFamilyData();

function getOptions(){
    const searchParams = new URLSearchParams(window.location.search);
    var fit = searchParams.get('fit');
    var enableSearch = true;
    var scaleInitial = 1;
    if (fit == 'yes'){
        enableSearch = false;
        scaleInitial = FamilyTree.match.boundary;
    }
    return {enableSearch, scaleInitial};
}

// Enhanced function untuk mengubah path foto
function processPhotoPath(photoPath) {
    if (!photoPath) return '';
    
    // Jika sudah berupa URL lengkap (http/https/data), biarkan apa adanya
    if (photoPath.startsWith('http://') || 
        photoPath.startsWith('https://') || 
        photoPath.startsWith('data:')) {
        return photoPath;
    }
    
    // Jika menggunakan placeholder dari Balkan, ganti dengan foto default
    if (photoPath.includes('cdn.balkan.app')) {
        return './photos/default-avatar.jpg'; // Siapkan foto default
    }
    
    // Untuk path lokal, pastikan menggunakan format yang benar
    if (!photoPath.startsWith('./') && !photoPath.startsWith('/')) {
        return './photos/' + photoPath; // Otomatis masukkan ke folder photos
    }
    
    return photoPath;
}

// Function untuk upload foto baru (opsional)
function handlePhotoUpload(inputElement, callback) {
    const file = inputElement.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            // Convert ke Base64 atau save ke folder photos
            const photoData = e.target.result;
            callback(photoData);
        };
        reader.readAsDataURL(file);
    }
}

// Function untuk download foto dari URL dan convert ke Base64
async function downloadPhotoAsBase64(url) {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error('Error downloading photo:', error);
        return './photos/default-avatar.jpg';
    }
}

// Enhanced loadFamilyData dengan photo processing
async function loadFamilyData() {
    try {
        const response = await fetch('./family-data.json');
        const data = await response.json();
        
        // Proses data untuk mengubah path foto
        const processedData = await Promise.all(
            data.familyMembers.map(async (member) => {
                if (member.photo) {
                    // Jika foto masih menggunakan URL Balkan, convert ke Base64
                    if (member.photo.includes('cdn.balkan.app')) {
                        member.photo = await downloadPhotoAsBase64(member.photo);
                    } else {
                        member.photo = processPhotoPath(member.photo);
                    }
                }
                return member;
            })
        );
        
        family.load(processedData);
    } catch (error) {
        console.error('Error loading family data:', error);
    }
}