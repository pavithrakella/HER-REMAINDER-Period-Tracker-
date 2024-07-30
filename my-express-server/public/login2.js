document.addEventListener('DOMContentLoaded', function() {
  const options = document.querySelectorAll('.option');
  options.forEach(option => {
      option.addEventListener('click', function(event) {
          event.preventDefault(); // Prevent default action
          options.forEach(opt => opt.classList.remove('selected'));
          this.classList.add('selected');
      });
  });

  document.getElementById('notSure').addEventListener('click', function(event) {
      event.preventDefault(); // Prevent default action
      options.forEach(opt => opt.classList.remove('selected'));
  });

  document.getElementById('confirm').addEventListener('click', function(event) {
      event.preventDefault(); // Prevent default action
      const selectedOption = document.querySelector('.option.selected');
      if (selectedOption) {
          // Store the selected option in local storage
          localStorage.setItem('averagePeriodLength', selectedOption.textContent);
          // Redirect to the next page
          window.location.href = 'login3.html';
      } else {
          alert('No option selected. Please select an option.');
      }
  });
  document.getElementById('notSure').addEventListener('click', function(event) {
    event.preventDefault(); // Prevent default action
    
        window.location.href = 'login3.html';
  
});
});
