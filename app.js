// 替換成你的 Client ID
const CLIENT_ID = 'YOUR_CLIENT_ID'; 

// 替換成你的試算表 ID
const SPREADSHEET_ID = '1C598YLnCC_M7wjwXHIgFyEuPoS6ybcf7OlHMxKfHeng'; 

const API_KEY = 'YOUR_API_KEY'; // 通常用不到，但有時需要

// 授權範圍：允許讀取和寫入試算表
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets';

// 網頁元素
const authorizeButton = document.getElementById('authorize_button');
const signoutButton = document.getElementById('signout_button');
const readButton = document.getElementById('read_button');
const spreadsheetData = document.getElementById('spreadsheet_data');
const writeForm = document.getElementById('write-form');

/**
 * 初始化 Google API 客戶端函式庫
 */
function handleClientLoad() {
  gapi.load('client:auth2', initClient);
}

/**
 * 初始化 API 函式庫
 */
function initClient() {
  gapi.client.init({
      apiKey: API_KEY,
      clientId: CLIENT_ID,
      scope: SCOPES,
      discoveryDocs: ["https://sheets.googleapis.com/$discovery/rest?version=v4"],
  }).then(() => {
    // 監聽登入狀態的變化
    gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
    // 處理初始登入狀態
    updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
    // 設置按鈕點擊事件
    authorizeButton.onclick = handleAuthClick;
    signoutButton.onclick = handleSignoutClick;
    readButton.onclick = listMajors;
    writeForm.onsubmit = handleWriteFormSubmit;
  });
}

/**
 * 處理登入狀態
 * @param {boolean} isSignedIn 使用者是否已登入
 */
function updateSigninStatus(isSignedIn) {
  if (isSignedIn) {
    authorizeButton.style.display = 'none';
    signoutButton.style.display = 'block';
  } else {
    authorizeButton.style.display = 'block';
    signoutButton.style.display = 'none';
  }
}

/**
 * 處理登入按鈕點擊事件
 */
function handleAuthClick() {
  gapi.auth2.getAuthInstance().signIn();
}

/**
 * 處理登出按鈕點擊事件
 */
function handleSignoutClick() {
  gapi.auth2.getAuthInstance().signOut();
}

/**
 * 處理寫入表單提交事件
 * @param {Event} event 提交事件
 */
function handleWriteFormSubmit(event) {
  event.preventDefault();

  const storeId = document.getElementById('storeId').value;
  const productName = document.getElementById('productName').value;
  const quantity = document.getElementById('quantity').value;
  const note = document.getElementById('note').value;

  const values = [
    [storeId, productName, quantity, note]
  ];

  const body = {
    values: values
  };

  gapi.client.sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: 'FCM1_店內機器問題_250717KAY改!A1', // 替換成你的工作表名稱
    valueInputOption: 'USER_ENTERED',
    resource: body
  }).then((response) => {
    console.log('新增資料成功', response.result);
    alert('資料已成功新增！');
    writeForm.reset();
  }, (reason) => {
    console.error('新增資料失敗: ' + reason.result.error.message);
    alert('新增資料失敗，請檢查主控台是否有錯誤。');
  });
}

/**
 * 讀取試算表中的資料
 */
function listMajors() {
  gapi.client.sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: 'FCM1_店內機器問題_250717KAY改!A2:C', // 讀取從第二列開始的資料
  }).then((response) => {
    const range = response.result;
    if (range.values.length > 0) {
      spreadsheetData.innerHTML = ''; // 清空舊資料
      range.values.forEach((row) => {
        const li = document.createElement('li');
        li.textContent = `TRACK NO.: ${row[0]}, 店號: ${row[1]}, 異常發生日期: ${row[2]}, 分類1: ${row[3] || '無'}`;
        spreadsheetData.appendChild(li);
      });
    } else {
      spreadsheetData.innerHTML = '<li>沒有找到任何資料。</li>';
    }
  }, (reason) => {
    console.error('讀取資料失敗: ' + reason.result.error.message);
  });
}

// 載入 Google API 函式庫
gapi.load('client:auth2', initClient);
