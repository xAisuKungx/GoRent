let currentData = [];

let editingEventId = null;

let showOldPending = false;

let returnToOldPending = false;

let isEditing = false;

let travelDatePicker = null;

/*
  ใช้ป้องกันการทำงานซ้ำ
  เช่น กดบันทึก 2 ครั้งติดกัน
*/
let isLoading = false;


const API_URL =
  "https://script.google.com/macros/s/AKfycbwPNM-wn_u4o4nmpJbt6VRAOnSnKls4nZ8mN-LZ_qYIN_d3wIq-xl5GP4a_snBtY9j8/exec";


// ======================================================
// LOADING
// ======================================================

function showLoading(message = "กำลังโหลดข้อมูล...รอแปปนะคับ") {

  const overlay =
    document.getElementById("loadingOverlay");

  const text =
    document.getElementById("loadingText");

  if (text) {
    text.textContent = message;
  }

  if (overlay) {
    overlay.classList.remove("d-none");
  }

  isLoading = true;
}


function hideLoading() {

  const overlay =
    document.getElementById("loadingOverlay");

  if (overlay) {
    overlay.classList.add("d-none");
  }

  isLoading = false;
}


// ======================================================
// API REQUEST
// ======================================================

async function apiRequest(
  url,
  options = {}
) {

  const response =
    await fetch(url, options);

  if (!response.ok) {
    throw new Error(
      `HTTP Error ${response.status}`
    );
  }

  const text =
    await response.text();

  let result;

  try {

    result = JSON.parse(text);

  } catch (err) {

    console.error(
      "Server Response:",
      text
    );

    throw new Error(
      "Server ส่งข้อมูลไม่ใช่ JSON"
    );

  }

  return result;
}


// ======================================================
// LOAD DATA
// ======================================================

async function loadQueueData(showLoadingMessage = true) {

  if (showLoadingMessage) {
    showLoading("กำลังโหลดข้อมูล...รอแปปนะคับ");
  }

  try {

    const token =
      localStorage.getItem("token");

    if (!token) {
      logout();
      return false;
    }

    const data =
      await apiRequest(
        API_URL +
        "?token=" +
        encodeURIComponent(token)
      );

    // Session หมดอายุ
    if (
      data.status === "error" &&
      data.message === "Unauthorized"
    ) {

      alert(
        "Session หมดอายุ กรุณาเข้าสู่ระบบใหม่ เผื่อจะเข้าใจกัน"
      );

      logout();

      return false;
    }

    if (!Array.isArray(data)) {

      throw new Error(
        data.message ||
        "รูปแบบข้อมูลจาก Server ไม่ถูกต้อง"
      );

    }

    // เก็บข้อมูลล่าสุด
    currentData = data;

    return true;

  } catch (error) {

    console.error(error);

    alert(error.message);

    return false;

  } finally {

    if (showLoadingMessage) {
      hideLoading();
    }

  }

}


// ======================================================
// QUEUE PAGE REFRESH
// ======================================================

function refreshQueuePage() {

  updateOldQueueAlert();

  loadDriverFilter();

  loadQueue();

}


// ======================================================
// DRIVER FILTER
// ======================================================

function loadDriverFilter() {

  const select =
    document.getElementById("filterDriver");

  if (!select) {
    return;
  }

  select.innerHTML = `
    <option value="">ทุกคนขับ</option>
    <option value="ถุงแป้ง">ถุงแป้ง</option>
    <option value="Other">Other</option>
  `;

}


// ======================================================
// LOGIN
// ======================================================

async function login() {

  // ป้องกันกด Login ซ้ำ
  if (isLoading) {
    return;
  }

  const pin =
    document.getElementById("pin").value;

  const errorText =
    document.getElementById("errorText");

  try {

    showLoading("กำลังเข้าสู่ระบบ...เมื่อไรจะได้กลับเข้าไปในใจเธอ");

    const result =
      await apiRequest(
        API_URL,
        {
          method: "POST",

          body: JSON.stringify({
            action: "login",
            pin: pin
          })
        }
      );


    if (result.status === "success") {

      // เก็บ Token
      localStorage.setItem(
        "token",
        result.token
      );

      document.getElementById(
        "pin"
      ).value = "";


      /*
        แสดงหน้า Menu
      */

      document
        .getElementById("loginPage")
        .classList.add("d-none");

      document
        .getElementById("menuPage")
        .classList.remove("d-none");


      errorText.style.display =
        "none";


      /*
        สำคัญ:
        ตอนนี้ showLoading ยังทำงานอยู่
        แต่ loadQueueData() ไม่ได้ถูก block แล้ว
      */

      await loadQueueData(false);


      refreshQueuePage();

    }

    else {

      /*
        Popup / Error เดิม
      */

      errorText.style.display =
        "block";

    }


  } catch (err) {

    console.error(err);

    alert(
      err.message ||
      "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้"
    );

  } finally {

    hideLoading();

  }

}


// ======================================================
// LOGOUT
// ======================================================

function logout() {

  localStorage.removeItem("token");

  currentData = [];

  editingEventId = null;

  showOldPending = false;

  returnToOldPending = false;

  isEditing = false;


  document.getElementById("pin").value = "";


  document
    .getElementById("errorText")
    .style.display = "none";


  document
    .getElementById("menuPage")
    .classList.add("d-none");


  document
    .getElementById("HistoryQueuePage")
    .classList.add("d-none");


  document
    .getElementById("QueuePage")
    .classList.add("d-none");


  document
    .getElementById("addQueuePage")
    .classList.add("d-none");


  document
    .getElementById("loginPage")
    .classList.remove("d-none");

}


// ======================================================
// SHOW QUEUE
// ======================================================

function showQueue() {

  /*
    ไม่ loadQueueData() อีก
    เพราะข้อมูลถูกโหลดไว้แล้วตอน Login
  */

  document
    .getElementById("menuPage")
    .classList.add("d-none");


  document
    .getElementById("HistoryQueuePage")
    .classList.add("d-none");


  document
    .getElementById("addQueuePage")
    .classList.add("d-none");


  document
    .getElementById("QueuePage")
    .classList.remove("d-none");


  refreshQueuePage();

}


// ======================================================
// LOAD QUEUE
// ======================================================

function loadQueue() {

  const now =
    new Date();


  const today =
    now.getFullYear() +
    "-" +
    String(
      now.getMonth() + 1
    ).padStart(2, "0") +
    "-" +
    String(
      now.getDate()
    ).padStart(2, "0");


  let queueData;


  if (showOldPending) {

    queueData =
      currentData.filter(item =>
        item["วันที่เดินทาง"] < today &&
        item["สถานะ"] === "รอดำเนินการ"
      );

  } else {

    queueData =
      currentData.filter(item =>
        item["วันที่เดินทาง"] >= today
      );

  }


  queueData.sort((a, b) => {

    if (
      a["วันที่เดินทาง"] !==
      b["วันที่เดินทาง"]
    ) {

      return a["วันที่เดินทาง"]
        .localeCompare(
          b["วันที่เดินทาง"]
        );

    }


    return a["เวลา"]
      .localeCompare(
        b["เวลา"]
      );

  });


  let html = "";

  let titleHTML = "";


  if (showOldPending) {

    titleHTML = `
      <div class="alert alert-danger">
        ⚠ กำลังแสดง "งานค้างอัปเดต"
      </div>
    `;

  }


  queueData.forEach(item => {

    let badge =
      "bg-secondary";


    if (
      item["สถานะ"] ===
      "รอดำเนินการ"
    ) {

      badge =
        "bg-warning";

    }

    else if (
      item["สถานะ"] ===
      "เสร็จสิ้น"
    ) {

      badge =
        "bg-success";

    }

    else if (
      item["สถานะ"] ===
      "ยกเลิก"
    ) {

      badge =
        "bg-danger";

    }


    let borderColor =
      "#0d6efd";


    if (
      item["สถานะ"] ===
      "เสร็จสิ้น"
    ) {

      borderColor =
        "#198754";

    }

    else if (
      item["สถานะ"] ===
      "ยกเลิก"
    ) {

      borderColor =
        "#dc3545";

    }


    html += `

      <div
        class="today-card"
        style="border-left:5px solid ${borderColor}"
      >

        <div class="d-flex justify-content-between">

          <div class="today-datetime">

            <span class="badge ${badge}">
              ${item["สถานะ"]}
            </span>

            <br>

            📅 ${item["วันที่เดินทาง"]}

            <br>

            🕒 ${item["เวลา"]}

          </div>


          <span>

            <button
              class="btn btn-warning btn-sm action-btn"
              onclick="editQueue('${item.eventId}')"
            >
              แก้ไข
            </button>

            <br>


            <button
              class="btn btn-danger btn-sm action-btn"
              onclick="cancelQueue('${item.eventId}')"
            >
              ยกเลิก
            </button>

            <br>


            <button
              class="btn btn-dark btn-sm action-btn"
              onclick="deleteQueue('${item.eventId}')"
            >
              ลบ
            </button>

          </span>

        </div>


        <div class="today-customer mt-2">
          👤ชื่อลูกค้า:
          ${item["ชื่อลูกค้า"]}
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
          📍จุดรับ:
          ${item["จุดรับ"]}
        </div>


        <div class="today-route">
          🚩จุดส่ง:
          ${item["จุดส่ง"]}
        </div>


        <div class="today-total mt-2">
          💰ยอดรวม:
          ${item["ยอดรวม"]} บาท
        </div>

      </div>

    `;

  });


  if (queueData.length === 0) {

    html = `
      <div class="alert alert-secondary">
        ยังไม่มีคิว
      </div>
    `;

  }


  document.getElementById(
    "QueueBody"
  ).innerHTML =
    titleHTML + html;


  document.getElementById(
    "QueueCount"
  ).textContent =
    queueData.length;

}


// ======================================================
// OLD QUEUE ALERT
// ======================================================

function updateOldQueueAlert() {

  const now =
    new Date();


  const today =
    now.getFullYear() +
    "-" +
    String(
      now.getMonth() + 1
    ).padStart(2, "0") +
    "-" +
    String(
      now.getDate()
    ).padStart(2, "0");


  const count =
    currentData.filter(item =>
      item["วันที่เดินทาง"] < today &&
      item["สถานะ"] === "รอดำเนินการ"
    ).length;


  const alertBox =
    document.getElementById(
      "oldQueueAlert"
    );


  const currentBox =
    document.getElementById(
      "currentQueueBox"
    );


  const text =
    document.getElementById(
      "oldQueueText"
    );


  if (showOldPending) {

    alertBox.classList.add(
      "d-none"
    );

    currentBox.classList.remove(
      "d-none"
    );

    return;

  }


  currentBox.classList.add(
    "d-none"
  );


  if (count > 0) {

    text.textContent =
      `⚠ มีงานค้าง ${count} งาน ที่ยังไม่ได้อัปเดตสถานะ`;

    alertBox.classList.remove(
      "d-none"
    );

  } else {

    alertBox.classList.add(
      "d-none"
    );

  }

}


// ======================================================
// OLD PENDING
// ======================================================

function showOldPendingQueue() {

  showOldPending = true;

  updateOldQueueAlert();

  loadQueue();

}


function showCurrentQueue() {

  showOldPending = false;

  updateOldQueueAlert();

  loadQueue();

}


// ======================================================
// HISTORY
// ======================================================

function showHistoryQueue() {

  /*
    ไม่ loadQueueData() ซ้ำ
  */

  document
    .getElementById("menuPage")
    .classList.add("d-none");


  document
    .getElementById("QueuePage")
    .classList.add("d-none");


  document
    .getElementById("addQueuePage")
    .classList.add("d-none");


  document
    .getElementById("HistoryQueuePage")
    .classList.remove("d-none");


  /*
    History ใช้ currentData ที่มีอยู่แล้ว
  */

  loadDriverFilter();

  applyFilters();

}


// ======================================================
// BACK TO MENU FROM QUEUE
// ======================================================

function backToMenuFromQueue() {

  showOldPending = false;

  updateOldQueueAlert();

  loadQueue();


  document
    .getElementById("QueuePage")
    .classList.add("d-none");


  document
    .getElementById("menuPage")
    .classList.remove("d-none");

}


// ======================================================
// BACK TO MENU
// ======================================================

function backToMenu() {

  document
    .getElementById(
      "HistoryQueuePage"
    )
    .classList.add("d-none");


  document
    .getElementById(
      "menuPage"
    )
    .classList.remove("d-none");

}


// ======================================================
// DATE PICKER
// ======================================================

function initTravelDatePicker() {

  const queueDates =
    new Set(
      currentData.map(
        item =>
          item["วันที่เดินทาง"]
      )
    );


  if (travelDatePicker) {

    travelDatePicker.destroy();

  }


  travelDatePicker =
    flatpickr(
      "#travelDate",
      {

        dateFormat: "Y-m-d",

        disableMobile: true,


        onDayCreate(
          dObj,
          dStr,
          fp,
          dayElem
        ) {

          const y =
            dayElem.dateObj
              .getFullYear();


          const m =
            String(
              dayElem.dateObj
                .getMonth() + 1
            ).padStart(2, "0");


          const d =
            String(
              dayElem.dateObj
                .getDate()
            ).padStart(2, "0");


          const date =
            `${y}-${m}-${d}`;


          if (
            queueDates.has(date)
          ) {

            dayElem.classList.add(
              "has-queue"
            );

          }

        }

      }
    );

}


// ======================================================
// CLEAR FORM
// ======================================================

function clearForm() {

  editingEventId = null;


  document.getElementById(
    "customer"
  ).value = "";


  document.getElementById(
    "travelDate"
  ).value = "";


  document.getElementById(
    "travelTime"
  ).value = "";


  document.getElementById(
    "pickup"
  ).value = "";


  document.getElementById(
    "dropoff"
  ).value = "";


  document.getElementById(
    "price"
  ).value = "";


  document.getElementById(
    "extra"
  ).value = "";


  document.getElementById(
    "total"
  ).value = "";


  document.getElementById(
    "note"
  ).value = "";


  document.getElementById(
    "status"
  ).value =
    "รอดำเนินการ";


  document.getElementById(
    "mflowNotice"
  ).style.display =
    "none";


  document.getElementById(
    "driver"
  ).value = "";


  document.getElementById(
    "otherDriver"
  ).value = "";


  document
    .getElementById(
      "otherDriverBox"
    )
    .classList.add(
      "d-none"
    );

}


// ======================================================
// SHOW ADD QUEUE PAGE
// ======================================================

function showAddQueuePage() {

  /*
    ไม่ loadQueueData() ซ้ำ
  */

  isEditing = false;

  returnToOldPending =
    showOldPending;


  clearForm();

  initTravelDatePicker();


  document
    .getElementById(
      "QueuePage"
    )
    .classList.add(
      "d-none"
    );


  document
    .getElementById(
      "addQueuePage"
    )
    .classList.remove(
      "d-none"
    );

}


// ======================================================
// SHOW EDIT PAGE
// ======================================================

function showEditPage() {

  document
    .getElementById(
      "QueuePage"
    )
    .classList.add(
      "d-none"
    );


  document
    .getElementById(
      "addQueuePage"
    )
    .classList.remove(
      "d-none"
    );

}


// ======================================================
// BACK TO QUEUE
// ======================================================

function backToQueuePage() {

  document
    .getElementById(
      "addQueuePage"
    )
    .classList.add(
      "d-none"
    );


  document
    .getElementById(
      "QueuePage"
    )
    .classList.remove(
      "d-none"
    );

}


// ======================================================
// CALCULATE TOTAL
// ======================================================

function calculateTotal() {

  const price =
    Number(
      document.getElementById(
        "price"
      ).value
    ) || 0;


  const extra =
    Number(
      document.getElementById(
        "extra"
      ).value
    ) || 0;


  document.getElementById(
    "total"
  ).value =
    price + extra;

}


document
  .getElementById("price")
  .addEventListener(
    "input",
    calculateTotal
  );


document
  .getElementById("extra")
  .addEventListener(
    "input",
    calculateTotal
  );


// ======================================================
// SAVE QUEUE
// ======================================================

async function saveQueue() {

  /*
    ป้องกันกดบันทึกซ้ำ
  */

  if (isLoading) {
    return;
  }


  const customer =
    document.getElementById(
      "customer"
    ).value.trim();


  if (!customer) {

    alert(
      "กรุณากรอกชื่อลูกค้า"
    );

    document
      .getElementById(
        "customer"
      )
      .focus();

    return;
  }


  const travelDate =
    document.getElementById(
      "travelDate"
    ).value;


  if (!travelDate) {

    alert(
      "กรุณาเลือกวันที่เดินทาง"
    );

    document
      .getElementById(
        "travelDate"
      )
      .focus();

    return;
  }


  const travelTime =
    document.getElementById(
      "travelTime"
    ).value;


  if (!travelTime) {

    alert(
      "กรุณาระบุเวลาเดินทาง"
    );

    document
      .getElementById(
        "travelTime"
      )
      .focus();

    return;
  }


  const driver =
    document.getElementById(
      "driver"
    ).value;


  const otherDriver =
    document.getElementById(
      "otherDriver"
    ).value;


  const token =
    localStorage.getItem(
      "token"
    );


  const data = {

    token: token,

    customer:
      document.getElementById(
        "customer"
      ).value,

    travelDate:
      document.getElementById(
        "travelDate"
      ).value,

    travelTime:
      document.getElementById(
        "travelTime"
      ).value,

    pickup:
      document.getElementById(
        "pickup"
      ).value,

    dropoff:
      document.getElementById(
        "dropoff"
      ).value,

    price:
      document.getElementById(
        "price"
      ).value,

    extra:
      document.getElementById(
        "extra"
      ).value,

    total:
      document.getElementById(
        "total"
      ).value,

    note:
      document.getElementById(
        "note"
      ).value,

    status:
      document.getElementById(
        "status"
      ).value,

    driver:
      driver,

    otherDriver:
      otherDriver
  };


  const wasEditing =
    Boolean(editingEventId);


  if (editingEventId) {

    data.action =
      "update";

    data.eventId =
      editingEventId;

  } else {

    data.action =
      "insert";

  }


  try {

    showLoading(
      wasEditing
        ? "กำลังแก้ไขข้อมูล...อย่าใจร้อนคับเบ๊บ"
        : "กำลังบันทึกข้อมูล...อย่าใจร้อนคับเบ๊บ"
    );


    /*
      ส่งข้อมูลไป Server
    */

    const result =
      await apiRequest(
        API_URL,
        {
          method: "POST",

          body:
            JSON.stringify(data)
        }
      );


    /*
      ตรวจ Session
    */

    if (
      result.status === "error" &&
      result.message === "Unauthorized"
    ) {

      alert(
        "Session หมดอายุ กรุณาเข้าสู่ระบบใหม่ เผื่อจะเข้าใจกัน"
      );

      logout();

      return;
    }


    /*
      Server แจ้ง Error
    */

    if (
      result.status !== "success"
    ) {

      alert(
        "บันทึกไม่สำเร็จ\n\n" +
        result.message
      );

      return;
    }


    /*
      ----------------------------------------
      บันทึกสำเร็จ
      ----------------------------------------
    */

    editingEventId = null;


    /*
      โหลดข้อมูลใหม่
      โดยไม่เปิด Loading ซ้อน
    */

    await loadQueueData(false);


    /*
      ถ้าแก้ไขจากหน้าคิวค้าง
      ให้กลับไปหน้าคิวค้างเหมือนเดิม
    */

    if (wasEditing) {

      showOldPending =
        returnToOldPending;

    } else {

      showOldPending =
        false;

    }


    refreshQueuePage();

    backToQueuePage();


    /*
      Popup เดิม
    */

    alert(
      wasEditing
        ? "แก้ไขข้อมูลสำเร็จแล้ว เก่งมากคับ รักนะจุ๊บๆ"
        : "บันทึกสำเร็จแล้ว เก่งมากคับ รักนะจุ๊บๆ"
    );


  } catch (err) {

    console.error(err);

    alert(
      err.message ||
      "เกิดข้อผิดพลาด ขอโอกาสได้มั๊ยล่ะ"
    );


  } finally {

    hideLoading();

  }

}

// ======================================================
// EDIT QUEUE
// ======================================================

function editQueue(eventId) {

  /*
    ถ้ากำลังทำงานกับ Server
    ไม่ให้เปิดรายการอื่นซ้อน
  */

  if (isLoading) {
    return;
  }


  isEditing = true;

  returnToOldPending =
    showOldPending;

  editingEventId =
    eventId;


  const item =
    currentData.find(
      row =>
        row.eventId ===
        eventId
    );


  if (!item) {

    alert(
      "ไม่พบข้อมูลรายการนี้"
    );

    return;

  }


  document.getElementById(
    "customer"
  ).value =
    item["ชื่อลูกค้า"];


  document.getElementById(
    "travelDate"
  ).value =
    item["วันที่เดินทาง"];


  document.getElementById(
    "travelTime"
  ).value =
    item["เวลา"];


  document.getElementById(
    "pickup"
  ).value =
    item["จุดรับ"];


  document.getElementById(
    "dropoff"
  ).value =
    item["จุดส่ง"];


  document.getElementById(
    "price"
  ).value =
    item["ราคา"];


  document.getElementById(
    "extra"
  ).value =
    item[
      "ค่าน้ำมัน/ทางด่วน/ล่วงเวลา"
    ];


  document.getElementById(
    "total"
  ).value =
    item["ยอดรวม"];


  document.getElementById(
    "note"
  ).value =
    item["หมายเหตุ"];


  document.getElementById(
    "status"
  ).value =
    item["สถานะ"];


  document.getElementById(
    "mflowNotice"
  ).style.display =
    item["สถานะ"] ===
    "เสร็จสิ้น"
      ? "block"
      : "none";


  document.getElementById(
    "driver"
  ).value =
    item["คนขับ"];


  document.getElementById(
    "otherDriver"
  ).value =
    item["ชื่อคนขับอื่น"] || "";


  toggleOtherDriver();


  showEditPage();


  initTravelDatePicker();

}


// ======================================================
// CANCEL QUEUE
// ======================================================

async function cancelQueue(eventId) {

  if (isLoading) {
    return;
  }


  if (
    !confirm(
      "ต้องการยกเลิกรายการนี้ใช่หรือไม่?"
    )
  ) {

    return;
  }


  try {

    showLoading(
      "กำลังยกเลิกรายการ...แต่ไม่เลิกรักเธอ"
    );


    const result =
      await apiRequest(
        API_URL,
        {
          method: "POST",

          body:
            JSON.stringify({

              action: "cancel",

              eventId:
                eventId,

              token:
                localStorage.getItem(
                  "token"
                )

            })
        }
      );


    /*
      Session หมดอายุ
    */

    if (
      result.status === "error" &&
      result.message === "Unauthorized"
    ) {

      alert(
        "Session หมดอายุ กรุณาเข้าสู่ระบบใหม่ เผื่อจะเข้าใจกัน"
      );

      logout();

      return;
    }


    /*
      Server Error
    */

    if (
      result.status !== "success"
    ) {

      alert(
        result.message ||
        "ยกเลิกไม่สำเร็จ"
      );

      return;
    }


    /*
      โหลดข้อมูลใหม่
    */

    await loadQueueData(false);

    refreshQueuePage();


    /*
      Popup เดิม
    */

    alert(
      "ยกเลิกเรียบร้อย แต่ไม่เลิกรักนะ"
    );


  } catch (err) {

    console.error(err);

    alert(
      err.message ||
      "เกิดข้อผิดพลาด ขอโอกาสได้มั๊ยล่ะ"
    );


  } finally {

    hideLoading();

  }

}


// ======================================================
// DELETE QUEUE
// ======================================================

async function deleteQueue(eventId) {

  if (isLoading) {
    return;
  }


  if (
    !confirm(
      "ต้องการลบรายการนี้ถาวรใช่หรือไม่?"
    )
  ) {

    return;
  }


  try {

    showLoading(
      "กำลังลบข้อมูล...แต่ไม่ลบเธอออกจากใจ"
    );


    const result =
      await apiRequest(
        API_URL,
        {
          method: "POST",

          body:
            JSON.stringify({

              action: "delete",

              eventId:
                eventId,

              token:
                localStorage.getItem(
                  "token"
                )

            })
        }
      );


    /*
      Session หมดอายุ
    */

    if (
      result.status === "error" &&
      result.message === "Unauthorized"
    ) {

      alert(
        "Session หมดอายุ กรุณาเข้าสู่ระบบใหม่ เผื่อจะเข้าใจกัน"
      );

      logout();

      return;
    }


    /*
      Server Error
    */

    if (
      result.status !== "success"
    ) {

      alert(
        result.message ||
        "ลบข้อมูลไม่สำเร็จ"
      );

      return;
    }


    /*
      โหลดข้อมูลใหม่
    */

    await loadQueueData(false);

    refreshQueuePage();


    /*
      Popup เดิม
    */

    alert(
      "ลบข้อมูลเรียบร้อย"
    );


  } catch (err) {

    console.error(err);

    alert(
      err.message ||
      "เกิดข้อผิดพลาด ขอโอกาสได้มั๊ยล่ะ"
    );


  } finally {

    hideLoading();

  }

}


// ======================================================
// OTHER DRIVER
// ======================================================

function toggleOtherDriver() {

  const driver =
    document.getElementById(
      "driver"
    ).value;


  const box =
    document.getElementById(
      "otherDriverBox"
    );


  if (driver === "Other") {

    box.classList.remove(
      "d-none"
    );

  } else {

    box.classList.add(
      "d-none"
    );

    document.getElementById(
      "otherDriver"
    ).value = "";

  }

}


// ======================================================
// HISTORY FILTER
// ======================================================

function applyFilters() {

  const driver =
    document.getElementById(
      "filterDriver"
    ).value;


  const status =
    document.getElementById(
      "filterStatus"
    ).value;


  const startDate =
    document.getElementById(
      "filterStartDate"
    ).value;


  const endDate =
    document.getElementById(
      "filterEndDate"
    ).value;


  const filtered =
    currentData.filter(item => {

      const matchDriver =
        !driver ||
        item["คนขับ"] ===
        driver;


      const matchStatus =
        !status ||
        item["สถานะ"] ===
        status;


      let matchDate = true;


      const travelDate =
        item["วันที่เดินทาง"];


      if (
        startDate &&
        endDate
      ) {

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


  const today =
    new Date();

  today.setHours(
    0,
    0,
    0,
    0
  );


  filtered.sort((a, b) => {

    const dateA =
      new Date(
        `${a["วันที่เดินทาง"]}T${a["เวลา"]}`
      );


    const dateB =
      new Date(
        `${b["วันที่เดินทาง"]}T${b["เวลา"]}`
      );


    const dayA =
      new Date(dateA);

    dayA.setHours(
      0,
      0,
      0,
      0
    );


    const dayB =
      new Date(dateB);

    dayB.setHours(
      0,
      0,
      0,
      0
    );


    const aPast =
      dayA < today;


    const bPast =
      dayB < today;


    if (
      aPast !== bPast
    ) {

      return aPast
        ? 1
        : -1;

    }


    if (
      aPast &&
      bPast
    ) {

      return dateB - dateA;

    }


    return dateA - dateB;

  });


  renderTable(
    filtered
  );

}


// ======================================================
// RENDER HISTORY TABLE
// ======================================================

function renderTable(data) {

  let html = "";


  data.forEach(
    (item, index) => {

      const tripDate =
        new Date(
          item["วันที่เดินทาง"]
        );


      tripDate.setHours(
        0,
        0,
        0,
        0
      );


      const today =
        new Date();

      today.setHours(
        0,
        0,
        0,
        0
      );


      const isPast =
        tripDate < today;


      const rowClass =
        isPast
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
            ${
              item[
                "ค่าน้ำมัน/ทางด่วน/ล่วงเวลา"
              ] || ""
            }
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

        </tr>

      `;

    }
  );


  if (!html) {

    html = `
      <tr>
        <td colspan="14">
          ไม่พบข้อมูล
        </td>
      </tr>
    `;

  }


  document.getElementById(
    "queueTableBody"
  ).innerHTML =
    html;

}


// ======================================================
// CLEAR FILTERS
// ======================================================

function clearFilters() {

  document.getElementById(
    "filterDriver"
  ).value = "";


  document.getElementById(
    "filterStatus"
  ).value = "";


  document.getElementById(
    "filterStartDate"
  ).value = "";


  document.getElementById(
    "filterEndDate"
  ).value = "";


  applyFilters();

}


// ======================================================
// DOM READY
// ======================================================

window.addEventListener(
  "DOMContentLoaded",
  async () => {

    const token =
      localStorage.getItem(
        "token"
      );


    /*
      มี Token เดิม
    */

    if (
      token &&
      token.trim() !== ""
    ) {

      document
        .getElementById(
          "loginPage"
        )
        .classList.add(
          "d-none"
        );


      document
        .getElementById(
          "menuPage"
        )
        .classList.remove(
          "d-none"
        );


      /*
        โหลดข้อมูลทันที
      */

      await loadQueueData(true);


      /*
        ถ้าโหลดสำเร็จ
        เตรียมข้อมูลหน้า Queue
      */

      if (currentData.length >= 0) {

        loadDriverFilter();

        updateOldQueueAlert();

        loadQueue();

      }

    }


    /*
      History Filter
    */

    document
      .getElementById(
        "filterStartDate"
      )
      ?.addEventListener(
        "change",
        applyFilters
      );


    document
      .getElementById(
        "filterEndDate"
      )
      ?.addEventListener(
        "change",
        applyFilters
      );


    /*
      Status
    */

    document
      .getElementById(
        "status"
      )
      ?.addEventListener(
        "change",
        function () {

          const notice =
            document.getElementById(
              "mflowNotice"
            );


          notice.style.display =
            this.value === "เสร็จสิ้น"
              ? "block"
              : "none";

        }
      );

  }
);
