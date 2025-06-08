console.log("запустився");

const nbu = document.getElementById('nbu');
const dealDOM = document.getElementById('deal');
const difference = document.getElementById('difference');
const updateButton = document.getElementById('update-button');
const historyDate = document.getElementById('body-date');
const historyRate = document.getElementById('body-rate');
const historyDiff = document.getElementById('body-diff');
let currentDealDiff = 0;
let currentDealRate = 0;
let currentDealTime = 0;
console.log({ nbu, deal, difference, updateButton });
updateButton.style.display = 'none';

let recordID;
 
async function getDealRecord(recordID) {
  console.log("getDealRecord", recordID);
    const response = await ZOHO.CRM.API.getRecord({ Entity: "Deals", RecordID: recordID });
    console.log("Deal Record:", response);
return response.data[0]; 
}
async function updateDealRecord(recordID, newRate) {
  console.log(`updateDealRecord ${recordID} з новим курсом: ${newRate}`);
  const updateData = {
    data: [
    {
      id: recordID,
      CurrencyCourse: newRate
    }
  ]
};
  const response = await ZOHO.CRM.API.updateRecord({ Entity: "Deals", APIData: updateData });
  console.log("Update response:", response);
  return response;
  }
async function load(recordID) {
  console.log("load() з recordID:", recordID);
  try {
    const response = await fetch('https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json');
    if (!response.ok) throw new Error("Помилка при запиті до НБУ");
    const data = await response.json();
    const usd = data.find(item => item.cc === 'USD');
    if (!usd) throw new Error("Курс доляра не знайдено");
    const nbuRate = parseFloat(usd.rate);
    nbu.textContent = nbuRate.toFixed(2);
  
    const deal = await getDealRecord(recordID);
    const dealRate = parseFloat(deal.CurrencyCourse);
    if (isNaN(dealRate)) throw new Error("Невірний курс угоди");
      deal.textContent = dealRate.toFixed(2);
    const diff = ((dealRate / nbuRate) - 1) * 100;
    difference.textContent = diff.toFixed(2) + '%';

    if (Math.abs(diff) >= 5) {
      updateButton.style.display = 'block';
      updateButton.disabled = false;
    } else {
      updateButton.style.display = 'none';
    }

  } catch (error) {
    console.error("Error load:", error);
    alert("Помилка при завантаженні курсу");
    updateButton.style.display = 'none';
  }
}

updateButton.addEventListener('click', async () => {
  try {
    updateButton.classList.add('update-button-active')
    if (!recordID) throw new Error("ID запису не передано");
    updateButton.disabled = true;
    updateButton.textContent = "Записую...";


    const newRate = parseFloat(nbu.textContent);
    if (isNaN(newRate)) throw new Error("Невірне значення курсу");
    await updateDealRecord(recordID, newRate);

    dealDOM.textContent = newRate.toFixed(2);
    difference.textContent = '0.00%';
    updateButton.style.display = 'none';
    alert("Успішно оновлено!");
    const success = document.getElementById('Success');
    success.style.display = "flex";
    saveHistory(currentDealRate, currentDealDiff);
    
  } catch (error) {
    console.log("Error2: ", error);
    alert("Помилка під час оновлення курсу.");
  } finally {
    updateButton.disabled = false;
    updateButton.textContent = "Записати курс в угоду";
  }
});

 function saveHistory(currentDealRate, currentDealDiff){
   const historyInfo = {
      date: new Date().toLocaleDateString(),
      rate: currentDealRate,
      diff: currentDealDiff
    };
    console.log(historyInfo);

    let info = JSON.parse(localStorage.getItem('info')) || [];
    info.unshift(historyInfo);
    if(info.length > 5){
      info = info.slice(0, 5);
    }

    localStorage.setItem('info', JSON.stringify(info));
    renderHistory();
}
   
function renderHistory(){
      const bodyTable = document.getElementById('table-body');
      bodyTable.innerHTML = '';
      const history = JSON.parse(localStorage.getItem('info')) || [];
      history.forEach(entry => {
        const row = document.createElement('tr');
        const date = document.createElement('td');
        date.textContent = entry.date;
        const rate = document.createElement('td');
        rate.textContent = entry.rate;
        const diff = document.createElement('td');
        diff.textContent = entry.diff;
        row.appendChild(date);
        row.appendChild(rate);
        row.appendChild(diff);
        bodyTable.appendChild(row);
      });
    }
    

const enlan = document.getElementById('en');
enlan.addEventListener('click', () => {
  document.getElementById('nbu-label').textContent = "NBU rate";
  document.getElementById('deal-label').textContent = "Deal rate";
  document.getElementById('diff-label').textContent = "Difference";
  document.getElementById('update-button').textContent = "Record rate in the deal";
  document.getElementById('Success').textContent = "Rate updated!";
  document.getElementById('tooltip-2').textContent = "Ukrainian";
  document.getElementById('tooltip-3').textContent = "History";
  document.getElementById('history-date').textContent = "Date";
  document.getElementById('history-rate').textContent = "Rate";
  document.getElementById('history-diff').textContent = "Difference %";
  document.getElementById('closes').textContent = "Close"

});

const uklan = document.getElementById('uk');
uklan.addEventListener('click', () => {
  document.getElementById('nbu-label').textContent = "Курс НБУ";
  document.getElementById('deal-label').textContent = "Курс в угоді";
  document.getElementById('diff-label').textContent = "Різниця у відсотках";
  document.getElementById('update-button').textContent = "Записати курс в угоду";
  document.getElementById('Success').textContent = "Курс оновлено!";
  document.getElementById('tooltip-2').textContent = "Українська";
  document.getElementById('tooltip-3').textContent = "Історія";
  document.getElementById('history-date').textContent = "Дата";
  document.getElementById('history-rate').textContent = "Курс";
  document.getElementById('history-diff').textContent = "Різниця%";
  document.getElementById('closes').textContent = "Закрити"

});

console.log('ZOHO:', typeof ZOHO);
console.log('ZOHO.embeddedApp:', typeof ZOHO?.embeddedApp);

ZOHO.embeddedApp.init().then(() => {
  console.log("ZOHO.embeddedApp ініціалізовано");

  ZOHO.embeddedApp.getEntity().then(entity => {
    recordID = entity.EntityId[0];
    console.log('RecordID в віджеті:', recordID);
    load(recordID);
  });
});

const hamburgerMenu = document.getElementById('hamburger-menu');
const historySection = document.getElementById('history');
hamburgerMenu.addEventListener('click', () => {
  historySection.classList.toggle('hidden');
  renderHistory();
});


window.addEventListener('DOMContentLoaded', () => {
      renderHistory();
    });
  
const widg = document.getElementById('widget');
const mobileMenu = document.getElementById('hamburger-menu-mobile');
mobileMenu.addEventListener('click', () => {
  widg.style.display = 'none';
  historySection.classList.toggle('hidden');
  renderHistory();
});

const closeHistory = document.getElementById('closes');
closeHistory.addEventListener('click', () => {
  historySection.classList.toggle('hidden');
  widg.style.display = 'flex';
})