function getShownQuestions() {
  return JSON.parse(localStorage.getItem("shownQuestions") || "{}");
}

function saveShownQuestions(data) {
  localStorage.setItem("shownQuestions", JSON.stringify(data));
}

let questionData = {};
let shownQuestions = getShownQuestions();

// Load the questions JSON
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
    opt.textContent = course;
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
      opt.textContent = unit;
      unitSelect.appendChild(opt);
    });
  }

  document.getElementById("questionCard").style.display = "none";
  document.getElementById("nextQuestionBtn").style.display = "none";
}

function unescapeMathjax(str) {
  if (!str) return "";
  return str.replace(/\\\\\(/g, '\\(').replace(/\\\\\)/g, '\\)');
}

function displayRandomQuestion() {
  const course = document.getElementById("courseSelect").value;
  const unit = document.getElementById("unitSelect").value;
  const key = `${course}||${unit}`;
  const questions = questionData[course]?.[unit];

  if (!questions || questions.length === 0) {
    hideCardWithMessage("No questions available.");
    return;
  }

  shownQuestions = getShownQuestions();
  const used = shownQuestions[key] || [];

  if (used.length === questions.length) {
    hideCardWithMessage("\ud83c\udf89 No more questions left for this unit.");
    return;
  }

  let index;
  do {
    index = Math.floor(Math.random() * questions.length);
  } while (used.includes(index));

  used.push(index);
  shownQuestions[key] = used;
  saveShownQuestions(shownQuestions);

  const q = questions[index];
  const questionDisplay = document.getElementById("questionDisplay");
  questionDisplay.innerHTML = unescapeMathjax(q.question);

  const existingImg = document.getElementById("questionImage");
  if (existingImg) existingImg.remove();

  if (q.image) {
    const img = document.createElement("img");
    img.id = "questionImage";
    img.src = q.image;
    img.style.maxWidth = "80%";
    img.style.margin = "20px auto";
    img.style.display = "block";
    img.alt = "Question image";
    questionDisplay.appendChild(img);
  }

  document.getElementById("answerDisplay").innerHTML = unescapeMathjax(q.answer);
  document.getElementById("answerDisplay").style.display = "none";
  document.getElementById("questionCard").style.display = "block";
  document.getElementById("nextQuestionBtn").style.display = "inline-block";

  MathJax.typesetPromise();
}

function toggleAnswer() {
  const answer = document.getElementById("answerDisplay");
  answer.style.display = answer.style.display === "none" ? "block" : "none";
  MathJax.typesetPromise();
}

function hideCardWithMessage(message) {
  document.getElementById("questionCard").style.display = "block";
  document.getElementById("questionDisplay").innerHTML = `<p>${message}</p>`;
  document.getElementById("answerDisplay").style.display = "none";
  document.getElementById("nextQuestionBtn").style.display = "none";
}

function resetShownQuestions() {
  localStorage.removeItem("shownQuestions");
  shownQuestions = {};
  alert("Question history reset.");
}
