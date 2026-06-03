let currentData = [];

function loadDriverFilter() {

  const select =
    document.getElementById("filterDriver");

  select.innerHTML = `
    <option value="">ทุกคนขับ</option>
    <option value="ถุงแป้ง">ถุงแป้ง</option>
    <option value="Other">Other</option>
  `;

}

let editingEventId = null;

async function login() {

  const pin =
    document.getElementById("pin").value;

  const errorText =
    document.getElementById("errorText");

  try {

    const res = await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify({
        action: "login",
        pin: pin
      })
    });

    const result = await res.json();

    if (result.status === "success") {

      localStorage.setItem(
        "token",
        result.token
      );

      document.getElementById("pin").value = "";

      document
        .getElementById("loginPage")
        .classList.add("d-none");

      document
        .getElementById("menuPage")
        .classList.remove("d-none");

      errorText.style.display = "none";

    } else {

      errorText.style.display = "block";

    }

  } catch (err) {

    console.error(err);

    alert("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");

  }

}

function logout() {

  localStorage.removeItem("token");

  document.getElementById("pin").value = "";

  document.getElementById("errorText")
    .style.display = "none";

  document.getElementById("menuPage")
    .classList.add("d-none");

  document.getElementById("manageQueuePage")
    .classList.add("d-none");

  document.getElementById("todayQueuePage")
    .classList.add("d-none");

  document.getElementById("addQueuePage")
    .classList.add("d-none");

  document.getElementById("loginPage")
    .classList.remove("d-none");

}

async function showTodayQueue() {

  document
    .getElementById("menuPage")
    .classList.add("d-none");

  document
    .getElementById("todayQueuePage")
    .classList.remove("d-none");

  if(currentData.length === 0){
    await loadQueueData();
  }

  loadTodayQueue();

}


function loadTodayQueue(){

  const now = new Date();

  const today =
    now.getFullYear() + "-" +
    String(now.getMonth() + 1).padStart(2,"0") + "-" +
    String(now.getDate()).padStart(2,"0");

  const todayQueue = currentData.filter(
    item => item["วันที่เดินทาง"] === today
  );

  todayQueue.sort((a,b)=>
    a["เวลา"].localeCompare(b["เวลา"])
  );

  let html = "";

  todayQueue.forEach(item => {

    let badge = "bg-secondary";

    if(item["สถานะ"] === "รอดำเนินการ"){
      badge = "bg-warning";
    }
    else if(item["สถานะ"] === "เสร็จสิ้น"){
      badge = "bg-success";
    }
    else if(item["สถานะ"] === "ยกเลิก"){
      badge = "bg-danger";
    }

    let borderColor = "#0d6efd";

    if(item["สถานะ"] === "เสร็จสิ้น"){
      borderColor = "#198754";
    }
    else if(item["สถานะ"] === "ยกเลิก"){
      borderColor = "#dc3545";
    }

    html += `

    <div
      class="today-card"
      style="border-left:5px solid ${borderColor}"
    >

      <div class="d-flex justify-content-between">

        <div class="today-time">
          ${item["เวลา"]}
        </div>

        <span class="badge ${badge}">
          ${item["สถานะ"]}
        </span>

      </div>

      <div class="today-customer mt-2">
        👤ชื่อลูกค้า: ${item["ชื่อลูกค้า"]}
      </div>

      <div class="today-driver">
        🚗 คนขับ:
        ${
          item["คนขับ"] === "Other"
            ? item["ชื่อคนขับอื่น"]
            : item["คนขับ"]
        }
      </div>

      <div class="today-route mt-2">
        📍จุดรับ: ${item["จุดรับ"]}
      </div>

      <div class="today-route">
        🚩จุดส่ง: ${item["จุดส่ง"]}
      </div>

      <div class="today-total mt-2">
        💰ยอดรวม: ${item["ยอดรวม"]} บาท
      </div>

    </div>

    `;
  });

  if(todayQueue.length === 0){

    html = `
      <tr>
        <td colspan="6">
          ไม่มีคิวในวันนี้
        </td>
      </tr>
    `;

  }

  document.getElementById(
    "todayQueueBody"
  ).innerHTML = html;

  document.getElementById(
    "todayQueueCount"
  ).textContent = todayQueue.length;

}

function showManageQueue() {

  document.getElementById("menuPage").classList.add("d-none");

  document.getElementById("manageQueuePage").classList.remove("d-none");

  loadQueueData();

}

function backToMenuFromToday(){

    document
      .getElementById("todayQueuePage")
      .classList.add("d-none");

    document
      .getElementById("menuPage")
      .classList.remove("d-none");

  }

function backToMenu() {
  
  document.getElementById("manageQueuePage").classList.add("d-none");
  document.getElementById("menuPage").classList.remove("d-none");
}

const API_URL = "https://script.google.com/macros/s/AKfycbyniXDZ__5z90He6Pl6nW9RNgmkPLiomtwHwyvyx1m1Rs2gtxhzZ_XXNbMs9K8XeNof/exec";

async function loadQueueData() {

  try {

    const token =
      localStorage.getItem("token");

    const response = await fetch(
      API_URL + "?token=" + encodeURIComponent(token)
    );

    const data = await response.json();

    currentData = data;

    loadDriverFilter();

    // setDefaultDateRange();

    applyFilters(); // ใช้ฟิลเตอร์ที่ตั้งไว้

  } catch (error) {

    console.error(error);

    alert("โหลดข้อมูลไม่สำเร็จ");

  }

}

function clearForm() {

  editingEventId = null;

  document.getElementById("customer").value = "";
  document.getElementById("travelDate").value = "";
  document.getElementById("travelTime").value = "";
  document.getElementById("pickup").value = "";
  document.getElementById("dropoff").value = "";
  document.getElementById("price").value = "";
  document.getElementById("extra").value = "";
  document.getElementById("total").value = "";
  document.getElementById("note").value = "";
  document.getElementById("status").value = "รอดำเนินการ";
  document.getElementById("mflowNotice").style.display = "none";
  document.getElementById("driver").value = "";
  document.getElementById("otherDriver").value = "";

  document
    .getElementById("otherDriverBox")
    .classList.add("d-none");

}

function showAddQueuePage(){

  clearForm();

  document
    .getElementById("manageQueuePage")
    .classList.add("d-none");

  document
    .getElementById("addQueuePage")
    .classList.remove("d-none");

}

function showEditPage(){

  document
    .getElementById("manageQueuePage")
    .classList.add("d-none");

  document
    .getElementById("addQueuePage")
    .classList.remove("d-none");

}

function backToManageQueue(){

  document
    .getElementById("addQueuePage")
    .classList.add("d-none");

  document
    .getElementById("manageQueuePage")
    .classList.remove("d-none");

}

function calculateTotal() {

  const price =
    Number(document.getElementById("price").value) || 0;

  const extra =
    Number(document.getElementById("extra").value) || 0;

  document.getElementById("total").value =
    price + extra;

}
document
  .getElementById("price")
  .addEventListener("input", calculateTotal);

document
  .getElementById("extra")
  .addEventListener("input", calculateTotal);

async function saveQueue() {
  const customer =
    document.getElementById("customer").value.trim();

  if (!customer) {

    alert("กรุณากรอกชื่อลูกค้า");

    document
      .getElementById("customer")
      .focus();

    return;
  }

  const travelDate =
    document.getElementById("travelDate").value;

  if (!travelDate) {
    alert("กรุณาเลือกวันที่เดินทาง");
    document.getElementById("travelDate").focus();
    return;
  }

  const travelTime =
    document.getElementById("travelTime").value;

  if (!travelTime) {
    alert("กรุณาระบุเวลาเดินทาง");
    document.getElementById("travelTime").focus();
    return;
  }

  const driver =
  document.getElementById("driver").value;

  const otherDriver =
  document.getElementById("otherDriver").value;

  const token =
    localStorage.getItem("token");

  const data = {

    token: token,

    customer: document.getElementById("customer").value,
    travelDate: document.getElementById("travelDate").value,
    travelTime: document.getElementById("travelTime").value,
    pickup: document.getElementById("pickup").value,
    dropoff: document.getElementById("dropoff").value,
    price: document.getElementById("price").value,
    extra: document.getElementById("extra").value,
    total: document.getElementById("total").value,
    note: document.getElementById("note").value,
    status: document.getElementById("status").value,
    driver:driver,
    otherDriver: otherDriver
  };

  

  if (editingEventId) {

    data.action = "update";
    data.eventId = editingEventId;

  } else {

    data.action = "insert";

  }

  try {

    const res = await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify(data)
    });

    const result = await res.json();

    if (result.status === "success") {

      editingEventId = null;

      alert("บันทึกสำเร็จ");

      backToManageQueue();
      loadQueueData();

    } else {

      alert(
        "บันทึกไม่สำเร็จ\n\n" +
        result.message
      );

    }

  } catch (err) {

    console.error(err);

    alert(JSON.stringify(err));

  }
}

function editQueue(eventId) {

  editingEventId = eventId;

  // หาแถวที่ตรงกัน
  const item = currentData.find(
    row => row.eventId === eventId
  );

  if (!item) return;

  document.getElementById("customer").value =
    item["ชื่อลูกค้า"];

  document.getElementById("travelDate").value =
    item["วันที่เดินทาง"];

  document.getElementById("travelTime").value =
    item["เวลา"];

  document.getElementById("pickup").value =
    item["จุดรับ"];

  document.getElementById("dropoff").value =
    item["จุดส่ง"];

  document.getElementById("price").value =
    item["ราคา"];

  document.getElementById("extra").value =
    item["ค่าน้ำมัน/ทางด่วน/ล่วงเวลา"];

  document.getElementById("total").value =
    item["ยอดรวม"];

  document.getElementById("note").value =
    item["หมายเหตุ"];

  document.getElementById("status").value =
    item["สถานะ"];

  document.getElementById("mflowNotice").style.display =
    item["สถานะ"] === "เสร็จสิ้น"
      ? "block"
      : "none";

  document.getElementById("driver").value =
    item["คนขับ"];

  document.getElementById("otherDriver").value =
    item["ชื่อคนขับอื่น"] || "";

  toggleOtherDriver();

  showEditPage();

}

async function cancelQueue(eventId) {

  if (!confirm("ต้องการยกเลิกรายการนี้ใช่หรือไม่?")) {
    return;
  }

  try {

    const res = await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify({
        action: "cancel",
        eventId: eventId,
        token: localStorage.getItem("token")
      })
    });

    const result = await res.json();

    if (result.status === "success") {

      alert("ยกเลิกเรียบร้อย");

      loadQueueData();

    } else {

      alert(result.message);

    }

  } catch (err) {

    console.error(err);

    alert("เกิดข้อผิดพลาด");

  }

}

async function deleteQueue(eventId) {

  if (!confirm("ต้องการลบรายการนี้ถาวรใช่หรือไม่?")) {
    return;
  }

  try {

    const res = await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify({
        action: "delete",
        eventId: eventId,
        token: localStorage.getItem("token")
      })
    });

    const result = await res.json();

    if (result.status === "success") {

      alert("ลบข้อมูลเรียบร้อย");

      loadQueueData();

    } else {

      alert(result.message);

    }

  } catch (err) {

    console.error(err);

    alert("เกิดข้อผิดพลาด");

  }

}

function toggleOtherDriver() {

  const driver =
    document.getElementById("driver").value;

  const box =
    document.getElementById("otherDriverBox");

  if (driver === "Other") {

    box.classList.remove("d-none");

  } else {

    box.classList.add("d-none");

    document.getElementById("otherDriver").value = "";

  }

}

function applyFilters() {

  const driver =
    document.getElementById("filterDriver").value;

  const status =
    document.getElementById("filterStatus").value;

  const startDate =
    document.getElementById("filterStartDate").value;

  const endDate =
    document.getElementById("filterEndDate").value;

  const filtered = currentData.filter(item => {

    const matchDriver =
      !driver ||
      item["คนขับ"] === driver;

    const matchStatus =
      !status || item["สถานะ"] === status;

    let matchDate = true;

    const travelDate = item["วันที่เดินทาง"];

    if (startDate && endDate) {

      matchDate =
        travelDate >= startDate &&
        travelDate <= endDate;

    }
    else if (startDate) {

      matchDate =
        travelDate >= startDate;

    }
    else if (endDate) {

      matchDate =
        travelDate <= endDate;

    }

    return (
      matchDriver &&
      matchStatus &&
      matchDate
    );

  });


  const today = new Date();
  today.setHours(0,0,0,0);
  
  filtered.sort((a, b) => {
  
    const dateA = new Date(
      `${a["วันที่เดินทาง"]}T${a["เวลา"]}`
    );
  
    const dateB = new Date(
      `${b["วันที่เดินทาง"]}T${b["เวลา"]}`
    );
  
    const dayA = new Date(dateA);
    dayA.setHours(0,0,0,0);
  
    const dayB = new Date(dateB);
    dayB.setHours(0,0,0,0);
  
    const aPast = dayA < today;
    const bPast = dayB < today;
  
    if (aPast !== bPast) {
      return aPast ? 1 : -1;
    }
  
    return dateA - dateB;
  });



  renderTable(filtered);

}

function renderTable(data){

  let html = "";

  data.forEach((item, index) => {

    const tripDate = new Date(item["วันที่เดินทาง"]);

    tripDate.setHours(0,0,0,0);

    const today = new Date();
    today.setHours(0,0,0,0);

    const isPast = tripDate < today;

    const rowClass = isPast
      ? "past-row"
      : "";

    html += `
    <tr class="${rowClass}">

      <td class="col-id">
        ${index + 1}
      </td>

      <td class="col-created">
        ${item["เวลาเพิ่มข้อมูล"] || ""}
      </td>

      <td class="col-customer sticky-customer">
        ${item["ชื่อลูกค้า"] || ""}
      </td>

      <td class="col-date">
        ${item["วันที่เดินทาง"] || ""}
      </td>

      <td class="col-time">
        ${item["เวลา"] || ""}
      </td>

      <td class="col-location">
        ${item["จุดรับ"] || ""}
      </td>

      <td class="col-location">
        ${item["จุดส่ง"] || ""}
      </td>

      <td class="col-price">
        ${item["ราคา"] || ""}
      </td>

      <td class="col-extra">
        ${item["ค่าน้ำมัน/ทางด่วน/ล่วงเวลา"] || ""}
      </td>

      <td class="col-total">
        ${item["ยอดรวม"] || ""}
      </td>

      <td class="col-status">
        ${item["สถานะ"] || ""}
      </td>

      <td class="col-driver">
        ${item["คนขับ"] || ""}
      </td>

      <td class="col-driver">
        ${item["ชื่อคนขับอื่น"] || ""}
      </td>

      <td class="col-note">
        ${item["หมายเหตุ"] || ""}
      </td>

      <td class="col-action text-center">

        <button
          class="btn btn-warning btn-sm action-btn"
          onclick="editQueue('${item.eventId}')"
        >
          แก้ไข
        </button>

        <button
          class="btn btn-danger btn-sm action-btn"
          onclick="cancelQueue('${item.eventId}')"
        >
          ยกเลิก
        </button>

        <button
          class="btn btn-dark btn-sm action-btn"
          onclick="deleteQueue('${item.eventId}')"
        >
          ลบ
        </button>

      </td>

    </tr>
    `;

  });

  document.getElementById(
    "queueTableBody"
  ).innerHTML = html;

}

function clearFilters() {

  document.getElementById("filterDriver").value = "";

  document.getElementById("filterStatus").value = "";

  document.getElementById("filterStartDate").value = "";
  document.getElementById("filterEndDate").value = "";

  // setDefaultDateRange();
  applyFilters();

}


// function setDefaultDateRange() {

//   const today = new Date();

//   const tomorrow = new Date();
//   tomorrow.setDate(today.getDate() + 30);

//   document.getElementById("filterStartDate").value =
//     today.toISOString().split("T")[0];

//   document.getElementById("filterEndDate").value =
//     tomorrow.toISOString().split("T")[0];

// }


window.addEventListener("DOMContentLoaded", () => {

  const token =
    localStorage.getItem("token");

  if(token && token.trim() !== ""){

    document
      .getElementById("loginPage")
      .classList.add("d-none");

    document
      .getElementById("menuPage")
      .classList.remove("d-none");

  }

  document
    .getElementById("filterStartDate")
    ?.addEventListener("change", applyFilters);

  document
    .getElementById("filterEndDate")
    ?.addEventListener("change", applyFilters);

});


document
  .getElementById("status")
  .addEventListener("change", function () {

    const notice =
      document.getElementById("mflowNotice");

    notice.style.display =
      this.value === "เสร็จสิ้น"
        ? "block"
        : "none";

  });
