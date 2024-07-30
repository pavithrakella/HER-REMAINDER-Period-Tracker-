document.addEventListener('DOMContentLoaded', function() {
  const calendarContainer = document.getElementById('mainCalendar');
  const calendarHeader = document.createElement('div');
  calendarHeader.className = 'calendar-header';

  const prevMonthButton = document.createElement('button');
  prevMonthButton.id = 'prevMonth';
  prevMonthButton.textContent = 'Previous Month';
  calendarHeader.appendChild(prevMonthButton);

  const monthYear = document.createElement('span');
  monthYear.id = 'monthYear';
  calendarHeader.appendChild(monthYear);

  const nextMonthButton = document.createElement('button');
  nextMonthButton.id = 'nextMonth';
  nextMonthButton.textContent = 'Next Month';
  calendarHeader.appendChild(nextMonthButton);

  calendarContainer.appendChild(calendarHeader);

  const calendarGrid = document.createElement('div');
  calendarGrid.id = 'calendar';
  calendarGrid.className = 'calendar';
  calendarContainer.appendChild(calendarGrid);

  const circleText = document.querySelector('.circle-text');

  let currentYear = new Date().getFullYear();
  let currentMonth = new Date().getMonth();
  let selectedYear = currentYear;
  let selectedMonth = currentMonth;

  let averageCycleLength = parseInt(localStorage.getItem('averageCycleLength')) || 28;
  let averagePeriodLength = parseInt(localStorage.getItem('averagePeriodLength')) || 5;

  const lastPeriod = JSON.parse(localStorage.getItem('lastPeriodDate'));
  let periodDate = lastPeriod ? new Date(lastPeriod.year, lastPeriod.month, lastPeriod.date) : null;

  function updateCircleText() {
    if (periodDate) {
      const currentDate = new Date();
      let daysToNextPeriod = -1;
  
      let nextPeriodDate = new Date(periodDate);
      while (nextPeriodDate <= currentDate) {
        nextPeriodDate.setDate(nextPeriodDate.getDate() + averageCycleLength);
      }
  
      daysToNextPeriod = Math.ceil((nextPeriodDate - currentDate) / (1000 * 60 * 60 * 24));
  
      const startPeriodDate = new Date(nextPeriodDate);
      startPeriodDate.setDate(startPeriodDate.getDate() - averageCycleLength);
      const endPeriodDate = new Date(startPeriodDate);
      endPeriodDate.setDate(endPeriodDate.getDate() + averagePeriodLength - 1);
  
      if (currentDate >= startPeriodDate && currentDate <= endPeriodDate) {
        let periodDay = Math.floor((currentDate - startPeriodDate) / (1000 * 60 * 60 * 24)) + 1;
        if (periodDay < 1) {
          periodDay = 1;
        } else if (periodDay > averagePeriodLength) {
          periodDay = averagePeriodLength;
        }
        circleText.textContent = `Day ${periodDay} of your period`;
      } else if (daysToNextPeriod === 1) {
        circleText.textContent = "Tomorrow is the day!";
      } else if (daysToNextPeriod === 0) {
        circleText.textContent = "Today is the first day of your period!";
      } else {
        circleText.textContent = `${daysToNextPeriod} days to next period`;
      }
    } else {
      circleText.textContent = 'No period data';
    }
  }
  
  function generateCalendar(year, month) {
    calendarGrid.innerHTML = '';

    const firstDay = new Date(year, month).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    dayNames.forEach(dayName => {
      const dayNameDiv = document.createElement('div');
      dayNameDiv.className = 'day-name';
      dayNameDiv.textContent = dayName;
      calendarGrid.appendChild(dayNameDiv);
    });

    for (let i = 0; i < firstDay; i++) {
      const emptyDiv = document.createElement('div');
      emptyDiv.className = 'day prev-month';
      calendarGrid.appendChild(emptyDiv);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dayDiv = document.createElement('div');
      dayDiv.className = 'day';
      dayDiv.textContent = day;

      if (periodDate && isPeriodDay(year, month, day)) {
        dayDiv.classList.add('highlighted');
      }

      calendarGrid.appendChild(dayDiv);
    }

    monthYear.textContent = `${new Date(year, month).toLocaleString('default', { month: 'long' })} ${year}`;
  }

  function isPeriodDay(year, month, day) {
    if (!periodDate) {
      return false;
    }

    const currentDate = new Date(year, month, day);
    let tempPeriodDate = new Date(periodDate);

    while (tempPeriodDate <= currentDate) {
      tempPeriodDate.setDate(tempPeriodDate.getDate() + averageCycleLength);
    }

    while (tempPeriodDate > currentDate) {
      tempPeriodDate.setDate(tempPeriodDate.getDate() - averageCycleLength);
    }

    const endPeriodDate = new Date(tempPeriodDate);
    endPeriodDate.setDate(endPeriodDate.getDate() + averagePeriodLength - 1);

    return currentDate >= tempPeriodDate && currentDate <= endPeriodDate;
  }

  prevMonthButton.addEventListener('click', () => {
    if (selectedMonth === 0) {
      selectedMonth = 11;
      selectedYear--;
    } else {
      selectedMonth--;
    }
    generateCalendar(selectedYear, selectedMonth);
  });

  nextMonthButton.addEventListener('click', () => {
    if (selectedMonth === 11) {
      selectedMonth = 0;
      selectedYear++;
    } else {
      selectedMonth++;
    }
    generateCalendar(selectedYear, selectedMonth);
  });

  generateCalendar(currentYear, currentMonth);
  updateCircleText();

  function calculateNextPeriodDates() {
    let nextPeriodDates = [];
    if (!periodDate) {
      return nextPeriodDates;
    }
    let tempPeriodDate = new Date(periodDate);

    for (let i = 0; i < 12; i++) {
      for (let j = 0; j < averagePeriodLength; j++) {
        let periodDay = new Date(tempPeriodDate);
        periodDay.setDate(periodDay.getDate() + j);
        nextPeriodDates.push(periodDay.toISOString());
      }
      tempPeriodDate.setDate(tempPeriodDate.getDate() + averageCycleLength);
    }
    return nextPeriodDates;
  }

  function sendPeriodDatesToServer(periodDates, cycleLength) {
    fetch('/send-notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ periodDates: periodDates, cycleLength: cycleLength })
    })
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error('Error sending period dates:', error));
  }

  const periodDates = calculateNextPeriodDates();
  console.log(periodDates);
  sendPeriodDatesToServer(periodDates, averageCycleLength);
});
function toggleHighlight(element) {
  element.classList.toggle('selected');
}

