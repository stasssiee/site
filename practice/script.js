let questionData = {};

fetch('questions.json')
  .then(response => response.json())
  .then(data => {
    questionData = data;
    populateCourses();
  });

function populateCourses() {
  const courseSelect = document.getElementById("courseSelect");
  Object.keys(questionData).forEach(course => {
    const opt = document.createElement("option");
    opt.value = course;
    opt.textContent = course.charAt(0).toUpperCase() + course.slice(1);
    courseSelect.appendChild(opt);
  });
}

function updateUnits() {
    const course = document.getElementById("courseSelect").value;
    const unitSelect = document.getElementById("unitSelect");
    unitSelect.innerHTML = "<option value=''>-- Select Unit --</option>";
  
    if (questionData[course]) {
      Object.keys(questionData[course]).forEach(unit => {
        const opt = document.createElement("option");
        opt.value = unit;
        opt.textContent = unit.charAt(0).toUpperCase() + unit.slice(1);
        unitSelect.appendChild(opt);
      });
    }
  
    document.getElementById("questionCard").style.display = "none";
    document.getElementById("nextQuestionBtn").style.display = "none";
  }

  function displayRandomQuestion() {
    const course = document.getElementById("courseSelect").value;
    const unit = document.getElementById("unitSelect").value;
    const questions = questionData[course]?.[unit];
  
    if (questions && questions.length > 0) {
      const randomIndex = Math.floor(Math.random() * questions.length);
      const q = questions[randomIndex];
  
      document.getElementById("questionDisplay").innerHTML = q.question;
      document.getElementById("answerDisplay").innerHTML = q.answer;
      document.getElementById("answerDisplay").style.display = "none";
      document.getElementById("questionCard").style.display = "block";
      
      document.getElementById("nextQuestionBtn").style.display = "inline-block";
  
      MathJax.typesetPromise();
    } else {
      document.getElementById("questionCard").style.display = "none";
      document.getElementById("nextQuestionBtn").style.display = "none";
    }
  }

function toggleAnswer() {
  const answer = document.getElementById("answerDisplay");
  answer.style.display = answer.style.display === "none" ? "block" : "none";
  MathJax.typesetPromise();
}