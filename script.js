

let url = "https://script.google.com/macros/s/AKfycbyBZA3jw1LsxSprE-Z7tZGsd8tsarhRoQdphtoko6SrJd5mkMCrlrU3fzNAx0w4Wl1m/exec";
let video = document.getElementById('video');
let canvas = document.getElementById('canvas');
let columnBData = document.querySelector("#columnBData");
let roleInput = document.querySelector("#roleInput");
let jobInput = document.querySelector("#jobInput");
let noteInput = document.querySelector("#noteInput");
let todayInput = document.querySelector("#todayInput");
let currentTime = document.querySelector("#currentTime");
let latitudeInput = document.querySelector("#latitudeInput");
let longitudeInput = document.querySelector("#longitudeInput");
let fullAddressInput = document.querySelector("#fullAddressInput");
let userId = document.querySelector("#userId");
let preview = document.getElementById('preview');
document.addEventListener("DOMContentLoaded", function () {
    const video = document.getElementById("camera-preview");
    const startCameraBtn = document.getElementById("start-camera-btn");
    const captureBtn = document.getElementById("capture-btn");
    const previewImage = document.getElementById("preview");
    const dataForm = document.getElementById("data-form");
    let stream;
    // เริ่มเปิดกล้องเมื่อคลิกปุ่ม
    startCameraBtn.addEventListener("click", function () {
        startCamera();
    });
    // ถ่ายรูปเมื่อคลิกปุ่ม
    captureBtn.addEventListener("click", function () {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        // กำหนดขนาดของ canvas เท่ากับ video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        // ถ่ายภาพจาก video และนำมาแสดงใน preview
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        previewImage.src = canvas.toDataURL("image/png");
        // ซ่อนกล้อง
        video.style.display = "none";
    });
    // บันทึกข้อมูลเมื่อ submit form
    dataForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const formData = new FormData(dataForm);
        const capturedImage = previewImage.src;
        // เพิ่มข้อมูลรูปถ่ายลงใน FormData
        formData.append("capturedImage", capturedImage);
        // สามารถทำการส่งข้อมูลไปที่เซิร์ฟเวอร์หรือประมวลผลต่อไปได้ที่นี่
        // ตัวอย่างการแสดงข้อมูลที่ console
        for (let [key, value] of formData.entries()) {
            console.log(key, value);
        }
        // ซ่อนกล้องหลังจากที่ถ่ายรูป
        video.style.display = "none";
    });
    function startCamera() {
        // เรียกใช้กล้องถ่ายภาพ
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(function (videoStream) {
                stream = videoStream;
                video.srcObject = videoStream;
                captureBtn.disabled = false; // ปลดล็อกปุ่มถ่ายรูป
                video.style.display = "block"; // แสดงกล้อง
            })
            .catch(function (error) {
                console.error("Error accessing the camera: ", error);
            });
    }
});
function checkPictureAndNextStep() {
    // Check if a picture has been taken
    const capturedImage = document.getElementById('preview').src;
    if (!capturedImage || capturedImage.includes('No-Image-Placeholder')) {
        // Show an alert if no picture has been taken
        Swal.fire({
            title: 'แจ้งเตือน!',
            text: 'กรุณาถ่ายรูปก่อนที่จะไปยังขั้นตอนถัดไป',
            icon: 'warning',
            confirmButtonText: 'OK',
        });
    } else {
        // Proceed to the next step if a picture has been taken
        nextStep();
    }
}
function submitForm() {
    // Check if required fields are filled
    if (!columnBData.value || !roleInput.value || !jobInput.value || !latitudeInput.value || !longitudeInput.value) {
        Swal.fire({
            title: 'แจ้งเตือน!',
            text: 'กรุณากรอกข้อมูลที่จำเป็น (*) ให้ครบถ้วน',
            icon: 'warning',
            confirmButtonText: 'OK',
        });
        return; // Stop the submission if required fields are not filled
    }
    // Ask for confirmation before submission
    Swal.fire({
        title: 'ยืนยันการส่งข้อมูล',
        text: 'คุณแน่ใจหรือไม่ที่ต้องการส่งข้อมูล?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'ยืนยัน',
        cancelButtonText: 'ยกเลิก',
    }).then((result) => {
        if (result.isConfirmed) {
            // Disable the submit button to prevent multiple submissions
            document.getElementById('submitButton').disabled = true;
            // Display uploading message
            Swal.fire({
                title: 'กำลังบันทึกข้อมูล',
                text: 'กรุณารอสักครู่...',
                showConfirmButton: false,
                allowOutsideClick: false,
                onBeforeOpen: () => {
                    Swal.showLoading();
                }
            });
            let spt = preview.src.split("base64,")[1];
            let obj = {
                base64: spt,
                name: columnBData.value,
                role: roleInput.value,
                job: jobInput.value,
                note: noteInput.value,
                today: todayInput.value,
                time: currentTime.value,
                lat: latitudeInput.value,
                long: longitudeInput.value,
                address: fullAddressInput.value,
                user: userId.value
            };
            fetch(url, {
                method: "POST",
                body: JSON.stringify(obj),
            })
                .then(response => response.text())
                .then(data => {
                    // Close the uploading message
                    Swal.close();
                    // Display success message
                    Swal.fire({
                        title: 'สำเร็จ!',
                        text: 'บันทึกข้อมูลของคุณเรียบร้อย!',
                        icon: 'success',
                        confirmButtonText: 'ปิด',
                    }).then(() => {
                        // Close LIFF (Line Front-end Framework)
                        sendFlexMessage();
                        console.log(data);
                    });
                })
                .catch(error => {
                    // Close the uploading message
                    Swal.close();
                    // Display error message
                    Swal.fire({
                        title: 'Error!',
                        text: 'Form submission failed. Please try again.',
                        icon: 'error',
                        confirmButtonText: 'OK',
                    }).then(() => {
                        // Re-enable the submit button in case of an error
                        document.getElementById('submitButton').disabled = false;
                    });
                    console.error(error);
                });
        }
    });
}



async function initializeLiff() {
    await liff.init({ liffId: '2002290922-O7vx3Jj7' });

    if (liff.isLoggedIn()) {
        getUserProfile();
    } else {
        liff.login();
    }
}

async function sendFlexMessage() {
    const flexMessage = {
        type: 'flex',
        altText: 'จดบันทึกเวลางาน',
        contents: {
            type: 'bubble',
            direction: 'ltr',
            body: {
                type: 'box',
                layout: 'vertical',
                spacing: 'md',
                contents: [
                    {
                        type: 'box',
                        layout: 'horizontal',
                        contents: [
                            {
                                type: 'text',
                                text: 'บันทึกเวลางาน',
                                weight: 'bold',
                                size: 'md',
                                align: 'start',
                                margin: 'sm',
                                contents: [],
                            },
                            {
                                type: 'text',
                                text: ` ${jobInput.value}`,
                                weight: 'bold',
                                size: 'md',
                                color: '#0D9608FF',
                                align: 'end',
                                contents: [],
                            },
                        ],
                    },
                    {
                        type: 'separator',
                    },
                    {
                        type: 'box',
                        layout: 'vertical',
                        spacing: 'sm',
                        contents: [
                            {
                                type: 'box',
                                layout: 'baseline',
                                contents: [
                                    {
                                        type: 'text',
                                        text: 'ชื่อพนักงาน',
                                        weight: 'bold',
                                        size: 'sm',
                                        margin: 'sm',
                                        contents: [],
                                    },
                                    {
                                        type: 'text',
                                        text: `${columnBData.value}`,
                                        size: 'sm',
                                        color: '#000000FF',
                                        align: 'end',
                                        contents: [],
                                    },
                                ],
                            },
                            {
                                type: 'box',
                                layout: 'baseline',
                                contents: [
                                    {
                                        type: 'text',
                                        text: 'รหัสพนักงาน',
                                        weight: 'bold',
                                        size: 'sm',
                                        flex: 0,
                                        margin: 'sm',
                                        contents: [],
                                    },
                                    {
                                        type: 'text',
                                        text: `${roleInput.value}`,
                                        size: 'sm',
                                        color: '#000000FF',
                                        align: 'end',
                                        contents: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        type: 'separator',
                    },
                    {
                        type: 'box',
                        layout: 'vertical',
                        contents: [
                            {
                                type: 'box',
                                layout: 'baseline',
                                contents: [
                                    {
                                        type: 'text',
                                        text: 'วันที่',
                                        weight: 'bold',
                                        contents: [],
                                    },
                                    {
                                        type: 'text',
                                        text: `${todayInput.value}`,
                                        weight: 'bold',
                                        align: 'end',
                                        contents: [],
                                    },
                                ],
                            },
                            {
                                type: 'box',
                                layout: 'baseline',
                                contents: [
                                    {
                                        type: 'text',
                                        text: 'เวลา',
                                        weight: 'bold',
                                        contents: [],
                                    },
                                    {
                                        type: 'text',
                                        text: `${currentTime.value}`,
                                        weight: 'bold',
                                        size: 'xl',
                                        color: '#EF2F14FF',
                                        align: 'end',
                                        contents: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        type: 'separator',
                    },
                    {
                        type: 'box',
                        layout: 'vertical',
                        spacing: 'xs',
                        margin: 'sm',
                        contents: [
                            {
                                type: 'text',
                                text: 'สถานที่',
                                weight: 'bold',
                                size: 'sm',
                                margin: 'md',
                                contents: [],
                            },
                            {
                                type: 'text',
                                text: `${fullAddressInput.value}`,
                                wrap: true,
                                contents: [],
                            },
                        ],
                    },
                ],
            },
        },
    };

    await liff.sendMessages([flexMessage]);
    liff.closeWindow(); // Close the LIFF window
}

function updateDateTime() {
    const dateElement = document.getElementById('date');
    const timeElement = document.getElementById('time');
    const now = new Date();

    const dateOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    };

    const timeOptions = {
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: false, // ให้แสดงในรูปแบบ 24 ชั่วโมง
        timeZone: 'Asia/Bangkok'
    };

    const formattedDate = now.toLocaleDateString('th-TH', dateOptions);
    const formattedTime = now.toLocaleTimeString('en-US', timeOptions);

    dateElement.textContent = formattedDate;
    timeElement.textContent = formattedTime;
}

// อัพเดทวันเวลาทุก 1 วินาที
setInterval(updateDateTime, 1000);

// แรกเริ่มเวลาเมื่อโหลดหน้าเว็บ
updateDateTime();
// Add an event listener to the radio buttons
document.querySelectorAll('input[name="switch-jop"]').forEach(function (radio) {
    radio.addEventListener('change', function () {
        // Update the hidden input field with the selected value
        document.getElementById('jobInput').value = this.value;
    });
});
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(displayLocation);
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}
function displayLocation(position) {
    const latitudeElement = document.getElementById("latitude");
    const longitudeElement = document.getElementById("longitude");
    const fullAddressElement = document.getElementById("fullAddress");
    const latitudeInput = document.getElementById("latitudeInput");
    const longitudeInput = document.getElementById("longitudeInput");
    const fullAddressInput = document.getElementById("fullAddressInput");
    const mapIframe = document.getElementById("mapIframe");
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    latitudeElement.innerText = `Latitude: ${latitude}`;
    longitudeElement.innerText = `Longitude: ${longitude}`;
    // Update the hidden input fields with the latitude and longitude values
    latitudeInput.value = latitude;
    longitudeInput.value = longitude;
    // Use OpenStreetMap Nominatim API for reverse geocoding
    const reverseGeocodingUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;
    fetch(reverseGeocodingUrl)
        .then(response => response.json())
        .then(data => {
            if (data.display_name) {
                const fullAddress = data.display_name;
                fullAddressElement.innerText = `ที่อยู่ของคุณ: ${fullAddress}`;
                // Set the value of the full address input
                fullAddressInput.value = fullAddress;
            } else {
                fullAddressElement.innerText = "Unable to retrieve full address.";
            }
        })
        .catch(error => {
            console.error("Error fetching reverse geocoding data:", error);
            fullAddressElement.innerText = "Error fetching reverse geocoding data.";
        });
    // Create URL for Google Maps using the obtained location
    const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}&output=embed`;
    mapIframe.src = mapsUrl;
}
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(displayLocation);
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

function getCurrentTimeInBangkok() {
    const now = new Date();
    const bangkokTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Bangkok' }));
    const hours = String(bangkokTime.getHours()).padStart(2, '0');
    const minutes = String(bangkokTime.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}
// Set the value of the input to the current time in Bangkok
document.getElementById('currentTime').value = getCurrentTimeInBangkok();
// Get today's date in the format "YYYY-MM-DD"
function getFormattedDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Set the value of the input to today's date
document.getElementById('todayInput').value = getFormattedDate();

// startCamera(); // Remove this line to start the camera when the page loads
let currentStep = 1;
function nextStep() {
    if (currentStep < 3) {
        document.getElementById(`step${currentStep}`).style.display = 'none';
        currentStep++;
        document.getElementById(`step${currentStep}`).style.display = 'block';
    }
}
function prevStep() {
    if (currentStep > 1) {
        document.getElementById(`step${currentStep}`).style.display = 'none';
        currentStep--;
        document.getElementById(`step${currentStep}`).style.display = 'block';
    }
}

// Replace YOUR_API_KEY with your actual API key
const apimapKey = 'AIzaSyB89WSrfZKA_uP9UslXs8Bo7y90PYzbpD4';
// Replace YOUR_SPREADSHEET_ID with your actual Google Sheets ID
const spreadsheet2Id = '1DkCnmGVYMjf66tarSX1EA5zm1mDL_0ACYNx2AAa5J6g';
// Google Sheets API endpoint
const apiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheet2Id}/values/MEMBER?key=${apimapKey}`;
// Function to fetch data from Google Sheets API
async function fetchData() {
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        // Extract values from the response
        const values = data.values;
        // Build the table HTML
        const table = document.getElementById('data-table');
        table.innerHTML = ''; // Clear previous data
        values.forEach(row => {
            const tr = document.createElement('tr');
            row.forEach(cell => {
                const td = document.createElement('td');
                td.textContent = cell;
                tr.appendChild(td);
            });
            table.appendChild(tr);
        });
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}
// Call the fetchData function when the page loads
fetchData();
function searchData() {
    const searchInput = document.getElementById('userId');
    const filter = searchInput.value.toUpperCase();
    const table = document.getElementById('data-table');
    const rows = table.getElementsByTagName('tr');
    let tableHidden = true; // Assume the table is initially hidden
    for (let i = 0; i < rows.length; i++) {
        const cells = rows[i].getElementsByTagName('td');
        let shouldDisplay = false;
        for (let j = 0; j < cells.length; j++) {
            const cellText = cells[j].textContent || cells[j].innerText;
            if (cellText.toUpperCase().indexOf(filter) > -1) {
                shouldDisplay = true;
                // Display data related to columns in the corresponding input fields
                const columnADataInput = document.getElementById('columnAData');
                const columnAData = rows[i].getElementsByTagName('td')[0].textContent || rows[i].getElementsByTagName('td')[0].innerText;
                columnADataInput.value = columnAData;
                const columnBDataInput = document.getElementById('columnBData');
                const columnBData = rows[i].getElementsByTagName('td')[1].textContent || rows[i].getElementsByTagName('td')[1].innerText;
                columnBDataInput.value = columnBData;
                const roleInputInput = document.getElementById('roleInput');
                const roleInput = rows[i].getElementsByTagName('td')[2].textContent || rows[i].getElementsByTagName('td')[1].innerText;
                roleInputInput.value = roleInput;
                const columnDDataInput = document.getElementById('columnDData');
                const columnDData = rows[i].getElementsByTagName('td')[3].textContent || rows[i].getElementsByTagName('td')[1].innerText;
                columnDDataInput.value = columnDData;
                break;
            }
        }
        rows[i].style.display = shouldDisplay ? '' : 'none';
        // If at least one row matches, set the tableHidden flag to false
        if (shouldDisplay) {
            tableHidden = false;
        }
    }
    // Show or hide the table based on the tableHidden flag
    table.style.display = tableHidden ? 'none' : '';
}

