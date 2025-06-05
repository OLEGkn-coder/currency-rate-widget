console.log("запустився");

const nbu = document.getElementById('nbu');
const deal = document.getElementById('deal');
const difference = document.getElementById('difference');
const updateButton = document.getElementById('update-button');
console.log({ nbu, deal, difference, updateButton });
updateButton.style.display = 'none';

let recordID;

async function getDealRecord(recordID) {
  console.log("getDealRecord", recordID);
  // Імітуємо затримку і повертаємо фіктивні дані
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: [
          {
            CurrencyCourse: "26.50" 
          }
        ]
      });
    }, 500);
  });
}

// Мок (імітація) оновлення даних угоди (замінює ZOHO.CRM.API.updateRecord)
async function updateDealRecord(recordID, newRate) {
  console.log(`updateDealRecord ${recordID} з новим курсом: ${newRate}`);
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true });
    }, 500);
  });
}

async function load(recordID) {
  console.log("load() з recordID:", recordID);
  try {
    if (!recordID) throw new Error("ID запису не передано");

    const response = await fetch('https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json');
    console.log("response: ", response.status);
    if (!response.ok) throw new Error("Виникла помилка при запиті до НБУ!");

    const data = await response.json();
    console.log("NBU: ", data);

    const usd = data.find(item => item.cc === 'USD');
    if (!usd) throw new Error("Курс доляра не знайдено!");

    const rate = usd.rate;
    nbu.textContent = rate.toFixed(2);

  
    const dealRate = await getDealRecord(recordID);
    if (!dealRate.data || dealRate.data.length === 0) throw new Error("Угоду не знайдено!");

    const dealdata = dealRate.data[0];
    const dealRateValue = parseFloat(dealdata.CurrencyCourse);
    if (isNaN(dealRateValue)) {
      deal.textContent = '0.0';
      difference.textContent = '0.00%';
      updateButton.style.display = 'none';
      return;
    }

    deal.textContent = dealRateValue.toFixed(2);

    const diffPercent = ((dealRateValue / rate) - 1) * 100;
    const diff = diffPercent.toFixed(2);
    difference.textContent = diff + '%';

    if (Math.abs(diff) >= 5) {
      updateButton.style.display = 'block';
      updateButton.disabled = false;
    } else {
      updateButton.style.display = 'none';
    }

  } catch (error) {
    console.log("Error1: ", error);
    alert("Виникла помилка при завантаженні даних.");
    updateButton.style.display = 'none';
  }
}

updateButton.addEventListener('click', async () => {
  try {
    if (!recordID) throw new Error("ID запису не передано");
    updateButton.disabled = true;
    updateButton.textContent = "Записую...";


    const newRate = parseFloat(nbu.textContent);
    if (isNaN(newRate)) throw new Error("Невірне значення курсу");
    await updateDealRecord(recordID, newRate);

    deal.textContent = newRate.toFixed(2);
    difference.textContent = '0.00%';
    updateButton.style.display = 'none';
    alert("Успішно оновлено!");
    const success = document.getElementById('Success');
    success.style.display = "flex";

  } catch (error) {
    console.log("Error2: ", error);
    alert("Помилка під час оновлення курсу.");
  } finally {
    updateButton.disabled = false;
    updateButton.textContent = "Записати курс в угоду";
  }
});

const enlan = document.getElementById('en');
enlan.addEventListener('click', () => {
  document.getElementById('p1').textContent = "NBU rate";
  document.getElementById('p2').textContent = "Deal rate";
  document.getElementById('p3').textContent = "Difference in percent";
  document.getElementById('update-button').textContent = "Record rate in the deal";
  document.getElementById('Success').textContent = "Rate updated!";
});

const uklan = document.getElementById('uk');
uklan.addEventListener('click', () => {
  document.getElementById('p1').textContent = "Курс НБУ";
  document.getElementById('p2').textContent = "Курс в угоді";
  document.getElementById('p3').textContent = "Різниця у відсотках";
  document.getElementById('update-button').textContent = "Записати курс в угоду";
  document.getElementById('Success').textContent = "Курс оновлено!";
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

if (!recordID) {
  recordID = "123456789"; 
  load(recordID);
}
