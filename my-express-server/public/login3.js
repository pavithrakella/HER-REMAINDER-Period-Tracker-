document.addEventListener('DOMContentLoaded', function() {
    const calendar = document.getElementById('calendar');
    const monthYear = document.getElementById('monthYear');
    const prevMonthButton = document.getElementById('prevMonth');
    const nextMonthButton = document.getElementById('nextMonth');

    let currentDate = new Date();
    let currentYear = currentDate.getFullYear();
    let currentMonth = currentDate.getMonth();
    let selectedYear = currentYear;
    let selectedMonth = currentMonth;

    let periodDate = null;
    let periodDateMonth = null;
    let periodDateYear = null;

    let averageCycleLength = parseInt(localStorage.getItem('averageCycleLength')) || 28;
    let averagePeriodLength = parseInt(localStorage.getItem('averagePeriodLength')) || 5;

    function generateCalendar(year, month) {
        calendar.innerHTML = '';

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay();

        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        monthYear.textContent = `${monthNames[month]} ${year}`;

        const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        for (let i = 0; i < 7; i++) {
            const dayElement = document.createElement('div');
            dayElement.textContent = weekDays[i];
            dayElement.classList.add('day', 'day-name');
            calendar.appendChild(dayElement);
        }

        let dayCounter = 1;
        let daysArray = [];

        for (let i = 0; i < 6; i++) {
            for (let j = 0; j < 7; j++) {
                const dayElement = document.createElement('div');
                if (i === 0 && j < startingDay) {
                    const prevMonthLastDay = new Date(year, month, 0).getDate();
                    const prevMonthDay = prevMonthLastDay - startingDay + j + 1;
                    dayElement.textContent = prevMonthDay;
                    dayElement.classList.add('day', 'prev-month');
                } else if (dayCounter > daysInMonth) {
                    const nextMonthDay = dayCounter - daysInMonth;
                    dayElement.textContent = nextMonthDay;
                    dayElement.classList.add('day', 'next-month');
                    dayCounter++;
                } else {
                    dayElement.textContent = dayCounter;
                    dayElement.classList.add('day', 'current-month');
                    if (year === currentYear && month === currentMonth && dayCounter === currentDate.getDate()) {
                        dayElement.classList.add('current');
                    }
                    if (isHighlighted(year, month, dayCounter)) {
                        dayElement.classList.add('highlighted');
                    }
                    dayElement.addEventListener('click', function() {
                        highlightSelectedDate(year, month, parseInt(this.textContent));
                    });
                    dayCounter++;
                }
                daysArray.push(dayElement);
                calendar.appendChild(dayElement);
            }
        }

        if (periodDate !== null) {
            highlightPredictedPeriod(year, month, daysArray);
        }
    }

    function isHighlighted(year, month, date) {
        if (periodDate === null) return false;

        const startPeriodDate = new Date(periodDateYear, periodDateMonth, periodDate);
        const endPeriodDate = new Date(startPeriodDate);
        endPeriodDate.setDate(endPeriodDate.getDate() + averagePeriodLength - 1);

        const currentDate = new Date(year, month, date);
        return currentDate >= startPeriodDate && currentDate <= endPeriodDate;
    }

    function highlightSelectedDate(year, month, date) {
        periodDate = date;
        periodDateMonth = month;
        periodDateYear = year;

        localStorage.setItem('lastPeriodDate', JSON.stringify({ year: periodDateYear, month: periodDateMonth, date: periodDate }));

        generateCalendar(selectedYear, selectedMonth);
    }

    function highlightPredictedPeriod(year, month, daysArray) {
        const lastPeriod = JSON.parse(localStorage.getItem('lastPeriodDate'));
        if (!lastPeriod) return;

        const lastPeriodDate = new Date(lastPeriod.year, lastPeriod.month, lastPeriod.date);
        let nextPeriodDate = new Date(lastPeriodDate.getTime() + averageCycleLength * 24 * 60 * 60 * 1000);

        while (nextPeriodDate <= new Date(year, month + 1, 0)) {
            let predictedYear = nextPeriodDate.getFullYear();
            let predictedMonth = nextPeriodDate.getMonth();
            let predictedDate = nextPeriodDate.getDate();

            for (let i = 0; i < averagePeriodLength; i++) {
                let periodDayDate = new Date(nextPeriodDate.getTime() + i * 24 * 60 * 60 * 1000);
                let periodDayYear = periodDayDate.getFullYear();
                let periodDayMonth = periodDayDate.getMonth();
                let periodDay = periodDayDate.getDate();

                if (periodDayYear === year && periodDayMonth === month) {
                    const periodDayElement = daysArray.find(day => parseInt(day.textContent) === periodDay && day.classList.contains('current-month'));
                    if (periodDayElement) {
                        periodDayElement.classList.add('predicted-period');
                    }
                } else if (periodDayYear === year && periodDayMonth === month + 1 && month < 11) {
                    const nextMonthDays = document.querySelectorAll('.next-month');
                    nextMonthDays.forEach(day => {
                        if (parseInt(day.textContent) === periodDay) {
                            day.classList.add('predicted-period');
                        }
                    });
                }
            }

            nextPeriodDate.setTime(nextPeriodDate.getTime() + averageCycleLength * 24 * 60 * 60 * 1000);
        }
    }

    generateCalendar(currentYear, currentMonth);

    prevMonthButton.addEventListener('click', function() {
        if (selectedMonth === 0) {
            selectedMonth = 11;
            selectedYear--;
        } else {
            selectedMonth--;
        }
        generateCalendar(selectedYear, selectedMonth);
    });

    nextMonthButton.addEventListener('click', function() {
        if (selectedMonth === 11) {
            selectedMonth = 0;
            selectedYear++;
        } else {
            selectedMonth++;
        }
        generateCalendar(selectedYear, selectedMonth);
    });

    document.getElementById('confirm').addEventListener('click', function(event) {
        event.preventDefault(); 
        if (periodDate !== null) {
            window.location.href = 'main1.html';
        } else {
            alert('Please select the start date of your last period.');
        }
    });

    document.getElementById('notSure').addEventListener('click', function(event) {
        event.preventDefault(); 
        window.location.href = 'main1.html';
    });
});
